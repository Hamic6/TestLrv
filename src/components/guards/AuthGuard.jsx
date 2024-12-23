// src/components/guards/AuthGuard.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

function AuthGuard({ children }) {
  const { user, isInitialized } = useAuth();

  if (isInitialized && !user) {
    return <Navigate to="/sign-in" replace />;
  }

  return <React.Fragment>{children}</React.Fragment>;
}

export default AuthGuard;
