import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { addDoc, collection, getDocs, serverTimestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  TextField, Grid, Button, Snackbar, Alert, Paper, Typography,
  MenuItem, Select, InputLabel, FormControl
} from "@mui/material";

const StockOutForm = () => {
  // Numéro de bon de livraison auto-incrémenté
  const [orderNumber, setOrderNumber] = useState("");
  useEffect(() => {
    const fetchOrderNumber = async () => {
      const lastNumberDoc = await getDoc(doc(db, 'metadata', 'lastDeliveryNumber'));
      let lastDeliveryNumber = 0;
      if (lastNumberDoc.exists()) {
        lastDeliveryNumber = lastNumberDoc.data().number;
      }
      setOrderNumber((lastDeliveryNumber + 1).toString().padStart(4, '0'));
    };
    fetchOrderNumber();
  }, []);

  // Clients
  const [clients, setClients] = useState([]);
  useEffect(() => {
    const fetchClients = async () => {
      const snap = await getDocs(collection(db, "clients"));
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();
  }, []);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientInfo, setClientInfo] = useState({ name: "", address: "", phone: "", email: "", receveur: "" });
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      if (client) setClientInfo({ ...client, receveur: "" });
    }
  }, [selectedClient, clients]);

  // Champ livreur
  const [livreur, setLivreur] = useState("");

  // Articles
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "articles"));
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);
  const [entries, setEntries] = useState([
    { productId: "", reference: "", quantity: "", unit: "" }
  ]);
  const handleEntryChange = (index, e) => {
    const { name, value } = e.target;
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i === index) {
          if (name === "productId") {
            const selectedProduct = products.find(p => p.id === value);
            return {
              ...entry,
              productId: value,
              reference: selectedProduct?.reference || "",
              unit: selectedProduct?.unit || "",
            };
          }
          return { ...entry, [name]: value };
        }
        return entry;
      })
    );
  };
  const addEntry = () => setEntries([...entries, { productId: "", reference: "", quantity: "", unit: "" }]);
  const removeEntry = (index) => setEntries(entries.filter((_, i) => i !== index));

  // Alertes
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      setAlertMessage("Veuillez sélectionner un client.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    if (!livreur) {
      setAlertMessage("Veuillez renseigner le nom du livreur.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    for (const entry of entries) {
      if (!entry.productId || !entry.quantity || Number(entry.quantity) <= 0) {
        setAlertMessage("Veuillez remplir tous les champs obligatoires avec des valeurs valides.");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }
    }
    setLoading(true);
    try {
      await setDoc(doc(db, 'metadata', 'lastDeliveryNumber'), { number: Number(orderNumber) });

      // Ajout du nom de l'article dans chaque entrée
      const entriesWithName = entries.map(entry => ({
        ...entry,
        name: products.find(p => p.id === entry.productId)?.name || "",
      }));

      await addDoc(collection(db, "bon_de_livraison"), {
        orderNumber,
        client: { ...clientInfo, receveur: clientInfo.receveur },
        livreur,
        entries: entriesWithName,
        date: serverTimestamp(),
        userId: auth?.currentUser?.uid || null,
        validated: false,
      });

      // Décrémente le stock et ajoute un mouvement de sortie pour chaque article
      for (const entry of entriesWithName) {
        await addDoc(collection(db, "stockMovements"), {
          productId: entry.productId,
          name: entry.name,
          reference: entry.reference,
          unit: entry.unit,
          quantity: entry.quantity,
          orderNumber,
          type: "sortie",
          createdAt: serverTimestamp(),
          userId: auth?.currentUser?.uid || null,
        });

        // Mise à jour du stock dans la fiche article
        const articleRef = doc(db, "articles", entry.productId);
        const articleSnap = await getDoc(articleRef);
        let oldStock = 0;
        if (articleSnap.exists() && articleSnap.data().stock) {
          oldStock = Number(articleSnap.data().stock);
        }
        const newStock = oldStock - Number(entry.quantity);
        await updateDoc(articleRef, { stock: newStock });
      }

      setAlertMessage("Bon de livraison enregistré avec succès !");
      setAlertSeverity("success");
      setAlertOpen(true);
      setEntries([{ productId: "", reference: "", quantity: "", unit: "" }]);
      setSelectedClient("");
      setClientInfo({ name: "", address: "", phone: "", email: "", receveur: "" });
      setLivreur("");
    } catch (error) {
      setAlertMessage("Erreur lors de l'enregistrement du bon de livraison.");
      setAlertSeverity("error");
      setAlertOpen(true);
      console.error("Erreur lors de l'enregistrement :", error);
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, margin: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Bon de Livraison (Sortie de Stock)
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        N° Bon de livraison : <b>{orderNumber}</b>
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Client</InputLabel>
              <Select
                value={selectedClient}
                label="Client"
                onChange={e => setSelectedClient(e.target.value)}
              >
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Receveur"
              value={clientInfo.receveur || ""}
              onChange={e => setClientInfo({ ...clientInfo, receveur: e.target.value })}
              fullWidth
              sx={{ mb: 1 }}
            />
            <TextField
              label="Livreur"
              value={livreur}
              onChange={e => setLivreur(e.target.value)}
              fullWidth
              sx={{ mb: 1 }}
            />
            <Typography variant="body2">
              {clientInfo.address && <>Adresse : {clientInfo.address}<br /></>}
              {clientInfo.phone && <>Téléphone : {clientInfo.phone}<br /></>}
              {clientInfo.email && <>Email : {clientInfo.email}<br /></>}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="h6" sx={{ mt: 2 }}>Articles</Typography>
        {entries.map((entry, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Article</InputLabel>
                <Select
                  name="productId"
                  value={entry.productId}
                  label="Article"
                  onChange={e => handleEntryChange(index, e)}
                >
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="reference"
                label="Référence"
                value={entry.reference}
                onChange={e => handleEntryChange(index, e)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="quantity"
                label="Quantité"
                type="number"
                value={entry.quantity}
                onChange={e => handleEntryChange(index, e)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={1} sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
              <Button
                color="error"
                onClick={() => removeEntry(index)}
                disabled={entries.length === 1}
                size="small"
              >
                Supprimer
              </Button>
            </Grid>
          </Grid>
        ))}
        <Button onClick={addEntry} sx={{ mb: 2 }}>
          Ajouter un article
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          size="small"
          sx={{ mt: 2, minWidth: 150 }}
        >
          {loading ? "Enregistrement..." : "Enregistrer la sortie"}
        </Button>
      </form>
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default StockOutForm;