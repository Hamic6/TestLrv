import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Modal,
  Box,
  TextField,
  Snackbar,
  Alert,
  CardActions,
  Avatar // Import Avatar pour afficher le logo du client
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsList);
      } catch (error) {
        console.error("Erreur lors de la récupération des clients :", error);
      }
    };

    fetchClients();
  }, []);

  const handleOpenModal = (client) => {
    setCurrentClient(client);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setCurrentClient(null);
    setOpenModal(false);
  };

  const handleSaveClient = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const clientData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address')
    };

    try {
      if (currentClient) {
        await updateDoc(doc(db, "clients", currentClient.id), clientData);
      } else {
        await addDoc(collection(db, "clients"), clientData);
      }

      setOpenModal(false);

      const querySnapshot = await getDocs(collection(db, "clients"));
      const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientsList);

      setSnackbarMessage('Le client a été enregistré avec succès.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du client :", error);
    }
  };

  const handleDeleteClient = async (id) => {
    await deleteDoc(doc(db, "clients", id));
    setClients(clients.filter(client => client.id !== id));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Gestion des Clients
      </Typography>
      <TextField
        label="Rechercher un client"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={() => handleOpenModal(null)} style={{ marginBottom: 20 }}>
        Ajouter un Client
      </Button>
      <Grid container spacing={3}>
        {filteredClients.map((client) => (
          <Grid item xs={12} sm={6} md={4} key={client.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  {client.logoUrl && <Avatar src={client.logoUrl} alt="logo" style={{ width: '60px', height: '60px', marginRight: '10px' }} />}
                  <Box>
                    <Typography variant="h5" component="div">
                      <Link to={`/facturation/clients/${client.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {client.name}
                      </Link>
                    </Typography>
                    <Typography color="textSecondary">
                      {client.email}
                    </Typography>
                    <Typography color="textSecondary">
                      {client.phone}
                    </Typography>
                    <Typography variant="body2">
                      {client.address}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton aria-label="edit" onClick={() => handleOpenModal(client)}>
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => handleDeleteClient(client.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Card style={{ padding: 20 }}>
            <Typography id="modal-title" variant="h6" component="h2">
              {currentClient ? 'Modifier le Client' : 'Ajouter un Client'}
            </Typography>
            <form onSubmit={handleSaveClient}>
              <TextField
                label="Nom"
                name="name"
                defaultValue={currentClient ? currentClient.name : ''}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Email"
                name="email"
                defaultValue={currentClient ? currentClient.email : ''}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Téléphone"
                name="phone"
                defaultValue={currentClient ? currentClient.phone : ''}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Adresse"
                name="address"
                defaultValue={currentClient ? currentClient.address : ''}
                fullWidth
                margin="normal"
              />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button type="submit" variant="contained" color="primary">
                  Enregistrer
                </Button>
                <Button variant="contained" color="secondary" onClick={handleCloseModal}>
                  Annuler
                </Button>
              </Box>
            </form>
          </Card>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ClientList;
