import React, { useState } from 'react';
import { TextField, MenuItem, Button, Grid } from '@mui/material';

const Filters = ({ onApplyFilters }) => {
  const [client, setClient] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [status, setStatus] = useState('');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [currency, setCurrency] = useState('');
  const [service, setService] = useState('');
  const [archived, setArchived] = useState('non'); // Nouveau filtre pour les factures archivées

  const handleApplyFilters = () => {
    onApplyFilters({ client, dateRange, status, amountRange, currency, service, archived });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Client"
          variant="outlined"
          fullWidth
          value={client}
          onChange={(e) => setClient(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Date Début"
          type="date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Date Fin"
          type="date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Statut"
          select
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="payé">Payée</MenuItem>
          <MenuItem value="non payé">Non Payée</MenuItem>
          <MenuItem value="envoyé">Envoyée</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Montant Min."
          type="number"
          fullWidth
          value={amountRange.min}
          onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Montant Max."
          type="number"
          fullWidth
          value={amountRange.max}
          onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Devise"
          variant="outlined"
          fullWidth
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        />
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
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleApplyFilters}>
          Appliquer les Filtres
        </Button>
      </Grid>
    </Grid>
  );
};

export default Filters;
