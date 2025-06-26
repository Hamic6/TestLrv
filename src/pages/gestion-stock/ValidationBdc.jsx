import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, Paper, Chip, Menu, MenuItem, TableContainer, useMediaQuery,
  Dialog, DialogTitle, DialogContent, IconButton, Box, TablePagination, Checkbox
} from "@mui/material";
import FiltreValidation from "./FiltreValidation";
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, HourglassEmpty as HourglassEmptyIcon, MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import QRCode from "qrcode";
import Bdcpdf, { BdcpdfDocument } from "./Bdcpdf";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DeleteIcon from "@mui/icons-material/Delete";

const STATUS_LABELS = {
  en_attente: "En attente",
  accepté: "Accepté",
  refusé: "Refusé"
};

const STATUS_COLORS = {
  en_attente: "warning",
  accepté: "success",
  refusé: "error"
};

const ValidationBdc = () => {
  const [bons, setBons] = useState([]);
  const [filteredBons, setFilteredBons] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentBonId, setCurrentBonId] = useState(null);
  const [openPdf, setOpenPdf] = useState(false);
  const [selectedBdc, setSelectedBdc] = useState(null);
  const [qrCodes, setQrCodes] = useState({});
  const [anchorElActions, setAnchorElActions] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchBons = async () => {
      const snap = await getDocs(collection(db, "bon_de_commande"));
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        statut: d.data().statut || "en_attente"
      }));
      setBons(list);
      setFilteredBons(list.filter(b => b.statut === "en_attente")); // <-- ici, filtre par défaut
    };
    fetchBons();
  }, []);

  useEffect(() => {
    // Génère tous les QR codes à l'avance pour chaque bon (pour le téléchargement)
    const generateAllQRCodes = async () => {
      const codes = {};
      for (const bon of bons) {
        codes[bon.id] = await QRCode.toDataURL("https://rayonverts.com/");
      }
      setQrCodes(codes);
    };
    if (bons.length) generateAllQRCodes();
  }, [bons]);

  // Tri des bons selon le numéro
  useEffect(() => {
    const sorted = [...filteredBons].sort((a, b) => {
      const numA = Number(a.orderNumber);
      const numB = Number(b.orderNumber);
      return sortOrder === "asc" ? numA - numB : numB - numA;
    });
    setFilteredBons(sorted);
  }, [sortOrder, bons]);

  // --- MODIFICATION PRINCIPALE ICI ---
  const handleStatusChange = async (id, statut) => {
    try {
      const updateData = { statut };
      if (statut === "accepté") {
        updateData.dateAcceptation = new Date();
      }
      await updateDoc(doc(db, "bon_de_commande", id), updateData);

      // Si accepté, créer automatiquement un BR
      if (statut === "accepté") {
        const bdc = bons.find(b => b.id === id);
        if (bdc) {
          const articlesReception = (bdc.entries || []).map(entry => ({
            articleId: entry.productId || entry.id || "",
            name: entry.name || entry.productName || "",
            reference: entry.reference || "",
            quantite_commandee: Number(entry.quantity) || 0,
            quantite_recue: Number(entry.quantity) || 0,
            unit: entry.unit || "",
          }));
          const orderNumber = `BR-${Date.now()}`;
          await addDoc(collection(db, "bon_de_reception"), {
            orderNumber,
            linkedBdcId: bdc.id,
            fournisseur: bdc.client || {},
            articles: articlesReception,
            dateReception: null,
            statut: "en_attente",
            commentaire: "",
            userId: bdc.userId || null,
            createdAt: new Date(),
            dateAcceptation: bdc.dateAcceptation || null // AJOUT ICI
          });
        }
      }

      // Recharge la liste à jour depuis Firestore
      const snap = await getDocs(collection(db, "bon_de_commande"));
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        statut: d.data().statut || "en_attente"
      }));
      setBons(list);
      setFilteredBons(list.filter(b => b.statut === "en_attente")); // ou adapte selon tes filtres

      setSnackbarMessage(`Bon de commande ${statut === "accepté" ? "accepté" : statut === "refusé" ? "refusé" : "mis à jour"} avec succès.`);
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Erreur lors de la mise à jour du statut.");
      setSnackbarOpen(true);
      console.error(error);
    }
  };

  const handleClickChip = (event, id) => {
    setAnchorEl(event.currentTarget);
    setCurrentBonId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentBonId(null);
  };

  const handleApplyFilters = (filtered) => {
    setFilteredBons(filtered);
    setPage(0); // Reset page on filter
  };

  const handleOpenPdf = (bon) => {
    setSelectedBdc(bon);
    setOpenPdf(true);
    setAnchorElActions(null);
  };

  const handleClosePdf = () => {
    setOpenPdf(false);
    setSelectedBdc(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Pagination des bons
  const paginatedBons = filteredBons.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Checkbox handlers
  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const ids = paginatedBons.map((b) => b.id);
    if (selected.length === ids.length) {
      setSelected([]);
    } else {
      setSelected(ids);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Validation des Bons de Commande</Typography>
      <FiltreValidation onApplyFilters={handleApplyFilters} collectionName="bon_de_commande" />
      <Button
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      >
        Trier par numéro {sortOrder === "asc" ? "↓" : "↑"}
      </Button>
      <TableContainer sx={{ maxWidth: "100vw", overflowX: "auto" }}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === paginatedBons.length && paginatedBons.length > 0}
                  indeterminate={selected.length > 0 && selected.length < paginatedBons.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Numéro</TableCell>
              {!isMobile && <TableCell>Fournisseur</TableCell>}
              <TableCell>Date</TableCell>
              <TableCell>Date acceptation</TableCell> {/* AJOUT */}
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBons.map(bon => (
              <TableRow key={bon.id} selected={selected.includes(bon.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(bon.id)}
                    onChange={() => handleSelect(bon.id)}
                  />
                </TableCell>
                <TableCell>{bon.orderNumber}</TableCell>
                {!isMobile && <TableCell>{bon.client?.name}</TableCell>}
                <TableCell>
                  {bon.date?.toDate?.().toLocaleDateString?.() || ""}
                  {isMobile && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {bon.client?.name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {bon.dateAcceptation?.toDate
                    ? bon.dateAcceptation.toDate().toLocaleString()
                    : ""}
                </TableCell>
                <TableCell>
                  <Chip
                    label={isMobile ? "" : (STATUS_LABELS[bon.statut] || "En attente")}
                    color={STATUS_COLORS[bon.statut] || "warning"}
                    icon={
                      bon.statut === "accepté" ? <CheckCircleIcon fontSize="small" /> :
                      bon.statut === "refusé" ? <CancelIcon fontSize="small" /> :
                      <HourglassEmptyIcon fontSize="small" />
                    }
                    size={isMobile ? "small" : "medium"}
                    clickable={bon.statut !== "accepté"}
                    onClick={bon.statut !== "accepté" ? (e => handleClickChip(e, bon.id)) : undefined}
                  />
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && currentBonId === bon.id}
                    onClose={handleCloseMenu}
                  >
                    {/* N'affiche les options que si le bon n'est pas accepté */}
                    {bon.statut !== "accepté" && (
                      <>
                        <MenuItem onClick={() => handleStatusChange(bon.id, "accepté")}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} /> Accepté
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusChange(bon.id, "refusé")}>
                          <CancelIcon color="error" sx={{ mr: 1 }} /> Refusé
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusChange(bon.id, "en_attente")}>
                          <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} /> En attente
                        </MenuItem>
                      </>
                    )}
                  </Menu>
                </TableCell>
                <TableCell>
                  {isMobile ? (
                    <>
                      <IconButton onClick={e => setAnchorElActions({ anchor: e.currentTarget, bon })}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorElActions?.anchor}
                        open={Boolean(anchorElActions) && anchorElActions.bon.id === bon.id}
                        onClose={() => setAnchorElActions(null)}
                      >
                        <MenuItem onClick={() => handleOpenPdf(bon)}>
                          <PreviewOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Aperçu
                        </MenuItem>
                        <MenuItem
                          component={PDFDownloadLink}
                          document={<BdcpdfDocument bdc={bon} qrCodeUrl={qrCodes[bon.id] || ""} />}
                          fileName={`BDC_${bon.orderNumber || bon.id}.pdf`}
                          style={{ color: "inherit", textDecoration: "none" }}
                          onClick={() => setAnchorElActions(null)}
                        >
                          <PictureAsPdfOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Télécharger PDF
                        </MenuItem>
                        {bon.statut !== "accepté" && (
                          <MenuItem onClick={() => { handleStatusChange(bon.id, "accepté"); setAnchorElActions(null); }}>
                            <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} /> Valider
                          </MenuItem>
                        )}
                        {/* Le bouton supprimer a été retiré */}
                      </Menu>
                    </>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <IconButton color="primary" onClick={() => handleOpenPdf(bon)}>
                        <PreviewOutlinedIcon />
                      </IconButton>
                      <PDFDownloadLink
                        document={
                          <BdcpdfDocument
                            bdc={bon}
                            qrCodeUrl={qrCodes[bon.id] || ""}
                          />
                        }
                        fileName={`BDC_${bon.orderNumber || bon.id}.pdf`}
                        style={{ textDecoration: "none", marginLeft: 8 }}
                      >
                        {({ loading }) => (
                          <IconButton color="error">
                            <PictureAsPdfOutlinedIcon />
                          </IconButton>
                        )}
                      </PDFDownloadLink>
                      {bon.statut !== "accepté" && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleStatusChange(bon.id, "accepté")}
                          sx={{ ml: 1 }}
                        >
                          Valider
                        </Button>
                      )}
                      {/* Le bouton supprimer a été retiré */}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredBons.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />
      {filteredBons.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Aucun bon de commande à valider.
        </Typography>
      )}
      <Dialog
        open={openPdf}
        onClose={handleClosePdf}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Aperçu du Bon de Commande</DialogTitle>
        <DialogContent sx={{ height: 900 }}>
          {selectedBdc && <Bdcpdf bdc={selectedBdc} />}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default ValidationBdc;