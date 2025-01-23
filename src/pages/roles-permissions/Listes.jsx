import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {
  Avatar,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Divider as MuiDivider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Alert as MuiAlert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { spacing } from '@mui/system';

const Card = styled(MuiCard)(spacing);
const CardContent = styled(MuiCardContent)(spacing);
const Divider = styled(MuiDivider)(spacing);
const Alert = styled(MuiAlert)(spacing);

const Listes = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setAlert({ type: 'success', message: "Profil de l'utilisateur supprimé avec succès !" });
      setOpenDialog(false);
      setUserToDelete(null);
    } catch (error) {
      setAlert({ type: 'error', message: "Erreur lors de la suppression de l'utilisateur." });
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDialog(false);
    setUserToDelete(null);
  };

  return (
    <Card mb={6}>
      <CardContent pb={1}>
        <Typography variant="h6" gutterBottom>
          Liste des Utilisateurs
        </Typography>
      </CardContent>
      <Divider />
      {alert && (
        <Alert mt={2} mb={2} severity={alert.type}>
          {alert.message}
        </Alert>
      )}
      <List>
        {users.map((user) => (
          <ListItem key={user.id} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(user)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemAvatar>
              <Avatar alt={user.displayName} src={user.photoURL} />
            </ListItemAvatar>
            <ListItemText
              primary={user.displayName}
              secondary={`Email: ${user.email} | Rôle: ${user.role}`}
            />
          </ListItem>
        ))}
      </List>
      <Dialog open={openDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Supprimer l'utilisateur</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le profil de cet utilisateur ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="error">
            Annuler
          </Button>
          <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default Listes;
