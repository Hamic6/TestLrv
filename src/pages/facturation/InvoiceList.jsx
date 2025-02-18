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
  FormControl,
  InputLabel,
  Select,
  TextField
} from '@mui/material';
import { Archive as ArchiveIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CSVLink } from 'react-csv'; // Importation de CSVLink
import Invoice1PDF from './Invoice1PDF';
import Filters from './Filters';
import { useNavigate } from "react-router-dom"; // Importation de useNavigate

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const navigate = useNavigate(); // Utilisation de useNavigate

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "invoices"));
        const invoicesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Factures récupérées:", invoicesList); // Journalisation des factures récupérées
        const sortedInvoices = invoicesList.sort((a, b) => new Date(b.invoiceInfo.date) - new Date(a.invoiceInfo.date));
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

  const handleClickChip = (event, id) => {
    setAnchorEl(event.currentTarget);
    setCurrentInvoiceId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentInvoiceId(null);
  };

  const handleMenuItemClick = async (status) => {
    if (currentInvoiceId) {
      await handleStatusChange(currentInvoiceId, status);
    }
    handleCloseMenu();
  };

  const handleStatusChange = async (id, status) => {
    try {
      const invoiceDoc = doc(db, "invoices", id);
      await updateDoc(invoiceDoc, { status });
      setInvoices(invoices.map(invoice => invoice.id === id ? { ...invoice, status } : invoice));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la facture :", error);
    }
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

    const { client, year, month, status, amountRange, currency, service, archived } = updatedFilters;

    const filtered = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoiceInfo?.date);
      const matchesClient = client ? invoice.billTo?.company?.toLowerCase().includes(client.toLowerCase()) : true;
      const matchesYear = year ? invoiceDate.getFullYear() === parseInt(year) : true;
      const matchesMonth = month ? invoiceDate.getMonth() + 1 === parseInt(month) : true;
      const matchesStatus = status ? invoice.status === status : true;
      const matchesAmount = (amountRange.min ? invoice.total >= parseFloat(amountRange.min) : true) &&
                            (amountRange.max ? invoice.total <= parseFloat(amountRange.max) : true);
      const matchesCurrency = currency ? invoice.invoiceInfo?.currency?.toLowerCase() === currency.toLowerCase() : true;
      const matchesService = service ? invoice.services?.some(s => s.description?.toLowerCase().includes(service.toLowerCase())) : true;
      const matchesArchived = archived === 'toutes' ? true : archived === 'oui' ? invoice.archived : !invoice.archived;

      return matchesClient && matchesYear && matchesMonth && matchesStatus && matchesAmount && matchesCurrency && matchesService && matchesArchived;
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

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Liste des Factures
      </Typography>
      <Filters onApplyFilters={handleApplyFilters} />
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < filteredInvoices.length}
                  checked={filteredInvoices.length > 0 && selected.length === filteredInvoices.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all invoices' }}
                />
              </TableCell>
              <TableCell>Numéro de Facture</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Devise</TableCell>
              <TableCell>Services</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((invoice, index) => {
                const isItemSelected = isSelected(invoice.id);
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={invoice.id}
                    selected={isItemSelected}
                    onClick={(event) => handleClick(event, invoice.id)}
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
                    <TableCell>{invoice.invoiceInfo?.date || ''}</TableCell>
                    <TableCell>{invoice.billTo?.company || ''}</TableCell>
                    <TableCell>{invoice.total}</TableCell>
                    <TableCell>{invoice.invoiceInfo?.currency || ''}</TableCell>
                    <TableCell>
                      {invoice.services && Array.isArray(invoice.services) ? invoice.services.map((service, index) => (
                        <div key={index}>
                          {service.description} - {service.libelle} - {service.quantity} - {service.unitPrice} - {service.amount}
                        </div>
                      )) : ''}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status}
                        color={invoice.status === 'Payé' ? 'success' : invoice.status === 'Envoyé' ? 'warning' : invoice.status === 'Non payé' ? 'error' : 'default'}
                        onClick={(event) => handleClickChip(event, invoice.id)}
                        clickable
                      />
                      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                        <MenuItem onClick={() => handleMenuItemClick('Payé')}>Payé</MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick('Envoyé')}>Envoyé</MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick('Non payé')}>Non payé</MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick('Vide')}>Vide</MenuItem>
                      </Menu>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="archive"
                        onClick={() => { invoice.archived ? handleUnarchive(invoice.id) : handleArchive(invoice.id) }}
                        size="large"
                        style={{ color: invoice.archived ? 'green' : 'gray' }} // Changement de couleur basé sur l'état
                      >
                        <ArchiveIcon />
                      </IconButton>
                      <PDFDownloadLink document={<Invoice1PDF invoice={invoice} />} fileName={`invoice_${invoice.invoiceInfo?.number}.pdf`}>
                        {({ loading }) => (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PdfIcon />}
                          >
                            {loading ? 'Chargement...' : 'Télécharger PDF'}
                          </Button>
                        )}
                      </PDFDownloadLink>
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
      <Button
        variant="contained"
        color="primary"
        onClick={exportToCSV}
        style={{ marginTop: '20px' }}
      >
        Exporter en CSV
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate('/facturation/import-invoices')}
        style={{ marginTop: '20px', marginLeft: '10px' }}
      >
        Importer des factures
      </Button>
    </div>
  );
};

export default InvoiceList;
