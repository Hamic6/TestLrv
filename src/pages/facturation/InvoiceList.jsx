import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  Checkbox,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Button,
  Box,
  Stack,
  useMediaQuery,
  TextField
} from '@mui/material';
import { useTheme } from "@mui/material/styles";
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import WarningIcon from '@mui/icons-material/Warning';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Invoice1PDF from './Invoice1PDF';
import Filters from './Filters';
import { useNavigate } from "react-router-dom";
import InvoicePreview from "./InvoicePreview"; // Ajoute l'import
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';

const statusIcons = {
  'Payé': <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />,
  'Non payé': <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />,
  'Envoyé': <HourglassEmptyIcon fontSize="small" sx={{ mr: 0.5 }} />,
  'Vide': <RemoveCircleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />,
  'Erreur': <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />,
};

const statusColors = {
  'Payé': 'success',
  'Envoyé': 'warning',
  'Non payé': 'error',
  'Vide': 'default',
  'Erreur': 'secondary',
};

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuInvoiceId, setActionMenuInvoiceId] = useState(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "invoices"));
        const invoicesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Tri des factures par numéro de facture en ordre décroissant
        const sortedInvoices = invoicesList.sort((a, b) => {
          const numA = parseInt(a.invoiceInfo?.number || 0, 10);
          const numB = parseInt(b.invoiceInfo?.number || 0, 10);
          return numB - numA; // Tri décroissant
        });

        setInvoices(sortedInvoices);
        setFilteredInvoices(sortedInvoices.filter(invoice => !invoice.archived));
      } catch (error) {
        console.error("Erreur lors de la récupération des factures :", error);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    handleApplyFilters(filters);
  }, [filters]);

  // Pour le menu de statut
  const handleClickChip = (event, id) => {
    setAnchorEl(event.currentTarget);
    setCurrentInvoiceId(id);
    // Préremplir le statut et la date si déjà "Payé"
    const invoice = invoices.find(inv => inv.id === id);
    setSelectedStatus(invoice?.status || '');
    setPaymentDate(invoice?.paymentDate || '');
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentInvoiceId(null);
  };

  const handleMenuItemClick = async (status) => {
    setSelectedStatus(status);
    if (status === 'Payé') {
      // On attend que l'utilisateur saisisse la date et valide
      return;
    }
    if (currentInvoiceId) {
      await handleStatusChange(currentInvoiceId, status);
    }
    setPaymentDate('');
    setSelectedStatus('');
    handleCloseMenu();
  };

  const handleValidatePayed = async () => {
    if (currentInvoiceId && paymentDate) {
      await handleStatusChange(currentInvoiceId, 'Payé', paymentDate);
      setPaymentDate('');
      setSelectedStatus('');
      handleCloseMenu();
    }
  };

  const handleStatusChange = async (id, status, paymentDate = null) => {
    try {
      const invoiceDoc = doc(db, "invoices", id);
      const updateData = paymentDate ? { status, paymentDate } : { status };
      await updateDoc(invoiceDoc, updateData);
      setInvoices(invoices.map(invoice => invoice.id === id ? { ...invoice, status, paymentDate } : invoice));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la facture :", error);
    }
  };

  // Pour le menu d'actions sur chaque ligne
  const handleActionMenuOpen = (event, id) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActionMenuInvoiceId(id);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuInvoiceId(null);
  };

  const handleArchive = async (id) => {
    try {
      const invoiceDoc = doc(db, "invoices", id);
      await updateDoc(invoiceDoc, { archived: true });
      setInvoices(invoices.map(invoice => invoice.id === id ? { ...invoice, archived: true } : invoice));
      setFilteredInvoices(invoices.filter(invoice => !invoice.archived));
    } catch (error) {
      console.error("Erreur lors de l'archivage de la facture :", error);
    }
  };

  const handleUnarchive = async (id) => {
    try {
      const invoiceDoc = doc(db, "invoices", id);
      await updateDoc(invoiceDoc, { archived: false });
      setInvoices(invoices.map(invoice => invoice.id === id ? { ...invoice, archived: false } : invoice));
      setFilteredInvoices(invoices.filter(invoice => !invoice.archived));
    } catch (error) {
      console.error("Erreur lors du désarchivage de la facture :", error);
    }
  };

  const handleApplyFilters = (updatedFilters) => {
    setFilters(updatedFilters);

    const { client, year, month, status, currency, service, archived, invoiceNumber } = updatedFilters;

    const filtered = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoiceInfo?.date);
      const matchesClient = client ? invoice.billTo?.company?.toLowerCase().includes(client.toLowerCase()) : true;
      const matchesYear = year ? invoiceDate.getFullYear() === parseInt(year) : true;
      const matchesMonth = month ? invoiceDate.getMonth() + 1 === parseInt(month) : true;
      const matchesStatus = status ? invoice.status === status : true;
      const matchesNumber = invoiceNumber ? (invoice.invoiceInfo?.number || '').toLowerCase().includes(invoiceNumber.toLowerCase()) : true;
      const matchesCurrency = currency ? invoice.invoiceInfo?.currency?.toLowerCase() === currency.toLowerCase() : true;
      const matchesService = service ? invoice.services?.some(s => s.description?.toLowerCase().includes(service.toLowerCase())) : true;
      const matchesArchived = archived === 'toutes' ? true : archived === 'oui' ? invoice.archived : !invoice.archived;

      return matchesClient && matchesYear && matchesMonth && matchesStatus && matchesNumber && matchesCurrency && matchesService && matchesArchived;
    });

    setFilteredInvoices(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredInvoices.map((invoice) => invoice.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const exportToCSV = () => {
    const headers = ["Numéro de Facture", "Date", "Client", "Total", "Devise", "Services", "Statut"];
    const rows = (selected.length ? selected : filteredInvoices).map(id => {
      const invoice = invoices.find(inv => inv.id === id);
      return [
        invoice.invoiceInfo?.number || '',
        invoice.invoiceInfo?.date || '',
        invoice.billTo?.company || '',
        invoice.total || '',
        invoice.invoiceInfo?.currency || '',
        invoice.services?.map(service => `${service.description} - ${service.libelle} - ${service.quantity} - ${service.unitPrice} - ${service.amount}`).join(', ') || '',
        invoice.status || ''
      ];
    });

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPreview = (invoice) => {
    setPreviewInvoice(invoice);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewInvoice(null);
  };

  return (
    <div>
      <Typography variant={isMobile ? "h6" : "h4"} gutterBottom>
        Liste des Factures
      </Typography>
      <Filters onApplyFilters={handleApplyFilters} />
      <TableContainer
        component={Paper}
        style={{
          marginTop: '20px',
          maxWidth: isMobile ? "100vw" : "900px",
          marginLeft: 'auto',
          marginRight: 'auto',
          overflowX: "auto"
        }}
      >
        <Table size="small"> {/* Toujours compact */}
          <TableHead>
            <TableRow sx={{ minHeight: 40 }}> {/* Hauteur minimale uniforme */}
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < filteredInvoices.length}
                  checked={filteredInvoices.length > 0 && selected.length === filteredInvoices.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all invoices' }}
                />
              </TableCell>
              <TableCell>Numéro</TableCell>
              <TableCell>Client</TableCell>
              {!isMobile && <TableCell>Date</TableCell>}
              {!isMobile && <TableCell>Total</TableCell>}
              {!isMobile && <TableCell>Devise</TableCell>}
              {!isMobile && <TableCell>Services</TableCell>}
              <TableCell>Statut</TableCell>
              {/* Supprimé la colonne Date paiement */}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((invoice, index) => {
                const isItemSelected = isSelected(invoice.id);
                const labelId = `enhanced-table-checkbox-${index}`;
                // Menu contextuel pour actions
                const isActionMenuOpen = actionMenuAnchor && actionMenuInvoiceId === invoice.id;
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={invoice.id}
                    selected={isItemSelected}
                    onClick={(event) => handleClick(event, invoice.id)}
                    sx={{ minHeight: 40 }} // Hauteur minimale uniforme
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row">
                      {invoice.invoiceInfo?.number || ''}
                    </TableCell>
                    {/* Client + infos importantes sur mobile */}
                    <TableCell>
                      <Stack direction="column" spacing={0.5}>
                        <Typography variant="body2" fontWeight={500}>
                          {invoice.billTo?.company || ''}
                        </Typography>
                        {isMobile && (
                          <>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {invoice.invoiceInfo?.date || ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {invoice.invoiceInfo?.currency || ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              Total : {invoice.total}
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                    {/* Desktop only columns */}
                    {!isMobile && <TableCell>{invoice.invoiceInfo?.date || ''}</TableCell>}
                    {!isMobile && (
                      <TableCell
                        sx={{
                          maxWidth: 90,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                        }}
                        title={invoice.total}
                      >
                        {Number(invoice.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    )}
                    {!isMobile && <TableCell>{invoice.invoiceInfo?.currency || ''}</TableCell>}
                    {!isMobile && (
                      <TableCell sx={{ minWidth: 180, maxWidth: 220, width: 200 }}>
                        <Stack direction="column" spacing={0.5}>
                          {invoice.services && Array.isArray(invoice.services) ? (
                            <>
                              {invoice.services.slice(0, 2).map((service, idx) => (
                                <Chip
                                  key={idx}
                                  label={service.description}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mb: 0.5, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}
                                />
                              ))}
                              {invoice.services.length > 2 && (
                                <Chip
                                  label={`+${invoice.services.length - 2} autre(s)`}
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                  sx={{ mb: 0.5, maxWidth: 180 }}
                                />
                              )}
                            </>
                          ) : ''}
                        </Stack>
                      </TableCell>
                    )}
                    {/* Statut */}
                    <TableCell>
                      <Box>
                        <Chip
                          icon={statusIcons[invoice.status] || null}
                          label={invoice.status}
                          color={statusColors[invoice.status] || 'default'}
                          onClick={(event) => handleClickChip(event, invoice.id)}
                          clickable
                          size="small" // Réduit la taille du Chip
                          sx={{
                            fontWeight: 600,
                            fontSize: 12,
                            minWidth: 60, // Réduit la largeur minimale
                            px: 1,        // Réduit le padding horizontal
                            transition: 'box-shadow 0.2s, background 0.2s',
                            '&:hover': {
                              boxShadow: 2,
                              backgroundColor: (theme) => {
                                const color = statusColors[invoice.status] || 'primary';
                                return theme.palette[color] && theme.palette[color].light
                                  ? theme.palette[color].light
                                  : theme.palette.primary.light;
                              },
                            },
                          }}
                        />
                        {invoice.status === 'Payé' && invoice.paymentDate && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {invoice.paymentDate}
                          </Typography>
                        )}
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && currentInvoiceId === invoice.id} onClose={handleCloseMenu}>
                          <MenuItem onClick={() => handleMenuItemClick('Payé')}>
                            Payé
                          </MenuItem>
                          <MenuItem onClick={() => handleMenuItemClick('Envoyé')}>Envoyé</MenuItem>
                          <MenuItem onClick={() => handleMenuItemClick('Non payé')}>Non payé</MenuItem>
                          <MenuItem onClick={() => handleMenuItemClick('Vide')}>Vide</MenuItem>
                          <MenuItem onClick={() => handleMenuItemClick('Erreur')}>Erreur</MenuItem>
                          {selectedStatus === 'Payé' && (
                            <Box px={2} py={1}>
                              <TextField
                                label="Date du paiement"
                                type="date"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={paymentDate}
                                onChange={e => setPaymentDate(e.target.value)}
                                fullWidth
                              />
                              <Button
                                variant="contained"
                                color="success"
                                sx={{ mt: 1, minWidth: 80, px: 1 }} // Réduit la largeur du bouton Valider
                                onClick={handleValidatePayed}
                                disabled={!paymentDate}
                              >
                                Valider
                              </Button>
                            </Box>
                          )}
                        </Menu>
                      </Box>
                    </TableCell>
                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton
                        aria-label="actions"
                        onClick={(e) => handleActionMenuOpen(e, invoice.id)}
                        size={isMobile ? "small" : "large"}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={actionMenuAnchor}
                        open={isActionMenuOpen}
                        onClose={handleActionMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem onClick={() => { handleOpenPreview(invoice); handleActionMenuClose(); }}>
                          <PreviewOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                          Aperçu
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            invoice.archived ? handleUnarchive(invoice.id) : handleArchive(invoice.id);
                            handleActionMenuClose();
                          }}
                        >
                          {invoice.archived ? (
                            <>
                              <UnarchiveIcon fontSize="small" sx={{ mr: 1 }} />
                              Désarchiver
                            </>
                          ) : (
                            <>
                              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
                              Archiver
                            </>
                          )}
                        </MenuItem>
                        <MenuItem>
                          <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} />
                          <PDFDownloadLink document={<Invoice1PDF invoice={invoice} />} fileName={`invoice_${invoice.invoiceInfo?.number}.pdf`}>
                            {({ loading }) => loading ? '...' : 'PDF'}
                          </PDFDownloadLink>
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2} mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={exportToCSV}
        >
          Exporter en CSV
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/facturation/import-invoices')}
        >
          Importer des factures
        </Button>
      </Box>
      <InvoicePreview
        open={previewOpen}
        onClose={handleClosePreview}
        invoice={previewInvoice}
      />
    </div>
  );
};

export default InvoiceList;
