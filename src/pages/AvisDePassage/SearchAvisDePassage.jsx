import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Typography, Paper, IconButton, Box, TextField, Snackbar, Alert, TableContainer, TablePagination, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { Delete as DeleteIcon, PreviewOutlined as PreviewOutlinedIcon, PictureAsPdfOutlined as PictureAsPdfOutlinedIcon } from '@mui/icons-material';
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
  const [sortOrder, setSortOrder] = useState("desc");
  const [openPdf, setOpenPdf] = useState(false);
  const [selectedAvis, setSelectedAvis] = useState(null);

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "avisDePassage"));
        const avisList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  const handleOpenPdf = (avis) => {
    setSelectedAvis(avis);
    setOpenPdf(true);
  };

  const handleClosePdf = () => {
    setOpenPdf(false);
    setSelectedAvis(null);
  };

  const filteredAvis = avis.filter(avis =>
    (!search || avis.billTo?.company?.toLowerCase().includes(search.toLowerCase())) &&
    (!filters.currency || avis.avisInfo?.currency?.toLowerCase().includes(filters.currency.toLowerCase())) &&
    (!filters.month || avis.avisInfo?.date?.split('-')[1] === filters.month) &&
    (!filters.year || avis.avisInfo?.date?.split('-')[0] === filters.year) &&
    (!filters.number || avis.avisInfo?.number?.includes(filters.number))
  );

  const sortedAvis = [...filteredAvis].sort((a, b) => {
    const numA = a.avisInfo?.number || "";
    const numB = b.avisInfo?.number || "";
    if (sortOrder === "asc") return numA.localeCompare(numB, undefined, { numeric: true });
    return numB.localeCompare(numA, undefined, { numeric: true });
  });

  const paginatedAvis = sortedAvis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
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
      <TableContainer sx={{ maxWidth: "100vw", overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sortDirection={sortOrder}
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                style={{ cursor: "pointer", fontWeight: "bold" }}
              >
                Numéro
              </TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Services</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAvis.map(avis => (
              <TableRow key={avis.id}>
                <TableCell>{avis.avisInfo?.number}</TableCell>
                <TableCell>
                  <Link to={`/avis-de-passage/${avis.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {avis.billTo?.company}
                  </Link>
                </TableCell>
                <TableCell>{avis.avisInfo?.date}</TableCell>
                <TableCell>{avis.billTo?.address}</TableCell>
                <TableCell>
                  {avis.services?.slice(0, 2).map((service, idx) => (
                    <Box key={idx}>
                      <Typography variant="body2"><strong>{service.libelle}</strong>: {service.description}</Typography>
                    </Box>
                  ))}
                  {avis.services?.length > 2 && (
                    <Typography variant="caption" color="textSecondary">
                      ...et {avis.services.length - 2} autres
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <IconButton color="primary" onClick={() => handleOpenPdf(avis)}>
                      <PreviewOutlinedIcon />
                    </IconButton>
                    <PDFDownloadLink document={<AvisDePassagePDF avis={avis} />} fileName={`avis_de_passage_${avis.avisInfo?.number}.pdf`}>
                      {({ loading }) => (
                        <IconButton color="error" disabled={loading}>
                          <PictureAsPdfOutlinedIcon />
                        </IconButton>
                      )}
                    </PDFDownloadLink>
                    <IconButton aria-label="delete" onClick={() => handleDeleteAvis(avis.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedAvis.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucun avis de passage à afficher.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
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
      <Dialog
        open={openPdf}
        onClose={handleClosePdf}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Aperçu de l'Avis de Passage</DialogTitle>
        <DialogContent sx={{ height: 900 }}>
          {selectedAvis && <AvisDePassagePDF avis={selectedAvis} />}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default SearchAvisDePassage;
