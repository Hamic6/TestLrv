import React, { useEffect, useState } from "react";
import { Document, Page, Text, View, Image, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import QRCode from "qrcode";

// Styles similaires à Bdlpdf
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
  fournisseurSection: {
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

export function BdreceptionpdfDocument({ br, qrCodeUrl }) {
  if (!br) return null;

  const companyInfo = {
    logo: br.companyInfo?.logo || "/static/img/avatars/logo.png",
    name: "Le Rayon Vert",
    address: "01, Av. OUA (concession PROCOKI)",
    phone: "+243808317816",
    email: "direction@rayonverts.com",
    taxNumber: "Numéro impot :0801888M",
  };

  const {
    orderNumber = "",
    dateReception = "",
    fournisseur = {},
    articles = [],
    commentaire = "",
  } = br;

  // Formatage date
  const formattedDate =
    dateReception?.toDate?.().toLocaleDateString?.("fr-FR") ||
    (typeof dateReception === "string" ? dateReception : "-");

  // Pagination personnalisée : 4 articles sur la première page, 6 sur les suivantes
  const safeArticles = Array.isArray(articles)
    ? articles.filter(
        (a) =>
          a &&
          typeof a === "object" &&
          (typeof a.name === "string" || typeof a.productName === "string")
      )
    : [];
  const pages = [];
  if (safeArticles.length > 0) {
    let i = 0;
    pages.push(safeArticles.slice(i, i + 4));
    i += 4;
    while (i < safeArticles.length) {
      pages.push(safeArticles.slice(i, i + 6));
      i += 6;
    }
  } else {
    pages.push([]);
  }

  // Numérotation globale des articles
  let globalIndex = 0;

  return (
    <Document>
      {pages.map((articlesPage, pageIndex) => (
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
                <Text style={styles.documentTitle}>Bon de Réception</Text>
                <Text>N°: {orderNumber || "-"}</Text>
                <Text>Date: {formattedDate}</Text>
                {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrCode} />}
              </View>
            )}
          </View>

          {/* Informations fournisseur uniquement sur la première page */}
          {pageIndex === 0 && (
            <View style={styles.fournisseurSection}>
              <Text style={styles.sectionTitle}>Fournisseur</Text>
              <Text>{fournisseur.name || "-"}</Text>
              <Text>{fournisseur.address || "-"}</Text>
              <Text>
                {fournisseur.phone || "-"} {fournisseur.email ? " - " + fournisseur.email : ""}
              </Text>
            </View>
          )}

          {/* Tableau des articles */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>N°</Text>
              <Text style={[styles.tableHeaderCell, { width: "34%", textAlign: "left" }]}>Article</Text>
              <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Référence</Text>
              <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Qté reçue</Text>
              <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Unité</Text>
            </View>
            {articlesPage.length > 0 ? (
              articlesPage.map((art, index) => {
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
                    <Text style={[styles.tableCell, { width: "34%", textAlign: "left" }]}>
                      {(art.name ?? art.productName ?? "-") || "-"}
                    </Text>
                    <Text style={[styles.tableCell, { width: "18%" }]}>
                      {art.reference || "-"}
                    </Text>
                    <Text style={[styles.tableCell, { width: "20%" }]}>
                      {art.quantite_recue || "-"}
                    </Text>
                    <Text style={[styles.tableCell, { width: "20%" }]}>
                      {art.unit || "-"}
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

          {/* Commentaire uniquement sur la première page */}
          {pageIndex === 0 && commentaire && (
            <View style={{ marginTop: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 10, color: "#388e3c" }}>Commentaire : {commentaire}</Text>
            </View>
          )}

          {/* Signatures uniquement sur la dernière page */}
          {pageIndex === pages.length - 1 && (
            <View style={styles.signaturesContainer}>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>Le magasinier</Text>
                <View style={styles.signatureSpace} />
                <Text style={styles.signatureText}>Nom et signature</Text>
              </View>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>Le fournisseur</Text>
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
const Bdreceptionpdf = ({ br }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  useEffect(() => {
    const qrCodeData = "https://rayonverts.com/";
    QRCode.toDataURL(qrCodeData, (err, url) => {
      if (!err) setQrCodeUrl(url);
    });
  }, []);
  if (!br) return <div>Aucune donnée à afficher</div>;
  return (
    <PDFViewer width="100%" height={800}>
      <BdreceptionpdfDocument br={br} qrCodeUrl={qrCodeUrl} />
    </PDFViewer>
  );
};

export default Bdreceptionpdf;