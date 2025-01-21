import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import {
  Card as MuiCard,
  CardContent as MuiCardContent,
  Divider as MuiDivider,
  Paper as MuiPaper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Button,
} from '@mui/material';
import { spacing } from '@mui/system';

const Card = styled(MuiCard)(spacing);
const CardContent = styled(MuiCardContent)(spacing);
const Divider = styled(MuiDivider)(spacing);
const Paper = styled(MuiPaper)(spacing);

const roles = ['admin', 'manager', 'employee'];

const allPages = [
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
  const [userPages, setUserPages] = useState(allPages.map(page => page.href)); // Pré-cocher toutes les cases
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newUserPages, setNewUserPages] = useState(allPages.map(page => page.href)); // Pré-cocher toutes les cases

  const handleCreateUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: 'User' });
      const pages = allPages.map(page => page.href);
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        role: role,
        pages: pages,
        sidebar: pages,  // Ajout du champ sidebar avec toutes les pages
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
      await updateDoc(userRef, { role: newRole, pages: newUserPages, sidebar: newUserPages }); // Met à jour le champ sidebar
      alert('Rôle mis à jour avec succès!');
      fetchUsers(); // Mettre à jour la liste des utilisateurs
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageSelection = async (e) => {
    const value = e.target.value;
    const newSelection = [...userPages];
    if (newSelection.includes(value)) {
      const index = newSelection.indexOf(value);
      newSelection.splice(index, 1);
    } else {
      newSelection.push(value);
    }
    setUserPages(newSelection);

    // Mettre à jour Firestore en temps réel
    if (selectedUser) {
      const userRef = doc(db, 'users', selectedUser);
      await updateDoc(userRef, { pages: newSelection, sidebar: newSelection });
    }
  };

  const handleNewPageSelection = async (e) => {
    const value = e.target.value;
    const newSelection = [...newUserPages];
    if (newSelection.includes(value)) {
      const index = newSelection.indexOf(value);
      newSelection.splice(index, 1);
    } else {
      newSelection.push(value);
    }
    setNewUserPages(newSelection);

    // Mettre à jour Firestore en temps réel
    if (selectedUser) {
      const userRef = doc(db, 'users', selectedUser);
      await updateDoc(userRef, { pages: newSelection, sidebar: newSelection });
    }
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
    <Card mb={6}>
      <CardContent pb={1}>
        <Typography variant="h6" gutterBottom>
          Attribuer Rôles
        </Typography>
        <Typography variant="body2" gutterBottom>
          Sélectionnez un utilisateur et mettez à jour son rôle et ses pages autorisées.
        </Typography>
      </CardContent>
      <Paper>
        <FormControl fullWidth>
          <InputLabel>Utilisateur</InputLabel>
          <Select value={selectedUser} onChange={handleUserSelection}>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>{user.email}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Rôle</InputLabel>
          <Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            {roles.map((role) => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Pages Autorisées</InputLabel>
          <Select
            multiple
            value={newUserPages}
            onChange={handleNewPageSelection}
            renderValue={(selected) => selected.join(', ')}
          >
            {allPages.map((page) => (
              <MenuItem key={page.href} value={page.href}>
                <Checkbox checked={newUserPages.includes(page.href)} />
                <ListItemText primary={page.title} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleUpdateRole}>
          Mettre à jour le Rôle
        </Button>
      </Paper>
    </Card>
  );
};

export default AttribuerRoles;
