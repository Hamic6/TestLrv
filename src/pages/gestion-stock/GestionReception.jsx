import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, updateDoc, doc, increment, addDoc, deleteDoc } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, Paper, TextField, TableContainer, TablePagination, Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, useMediaQuery, MenuItem
} from "@mui/material";
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, HourglassEmpty as HourglassEmptyIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Bdreceptionpdf, { BdreceptionpdfDocument } from "./Bdreceptionpdf";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";

const STATUS_LABELS = {
  en_attente: "En attente",
  validé: "Validé",
  refusé: "Refusé"
};

const STATUS_COLORS = {
  en_attente: "warning",
  validé: "success",
  refusé: "error"
};

const GestionReception = () => {
  const [bonsReception, setBonsReception] = useState([]);
  const [bdcs, setBdcs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openReceptionPdf, setOpenReceptionPdf] = useState(false);
  const [selectedReception, setSelectedReception] = useState(null);
  const [anchorElActions, setAnchorElActions] = useState(null);
  const [currentBrId, setCurrentBrId] = useState(null);
  const [filterFournisseur, setFilterFournisseur] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterArticle, setFilterArticle] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const isMobile = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    const fetchBonsReception = async () => {
      const snap = await getDocs(collection(db, "bon_de_reception"));
      setBonsReception(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchBonsReception();
  }, []);

  useEffect(() => {
    const fetchBdcs = async () => {
      const snap = await getDocs(collection(db, "bon_de_commande"));
      setBdcs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchBdcs();
  }, []);

  const handleQuantiteRecueChange = (brId, articleId, value) => {
    setBonsReception(bonsReception =>
      bonsReception.map(br =>
        br.id !== brId
          ? br
          : {
              ...br,
              articles: br.articles.map(a =>
                a.articleId !== articleId
                  ? a
                  : { ...a, quantite_recue: value }
              ),
            }
      )
    );
  };

  const handleValidateReception = async (br) => {
    const reliquatArticles = [];
    let hasValidReception = false;

    for (const art of br.articles) {
      if (!art.articleId) continue;
      const qtyRecue = Number(art.quantite_recue) || 0;
      const qtyCommandee = Number(art.quantite_commandee) || 0;

      if (qtyRecue <= 0) continue;
      if (qtyRecue > qtyCommandee) {
        alert(
          `Impossible de recevoir plus que la quantité commandée pour l'article "${art.name}" (${qtyRecue}/${qtyCommandee}).`
        );
        return;
      }

      hasValidReception = true;

      await updateDoc(doc(db, "articles", art.articleId), {
        stock: increment(qtyRecue)
      });

      if (qtyRecue < qtyCommandee) {
        reliquatArticles.push({
          ...art,
          quantite_commandee: qtyCommandee - qtyRecue,
          quantite_recue: 0
        });
      }
    }

    if (!hasValidReception) {
      alert("Aucun article reçu avec une quantité valide (> 0 et ≤ commandée).");
      return;
    }

    await updateDoc(doc(db, "bon_de_reception", br.id), {
      statut: "validé",
      dateReception: new Date()
    });

    if (reliquatArticles.length > 0) {
      const bdc = bdcs.find(b => b.id === br.linkedBdcId);
      await addDoc(collection(db, "bon_de_reception"), {
        orderNumber: `BR-${Date.now()}`,
        linkedBdcId: br.linkedBdcId,
        fournisseur: br.fournisseur,
        articles: reliquatArticles,
        dateReception: null,
        statut: "en_attente",
        commentaire: "Reliquat de la livraison précédente",
        userId: br.userId || null,
        createdAt: new Date(),
        dateAcceptation: bdc?.dateAcceptation || null,
      });
    }

    const snap = await getDocs(collection(db, "bon_de_reception"));
    setBonsReception(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleDeleteReception = async (brId) => {
    await deleteDoc(doc(db, "bon_de_reception", brId));
    const snap = await getDocs(collection(db, "bon_de_reception"));
    setBonsReception(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleOpenReceptionPdf = (br) => {
    setSelectedReception(br);
    setOpenReceptionPdf(true);
  };

  const handleCloseReceptionPdf = () => {
    setOpenReceptionPdf(false);
    setSelectedReception(null);
  };

  const filteredBons = bonsReception.filter(br => {
    // Filtre fournisseur
    const fournisseurMatch = filterFournisseur
      ? (br.fournisseur?.name || "").toLowerCase().includes(filterFournisseur.toLowerCase())
      : true;
    // Filtre date acceptation
    const dateAcceptation = (() => {
      const bdc = bdcs.find(b => b.id === br.linkedBdcId);
      if (bdc?.dateAcceptation?.toDate) {
        return bdc.dateAcceptation.toDate();
      }
      return null;
    })();
    const dateMatch = filterDate
      ? dateAcceptation &&
        dateAcceptation.toISOString().slice(0, 10) === filterDate
      : true;
    // Filtre article
    const articleMatch = filterArticle
      ? br.articles.some(a =>
          (a.name || "").toLowerCase().includes(filterArticle.toLowerCase())
        )
      : true;
    // Filtre statut
    const statutMatch = filterStatut ? br.statut === filterStatut : true;

    return fournisseurMatch && dateMatch && articleMatch && statutMatch;
  });

  const paginatedBons = filteredBons.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Gestion des Bons de Réception</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          label="Fournisseur"
          size="small"
          value={filterFournisseur}
          onChange={e => setFilterFournisseur(e.target.value)}
        />
        <TextField
          label="Date acceptation"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
        <TextField
          label="Article"
          size="small"
          value={filterArticle}
          onChange={e => setFilterArticle(e.target.value)}
        />
        <TextField
          label="Statut"
          size="small"
          select
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="en_attente">En attente</MenuItem>
          <MenuItem value="validé">Validé</MenuItem>
          <MenuItem value="refusé">Refusé</MenuItem>
        </TextField>
      </Box>
      <TableContainer sx={{ maxWidth: "100vw", overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Fournisseur</TableCell>
              <TableCell>Date acceptation</TableCell>
              <TableCell>Articles</TableCell>
              {!isMobile && <TableCell>Statut</TableCell>}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBons.map(br => (
              <TableRow key={br.id}>
                <TableCell>{br.orderNumber}</TableCell>
                <TableCell>{br.fournisseur?.name}</TableCell>
                <TableCell>
                  {(() => {
                    const bdc = bdcs.find(b => b.id === br.linkedBdcId);
                    if (bdc?.dateAcceptation?.toDate) {
                      return bdc.dateAcceptation.toDate().toLocaleString();
                    }
                    return "";
                  })()}
                  {isMobile && (
                    <Box mt={1}>
                      <Chip
                        label={STATUS_LABELS[br.statut] || "En attente"}
                        color={STATUS_COLORS[br.statut] || "warning"}
                        icon={
                          br.statut === "validé" ? <CheckCircleIcon fontSize="small" /> :
                          br.statut === "refusé" ? <CancelIcon fontSize="small" /> :
                          <HourglassEmptyIcon fontSize="small" />
                        }
                        size="small"
                      />
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {br.articles.map(a => (
                    <Box key={a.articleId} sx={{ mb: 1 }}>
                      {a.name} :&nbsp;
                      <TextField
                        type="number"
                        size="small"
                        value={a.quantite_recue}
                        onChange={e => handleQuantiteRecueChange(br.id, a.articleId, e.target.value)}
                        style={{ width: 60 }}
                        disabled={br.statut !== "en_attente"}
                      />
                      &nbsp;/ {a.quantite_commandee} {a.unit}
                    </Box>
                  ))}
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[br.statut] || "En attente"}
                      color={STATUS_COLORS[br.statut] || "warning"}
                      icon={
                        br.statut === "validé" ? <CheckCircleIcon fontSize="small" /> :
                        br.statut === "refusé" ? <CancelIcon fontSize="small" /> :
                        <HourglassEmptyIcon fontSize="small" />
                      }
                      size="medium"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <IconButton onClick={e => { setAnchorElActions(e.currentTarget); setCurrentBrId(br.id); }}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorElActions}
                    open={Boolean(anchorElActions) && currentBrId === br.id}
                    onClose={() => setAnchorElActions(null)}
                  >
                    <MenuItem onClick={() => { handleOpenReceptionPdf(br); setAnchorElActions(null); }}>
                      <PreviewOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Aperçu
                    </MenuItem>
                    <MenuItem
                      component={PDFDownloadLink}
                      document={<BdreceptionpdfDocument br={br} qrCodeUrl={""} />}
                      fileName={`BR_${br.orderNumber || br.id}.pdf`}
                      style={{ color: "inherit", textDecoration: "none" }}
                      onClick={() => setAnchorElActions(null)}
                    >
                      <PictureAsPdfOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Télécharger PDF
                    </MenuItem>
                    {br.statut === "en_attente" && (
                      <MenuItem onClick={() => { handleValidateReception(br); setAnchorElActions(null); }}>
                        <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} /> Valider la réception
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => { handleDeleteReception(br.id); setAnchorElActions(null); }}>
                      <DeleteIcon color="error" fontSize="small" sx={{ mr: 1 }} /> Supprimer
                    </MenuItem>
                  </Menu>
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
      {bonsReception.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Aucun bon de réception à afficher.
        </Typography>
      )}
      <Dialog
        open={openReceptionPdf}
        onClose={handleCloseReceptionPdf}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Aperçu du Bon de Réception</DialogTitle>
        <DialogContent sx={{ height: 900 }}>
          {selectedReception && <Bdreceptionpdf br={selectedReception} />}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default GestionReception;