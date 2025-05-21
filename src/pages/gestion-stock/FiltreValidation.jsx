import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { TextField, MenuItem, Button, Grid, Select, InputLabel, FormControl } from "@mui/material";

// Classe de gestion des filtres pour les bons de livraison
class BonLivraisonFilter {
  constructor(bons) {
    this.bons = bons;
  }

  byStatus(status) {
    if (!status || status === "tous") return this.bons;
    if (status === "accepté") return this.bons.filter(b => b.validated === true);
    if (status === "refusé") return this.bons.filter(b => b.validated === false && b.rejected === true);
    if (status === "en_attente") return this.bons.filter(b => !b.validated && !b.rejected);
    return this.bons;
  }

  byClient(clientName) {
    if (!clientName) return this.bons;
    return this.bons.filter(b => b.client?.name?.toLowerCase().includes(clientName.toLowerCase()));
  }

  byOrderNumber(orderNumber) {
    if (!orderNumber) return this.bons;
    return this.bons.filter(b => b.orderNumber?.toLowerCase().includes(orderNumber.toLowerCase()));
  }
}

const FiltreValidation = ({ onApplyFilters }) => {
  const [bons, setBons] = useState([]);
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState("tous");
  const [client, setClient] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  // On ne charge les bons qu'une seule fois pour les options de filtre
  useEffect(() => {
    const fetchBons = async () => {
      const snap = await getDocs(collection(db, "bon_de_livraison"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBons(list);
    };
    const fetchClients = async () => {
      const snap = await getDocs(collection(db, "clients"));
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchBons();
    fetchClients();
  }, []);

  // Appliquer les filtres à chaque changement de filtre
  useEffect(() => {
    let filter = new BonLivraisonFilter(bons);
    let filtered = filter
      .byStatus(status)
      .filter(b => filter.byClient(client).includes(b))
      .filter(b => filter.byOrderNumber(orderNumber).includes(b));
    if (onApplyFilters) onApplyFilters(filtered);
    // eslint-disable-next-line
  }, [bons, status, client, orderNumber]);

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Statut</InputLabel>
          <Select
            value={status}
            label="Statut"
            onChange={e => setStatus(e.target.value)}
          >
            <MenuItem value="tous">Tous</MenuItem>
            <MenuItem value="accepté">Acceptés</MenuItem>
            <MenuItem value="refusé">Refusés</MenuItem>
            <MenuItem value="en_attente">En attente</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="Client"
          select
          fullWidth
          value={client}
          onChange={e => setClient(e.target.value)}
        >
          <MenuItem value="">Tous</MenuItem>
          {clients.map(c => (
            <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="N° Bon de livraison"
          fullWidth
          value={orderNumber}
          onChange={e => setOrderNumber(e.target.value)}
        />
      </Grid>
    </Grid>
  );
};

export default FiltreValidation;