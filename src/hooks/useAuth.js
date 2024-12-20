// src/hooks/useAuth.js

import { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import firebaseApp from '../firebaseConfig'; // Assurez-vous que le chemin est correct
import UserContext from '@/contexts/UserContext'; // Import du UserContext par défaut

const useAuth = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth(firebaseApp);
  const { setUser: setContextUser } = useContext(UserContext); // Utilisation du UserContext

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setContextUser({ email: currentUser.email });
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        setUser(null);
        setContextUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, [auth, setContextUser]);

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    signOut(auth);
  };

  return { user, signIn, logout };
};

export default useAuth;
