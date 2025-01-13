import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig'; // Chemin d'importation corrigé

const AttribuerRoles = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);

  const handleCreateUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: 'User' });
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        role: role,
      });

      alert('Utilisateur créé avec succès!');
      fetchUsers(); // Mettre à jour la liste des utilisateurs
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map((doc) => doc.data());
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Attribuer Rôles</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
      />
      <input
        type="text"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="Rôle"
      />
      <button onClick={handleCreateUser}>Créer utilisateur</button>

      <h3>Liste des utilisateurs</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.email} - Rôle : {user.role}</li>
        ))}
      </ul>
    </div>
  );
};

export default AttribuerRoles;
