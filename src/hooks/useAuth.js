// src/hooks/useAuth.js

import { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import firebaseApp from '../firebaseConfig';
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
        
        // Set session expiration timer
        const expirationTime = 9 * 60 * 60 * 1000; // 9 hours
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

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    signOut(auth);
  };

  return { user, isInitialized, signIn, logout };
};

export default useAuth;
