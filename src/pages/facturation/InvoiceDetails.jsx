import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiFillFilePdf } from 'react-icons/ai';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TextField, Grid, Button, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import styled from 'styled-components';
import Invoice1PDF from './Invoice1PDF';
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
import { saveInvoiceToFirebase } from '../../utils/firebaseFunctions';
import { db } from '../../firebaseConfig';
import { collection, getDocs, addDoc, query, orderBy, limit, doc, getDoc, setDoc } from "firebase/firestore";

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

const InvoiceDetails = () => {
  const [state, setState] = useState({
    logo: '/static/img/avatars/logo.png',
    invoiceReady: false, // Par défaut, désactiver le téléchargement de la facture
    companyInfo: {
      name: 'Le Rayon Vert',
      address: '01, Av. OUA (concession PROCOKI)',
      phone: '0998006500',
      email: 'direction@rayonverts.com',
      taxNumber: 'Numéro impot :0801888M',
      logo: '/static/img/avatars/logo.png'
    },
    invoiceInfo: {
      number: '',
      date: '',
      dueDate: '',
      vatPercent: 16,
      currency: 'USD'
    },
    billTo: {
      company: '',
      address: '',
      phone: '',
      email: ''
    },
    services: [{ description: '', libelle: '', quantity: '', unitPrice: '', amount: '0' }],
    additionalNotes: 'Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G',
    clients: [],
    selectedClient: '',
    invoiceSaved: false // Suivi de l'état de sauvegarde de la facture
  });
  const getLastInvoiceNumber = async () => {
    const lastNumberDoc = await getDoc(doc(db, 'metadata', 'lastInvoiceNumber'));
    if (lastNumberDoc.exists()) {
      return lastNumberDoc.data().number;
    } else {
      await setDoc(doc(db, 'metadata', 'lastInvoiceNumber'), { number: 0 });
      return 0;
    }
  };

  const updateLastInvoiceNumber = async (number) => {
    await setDoc(doc(db, 'metadata', 'lastInvoiceNumber'), { number });
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState(prevState => ({ ...prevState, clients: clientsList }));
      } catch (error) {
        console.error("Erreur lors de la récupération des clients :", error);
      }
    };

    fetchClients();
  }, []);

  const generateInvoiceNumber = async () => {
    const lastInvoiceNumber = await getLastInvoiceNumber();
    const newInvoiceNumber = (lastInvoiceNumber + 1).toString().padStart(4, '0');
    return newInvoiceNumber;
  };
  useEffect(() => {
    const setInvoiceNumber = async () => {
      const number = await generateInvoiceNumber();
      setState(prevState => ({
        ...prevState,
        invoiceInfo: { ...prevState.invoiceInfo, number }
      }));
    };

    setInvoiceNumber();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setState(prevState => ({
        ...prevState,
        logo: reader.result,
        companyInfo: { ...prevState.companyInfo, logo: reader.result },
        invoiceReady: true
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prevState => ({
      ...prevState,
      [e.target.dataset.group]: { ...prevState[e.target.dataset.group], [name]: value }
    }));
  };
  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = state.clients.find(client => client.id === clientId);
    setState(prevState => ({
      ...prevState,
      selectedClient: clientId,
      billTo: {
        company: client.name,
        address: client.address,
        phone: client.phone,
        email: client.email
      }
    }));
  };

  const handleServiceChange = (index, e) => {
    const { name, value } = e.target;
    const newServices = [...state.services];
    newServices[index][name] = value;
    setState(prevState => ({ ...prevState, services: newServices }));
  };

  const addService = () => {
    setState(prevState => ({
      ...prevState,
      services: [...prevState.services, { description: '', libelle: '', quantity: '', unitPrice: '', amount: '0' }]
    }));
  };

  const calculateSubtotal = () => {
    return state.services.reduce((sum, service) => {
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
    companyInfo: state.companyInfo,
    invoiceInfo: state.invoiceInfo,
    billTo: state.billTo,
    services: state.services,
    subtotal: calculateSubtotal(),
    vatAmount: calculateVat(calculateSubtotal(), state.invoiceInfo.vatPercent),
    total: calculateTotal(calculateSubtotal(), calculateVat(calculateSubtotal(), state.invoiceInfo.vatPercent)),
    additionalNotes: state.additionalNotes
  };

  const handleSaveInvoice = async () => {
    const newInvoiceNumber = await generateInvoiceNumber();
    setState(prevState => ({
      ...prevState,
      invoiceInfo: { ...prevState.invoiceInfo, number: newInvoiceNumber }
    }));

    const invoiceData = {
      companyInfo: state.companyInfo,
      invoiceInfo: { ...state.invoiceInfo, number: newInvoiceNumber },
      billTo: state.billTo,
      services: state.services,
      subtotal: calculateSubtotal(),
      vatAmount: calculateVat(calculateSubtotal(), state.invoiceInfo.vatPercent),
      total: calculateTotal(calculateSubtotal(), calculateVat(calculateSubtotal(), state.invoiceInfo.vatPercent)),
      additionalNotes: state.additionalNotes
    };
    await saveInvoiceToFirebase(invoiceData);
    await updateLastInvoiceNumber(parseInt(newInvoiceNumber, 10));
    setState(prevState => ({ ...prevState, invoiceReady: true, invoiceSaved: true }));
  };

  return (
    <>
      {state.invoiceSaved && <Alert severity="success">Facture enregistrée avec succès dans Firebase</Alert>}
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
              value={state.companyInfo.name}
              onChange={handleChange}
              data-group="companyInfo"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="address"
              name="address"
              label="Adresse"
              fullWidth
              value={state.companyInfo.address}
              onChange={handleChange}
              data-group="companyInfo"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="phone"
              name="phone"
              label="Téléphone"
              fullWidth
              value={state.companyInfo.phone}
              onChange={handleChange}
              data-group="companyInfo"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="email"
              name="email"
              label="Email"
              fullWidth
              value={state.companyInfo.email}
              onChange={handleChange}
              data-group="companyInfo"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="taxNumber"
              name="taxNumber"
              label="Numéro d'impôt"
              fullWidth
              value={state.companyInfo.taxNumber}
              onChange={handleChange}
              data-group="companyInfo"
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
              value={state.invoiceInfo.number}
              onChange={handleChange}
              data-group="invoiceInfo"
              disabled // Désactiver la modification du numéro de facture
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
              value={state.invoiceInfo.date}
              onChange={handleChange}
              data-group="invoiceInfo"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="dueDate"
              name="dueDate"
              label="Date d'échéance"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              value={state.invoiceInfo.dueDate}
              onChange={handleChange}
              data-group="invoiceInfo"
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
              value={state.invoiceInfo.vatPercent}
              onChange={handleChange}
              data-group="invoiceInfo"
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
              value={state.invoiceInfo.currency}
              onChange={handleChange}
              data-group="invoiceInfo"
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
            value={state.selectedClient}
            onChange={handleClientChange}
          >
            {state.clients.map((client) => (
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
              value={state.billTo.company}
              onChange={handleChange}
              data-group="billTo"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="address"
              name="address"
              label="Adresse"
              fullWidth
              value={state.billTo.address}
              onChange={handleChange}
              data-group="billTo"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="phone"
              name="phone"
              label="Téléphone"
              fullWidth
              value={state.billTo.phone}
              onChange={handleChange}
              data-group="billTo"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="email"
              name="email"
              label="Email"
              fullWidth
              value={state.billTo.email}
              onChange={handleChange}
              data-group="billTo"
            />
          </Grid>
        </Grid>
        <h3>Services</h3>
        {state.services.map((service, index) => (
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

        <h3>Notes supplémentaires</h3>
        <TextField
          required
          id="additionalNotes"
          name="additionalNotes"
          label="Notes supplémentaires"
          fullWidth
          multiline
          rows={4}
          value={state.additionalNotes}
          onChange={handleChange}
          data-group="additionalNotes"
          style={{ marginTop: '20px' }}
        />
      </form>
      {state.invoiceReady && (
        <PDFDownloadLink
          document={<Invoice1PDF invoice={invoiceData} />}
          fileName="facture.pdf"
        >
          {({ loading }) => (
            <Button
              type="button"
              variant="contained"
              color="primary"
              style={{ marginTop: '20px' }}
              disabled={!state.invoiceReady} // Désactiver le bouton de téléchargement jusqu'à ce que la facture soit sauvegardée
            >
              {loading ? 'Chargement du document...' : 'Télécharger la facture'}
            </Button>
          )}
        </PDFDownloadLink>
      )}

      <Button
        type="button"
        variant="contained"
        color="secondary"
        style={{ marginTop: '20px', marginLeft: '10px' }}
        onClick={handleSaveInvoice}
      >
        Sauvegarder la facture
      </Button>
      <InvoiceContainer>
        <HeaderSection>
          <CompanyDetails>
            <img src={state.logo} alt='Logo' />
            <h2>{state.companyInfo.name}</h2>
            <p>{state.companyInfo.address}</p>
            <p>{state.companyInfo.phone}</p>
            <p>{state.companyInfo.email}</p>
            <p>{state.companyInfo.taxNumber}</p>
          </CompanyDetails>
          <InvoiceDetailsSection>
            <h3>FACTURE <AiFillFilePdf /></h3>
            <p>LRV{state.invoiceInfo.number}</p>
            <p>Date : {state.invoiceInfo.date}</p>
            <p>Date d'échéance : {state.invoiceInfo.dueDate}</p>
          </InvoiceDetailsSection>
        </HeaderSection>
        <BillingSection>
          <h4>Facturé à :</h4>
          <p>{state.billTo.company}</p>
          <p>{state.billTo.address}</p>
          <p>{state.billTo.phone}</p>
          <p>{state.billTo.email}</p>
        </BillingSection>
        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Description du service</th>
                <th>Libellé</th>
                <th>Quantité</th>
                <th>Prix Unitaire ({state.invoiceInfo.currency})</th>
                <th>Montant ({state.invoiceInfo.currency})</th>
              </tr>
            </thead>
            <tbody>
              {state.services.map((service, index) => (
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
          <p>Sous-total : {state.invoiceInfo.currency} {invoiceData.subtotal.toFixed(2)}</p>
          <p>TVA ({state.invoiceInfo.vatPercent}%) : {state.invoiceInfo.currency} {invoiceData.vatAmount.toFixed(2)}</p>
          <p className="total">Total : {state.invoiceInfo.currency} {invoiceData.total.toFixed(2)}</p>
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

export default InvoiceDetails;
