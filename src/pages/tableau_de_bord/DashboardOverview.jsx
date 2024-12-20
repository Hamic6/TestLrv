import React from 'react';
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Grid, Divider as MuiDivider, Typography as MuiTypography } from "@mui/material";
import { spacing } from "@mui/system";
import { green, red } from "@mui/material/colors";
import { useUser } from '@/contexts/UserContext'; // Import du contexte utilisateur

import Actions from './Actions';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import USAMap from './USAMap';
import Stats from './Stats';
import Table from './Table';

const Divider = styled(MuiDivider)(spacing);
const Typography = styled(MuiTypography)(spacing);

const DashboardOverview = () => {
  const { t } = useTranslation();
  const { user } = useUser(); // Utilisation du contexte utilisateur

  return (
    <div>
      <Helmet title="SaaS Dashboard" />
      <Grid container justifyContent="space-between" spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Tableau de bord 
          </Typography>
          <Typography variant="subtitle1">
            {t("Bienvenue !")} {user?.email || "Utilisateur"} {t("")} 👋
          </Typography>
        </Grid>
        <Grid item>
          <Actions />
        </Grid>
      </Grid>
      <Divider my={6} />
      <Grid container spacing={6}>
        <Grid item xs={12} md={6} lg={3}>
          <Stats
            title="Revenu"
            amount="$37.500"
            chip="Mensuelles"
            percentagetext="+14%"
            percentagecolor={green[500]}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Stats
            title="Visitors"
            amount="150.121"
            chip="Annual"
            percentagetext="-12%"
            percentagecolor={red[500]}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Stats
            title="Factures Payés"
            amount="12.432"
            chip="Hebdomadaire"
            percentagetext="+24%"
            percentagecolor={green[500]}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Stats
            title="Factures Impayés"
            amount="22"
            chip="Hebdomadaire"
            percentagetext="-6%"
            percentagecolor={red[500]}
            illustration="/static/img/illustrations/waiting.png"
          />
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12} lg={5}>
          <USAMap />
        </Grid>
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
