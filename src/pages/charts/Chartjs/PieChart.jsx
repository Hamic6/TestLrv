import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import { Pie } from "react-chartjs-2";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Chemin mis à jour pour firebaseConfig

import { CardContent, Card as MuiCard, Typography } from "@mui/material";
import { spacing } from "@mui/system";
import { orange, red } from "@mui/material/colors";

const Card = styled(MuiCard)(spacing);

const Spacer = styled.div(spacing);

const ChartWrapper = styled.div`
  height: 300px;
`;

const PieChart = ({ theme, filters }) => {
  const [serviceDistribution, setServiceDistribution] = useState({});

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

        // Traitement des données pour le graphique à secteurs
        const serviceDistribution = invoices.reduce((acc, invoice) => {
          invoice.services.forEach(service => {
            acc[service.description] = (acc[service.description] || 0) + parseInt(service.quantity, 10);
          });
          return acc;
        }, {});

        setServiceDistribution(serviceDistribution);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchData();
  }, [filters]);

  const data = {
    labels: Object.keys(serviceDistribution),
    datasets: [
      {
        data: Object.values(serviceDistribution),
        backgroundColor: [
          theme.palette.secondary.main,
          orange[500],
          red[500],
          theme.palette.grey[300],
        ],
        borderColor: "transparent",
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
  };

  return (
    <Card mb={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Diagramme de répartition des types de services facturés
        </Typography>
        <Typography variant="body2" gutterBottom>
          Les diagrammes à secteurs sont excellents pour montrer les proportions relationnelles entre les données.
        </Typography>

        <Spacer mb={6} />
        <ChartWrapper>
          <Pie data={data} options={options} />
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export default withTheme(PieChart);
