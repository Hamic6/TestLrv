import React, { useEffect, useState } from 'react';
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Grid, Divider as MuiDivider, Typography as MuiTypography } from "@mui/material";
import { spacing } from "@mui/system";
import { green, red } from "@mui/material/colors";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Actions from './Actions';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import Table from './Table';

const Divider = styled(MuiDivider)(spacing);
const Typography = styled(MuiTypography)(spacing);

const DashboardOverview = () => {
  const { t } = useTranslation();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "Utilisateur");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Helmet title="SaaS Dashboard" />
      <Grid container justifyContent="space-between" spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Tableau de bord 
          </Typography>
          <Typography variant="subtitle1">
            {t("Bienvenue !")} {userName} 👋
          </Typography>
        </Grid>
        <Grid item>
          <Actions />
        </Grid>
      </Grid>
      <Divider my={6} />
      
      <Grid container spacing={6}>
        {/* Supprimer l'utilisation de USAMap car le fichier n'existe plus */}
        {/* <Grid item xs={12} lg={5}>
          <USAMap />
        </Grid> */}
        <Grid item xs={12} lg={7}>
          <BarChart />
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12} lg={4}>
          <DoughnutChart />
        </Grid>
        <Grid item xs={12} lg={8}>
          <Table />
        </Grid>
      </Grid>
    </div>
  );
}

export default DashboardOverview;
