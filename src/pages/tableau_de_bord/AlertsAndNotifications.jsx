import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Container, Typography, Grid, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Notifications, Error as AlertIcon, Payment as PaymentIcon, Repeat as RepeatIcon } from '@mui/icons-material';
import Actions from './Actions'; // Import du composant Actions
import notifsImage from './img/notifs.jpg'; // Import de l'image notifs
import { useInvoiceNotifs } from "../../contexts/InvoiceNotifsContext";

const AlertsAndNotifications = () => {
  const [alerts, setAlerts] = useState({
    overdueInvoices: [],
    upcomingPayments: [],
    recurringInvoices: [],
  });

  const { setInvoiceNotifs } = useInvoiceNotifs();

  const formatNotifs = (alerts) => {
    const notifs = [];
    alerts.overdueInvoices.forEach(invoice => {
      notifs.push({
        id: invoice.id,
        type: "overdue",
        title: "Facture en retard",
        description: `${invoice.billTo.company} - ${parseFloat(invoice.total).toFixed(2)} USD`,
        date: invoice.invoiceInfo.dueDate,
        link: `/facturation/pdf/${invoice.id}`, // <-- correspond à ta route
        icon: "alert"
      });
    });
    alerts.upcomingPayments.forEach(invoice => {
      notifs.push({
        id: invoice.id,
        type: "upcoming",
        title: "Paiement à venir",
        description: `${invoice.billTo.company} - ${parseFloat(invoice.total).toFixed(2)} USD`,
        date: invoice.invoiceInfo.dueDate,
        link: `/facturation/pdf/${invoice.id}`,
        icon: "payment"
      });
    });
    alerts.recurringInvoices.forEach(invoice => {
      notifs.push({
        id: invoice.id,
        type: "recurring",
        title: "Rappel facture récurrente",
        description: `${invoice.billTo.company} - ${parseFloat(invoice.total).toFixed(2)} USD`,
        date: invoice.invoiceInfo.date,
        link: `/facturation/pdf/${invoice.id}`,
        icon: "repeat"
      });
    });
    return notifs;
  };

  const fetchAlerts = async (filters) => {
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

      setInvoiceNotifs(formatNotifs({
        overdueInvoices,
        upcomingPayments,
        recurringInvoices,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes et notifications :', error);
    }
  };

  useEffect(() => {
    fetchAlerts({ year: '2025', month: '', currency: 'USD' });
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        <Notifications style={{ marginRight: '10px' }} />
        Alertes et notifications
      </Typography>
      <Actions onFilterChange={fetchAlerts} /> {/* Ajout du composant Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Factures en retard de paiement */}
          <Typography variant="h6">Factures en retard de paiement :</Typography>
          <List>
            {alerts.overdueInvoices.map((invoice, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <AlertIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={`${invoice.billTo.company} - ${parseFloat(invoice.total).toFixed(2)} USD`}
                  secondary={`Date d'échéance : ${invoice.invoiceInfo.dueDate}`}
                />
              </ListItem>
            ))}
          </List>

          {/* Prochains paiements dus */}
          <Typography variant="h6">Prochains paiements dus :</Typography>
          <List>
            {alerts.upcomingPayments.map((invoice, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <PaymentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={`${invoice.billTo.company} - ${parseFloat(invoice.total).toFixed(2)} USD`}
                  secondary={`Date d'échéance : ${invoice.invoiceInfo.dueDate}`}
                />
              </ListItem>
            ))}
          </List>

          {/* Rappels pour envoyer des factures récurrentes */}
          <Typography variant="h6">Rappels pour envoyer des factures récurrentes :</Typography>
          <List>
            {alerts.recurringInvoices.map((invoice, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <RepeatIcon color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary={`${invoice.billTo.company} - ${parseFloat(invoice.total).toFixed(2)} USD`}
                  secondary={`Date d'émission : ${invoice.invoiceInfo.date}`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} md={4}>
          <img src={notifsImage} alt="Notifications" style={{ width: '100%' }} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AlertsAndNotifications;
