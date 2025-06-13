import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import {
  Avatar as MuiAvatar,
  Badge,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover as MuiPopover,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { Bell, AlertTriangle } from "lucide-react";
import PaymentIcon from "@mui/icons-material/Payment";
import RepeatIcon from "@mui/icons-material/Repeat";
import { useStockAlert } from "../../contexts/StockAlertContext";
import { useInvoiceNotifs } from "../../contexts/InvoiceNotifsContext";

const Popover = styled(MuiPopover)`
  .MuiPaper-root {
    width: 300px;
    ${(props) => props.theme.shadows[1]};
    border: 1px solid ${(props) => props.theme.palette.divider};
  }
`;

const Indicator = styled(Badge)`
  .MuiBadge-badge {
    background: ${(props) =>
      props.$critical
        ? props.theme.palette.error.main
        : props.theme.header.indicator.background};
    color: ${(props) => props.theme.palette.common.white};
  }
`;

const Avatar = styled(MuiAvatar)`
  background: ${(props) => props.theme.palette.primary.main};
`;

const NotificationHeader = styled(Box)`
  text-align: center;
  border-bottom: 1px solid ${(props) => props.theme.palette.divider};
`;

function Notification({ title, description, Icon, to = "#" }) {
  return (
    <ListItem divider component={Link} to={to}>
      <ListItemAvatar>
        <Avatar>
          <SvgIcon fontSize="small">
            <Icon />
          </SvgIcon>
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        primaryTypographyProps={{
          variant: "subtitle2",
          color: "textPrimary",
        }}
        secondary={description}
      />
    </ListItem>
  );
}

function NavbarNotificationsDropdown() {
  const ref = useRef(null);
  const [isOpen, setOpen] = useState(false);

  const { stockAlertArticles } = useStockAlert();
  const { invoiceNotifs } = useInvoiceNotifs();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Additionne toutes les notifications
  const totalNotifications = stockAlertArticles.length + invoiceNotifs.length;

  return (
    <React.Fragment>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          ref={ref}
          onClick={handleOpen}
          size="large"
          aria-label="Ouvrir les notifications"
        >
          <Indicator
            badgeContent={totalNotifications}
            $critical={stockAlertArticles.length > 0}
          >
            <Bell />
          </Indicator>
        </IconButton>
      </Tooltip>
      <Popover
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
      >
        <NotificationHeader p={2}>
          <Typography variant="subtitle2" color="textPrimary">
            {totalNotifications} Notification{totalNotifications > 1 ? "s" : ""}
          </Typography>
        </NotificationHeader>
        <React.Fragment>
          <List disablePadding>
            {/* Notifications stock */}
            {stockAlertArticles.map((article) => (
              <Notification
                key={article.id}
                title={`Stock critique: ${article.name}`}
                description={`Stock: ${article.stock ?? article.quantity ?? 0} / Seuil: ${article.seuil}`}
                Icon={AlertTriangle}
                to="/stock/management"
              />
            ))}
            {/* Notifications factures */}
            {invoiceNotifs.map((notif) => (
              <Notification
                key={notif.id}
                title={notif.title}
                description={notif.description}
                Icon={
                  notif.icon === "alert"
                    ? AlertTriangle
                    : notif.icon === "payment"
                    ? PaymentIcon
                    : RepeatIcon
                }
                to={`/facturation/details-facture/${notif.id}`}
              />
            ))}
            {/* Si aucune notification */}
            {stockAlertArticles.length === 0 && invoiceNotifs.length === 0 && (
              <ListItem>
                <ListItemText primary="Aucune notification" />
              </ListItem>
            )}
          </List>
          <Box p={1} display="flex" justifyContent="center">
            <Button size="small" component={Link} to="/stock/management">
              Voir toutes les notifications
            </Button>
          </Box>
        </React.Fragment>
      </Popover>
    </React.Fragment>
  );
}

export default NavbarNotificationsDropdown;
