import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { blue, green, purple } from '@mui/material/colors';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssessmentIcon from '@mui/icons-material/Assessment'; // Ajout de l'icône Assessment
import Actions from './Actions'; // Import du composant Actions
import kpiImage from './img/kpi.jpg'; // Import de l'image kpi
import kpi2Image from './img/kpi2.jpg'; // Import de l'image kpi2

const PerformanceIndicators = () => {
  const [indicators, setIndicators] = useState({
    recoveryRate: 0,
    averagePaymentDelay: 0,
    averageInvoiceAmount: 0,
  });

  const fetchIndicators = async (filters) => {
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

  useEffect(() => {
    fetchIndicators({ year: '2025', month: '', currency: 'USD' });
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        <AssessmentIcon style={{ marginRight: '10px' }} />
        Indicateurs de performance
      </Typography>
      <Actions onFilterChange={fetchIndicators} /> {/* Ajout du composant Actions */}
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
                <Grid item xs={12}>
                  <img src={kpiImage} alt="KPI" style={{ width: '100%' }} />
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
                <Grid item xs={12}>
                  <img src={kpi2Image} alt="KPI2" style={{ width: '100%' }} />
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
