import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  Box,
  TextField,
  Snackbar,
  Alert,
  CardActions,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  Stack,
  useMediaQuery
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTheme } from "@mui/material/styles";

const ManageArticle = () => {
  const [articles, setArticles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [search, setSearch] = useState("");
  const [clientStocks, setClientStocks] = useState({});
  const [loadingStock, setLoadingStock] = useState(true);
  const [selectedClient, setSelectedClient] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Récupération des articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "articles"));
        const articlesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArticles(articlesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des articles :", error);
      }
    };
    fetchArticles();
  }, []);

  // Calcul dynamique du stock par client
  useEffect(() => {
    const fetchStockByClient = async () => {
      setLoadingStock(true);
      try {
        const commandesSnap = await getDocs(collection(db, "bon_de_commande"));
        const livraisonsSnap = await getDocs(collection(db, "bon_de_livraison"));

        const clients = {};
        // Entrées (bons de commande)
        commandesSnap.docs.forEach(doc => {
          const data = doc.data();
          const clientId = data.client?.email || data.client?.name || "inconnu";
          if (!clients[clientId]) {
            clients[clientId] = {
              clientInfo: data.client,
              stockMap: {}
            };
          }
          if (Array.isArray(data.entries)) {
            data.entries.forEach(e => {
              if (!e.productId) return;
              clients[clientId].stockMap[e.productId] = (clients[clientId].stockMap[e.productId] || 0) + Number(e.quantity || 0);
            });
          }
        });

        // Sorties (bons de livraison)
        livraisonsSnap.docs.forEach(doc => {
          const data = doc.data();
          const clientId = data.client?.email || data.client?.name || "inconnu";
          if (!clients[clientId]) {
            clients[clientId] = {
              clientInfo: data.client,
              stockMap: {}
            };
          }
          // Correction ici : statut === "accepté" et entries
          if (data.statut === "accepté" && Array.isArray(data.entries)) {
            data.entries.forEach(e => {
              if (!e.productId) return;
              clients[clientId].stockMap[e.productId] = (clients[clientId].stockMap[e.productId] || 0) - Number(e.quantity || 0);
            });
          }
        });

        setClientStocks(clients);
      } catch (error) {
        console.error("Erreur lors du calcul du stock par client :", error);
      }
      setLoadingStock(false);
    };

    fetchStockByClient();
  }, []);

  const handleOpenModal = (article) => {
    setCurrentArticle(article);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setCurrentArticle(null);
    setOpenModal(false);
  };

  const handleSaveArticle = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const articleData = {
      name: formData.get('name'),
      reference: formData.get('reference'),
      category: formData.get('category'),
      unit: formData.get('unit'),
      description: formData.get('description'),
      photoURL: formData.get('photoURL'),
      seuil: formData.get('seuil') ? Number(formData.get('seuil')) : undefined
    };

    try {
      if (currentArticle) {
        await updateDoc(doc(db, "articles", currentArticle.id), articleData);
      } else {
        await addDoc(collection(db, "articles"), articleData);
      }

      setOpenModal(false);

      const querySnapshot = await getDocs(collection(db, "articles"));
      const articlesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArticles(articlesList);

      setSnackbarMessage('L\'article a été enregistré avec succès.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'article :", error);
    }
  };

  const handleDeleteArticle = async (id) => {
    await deleteDoc(doc(db, "articles", id));
    setArticles(articles.filter(article => article.id !== id));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Recherche sur le nom de l'article
  const filteredArticles = articles.filter(article =>
    article.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Liste des clients pour le filtre
  const clientList = Object.entries(clientStocks).map(([clientId, { clientInfo }]) => ({
    id: clientId,
    name: clientInfo?.name || clientId,
    email: clientInfo?.email || ""
  }));

  // Filtrage des clients à afficher (on ne garde que le client sélectionné)
  const clientsToDisplay = selectedClient
    ? Object.entries(clientStocks).filter(([clientId]) => clientId === selectedClient)
    : [];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Gestion des Articles par Client
      </Typography>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <TextField
          label="Rechercher un article"
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size={isMobile ? "small" : "medium"}
        />
        <FormControl
          variant="outlined"
          fullWidth={isMobile}
          sx={{ minWidth: isMobile ? 120 : 200 }}
          size={isMobile ? "small" : "medium"}
        >
          <InputLabel id="client-select-label">Filtrer par client</InputLabel>
          <Select
            labelId="client-select-label"
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            label="Filtrer par client"
          >
            <MenuItem value="">Sélectionnez un client</MenuItem>
            {clientList.map(client => (
              <MenuItem key={client.id} value={client.id}>
                {client.name} {client.email && `(${client.email})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/stock/add")}
        style={{ marginBottom: 20 }}
      >
        Créer un Article
      </Button>

      {/* Affichage uniquement pour le client sélectionné */}
      {clientsToDisplay.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Sélectionnez un client pour afficher ses articles.
        </Typography>
      ) : (
        clientsToDisplay.map(([clientId, { clientInfo, stockMap }]) => (
          <Box key={clientId} mb={4}>
            <Typography variant="h6" color="primary">
              {clientInfo?.name || clientId}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {clientInfo?.email}
            </Typography>
            <Grid container spacing={3}>
              {filteredArticles.map((article) => {
                const stock = stockMap[article.id] ?? 0;
                const seuil = article.seuil ?? 0;
                const isBelowSeuil = seuil > 0 && stock <= seuil;
                return (
                  <Grid item xs={12} sm={6} md={4} key={article.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          {article.photoURL && (
                            <Avatar
                              src={article.photoURL}
                              alt="photo"
                              style={{ width: '60px', height: '60px', marginRight: '10px' }}
                            />
                          )}
                          <Box>
                            <Typography variant="subtitle1">{article.name}</Typography>
                            <Typography variant="caption" color="textSecondary">{article.reference}</Typography>
                            <Chip
                              label={
                                loadingStock
                                  ? "Calcul en cours..."
                                  : `Stock : ${stock} ${article.unit || ""}`
                              }
                              color={isBelowSeuil ? "warning" : "success"}
                              icon={isBelowSeuil ? <WarningAmberIcon /> : undefined}
                              sx={{ fontWeight: "bold", fontSize: 16, mt: 1 }}
                            />
                            {seuil > 0 && (
                              <Typography variant="caption" color={isBelowSeuil ? "error" : "textSecondary"} display="block">
                                Seuil : {seuil}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => handleOpenModal(article)}
                          sx={{ textTransform: "none" }}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteArticle(article.id)}
                          sx={{ textTransform: "none" }}
                        >
                          Supprimer
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))
      )} {/* <--  parenthèse fermante ici */}

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 370, sm: 520, md: 650 }, // Largeur augmentée
            maxHeight: 480, // Hauteur maximale réduite
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            outline: 'none'
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2" mb={2}>
            {currentArticle ? 'Modifier l\'Article' : 'Créer un Article'}
          </Typography>
          <form onSubmit={handleSaveArticle}>
            <TextField
              label="Nom"
              name="name"
              defaultValue={currentArticle ? currentArticle.name : ''}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Référence"
              name="reference"
              defaultValue={currentArticle ? currentArticle.reference : ''}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Catégorie"
              name="category"
              defaultValue={currentArticle ? currentArticle.category : ''}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Unité</InputLabel>
              <Select
                name="unit"
                defaultValue={currentArticle ? currentArticle.unit : ''}
                label="Unité"
              >
                <MenuItem value="pcs">Pièce</MenuItem>
                <MenuItem value="boite">Boîte</MenuItem>
                <MenuItem value="kg">Kg</MenuItem>
                <MenuItem value="g">g</MenuItem>
                <MenuItem value="L">Litre</MenuItem>
                <MenuItem value="ml">ml</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              name="description"
              defaultValue={currentArticle ? currentArticle.description : ''}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              label="URL de la photo"
              name="photoURL"
              defaultValue={currentArticle ? currentArticle.photoURL : ''}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Seuil d'alerte (optionnel)"
              name="seuil"
              type="number"
              defaultValue={currentArticle && currentArticle.seuil !== undefined ? currentArticle.seuil : ''}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" color="secondary" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Confirmer
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ManageArticle;