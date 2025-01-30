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

// Ajout des nouveaux rôles ici
const roles = [
  'admin', 
  'manager', 
  'facturation', 
  'devis', 
  'avis-de-passage', 
  'gestion-de-stock', 
  'gestion-des-utilisateurs',
  'liste-des-factures',  // Nouveau rôle pour liste des factures
  'creer-facture',  // Nouveau rôle pour créer des factures
  'gestion-des-clients'    // Nouveau rôle pour gestion des clients
];

const AttribuerRoles = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rolesSelected, setRolesSelected] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newRolesSelected, setNewRolesSelected] = useState([]);

  const handleCreateUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: 'User' });
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        roles: rolesSelected,
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
      await updateDoc(userRef, { roles: newRolesSelected });
      alert('Rôle mis à jour avec succès!');
      fetchUsers(); // Mettre à jour la liste des utilisateurs
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelection = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    const user = users.find((user) => user.id === userId);
    if (user) {
      setNewRolesSelected(user.roles || []); // Ajouter une vérification pour user.roles
    }
  };

  return (
    <Card mb={6}>
      <CardContent pb={1}>
        <Typography variant="h6" gutterBottom>
          Attribuer Rôles
        </Typography>
        <Typography variant="body2" gutterBottom>
          Sélectionnez un utilisateur et mettez à jour son rôle.
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
          <InputLabel>Rôles</InputLabel>
          <Select
            multiple
            value={newRolesSelected}
            onChange={(e) => setNewRolesSelected(e.target.value)}
            renderValue={(selected) => selected.join(', ')}
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                <Checkbox checked={newRolesSelected.includes(role)} />
                <ListItemText primary={role} />
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
