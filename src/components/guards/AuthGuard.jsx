import React from "react";
import { Navigate } from "react-router-dom";

import useAuth from "@/hooks/useAuth";

// La route est accessible uniquement pour les utilisateur authentifiés
function AuthGuard({ children }) {
  const { user, isInitialized } = useAuth();

  if (isInitialized && !user) {
    return <Navigate to="/sign-in" />;
  }

  return <React.Fragment>{children}</React.Fragment>;
}

export default AuthGuard;
