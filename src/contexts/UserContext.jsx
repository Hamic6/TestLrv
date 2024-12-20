// src/contexts/UserContext.jsx

import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(); // Crée le contexte utilisateur

export const useUser = () => {
  return useContext(UserContext); // Utilise le contexte utilisateur
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email) => {
    setUser({ email });
  };

  return (
    <UserContext.Provider value={{ user, login, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; // Exporter UserContext par défaut
