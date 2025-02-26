import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { blue, green, purple } from '@mui/material/colors';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar sx={{ bgcolor: blue[500] }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">Taux de recouvrement</Typography>
                  <Typography>{indicators.recoveryRate} %</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar sx={{ bgcolor: green[500] }}>
                    <AccessTimeIcon />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">Délais de paiement moyen</Typography>
                  <Typography>{indicators.averagePaymentDelay} jours</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar sx={{ bgcolor: purple[500] }}>
                    <AttachMoneyIcon />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">Montant moyen par facture</Typography>
                  <Typography>{indicators.averageInvoiceAmount} USD</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PerformanceIndicators;
