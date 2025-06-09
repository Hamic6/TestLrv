import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Typography, Paper, IconButton, Box, TextField, Snackbar, Alert, TableContainer, TablePagination, Dialog, DialogTitle, DialogContent, Chip, useMediaQuery, Menu, MenuItem, Stack
} from '@mui/material';
import { Delete as DeleteIcon, PreviewOutlined as PreviewOutlinedIcon, PictureAsPdfOutlined as PictureAsPdfOutlinedIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import AvisDePassagePDF from './AvisDePassagePDF';
import FiltersAvisDePassage from './FiltersAvisDePassage';
import { useTheme } from "@mui/material/styles";
import AvisDePassagePreview from './AvisDePassagePreview';

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
  const [anchorElActions, setAnchorElActions] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    setAnchorElActions(null);
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
    <Paper sx={{ p: isMobile ? 1 : 2 }}>
      <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
        Recherche des Avis de Passage
      </Typography>
      <TextField
        label="Rechercher un client"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size={isMobile ? "small" : "medium"}
      />
      <Box display="flex" alignItems="center" mb={2}>
        <FiltersAvisDePassage onApplyFilters={handleApplyFilters} />
      </Box>
      <TableContainer sx={{ maxWidth: "100vw", overflowX: "auto" }}>
        <Table size={isMobile ? "small" : "medium"}>
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
              {!isMobile && <TableCell>Date</TableCell>}
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
                {!isMobile && (
                  <TableCell>
                    {avis.avisInfo?.date}
                  </TableCell>
                )}
                <TableCell>
                  <Stack direction="column" spacing={0.5}>
                    {avis.services && Array.isArray(avis.services) ? (
                      <>
                        {avis.services.slice(0, isMobile ? 1 : 2).map((service, idx) => (
                          <Chip
                            key={idx}
                            label={service.libelle}
                            size="small"
                            variant="outlined"
                            sx={{
                              mb: 0.5,
                              maxWidth: isMobile ? 120 : 180,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: isMobile ? 11 : 13,
                              height: isMobile ? 22 : 28,
                            }}
                          />
                        ))}
                        {avis.services.length > (isMobile ? 1 : 2) && (
                          <Chip
                            label={`+${avis.services.length - (isMobile ? 1 : 2)} autre(s)`}
                            size="small"
                            variant="outlined"
                            color="info"
                            sx={{
                              mb: 0.5,
                              maxWidth: isMobile ? 120 : 180,
                              fontSize: isMobile ? 11 : 13,
                              height: isMobile ? 22 : 28,
                            }}
                          />
                        )}
                      </>
                    ) : null}
                    {isMobile && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {avis.avisInfo?.date}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  {isMobile ? (
                    <>
                      <IconButton onClick={e => setAnchorElActions({ anchor: e.currentTarget, avis })}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorElActions?.anchor}
                        open={Boolean(anchorElActions) && anchorElActions.avis.id === avis.id}
                        onClose={() => setAnchorElActions(null)}
                      >
                        <MenuItem onClick={() => { handleOpenPdf(avis); setAnchorElActions(null); }}>
                          <PreviewOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Aperçu
                        </MenuItem>
                        <MenuItem onClick={() => setAnchorElActions(null)}>
                          <PDFDownloadLink
                            document={<AvisDePassagePDF avis={avis} />}
                            fileName={`avis_de_passage_${avis.avisInfo?.number}.pdf`}
                            style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", width: "100%" }}
                          >
                            {({ loading }) => (
                              <>
                                <PictureAsPdfOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                                Télécharger PDF
                              </>
                            )}
                          </PDFDownloadLink>
                        </MenuItem>
                        <MenuItem onClick={() => { handleDeleteAvis(avis.id); setAnchorElActions(null); }}>
                          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Supprimer
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
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
                  )}
                </TableCell>
              </TableRow>
            ))}
            {paginatedAvis.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
        rowsPerPageOptions={[5, 10, 25]}
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
        <DialogContent sx={{ height: 900, p: 0 }}>
          {selectedAvis && (
            <PDFViewer width="100%" height={900} style={{ border: "none" }}>
              <AvisDePassagePDF avis={selectedAvis} />
            </PDFViewer>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default SearchAvisDePassage;
