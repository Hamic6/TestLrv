import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, Paper, Chip, Menu, MenuItem, TableContainer, useMediaQuery
} from "@mui/material";
import FiltreValidation from "./FiltreValidation";
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, HourglassEmpty as HourglassEmptyIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

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

const ValidationBonLivraison = () => {
  const [bons, setBons] = useState([]);
  const [filteredBons, setFilteredBons] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentBonId, setCurrentBonId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchBons = async () => {
      const snap = await getDocs(collection(db, "bon_de_livraison"));
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        statut: d.data().statut || "en_attente"
      }));
      setBons(list);
      setFilteredBons(list.filter(b => b.statut === "en_attente"));
    };
    fetchBons();
  }, []);

  const handleStatusChange = async (id, statut) => {
    await updateDoc(doc(db, "bon_de_livraison", id), { statut });
    setBons(prev => prev.map(b => b.id === id ? { ...b, statut } : b));
    setFilteredBons(prev => prev.map(b => b.id === id ? { ...b, statut } : b));
    handleCloseMenu();
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
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Validation des Bons de Livraison</Typography>
      <FiltreValidation onApplyFilters={handleApplyFilters} />
      <TableContainer sx={{ maxWidth: "100vw", overflowX: "auto" }}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              {!isMobile && <TableCell>Client</TableCell>}
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              {!isMobile && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBons.map(bon => (
              <TableRow key={bon.id}>
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
                  <Chip
                    label={isMobile ? "" : (STATUS_LABELS[bon.statut] || "En attente")}
                    color={STATUS_COLORS[bon.statut] || "warning"}
                    icon={
                      bon.statut === "accepté" ? <CheckCircleIcon fontSize="small" /> :
                      bon.statut === "refusé" ? <CancelIcon fontSize="small" /> :
                      <HourglassEmptyIcon fontSize="small" />
                    }
                    size={isMobile ? "small" : "medium"}
                    clickable
                    onClick={e => handleClickChip(e, bon.id)}
                  />
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && currentBonId === bon.id}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem onClick={() => handleStatusChange(bon.id, "accepté")}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} /> Accepté
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusChange(bon.id, "refusé")}>
                      <CancelIcon color="error" sx={{ mr: 1 }} /> Refusé
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusChange(bon.id, "en_attente")}>
                      <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} /> En attente
                    </MenuItem>
                  </Menu>
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    {bon.statut !== "accepté" && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleStatusChange(bon.id, "accepté")}
                      >
                        Valider
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredBons.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Aucun bon de livraison à afficher.
        </Typography>
      )}
    </Paper>
  );
};

export default ValidationBonLivraison;