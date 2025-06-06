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

const DevisPDF = ({ devis }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const qrCodeData = "https://rayonverts.com/";
    QRCode.toDataURL(qrCodeData, (err, url) => {
      if (!err) setQrCodeUrl(url);
    });
  }, []);

  const {
    companyInfo = {},
    invoiceInfo = {},
    billTo = {},
    services = [],
    subtotal = 0,
    vatAmount = 0,
    total = 0,
    userName = ''
  } = devis || {};

  // Limite à 4 services
  const displayedServices = Array.isArray(services) ? services.slice(0, 4) : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
          <View style={styles.documentHeader}>
            <Text style={styles.documentTitle}>PROFORMA</Text>
            <Text>N°: {invoiceInfo.number}</Text>
            <Text>Date: {invoiceInfo.date}</Text>
            {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrCode} />}
          </View>
        </View>

        {/* Client */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text>{billTo.name || "-"}</Text>
          <Text>{billTo.company || "-"}</Text>
          <Text>{billTo.address || "-"}</Text>
          <Text>
            {billTo.phone || "-"} {billTo.email ? " - " + billTo.email : ""}
          </Text>
        </View>

        {/* Tableau des services */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "8%" }]}>N°</Text>
            <Text style={[styles.tableHeaderCell, { width: "34%", textAlign: "left" }]}>Service</Text>
            <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Libellé</Text>
            <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Quantité</Text>
            <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Montant</Text>
          </View>
          {displayedServices.length > 0 ? (
            displayedServices.map((service, index) => (
              <View
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlternate,
                ]}
                key={index}
              >
                <Text style={[styles.tableCell, { width: "8%" }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { width: "34%", textAlign: "left" }]}>{service.description || "-"}</Text>
                <Text style={[styles.tableCell, { width: "18%" }]}>{service.libelle || "-"}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{service.quantity || "-"}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>
                  {(parseFloat(service.unitPrice) * parseFloat(service.quantity)).toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "100%" }]}>Aucune donnée</Text>
            </View>
          )}
        </View>

        {/* Totaux */}
        <View style={styles.totalsSection}>
          <Text style={styles.totalText}>
            Sous-total : {invoiceInfo.currency} {parseFloat(subtotal).toFixed(2)}
          </Text>
          <Text style={styles.totalText}>
            TVA ({invoiceInfo.vatPercent}%) : {invoiceInfo.currency} {parseFloat(vatAmount).toFixed(2)}
          </Text>
          <Text style={styles.totalText}>
            Total : {invoiceInfo.currency} {parseFloat(total).toFixed(2)}
          </Text>
        </View>

        {/* Footer */}
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
          <Text style={styles.legalMentions}>
            Proforma proposé par : {userName}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default DevisPDF;
