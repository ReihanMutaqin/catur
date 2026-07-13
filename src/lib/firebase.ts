import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyBk0_2g2WaS-H9XxhraokOYzzYTVPAxjLs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "catur-bae.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? "https://catur-bae-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "catur-bae",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "catur-bae.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "236380923197",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:236380923197:web:6f8c59991086a2ae2d9154",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
