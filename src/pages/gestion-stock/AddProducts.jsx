import React, { useState } from "react";
import { db, storage } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Snackbar,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";

const AddProducts = () => {
  const [product, setProduct] = useState({
    name: "",
    reference: "",
    category: "",
    unit: "",
    description: "",
    photoURL: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  // Charger les catégories au montage
  React.useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCategories();
  }, []);

  // Ajouter une nouvelle catégorie
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const docRef = await addDoc(collection(db, "categories"), {
      name: newCategory.trim(),
      createdAt: serverTimestamp(),
    });
    setCategories(prev => [...prev, { id: docRef.id, name: newCategory.trim() }]);
    setProduct(prev => ({ ...prev, category: newCategory.trim() }));
    setNewCategory("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setProduct((prev) => ({
        ...prev,
        photoURL: URL.createObjectURL(e.target.files[0]),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.name || !product.unit) {
      setAlertMessage("Le nom et l'unité sont obligatoires.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    setLoading(true);
    let photoURL = "";
    try {
      if (photoFile) {
        const storageRef = ref(storage, `articles/${Date.now()}_${photoFile.name}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "articles"), {
        ...product,
        photoURL: photoURL || "",
        createdAt: serverTimestamp(),
      });
      setAlertMessage("Article créé avec succès !");
      setAlertSeverity("success");
      setAlertOpen(true);
      setProduct({
        name: "",
        reference: "",
        category: "",
        unit: "",
        description: "",
        photoURL: "",
      });
      setPhotoFile(null);
    } catch (error) {
      setAlertMessage("Erreur lors de la création de l'article.");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
    setLoading(false);
  };

  const handleAlertClose = () => setAlertOpen(false);

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, margin: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Créer un Article
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <TextField
              label="Nom de l'article"
              name="name"
              value={product.name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Référence"
              name="reference"
              value={product.reference}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                name="category"
                value={product.category}
                label="Catégorie"
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Grid container spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs>
                <TextField
                  label="Nouvelle catégorie"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  size="small"
                >
                  Ajouter
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Unité</InputLabel>
              <Select
                name="unit"
                value={product.unit}
                label="Unité"
                onChange={handleChange}
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
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={product.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 1 }}
            >
              Charger une photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChange}
              />
            </Button>
            {product.photoURL && (
              <img
                src={product.photoURL}
                alt="Aperçu"
                style={{ maxWidth: 120, maxHeight: 120, marginTop: 8, borderRadius: 8 }}
              />
            )}
            {photoFile && (
              <Typography variant="body2" color="text.secondary">
                {photoFile.name}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Création..." : "Créer l'article"}
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

export default AddProducts;