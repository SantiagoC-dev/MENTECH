import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserSessionPersistence, getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/** Identificadores públicos de la app web MENTECH (no son credenciales de servicio).
 * Para utilizar otro proyecto, sobreescribe estos valores con VITE_FIREBASE_*.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAQW9A679JMMYEZL2prXpYTLEFDEKXOeTw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mentech-escolar.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mentech-escolar',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mentech-escolar.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '309953913843',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:309953913843:web:f08e69df89077942606886',
};

export const app = getApps().length ? getApp() : initializeApp(config);
// PERSISTENCIA POR PESTAÑA: cada pestaña puede tener un usuario distinto
// y su sesión permanece tras F5. No sincroniza un usuario entre pestañas.
// Eliminar persistencia local de Firebase NO elimina datos de Firestore.
export const auth = (() => {
  try {
    return initializeAuth(app, { persistence: browserSessionPersistence });
  } catch (error) {
    // Evita un error al recargar el módulo mediante HMR en Vite.
    if (typeof error === 'object' && error !== null && 'code' in error
      && error.code === 'auth/already-initialized') return getAuth(app);
    throw error;
  }
})();
export const db = getFirestore(app);
export const firebaseProjectId = config.projectId;
