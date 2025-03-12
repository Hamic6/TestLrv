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
  TablePagination,
  MenuItem
} from '@mui/material';
import { Delete as DeleteIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DevisPDF from './DevisPDF';

const SearchDevis = () => {
  const [devis, setDevis] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ currency: '', month: '', year: '', number: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "devis"));
        const devisList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Devis récupérés:", devisList);
        setDevis(devisList);
      } catch (error) {
        console.error("Erreur lors de la récupération des devis :", error);
      }
    };

    fetchDevis();
  }, []);

  const handleDeleteDevis = async (id) => {
    await deleteDoc(doc(db, "devis", id));
    setDevis(devis.filter(devis => devis.id !== id));
    setSnackbarMessage('Le devis a été supprimé avec succès !');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleApplyFilters = () => {
    // Les filtres sont déjà appliqués en temps réel via setFilters
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredDevis = devis.filter(devis =>
    (!search || devis.billTo?.company?.toLowerCase().includes(search.toLowerCase())) &&
    (!filters.currency || devis.invoiceInfo?.currency.toLowerCase().includes(filters.currency.toLowerCase())) &&
    (!filters.month || devis.invoiceInfo?.date?.split('-')[1] === filters.month) &&
    (!filters.year || devis.invoiceInfo?.date?.split('-')[0] === filters.year) &&
    (!filters.number || devis.invoiceInfo?.number.includes(filters.number))
  );

  const paginatedDevis = filteredDevis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Recherche des Devis
      </Typography>
      <TextField
        label="Rechercher un client"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Devise"
            variant="outlined"
            fullWidth
            value={filters.currency}
            onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            select
            label="Mois"
            variant="outlined"
            fullWidth
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          >
            <MenuItem value="01">Janvier</MenuItem>
            <MenuItem value="02">Février</MenuItem>
            <MenuItem value="03">Mars</MenuItem>
            <MenuItem value="04">Avril</MenuItem>
            <MenuItem value="05">Mai</MenuItem>
            <MenuItem value="06">Juin</MenuItem>
            <MenuItem value="07">Juillet</MenuItem>
            <MenuItem value="08">Août</MenuItem>
            <MenuItem value="09">Septembre</MenuItem>
            <MenuItem value="10">Octobre</MenuItem>
            <MenuItem value="11">Novembre</MenuItem>
            <MenuItem value="12">Décembre</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Année"
            type="number"
            variant="outlined"
            fullWidth
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Numéro de Devis"
            variant="outlined"
            fullWidth
            value={filters.number}
            onChange={(e) => setFilters({ ...filters, number: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleApplyFilters}>
            Appliquer les Filtres
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {paginatedDevis.map((devis) => (
          <Grid item xs={12} sm={6} md={4} key={devis.id}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column">
                  <Typography variant="h5" component="div">
                    <Link to={`/devis/${devis.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {devis.billTo?.company}
                    </Link>
                  </Typography>
                  <Typography color="textSecondary">
                    Date : {devis.invoiceInfo?.date}
                  </Typography>
                  <Typography color="textSecondary">
                    Téléphone : {devis.billTo?.phone}
                  </Typography>
                  <Typography variant="body2">
                    Adresse : {devis.billTo?.address}
                  </Typography>
                  <Typography variant="body2">
                    Numéro de Devis : {devis.invoiceInfo?.number}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="h6">Services</Typography>
                    {devis.services?.map((service, index) => (
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
                <IconButton aria-label="delete" onClick={() => handleDeleteDevis(devis.id)}>
                  <DeleteIcon />
                </IconButton>
                <PDFDownloadLink document={<DevisPDF devis={devis} />} fileName={`devis_${devis.invoiceInfo?.number}.pdf`}>
                  {({ loading }) => (
                    <Button variant="contained" color="primary" startIcon={<PdfIcon />}>
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
        count={filteredDevis.length}
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

export default SearchDevis;
