import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB2RcWEQafUHN60Z36pRrqI3ZLtlT8TJmA",
  authDomain: "collabup-cfa21.firebaseapp.com",
  projectId: "collabup-cfa21",
  storageBucket: "collabup-cfa21.firebasestorage.app",
  messagingSenderId: "525752167739",
  appId: "1:525752167739:web:e7d2f101b5db821e6b5b1e",
  measurementId: "G-01R1R7BPDS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
