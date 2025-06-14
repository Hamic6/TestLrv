import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from "firebase/firestore";
import { TextField, MenuItem, Grid } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

const Filters = ({ onApplyFilters }) => {
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [status, setStatus] = useState('');
  const [currency, setCurrency] = useState('');
  const [currencies, setCurrencies] = useState(['USD', 'EUR', 'CDF']);
  const [service, setService] = useState('');
  const [archived, setArchived] = useState('non');
  const [invoiceNumber, setInvoiceNumber] = useState(''); // Ajout du champ numéro de facture

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsList);
      } catch (error) {
        console.error("Erreur lors de la récupération des clients :", error);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    onApplyFilters({ client, year, month, status, currency, service, archived, invoiceNumber });
  }, [client, year, month, status, currency, service, archived, invoiceNumber]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Autocomplete
          options={clients.map(c => ({ label: c.name }))}
          value={client ? { label: client } : null}
          onChange={(_, newValue) => setClient(newValue ? newValue.label : "")}
          renderInput={(params) => <TextField {...params} label="Client" variant="outlined" fullWidth />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Année"
          type="number"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Mois"
          select
          fullWidth
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <MenuItem value="1">Janvier</MenuItem>
          <MenuItem value="2">Février</MenuItem>
          <MenuItem value="3">Mars</MenuItem>
          <MenuItem value="4">Avril</MenuItem>
          <MenuItem value="5">Mai</MenuItem>
          <MenuItem value="6">Juin</MenuItem>
          <MenuItem value="7">Juillet</MenuItem>
          <MenuItem value="8">Août</MenuItem>
          <MenuItem value="9">Septembre</MenuItem>
          <MenuItem value="10">Octobre</MenuItem>
          <MenuItem value="11">Novembre</MenuItem>
          <MenuItem value="12">Décembre</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Statut"
          select
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="Payé">Payé</MenuItem>
          <MenuItem value="Non payé">Non Payé</MenuItem>
          <MenuItem value="Envoyé">Envoyé</MenuItem>
          <MenuItem value="Vide">Vide</MenuItem>
          <MenuItem value="Erreur">Erreur</MenuItem>
        </TextField>
      </Grid>
      {/* Champ numéro de facture */}
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Numéro de facture"
          fullWidth
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Devise"
          select
          variant="outlined"
          fullWidth
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {currencies.map((currency) => (
            <MenuItem key={currency} value={currency}>
              {currency}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Service"
          variant="outlined"
          fullWidth
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Archivage"
          select
          fullWidth
          value={archived}
          onChange={(e) => setArchived(e.target.value)}
        >
          <MenuItem value="non">Non Archivées</MenuItem>
          <MenuItem value="oui">Archivées</MenuItem>
          <MenuItem value="toutes">Toutes</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  );
};

export default Filters;
