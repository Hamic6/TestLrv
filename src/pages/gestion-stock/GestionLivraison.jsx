import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, Paper, Menu, MenuItem, TableContainer, useMediaQuery,
  Dialog, DialogTitle, DialogContent, IconButton, Box, TablePagination, Checkbox, TextField, Stack, Chip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import QRCode from "qrcode";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Bdlpdf, { BdlpdfDocument } from "./Bdlpdf"; // Utilise le PDF des bons de livraison
import FiltreValidation from "./FiltreValidation"; // Ajoute le filtre

const GestionLivraison = () => {
  const [bons, setBons] = useState([]);
  const [filteredBons, setFilteredBons] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [openPdf, setOpenPdf] = useState(false);
  const [selectedBdc, setSelectedBdc] = useState(null);
  const [qrCodes, setQrCodes] = useState({});
  const [anchorElActions, setAnchorElActions] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sélection
  const [selected, setSelected] = useState([]);

  // Filtrage
  const [filterArticle, setFilterArticle] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchBons = async () => {
      const snap = await getDocs(collection(db, "bon_de_livraison"));
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setBons(list);
      setFilteredBons(list);
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

  useEffect(() => {
    let filtered = bons;
    if (filterArticle) {
      filtered = filtered.filter(bon =>
        Array.isArray(bon.entries) &&
        bon.entries.some(entry =>
          (entry.name || "").toLowerCase().includes(filterArticle.toLowerCase())
        )
      );
    }
    setFilteredBons(filtered);
    setPage(0);
  }, [filterArticle, bons]);

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

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === filteredBons.length) {
      setSelected([]);
    } else {
      setSelected(filteredBons.map((bl) => bl.id));
    }
  };

  // Pagination des bons
  const paginatedBons = filteredBons.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Gestion des Bons de Livraison</Typography>
      <FiltreValidation onApplyFilters={handleApplyFilters} collectionName="bon_de_livraison" />
      <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Article"
          size="small"
          value={filterArticle}
          onChange={e => setFilterArticle(e.target.value)}
          sx={{ minWidth: 200 }}
        />
      </Stack>
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
                  checked={selected.length === filteredBons.length && filteredBons.length > 0}
                  indeterminate={selected.length > 0 && selected.length < filteredBons.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Numéro</TableCell>
              {!isMobile && <TableCell>Client</TableCell>}
              <TableCell>Date</TableCell>
              <TableCell>Articles</TableCell> {/* <-- Ajout ici */}
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
                  {Array.isArray(bon.entries) && bon.entries.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(isMobile ? bon.entries.slice(0, 2) : bon.entries).map((entry, idx) => (
                        <Chip
                          key={entry.productId || idx}
                          label={`${entry.name} (${entry.quantity} ${entry.unit})`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {isMobile && bon.entries.length > 2 && (
                        <Chip label={`+${bon.entries.length - 2} autres`} size="small" />
                      )}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Aucun article
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {isMobile ? (
                    <>
                      <IconButton onClick={e => setAnchorElActions({ anchor: e.currentTarget, bon })}>
                        <PreviewOutlinedIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorElActions?.anchor}
                        open={Boolean(anchorElActions) && anchorElActions.bon.id === bon.id}
                        onClose={() => setAnchorElActions(null)}
                      >
                        <MenuItem onClick={() => { handleOpenPdf(bon); setAnchorElActions(null); }}>
                          <PreviewOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Aperçu
                        </MenuItem>
                        <MenuItem onClick={() => setAnchorElActions(null)}>
                          <PDFDownloadLink
                            document={<BdlpdfDocument bdl={bon} qrCodeUrl={qrCodes[bon.id] || ""} />}
                            fileName={`BDL_${bon.orderNumber || bon.id}.pdf`}
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
                      </Menu>
                    </>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <IconButton color="primary" onClick={() => handleOpenPdf(bon)}>
                        <PreviewOutlinedIcon />
                      </IconButton>
                      <PDFDownloadLink
                        document={<BdlpdfDocument bdl={bon} qrCodeUrl={qrCodes[bon.id] || ""} />}
                        fileName={`BDL_${bon.orderNumber || bon.id}.pdf`}
                        style={{ textDecoration: "none", marginLeft: 8 }}
                      >
                        {({ loading }) => (
                          <IconButton color="error">
                            <PictureAsPdfOutlinedIcon />
                          </IconButton>
                        )}
                      </PDFDownloadLink>
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
          Aucun bon de livraison à afficher.
        </Typography>
      )}
      <Dialog
        open={openPdf}
        onClose={handleClosePdf}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Aperçu du Bon de Livraison</DialogTitle>
        <DialogContent sx={{ height: 900 }}>
          {selectedBdc && <Bdlpdf bdl={selectedBdc} />}
        </DialogContent>
      </Dialog>
      <Box mt={2}>
        <Typography variant="body2">
          {selected.length} bon(s) de livraison sélectionné(s)
        </Typography>
      </Box>
    </Paper>
  );
};

export default GestionLivraison;