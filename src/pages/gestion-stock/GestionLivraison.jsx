import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, Paper, Menu, MenuItem, TableContainer, useMediaQuery,
  Dialog, DialogTitle, DialogContent, IconButton, Box
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import QRCode from "qrcode";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Bdlpdf, { BdlpdfDocument } from "./Bdlpdf"; // Utilise le PDF des bons de livraison

const GestionLivraison = () => {
  const [bons, setBons] = useState([]);
  const [filteredBons, setFilteredBons] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [openPdf, setOpenPdf] = useState(false);
  const [selectedBdc, setSelectedBdc] = useState(null);
  const [qrCodes, setQrCodes] = useState({});
  const [anchorElActions, setAnchorElActions] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchBons = async () => {
      const snap = await getDocs(collection(db, "bon_de_livraison"));
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setBons(list);
      setFilteredBons(list);
    };
    fetchBons();
  }, []);

  useEffect(() => {
    // Génère tous les QR codes à l'avance pour chaque bon (pour le téléchargement)
    const generateAllQRCodes = async () => {
      const codes = {};
      for (const bon of bons) {
        codes[bon.id] = await QRCode.toDataURL("https://rayonverts.com/");
      }
      setQrCodes(codes);
    };
    if (bons.length) generateAllQRCodes();
  }, [bons]);

  // Tri des bons selon le numéro
  useEffect(() => {
    const sorted = [...filteredBons].sort((a, b) => {
      const numA = Number(a.orderNumber);
      const numB = Number(b.orderNumber);
      return sortOrder === "asc" ? numA - numB : numB - numA;
    });
    setFilteredBons(sorted);
  }, [sortOrder, bons]);

  const handleOpenPdf = (bon) => {
    setSelectedBdc(bon);
    setOpenPdf(true);
    setAnchorElActions(null);
  };

  const handleClosePdf = () => {
    setOpenPdf(false);
    setSelectedBdc(null);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Gestion des Bons de Livraison</Typography>
      <Button
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      >
        Trier par numéro {sortOrder === "asc" ? "↓" : "↑"}
      </Button>
      <TableContainer sx={{ maxWidth: "100vw", overflowX: "auto" }}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              {!isMobile && <TableCell>Client</TableCell>}
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBons.map(bon => (
              <TableRow key={bon.id}>
                <TableCell>{bon.orderNumber}</TableCell>
                {!isMobile && <TableCell>{bon.client?.name}</TableCell>}
                <TableCell>
                  {bon.date?.toDate?.().toLocaleDateString?.() || ""}
                  {isMobile && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {bon.client?.name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {isMobile ? (
                    <>
                      <IconButton onClick={e => setAnchorElActions({ anchor: e.currentTarget, bon })}>
                        <PreviewOutlinedIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorElActions?.anchor}
                        open={Boolean(anchorElActions) && anchorElActions.bon.id === bon.id}
                        onClose={() => setAnchorElActions(null)}
                      >
                        <MenuItem onClick={() => handleOpenPdf(bon)}>
                          <PreviewOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Aperçu
                        </MenuItem>
                        <MenuItem
                          component={PDFDownloadLink}
                          document={<BdlpdfDocument bdl={bon} qrCodeUrl={qrCodes[bon.id] || ""} />}
                          fileName={`BDL_${bon.orderNumber || bon.id}.pdf`}
                          style={{ color: "inherit", textDecoration: "none" }}
                          onClick={() => setAnchorElActions(null)}
                        >
                          <PictureAsPdfOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Télécharger PDF
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <IconButton color="primary" onClick={() => handleOpenPdf(bon)}>
                        <PreviewOutlinedIcon />
                      </IconButton>
                      <PDFDownloadLink
                        document={
                          <BdlpdfDocument
                            bdl={bon}
                            qrCodeUrl={qrCodes[bon.id] || ""}
                          />
                        }
                        fileName={`BDL_${bon.orderNumber || bon.id}.pdf`}
                        style={{ textDecoration: "none", marginLeft: 8 }}
                      >
                        {({ loading }) => (
                          <IconButton color="error">
                            <PictureAsPdfOutlinedIcon />
                          </IconButton>
                        )}
                      </PDFDownloadLink>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredBons.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Aucun bon de livraison à afficher.
        </Typography>
      )}
      <Dialog
        open={openPdf}
        onClose={handleClosePdf}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Aperçu du Bon de Livraison</DialogTitle>
        <DialogContent sx={{ height: 900 }}>
          {selectedBdc && <Bdlpdf bdl={selectedBdc} />}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default GestionLivraison;