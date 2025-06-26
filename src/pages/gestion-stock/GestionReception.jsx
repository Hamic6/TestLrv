import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, updateDoc, doc, increment, addDoc, deleteDoc } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, Paper, TextField, TableContainer, TablePagination, Box, Chip
} from "@mui/material";
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, HourglassEmpty as HourglassEmptyIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";

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

      // Empêche la validation si quantité reçue <= 0 ou > commandée
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

    // Si aucun article n'a été reçu correctement, on arrête tout
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

  // Pagination
  const paginatedBons = bonsReception.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      <TableContainer sx={{ maxWidth: "100vw", overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Fournisseur</TableCell>
              <TableCell>Date acceptation</TableCell>
              <TableCell>Articles</TableCell>
              <TableCell>Statut</TableCell>
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
                    // On cherche la date d'acceptation du BDC lié
                    const bdc = bdcs.find(b => b.id === br.linkedBdcId);
                    if (bdc?.dateAcceptation?.toDate) {
                      return bdc.dateAcceptation.toDate().toLocaleString();
                    }
                    return "";
                  })()}
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
                <TableCell>
                  {br.statut === "en_attente" && (
                    <Button variant="contained" color="success" onClick={() => handleValidateReception(br)}>
                      Valider la réception
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleDeleteReception(br.id)}
                    startIcon={<DeleteIcon />}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={bonsReception.length}
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
    </Paper>
  );
};

export default GestionReception;