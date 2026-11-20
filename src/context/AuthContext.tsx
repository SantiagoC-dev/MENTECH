import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { endSession, formatFirebaseError, startFirebaseSession, watchOwnSession } from '../lib/repository';
import type { Profile, Role, Specialist } from '../types';

interface AuthValue {
  user: Profile|null;
  loading:boolean;
  error:string|null;
  sessionId:string|null;
  hasFirebaseUser:boolean;
  login:(email:string,password:string,remember:boolean)=>Promise<void>;
  register:(name:string,email:string,password:string,role:'patient'|'professional')=>Promise<void>;
  logout:()=>Promise<void>;
  requestReset:(email:string)=>Promise<void>;
}
const AuthContext=createContext<AuthValue|null>(null);
export const homeFor=(role:Role)=>role==='patient'?'/paciente':role==='professional'?'/profesional':'/admin';

export function userError(e:unknown) {
  const raw=formatFirebaseError(e);
  if(raw.includes('auth/email-already-in-use'))return 'Este correo ya está registrado.';
  if(raw.includes('auth/invalid-email'))return 'El correo electrónico no es válido.';
  if(raw.includes('auth/invalid-credential')||raw.includes('auth/wrong-password')||raw.includes('auth/user-not-found'))return 'Correo o contraseña incorrectos.';
  if(raw.includes('auth/weak-password'))return 'Usa una contraseña de al menos 8 caracteres.';
  if(raw.includes('auth/too-many-requests'))return 'Demasiados intentos. Intenta de nuevo más tarde.';
  if(raw.includes('auth/network-request-failed'))return 'No se pudo conectar a Firebase. Revisa tu conexión.';
  if(raw.includes('auth/unauthorized-domain'))return 'Este dominio no está autorizado en Firebase Authentication.';
  return raw;
}

// Cada pestaña/navegador conserva su propia identidad de sesión para el
// seguimiento en Firestore. Las credenciales siguen siendo de Firebase Auth.
const keyFor=(uid:string)=>`mentech_firebase_session_${uid}`;
export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<Profile|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [sessionId,setSessionId]=useState<string|null>(null);
  const [hasFirebaseUser,setHasFirebaseUser]=useState(false);
  const registrationInProgress=useRef(false);

  const logout=useCallback(async()=>{
    const current=auth.currentUser;
    if(current){
      const key=keyFor(current.uid);const id=sessionStorage.getItem(key);
      sessionStorage.removeItem(key);
      if(id)try{await endSession(id);}catch{ /* Firebase Auth aún cerrará sesión */ }
    }
    await signOut(auth);
    setUser(null);setSessionId(null);setError(null);
  },[]);

  useEffect(()=>{
    let stopProfile:(()=>void)|undefined;
    let alive=true;
    // Firebase avisa inmediatamente de inicio/cierre; el documento del usuario
    // se observa en tiempo real, incluyendo cambios de rol en Firebase Console.
    const stopAuth=onAuthStateChanged(auth,fb=>{
      stopProfile?.();stopProfile=undefined;
      setUser(null);setSessionId(null);setHasFirebaseUser(Boolean(fb));
      setError(null);
      if(!fb){setLoading(false);return;}
      setLoading(true);
      let sessionInit=false;
      stopProfile=onSnapshot(doc(db,'users',fb.uid),snapshot=>{
        if(!alive||auth.currentUser?.uid!==fb.uid)return;
        if(!snapshot.exists()){
          if(registrationInProgress.current){setLoading(true);return;}
          setUser(null);
          setError('Esta cuenta aún no tiene perfil en Firestore. Si acabas de registrarte, espera a que termine el registro.');
          setLoading(false);
          return;
        }
        const next={...snapshot.data(),id:fb.uid} as Profile;
        if(!['patient','professional','admin'].includes(next.role)){
          setUser(null);setError('El rol de esta cuenta no es válido. Revisa el documento users en Firestore.');setLoading(false);return;
        }
        setUser(next);setError(null);setLoading(false);
        if(sessionInit)return;
        sessionInit=true;
        const key=keyFor(fb.uid);
        const storedId=sessionStorage.getItem(key);
        const id=storedId||crypto.randomUUID();
        sessionStorage.setItem(key,id);
        // La primera conexión CREA el documento directamente. Intentar leerlo
        // antes de crearlo era rechazado por las reglas de Firestore.
        void startFirebaseSession(id,fb.uid,!storedId).then(()=>{
          if(alive&&auth.currentUser?.uid===fb.uid)setSessionId(id);
        }).catch(e=>{
          if(!alive || auth.currentUser?.uid!==fb.uid)return;
          // Registrar la actividad de un navegador es una operación auxiliar.
          // Si Firestore rechaza `sessions`, no se debe cerrar una
          // autenticación válida ni devolver al usuario silenciosamente a /login.
          sessionStorage.removeItem(key);
          setSessionId(null);
          const detail=userError(e);
          console.error('[MENTECH] No fue posible registrar la sesión en Firestore:', e);
          setError(`Iniciaste sesión correctamente, pero no se pudo registrar este dispositivo. Revisa las reglas de la colección "sessions" en Firebase. Detalle: ${detail}`);
        });
      },e=>{if(alive){setError(userError(e));setLoading(false);setUser(null);}});
    },e=>{if(alive){setError(userError(e));setUser(null);setLoading(false);}});
    return()=>{alive=false;stopProfile?.();stopAuth();};
  },[]);

  useEffect(()=>{
    if(!sessionId||!user)return;
    const uid=user.id;
    return watchOwnSession(sessionId,()=>{
      sessionStorage.removeItem(keyFor(uid));
      void signOut(auth);
    },message=>setError(message));
  },[sessionId,user?.id]);

  const login=async(email:string,password:string,remember:boolean)=>{
    setError(null);
    try{
      await setPersistence(auth,remember?browserLocalPersistence:browserSessionPersistence);
      await signInWithEmailAndPassword(auth,email.trim().toLowerCase(),password);
      // onAuthStateChanged y onSnapshot actualizan el estado y redirigen sin reload.
    }catch(e){throw new Error(userError(e));}
  };
  const register=async(name:string,email:string,password:string,role:'patient'|'professional')=>{
    const fullName=name.trim();
    if(fullName.length<3)throw new Error('Escribe nombre y apellido (al menos 3 caracteres).');
    if(password.length<8)throw new Error('La contraseña debe tener al menos 8 caracteres.');
    registrationInProgress.current=true;
    try{
      await setPersistence(auth,browserSessionPersistence);
      const credential=await createUserWithEmailAndPassword(auth,email.trim().toLowerCase(),password);
      const account=credential.user;
      await updateProfile(account,{displayName:fullName});
      const profile:Profile={id:account.uid,name:fullName,email:account.email||email.trim().toLowerCase(),role,createdAt:new Date().toISOString()};
      await setDoc(doc(db,'users',account.uid),profile);
      if(role==='professional'){
        const pro:Specialist={id:profile.id,ownerId:profile.id,name:profile.name,
          specialty:'Ansiedad y estrés',bio:'Completa tu presentación y especialidad en el panel profesional.',
          fee:0,years:0,verified:false,featured:false,
          initials:fullName.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase(),color:'lavender'};
        await setDoc(doc(db,'professionals',pro.id),pro);
      }
      // El observador del perfil abre el panel cuando Firestore confirme la escritura.
      registrationInProgress.current=false;
    }catch(e){registrationInProgress.current=false;setLoading(false);throw new Error(userError(e));}
  };
  const requestReset=async(email:string)=>{
    try{await sendPasswordResetEmail(auth,email.trim().toLowerCase());}
    catch(e){throw new Error(userError(e));}
  };
  return <AuthContext.Provider value={{user,loading,error,sessionId,hasFirebaseUser,login,register,logout,requestReset}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider no está configurado.');return value;}
