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
  bdcTitleSection: {
    textAlign: "center",
    fontSize: 20,
    marginBottom: 20,
    color: "green",
  },
  bdcDetailsSection: {
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
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#e8f5e9",
    padding: 5,
  },
  tableCol: {
    width: "20%",
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
  totalsSection: {
    marginTop: 20,
    textAlign: "right",
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 5,
  },
  notesSection: {
    marginTop: 20,
    textAlign: "left",
    color: "green",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 8,
    color: "green",
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

// Composant PDF SANS hook
export function BdcpdfDocument({ bdc, qrCodeUrl }) {
  if (!bdc) return null;

  // Utilise le chemin absolu public pour le logo
  const companyInfo = {
    logo: bdc.companyInfo?.logo || "/static/img/avatars/logo.png",
    name: bdc.companyInfo?.name || "Le Rayon Vert Sarl",
    address: bdc.companyInfo?.address || "123 Avenue, Ville, Pays",
    phone: bdc.companyInfo?.phone || "+243 000 000 000",
    email: bdc.companyInfo?.email || "contact@rayonverts.com",
    taxNumber: bdc.companyInfo?.taxNumber || "RCCM : 138-01049 - Ident Nat : 01-83-K28816G",
  };

  const {
    orderNumber = "",
    date = "",
    client = {},
    entries = [],
    grandTotal = 0,
    userName = "",
  } = bdc;

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
          <View style={styles.bdcDetailsSection}>
            <Text>Numéro : {orderNumber}</Text>
            <Text>Date : {date?.toDate?.().toLocaleDateString?.() || ""}</Text>
            {qrCodeUrl && (
              <View style={styles.qrCode}>
                <Image src={qrCodeUrl} />
              </View>
            )}
          </View>
        </View>
        <View style={styles.bdcTitleSection}>
          <Text>BON DE COMMANDE</Text>
        </View>
        <View style={styles.billingSection}>
          <Text style={styles.label}>Partenaire :</Text>
          <Text>{client.name}</Text>
          <Text>{client.address}</Text>
          <Text>{client.phone}</Text>
          <Text>{client.email}</Text>
          {/* Affichage du responsable */}
          {client.responsable && (
            <Text>Responsable : {client.responsable}</Text>
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
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Prix Unitaire (USD)</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Montant (USD)</Text>
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
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{parseFloat(entry.unitPrice).toFixed(2)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {(parseFloat(entry.unitPrice) * parseFloat(entry.quantity)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.totalsSection}>
          <Text>Total : USD {parseFloat(grandTotal).toFixed(2)}</Text>
        </View>
        <View style={styles.footerContainer}>
          <View style={styles.footerLine} />
          <View style={styles.footer}>
            <Text>Le Rayon Vert Sarl Permis 137/CAB/MIN/ECN-T/15/JEB/2010 RCCM : 138-01049 - Ident Nat : 01-83-K28816G</Text>
            <Text>Bon de commande généré par : {userName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// Aperçu React avec hook (pour la modale)
const Bdcpdf = ({ bdc }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  useEffect(() => {
    const qrCodeData = "https://rayonverts.com/";
    QRCode.toDataURL(qrCodeData, (err, url) => {
      if (!err) setQrCodeUrl(url);
    });
  }, []);
  if (!bdc) return <div>Aucune donnée à afficher</div>;
  return (
    <PDFViewer width="100%" height={800}>
      <BdcpdfDocument bdc={bdc} qrCodeUrl={qrCodeUrl} />
    </PDFViewer>
  );
};

export default Bdcpdf;