import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useParams } from 'react-router-dom';
import {
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';

const ClientDetails = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState({});
  const [invoices, setInvoices] = useState([]); // Initialisation de invoices
  const [logo, setLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchClientDetails = async () => {
      const clientDoc = await getDoc(doc(db, "clients", clientId));
      const clientData = clientDoc.data();
      setClient(clientData);
      setLogoUrl(clientData.logoUrl || "");

      const q = query(collection(db, "invoices"), where("clientId", "==", clientId));
      const querySnapshot = await getDocs(q);
      const invoicesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(invoicesList); // Mise à jour de invoices
    };

    fetchClientDetails();
  }, [clientId]);

  const handleLogoChange = async (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleUploadLogo = async () => {
    if (!logo) return;
    const logoRef = ref(storage, `logos/${clientId}`);
    await uploadBytes(logoRef, logo);
    const url = await getDownloadURL(logoRef);
    await updateDoc(doc(db, "clients", clientId), { logoUrl: url });
    setLogoUrl(url);
  };

  const handleDeleteLogo = async () => {
    const logoRef = ref(storage, `logos/${clientId}`);
    await deleteObject(logoRef);
    await updateDoc(doc(db, "clients", clientId), { logoUrl: "" });
    setLogoUrl("");
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Détails du Client
      </Typography>
      <Paper style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h5">{client.name}</Typography>
        <Typography variant="body1">Email: {client.email}</Typography>
        <Typography variant="body1">Téléphone: {client.phone}</Typography>
        <Typography variant="body1">Adresse: {client.address}</Typography>
        <div style={{ margin: '20px 0' }}>
          <input type="file" onChange={handleLogoChange} />
          <Button variant="contained" color="primary" onClick={handleUploadLogo} style={{ margin: '10px' }}>
            Ajouter Logo
          </Button>
          <Button variant="contained" color="secondary" onClick={handleDeleteLogo} style={{ margin: '10px' }}>
            Supprimer Logo
          </Button>
        </div>
        {logoUrl && <Avatar src={logoUrl} alt="logo" style={{ width: '100px', height: '100px' }} />}
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
