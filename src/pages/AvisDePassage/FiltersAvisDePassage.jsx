import React, { useState } from 'react';
import { TextField, Button, Grid } from '@mui/material';

const FiltersAvisDePassage = ({ onApplyFilters }) => {
  const [currency, setCurrency] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [number, setNumber] = useState('');

  const handleApplyFilters = () => {
    onApplyFilters({ currency, date, startTime, endTime, number });
  };

  return (
    <Grid container spacing={2}>
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
          label="Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Heure de Début"
          type="time"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Heure de Fin"
          type="time"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Numéro d'Avis"
          variant="outlined"
          fullWidth
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleApplyFilters}>
          Appliquer les Filtres
        </Button>
      </Grid>
    </Grid>
  );
};

export default FiltersAvisDePassage;
