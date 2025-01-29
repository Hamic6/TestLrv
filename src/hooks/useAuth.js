import { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import firebaseApp, { db } from '../firebaseConfig'; // Assurez-vous que le chemin est correct
import UserContext from '@/contexts/UserContext';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const auth = getAuth(firebaseApp);
  const { setUser: setContextUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsInitialized(true);
      if (currentUser) {
        setUser(currentUser);
        setContextUser({ email: currentUser.email });
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        // Le délai d'expiration de chaque session
        const expirationTime = 9 * 60 * 60 * 1000; // 9 heures
        const timer = setTimeout(() => {
          signOut(auth);
          navigate('/sign-in');
        }, expirationTime);
        
        return () => clearTimeout(timer);
      } else {
        setUser(null);
        setContextUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, [auth, setContextUser, navigate]);
  const signUp = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      roles: [],
    });
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = () => {
    signOut(auth);
  };

  return { user, isInitialized, signUp, signIn, resetPassword, logout };
};

export default useAuth;
