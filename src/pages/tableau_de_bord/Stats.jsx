import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  Container, Typography, Grid, Card, CardContent, Avatar, Box, Switch, FormControlLabel, useMediaQuery
} from '@mui/material';
import { blue } from '@mui/material/colors';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import Actions from './Actions';
import stats3 from './img/stats3.png';
import { useTheme } from '@mui/material/styles';

const Stats = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmountBilled: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalPaymentsReceived: 0,
    totalAmountBilledNoVAT: 0,
    totalPaymentsReceivedNoVAT: 0,
  });
  const [filters, setFilters] = useState({ year: '2025', month: '', currency: 'USD' });
  const [showVAT, setShowVAT] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchStats = async (filters) => {
    try {
      const { year, month, currency } = filters;
      let invoicesQuery = collection(db, 'invoices');

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
      let totalAmountBilledNoVAT = 0;
      let paidInvoices = 0;
      let pendingInvoices = 0;
      let totalPaymentsReceived = 0;
      let totalPaymentsReceivedNoVAT = 0;

      invoices.forEach(invoice => {
        const total = parseFloat(invoice.total || 0);
        const subtotal = parseFloat(invoice.subtotal || 0);
        const isPaid = invoice.status === 'Payé';

        totalAmountBilled += total;
        totalAmountBilledNoVAT += subtotal;
        if (isPaid) {
          totalPaymentsReceived += total;
          totalPaymentsReceivedNoVAT += subtotal;
        }
        paidInvoices += isPaid ? 1 : 0;
        pendingInvoices += invoice.status === 'Non payé' ? 1 : 0;
      });

      setStats({
        totalInvoices,
        totalAmountBilled,
        paidInvoices,
        pendingInvoices,
        totalPaymentsReceived,
        totalAmountBilledNoVAT,
        totalPaymentsReceivedNoVAT,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques :', error);
    }
  };

  useEffect(() => {
    fetchStats(filters);
    // eslint-disable-next-line
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchStats(newFilters);
  };

  const handleVATSwitch = (event) => {
    setShowVAT(event.target.checked);
  };

  const currency = filters.currency || 'USD';

  // Pour mobile, on affiche les cards en colonne, pour desktop en grille
  const statCards = [
    {
      title: "Total des factures émises",
      value: stats.totalInvoices,
      icon: <AssignmentIcon />,
      color: blue[500],
    },
    {
      title: showVAT ? "Montant total facturé (TTC)" : "Montant total facturé (HT)",
      value: `${showVAT ? stats.totalAmountBilled.toLocaleString(undefined, { minimumFractionDigits: 2 }) : stats.totalAmountBilledNoVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`,
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
      title: showVAT ? "Montant total des paiements reçus (TTC)" : "Montant total des paiements reçus (HT)",
      value: `${showVAT ? stats.totalPaymentsReceived.toLocaleString(undefined, { minimumFractionDigits: 2 }) : stats.totalPaymentsReceivedNoVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`,
      icon: <AccountBalanceWalletIcon />,
      color: blue[500],
    },
  ];

  return (
    <Container maxWidth="md" sx={{ px: isMobile ? 0.5 : 2, py: isMobile ? 1 : 3 }}>
      <Typography variant={isMobile ? "h6" : "h4"} component="h2" gutterBottom sx={{ textAlign: isMobile ? "center" : "left" }}>
        <BarChartIcon style={{ marginRight: '10px', fontSize: isMobile ? 24 : 32 }} />
        Statistiques de facturation
      </Typography>
      <Actions onFilterChange={handleFilterChange} />
      <Box sx={{ mb: 2, display: "flex", justifyContent: isMobile ? "center" : "flex-start" }}>
        <FormControlLabel
          control={
            <Switch
              checked={showVAT}
              onChange={handleVATSwitch}
              color="primary"
              size={isMobile ? "small" : "medium"}
            />
          }
          label={showVAT ? "Avec TVA" : "Sans TVA"}
          sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
        />
      </Box>
      <Grid container spacing={isMobile ? 1 : 3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={index === 0 ? 12 : 6} key={index}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                px: isMobile ? 1 : 2,
                py: isMobile ? 1 : 2,
                mb: isMobile ? 1 : 0,
                boxShadow: isMobile ? 1 : 3,
                borderRadius: 2,
              }}
            >
              <Avatar sx={{ bgcolor: card.color, mr: 2, width: isMobile ? 32 : 48, height: isMobile ? 32 : 48 }}>
                {card.icon}
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600 }}>
                  {card.title}
                </Typography>
                <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontWeight: 500 }}>
                  {card.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
        {!isMobile && (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ width: '100%', mt: 4 }}>
              <img src={stats3} alt="Statistique 3" style={{ width: '100%', borderRadius: 8 }} />
            </Box>
          </Grid>
        )}
      </Grid>
      {isMobile && (
        <Box sx={{ width: '100%', mt: 2, display: "flex", justifyContent: "center" }}>
          <img src={stats3} alt="Statistique 3" style={{ width: '90%', borderRadius: 8 }} />
        </Box>
      )}
    </Container>
  );
};

export default Stats;
