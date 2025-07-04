import React from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import { darken } from "polished";

import { useTranslation } from "react-i18next";

import {
  Grid, // Remplacement de Grid par Grid
  InputBase,
  AppBar as MuiAppBar,
  IconButton as MuiIconButton,
  Toolbar,
} from "@mui/material";

import { Menu as MenuIcon } from "@mui/icons-material";
import logo from "../../vendor/logo.svg"; // Chemin corrigé pour accéder au logo

import NavbarUserDropdown from "./NavbarUserDropdown";
import NavbarNotificationsDropdown from "./NavbarNotificationsDropdown"; // Ajoute ceci

const AppBar = styled(MuiAppBar)`
  background: ${(props) => props.theme.header.background};
  color: ${(props) => props.theme.header.color};
`;

const IconButton = styled(MuiIconButton)`
  svg {
    width: 22px;
    height: 22px;
  }
`;

const Search = styled.div`
  border-radius: 2px;
  background-color: ${(props) => props.theme.header.background};
  display: none;
  position: relative;
  width: 100%;

  &:hover {
    background-color: ${(props) => darken(0.05, props.theme.header.background)};
  }

  ${(props) => props.theme.breakpoints.up("md")} {
    display: block;
  }
`;

const SearchIconWrapper = styled.div`
  width: 50px;
  height: 100%;
  position: absolute;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 22px;
    height: 22px;
  }
`;

const Input = styled(InputBase)`
  color: inherit;
  width: 100%;

  > input {
    color: ${(props) => props.theme.header.search.color};
    padding-top: ${(props) => props.theme.spacing(2.5)};
    padding-right: ${(props) => props.theme.spacing(2.5)};
    padding-bottom: ${(props) => props.theme.spacing(2.5)};
    padding-left: ${(props) => props.theme.spacing(12)};
    width: 160px;
  }
`;

const Logo = styled.img`
  height: 40px; // Ajuste la taille du logo selon tes besoins
  margin-right: 20px;
`;

const Navbar = ({ onDrawerToggle }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Grid container alignItems="center" style={{ width: "100%" }}>
            <Grid item sx={{ display: { xs: "block", md: "none" } }}>
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={onDrawerToggle}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <Logo src={logo} alt="Logo de Le Rayon Vert" />
            </Grid>
            <Grid item xs />
            <Grid item>
              <NavbarNotificationsDropdown /> {/* Ajoute la cloche de notifications ici */}
            </Grid>
            <Grid item>
              <NavbarUserDropdown />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default withTheme(Navbar);
