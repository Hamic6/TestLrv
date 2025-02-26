import React, { useState } from 'react';
import { Button, TextField, Alert, IconButton } from '@mui/material';
import { Upload as UploadIcon, CloudUpload as CloudUploadIcon, GetApp as GetAppIcon } from '@mui/icons-material';
import Papa from 'papaparse';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import firebaseConfig from '../../firebaseConfig'; // Importez vos configurations Firebase

// Initialisez Firebase si ce n'est pas déjà fait
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

const ImportInvoices = () => {
  const [file, setFile] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertSeverity, setAlertSeverity] = useState('success');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    Papa.parse(file, {
      header: true,
      complete: async function(results) {
        try {
          for (const invoiceData of results.data) {
            const invoice = {
              additionalNotes: invoiceData.additionalNotes || '',
              billTo: {
                address: invoiceData.billTo_address || '',
                company: invoiceData.billTo_company || '',
                email: invoiceData.billTo_email || '',
                phone: invoiceData.billTo_phone || '',
              },
              companyInfo: {
                address: invoiceData.companyInfo_address || '',
                email: invoiceData.companyInfo_email || '',
                logo: invoiceData.companyInfo_logo || '',
                name: invoiceData.companyInfo_name || '',
                phone: invoiceData.companyInfo_phone || '',
                taxNumber: invoiceData.companyInfo_taxNumber || '',
              },
              invoiceInfo: {
                currency: invoiceData.invoiceInfo_currency || '',
                date: invoiceData.invoiceInfo_date || '',
                dueDate: invoiceData.invoiceInfo_dueDate || '',
                number: invoiceData.invoiceInfo_number || '',
                vatPercent: invoiceData.invoiceInfo_vatPercent || 0,
              },
              paymentInfo: invoiceData.paymentInfo || '',
              services: invoiceData.services && isValidJSON(invoiceData.services) ? JSON.parse(invoiceData.services) : [], // Permettre les services vides
              status: invoiceData.status || '',
              subtotal: invoiceData.subtotal || 0,
              total: invoiceData.total || 0,
              vatAmount: invoiceData.vatAmount || 0,
            };
            await addDoc(collection(db, 'invoices'), invoice);
          }
          setAlertMessage('Factures importées avec succès !');
          setAlertSeverity('success');
        } catch (error) {
          console.error('Error adding invoice: ', error);
          setAlertMessage(`Erreur lors de l'importation des factures : ${error.message}`);
          setAlertSeverity('error');
        }
      }
    });
  };

  // Fonction pour vérifier si une chaîne est un JSON valide
  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };
  // Fonction pour télécharger le modèle CSV
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        additionalNotes: "Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G",
        billTo_address: "01, Gombe, Kinshasa",
        billTo_company: "Ambassade d’Italie",
        billTo_email: "dannyhamici@gmail.com",
        billTo_phone: "+243 988 678 45",
        companyInfo_address: "01, Av. OUA (concession PROCOKI)",
        companyInfo_email: "direction@rayonverts.com",
        companyInfo_logo: "/static/img/avatars/logo.png",
        companyInfo_name: "Le Rayon Vert",
        companyInfo_phone: "0998006500",
        companyInfo_taxNumber: "Numéro impot :0801888M",
        invoiceInfo_currency: "USD",
        invoiceInfo_date: "2025-02-28",
        invoiceInfo_dueDate: "2025-02-18",
        invoiceInfo_number: "0020",
        invoiceInfo_vatPercent: 16,
        paymentInfo: "Banque : Rawbank | Compte : 05100 05101 01039948802-77 (EURO) | Compte : 05100 05101 01039948801-80 (USD)",
        services: JSON.stringify([
          { amount: "0", description: "Jardinage", libelle: "Numéro avis de passage 2250", quantity: "1", unitPrice: "100" },
          { amount: "0", description: "Traitement intérieur", libelle: "Numéro avis de passage 2350", quantity: "1", unitPrice: "250" }
        ]),
        status: "Payé",
        subtotal: 350,
        total: 600,
        vatAmount: 56,
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "invoice_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <TextField
          type="file"
          onChange={handleFileChange}
          inputProps={{ accept: ".csv" }}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input">
          <IconButton component="span" color="primary">
            <UploadIcon />
            Choisir un fichier
          </IconButton>
        </label>
        <IconButton
          type="submit"
          color="secondary"
          style={{ marginLeft: '10px' }}
        >
          <CloudUploadIcon />
          Importer
        </IconButton>
      </form>
      <Button
        onClick={handleDownloadTemplate}
        variant="contained"
        color="primary"
        style={{ marginTop: '20px' }}
      >
        <GetAppIcon />
        Télécharger le modèle CSV
      </Button>
      {alertMessage && (
        <Alert
          severity={alertSeverity}
          onClose={() => setAlertMessage(null)}
          style={{ marginTop: '20px' }}
        >
          {alertMessage}
        </Alert>
      )}
    </div>
  );
};

export default ImportInvoices;
