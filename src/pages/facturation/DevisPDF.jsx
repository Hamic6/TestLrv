import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import QRCode from 'qrcode';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  headerSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    color: 'black',
  },
  companyDetails: {
    flex: 1,
    paddingRight: 20,
    fontSize: 10,
    color: 'black',
  },
  devisTitleSection: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    color: 'green',
  },
  devisDetailsSection: {
    flex: 1,
    paddingLeft: 20,
    textAlign: 'center',
    color: 'black',
  },
  billingSection: {
    marginBottom: 20,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f3f3f3',
    padding: 5,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5,
  },
  tableCellHeader: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
  },
  totalsSection: {
    marginTop: 20,
    textAlign: 'right',
  },
  paymentInfoSection: {
    marginTop: 20,
    textAlign: 'center',
    color: 'green',
    fontSize: 8,
  },
  notesSection: {
    marginTop: 20,
    textAlign: 'left',
    color: 'green', // Correction de la couleur à vert
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: 'green', // Mise à jour de la couleur à vert
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  qrCode: {
    width: 100,
    height: 100,
    marginTop: 10, // Ajustement pour l'espacement
    alignSelf: 'center', // Centrer horizontalement
  }
});

const DevisPDF = ({ devis }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const qrCodeData = "https://rayonverts.com/";
    QRCode.toDataURL(qrCodeData, (err, url) => {
      if (err) {
        console.error(err);
      } else {
        setQrCodeUrl(url);
      }
    });
  }, []);

  const {
    companyInfo = {},
    invoiceInfo = {},
    billTo = {},
    services = [],
    subtotal = 0,
    vatAmount = 0,
    total = 0,
    userName = ''  // Ajout du champ utilisateur
  } = devis || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <View style={styles.companyDetails}>
            {companyInfo.logo && <Image src={companyInfo.logo} style={styles.logo} />}
            <Text>{companyInfo.name}</Text>
            <Text>{companyInfo.address}</Text>
            <Text>{companyInfo.phone}</Text>
            <Text>{companyInfo.email}</Text>
            <Text>{companyInfo.taxNumber}</Text>
          </View>
          <View style={styles.devisDetailsSection}>
            <Text>Numéro : {invoiceInfo.number}</Text>
            <Text>Date : {invoiceInfo.date}</Text>
            {qrCodeUrl && (
              <View style={styles.qrCode}>
                <Image src={qrCodeUrl} />
              </View>
            )}
          </View>
        </View>
        <View style={styles.devisTitleSection}>
          <Text>DEVIS</Text>
        </View>
        <View style={styles.billingSection}>
          <Text style={styles.label}>Client :</Text>
          <Text>{billTo.company}</Text>
          <Text>{billTo.address}</Text>
          <Text>{billTo.phone}</Text>
          <Text>{billTo.email}</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Description du service</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Libellé</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Quantité</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Prix Unitaire ({invoiceInfo.currency})</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Montant ({invoiceInfo.currency})</Text>
            </View>
          </View>
          {services.map((service, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{service.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{service.libelle}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{service.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{parseFloat(service.unitPrice).toFixed(2)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{(parseFloat(service.unitPrice) * parseFloat(service.quantity)).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.totalsSection}>
          <Text>Sous-total : {invoiceInfo.currency} {subtotal.toFixed(2)}</Text>
          <Text>TVA ({invoiceInfo.vatPercent}%) : {invoiceInfo.currency} {vatAmount.toFixed(2)}</Text>
          <Text className="total">Total : {invoiceInfo.currency} {total.toFixed(2)}</Text>
        </View>
       
        <View style={styles.paymentInfoSection}>
          <Text>Banque : Rawbank | Compte : 05100 05101 01039948802-77 (EURO) | Compte : 05100 05101 01039948801-80 (USD)</Text>
        </View>
        <View style={styles.footer}>
          <Text>Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G</Text>
          <Text>Devis proposé par : {userName}</Text> {/* Ajout du champ utilisateur */}
        </View>
      </Page>
    </Document>
  );
}

export default DevisPDF;
