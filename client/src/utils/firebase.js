// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interview-d8140.firebaseapp.com",
  projectId: "interview-d8140",
  storageBucket: "interview-d8140.firebasestorage.app",
  messagingSenderId: "682310926343",
  appId: "1:682310926343:web:d97ac2e832d4c76a7b6aa2"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };