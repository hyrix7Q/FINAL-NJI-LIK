import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB1vs_71LsuFNsf30r6kpoHcIww1lOyDDg",
  authDomain: "testpush-659ce.firebaseapp.com",
  projectId: "testpush-659ce",
  storageBucket: "testpush-659ce.appspot.com",
  messagingSenderId: "675953883746",
  appId: "1:675953883746:web:b9ff8f8ed16e1e41b3ef3b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage();
