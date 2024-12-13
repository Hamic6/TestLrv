import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TextField, Grid, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import styled from 'styled-components';
import AvisDePassagePDF from './AvisDePassagePDF';
import {
  AvisContainer,
  HeaderSection,
  CompanyDetails,
  AvisDetailsSection,
  BillingSection,
  NotesSection
} from './AvisDePassageStyles';
import { saveAvisToDatabase } from '../../utils/api';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import SignatureComponent from '@/pages/Devis/SignatureComponent';
import PhotoCapture from '@/pages/Devis/PhotoCapture';
import './SignatureComponent.css'; // Importer le fichier CSS

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

const CreateAvisDePassageDetails = () => {
  const [logo, setLogo] = useState('/static/img/avatars/logo.png'); // Utiliser le logo par défaut à partir du chemin spécifié
  const [avisReady, setAvisReady] = useState(true); // Afficher le bouton par défaut

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Le Rayon Vert',
    address: '01, Av. OUA (concession PROCOKI)',
    phone: '0998006500',
    email: 'direction@rayonverts.com',
    taxNumber: 'Numéro impot :0801888M',
    logo: logo
  });

  const [avisInfo, setAvisInfo] = useState({
    number: '',
    date: '',
    currency: 'USD'
  });

  const [billTo, setBillTo] = useState({
    company: '',
    address: '',
    phone: '',
    email: ''
  });

  const [services, setServices] = useState([
    { description: '', libelle: '' }
  ]);

  const [additionalNotes, setAdditionalNotes] = useState('Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [signature, setSignature] = useState('');
  const [photo, setPhoto] = useState(null);
  const getLastAvisNumber = async () => {
    const lastNumberDoc = await getDoc(doc(db, 'metadata', 'lastAvisNumber'));
    if (lastNumberDoc.exists()) {
      return lastNumberDoc.data().number;
    } else {
      await setDoc(doc(db, 'metadata', 'lastAvisNumber'), { number: 0 });
      return 0;
    }
  };

  const updateLastAvisNumber = async (number) => {
    await setDoc(doc(db, 'metadata', 'lastAvisNumber'), { number });
  };

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

  const generateAvisNumber = async () => {
    const lastAvisNumber = await getLastAvisNumber();
    const newAvisNumber = (lastAvisNumber + 1).toString().padStart(4, '0');
    return newAvisNumber;
  };

  useEffect(() => {
    const setAvisNumber = async () => {
      const number = await generateAvisNumber();
      setAvisInfo(prevInfo => ({ ...prevInfo, number }));
    };

    setAvisNumber();
  }, []);
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
      setCompanyInfo((prevInfo) => ({ ...prevInfo, logo: reader.result }));
      setAvisReady(true);
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

  const handleAvisInfoChange = (e) => {
    const { name, value } = e.target;
    setAvisInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
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

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };
  const addService = () => {
    setServices([...services, { description: '', libelle: '' }]);
  };

  const avisData = {
    companyInfo,
    avisInfo,
    billTo,
    services,
    additionalNotes,
    signature,
    photo
  };

  const handleSaveAvis = async () => {
    const newAvisNumber = await generateAvisNumber();
    setAvisInfo((prevInfo) => ({ ...prevInfo, number: newAvisNumber }));

    const avisData = {
      companyInfo,
      avisInfo: { ...avisInfo, number: newAvisNumber },
      billTo,
      services,
      additionalNotes,
      signature,
      photo
    };

    await saveAvisToDatabase(avisData);
    await updateLastAvisNumber(parseInt(newAvisNumber, 10));
    alert('Avis de passage enregistré avec succès dans Firebase');
  };

  const savePhoto = (photoData) => {
    setPhoto(photoData);
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
        <h3>Informations de l'avis</h3>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="number"
              name="number"
              label="Numéro"
              fullWidth
              value={avisInfo.number}
              onChange={handleAvisInfoChange}
              disabled // Désactiver la modification du numéro d'avis
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
              value={avisInfo.date}
              onChange={handleAvisInfoChange}
            />
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
          value={additionalNotes}
          onChange={handleAdditionalNotesChange}
          style={{ marginTop: '20px' }}
        />
        <h3>Signature</h3>
        <SignatureComponent setSignature={setSignature} />
        <h3>Photo</h3>
        <PhotoCapture setPhoto={savePhoto} />
      </form>
      {avisReady && (
        <PDFDownloadLink
          document={<AvisDePassagePDF avis={avisData} />}
          fileName="avis_de_passage.pdf"
        >
          <Button
            type="button"
            variant="contained"
            color="primary"
            style={{ marginTop: '20px' }}
          >
            Télécharger
          </Button>
        </PDFDownloadLink>
      )}
      <Button
        type="button"
        variant="contained"
        color="secondary"
        style={{ marginTop: '20px', marginLeft: '10px' }}
        onClick={handleSaveAvis}
      >
        Sauvegarder l'avis de passage
      </Button>
    </>
  );
};

export default CreateAvisDePassageDetails;
