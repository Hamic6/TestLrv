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
  Box,
  Button,
  TablePagination
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import AvisDePassagePDF from './AvisDePassagePDF';
import FiltersAvisDePassage from './FiltersAvisDePassage';

const SearchAvisDePassage = () => {
  const [avis, setAvis] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    setSnackbarMessage('Avis de passage supprimé avec succès');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleApplyFilters = (filters) => {
    setFilters(filters);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredAvis = avis.filter(avis =>
    (!search || avis.billTo?.company?.toLowerCase().includes(search.toLowerCase())) &&
    (!filters.currency || avis.avisInfo?.currency.toLowerCase().includes(filters.currency.toLowerCase())) &&
    (!filters.month || avis.avisInfo?.date?.split('-')[1] === filters.month) &&
    (!filters.year || avis.avisInfo?.date?.split('-')[0] === filters.year) &&
    (!filters.number || avis.avisInfo?.number.includes(filters.number))
  );

  const paginatedAvis = filteredAvis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      <Box display="flex" alignItems="center" mb={2}>
        <FiltersAvisDePassage onApplyFilters={handleApplyFilters} />
      </Box>
      <Grid container spacing={3}>
        {paginatedAvis.map((avis) => (
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
                <PDFDownloadLink document={<AvisDePassagePDF avis={avis} />} fileName={`avis_de_passage_${avis.avisInfo?.number}.pdf`}>
                  {({ loading }) => (
                    <Button variant="contained" color="primary" disabled={loading}>
                      {loading ? 'Chargement...' : 'Télécharger PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TablePagination
        component="div"
        count={filteredAvis.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />

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
