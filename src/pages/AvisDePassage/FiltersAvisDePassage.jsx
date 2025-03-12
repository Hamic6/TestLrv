import React, { useState } from 'react';
import { TextField, Button, Grid, MenuItem } from '@mui/material';

const FiltersAvisDePassage = ({ onApplyFilters }) => {
  const [currency, setCurrency] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [number, setNumber] = useState('');

  const handleApplyFilters = () => {
    onApplyFilters({ currency, month, year, number });
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
          select
          label="Mois"
          variant="outlined"
          fullWidth
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
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
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Année"
          type="number"
          variant="outlined"
          fullWidth
          value={year}
          onChange={(e) => setYear(e.target.value)}
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
