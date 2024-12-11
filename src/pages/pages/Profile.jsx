// pages/Profile.jsx
import React from "react";
import useAuth from "@/hooks/useAuth";

function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Profil de l'utilisateur</h1>
      <p>Nom : {user?.displayName || "Non fourni"}</p>
      <p>Email : {user?.email}</p>
      {user?.photoURL && <img src={user.photoURL} alt="Photo de profil" />}
    </div>
  );
}

export default Profile;
