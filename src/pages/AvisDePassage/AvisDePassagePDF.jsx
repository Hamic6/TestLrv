import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import QRCode from 'qrcode';

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
    textAlign: "center",
    width: "100%",
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
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

const AvisDePassagePDF = ({ avis }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const qrCodeData = "https://rayonverts.com/";
    QRCode.toDataURL(qrCodeData, (err, url) => {
      if (!err) setQrCodeUrl(url);
    });
  }, []);

  const {
    companyInfo = {},
    avisInfo = {},
    billTo = {},
    services = [],
  } = avis;

  // Pagination : 4 services sur la première page, 6 sur les suivantes
  const safeServices = Array.isArray(services) ? services : [];
  const pages = [];
  if (safeServices.length > 0) {
    let i = 0;
    pages.push(safeServices.slice(i, i + 4));
    i += 4;
    while (i < safeServices.length) {
      pages.push(safeServices.slice(i, i + 6));
      i += 6;
    }
  } else {
    pages.push([]);
  }

  let globalIndex = 0;

  return (
    <Document>
      {pages.map((servicesPage, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.companyHeader}>
              {companyInfo.logo && <Image src={companyInfo.logo} style={styles.logo} />}
              <Text style={styles.companyName}>{companyInfo.name || "Le Rayon Vert"}</Text>
              <Text>{companyInfo.address || "01, Av. OUA (concession PROCOKI)"}</Text>
              <Text>Tél: {companyInfo.phone || "+243808317816"}</Text>
              <Text>Email: {companyInfo.email || "direction@rayonverts.com"}</Text>
              <Text>{companyInfo.taxNumber || "Numéro impot :0801888M"}</Text>
            </View>
            {pageIndex === 0 && (
              <View style={styles.documentHeader}>
                <Text style={styles.documentTitle}>Avis de Passage</Text>
                <Text>N°: {avisInfo.number || "-"}</Text>
                <Text>Date: {avisInfo.date || "-"}</Text>
                <Text>Heure de début: {avisInfo.startTime || "-"}</Text>
                <Text>Heure de fin: {avisInfo.endTime || "-"}</Text>
                {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrCode} />}
              </View>
            )}
          </View>

          {/* Client uniquement sur la première page */}
          {pageIndex === 0 && (
            <View style={styles.clientSection}>
              <Text style={styles.sectionTitle}>Client</Text>
              <Text>{billTo.name || "-"}</Text>
              <Text>{billTo.company || "-"}</Text>
              <Text>{billTo.address || "-"}</Text>
              <Text>
                {billTo.phone || "-"} {billTo.email ? " - " + billTo.email : ""}
              </Text>
            </View>
          )}

          {/* Tableau des services */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>N°</Text>
              <Text style={[styles.tableHeaderCell, { width: "46%", textAlign: "left" }]}>Description du service</Text>
              <Text style={[styles.tableHeaderCell, { width: "46%" }]}>Libellé</Text>
            </View>
            {servicesPage.length > 0 ? (
              servicesPage.map((service, index) => {
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
                    <Text style={[styles.tableCell, { width: "46%", textAlign: "left" }]}>{service.description || "-"}</Text>
                    <Text style={[styles.tableCell, { width: "46%" }]}>{service.libelle || "-"}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "100%" }]}>Aucune donnée</Text>
              </View>
            )}
          </View>

          {/* Signatures uniquement sur la dernière page */}
          {pageIndex === pages.length - 1 && (
            <View style={styles.signaturesContainer}>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>L'agent</Text>
                <View style={styles.signatureSpace} />
                <Text style={styles.signatureText}>Nom et signature</Text>
              </View>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>Le client</Text>
                <View style={styles.signatureSpace} />
                <Text style={styles.signatureText}>Nom et signature</Text>
              </View>
            </View>
          )}

          {/* Numéro de page */}
          <Text style={styles.pageNumber}>
            Page {pageIndex + 1} / {pages.length}
          </Text>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>
              Le Rayon Vert Sarl - 01, Av. OUA (concession PROCOKI) - Tél: +243808317816
            </Text>
            <Text style={styles.legalMentions}>
              RCCM : 138-01049 - Ident Nat : 01-83-K28816G - Permis 137/CAB/MIN/ECN-T/15/JEB/2010
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default AvisDePassagePDF;

