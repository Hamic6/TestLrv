import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
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
  Snackbar,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Chip,
  TextField,
  TablePagination,
  Box, // <-- Ajouté ici
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Tooltip from '@mui/material/Tooltip';
import { spacing } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // en haut du fichier


const Card = styled(MuiCard)(spacing);
const CardContent = styled(MuiCardContent)(spacing);
const Divider = styled(MuiDivider)(spacing);
const Paper = styled(MuiPaper)(spacing);

const roles = [
  'admin',
  'manager',
  'facturation',
  'proforma',
  'avis-de-passage',
  'gestion-de-stock',
  'validation-stock', // <-- Ajouté ici
  'gestion-des-utilisateurs',
  'liste-des-factures',
  'creer-facture',
  'gestion-des-clients',
];

const roleIcons = {
  admin: <AdminPanelSettingsIcon fontSize="small" />,
  manager: <SupervisorAccountIcon fontSize="small" />,
  facturation: <ReceiptIcon fontSize="small" />,
  "validation-stock": <VerifiedUserIcon fontSize="small" />, // <-- Corrigé ici
  // Ajoute d'autres rôles/icônes si besoin
};

const roleColors = {
  admin: 'error',
  manager: 'info',
  facturation: 'success',
  "validation-stock": 'warning', // <-- Corrigé ici
  // Ajoute d'autres couleurs si besoin
};

const AttribuerRoles = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [newRolesSelected, setNewRolesSelected] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUserId, setMenuUserId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter((user) =>
      user.displayName.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUpdateRole = async () => {
    try {
      const userRef = doc(db, 'users', selectedUser);
      await updateDoc(userRef, { roles: newRolesSelected });
      setSnackbarMessage('Rôle mis à jour avec succès!');
      setSnackbarOpen(true);
      fetchUsers();
      setDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (userToDelete) {
        const userRef = doc(db, 'users', userToDelete);
        await deleteDoc(userRef);
        setSnackbarMessage('Utilisateur désactivé avec succès!');
        setSnackbarOpen(true);
        fetchUsers();
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Grid container spacing={3}>
      {/* Barre de recherche */}
      <Grid item xs={12}>
        <TextField
          label="Rechercher un utilisateur"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
        />
      </Grid>

      {/* Section pour afficher les utilisateurs */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Liste des utilisateurs
            </Typography>
            <Divider my={2} />
            <TableContainer component={Paper}>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell>Photo</TableCell>
                    <TableCell>{isMobile ? 'Utilisateur' : 'Email'}</TableCell>
                    <TableCell>Rôles</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Avatar
                            src={user.photoURL}
                            alt={user.displayName}
                            sx={{
                              width: isMobile ? 40 : 60,
                              height: isMobile ? 40 : 60,
                              mx: isMobile ? 'auto' : 0
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight="bold">
                            {user.displayName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" noWrap>
                            {user.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {user.roles && user.roles.map((role) => (
                              <Chip
                                key={role}
                                icon={roleIcons[role] || null}
                                label={role}
                                color={roleColors[role] || 'default'}
                                size={isMobile ? 'small' : 'medium'}
                                variant="outlined"
                                sx={{
                                  mb: 0.5,
                                  borderRadius: 2,
                                  fontWeight: 500,
                                  textTransform: 'capitalize',
                                  transition: 'background 0.2s, box-shadow 0.2s',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: (theme) =>
                                      theme.palette[roleColors[role] || 'primary'].light,
                                    boxShadow: 2,
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {isMobile ? (
                            <>
                              <IconButton
                                aria-label="actions"
                                onClick={(e) => handleMenuOpen(e, user.id)}
                                size="small"
                              >
                                <MoreVertIcon />
                              </IconButton>
                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && menuUserId === user.id}
                                onClose={handleMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                              >
                                <MenuItem
                                  onClick={() => {
                                    setSelectedUser(user.id);
                                    setNewRolesSelected(user.roles);
                                    setDialogOpen(true);
                                    handleMenuClose();
                                  }}
                                >
                                  <ManageAccountsIcon fontSize="small" sx={{ mr: 1 }} />
                                  Modifier les rôles
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setUserToDelete(user.id);
                                    setDeleteDialogOpen(true);
                                    handleMenuClose();
                                  }}
                                >
                                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                  Désactiver l'utilisateur
                                </MenuItem>
                              </Menu>
                            </>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Modifier les rôles" arrow>
                                <IconButton
                                  color="primary"
                                  onClick={() => {
                                    setSelectedUser(user.id);
                                    setNewRolesSelected(user.roles);
                                    setDialogOpen(true);
                                  }}
                                  size={isMobile ? 'small' : 'medium'}
                                  sx={{
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                    transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
                                    '&:hover': {
                                      backgroundColor: 'primary.main',
                                      color: '#fff',
                                      boxShadow: 3,
                                      transform: 'scale(1.12)',
                                    },
                                  }}
                                >
                                  <ManageAccountsIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Désactiver l'utilisateur" arrow>
                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    setUserToDelete(user.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  size={isMobile ? 'small' : 'medium'}
                                  sx={{
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(244, 67, 54, 0.08)',
                                    transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
                                    '&:hover': {
                                      backgroundColor: 'error.main',
                                      color: '#fff',
                                      boxShadow: 3,
                                      transform: 'scale(1.12)',
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Dialog pour mettre à jour les rôles */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Mettre à jour les rôles</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sélectionnez les nouveaux rôles pour cet utilisateur.
          </DialogContentText>
          <FormControl fullWidth margin="normal">
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleUpdateRole} color="primary">
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour confirmer la suppression */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirmer la désactivation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir désactiver cet utilisateur ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleDeleteUser} color="primary">
            Désactiver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour afficher les messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default AttribuerRoles;
