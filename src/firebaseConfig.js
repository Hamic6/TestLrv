import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBP67T5X7UCy6YHlX9OC2qkl7NS61jMpFU",
  authDomain: "testlrv.firebaseapp.com",
  projectId: "testlrv",
  storageBucket: "testlrv.firebasestorage.app", // Modification du bucket ici
  messagingSenderId: "457274723447",
  appId: "1:457274723447:web:213bbb2a4f149c455dca72",
  measurementId: "G-RVF5PSR53P",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default app;
export { auth, analytics, db, storage };
