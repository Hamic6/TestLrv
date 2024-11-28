import React, { createContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Chemin relatif mis à jour

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: true,
            user,
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
    dispatch({
      type: SIGN_IN,
      payload: { user },
    });
    navigate("/dashboard");
  };

  const signOutUser = async () => {
    await signOut(auth);
    dispatch({ type: SIGN_OUT });
    navigate("/");
  };

  const signUp = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    dispatch({
      type: SIGN_UP,
      payload: { user },
    });
    navigate("/dashboard");
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
