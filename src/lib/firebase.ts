// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCdVaCjTa5eWXEpMudgAPxwt6L3fApx5M4",
  authDomain: "travel-d2172.firebaseapp.com",
  projectId: "travel-d2172",
  storageBucket: "travel-d2172.firebasestorage.app",
  messagingSenderId: "658175787024",
  appId: "1:658175787024:web:df4a8a511a2ff5f7f24a95",
  measurementId: "G-7HHXZW0R66"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics (supported in client browser environment)
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics errors in environments without measurement support
  });
}
export const getAppAnalytics = () => analyticsInstance;

// Firebase Authentication only (Do NOT use Firestore or Storage yet)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore and Storage are explicitly disabled per configuration (Auth only)
export const db = null as any;
export const storage = null as any;

export default app;

