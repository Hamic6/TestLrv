import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  Chip,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const roles = [
  'admin',
  'manager',
  'facturation',
  'proforma',
  'avis-de-passage',
  'gestion-de-stock',
  'validation-stock',
  'gestion-des-utilisateurs',
  'liste-des-factures',
  'creer-facture',
  'gestion-des-clients',
];

export default function AttribuerRoles() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formRoles, setFormRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (user) => {
    setSelectedUser(user);
    setFormRoles(user.roles || []);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleSave = async () => {
    if (selectedUser) {
      await updateDoc(doc(db, 'users', selectedUser.id), { roles: formRoles });
      setSnackbarMessage('Rôles mis à jour avec succès !');
      setSnackbarOpen(true);
      setOpen(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1100, mx: 'auto', minHeight: '80vh', bgcolor: theme.palette.background.default }}>
      <Typography variant="h4" sx={{ fontWeight: 700, textAlign: { xs: 'center', md: 'left' }, mb: 2, color: isDark ? '#fff' : '#111' }}>
        Attribution des rôles
      </Typography>
      <Paper elevation={3} sx={{ p: { xs: 1, md: 2 }, borderRadius: 3, boxShadow: 2, bgcolor: isDark ? '#111' : '#fff', color: isDark ? '#fff' : '#111', mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={2} mb={2}>
          <TextField
            label="Rechercher un utilisateur"
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
        </Stack>
        <Grid container spacing={2}>
          {filteredUsers.map(user => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  boxShadow: 1,
                  bgcolor: isDark ? '#181818' : '#fafafa',
                  color: isDark ? '#fff' : '#111',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': { transform: 'scale(1.03)', boxShadow: 4 },
                }}
              >
                <Avatar src={user.photoURL} sx={{ width: 64, height: 64, mb: 1, bgcolor: isDark ? '#222' : '#eee', color: isDark ? '#fff' : '#111' }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {user.displayName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5, color: isDark ? '#bbb' : '#555' }}>
                  {user.email}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                  {(user.roles || []).map(role => (
                    <Chip key={role} label={role} size="small" sx={{ mr: 0.5, mb: 0.5, fontWeight: 500, textTransform: 'capitalize' }} />
                  ))}
                </Stack>
                <IconButton
                  aria-label="actions"
                  onClick={e => handleMenuOpen(e, user)}
                  sx={{ position: 'absolute', top: 8, right: 8, color: isDark ? '#fff' : '#111' }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { handleOpen(selectedUser); handleMenuClose(); }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Modifier les rôles
          </MenuItem>
        </Menu>
      </Paper>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Modifier les rôles</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Rôles</InputLabel>
            <Select
              multiple
              value={formRoles}
              onChange={e => setFormRoles(e.target.value)}
              renderValue={selected => selected.join(', ')}
            >
              {roles.map(role => (
                <MenuItem key={role} value={role}>
                  <Checkbox checked={formRoles.includes(role)} />
                  <ListItemText primary={role} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Annuler</Button>
          <Button onClick={handleSave} variant="contained" sx={{ fontWeight: 700, borderRadius: 2 }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
