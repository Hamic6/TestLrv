import React, { useEffect, useState } from "react";
import { Document, Page, Text, View, Image, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import QRCode from "qrcode";

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  },
  headerSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    color: "black",
  },
  companyDetails: {
    flex: 1,
    paddingRight: 20,
    fontSize: 10,
    color: "black",
  },
  bdlTitleSection: {
    textAlign: "center",
    fontSize: 20,
    marginBottom: 20,
    color: "#388e3c", // vert
  },
  bdlDetailsSection: {
    flex: 1,
    paddingLeft: 20,
    textAlign: "center",
    color: "black",
  },
  billingSection: {
    marginBottom: 20,
  },
  table: {
    display: "table",
    width: "auto",
    marginTop: 20,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#e3f2fd",
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
  },
  tableCellHeader: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 10,
  },
  notesSection: {
    marginTop: 20,
    textAlign: "left",
    color: "#388e3c", // vert
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#388e3c", // vert
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
    alignSelf: "center",
  },
  footerContainer: {
    marginTop: "auto",
  },
  footerLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
    marginBottom: 5,
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    opacity: 0.1,
    width: 300,
    height: 300,
    zIndex: -1,
  },
});

// Composant PDF pour Bon de Livraison
export function BdlpdfDocument({ bdl, qrCodeUrl }) {
  if (!bdl) return null;

  // Utilise le chemin absolu public pour le logo
  const companyInfo = {
    logo: bdl.companyInfo?.logo || "/static/img/avatars/logo.png",
    name: "Le Rayon Vert",
    address: "01, Av. OUA (concession PROCOKI)",
    phone: "+243808317816",
    email: "direction@rayonverts.com",
    taxNumber: "Numéro impot :0801888M",
  };

  const {
    orderNumber = "",
    date = "",
    client = {},
    livreur = "",
    entries = [],
    userName = "",
  } = bdl;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Filigrane avec le logo */}
        {companyInfo.logo && (
          <Image
            src={companyInfo.logo}
            style={styles.watermark}
          />
        )}

        <View style={styles.headerSection}>
          <View style={styles.companyDetails}>
            {/* Affichage du logo en haut à gauche */}
            <Image src={companyInfo.logo} style={styles.logo} />
            <Text>{companyInfo.name}</Text>
            <Text>{companyInfo.address}</Text>
            <Text>{companyInfo.phone}</Text>
            <Text>{companyInfo.email}</Text>
            <Text>{companyInfo.taxNumber}</Text>
          </View>
          <View style={styles.bdlDetailsSection}>
            <Text>Numéro : {orderNumber}</Text>
            <Text>Date : {date?.toDate?.().toLocaleDateString?.() || ""}</Text>
            {qrCodeUrl && (
              <View style={styles.qrCode}>
                <Image src={qrCodeUrl} />
              </View>
            )}
          </View>
        </View>
        <View style={styles.bdlTitleSection}>
          <Text>BON DE LIVRAISON</Text>
        </View>
        <View style={styles.billingSection}>
          <Text style={styles.label}>Client :</Text>
          <Text>{client.name}</Text>
          <Text>{client.address}</Text>
          <Text>{client.phone}</Text>
          <Text>{client.email}</Text>
          {client.receveur && (
            <Text>Receveur : {client.receveur}</Text>
          )}
          {livreur && (
            <Text>Livreur : {livreur}</Text>
          )}
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Article</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Référence</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Quantité</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Unité</Text>
            </View>
          </View>
          {entries.map((entry, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{entry.name || entry.productName || ""}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{entry.reference}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{entry.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{entry.unit}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.notesSection}>
          <Text>Signature du livreur : ____________________________</Text>
          <Text>Signature du receveur : ___________________________</Text>
        </View>
        <View style={styles.footerContainer}>
          <View style={styles.footerLine} />
          <View style={styles.footer}>
            <Text>Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G</Text>
            <Text>Bon de livraison généré par : {userName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// Aperçu React avec hook (pour la modale)
const Bdlpdf = ({ bdl }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  useEffect(() => {
    const qrCodeData = "https://rayonverts.com/";
    QRCode.toDataURL(qrCodeData, (err, url) => {
      if (!err) setQrCodeUrl(url);
    });
  }, []);
  if (!bdl) return <div>Aucune donnée à afficher</div>;
  return (
    <PDFViewer width="100%" height={800}>
      <BdlpdfDocument bdl={bdl} qrCodeUrl={qrCodeUrl} />
    </PDFViewer>
  );
};

export default Bdlpdf;