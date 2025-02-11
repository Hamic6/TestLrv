import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  Alert as MuiAlert,
  Button as MuiButton,
  TextField as MuiTextField,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { spacing } from "@mui/system";
import useAuth from "@/hooks/useAuth";

const Alert = styled(MuiAlert)(spacing);
const TextField = styled(MuiTextField)(spacing);
const Button = styled(MuiButton)(spacing);
const Centered = styled(Typography)`
  text-align: center;
`;
const FormContainer = styled(Box)`
  max-width: 400px;
  margin: auto;
`;

function Adduser() {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmitForm = async (values, { setErrors, setStatus, setSubmitting }) => {
    try {
      console.log('Form values:', values);
      const response = await fetch('https://us-central1-testlrv.cloudfunctions.net/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          displayName: values.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      console.log('User created successfully');
      setSuccess(true);
      setStatus({ success: true });
      setSubmitting(false);
    } catch (error) {
      const message = error.message || "Quelque chose n'a pas marché";
      console.error('Error during user creation:', message);
      setStatus({ success: false });
      setErrors({ submit: message });
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        submit: false,
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().max(255).required("Le Nom est nécessaire"),
        email: Yup.string()
          .email("Doit être un email valide")
          .max(255)
          .required("L'e-mail est obligatoire"),
        password: Yup.string()
          .min(12, "Doit comporter au moins 12 caractères")
          .max(255)
          .required("Nécessaire"),
        confirmPassword: Yup.string().oneOf(
          [Yup.ref("password"), null],
          "Les mots de passe doivent correspondre"
        ),
      })}
      onSubmit={handleSubmitForm}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
        status,
      }) => (
        <FormContainer>
          <form noValidate onSubmit={handleSubmit}>
            {status && status.success && (
              <Alert mt={2} mb={1} severity="success">
                Utilisateur créé avec succès !
              </Alert>
            )}
            {errors.submit && (
              <Alert mt={2} mb={1} severity="warning">
                {errors.submit}
              </Alert>
            )}
            <TextField
              type="text"
              name="name"
              label="Nom"
              value={values.name}
              error={Boolean(touched.name && errors.name)}
              fullWidth
              helperText={touched.name && errors.name}
              onBlur={handleBlur}
              onChange={handleChange}
              my={3}
            />
            <TextField
              type="email"
              name="email"
              label="Adresse e-mail"
              value={values.email}
              error={Boolean(touched.email && errors.email)}
              fullWidth
              helperText={touched.email && errors.email}
              onBlur={handleBlur}
              onChange={handleChange}
              my={3}
            />
            <TextField
              type={showPassword ? "text" : "password"}
              name="password"
              label="Mot de passe"
              value={values.password}
              error={Boolean(touched.password && errors.password)}
              fullWidth
              helperText={touched.password && errors.password}
              onBlur={handleBlur}
              onChange={handleChange}
              my={3}
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
            <TextField
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              label="Confirmer le mot de passe"
              value={values.confirmPassword}
              error={Boolean(touched.confirmPassword && errors.confirmPassword)}
              fullWidth
              helperText={touched.confirmPassword && errors.confirmPassword}
              onBlur={handleBlur}
              onChange={handleChange}
              my={3}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              mb={3}
            >
              Inscrire
            </Button>
            <Centered>
              Vous avez déjà un compte ?{" "}
              <Link to="../sign-in" component={RouterLink}>
                Se connecter
              </Link>
            </Centered>
          </form>
        </FormContainer>
      )}
    </Formik>
  );
}

export default Adduser;
