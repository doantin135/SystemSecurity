
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9Q3NFiFvwfkYxdFQgGn7krpae2Usrk-A",
  authDomain: "login-cde1c.firebaseapp.com",
  projectId: "login-cde1c",
  storageBucket: "login-cde1c.firebasestorage.app",
  messagingSenderId: "217566408039",
  appId: "1:217566408039:web:8db9c9eccf27afa82b93c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export const db=getFirestore(app);
export default app;