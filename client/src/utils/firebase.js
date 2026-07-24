// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY || "AIzaSyDPcPhgUqq2DmtKlUqcFe9u6qa7UpTyweo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "interview-d8140.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "interview-d8140",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "interview-d8140.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "682310926343",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:682310926343:web:d97ac2e832d4c76a7b6aa2"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };