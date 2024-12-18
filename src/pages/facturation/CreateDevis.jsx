import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiFillFilePdf } from 'react-icons/ai';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TextField, Grid, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import styled from 'styled-components';
import DevisPDF from './DevisPDF';
import {
  InvoiceContainer,
  HeaderSection,
  CompanyDetails,
  InvoiceDetailsSection,
  BillingSection,
  TableContainer,
  TotalsSection,
  PaymentInfoSection,
  NotesSection
} from './InvoiceDetailsStyles';
import { db } from '../../firebaseConfig';
import { collection, getDocs, getDoc, setDoc, doc } from "firebase/firestore";

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

const CreateDevis = () => {
  const [logo, setLogo] = useState('/static/img/avatars/logo.png');
  const [invoiceReady, setInvoiceReady] = useState(true);

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Le Rayon Vert',
    address: '01, Av. OUA (concession PROCOKI)',
    phone: '0998006500',
    email: 'direction@rayonverts.com',
    taxNumber: 'Numéro impot :0801888M',
    logo: logo
  });

  const [invoiceInfo, setInvoiceInfo] = useState({
    number: '',
    date: '',
    vatPercent: 16,
    currency: 'USD'
  });

  const [billTo, setBillTo] = useState({
    company: '',
    address: '',
    phone: '',
    email: ''
  });

  const [services, setServices] = useState([
    { description: '', libelle: '', quantity: '', unitPrice: '', amount: '0' }
  ]);

  const [paymentInfo, setPaymentInfo] = useState('Banque : Rawbank | Compte : 05100 05101 01039948802-77 (EURO) | Compte : 05100 05101 01039948801-80 (USD)');
  const [additionalNotes, setAdditionalNotes] = useState('Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G');

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsList);
      } catch (error) {
        console.error("Erreur lors de la récupération des clients :", error);
      }
    };

    fetchClients();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
      setCompanyInfo((prevInfo) => ({ ...prevInfo, logo: reader.result }));
      setInvoiceReady(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*'
  });

  const handleCompanyInfoChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleInvoiceInfoChange = (e) => {
    const { name, value } = e.target;
    setInvoiceInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };
  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find(client => client.id === clientId);
    setSelectedClient(clientId);
    setBillTo({
      company: client.name,
      address: client.address,
      phone: client.phone,
      email: client.email
    });
  };

  const handleServiceChange = (index, e) => {
    const { name, value } = e.target;
    const newServices = [...services];
    newServices[index][name] = value;
    setServices(newServices);
  };

  const handlePaymentInfoChange = (e) => {
    setPaymentInfo(e.target.value);
  };

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const addService = () => {
    setServices([...services, { description: '', libelle: '', quantity: '', unitPrice: '', amount: '0' }]);
  };

  const calculateSubtotal = () => {
    return services.reduce((sum, service) => {
      const amount = parseFloat(service.unitPrice || 0) * parseFloat(service.quantity || 0);
      return sum + amount;
    }, 0);
  };

  const calculateVat = (subtotal, vatPercent) => {
    return (subtotal * vatPercent) / 100;
  };

  const calculateTotal = (subtotal, vatAmount) => {
    return subtotal + vatAmount;
  };

  const invoiceData = {
    companyInfo,
    invoiceInfo,
    billTo,
    services,
    subtotal: calculateSubtotal(),
    vatAmount: calculateVat(calculateSubtotal(), invoiceInfo.vatPercent),
    total: calculateTotal(calculateSubtotal(), calculateVat(calculateSubtotal(), invoiceInfo.vatPercent)),
    paymentInfo,
    additionalNotes
  };

  return (
    <>
      <form>
        <h3>Informations de l'entreprise</h3>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="name"
              name="name"
              label="Nom de l'entreprise"
              fullWidth
              value={companyInfo.name}
              onChange={handleCompanyInfoChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="address"
              name="address"
              label="Adresse"
              fullWidth
              value={companyInfo.address}
              onChange={handleCompanyInfoChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="phone"
              name="phone"
              label="Téléphone"
              fullWidth
              value={companyInfo.phone}
              onChange={handleCompanyInfoChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="email"
              name="email"
              label="Email"
              fullWidth
              value={companyInfo.email}
              onChange={handleCompanyInfoChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="taxNumber"
              name="taxNumber"
              label="Numéro d'impôt"
              fullWidth
              value={companyInfo.taxNumber}
              onChange={handleCompanyInfoChange}
            />
          </Grid>
        </Grid>
        <h3>Informations de la facture</h3>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="number"
              name="number"
              label="Numéro"
              fullWidth
              value={invoiceInfo.number}
              onChange={handleInvoiceInfoChange}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="date"
              name="date"
              label="Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              value={invoiceInfo.date}
              onChange={handleInvoiceInfoChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="vatPercent"
              name="vatPercent"
              label="TVA (%)"
              type="number"
              fullWidth
              value={invoiceInfo.vatPercent}
              onChange={handleInvoiceInfoChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="currency"
              name="currency"
              label="Devise"
              select
              fullWidth
              value={invoiceInfo.currency}
              onChange={handleInvoiceInfoChange}
              SelectProps={{
                native: true,
              }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CDF">CDF</option>
            </TextField>
          </Grid>
        </Grid>
        <h3>Facturé à</h3>
        <FormControl fullWidth margin="normal">
          <InputLabel id="client-select-label">Sélectionner un Client</InputLabel>
          <Select
            labelId="client-select-label"
            value={selectedClient}
            onChange={handleClientChange}
          >
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="company"
              name="company"
              label="Entreprise"
              fullWidth
              value={billTo.company}
              onChange={(e) => setBillTo({ ...billTo, company: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="address"
              name="address"
              label="Adresse"
              fullWidth
              value={billTo.address}
              onChange={(e) => setBillTo({ ...billTo, address: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="phone"
              name="phone"
              label="Téléphone"
              fullWidth
              value={billTo.phone}
              onChange={(e) => setBillTo({ ...billTo, phone: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="email"
              name="email"
              label="Email"
              fullWidth
              value={billTo.email}
              onChange={(e) => setBillTo({ ...billTo, email: e.target.value })}
            />
          </Grid>
        </Grid>
        <h3>Services</h3>
        {services.map((service, index) => (
          <div key={index}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="description"
                  name="description"
                  label="Description"
                  fullWidth
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, e)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="libelle"
                  name="libelle"
                  label="Libellé"
                  fullWidth
                  value={service.libelle}
                  onChange={(e) => handleServiceChange(index, e)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="quantity"
                  name="quantity"
                  label="Quantité"
                  type="number"
                  fullWidth
                  value={service.quantity}
                  onChange={(e) => handleServiceChange(index, e)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="unitPrice"
                  name="unitPrice"
                  label="Prix Unitaire"
                  type="number"
                  fullWidth
                  value={service.unitPrice}
                  onChange={(e) => handleServiceChange(index, e)}
                />
              </Grid>
            </Grid>
          </div>
        ))}
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={addService}
          style={{ marginTop: '20px' }}
        >
          Ajouter un service
        </Button>
        <h3>Informations de paiement</h3>
        <TextField
          required
          id="paymentInfo"
          name="paymentInfo"
          label="Informations de paiement"
          fullWidth
          multiline
          rows={4}
          value={paymentInfo}
          onChange={handlePaymentInfoChange}
          style={{ marginTop: '20px' }}
        />
        <h3>Notes supplémentaires</h3>
        <TextField
          required
          id="additionalNotes"
          name="additionalNotes"
          label="Notes supplémentaires"
          fullWidth
          multiline
          rows={4}
          value={additionalNotes}
          onChange={handleAdditionalNotesChange}
          style={{ marginTop: '20px' }}
        />
      </form>
      {invoiceReady && (
        <PDFDownloadLink
          document={<DevisPDF devis={invoiceData} />}
          fileName="devis.pdf"
        >
          {({ loading }) => (
            <Button
              type="button"
              variant="contained"
              color="primary"
              style={{ marginTop: '20px' }}
            >
              {loading ? 'Chargement du document...' : 'Télécharger le devis'}
            </Button>
          )}
        </PDFDownloadLink>
      )}
      <InvoiceContainer>
        <HeaderSection>
          <CompanyDetails>
            <img src={logo} alt="Logo" />
            <h2>{companyInfo.name}</h2>
            <p>{companyInfo.address}</p>
            <p>{companyInfo.phone}</p>
            <p>{companyInfo.email}</p>
            <p>{companyInfo.taxNumber}</p>
          </CompanyDetails>
          <InvoiceDetailsSection>
            <h3>DEVIS <AiFillFilePdf /></h3>
            <p>LRV{invoiceInfo.number}</p>
            <p>Date : {invoiceInfo.date}</p>
          </InvoiceDetailsSection>
        </HeaderSection>
        <BillingSection>
          <h4>Client :</h4>
          <p>{billTo.company}</p>
          <p>{billTo.address}</p>
          <p>{billTo.phone}</p>
          <p>{billTo.email}</p>
        </BillingSection>
        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Description du service</th>
                <th>Libellé</th>
                <th>Quantité</th>
                <th>Prix Unitaire ({invoiceInfo.currency})</th>
                <th>Montant ({invoiceInfo.currency})</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={index}>
                  <td>{service.description}</td>
                  <td>{service.libelle}</td>
                  <td>{service.quantity}</td>
                  <td>{parseFloat(service.unitPrice).toFixed(2)}</td>
                  <td>{(parseFloat(service.unitPrice) * parseFloat(service.quantity)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
        <TotalsSection>
          <p>Sous-total : {invoiceInfo.currency} {invoiceData.subtotal.toFixed(2)}</p>
          <p>TVA ({invoiceInfo.vatPercent}%) : {invoiceInfo.currency} {invoiceData.vatAmount.toFixed(2)}</p>
          <p className="total">Total : {invoiceInfo.currency} {invoiceData.total.toFixed(2)}</p>
        </TotalsSection>
        <PaymentInfoSection>
          <p>Informations de paiement :</p>
          <p>{invoiceData.paymentInfo}</p>
        </PaymentInfoSection>
        <NotesSection>
          <p>{invoiceData.additionalNotes}</p>
        </NotesSection>
      </InvoiceContainer>
    </>
  );
};

export default CreateDevis;
