import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PDFViewer } from "@react-pdf/renderer";
import Invoice1PDF from "./Invoice1PDF";

const InvoicePreview = ({ open, onClose, invoice }) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogTitle>
      Aperçu de la facture
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: "absolute", right: 16, top: 16 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ height: 900, p: 0 }}>
      {invoice ? (
        <PDFViewer width="100%" height={850}>
          <Invoice1PDF invoice={invoice} />
        </PDFViewer>
      ) : (
        "Aucune facture à afficher."
      )}
    </DialogContent>
  </Dialog>
);

export default InvoicePreview;