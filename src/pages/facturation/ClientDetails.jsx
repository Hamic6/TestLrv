import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; // Assure-toi que ces chemins sont corrects
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { useParams } from 'react-router-dom';
import {
  Typography,
  Paper,
  Button,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Input,
  Box // Ajout de Box pour la mise en page
} from '@mui/material';
import axios from 'axios';

const ClientDetails = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [logo, setLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const clientDoc = await getDoc(doc(db, "clients", clientId));
        const clientData = clientDoc.data();
        setClient(clientData);
        setLogoUrl(clientData.logoUrl || "");

        const q = query(collection(db, "invoices"), where("clientId", "==", clientId));
        const querySnapshot = await getDocs(q);
        const invoicesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInvoices(invoicesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du client :", error);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleUploadLogo = async () => {
    if (!logo) return;

    const formData = new FormData();
    formData.append('file', logo);
    formData.append('upload_preset', 'Test44'); // Utilisation du preset de téléchargement fourni

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dyfxfhe4o/image/upload', formData); // Utilisation des informations de Cloudinary fournies
      const downloadURL = response.data.secure_url;
      await updateDoc(doc(db, "clients", clientId), { logoUrl: downloadURL });
      setLogoUrl(downloadURL);
    } catch (error) {
      console.error("Erreur lors du téléchargement du logo :", error.message);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await updateDoc(doc(db, "clients", clientId), { logoUrl: "" });
      setLogoUrl("");
    } catch (error) {
      console.error("Erreur lors de la suppression du logo :", error.message);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Détails du Client
      </Typography>
      <Paper style={{ padding: '20px', marginBottom: '20px' }}>
        <Box display="flex" alignItems="center">
          {logoUrl && <Avatar src={logoUrl} alt="logo" style={{ width: '60px', height: '60px', marginRight: '10px' }} />}
          <Typography variant="h5">{client.name}</Typography>
        </Box>
        <Typography variant="body1">Email: {client.email}</Typography>
        <Typography variant="body1">Téléphone: {client.phone}</Typography>
        <Typography variant="body1">Adresse: {client.address}</Typography>
        <div style={{ margin: '20px 0' }}>
          <Input 
            type="file"
            onChange={handleLogoChange}
            inputProps={{ accept: "image/*" }}
            style={{ display: 'none' }}
            id="upload-logo-input"
          />
          <label htmlFor="upload-logo-input">
            <Button variant="contained" color="primary" component="span" style={{ margin: '10px' }}>
              Choisir un Fichier
            </Button>
          </label>
          <Button variant="contained" color="primary" onClick={handleUploadLogo} style={{ margin: '10px' }}>
            Ajouter Logo
          </Button>
          <Button variant="contained" color="secondary" onClick={handleDeleteLogo} style={{ margin: '10px' }}>
            Supprimer Logo
          </Button>
        </div>
      </Paper>
      <Typography variant="h5" gutterBottom>
        Historique des Factures
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro de Facture</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceInfo.number}</TableCell>
                <TableCell>{invoice.invoiceInfo.date}</TableCell>
                <TableCell>{invoice.total}</TableCell>
                <TableCell>{invoice.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ClientDetails;
