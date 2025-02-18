import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Créez des styles pour votre document PDF
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
  invoiceTitleSection: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    color: 'green',
  },
  invoiceDetailsSection: {
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
    color: 'black',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: 'green',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  qrCode: {
    width: 100,
    height: 100,
    marginTop: 10,
    alignSelf: 'center',
  }
});

// Créez un composant Document pour le PDF
const Invoice1PDF = ({ invoice }) => {
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
    companyInfo,
    invoiceInfo,
    billTo,
    services,
    subtotal,
    vatAmount,
    total,
    paymentInfo,
    additionalNotes,
  } = invoice;

  const subtotalFormatted = parseFloat(subtotal || 0).toFixed(2);
  const vatAmountFormatted = parseFloat(vatAmount || 0).toFixed(2);
  const totalFormatted = parseFloat(total || 0).toFixed(2);

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
          <View style={styles.invoiceDetailsSection}>
            <Text>LRV{invoiceInfo.number}</Text>
            <Text>Date : {invoiceInfo.date}</Text>
            {qrCodeUrl && (
              <View style={styles.qrCode}>
                <Image src={qrCodeUrl} />
              </View>
            )}
          </View>
        </View>
        <View style={styles.invoiceTitleSection}>
          <Text>FACTURE</Text>
        </View>
        <View style={styles.billingSection}>
          <Text style={styles.label}>Facturé à :</Text>
          <Text>{billTo.name}</Text>
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
          <Text>Sous-total : {invoiceInfo.currency} {subtotalFormatted}</Text>
          <Text>TVA ({invoiceInfo.vatPercent}%) : {invoiceInfo.currency} {vatAmountFormatted}</Text>
          <Text>Total : {invoiceInfo.currency} {totalFormatted}</Text>
        </View>
        <View style={styles.paymentInfoSection}>
          <Text>{paymentInfo}</Text>
        </View>
        <View style={styles.footer}>
          <Text>{additionalNotes}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default Invoice1PDF;
