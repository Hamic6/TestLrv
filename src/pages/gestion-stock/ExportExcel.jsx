import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const ExportExcel = ({ articles }) => {
  const handleExport = () => {
    if (!articles || articles.length === 0) return;
    const data = articles.map(a => ({
      Nom: a.name,
      Référence: a.reference,
      Catégorie: a.category,
      Unité: a.unit,
      Description: a.description,
      Stock: a.stock,
      Seuil: a.seuil,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Articles");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "articles.xlsx");
  };

  return (
    <Button
      variant="outlined"
      color="success"
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      sx={{ mb: 2, ml: 1 }}
    >
      Exporter XLSX
    </Button>
  );
};

export default ExportExcel;