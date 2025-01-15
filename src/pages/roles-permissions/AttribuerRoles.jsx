import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const roles = ['admin', 'manager', 'employee'];

const pages = [
  { href: '/dashboard', title: 'Dashboard' },
  { href: '/dashboard/default', title: 'Default' },
  { href: '/dashboard/analytics', title: 'Analytics' },
  { href: '/dashboard/saas', title: 'SaaS' },
  { href: '/tableau-de-bord', title: 'Tableau de Bord' },
  { href: '/tableau-de-bord/apercu', title: 'Aperçu' },
  { href: '/rapports', title: 'Rapports de Facturation' },
  { href: '/facturation/liste-des-factures', title: 'Liste des Factures' },
  { href: '/facturation/creer-facture', title: 'Créer une Facture' },
  { href: '/facturation/gestion-des-clients', title: 'Gestion des Clients' },
  { href: '/facturation/creer-devis', title: 'Créer un Devis' },
  { href: '/facturation/envoyer-devis', title: 'Envoyer un Devis' },
  { href: '/avis-de-passage/creer-avis-passage', title: 'Créer un Avis de Passage' },
  { href: '/avis-de-passage/envoyer-avis-passage', title: 'Envoyer un Avis de Passage' },
  { href: '/avis-de-passage/rechercher-avis-passage', title: 'Rechercher un Avis de Passage' },
  { href: '/stock/items', title: 'Liste des Articles' },
  { href: '/stock/item/:id', title: 'Détails de l\'Article' },
  { href: '/stock/add', title: 'Ajouter un Article' },
  { href: '/stock/edit/:id', title: 'Modifier un Article' },
  { href: '/stock/reports', title: 'Rapports de Stock' },
  { href: '/stock/validation', title: 'Validation de Stock' },
  { href: '/validation/pending', title: 'En Attente' },
  { href: '/validation/approved', title: 'Approuvées' },
  { href: '/validation/rejected', title: 'Rejetées' },
  { href: '/validation/logs', title: 'Historique de Validation' },
  { href: '/roles-permissions/roles', title: 'Rôles' },
  { href: '/roles-permissions/permissions', title: 'Permissions' },
  { href: '/roles-permissions/assign', title: 'Attribuer des Rôles' },
  { href: '/profile', title: 'Profil' },
];

const AttribuerRoles = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [userPages, setUserPages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newUserPages, setNewUserPages] = useState([]);

  const handleCreateUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: 'User' });
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        role: role,
        pages: userPages,
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
      const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  const handleUpdateRole = async () => {
    try {
      const userRef = doc(db, 'users', selectedUser);
      await updateDoc(userRef, { role: newRole, pages: newUserPages });
      alert('Rôle mis à jour avec succès!');
      fetchUsers(); // Mettre à jour la liste des utilisateurs
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const handlePageSelection = (e) => {
    const value = e.target.value;
    const newSelection = [...userPages];
    if (newSelection.includes(value)) {
      const index = newSelection.indexOf(value);
      newSelection.splice(index, 1);
    } else {
      newSelection.push(value);
    }
    setUserPages(newSelection);
  };

  const handleNewPageSelection = (e) => {
    const value = e.target.value;
    const newSelection = [...newUserPages];
    if (newSelection.includes(value)) {
      const index = newSelection.indexOf(value);
      newSelection.splice(index, 1);
    } else {
      newSelection.push(value);
    }
    setNewUserPages(newSelection);
  };

  const handleUserSelection = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    const user = users.find((user) => user.id === userId);
    if (user) {
      setNewRole(user.role);
      setNewUserPages(user.pages || []); // Ajouter une vérification pour user.pages
    }
  };

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
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="" disabled>Sélectionnez un rôle</option>
        {roles.map((role) => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>

      <div>
        <h3>Sélectionner les Pages pour le Rôle</h3>
        {pages.map((page) => (
          <div key={page.href}>
            <input
              type="checkbox"
              value={page.href}
              checked={userPages.includes(page.href)}
              onChange={handlePageSelection}
            />
            <label>{page.title}</label>
          </div>
        ))}
      </div>
      
      <button onClick={handleCreateUser}>Créer utilisateur</button>

      <h3>Mettre à jour les Rôles des Utilisateurs Existants</h3>
      <select value={selectedUser} onChange={handleUserSelection}>
        <option value="" disabled>Sélectionnez un utilisateur</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>{user.email}</option>
        ))}
      </select>
      <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
        <option value="" disabled>Sélectionnez un rôle</option>
        {roles.map((role) => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>

      <div>
        <h3>Sélectionner les Pages pour le Rôle</h3>
        {pages.map((page) => (
          <div key={page.href}>
            <input
              type="checkbox"
              value={page.href}
              checked={newUserPages.includes(page.href)}
              onChange={handleNewPageSelection}
            />
            <label>{page.title}</label>
          </div>
        ))}
      </div>

      <button onClick={handleUpdateRole}>Mettre à jour le Rôle</button>

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
