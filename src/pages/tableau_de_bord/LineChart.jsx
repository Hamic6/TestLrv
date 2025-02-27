import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import { Line } from "react-chartjs-2";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Chemin mis à jour pour firebaseConfig

import { CardContent, Card as MuiCard, Typography } from "@mui/material";
import { spacing } from "@mui/system";

const Card = styled(MuiCard)(spacing);

const Spacer = styled.div(spacing);

const ChartWrapper = styled.div`
  height: 300px;
`;

const LineChart = ({ theme, filters }) => {
  const [billingTrends, setBillingTrends] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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

        // Traitement des données pour le graphique linéaire
        const billingTrends = invoices.map(invoice => ({ date: invoice.invoiceInfo.date, total: parseFloat(invoice.total) }));
        setBillingTrends(billingTrends);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchData();
  }, [filters]);

  const data = {
    labels: billingTrends.map(data => data.date),
    datasets: [
      {
        label: "Tendances de facturation",
        fill: true,
        backgroundColor: "transparent",
        borderColor: theme.palette.secondary.main,
        tension: 0.4,
        data: billingTrends.map(data => data.total),
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
      },
      y: {
        display: true,
        borderDash: [5, 5],
        grid: {
          color: "rgba(0,0,0,0)",
        },
      },
    },
  };

  return (
    <Card mb={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Graphique linéaire des tendances de facturation
        </Typography>
        <Typography variant="body2" gutterBottom>
          Suivez les tendances de facturation au fil du temps.
        </Typography>

        <Spacer mb={6} />
        <ChartWrapper>
          <Line data={data} options={options} />
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export default withTheme(LineChart);
