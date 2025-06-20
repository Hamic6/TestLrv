import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, updateDoc, doc, increment } from "firebase/firestore";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, Paper, TextField
} from "@mui/material";

const GestionReception = () => {
  const [bonsReception, setBonsReception] = useState([]);

  useEffect(() => {
    const fetchBonsReception = async () => {
      const snap = await getDocs(collection(db, "bon_de_reception"));
      setBonsReception(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchBonsReception();
  }, []);

  const handleQuantiteRecueChange = (brId, articleId, value) => {
    setBonsReception(bonsReception =>
      bonsReception.map(br =>
        br.id !== brId
          ? br
          : {
              ...br,
              articles: br.articles.map(a =>
                a.articleId !== articleId
                  ? a
                  : { ...a, quantite_recue: value }
              ),
            }
      )
    );
  };

  const handleValidateReception = async (br) => {
    // Incrémente le stock pour chaque article reçu
    for (const art of br.articles) {
      if (!art.articleId) continue;
      const articleRef = doc(db, "articles", art.articleId);
      await updateDoc(articleRef, {
        stock: increment(Number(art.quantite_recue) || 0)
      });
    }
    await updateDoc(doc(db, "bon_de_reception", br.id), {
      statut: "validé",
      dateReception: new Date()
    });
    setBonsReception(bonsReception.map(b => b.id === br.id ? { ...b, statut: "validé" } : b));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Gestion des Bons de Réception</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Numéro</TableCell>
            <TableCell>Fournisseur</TableCell>
            <TableCell>Articles</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bonsReception.map(br => (
            <TableRow key={br.id}>
              <TableCell>{br.orderNumber}</TableCell>
              <TableCell>{br.fournisseur?.name}</TableCell>
              <TableCell>
                {br.articles.map(a => (
                  <div key={a.articleId}>
                    {a.name} :&nbsp;
                    <TextField
                      type="number"
                      size="small"
                      value={a.quantite_recue}
                      onChange={e => handleQuantiteRecueChange(br.id, a.articleId, e.target.value)}
                      style={{ width: 60 }}
                      disabled={br.statut !== "en_attente"}
                    />
                    &nbsp;/ {a.quantite_commandee} {a.unit}
                  </div>
                ))}
              </TableCell>
              <TableCell>{br.statut}</TableCell>
              <TableCell>
                {br.statut === "en_attente" && (
                  <Button variant="contained" color="success" onClick={() => handleValidateReception(br)}>
                    Valider la réception
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default GestionReception;