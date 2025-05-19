import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { addDoc, collection, getDocs, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
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

const StockEntryForm = () => {
  // Infos entreprise (fixes)
  const companyInfo = {
    name: "Le Rayon Vert",
    address: "01, Av. OUA (concession PROCOKI)",
    phone: "+243808317816",
    email: "direction@rayonverts.com",
    taxNumber: "Numéro impot :0801888M"
  };

  // Numéro de bon de commande auto-incrémenté
  const [orderNumber, setOrderNumber] = useState("");
  useEffect(() => {
    const getLastOrderNumber = async () => {
      const lastNumberDoc = await getDoc(doc(db, 'metadata', 'lastOrderNumber'));
      if (lastNumberDoc.exists()) {
        return lastNumberDoc.data().number;
      } else {
        await setDoc(doc(db, 'metadata', 'lastOrderNumber'), { number: 0 });
        return 0;
      }
    };
    const updateLastOrderNumber = async (number) => {
      await setDoc(doc(db, 'metadata', 'lastOrderNumber'), { number });
    };
    const generateOrderNumber = async () => {
      const lastOrderNumber = await getLastOrderNumber();
      const newOrderNumber = (lastOrderNumber + 1).toString().padStart(4, '0');
      setOrderNumber(newOrderNumber);
      await updateLastOrderNumber(parseInt(newOrderNumber, 10));
    };
    generateOrderNumber();
  }, []);

  // Clients
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientInfo, setClientInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    responsable: ""
  });

  // Articles
  const [entries, setEntries] = useState([
    { productId: "", quantity: "", unitPrice: "", total: "" , reference: "" }
  ]);
  const [products, setProducts] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [loading, setLoading] = useState(false);

  // Charger la liste des produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (error) {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // Charger la liste des clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsList);
      } catch (error) {
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  // Sélection d'un client
  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClient(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientInfo({
        name: client.name,
        address: client.address,
        phone: client.phone,
        email: client.email,
        responsable: client.responsable || ""
      });
    } else {
      setClientInfo({ name: "", address: "", phone: "", email: "", responsable: "" });
    }
  };

  // Permettre la modification manuelle des infos client
  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion des articles avec prix unitaire et total
  const handleEntryChange = (index, e) => {
    const { name, value } = e.target;
    const newEntries = [...entries];
    newEntries[index][name] = value;

    // Calcul automatique du total
    if (name === "quantity" || name === "unitPrice") {
      const quantity = Number(newEntries[index].quantity) || 0;
      const unitPrice = Number(newEntries[index].unitPrice) || 0;
      newEntries[index].total = (quantity * unitPrice).toFixed(2);
    }
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { productId: "", quantity: "", unitPrice: "", total: "", reference: "" }]);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Calcul du total général
  const calculateGrandTotal = () => {
    return entries.reduce((sum, entry) => sum + (parseFloat(entry.total) || 0), 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!selectedClient) {
      setAlertMessage("Veuillez sélectionner un client.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    for (const entry of entries) {
      if (
        !entry.productId ||
        !entry.quantity ||
        Number(entry.quantity) <= 0 ||
        !entry.unitPrice ||
        Number(entry.unitPrice) <= 0
      ) {
        setAlertMessage("Veuillez remplir tous les champs obligatoires avec des valeurs valides.");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }
    }
    setLoading(true);
    try {
      // Enregistrement dans la collection "bon_de_commande"
      await addDoc(collection(db, "bon_de_commande"), {
        orderNumber,
        companyInfo,
        client: {
          name: clientInfo.name,
          address: clientInfo.address,
          phone: clientInfo.phone,
          email: clientInfo.email,
          responsable: clientInfo.responsable,
        },
        entries,
        grandTotal: calculateGrandTotal(),
        date: serverTimestamp(),
        userId: auth?.currentUser?.uid || null,
        validated: true,
      });
      setAlertMessage("Bon de commande enregistré avec succès !");
      setAlertSeverity("success");
      setAlertOpen(true);
      setEntries([{ productId: "", quantity: "", unitPrice: "", total: "", reference: "" }]);
      setSelectedClient("");
      setClientInfo({ name: "", address: "", phone: "", email: "", responsable: "" });
      // Incrémente le numéro de bon de commande pour la prochaine saisie
      setOrderNumber((prev) => (parseInt(prev, 10) + 1).toString().padStart(4, '0'));
      await setDoc(doc(db, 'metadata', 'lastOrderNumber'), { number: parseInt(orderNumber, 10) });
    } catch (error) {
      setAlertMessage("Erreur lors de l'enregistrement du bon de commande.");
      setAlertSeverity("error");
      setAlertOpen(true);
      console.error("Erreur lors de l'enregistrement du bon de commande :", error);
    }
    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 900, margin: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Formulaire d'entrée de stock
      </Typography>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Informations de l'entreprise
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField label="Nom" value={companyInfo.name} fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Adresse" value={companyInfo.address} fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Téléphone" value={companyInfo.phone} fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email" value={companyInfo.email} fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Numéro d'impôt" value={companyInfo.taxNumber} fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="N° Bon de commande" value={orderNumber} fullWidth disabled />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Informations du client
        </Typography>
        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel id="client-select-label">Sélectionner un client</InputLabel>
          <Select
            labelId="client-select-label"
            value={selectedClient}
            label="Sélectionner un client"
            onChange={handleClientChange}
          >
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nom"
              name="name"
              value={clientInfo.name}
              onChange={handleClientInfoChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Adresse"
              name="address"
              value={clientInfo.address}
              onChange={handleClientInfoChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Téléphone"
              name="phone"
              value={clientInfo.phone}
              onChange={handleClientInfoChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              value={clientInfo.email}
              onChange={handleClientInfoChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Responsable"
              name="responsable"
              value={clientInfo.responsable}
              onChange={handleClientInfoChange}
              fullWidth
              placeholder="Nom du responsable"
            />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Articles
        </Typography>
        {entries.map((entry, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth required>
                <InputLabel id={`product-label-${index}`}>Article</InputLabel>
                <Select
                  labelId={`product-label-${index}`}
                  name="productId"
                  value={entry.productId}
                  label="Article"
                  onChange={(e) => handleEntryChange(index, e)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) return "Sélectionner ou saisir un article";
                    const found = products.find((p) => p.id === selected);
                    return found ? found.name : selected;
                  }}
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name || product.id}
                    </MenuItem>
                  ))}
                  <MenuItem value="">
                    <em>Autre (saisie manuelle)</em>
                  </MenuItem>
                </Select>
              </FormControl>
              {/* Champ pour saisir manuellement un article si aucun n'est sélectionné */}
              {(!entry.productId || !products.find((p) => p.id === entry.productId)) && (
                <TextField
                  label="Nom de l'article"
                  name="productId"
                  value={entry.productId}
                  onChange={(e) => handleEntryChange(index, e)}
                  fullWidth
                  sx={{ mt: 1 }}
                  placeholder="Saisir un article"
                />
              )}
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                required
                label="Quantité"
                name="quantity"
                type="number"
                inputProps={{ min: 1 }}
                value={entry.quantity}
                onChange={(e) => handleEntryChange(index, e)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                required
                label="Prix unitaire"
                name="unitPrice"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={entry.unitPrice}
                onChange={(e) => handleEntryChange(index, e)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Référence"
                name="reference"
                value={entry.reference}
                onChange={(e) => handleEntryChange(index, e)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Total"
                name="total"
                value={entry.total}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>
        ))}
        <Button
          type="button"
          variant="outlined"
          color="primary"
          onClick={addEntry}
          sx={{ mb: 2 }}
        >
          Ajouter une ligne
        </Button>
        <Typography variant="h6" sx={{ textAlign: "right", mb: 2 }}>
          Total général : {calculateGrandTotal()} USD
        </Typography>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? "Ajout en cours..." : "Enregistrer"}
        </Button>
      </form>
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default StockEntryForm;