import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Styles inspirés du Bdlpdf.jsx
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
  totalsSection: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#388e3c",
    marginBottom: 2,
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

// Fonction de pagination : 4 services sur la première page, 6 sur les suivantes
const paginateServices = (services) => {
  if (!Array.isArray(services)) return [[]];
  const pages = [];
  let i = 0;
  pages.push(services.slice(i, i + 4));
  i += 4;
  while (i < services.length) {
    pages.push(services.slice(i, i + 6));
    i += 6;
  }
  return pages;
};

// Composant principal
const Invoice1PDF = ({ invoice }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const qrCodeData = "https://rayonverts.com/";
    QRCode.toDataURL(qrCodeData, (err, url) => {
      if (!err) setQrCodeUrl(url);
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
  } = invoice;

  const subtotalFormatted = parseFloat(subtotal || 0).toFixed(2);
  const vatAmountFormatted = parseFloat(vatAmount || 0).toFixed(2);
  const totalFormatted = parseFloat(total || 0).toFixed(2);

  // Pagination des services
  const servicePages = paginateServices(services);
  let globalIndex = 0;

  return (
    <Document>
      {servicePages.map((servicesPage, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex}>
          {/* Bloc société sur toutes les pages */}
          <View style={styles.header}>
            <View style={styles.companyHeader}>
              {companyInfo.logo && <Image src={companyInfo.logo} style={styles.logo} />}
              <Text style={styles.companyName}>{companyInfo.name || "Le Rayon Vert"}</Text>
              <Text>{companyInfo.address || "01, Av. OUA (concession PROCOKI)"}</Text>
              <Text>Tél: {companyInfo.phone || "+243808317816"}</Text>
              <Text>Email: {companyInfo.email || "direction@rayonverts.com"}</Text>
              <Text>{companyInfo.taxNumber || "Numéro impot :0801888M"}</Text>
            </View>
            {/* Bloc facture, QR code uniquement sur la première page */}
            {pageIndex === 0 && (
              <View style={styles.documentHeader}>
                <Text style={styles.documentTitle}>Facture</Text>
                <Text>N°: LRV{invoiceInfo.number}</Text>
                <Text>Date: {invoiceInfo.date}</Text>
                {/* Ajout des deux nouveaux champs si renseignés */}
                {invoiceInfo.purchaseOrderNumber && (
                  <Text>Bon de commande : {invoiceInfo.purchaseOrderNumber}</Text>
                )}
                {invoiceInfo.deliveryNoticeNumber && (
                  <Text>Avis de passage : {invoiceInfo.deliveryNoticeNumber}</Text>
                )}
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
              <Text style={[styles.tableHeaderCell, { width: "6%" }]}>N°</Text>
              <Text style={[styles.tableHeaderCell, { width: "28%", textAlign: "left" }]}>Service(s)</Text>
              <Text style={[styles.tableHeaderCell, { width: "16%" }]}>Numéro d'avis de passage</Text>
              <Text style={[styles.tableHeaderCell, { width: "14%" }]}>Libellé</Text>
              <Text style={[styles.tableHeaderCell, { width: "16%" }]}>Quantité</Text>
              <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Montant</Text>
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
                    <Text style={[styles.tableCell, { width: "6%" }]}>{globalIndex}</Text>
                    <Text style={[styles.tableCell, { width: "28%", textAlign: "left" }]}>{service.description || "-"}</Text>
                    <Text style={[styles.tableCell, { width: "16%" }]}>{service.libelle || "-"}</Text>
                    <Text style={[styles.tableCell, { width: "14%" }]}>{service.deliveryNoticeNumber || "-"}</Text>
                    <Text style={[styles.tableCell, { width: "16%" }]}>{service.quantity || "-"}</Text>
                    <Text style={[styles.tableCell, { width: "20%" }]}>
                      {(parseFloat(service.unitPrice) * parseFloat(service.quantity)).toFixed(2)}
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

          {/* Totaux uniquement sur la dernière page */}
          {pageIndex === servicePages.length - 1 && (
            <View style={styles.totalsSection}>
              <Text style={styles.totalText}>
                Sous-total : {invoiceInfo.currency} {subtotalFormatted}
              </Text>
              <Text style={styles.totalText}>
                TVA ({invoiceInfo.vatPercent}%) : {invoiceInfo.currency} {vatAmountFormatted}
              </Text>
              <Text style={styles.totalText}>
                Total : {invoiceInfo.currency} {totalFormatted}
              </Text>
              <Text style={{ fontSize: 9, color: "#888", marginTop: 8 }}>
                Date d'échéance : {invoiceInfo.dueDate || 'Non spécifiée'}
              </Text>
            </View>
          )}

          {/* Numéro de page */}
          <Text
            style={{
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 10,
              color: "#666",
            }}
          >
            Page {pageIndex + 1} / {servicePages.length}
          </Text>

          {/* Footer sur chaque page */}
          <View style={styles.footer} fixed>
            <Text>
              Le Rayon Vert Sarl - 01, Av. OUA (concession PROCOKI) - Tél: +243808317816
            </Text>
            <Text style={styles.legalMentions}>
              RCCM : 138-01049 - Ident Nat : 01-83-K28816G - Permis 137/CAB/MIN/ECN-T/15/JEB/2010
            </Text>
            <Text style={styles.legalMentions}>
              Banque : Rawbank | Compte : 05100 05101 01039948802-77 (EURO) | 05100 05101 01039948801-80 (USD)
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default Invoice1PDF;
