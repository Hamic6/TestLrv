import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

// Pour les routes accessibles uniquement aux utilisateurs non authentifiés
function GuestGuard({ children }) {
  const { isInitialized } = useAuth();

  // Attendre l'initialisation avant de rendre les enfants
  if (!isInitialized) {
    return null; // ou vous pouvez afficher un loader ici
  }

  // Rendre les enfants (children) quel que soit l'état d'authentification
  return <React.Fragment>{children}</React.Fragment>;
}

export default GuestGuard;
