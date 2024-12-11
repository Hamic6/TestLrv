import React from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { green } from "@mui/material/colors";
import {
  Avatar,
  Badge,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  IconButton as MuiIconButton,
} from "@mui/material";
import { spacing } from "@mui/system";
import useAuth from "@/hooks/useAuth";
import { getInitials } from "../../utils/getInitials"; // Assurez-vous que ce chemin est correct

const IconButton = styled(MuiIconButton)`
  ${spacing};

  &:hover {
    background-color: transparent;
  }
`;

const AvatarBadge = styled(Badge)`
  margin-right: ${(props) => props.theme.spacing(1)};
  span {
    background-color: ${() => green[400]};
    border: 2px solid ${(props) => props.theme.palette.background.paper};
    height: 12px;
    width: 12px;
    border-radius: 50%;
  }
`;

function NavbarUserDropdown() {
  const [anchorMenu, setAnchorMenu] = React.useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleMenu = (event) => {
    setAnchorMenu(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorMenu(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/sign-in");
  };

  const handleProfile = () => {
    closeMenu();
    navigate("/profile"); // Redirection vers la page de profil
  };

  const initials = user ? getInitials(user.email) : "";

  return (
    <React.Fragment>
      <Tooltip title="Compte">
        <IconButton
          aria-owns={anchorMenu ? "menu-appbar" : undefined}
          aria-haspopup="true"
          onClick={toggleMenu}
          color="inherit"
          p={0}
          mx={1}
        >
          <AvatarBadge
            overlap="circular"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            variant="dot"
          >
            {!!user ? (
              user.photoURL ? (
                <Avatar alt={user.displayName || user.email} src={user.photoURL} />
              ) : (
                <Avatar>{initials}</Avatar>
              )
            ) : (
              <Avatar alt="Utilisateur">{initials}</Avatar>
            )}
          </AvatarBadge>
        </IconButton>
      </Tooltip>
      <Menu
        id="menu-appbar"
        anchorEl={anchorMenu}
        open={Boolean(anchorMenu)}
        onClose={closeMenu}
      >
        <MenuItem onClick={handleProfile}>Profil</MenuItem>
        <MenuItem onClick={closeMenu}>Paramètres & Confidentialité</MenuItem>
        <Divider />
        <MenuItem onClick={closeMenu}>Aide</MenuItem>
        <MenuItem onClick={handleLogout}>Se déconnecter</MenuItem>
      </Menu>
    </React.Fragment>
  );
}

export default NavbarUserDropdown;
