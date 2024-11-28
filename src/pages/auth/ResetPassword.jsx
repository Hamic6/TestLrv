import React from "react";
import { Helmet } from "react-helmet-async";

import { Typography } from "@mui/material";

import ResetPasswordComponent from "@/components/auth/ResetPassword";

function ResetPassword() {
  return (
    <React.Fragment>
      <Helmet title="Reset Password" />

      <Typography component="h1" variant="h3" align="center" gutterBottom>
        Reinitialiser votre mot de passe
      </Typography>
      <Typography component="h2" variant="subtitle1" align="center">
        Entrez votre email pour réinitialiser votre mot de passe
      </Typography>

      <ResetPasswordComponent />
    </React.Fragment>
  );
}

export default ResetPassword;
