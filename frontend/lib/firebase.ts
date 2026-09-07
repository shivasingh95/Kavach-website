// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBkMWUEdve2WnsSF1uzj3SyGfzEt-w1Ffc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kavach-web-b42a9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kavach-web-b42a9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kavach-web-b42a9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1078801709052",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1078801709052:web:3e1cb79648670cb4b92479"
};

// Initialize Firebase (Singleton pattern to prevent re-initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth exports
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Opens the Google sign-in popup and returns the Firebase ID token.
 * The ID token is then sent to the backend for verification and user creation/login.
 */
export const signInWithGoogle = async (): Promise<string> => {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return idToken;
};

export { app, auth };
