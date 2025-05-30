import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import { Bar } from "react-chartjs-2";
import { MoreVertical } from "lucide-react";
import { rgba } from "polished";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Chemin mis à jour pour firebaseConfig
import { Card as MuiCard, CardContent, CardHeader, IconButton } from "@mui/material";
import { spacing } from "@mui/system";

const Card = styled(MuiCard)(spacing);

const ChartWrapper = styled.div`
  height: 320px;
  width: 100%;
`;

const BarChart = ({ theme, filters }) => {
  const [salesData, setSalesData] = useState([]);
  
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

        // Traitement des données pour le graphique à barres
        const salesData = invoices.map(invoice => ({ date: invoice.invoiceInfo.date, amount: parseFloat(invoice.total) }));
        setSalesData(salesData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchData();
  }, [filters]);

  const data = {
    labels: salesData.map(data => data.date),
    datasets: [
      {
        label: "Ventes",
        backgroundColor: theme?.palette?.secondary?.main || '#42A5F5',
        borderColor: theme?.palette?.secondary?.main || '#42A5F5',
        hoverBackgroundColor: theme?.palette?.secondary?.main || '#42A5F5',
        hoverBorderColor: theme?.palette?.secondary?.main || '#42A5F5',
        data: salesData.map(data => data.amount),
        barPercentage: 0.4,
        categoryPercentage: 0.5,
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
      y: {
        grid: {
          display: false,
        },
        stacked: true,
      },
      x: {
        stacked: true,
        grid: {
          color: "transparent",
        },
      },
    },
  };

  return (
    <Card mb={6}>
      <CardHeader
        action={
          <IconButton aria-label="settings" size="large">
            <MoreVertical />
          </IconButton>
        }
        title="Ventes / Revenue"
      />
      <CardContent>
        <ChartWrapper>
          <Bar data={data} options={options} />
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export default withTheme(BarChart);
