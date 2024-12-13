import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

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
  avisTitleSection: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    color: 'green',
  },
  avisDetailsSection: {
    flex: 1,
    paddingLeft: 20,
    textAlign: 'right',
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
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f3f3f3',
    padding: 5,
  },
  tableCol: {
    width: '50%',
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
  image: {
    width: 50,
    height: 50,
    marginBottom: 15,
  },
  signature: {
    width: 150,
    height: 50,
  },
  section: {
    marginBottom: 20,
  }
});

// Créez un composant Document pour le PDF
const AvisDePassagePDF = ({ avis }) => {
  const {
    companyInfo,
    avisInfo,
    billTo,
    services,
    additionalNotes,
    photo,
    signature
  } = avis;

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
            <Text>{companyInfo.taxNumber}</Text> {/* Ajout du numéro d'impôt */}
          </View>
          <View style={styles.avisDetailsSection}>
            <Text>#{avisInfo.number}</Text>
            <Text>Date : {avisInfo.date}</Text>
          </View>
        </View>
        <View style={styles.avisTitleSection}>
          <Text>AVIS DE PASSAGE</Text>
        </View>
        <View style={styles.billingSection}>
          <Text>Facturé à :</Text>
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
          </View>
          {services.map((service, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{service.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{service.libelle}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.notesSection}>
          <Text>Notes supplémentaires :</Text>
          <Text>{additionalNotes}</Text>
        </View>
        {photo && (
          <View style={styles.section}>
            <Text>Photo :</Text>
            <Image style={styles.image} src={photo} />
          </View>
        )}
        {signature && (
          <View style={styles.section}>
            <Text>Signature :</Text>
            <Image style={styles.signature} src={signature} />
          </View>
        )}
        <View style={styles.footer}>
          <Text>Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G</Text>
        </View>
      </Page>
    </Document>
  );
}

export default AvisDePassagePDF;
