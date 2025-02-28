import React from "react";
import styled from "@emotion/styled";

import {
  Grid, // Remplacement de Grid par Grid
  List,
  ListItemText as MuiListItemText,
  ListItemButton as MuiListItemButton,
} from "@mui/material";

const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing(0.25)}
    ${(props) => props.theme.spacing(4)};
  background: ${(props) => props.theme.footer.background};
  position: relative;
`;

const ListItemButton = styled(MuiListItemButton)`
  display: inline-block;
  width: auto;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};

  &,
  &:hover,
  &:active {
    color: #ff0000;
  }
`;

const ListItemText = styled(MuiListItemText)`
  span {
    color: ${(props) => props.theme.footer.color};
  }
`;

function Footer() {
  return (
    <Wrapper>
      <Grid container spacing={0}>
        <Grid
          item
          sx={{ display: { xs: "none", md: "block" } }}
          container
          xs={12}
          md={6}
        >
          <List>
            <ListItemButton component="a" href="#">
              <ListItemText primary="Assistance" />
            </ListItemButton>
            <ListItemButton component="a" href="#">
              <ListItemText primary="Centre d'aide" />
            </ListItemButton>
            <ListItemButton component="a" href="#">
              <ListItemText primary="Confidentialité" />
            </ListItemButton>
            <ListItemButton component="a" href="#">
              <ListItemText primary="Conditions d'utilisation" />
            </ListItemButton>
          </List>
        </Grid>
        <Grid
          item
          container
          justifyContent="flex-end"
          xs={12}
          md={6}
        >
          <List>
            <ListItemButton>
              <ListItemText primary={`© ${new Date().getFullYear()} - Le Rayon Vert`} />
            </ListItemButton>
          </List>
        </Grid>
      </Grid>
    </Wrapper>
  );
}

export default Footer;
