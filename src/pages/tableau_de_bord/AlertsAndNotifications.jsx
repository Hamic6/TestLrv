import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; // Chemin mis à jour pour firebaseConfig
import { collection, getDocs } from 'firebase/firestore';
import { Container, Typography, Grid, List, ListItem, ListItemText } from '@mui/material';

const AlertsAndNotifications = () => {
  const [alerts, setAlerts] = useState({
    overdueInvoices: [],
    upcomingPayments: [],
    recurringInvoices: [],
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const invoicesCollection = collection(db, 'invoices');
        const invoiceSnapshot = await getDocs(invoicesCollection);
        const invoices = invoiceSnapshot.docs.map(doc => doc.data());

        const currentDate = new Date();

        // Factures en retard de paiement
        const overdueInvoices = invoices.filter(invoice => {
          const dueDate = new Date(invoice.invoiceInfo.dueDate);
          return invoice.status !== 'Payé' && dueDate < currentDate;
        });

        // Prochains paiements dus
        const upcomingPayments = invoices.filter(invoice => {
          const dueDate = new Date(invoice.invoiceInfo.dueDate);
          return invoice.status !== 'Payé' && dueDate >= currentDate;
        });

        // Rappels pour envoyer des factures récurrentes (supposons que chaque mois il faut envoyer)
        const recurringInvoices = invoices.filter(invoice => {
          const issueDate = new Date(invoice.invoiceInfo.date);
          const nextInvoiceDate = new Date(issueDate);
          nextInvoiceDate.setMonth(issueDate.getMonth() + 1);
          return nextInvoiceDate <= currentDate && invoice.status === 'Payé';
        });

        setAlerts({
          overdueInvoices,
          upcomingPayments,
          recurringInvoices,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des alertes et notifications :', error);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Alertes et notifications
      </Typography>
      <Grid container spacing={3}>
        {/* Factures en retard de paiement */}
        <Grid item xs={12}>
          <Typography variant="h6">Factures en retard de paiement :</Typography>
          <List>
            {alerts.overdueInvoices.map((invoice, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${invoice.billTo.company} - ${parseFloat(invoice.total).toFixed(2)} USD`}
                  secondary={`Date d'échéance : ${invoice.invoiceInfo.dueDate}`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Prochains paiements dus */}
        <Grid item xs={12}>
          <Typography variant="h6">Prochains paiements dus :</Typography>
          <List>
            {alerts.upcomingPayments.map((invoice, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${invoice.billTo.company} - ${parseFloat(invoice.total).toFixed(2)} USD`}
                  secondary={`Date d'échéance : ${invoice.invoiceInfo.dueDate}`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Rappels pour envoyer des factures récurrentes */}
        <Grid item xs={12}>
          <Typography variant="h6">Rappels pour envoyer des factures récurrentes :</Typography>
          <List>
            {alerts.recurringInvoices.map((invoice, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${invoice.billTo.company} - ${parseFloat(invoice.total).toFixed(2)} USD`}
                  secondary={`Date d'émission : ${invoice.invoiceInfo.date}`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AlertsAndNotifications;
