import React from "react";
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
} from "@mui/material";
import { spacing } from "@mui/system";

import useAuth from "@/hooks/useAuth"; // Assure-toi que le chemin est correct

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
          await signIn(values.email, values.password);
          navigate("/dashboard");
        } catch (error) {
          const message = error.message || "Quelque chose n'a pas fonctionné";
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
            Cette application est <strong>reservé à</strong> quelques{" "}
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
            type="password"
            name="password"
            label="Mot de passe"
            value={values.password}
            error={Boolean(touched.password && errors.password)}
            fullWidth
            helperText={touched.password && errors.password}
            onBlur={handleBlur}
            onChange={handleChange}
            my={2}
          />
          <Typography as="div" mb={2} variant="caption">
            <Link to="../reset-password" component={RouterLink}>
              Mot de passe oublié ?
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
          <Centered>
            Vous n'avez pas de compte ?{" "}
            <Link to="../sign-up" component={RouterLink}>
              S'enregistrer
            </Link>
          </Centered>
        </form>
      )}
    </Formik>
  );
}

export default SignIn;