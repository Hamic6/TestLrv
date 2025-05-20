import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Ajout de l'import
import { db } from "../../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
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
  MenuItem
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const ManageArticle = () => {
  const [articles, setArticles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [search, setSearch] = useState("");
  const navigate = useNavigate(); // Hook pour la navigation

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
      photoURL: formData.get('photoURL')
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

  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Gestion des Articles
      </Typography>
      <TextField
        label="Rechercher un article"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/stock/add")}
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
                  {article.photoURL && <Avatar src={article.photoURL} alt="photo" style={{ width: '60px', height: '60px', marginRight: '10px' }} />}
                  <Box>
                    <Typography variant="h5" component="div">
                      {article.name}
                    </Typography>
                    <Typography color="textSecondary">
                      {article.reference}
                    </Typography>
                    <Typography color="textSecondary">
                      {article.category}
                    </Typography>
                    <Typography color="textSecondary">
                      {article.unit}
                    </Typography>
                    <Typography variant="body2">
                      {article.description}
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
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Card style={{ padding: 20 }}>
            <Typography id="modal-title" variant="h6" component="h2">
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
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button type="submit" variant="contained" color="primary">
                  Enregistrer
                </Button>
                <Button variant="contained" color="secondary" onClick={handleCloseModal}>
                  Annuler
                </Button>
              </Box>
            </form>
          </Card>
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