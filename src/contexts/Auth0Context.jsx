import React, { createContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // Chemin relatif mis à jour

const INITIALIZE = "INITIALIZE";
const SIGN_IN = "SIGN_IN";
const SIGN_OUT = "SIGN_OUT";
const SIGN_UP = "SIGN_UP";
const RESET_PASSWORD = "RESET_PASSWORD";

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const AuthReducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE:
      return {
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
      };
    case SIGN_IN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case SIGN_OUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case SIGN_UP:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case RESET_PASSWORD:
      return {
        ...state,
      };
    default:
      return state;
  }
};

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(AuthReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: true,
            user: { ...user, roles: userData ? userData.roles : [] },
          },
        });
      } else {
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();
    dispatch({
      type: SIGN_IN,
      payload: { user: { ...user, roles: userData ? userData.roles : [] } },
    });
    navigate("/acceuil"); // Redirection vers Acceuil après connexion
  };

  const signOutUser = async () => {
    await signOut(auth);
    dispatch({ type: SIGN_OUT });
    navigate("/");
  };

  const signUp = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      email: user.email,
      roles: [],
    });
    dispatch({
      type: SIGN_UP,
      payload: { user: { ...user, roles: [] } },
    });
    navigate("/acceuil"); // Redirection vers Acceuil après inscription
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
    dispatch({
      type: RESET_PASSWORD,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "firebase",
        signIn,
        signOut: signOutUser,
        signUp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
