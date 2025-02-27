import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Button as MuiButton, Menu, MenuItem, Typography, Grid, Container, Box } from "@mui/material";
import {
  Loop as LoopIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { spacing } from "@mui/system";
import { db } from '../../firebaseConfig'; // Chemin mis à jour pour firebaseConfig
import { collection, getDocs, query, where } from 'firebase/firestore';

const Button = styled(MuiButton)(spacing);

const SmallButton = styled(Button)`
  padding: 4px;
  min-width: 0;

  svg {
    width: 0.9em;
    height: 0.9em;
  }
`;

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre', ''
];

function Actions({ onFilterChange }) {
  const [yearAnchorEl, setYearAnchorEl] = useState(null);
  const [monthAnchorEl, setMonthAnchorEl] = useState(null);
  const [currencyAnchorEl, setCurrencyAnchorEl] = useState(null);
  const [yearFilter, setYearFilter] = useState('2025');
  const [monthFilter, setMonthFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('USD');

  const handleYearClick = (event) => {
    setYearAnchorEl(event.currentTarget);
  };

  const handleMonthClick = (event) => {
    setMonthAnchorEl(event.currentTarget);
  };

  const handleCurrencyClick = (event) => {
    setCurrencyAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setYearAnchorEl(null);
    setMonthAnchorEl(null);
    setCurrencyAnchorEl(null);
  };

  const handleYearMenuItemClick = (year) => {
    setYearFilter(year);
    setYearAnchorEl(null);
    onFilterChange({ year, month: monthFilter, currency: currencyFilter });
  };

  const handleMonthMenuItemClick = (month) => {
    setMonthFilter(month);
    setMonthAnchorEl(null);
    onFilterChange({ year: yearFilter, month, currency: currencyFilter });
  };

  const handleCurrencyMenuItemClick = (currency) => {
    setCurrencyFilter(currency);
    setCurrencyAnchorEl(null);
    onFilterChange({ year: yearFilter, month: monthFilter, currency });
  };

  return (
    <Container>
      <Box display="flex" justifyContent="flex-start" alignItems="center" mb={2}>
        <SmallButton size="small" mr={2}>
          <LoopIcon />
        </SmallButton>
        <SmallButton size="small" mr={10}> {/* Ajout de plus d'espace entre les boutons */}
          <FilterListIcon />
        </SmallButton>
        <Button
          variant="contained"
          color="secondary"
          aria-owns={yearAnchorEl ? "year-menu" : undefined}
          aria-haspopup="true"
          onClick={handleYearClick}
        >
          {yearFilter}
        </Button>
        <Menu
          id="year-menu"
          anchorEl={yearAnchorEl}
          open={Boolean(yearAnchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleYearMenuItemClick('2025')}>2025</MenuItem>
          <MenuItem onClick={() => handleYearMenuItemClick('2024')}>2024</MenuItem>
          <MenuItem onClick={() => handleYearMenuItemClick('2023')}>2023</MenuItem>
        </Menu>
        <Button
          variant="contained"
          color="primary"
          aria-owns={monthAnchorEl ? "month-menu" : undefined}
          aria-haspopup="true"
          onClick={handleMonthClick}
          style={{ marginLeft: '20px' }} // Ajout d'espace entre les boutons
        >
          {monthFilter || "Mois"}
        </Button>
        <Menu
          id="month-menu"
          anchorEl={monthAnchorEl}
          open={Boolean(monthAnchorEl)}
          onClose={handleClose}
        >
          {monthNames.map((month, index) => (
            <MenuItem key={index} onClick={() => handleMonthMenuItemClick(month)}>
              {month || "Tous les mois"}
            </MenuItem>
          ))}
        </Menu>
        <Button
          variant="contained"
          color="primary"
          aria-owns={currencyAnchorEl ? "currency-menu" : undefined}
          aria-haspopup="true"
          onClick={handleCurrencyClick}
          style={{ marginLeft: '20px' }} // Ajout d'espace entre les boutons
        >
          {currencyFilter}
        </Button>
        <Menu
          id="currency-menu"
          anchorEl={currencyAnchorEl}
          open={Boolean(currencyAnchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleCurrencyMenuItemClick('USD')}>USD</MenuItem>
          <MenuItem onClick={() => handleCurrencyMenuItemClick('CDF')}>CDF</MenuItem>
          <MenuItem onClick={() => handleCurrencyMenuItemClick('EUR')}>EUR</MenuItem>
        </Menu>
      </Box>
    </Container>
  );
}

export default Actions;
