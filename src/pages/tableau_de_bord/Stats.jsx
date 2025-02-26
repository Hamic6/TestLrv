import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; // Chemin mis à jour pour firebaseConfig
import { collection, getDocs } from 'firebase/firestore';
import { Container, Typography, Grid } from '@mui/material';

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

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Statistiques de facturation
      </Typography>

      <Grid container spacing={3}>
        {/* Total des factures émises */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Total des factures émises :</Typography>
          <Typography>{stats.totalInvoices}</Typography>
        </Grid>

        {/* Montant total facturé */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Montant total facturé :</Typography>
          <Typography>{stats.totalAmountBilled.toFixed(2)} USD</Typography>
        </Grid>

        {/* Factures payées vs en attente */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Factures payées :</Typography>
          <Typography>{stats.paidInvoices}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Factures en attente :</Typography>
          <Typography>{stats.pendingInvoices}</Typography>
        </Grid>

        {/* Montant total des paiements reçus */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Montant total des paiements reçus :</Typography>
          <Typography>{stats.totalPaymentsReceived.toFixed(2)} USD</Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Stats;
