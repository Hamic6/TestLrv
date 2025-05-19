import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import QRCode from 'qrcode';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerSection: {
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
  avisTitleSection: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    color: 'green',
  },
  avisDetailsSection: {
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
    width: '100%',
    marginTop: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f3f3f3',
    padding: 10,
  },
  tableCol: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 10,
    height: 250,
  },
  tableCellHeader: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 12,
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
  },
});

const ADPmanuel = ({ avis = {} }) => {
  const {
    companyInfo = {},
    avisInfo = {},
    billTo = {},
    services = [],
    photos = [],
    signature = null,
    verifiedBy = '',
    verifiedDate = '',
  } = avis;

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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.headerSection}>
          <View style={styles.companyDetails}>
            {companyInfo.logo && <Image src={companyInfo.logo} style={styles.logo} />}
            <Text>{companyInfo.name || 'Nom de l\'entreprise'}</Text>
            <Text>{companyInfo.address || 'Adresse de l\'entreprise'}</Text>
            <Text>{companyInfo.phone || 'Téléphone'}</Text>
            <Text>{companyInfo.email || 'Email'}</Text>
            <Text>{companyInfo.taxNumber || 'Numéro fiscal'}</Text>
          </View>
          <View style={styles.avisDetailsSection}>
            <Text>Num Avis : __________________________</Text>
            <Text>Date : __________________________</Text>
            <Text>Heure de début : __________________________</Text>
            <Text>Heure de fin : __________________________</Text>
            {qrCodeUrl && (
              <Image src={qrCodeUrl} style={styles.qrCode} />
            )}
          </View>
        </View>

        {/* Titre */}
        <View style={styles.avisTitleSection}>
          <Text>AVIS DE PASSAGE</Text>
        </View>

        {/* Informations client */}
        <View style={styles.billingSection}>
          <Text>Client :</Text>
          <Text>Nom : __________________________</Text>
          <Text>Entreprise : __________________________</Text>
          <Text>Adresse : __________________________</Text>
          <Text>Téléphone : __________________________</Text>
          <Text>Email : __________________________</Text>
        </View>

        {/* Tableau des services */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Description du service</Text>
            </View>
            <View style={[styles.tableColHeader, { flex: 2 }]}>
              <Text style={styles.tableCellHeader}>Libellé</Text>
            </View>
          </View>
          {Array(5).fill(null).map((_, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>__________________________</Text>
              </View>
              <View style={[styles.tableCol, { flex: 2 }]}>
                <Text style={styles.tableCell}>__________________________</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ADPmanuel;