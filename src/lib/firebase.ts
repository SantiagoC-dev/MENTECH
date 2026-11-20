import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseProjectId = config.projectId;
