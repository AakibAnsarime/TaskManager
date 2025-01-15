import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOD8lx2cUSEY9ltLAtLz6SNAmyQbQpCrY",
  authDomain: "taskmanager-ae05a.firebaseapp.com",
  projectId: "taskmanager-ae05a",
  storageBucket: "taskmanager-ae05a.firebasestorage.app",
  messagingSenderId: "572522130284",
  appId: "1:572522130284:web:a1ee974c497a06ab702149",
  measurementId: "G-12DRH1XTW6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };