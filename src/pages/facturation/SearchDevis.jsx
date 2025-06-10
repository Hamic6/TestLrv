import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, Paper, Chip, Menu, MenuItem, TableContainer, useMediaQuery,
  Dialog, DialogTitle, DialogContent, IconButton, Box, TablePagination, TextField
} from "@mui/material";
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, HourglassEmpty as HourglassEmptyIcon, MoreVert as MoreVertIcon, Delete as DeleteIcon, PictureAsPdf as PdfIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import DevisPDF from './DevisPDF';
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import Autocomplete from "@mui/material/Autocomplete";

const STATUS_LABELS = {
  "Confirmée": "Confirmée",
  "En attente": "En attente"
};

const STATUS_COLORS = {
  "Confirmée": "success",
  "En attente": "warning"
};

const SearchDevis = () => {
  const [devis, setDevis] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ currency: '', month: '', year: '', number: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentDevisId, setCurrentDevisId] = useState(null);
  const [anchorElActions, setAnchorElActions] = useState(null);
  const [openPdf, setOpenPdf] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [selected, setSelected] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "devis"));
        const devisList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  const handleConfirmDevis = async (id, currentStatus) => {
    const newStatus = currentStatus === "Confirmée" ? "En attente" : "Confirmée";
    await updateDoc(doc(db, "devis", id), { status: newStatus });
    setDevis(devis.map(devis => devis.id === id ? { ...devis, status: newStatus } : devis));
    setSnackbarMessage(`Le statut du devis a été mis à jour : ${newStatus}`);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickChip = (event, id) => {
    setAnchorEl(event.currentTarget);
    setCurrentDevisId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentDevisId(null);
  };

  const handleOpenPdf = (devis) => {
    setSelectedDevis(devis);
    setOpenPdf(true);
    setAnchorElActions(null);
  };

  const handleClosePdf = () => {
    setOpenPdf(false);
    setSelectedDevis(null);
  };

  // Tri décroissant par numéro de proforma (en supposant que c'est un nombre ou une string comparable)
  const filteredDevis = devis
    .filter(devis =>
      (!search || devis.billTo?.company?.toLowerCase().includes(search.toLowerCase())) &&
      (!filters.currency || devis.invoiceInfo?.currency?.toLowerCase().includes(filters.currency.toLowerCase())) &&
      (!filters.month || devis.invoiceInfo?.date?.split('-')[1] === filters.month) &&
      (!filters.year || devis.invoiceInfo?.date?.split('-')[0] === filters.year) &&
      (!filters.number || devis.invoiceInfo?.number?.includes(filters.number))
    )
    .sort((a, b) => {
      // Si numéro est numérique, trier numériquement, sinon trier par string
      const numA = parseInt(a.invoiceInfo?.number, 10);
      const numB = parseInt(b.invoiceInfo?.number, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numB - numA;
      }
      return (b.invoiceInfo?.number || '').localeCompare(a.invoiceInfo?.number || '');
    });

  const paginatedDevis = filteredDevis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Gestion de la sélection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = paginatedDevis.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Récupérer la liste unique des clients pour l'autocomplete
  const clientOptions = Array.from(
    new Set(devis.map(d => d.billTo?.company).filter(Boolean))
  ).map(company => ({ label: company }));

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Gestion des Devis / Factures Proforma</Typography>
      <Box mb={2}>
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
          <Autocomplete
            options={clientOptions}
            value={search ? { label: search } : null}
            onChange={(_, newValue) => setSearch(newValue ? newValue.label : "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client"
                variant="outlined"
                size="small"
                sx={{ minWidth: 220, maxWidth: 300 }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.label === value.label}
            sx={{ minWidth: 220, maxWidth: 300 }}
          />
          <TextField
            label="Devise"
            variant="outlined"
            value={filters.currency}
            onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
            size="small"
          />
          <TextField
            select
            label="Mois"
            variant="outlined"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">Tous</MenuItem>
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
          <TextField
            label="Année"
            type="number"
            variant="outlined"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            size="small"
            sx={{ minWidth: 100 }}
          />
          <TextField
            label="Numéro du Proforma"
            variant="outlined"
            value={filters.number}
            onChange={(e) => setFilters({ ...filters, number: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Box>
      <TableContainer sx={{ maxWidth: "100vw", overflowX: "auto" }}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={paginatedDevis.length > 0 && selected.length === paginatedDevis.length}
                  indeterminate={selected.length > 0 && selected.length < paginatedDevis.length}
                  onChange={handleSelectAllClick}
                  style={{ cursor: "pointer" }}
                />
              </TableCell>
              {isMobile ? (
                <TableCell>Proforma</TableCell>
              ) : (
                <>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDevis.map(devis => {
              const isItemSelected = isSelected(devis.id);
              // Menu d'actions contextuel (3 points) pour chaque ligne
              const isActionMenuOpen = anchorElActions && anchorElActions.devis.id === devis.id;

              if (isMobile) {
                // VERSION MOBILE : tout dans une seule cellule
                return (
                  <TableRow
                    key={devis.id}
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    tabIndex={-1}
                    style={isItemSelected ? { background: "#e3f2fd" } : {}}
                  >
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={isItemSelected}
                        onChange={event => handleClick(event, devis.id)}
                        style={{ cursor: "pointer" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {devis.invoiceInfo?.number} — {devis.billTo?.company}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {devis.invoiceInfo?.date} | {devis.invoiceInfo?.currency} | Total : {devis.total}
                        </Typography>
                        <Box>
                          {Array.isArray(devis.services) && devis.services.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                              {devis.services.slice(0, 2).map((service, idx) => (
                                <li key={idx} style={{ fontSize: 12 }}>
                                  {service.description || "-"}
                                  {service.libelle ? ` (${service.libelle})` : ""}
                                </li>
                              ))}
                              {devis.services.length > 2 && (
                                <li style={{ fontSize: 12, fontStyle: "italic" }}>...</li>
                              )}
                            </ul>
                          ) : (
                            <span style={{ fontSize: 12, color: "#888" }}>-</span>
                          )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Chip
                            label={STATUS_LABELS[devis.status] || "En attente"}
                            color={STATUS_COLORS[devis.status] || "warning"}
                            icon={
                              devis.status === "Confirmée" ? <CheckCircleIcon fontSize="small" /> :
                                <HourglassEmptyIcon fontSize="small" />
                            }
                            size="small"
                            clickable
                            onClick={e => handleClickChip(e, devis.id)}
                          />
                          <IconButton onClick={e => setAnchorElActions({ anchor: e.currentTarget, devis })}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorElActions?.anchor}
                            open={isActionMenuOpen}
                            onClose={() => setAnchorElActions(null)}
                          >
                            <MenuItem onClick={() => { handleOpenPdf(devis); setAnchorElActions(null); }}>
                              <PreviewOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Aperçu
                            </MenuItem>
                            <MenuItem
                              component={PDFDownloadLink}
                              document={<DevisPDF devis={devis} />}
                              fileName={`devis_${devis.invoiceInfo?.number}.pdf`}
                              style={{ color: "inherit", textDecoration: "none" }}
                              onClick={() => setAnchorElActions(null)}
                            >
                              <PdfIcon fontSize="small" sx={{ mr: 1 }} /> Télécharger PDF
                            </MenuItem>
                            <MenuItem onClick={() => { handleDeleteDevis(devis.id); setAnchorElActions(null); }}>
                              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Supprimer
                            </MenuItem>
                          </Menu>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              }
              // VERSION DESKTOP : menu contextuel aussi
              return (
                <TableRow
                  key={devis.id}
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                  tabIndex={-1}
                  style={isItemSelected ? { background: "#e3f2fd" } : {}}
                >
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={isItemSelected}
                      onChange={event => handleClick(event, devis.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </TableCell>
                  <TableCell>{devis.invoiceInfo?.number}</TableCell>
                  <TableCell>{devis.billTo?.company}</TableCell>
                  <TableCell>{devis.invoiceInfo?.date}</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 220, width: 200 }}>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {devis.services && Array.isArray(devis.services) ? (
                        <>
                          {devis.services.slice(0, 2).map((service, idx) => (
                            <Chip
                              key={idx}
                              label={service.description}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 0.5, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}
                            />
                          ))}
                          {devis.services.length > 2 && (
                            <Chip
                              label={`+${devis.services.length - 2} autre(s)`}
                              size="small"
                              variant="outlined"
                              color="info"
                              sx={{ mb: 0.5, maxWidth: 180 }}
                            />
                          )}
                        </>
                      ) : ''}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[devis.status] || "En attente"}
                      color={STATUS_COLORS[devis.status] || "warning"}
                      icon={
                        devis.status === "Confirmée" ? <CheckCircleIcon fontSize="small" /> :
                          <HourglassEmptyIcon fontSize="small" />
                      }
                      size="medium"
                      clickable
                      onClick={e => handleClickChip(e, devis.id)}
                    />
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && currentDevisId === devis.id}
                      onClose={handleCloseMenu}
                    >
                      <MenuItem onClick={() => { handleConfirmDevis(devis.id, devis.status); handleCloseMenu(); }}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} /> Confirmer
                      </MenuItem>
                      <MenuItem onClick={() => { handleConfirmDevis(devis.id, devis.status); handleCloseMenu(); }}>
                        <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} /> En attente
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={e => setAnchorElActions({ anchor: e.currentTarget, devis })}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorElActions?.anchor}
                      open={isActionMenuOpen}
                      onClose={() => setAnchorElActions(null)}
                    >
                      <MenuItem onClick={() => { handleOpenPdf(devis); setAnchorElActions(null); }}>
                        <PreviewOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Aperçu
                      </MenuItem>
                      <MenuItem
                        component={PDFDownloadLink}
                        document={<DevisPDF devis={devis} />}
                        fileName={`devis_${devis.invoiceInfo?.number}.pdf`}
                        style={{ color: "inherit", textDecoration: "none" }}
                        onClick={() => setAnchorElActions(null)}
                      >
                        <PdfIcon fontSize="small" sx={{ mr: 1 }} /> Télécharger PDF
                      </MenuItem>
                      <MenuItem onClick={() => { handleDeleteDevis(devis.id); setAnchorElActions(null); }}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Supprimer
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredDevis.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />
      {filteredDevis.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Aucun devis à afficher.
        </Typography>
      )}
      <Dialog
        open={openPdf}
        onClose={handleClosePdf}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Aperçu du Devis</DialogTitle>
        <DialogContent sx={{ height: 900, p: 0 }}>
          {selectedDevis && (
            <PDFViewer width="100%" height={850} style={{ border: "none" }}>
              <DevisPDF devis={selectedDevis} />
            </PDFViewer>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default SearchDevis;
