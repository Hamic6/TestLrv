import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Button,
  Card as MuiCard,
  CardContent,
  CircularProgress,
  Divider,
  Grid as MuiGrid,
  Link,
  TextField,
  Typography as MuiTypography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { getAuth, updateProfile, onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import useAuth from "@/hooks/useAuth";
import { spacing } from "@mui/system";

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Card = styled(MuiCard)(spacing);
const Grid = styled(MuiGrid)(spacing);
const Typography = styled(MuiTypography)(spacing);
const Centered = styled.div`text-align: center;`;
const Spacer = styled.div`${spacing};`;

function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setDisplayName(currentUser.displayName);
        setPhotoURL(currentUser.photoURL);
        setEmail(currentUser.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNameChange = (event) => {
    setDisplayName(event.target.value);
  };

  const handlePhotoChange = (event) => {
    if (event.target.files[0]) {
      setPhotoFile(event.target.files[0]);
      setPhotoURL(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      let photoURLUpdated = photoURL;

      if (photoFile) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURLUpdated = await getDownloadURL(storageRef);
      }

      await updateProfile(user, {
        displayName,
        photoURL: photoURLUpdated,
      });

      setPhotoURL(photoURLUpdated);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.");
    }
  };

  return (
    <React.Fragment>
      <Helmet title="Profile" />
      <Typography variant="h3" gutterBottom display="inline">Profile</Typography>
      
      <Divider my={6} />
      <Grid container spacing={6}>
        <Grid item xs={12} lg={4} xl={3}>
          <Card mb={6}>
            <CardContent>
              <Centered>
                <Avatar alt={displayName || "User"} src={photoURL || "/static/img/avatars/avatar-1.jpg"} style={{ width: 128, height: 128, marginBottom: '1rem' }} />
                <Typography variant="h6" gutterBottom>{displayName || "User"}</Typography>
                <Typography variant="body2" component="div" gutterBottom>
                  <Box fontWeight="fontWeightRegular">{email}</Box>
                </Typography>
              </Centered>
              <Divider my={4} />
              <Typography variant="h6" gutterBottom>Modifier :</Typography>
              {error && <Typography color="error" gutterBottom>{error}</Typography>}
              <TextField
                label="Noms"
                value={displayName}
                onChange={handleNameChange}
                fullWidth
                margin="normal"
              />
              <Button variant="contained" component="label" fullWidth>
                Charger la Photo
                <input type="file" hidden onChange={handlePhotoChange} />
              </Button>
              <Spacer mb={2} />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                fullWidth
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default Profile;
