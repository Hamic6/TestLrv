import React from "react";
import { Helmet } from "react-helmet-async";

import { Typography } from "@mui/material";

import SignUpComponent from "@/components/auth/SignUp";

function SignUp() {
  return (
    <React.Fragment>
      <Helmet title="Sign Up" />

      <Typography component="h1" variant="h3" align="center" gutterBottom>
        S'inscrire
      </Typography>
      <Typography component="h2" variant="subtitle1" align="center">
        Démarer l'inscription des utilisateurs ici
      </Typography>

      <SignUpComponent />
    </React.Fragment>
  );
}

export default SignUp;
