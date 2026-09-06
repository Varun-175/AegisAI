import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

// Configuration for project geminivault-varun1
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBzsKUEa-vh20sxHTXqgtvxV_i4n6fhaeI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'geminivault-varun1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'geminivault-varun1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'geminivault-varun1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '738311159541',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:738311159541:web:632d205825158a3929cfbc',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PW90RT4LXX',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };
