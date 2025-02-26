import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { blue } from '@mui/material/colors';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Stats = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmountBilled: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalPaymentsReceived: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const invoicesCollection = collection(db, 'invoices');
        const invoiceSnapshot = await getDocs(invoicesCollection);
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

    fetchStats();
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
        Statistiques de facturation
      </Typography>
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
