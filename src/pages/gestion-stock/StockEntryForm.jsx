import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { addDoc, collection, getDocs, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  TextField,
  Grid,
  Button,
  Snackbar,
  Alert,
  Paper,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete"; // Ajout pour l'autocomplete

const StockEntryForm = () => {
  // Infos entreprise (fixes)
  const companyInfo = {
    name: "Le Rayon Vert",
    address: "01, Av. OUA (concession PROCOKI)",
    phone: "+243808317816",
    email: "direction@rayonverts.com",
    taxNumber: "Numéro impot :0801888M"
  };

  // Ajout récupération automatique du nom utilisateur connecté
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        setUserName(user.displayName || "Utilisateur");
      }
    });
    return () => unsubscribe();
  }, []);

  // Numéro de bon de commande auto-incrémenté
  const [orderNumber, setOrderNumber] = useState("");
  useEffect(() => {
    const fetchOrderNumber = async () => {
      const lastNumberDoc = await getDoc(doc(db, 'metadata', 'lastOrderNumber'));
      let lastOrderNumber = 0;
      if (lastNumberDoc.exists()) {
        lastOrderNumber = lastNumberDoc.data().number;
      }
      setOrderNumber((lastOrderNumber + 1).toString().padStart(4, '0'));
    };
    fetchOrderNumber();
  }, []);

  // Liste des clients (partenaires)
  const [clients, setClients] = useState([]);
  useEffect(() => {
    const fetchClients = async () => {
      const snap = await getDocs(collection(db, "clients"));
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();
  }, []);

  // Sélection du client/partenaire
  const [selectedClient, setSelectedClient] = useState("");
  const [clientInfo, setClientInfo] = useState({ name: "", address: "", phone: "", email: "", responsable: "" });
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      if (client) setClientInfo(client);
    }
  }, [selectedClient, clients]);

  // Liste des articles (à charger depuis Firestore)
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "articles"));
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  // Entrées d’articles
  const [entries, setEntries] = useState([
    { productId: "", reference: "", quantity: "", unit: "", unitPrice: "", total: "" }
  ]);

  // Ajout/suppression d’articles
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
              unitPrice: selectedProduct?.unitPrice || "",
              unit: selectedProduct?.unit || "",
            };
          }
          return { ...entry, [name]: value };
        }
        return entry;
      })
    );
  };
  const addEntry = () => setEntries([...entries, { productId: "", reference: "", quantity: "", unit: "", unitPrice: "", total: "" }]);
  const removeEntry = (index) => setEntries(entries.filter((_, i) => i !== index));

  // Calcul du total
  const calculateGrandTotal = () =>
    entries.reduce((sum, entry) => sum + (Number(entry.quantity) * Number(entry.unitPrice) || 0), 0);

  // Alertes et chargement
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      setAlertMessage("Veuillez sélectionner un partenaire.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    for (const entry of entries) {
      if (!entry.productId || !entry.quantity || Number(entry.quantity) <= 0 || !entry.unitPrice || Number(entry.unitPrice) <= 0) {
        setAlertMessage("Veuillez remplir tous les champs obligatoires avec des valeurs valides.");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }
    }
    setLoading(true);
    try {
      // Incrémente le numéro de bon
      await setDoc(doc(db, 'metadata', 'lastOrderNumber'), { number: Number(orderNumber) });

      // Récupère les articles sélectionnés pour les stocker dans le bon de commande
      const articles = entries.map(entry => {
        const product = products.find(p => p.id === entry.productId) || {};
        return {
          ...entry,
          name: product.name || "",
          reference: entry.reference || "",
          unit: entry.unit || "",
          unitPrice: entry.unitPrice || "",
          quantity: entry.quantity || "",
          article: product, // ou null si tu préfères
        };
      });

      // Ajout du bon de commande (avec les entrées et les articles)
      await addDoc(collection(db, "bon_de_commande"), {
        orderNumber,
        companyInfo,
        client: clientInfo,
        entries: articles,
        grandTotal: calculateGrandTotal().toFixed(2),
        date: serverTimestamp(),
        userId: auth?.currentUser?.uid || null,
        userName,
      });

      setAlertMessage("Entrée de stock enregistrée avec succès !");
      setAlertSeverity("success");
      setAlertOpen(true);
      setEntries([{ productId: "", reference: "", quantity: "", unit: "", unitPrice: "", total: "" }]);
      setSelectedClient("");
      setClientInfo({ name: "", address: "", phone: "", email: "", responsable: "" });
    } catch (error) {
      setAlertMessage("Erreur lors de l'enregistrement de l'entrée de stock.");
      setAlertSeverity("error");
      setAlertOpen(true);
      console.error("Erreur lors de l'enregistrement :", error);
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, margin: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Bon de Commande (Entrée de Stock)
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        N° Bon de commande : <b>{orderNumber}</b>
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Partenaires</InputLabel>
              <Select
                value={selectedClient}
                label="Partenaires"
                onChange={e => setSelectedClient(e.target.value)}
              >
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              color="primary"
              href="/facturation/gestion-des-clients"
              sx={{ mt: 1 }}
              fullWidth
            >
              Ajouter un partenaire
            </Button>
          </Grid>
          {/* Affiche les infos du client sélectionné */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Responsable"
              value={clientInfo.responsable || ""}
              onChange={e => setClientInfo({ ...clientInfo, responsable: e.target.value })}
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
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={products}
                getOptionLabel={option => option.name || ""}
                value={products.find(p => p.id === entry.productId) || null}
                onChange={(e, value) =>
                  handleEntryChange(index, { target: { name: "productId", value: value ? value.id : "" } })
                }
                renderInput={params => (
                  <TextField {...params} label="Article" required />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    {option.name} {option.reference ? `- ${option.reference}` : ""}
                  </li>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                name="reference"
                label="Référence"
                value={entry.reference}
                onChange={e => handleEntryChange(index, e)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
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
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth required>
                <InputLabel>Unité</InputLabel>
                <Select
                  name="unit"
                  value={entry.unit}
                  label="Unité"
                  onChange={e => handleEntryChange(index, e)}
                >
                  <MenuItem value="pcs">Pièce</MenuItem>
                  <MenuItem value="boite">Boîte</MenuItem>
                  <MenuItem value="kg">Kg</MenuItem>
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="L">Litre</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                name="unitPrice"
                label="Prix Unitaire (USD)"
                type="number"
                value={entry.unitPrice}
                onChange={e => handleEntryChange(index, e)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={1} sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {Number(entry.quantity) > 0 && Number(entry.unitPrice) > 0
                  ? ` ${(Number(entry.quantity) * Number(entry.unitPrice)).toFixed(2)} $`
                  : ""}
              </Typography>
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
        <Typography variant="h6" sx={{ mt: 2 }}>
          Total : {calculateGrandTotal()} USD
        </Typography>
        <TextField
          label="Utilisateur"
          value={userName}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          size="small"
          sx={{ mt: 2, minWidth: 150 }}
        >
          {loading ? "Enregistrement..." : "Enregistrer l'entrée"}
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

export default StockEntryForm;