import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiFillFilePdf } from 'react-icons/ai';
import { PDFDownloadLink } from '@react-pdf/renderer';
import {
  TextField,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Autocomplete
} from '@mui/material';
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
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

const InvoiceDetails = () => {
  const [logo, setLogo] = useState('/static/img/avatars/logo.png'); // Utiliser le logo par défaut à partir du chemin spécifié
  const [invoiceReady, setInvoiceReady] = useState(false); // Désactiver le bouton de téléchargement par défaut

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Le Rayon Vert',
    address: '01, Av. OUA (concession PROCOKI)',
    phone: '+243808317816',
    email: 'direction@rayonverts.com',
    taxNumber: 'Numéro impot :0801888M',
    logo: logo
  });

  const [invoiceInfo, setInvoiceInfo] = useState({
    number: '',
    date: '',
    dueDate: '',
    vatPercent: 16, // TVA par défaut
    currency: 'USD',
    purchaseOrderNumber: '',      // Numéro du bon de commande
    deliveryNoticeNumber: ''      // Numéro d'avis de passage
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

  const [paymentInfo, setPaymentInfo] = useState(
    'Banque : Rawbank | Compte : 05100 05101 01039948802-77 (EURO) | Compte : 05100 05101 01039948801-80 (USD)'
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    'Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G'
  );

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [clientSearch, setClientSearch] = useState(""); // Ajout de l'état pour la recherche

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
        const querySnapshot = await getDocs(collection(db, 'clients'));
        const clientsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsList);
      } catch (error) {
        console.error('Erreur lors de la récupération des clients :', error);
      }
    };

    fetchClients();
  }, []);

  const generateInvoiceNumber = async () => {
    const lastInvoiceNumber = await getLastInvoiceNumber();
    const newInvoiceNumber = (lastInvoiceNumber + 1)
      .toString()
      .padStart(4, '0');
    return newInvoiceNumber;
  };

  useEffect(() => {
    const setInvoiceNumber = async () => {
      const number = await generateInvoiceNumber();
      setInvoiceInfo((prevInfo) => ({ ...prevInfo, number }));
    };

    setInvoiceNumber();
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
    const client = clients.find((client) => client.id === clientId);
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

  const handleSaveInvoice = async () => {
    const newInvoiceNumber = await generateInvoiceNumber();
    setInvoiceInfo((prevInfo) => ({ ...prevInfo, number: newInvoiceNumber }));

    const invoiceData = {
      companyInfo,
      invoiceInfo: { ...invoiceInfo, number: newInvoiceNumber },
      billTo,
      services,
      subtotal: calculateSubtotal(),
      vatAmount: calculateVat(calculateSubtotal(), invoiceInfo.vatPercent),
      total: calculateTotal(calculateSubtotal(), calculateVat(calculateSubtotal(), invoiceInfo.vatPercent)),
      paymentInfo,
      additionalNotes
    };

    try {
      await saveInvoiceToFirebase(invoiceData);
      await updateLastInvoiceNumber(parseInt(newInvoiceNumber, 10));
      setInvoiceReady(true);
      setAlertMessage('Facture enregistrée avec succès dans Firebase');
      setAlertOpen(true);
    } catch (error) {
      setAlertMessage('Erreur lors de l\'enregistrement de la facture');
      setAlertOpen(true);
      console.error('Erreur lors de l\'enregistrement de la facture :', error);
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  );
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
              id="dueDate"
              name="dueDate"
              label="Date d'échéance"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              value={invoiceInfo.dueDate}
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
          {/* Ajout des deux nouveaux champs non obligatoires */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="purchaseOrderNumber"
              name="purchaseOrderNumber"
              label="Numéro du bon de commande"
              fullWidth
              value={invoiceInfo.purchaseOrderNumber}
              onChange={handleInvoiceInfoChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="deliveryNoticeNumber"
              name="deliveryNoticeNumber"
              label="Numéro d'avis de passage"
              fullWidth
              value={invoiceInfo.deliveryNoticeNumber}
              onChange={handleInvoiceInfoChange}
            />
          </Grid>
        </Grid>
        <h3>Facturé à</h3>
        <Autocomplete
          options={clients}
          getOptionLabel={(option) => option.name}
          value={clients.find(c => c.id === selectedClient) || null}
          onChange={(event, newValue) => {
            if (newValue) {
              setSelectedClient(newValue.id);
              setBillTo({
                company: newValue.name,
                address: newValue.address,
                phone: newValue.phone,
                email: newValue.email
              });
            } else {
              setSelectedClient('');
              setBillTo({
                company: '',
                address: '',
                phone: '',
                email: ''
              });
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Rechercher et sélectionner un client" variant="outlined" fullWidth margin="normal" required />
          )}
        />
        
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
          disabled // Désactiver la modification du champ Informations de paiement
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
          document={<Invoice1PDF invoice={invoiceData} />}
          fileName="facture.pdf"
        >
          {({ loading }) => (
            <Button
              type="button"
              variant="contained"
              color="primary"
              style={{ marginTop: '20px' }}
              disabled={!invoiceReady} // Désactiver le téléchargement tant que la facture n'est pas sauvegardée
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
            <img src={logo} alt='Logo' />
            <h2 style={{ color: "#2c3e50", fontWeight: "bold", fontSize: 18, marginBottom: 5 }}>{companyInfo.name}</h2>
            <p>{companyInfo.address}</p>
            <p>Tél: {companyInfo.phone}</p>
            <p>Email: {companyInfo.email}</p>
            <p>{companyInfo.taxNumber}</p>
          </CompanyDetails>
          <InvoiceDetailsSection>
            <h3 style={{ color: "#388e3c", fontWeight: "bold", textTransform: "uppercase", fontSize: 16, marginBottom: 10 }}>
              FACTURE <AiFillFilePdf />
            </h3>
            <p style={{ fontWeight: "bold" }}>N°: LRV{invoiceInfo.number}</p>
            <p>Date : {invoiceInfo.date}</p>
            <p>Date d'échéance : {invoiceInfo.dueDate}</p>
            {/* Affichage des nouveaux champs si renseignés */}
            {invoiceInfo.purchaseOrderNumber && (
              <p>Bon de commande : {invoiceInfo.purchaseOrderNumber}</p>
            )}
            {invoiceInfo.deliveryNoticeNumber && (
              <p>Avis de passage : {invoiceInfo.deliveryNoticeNumber}</p>
            )}
          </InvoiceDetailsSection>
        </HeaderSection>
        <BillingSection>
          <h4 style={{ color: "#388e3c", fontWeight: "bold", marginBottom: 10 }}>Facturé à :</h4>
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
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity="success" sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InvoiceDetails;
