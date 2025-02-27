import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, IconButton } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import { db } from '../../firebaseConfig'; // Chemin mis à jour pour firebaseConfig
import { collection, getDocs, query, where } from 'firebase/firestore';
import Actions from './Actions'; // Import du composant Actions
import BarChart from './BarChart'; // Import du composant BarChart
import LineChart from './LineChart'; // Import du composant LineChart
import PieChart from './PieChart'; // Import du composant PieChart

// Configuration des options par défaut de Chart.js
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Graphique',
    },
  },
};

const GraphComponent = () => {
  const [filters, setFilters] = useState({ year: '2025', month: '', currency: 'USD' });
  const [billingTrends, setBillingTrends] = useState([]);
  const [serviceDistribution, setServiceDistribution] = useState({});

  const fetchData = async (filters) => {
    const { year, month, currency } = filters;
    let invoicesQuery = collection(db, 'invoices');

    // Appliquer les filtres
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    if (month) {
      const monthIndex = monthNames.indexOf(month) + 1;
      const startDate = new Date(year, monthIndex - 1, 1);
      const endDate = new Date(year, monthIndex, 0);

      invoicesQuery = query(invoicesQuery, where('invoiceInfo.date', '>=', startDate.toISOString().split('T')[0]));
      invoicesQuery = query(invoicesQuery, where('invoiceInfo.date', '<=', endDate.toISOString().split('T')[0]));
    } else {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      invoicesQuery = query(invoicesQuery, where('invoiceInfo.date', '>=', startDate.toISOString().split('T')[0]));
      invoicesQuery = query(invoicesQuery, where('invoiceInfo.date', '<=', endDate.toISOString().split('T')[0]));
    }

    invoicesQuery = query(invoicesQuery, where('invoiceInfo.currency', '==', currency));

    const invoiceSnapshot = await getDocs(invoicesQuery);
    const invoices = invoiceSnapshot.docs.map(doc => doc.data());

    // Traitement des données pour les graphiques
    const billingTrends = invoices.map(invoice => ({ date: invoice.invoiceInfo.date, total: parseFloat(invoice.total) }));
    const serviceDistribution = invoices.reduce((acc, invoice) => {
      invoice.services.forEach(service => {
        acc[service.description] = (acc[service.description] || 0) + parseInt(service.quantity, 10);
      });
      return acc;
    }, {});

    setBillingTrends(billingTrends);
    setServiceDistribution(serviceDistribution);
  };

  useEffect(() => {
    fetchData(filters);
  }, [filters]);
  const lineChartData = {
    labels: billingTrends.map(data => data.date),
    datasets: [{
      label: 'Tendances de facturation',
      data: billingTrends.map(data => data.total),
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
      fill: false,
    }],
  };

  const pieChartData = {
    labels: Object.keys(serviceDistribution),
    datasets: [{
      label: 'Répartition des types de services facturés',
      data: Object.values(serviceDistribution),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    }],
  };

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Graphiques et visualisations
      </Typography>
      <Actions onFilterChange={setFilters} /> {/* Ajout du composant Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <BarChart filters={filters} /> {/* Utilisation du composant BarChart */}
        </Grid>
        <Grid item xs={12}>
          <IconButton>
            <ShowChartIcon />
          </IconButton>
          <Typography variant="h6">Graphiques linéaires pour suivre les tendances de facturation</Typography>
          <div style={{ height: '400px' }}>
            <LineChart filters={filters} /> {/* Utilisation du composant LineChart */}
          </div>
        </Grid>
        <Grid item xs={12}>
          <IconButton>
            <PieChartIcon />
          </IconButton>
          <Typography variant="h6">Diagrammes de répartition des types de services facturés</Typography>
          <div style={{ height: '400px' }}>
            <PieChart filters={filters} /> {/* Utilisation du composant PieChart */}
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GraphComponent;
