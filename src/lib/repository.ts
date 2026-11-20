import { addDoc, collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Appointment, Profile, SessionRecord, Specialist, Status } from '../types';

const readableError = (e:unknown) => e instanceof Error ? e.message : String(e);
type OnError = (message:string)=>void;

export function watchProfessionals(callback:(items:Specialist[])=>void,onError:OnError,viewer?:Pick<Profile,'role'|'id'>):()=>void {
  const ref=collection(db,'professionals');
  // La consulta pública sólo incluye profesionales aprobados. La consulta del
  // profesional sólo lee su propio documento. Admin consulta todos.
  const target=viewer?.role==='admin' ? ref : viewer?.role==='professional'
    ? query(ref,where('ownerId','==',viewer.id)) : query(ref,where('verified','==',true));
  return onSnapshot(target,s=>callback(s.docs.map(d=>({...d.data(),id:d.id} as Specialist))),e=>onError(e.message));
}
export async function saveProfessional(profile:Specialist) {
  await updateDoc(doc(db,'professionals',profile.id), {
    name:profile.name, specialty:profile.specialty, bio:profile.bio,
    fee:profile.fee,years:profile.years,
  });
}
export async function verifyProfessional(id:string,verified:boolean) {
  await updateDoc(doc(db,'professionals',id),{verified});
}
export async function bookAppointment(patient:Profile,pro:Specialist,topic:string,date:string,time:string) {
  if(patient.role!=='patient')throw new Error('Solo los pacientes pueden solicitar citas.');
  if(!pro.verified || !pro.ownerId)throw new Error('Este especialista aún no está disponible.');
  if(!date||!time||!topic.trim())throw new Error('Completa el motivo, fecha y horario.');
  const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  if(date<today)throw new Error('Selecciona una fecha actual o futura.');
  const currentTime=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  if(date===today && time<=currentTime)throw new Error('Para hoy, elige un horario posterior a la hora actual.');
  const fresh=await getDoc(doc(db,'professionals',pro.id));
  if(!fresh.exists()||fresh.data().verified!==true)throw new Error('El perfil no está disponible.');
  const current=fresh.data();
  const data:Omit<Appointment,'id'>={patientId:patient.id,patientName:patient.name,
    professionalId:pro.ownerId,professionalName:String(current.name),topic:topic.trim(),
    date,time,fee:Number(current.fee),status:'pendiente',createdAt:new Date().toISOString()};
  await addDoc(collection(db,'appointments'),data);
}
export async function changeAppointmentStatus(a:Appointment,status:Status,user:Profile) {
  if(user.role==='patient'&&(a.patientId!==user.id||status!=='cancelada'))throw new Error('Solo puedes cancelar tus propias citas.');
  if(user.role==='professional'&&a.professionalId!==user.id)throw new Error('Esta cita no te corresponde.');
  if(status===a.status) return;
  const valid = a.status==='pendiente'&&['confirmada','cancelada'].includes(status)
    || a.status==='confirmada'&&['completada','cancelada'].includes(status);
  if(!valid)throw new Error('Ese cambio de estado no está permitido.');
  await updateDoc(doc(db,'appointments',a.id),{status});
}
export function watchAppointments(user:Profile,callback:(items:Appointment[])=>void,onError:OnError):()=>void {
  const ref=collection(db,'appointments');
  const target=user.role==='admin'?ref:query(ref,where(user.role==='patient'?'patientId':'professionalId','==',user.id));
  return onSnapshot(target,s=>callback(s.docs.map(d=>({...d.data(),id:d.id} as Appointment)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))),e=>onError(e.message));
}
export function watchUsers(callback:(users:Profile[])=>void,onError:OnError):()=>void {
  return onSnapshot(collection(db,'users'),s=>callback(s.docs.map(d=>({...d.data(),id:d.id} as Profile))),e=>onError(e.message));
}
export function watchSessions(userId:string,callback:(items:SessionRecord[])=>void,onError:OnError):()=>void {
  return onSnapshot(query(collection(db,'sessions'),where('userId','==',userId)),s=>callback(s.docs.map(d=>({...d.data(),id:d.id} as SessionRecord)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))),e=>onError(e.message));
}
export function watchOwnSession(id:string,onRevoked:()=>void,onError?:(message:string)=>void):()=>void {
  return onSnapshot(doc(db,'sessions',id),s=>{if(s.exists()&&s.data().revoked===true)onRevoked();},e=>onError?.(e.message));
}
// React.StrictMode puede montar el observador de autenticación dos veces en
// desarrollo: compartimos la misma operación por ID para evitar carreras.
const pendingSessionStarts=new Map<string,Promise<void>>();
export function startFirebaseSession(id:string,userId:string,isNew:boolean):Promise<void> {
  const pending=pendingSessionStarts.get(id);
  if(pending)return pending;
  const task=(async()=>{
    const ref=doc(db,'sessions',id);
    if(isNew){
      // No hacer getDoc() sobre una sesión inexistente: la regla de lectura
      // comprueba resource.data.userId y rechaza un documento vacío.
      const now=new Date().toISOString();
      await setDoc(ref,{
        userId,
        device:/Mobile|Android|iPhone/i.test(navigator.userAgent)?'Navegador móvil':'Navegador de escritorio',
        createdAt:now,lastSeen:now,active:true,revoked:false,
      });
      return;
    }
    // La sesión se registró previamente en esta pestaña. Ahora sí existe
    // y puede comprobarse la propiedad y el estado de revocación.
    const existing=await getDoc(ref);
    if(!existing.exists()||existing.data().userId!==userId||existing.data().revoked===true)
      throw new Error('Esta sesión ya no está disponible. Cierra sesión e ingresa nuevamente.');
    await updateDoc(ref,{lastSeen:new Date().toISOString()});
  })();
  pendingSessionStarts.set(id,task);
  void task.finally(()=>{if(pendingSessionStarts.get(id)===task)pendingSessionStarts.delete(id);}).catch(()=>{});
  return task;
}
export async function endSession(id:string) {
  await updateDoc(doc(db,'sessions',id),{active:false,revoked:true,lastSeen:new Date().toISOString()});
}

export function formatFirebaseError(e:unknown) {
  const error=readableError(e);
  if(error.includes('permission-denied'))return 'Firestore denegó la operación. Publica el archivo firestore.rules incluido en esta versión.';
  if(error.includes('unavailable'))return 'No se pudo conectar a Firestore. Comprueba tu conexión a internet.';
  return error;
}
