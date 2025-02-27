import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { blue } from '@mui/material/colors';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import Actions from './Actions'; // Import du composant Actions

const Stats = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmountBilled: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalPaymentsReceived: 0,
  });

  const fetchStats = async (filters) => {
    try {
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

      let totalInvoices = invoices.length;
      let totalAmountBilled = 0;
      let paidInvoices = 0;
      let pendingInvoices = 0;
      let totalPaymentsReceived = 0;

      invoices.forEach(invoice => {
        totalAmountBilled += parseFloat(invoice.total || 0);
        totalPaymentsReceived += invoice.status === 'Payé' ? parseFloat(invoice.total || 0) : 0;
        paidInvoices += invoice.status === 'Payé' ? 1 : 0;
        pendingInvoices += invoice.status === 'Non payé' ? 1 : 0;
      });

      setStats({
        totalInvoices,
        totalAmountBilled,
        paidInvoices,
        pendingInvoices,
        totalPaymentsReceived,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques :', error);
    }
  };

  useEffect(() => {
    fetchStats({ year: '2025', month: '', currency: 'USD' });
  }, []);

  const statCards = [
    {
      title: "Total des factures émises",
      value: stats.totalInvoices,
      icon: <AssignmentIcon />,
      color: blue[500],
    },
    {
      title: "Montant total facturé",
      value: `${stats.totalAmountBilled.toFixed(2)} USD`,
      icon: <PaymentIcon />,
      color: blue[500],
    },
    {
      title: "Factures payées",
      value: stats.paidInvoices,
      icon: <AccountBalanceWalletIcon />,
      color: blue[500],
    },
    {
      title: "Factures en attente",
      value: stats.pendingInvoices,
      icon: <PendingActionsIcon />,
      color: blue[500],
    },
    {
      title: "Montant total des paiements reçus",
      value: `${stats.totalPaymentsReceived.toFixed(2)} USD`,
      icon: <AccountBalanceWalletIcon />,
      color: blue[500],
    },
  ];

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        <BarChartIcon style={{ marginRight: '10px' }} />
        Statistiques de facturation
      </Typography>
      <Actions onFilterChange={fetchStats} /> {/* Ajout du composant Actions */}
      <Grid container spacing={3}>
      {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar sx={{ bgcolor: card.color }}>
                      {card.icon}
                    </Avatar>
                  </Grid>
                  <Grid item>
                    <Typography variant="h6">{card.title}</Typography>
                    <Typography>{card.value}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Stats;
