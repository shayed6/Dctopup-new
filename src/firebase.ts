import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDK2OA1wfM_wdVKPfRLjv6EXVHreJND7-k",
  authDomain: "dc-top-up-5aad0.firebaseapp.com",
  projectId: "dc-top-up-5aad0",
  storageBucket: "dc-top-up-5aad0.firebasestorage.app",
  messagingSenderId: "884995746257",
  appId: "1:884995746257:web:8bd9241d308ed72c6ad8f0"
};

// Initialize Firebase (singleton pattern)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
