import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBUgtHoF5kVUHGaNa0-hSoiNbwnIyFM61I",
  authDomain: "retuarant-app.firebaseapp.com",
  projectId: "retuarant-app",
  storageBucket: "retuarant-app.firebasestorage.app",
  messagingSenderId: "718889787695",
  appId: "1:718889787695:web:fdbba547c80510cd4701da",
  measurementId: "G-BNR6HST0FR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { signInAnonymously };