import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  CardActions,
  Box
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import FiltersAvisDePassage from './FiltersAvisDePassage';

const SearchAvisDePassage = () => {
  const [avis, setAvis] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "avisDePassage"));
        const avisList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Avis de Passage récupérés:", avisList);
        setAvis(avisList);
      } catch (error) {
        console.error("Erreur lors de la récupération des avis de passage :", error);
      }
    };

    fetchAvis();
  }, []);

  const handleDeleteAvis = async (id) => {
    await deleteDoc(doc(db, "avisDePassage", id));
    setAvis(avis.filter(avis => avis.id !== id));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleApplyFilters = (filters) => {
    setFilters(filters);
  };

  const filteredAvis = avis.filter(avis =>
    (!search || avis.billTo?.company?.toLowerCase().includes(search.toLowerCase())) &&
    (!filters.currency || avis.avisInfo?.currency.toLowerCase().includes(filters.currency.toLowerCase())) &&
    (!filters.date || avis.avisInfo?.date === filters.date) &&
    (!filters.startTime || avis.avisInfo?.startTime === filters.startTime) &&
    (!filters.endTime || avis.avisInfo?.endTime === filters.endTime) &&
    (!filters.number || avis.avisInfo?.number.includes(filters.number))
  );

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Recherche des Avis de Passage
      </Typography>
      <TextField
        label="Rechercher un client"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <FiltersAvisDePassage onApplyFilters={handleApplyFilters} />
      <Grid container spacing={3}>
        {filteredAvis.map((avis) => (
          <Grid item xs={12} sm={6} md={4} key={avis.id}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column">
                  <Typography variant="h5" component="div">
                    <Link to={`/avis-de-passage/${avis.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {avis.billTo?.company}
                    </Link>
                  </Typography>
                  <Typography color="textSecondary">
                    Date : {avis.avisInfo?.date}
                  </Typography>
                  <Typography color="textSecondary">
                    Téléphone : {avis.billTo?.phone}
                  </Typography>
                  <Typography variant="body2">
                    Adresse : {avis.billTo?.address}
                  </Typography>
                  <Typography variant="body2">
                    Numéro d'Avis : {avis.avisInfo?.number}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="h6">Services</Typography>
                    {avis.services?.map((service, index) => (
                      <Box key={index} mt={1}>
                        <Typography variant="body2">
                          <strong>Libellé :</strong> {service.libelle}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Description :</strong> {service.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton aria-label="delete" onClick={() => handleDeleteAvis(avis.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

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

export default SearchAvisDePassage;
