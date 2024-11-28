// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import the authentication module
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getStorage } from "firebase/storage"; // Import Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBP67T5X7UCy6YHlX9OC2qkl7NS61jMpFU",
  authDomain: "testlrv.firebaseapp.com",
  projectId: "testlrv",
  storageBucket: "testlrv.appspot.com", // Correction de storageBucket
  messagingSenderId: "457274723447",
  appId: "1:457274723447:web:213bbb2a4f149c455dca72",
  measurementId: "G-RVF5PSR53P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize the authentication module
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Storage

export default app; // Export app by default
export { auth, analytics, db, storage }; // Export auth, analytics, db, and storage explicitly
