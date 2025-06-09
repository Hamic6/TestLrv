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
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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
    seuil: "",
    photoURL: ""
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
        seuil: currentArticle.seuil !== undefined ? currentArticle.seuil : "",
        photoURL: currentArticle.photoURL || ""
      });
    } else if (openModal && !currentArticle) {
      setEditArticle({
        name: "",
        reference: "",
        category: "",
        unit: "",
        description: "",
        seuil: "",
        photoURL: ""
      });
    }
  }, [openModal, currentArticle]);

  // Gestion de l'upload de la photo (modifiée pour stocker le fichier)
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setEditArticle(prev => ({
        ...prev,
        photoURL: URL.createObjectURL(e.target.files[0]), // Pour l'aperçu
      }));
    }
  };

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
    if (uploading) {
      setSnackbarMessage("Veuillez attendre la fin du téléchargement de la photo.");
      setSnackbarOpen(true);
      return;
    }
    setSaving(true);

    let photoURL = editArticle.photoURL;
    try {
      if (photoFile) {
        setUploading(true);
        const storage = getStorage();
        const storageRef = ref(storage, `articles/${Date.now()}_${photoFile.name}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
        setUploading(false);
      }

      // Prépare les données sans undefined pour Firestore
      const articleData = {
        ...editArticle,
        photoURL: photoURL || ""
      };
      // Si seuil est vide ou non numérique, on ne l'ajoute pas
      if (editArticle.seuil !== "" && !isNaN(Number(editArticle.seuil))) {
        articleData.seuil = Number(editArticle.seuil);
      } else {
        delete articleData.seuil;
      }

      if (currentArticle) {
        await updateDoc(doc(db, "articles", currentArticle.id), articleData);
      } else {
        await addDoc(collection(db, "articles"), articleData);
      }

      // Recharge la liste APRÈS la sauvegarde
      const querySnapshot = await getDocs(collection(db, "articles"));
      const articlesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArticles(articlesList);

      setSnackbarMessage('L\'article a été enregistré avec succès.');
      setSnackbarOpen(true);

      // Réinitialise le formulaire et ferme la modale
      setCurrentArticle(null);
      setEditArticle({
        name: "",
        reference: "",
        category: "",
        unit: "",
        description: "",
        seuil: "",
        photoURL: ""
      });
      setPhotoFile(null);
      setOpenModal(false);
    } catch (error) {
      setSnackbarMessage("Erreur lors de l'enregistrement de l'article.");
      setSnackbarOpen(true);
      setUploading(false);
      console.error("Erreur lors de l'enregistrement de l'article :", error);
    }
    setSaving(false);
  };

  // Ouvre la boîte de dialogue de suppression
  const handleAskDeleteArticle = (article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  // Confirme la suppression
  const handleConfirmDeleteArticle = async () => {
    if (articleToDelete) {
      await deleteDoc(doc(db, "articles", articleToDelete.id));
      setArticles(articles.filter(article => article.id !== articleToDelete.id));
      setSnackbarMessage("Article supprimé avec succès.");
      setSnackbarOpen(true);
    }
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  };

  // Annule la suppression
  const handleCancelDeleteArticle = () => {
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Recherche et tri alphabétique sur le nom de l'article
  const filteredArticles = articles
    .filter(article =>
      article.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (a.name || "").localeCompare(b.name || "", "fr", { sensitivity: "base" }));

  // Pagination
  const paginatedArticles = filteredArticles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handlers pour la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Supprime la photo de l'article
  const handleRemovePhoto = async () => {
    if (!editArticle.photoURL) return;
    try {
      // Supprime la photo du storage si c'est une URL Firebase Storage
      if (photoFile || (editArticle.photoURL && editArticle.photoURL.startsWith("https://firebasestorage"))) {
        const storage = getStorage();
        // On tente de retrouver le chemin du fichier à partir de l'URL
        // (optionnel, car deleteObject échouera si ce n'est pas une URL Firebase Storage)
        const url = editArticle.photoURL;
        const baseUrl = "https://firebasestorage.googleapis.com/v0/b/";
        if (url.startsWith(baseUrl)) {
          // On tente de supprimer, mais si ça échoue ce n'est pas bloquant
          const pathStart = url.indexOf("/o/") + 3;
          const pathEnd = url.indexOf("?");
          const filePath = decodeURIComponent(url.substring(pathStart, pathEnd));
          const photoRef = ref(storage, filePath);
          await deleteObject(photoRef).catch(() => {});
        }
      }
    } catch (e) {}
    setEditArticle(prev => ({ ...prev, photoURL: "" }));
    setPhotoFile(null);
    setSnackbarMessage("Photo retirée.");
    setSnackbarOpen(true);
  };

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
        {paginatedArticles.map((article) => (
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
                <IconButton
                  color="primary"
                  onClick={() => handleOpenModal(article)}
                  aria-label="Paramètres"
                >
                  <SettingsIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TablePagination
        component="div"
        count={filteredArticles.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
        labelRowsPerPage="Articles par page :"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />

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
            {/* Section photo */}
            <Box display="flex" alignItems="center" mb={2}>
              {editArticle.photoURL ? (
                <>
                  <Avatar
                    src={editArticle.photoURL}
                    alt="photo"
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <IconButton
                    color="error"
                    onClick={handleRemovePhoto}
                    aria-label="Retirer la photo"
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={uploading}
                  >
                    {uploading ? "Téléchargement..." : "Ajouter une photo"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handlePhotoChange}
                    />
                  </Button>
                </>
              )}
            </Box>
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
                disabled={saving || uploading} // Désactive pendant l'upload
              >
                {saving ? "Enregistrement..." : uploading ? "Téléchargement..." : "Confirmer"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDeleteArticle}
      >
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer cet article&nbsp;?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteArticle} color="primary" variant="outlined">
            Non
          </Button>
          <Button onClick={handleConfirmDeleteArticle} color="error" variant="contained">
            Oui
          </Button>
        </DialogActions>
      </Dialog>

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