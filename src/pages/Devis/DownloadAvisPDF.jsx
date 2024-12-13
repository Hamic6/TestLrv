import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import AvisDePassagePDF from '@/pages/Devis/AvisDePassagePDF';

const DownloadAvisPDF = ({ avis }) => (
  <PDFDownloadLink
    document={<AvisDePassagePDF avis={avis} />}
    fileName="avis_de_passage.pdf"
  >
    {({ loading }) => (loading ? 'Génération du PDF...' : 'Télécharger le PDF')}
  </PDFDownloadLink>
);

export default DownloadAvisPDF;
