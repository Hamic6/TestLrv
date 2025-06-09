import React, { useEffect, useState } from "react";
import { Document, Page, Text, View, Image, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import QRCode from "qrcode";

// Styles harmonisés avec Bdlpdf.jsx
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 11,
    backgroundColor: "#fff",
    color: "#222",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#388e3c",
    paddingBottom: 15,
    marginBottom: 20,
  },
  companyHeader: {
    width: "60%",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    paddingRight: 10,
  },
  documentHeader: {
    width: "40%",
    paddingLeft: 10,
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#388e3c",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  clientSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#388e3c",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: "#388e3c",
    flexDirection: "row",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    padding: 8,
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableRowAlternate: {
    backgroundColor: "#f9f9f9",
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 5,
  },
  legalMentions: {
    fontSize: 7,
    lineHeight: 1.2,
    marginTop: 5,
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 60,
    marginBottom: 20,
  },
  signatureBlock: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 10,
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  signatureSpace: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 5,
    width: "100%",
  },
  signatureText: {
    fontSize: 9,
    color: "#888",
    marginTop: 5,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  qrCode: {
    width: 60,
    height: 60,
    marginTop: 10,
    marginBottom: 5,
  },
});

export function BdcpdfDocument({ bdc, qrCodeUrl }) {
  if (!bdc) return null;

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

  // Pagination personnalisée : 4 articles sur la première page, 6 sur les suivantes
  const safeEntries = Array.isArray(entries)
    ? entries.filter(
        (e) =>
          e &&
          typeof e === "object" &&
          (typeof e.name === "string" || typeof e.productName === "string")
      )
    : [];
  const pages = [];
  if (safeEntries.length > 0) {
    let i = 0;
    pages.push(safeEntries.slice(i, i + 4));
    i += 4;
    while (i < safeEntries.length) {
      pages.push(safeEntries.slice(i, i + 6));
      i += 6;
    }
  } else {
    pages.push([]);
  }

  let globalIndex = 0;

  // Formatage date
  const formattedDate =
    date?.toDate?.().toLocaleDateString?.("fr-FR") ||
    (typeof date === "string" ? date : "-");

  return (
    <Document>
      {pages.map((entriesPage, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex}>
          {/* En-tête professionnel */}
          <View style={styles.header}>
            <View style={styles.companyHeader}>
              <Image src={companyInfo.logo} style={styles.logo} />
              <Text style={styles.companyName}>{companyInfo.name}</Text>
              <Text>{companyInfo.address}</Text>
              <Text>Tél: {companyInfo.phone}</Text>
              <Text>Email: {companyInfo.email}</Text>
              <Text>{companyInfo.taxNumber}</Text>
            </View>
            {pageIndex === 0 && (
              <View style={styles.documentHeader}>
                <Text style={styles.documentTitle}>Bon de Commande</Text>
                <Text>N°: {orderNumber || "-"}</Text>
                <Text>Date: {formattedDate}</Text>
                {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrCode} />}
              </View>
            )}
          </View>

          {/* Informations client uniquement sur la première page */}
          {pageIndex === 0 && (
            <View style={styles.clientSection}>
              <Text style={styles.sectionTitle}>Partenaire</Text>
              <Text>{client.name || "-"}</Text>
              <Text>{client.address || "-"}</Text>
              <Text>
                {client.phone || "-"} {client.email ? " - " + client.email : ""}
              </Text>
              {client.responsable && <Text>Responsable : {client.responsable}</Text>}
            </View>
          )}

          {/* Tableau des articles */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>N°</Text>
              <Text style={[styles.tableHeaderCell, { width: "22%", textAlign: "left" }]}>Article</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Référence</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Quantité</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Unité</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Prix Unitaire (USD)</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Montant (USD)</Text>
            </View>
            {entriesPage.length > 0 ? (
              entriesPage.map((entry, index) => {
                globalIndex++;
                return (
                  <View
                    style={[
                      styles.tableRow,
                      globalIndex % 2 === 0 && styles.tableRowAlternate,
                    ]}
                    key={index}
                  >
                    <Text style={[styles.tableCell, { width: "8%" }]}>{globalIndex}</Text>
                    <Text style={[styles.tableCell, { width: "22%", textAlign: "left" }]}>{entry.name || entry.productName || ""}</Text>
                    <Text style={[styles.tableCell, { width: "15%" }]}>{entry.reference}</Text>
                    <Text style={[styles.tableCell, { width: "15%" }]}>{entry.quantity}</Text>
                    <Text style={[styles.tableCell, { width: "15%" }]}>{entry.unit}</Text>
                    <Text style={[styles.tableCell, { width: "15%" }]}>{parseFloat(entry.unitPrice).toFixed(2)}</Text>
                    <Text style={[styles.tableCell, { width: "15%" }]}>
                      {(parseFloat(entry.unitPrice) * parseFloat(entry.quantity)).toFixed(2)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "100%" }]}>Aucune donnée</Text>
              </View>
            )}
          </View>

          {/* Total uniquement sur la dernière page */}
          {pageIndex === pages.length - 1 && (
            <View style={{ marginTop: 20, textAlign: "right", backgroundColor: "#f3f3f3", padding: 10, borderRadius: 5 }}>
              <Text>Total : USD {parseFloat(grandTotal).toFixed(2)}</Text>
              <Text>Bon de commande généré par : {userName}</Text>
            </View>
          )}

          {/* Signatures uniquement sur la dernière page */}
          {pageIndex === pages.length - 1 && (
            <View style={styles.signaturesContainer}>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>Le responsable</Text>
                <View style={styles.signatureSpace} />
                <Text style={styles.signatureText}>Nom et signature</Text>
              </View>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>Le partenaire</Text>
                <View style={styles.signatureSpace} />
                <Text style={styles.signatureText}>Nom et signature</Text>
              </View>
            </View>
          )}

          {/* Numéro de page */}
          <Text style={styles.pageNumber}>
            Page {pageIndex + 1} / {pages.length}
          </Text>

          {/* Footer professionnel */}
          <View style={styles.footer} fixed>
            <Text>
              {companyInfo.name} - {companyInfo.address} - Tél: {companyInfo.phone}
            </Text>
            <Text style={styles.legalMentions}>
              RCCM : 138-01049 - Ident Nat : 01-83-K28816G - Permis 137/CAB/MIN/ECN-T/15/JEB/2010
            </Text>
          </View>
        </Page>
      ))}
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