import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TextField, Grid, Button, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import styled from 'styled-components';
import AvisDePassagePDF from './AvisDePassagePDF';
import { saveAvisToDatabase } from '../../utils/api';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import SignaturePadComponent from '@/pages/AvisDePassage/SignaturePadComponent';
import PhotoCapture from '@/pages/AvisDePassage/PhotoCapture';
import './SignaturePadComponent.css';

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

const CreateAvisDePassage = () => {
  const [logo, setLogo] = useState('/static/img/avatars/logo.png'); // Utiliser le logo par défaut à partir du chemin spécifié
  const [avisReady, setAvisReady] = useState(true); // Afficher le bouton par défaut
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Le Rayon Vert',
    address: '01, Av. OUA (concession PROCOKI)',
    phone: '+243808317816',
    email: 'direction@rayonverts.com',
    taxNumber: 'Numéro impot :0801888M',
    logo: logo
  });
  const [avisInfo, setAvisInfo] = useState({
    number: '',
    date: '',
    startTime: '', // Heure de début ajoutée
    endTime: '', // Heure de fin ajoutée
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
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [signature, setSignature] = useState('');
  const [photos, setPhotos] = useState([]);
  const [verifiedBy, setVerifiedBy] = useState(''); // Ajouté
  const [verifiedDate, setVerifiedDate] = useState(''); // Ajouté
  const [signatureSaved, setSignatureSaved] = useState(false); // Ajouté
  const [photosSaved, setPhotosSaved] = useState(false); // Ajouté
  const [avisSaved, setAvisSaved] = useState(false); // Ajouté
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

  const addService = () => {
    setServices([...services, { description: '', libelle: '' }]);
  };

  const handlePhotosCaptured = (capturedPhotos) => {
    setPhotos(capturedPhotos);
    setPhotosSaved(true); // Définir les photos comme sauvegardées
  };

  const avisData = {
    companyInfo,
    avisInfo,
    billTo,
    services,
    signature,
    photos,
    verifiedBy,
    verifiedDate
  };

  const handleSaveAvis = async () => {
    const newAvisNumber = await generateAvisNumber();
    setAvisInfo((prevInfo) => ({ ...prevInfo, number: newAvisNumber }));

    const avisData = {
      companyInfo,
      avisInfo: { ...avisInfo, number: newAvisNumber },
      billTo,
      services,
      signature,
      photos,
      verifiedBy,
      verifiedDate
    };

    await saveAvisToDatabase(avisData);
    await updateLastAvisNumber(parseInt(newAvisNumber, 10));
    setAvisSaved(true); // Définir l'avis comme sauvegardé
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
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="startTime"
              name="startTime"
              label="Heure de début"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              value={avisInfo.startTime}
              onChange={handleAvisInfoChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="endTime"
              name="endTime"
              label="Heure de fin"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              value={avisInfo.endTime}
              onChange={handleAvisInfoChange}
            />
          </Grid>
        </Grid>
        
        <h3>Client</h3> {/* Changement de "Facturé à" en "Client" */}
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
            <Grid item xs={12} sm={12}>
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
              <Grid item xs={12} sm={12}>
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
        <h3>Travail vu et contrôlé par :</h3>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="verifiedBy"
              name="verifiedBy"
              label="Nom"
              fullWidth
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="verifiedDate"
              name="verifiedDate"
              label="Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              value={verifiedDate}
              onChange={(e) => setVerifiedDate(e.target.value)}
            />
          </Grid>
        </Grid>
        <h3>Signature</h3>
        <SignaturePadComponent setSignature={value => {setSignature(value); setSignatureSaved(true);}} />
        <h3>Photo</h3>
        <PhotoCapture onPhotosCaptured={handlePhotosCaptured} />
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
      {signatureSaved && <Alert severity="success">Signature sauvegardée avec succès !</Alert>}
      {photosSaved && <Alert severity="success">Photos sauvegardées avec succès !</Alert>}
      {avisSaved && <Alert severity="success">Avis de passage sauvegardé avec succès !</Alert>}
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

export default CreateAvisDePassage;
