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
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f3f3f3',
    padding: 5,
  },
  tableCol: {
    flex: 1,
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
  image: {
    width: 40,
    height: 40,
    marginBottom: 10,
    marginRight: 5,
  },
  signature: {
    width: 150,
    height: 50,
  },
  section: {
    marginBottom: 20,
  },
  photoGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  qrCode: {
    width: 100,
    height: 100,
    marginTop: 10,
    alignSelf: 'center',
  },
  footerContainer: {
    marginTop: 'auto',
  },
  footerLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    marginBottom: 5,
  },
});

const AvisDePassagePDF = ({ avis }) => {
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
    avisInfo = {},
    billTo = {},
    services = [],
    photos = [],
    signature = '',
    verifiedBy = '',
    verifiedDate = '',
    comments = '',
  } = avis;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Filigrane avec le logo */}
        {companyInfo.logo && (
          <Image
            src={companyInfo.logo}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.1,
              width: 300,
              height: 300,
              zIndex: -1,
            }}
          />
        )}

        <View style={styles.headerSection}>
          <View style={styles.companyDetails}>
            {companyInfo.logo && <Image src={companyInfo.logo} style={styles.logo} />}
            <Text>{companyInfo.name || 'Nom de l\'entreprise non spécifié'}</Text>
            <Text>{companyInfo.address || 'Adresse non spécifiée'}</Text>
            <Text>{companyInfo.phone || 'Téléphone non spécifié'}</Text>
            <Text>{companyInfo.email || 'Email non spécifié'}</Text>
            <Text>{companyInfo.taxNumber || 'Numéro d\'impôt non spécifié'}</Text>
          </View>
          <View style={styles.avisDetailsSection}>
            <Text>Num Avis : {avisInfo.number || 'Non spécifié'}</Text>
            <Text>Date : {avisInfo.date || 'Non spécifiée'}</Text>
            <Text>Heure de début : {avisInfo.startTime || 'Non spécifiée'}</Text>
            <Text>Heure de fin : {avisInfo.endTime || 'Non spécifiée'}</Text>
            {qrCodeUrl && (
              <View style={styles.qrCode}>
                <Image src={qrCodeUrl} />
              </View>
            )}
          </View>
        </View>
        <View style={styles.avisTitleSection}>
          <Text>AVIS DE PASSAGE</Text>
        </View>
        <View style={styles.billingSection}>
          <Text>Client :</Text>
          <Text>{billTo.name || 'Nom non spécifié'}</Text>
          <Text>{billTo.company || 'Entreprise non spécifiée'}</Text>
          <Text>{billTo.address || 'Adresse non spécifiée'}</Text>
          <Text>{billTo.phone || 'Téléphone non spécifié'}</Text>
          <Text>{billTo.email || 'Email non spécifié'}</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Description du service</Text>
            </View>
            <View style={[styles.tableColHeader, { flex: 2 }]}>
              <Text style={styles.tableCellHeader}>Libellé</Text>
            </View>
          </View>
          {services.map((service, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{service.description || 'Non spécifié'}</Text>
              </View>
              <View style={[styles.tableCol, { flex: 2 }]}>
                <Text style={styles.tableCell}>{service.libelle || 'Non spécifié'}</Text>
              </View>
            </View>
          ))}
        </View>
        {photos.length > 0 && (
          <View style={styles.section}>
            <Text>Photos :</Text>
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <Image key={index} style={styles.image} src={photo} />
              ))}
            </View>
          </View>
        )}
        {comments && (
          <View style={styles.section}>
            <Text>Commentaire :</Text>
            <Text>{comments}</Text>
          </View>
        )}
        {signature && (
          <View style={styles.section}>
            <Text>Signature :</Text>
            <Image style={styles.signature} src={signature} />
            <Text>Travail vu et contrôlé par : {verifiedBy || 'Non spécifié'}</Text>
            <Text>{verifiedDate || 'Non spécifiée'}</Text>
          </View>
        )}
        <View style={styles.footerContainer}>
          <View style={styles.footerLine} />
          <View style={styles.footer}>
            <Text>Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default AvisDePassagePDF;

