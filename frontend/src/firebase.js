// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPYmTrRgaUYIj8aESZamth6tcgvRWvIZ8",
  authDomain: "bloom-1bbbc.firebaseapp.com",
  databaseURL: "https://bloom-1bbbc-default-rtdb.firebaseio.com",
  projectId: "bloom-1bbbc",
  storageBucket: "bloom-1bbbc.firebasestorage.app",
  messagingSenderId: "951386780702",
  appId: "1:951386780702:web:7f5c9e2478aa5849566a0f",
  measurementId: "G-QFKEP7KTR6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
