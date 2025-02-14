import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { Link as RouterLink } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  Alert as MuiAlert,
  Checkbox,
  FormControlLabel,
  Button as MuiButton,
  TextField as MuiTextField,
  Link,
  Typography as MuiTypography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { spacing } from "@mui/system";
import useAuth from "@/hooks/useAuth"; // Assure-toi que le chemin est correct
import { cleanInput } from '@/utils/cleanInput'; // Assurez-vous que la fonction cleanInput est correctement importée
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData } from '../../redux/slices/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const Alert = styled(MuiAlert)(spacing);
const TextField = styled(MuiTextField)(spacing);
const Button = styled(MuiButton)(spacing);
const Centered = styled(MuiTypography)`
  text-align: center;
`;
const Typography = styled(MuiTypography)(spacing);

function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth(); // Vérifie que signIn est bien importée
  const [showPassword, setShowPassword] = useState(false); // Ajouter l'état pour la visibilité du mot de passe

  const dispatch = useDispatch();
  const { user, isInitialized, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(fetchUserData(user.uid));
      }
    });
    return unsubscribe;
  }, [dispatch]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
        submit: false,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Doit être une adresse électronique valide")
          .max(255)
          .required("L'e-mail est obligatoire"),
        password: Yup.string().max(255).required("Un mot de passe est nécessaire"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          // Nettoyez les entrées utilisateur avant de les utiliser
          const cleanEmail = cleanInput(values.email);
          const cleanPassword = cleanInput(values.password);

          console.log("Clean Email: ", cleanEmail);
          console.log("Clean Password: ", cleanPassword);

          await signIn(cleanEmail, cleanPassword);
          navigate("/acceuil"); // Redirection vers Acceuil après connexion
        } catch (error) {
          const message = error.message || "Quelque chose n'a pas fonctionné";
          console.log("Erreur: ", message);
          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
      }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Alert mt={3} mb={3} severity="info">
            Cette application est <strong>reservée à</strong> quelques{" "}
            <strong>employés</strong> du rayon vert
          </Alert>
          {errors.submit && (
            <Alert mt={2} mb={3} severity="warning">
              {errors.submit}
            </Alert>
          )}
          <TextField
            type="email"
            name="email"
            label="Adresse Email"
            value={values.email}
            error={Boolean(touched.email && errors.email)}
            fullWidth
            helperText={touched.email && errors.email}
            onBlur={handleBlur}
            onChange={handleChange}
            my={2}
          />
          <TextField
            type={showPassword ? "text" : "password"} // Modifie le type en fonction de la visibilité du mot de passe
            name="password"
            label="Mot de passe"
            value={values.password}
            error={Boolean(touched.password && errors.password)}
            fullWidth
            helperText={touched.password && errors.password}
            onBlur={handleBlur}
            onChange={handleChange}
            my={2}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Typography as="div" mb={2} variant="caption">
            <Link to="../reset-password" component={RouterLink}>
              Modifier le mot de passe
            </Link>
          </Typography>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Se souvenir de moi"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            mb={3}
          >
            Connexion
          </Button>
         
        </form>
      )}
    </Formik>
  );
}

export default SignIn;
