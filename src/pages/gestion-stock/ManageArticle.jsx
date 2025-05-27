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
  Stack,
  useMediaQuery
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useTheme } from "@mui/material/styles";

const ManageArticle = () => {
  const [articles, setArticles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [editArticle, setEditArticle] = useState({
    name: "",
    reference: "",
    category: "",
    unit: "",
    description: "",
    seuil: ""
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
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

  // Synchronise l'état du formulaire avec l'article sélectionné
  useEffect(() => {
    if (openModal && currentArticle) {
      setEditArticle({
        name: currentArticle.name || "",
        reference: currentArticle.reference || "",
        category: currentArticle.category || "",
        unit: currentArticle.unit || "",
        description: currentArticle.description || "",
        seuil: currentArticle.seuil !== undefined ? currentArticle.seuil : ""
      });
    } else if (openModal && !currentArticle) {
      setEditArticle({
        name: "",
        reference: "",
        category: "",
        unit: "",
        description: "",
        seuil: ""
      });
    }
  }, [openModal, currentArticle]);

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
    setSaving(true);

    const articleData = {
      ...editArticle,
      seuil: editArticle.seuil ? Number(editArticle.seuil) : undefined
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
    setSaving(false);
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

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Gestion des Articles
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
      </Stack>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setCurrentArticle(null);
          setOpenModal(true);
        }}
        style={{ marginBottom: 20 }}
      >
        Créer un Article
      </Button>

      <Grid container spacing={3}>
        {filteredArticles.map((article) => (
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
                    {article.unit && (
                      <Typography variant="body2" color="textSecondary">
                        Unité : {article.unit}
                      </Typography>
                    )}
                    {article.seuil > 0 && (
                      <Typography variant="caption" color="warning.main" display="block">
                        Seuil : {article.seuil}
                      </Typography>
                    )}
                    <Typography variant="body2" color="primary">
                      Stock disponible : {article.stock ?? article.quantity ?? "N/A"}
                    </Typography>
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
        ))}
      </Grid>

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
            width: { xs: 370, sm: 520, md: 650 },
            maxHeight: 480,
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
              value={editArticle.name}
              onChange={e => setEditArticle({ ...editArticle, name: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Référence"
              name="reference"
              value={editArticle.reference}
              onChange={e => setEditArticle({ ...editArticle, reference: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Catégorie"
              name="category"
              value={editArticle.category}
              onChange={e => setEditArticle({ ...editArticle, category: e.target.value })}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Unité</InputLabel>
              <Select
                name="unit"
                value={editArticle.unit}
                label="Unité"
                onChange={e => setEditArticle({ ...editArticle, unit: e.target.value })}
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
              value={editArticle.description}
              onChange={e => setEditArticle({ ...editArticle, description: e.target.value })}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              label="Seuil d'alerte (optionnel)"
              name="seuil"
              type="number"
              value={editArticle.seuil}
              onChange={e => setEditArticle({ ...editArticle, seuil: e.target.value })}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" color="secondary" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
              >
                {saving ? "Enregistrement..." : "Confirmer"}
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