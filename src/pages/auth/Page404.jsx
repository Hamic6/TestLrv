import React from "react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { Button as MuiButton, Typography } from "@mui/material";
import { spacing } from "@mui/system";

const Button = styled(MuiButton)(spacing);

const Wrapper = styled.div`
  text-align: center;
`;

function Page404() {
  return (
    <Wrapper>
      <Helmet title="404 Error" />
      <Typography component="h1" variant="h1" align="center" gutterBottom>
        404
      </Typography>
      <Typography component="h2" variant="h4" align="center" gutterBottom>
        Oups !! Page non disponible
      </Typography>
      <Typography
        component="h2"
        variant="subtitle1"
        align="center"
        gutterBottom
      >
        La page que vous recherché a peut-etre été supprimé
      </Typography>

      <Button
        component={Link}
        to="/"
        variant="contained"
        color="secondary"
        mt={2}
      >
        Retournez sur le site web
      </Button>
    </Wrapper>
  );
}

export default Page404;