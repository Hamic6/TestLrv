import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // Chemin mis à jour

const useSyncUsers = () => {
  const auth = getAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncUserWithFirestore = async (user) => {
    try {
      const docRef = collection(db, "users");
      await addDoc(docRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "User",
        photoURL: user.photoURL || "",
      });
    } catch (error) {
      console.error("Erreur lors de la synchronisation de l'utilisateur avec Firestore: ", error);
    }
  };

  const createUser = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await syncUserWithFirestore(user);
      return user;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur: ", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userDocs = await getDocs(usersCollection);
        const usersList = userDocs.docs.map(doc => doc.data());
        setUsers(usersList);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, createUser };
};

export default useSyncUsers;
