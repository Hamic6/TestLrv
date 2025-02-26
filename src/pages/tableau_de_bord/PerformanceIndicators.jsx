import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; // Chemin mis à jour pour firebaseConfig
import { collection, getDocs } from 'firebase/firestore';
import { Container, Typography, Grid } from '@mui/material';

const PerformanceIndicators = () => {
  const [indicators, setIndicators] = useState({
    recoveryRate: 0,
    averagePaymentDelay: 0,
    averageInvoiceAmount: 0,
  });

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const invoicesCollection = collection(db, 'invoices');
        const invoiceSnapshot = await getDocs(invoicesCollection);
        const invoices = invoiceSnapshot.docs.map(doc => doc.data());

        // Calculer le taux de recouvrement
        const totalInvoices = invoices.length;
        const paidInvoices = invoices.filter(invoice => invoice.status === 'Payé');
        const recoveryRate = (paidInvoices.length / totalInvoices) * 100;

        // Calculer les délais de paiement moyens
        const paymentDelays = invoices
          .filter(invoice => invoice.status === 'Payé')
          .map(invoice => {
            const issueDate = new Date(invoice.invoiceInfo.date);
            const dueDate = new Date(invoice.invoiceInfo.dueDate);
            return (dueDate - issueDate) / (1000 * 60 * 60 * 24); // Convertir en jours
          });
        const averagePaymentDelay = paymentDelays.reduce((a, b) => a + b, 0) / paymentDelays.length;

        // Calculer le montant moyen par facture
        const totalAmountBilled = invoices.reduce((acc, invoice) => acc + parseFloat(invoice.total || 0), 0);
        const averageInvoiceAmount = totalAmountBilled / totalInvoices;

        setIndicators({
          recoveryRate: recoveryRate.toFixed(2),
          averagePaymentDelay: averagePaymentDelay.toFixed(2),
          averageInvoiceAmount: averageInvoiceAmount.toFixed(2),
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des indicateurs de performance :', error);
      }
    };

    fetchIndicators();
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Indicateurs de performance
      </Typography>

      <Grid container spacing={3}>
        {/* Taux de recouvrement */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6">Taux de recouvrement :</Typography>
          <Typography>{indicators.recoveryRate} %</Typography>
        </Grid>

        {/* Délais de paiement moyen */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6">Délais de paiement moyen :</Typography>
          <Typography>{indicators.averagePaymentDelay} jours</Typography>
        </Grid>

        {/* Montant moyen par facture */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6">Montant moyen par facture :</Typography>
          <Typography>{indicators.averageInvoiceAmount} USD</Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PerformanceIndicators;
