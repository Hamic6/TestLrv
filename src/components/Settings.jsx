import React from 'react';
import { Grid, Typography, Paper } from '@mui/material'; // Remplace Grid2 par Grid
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const Settings = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={3}> {/* Utilise Grid au lieu de Grid2 */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6">
              Paramètres
            </Typography>
            {/* Contenu des paramètres */}
          </Paper>
        </Grid>
        {/* Autres éléments de la grille */}
      </Grid>
    </div>
  );
};

export default Settings;
