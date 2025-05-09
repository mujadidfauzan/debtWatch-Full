// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtUpbjXfxX8VohySmOJrlXchoI9_ooH0w",
  authDomain: "debtwatch-638f6.firebaseapp.com",
  projectId: "debtwatch-638f6",
  storageBucket: "debtwatch-638f6.firebasestorage.app", // Reverted to user-provided value
  messagingSenderId: "610325077257",
  appId: "1:610325077257:web:527970fa46e54c42f7c7d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app); 