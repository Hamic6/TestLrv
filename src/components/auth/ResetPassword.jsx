import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { Formik } from "formik";

import {
  Alert as MuiAlert,
  Button as MuiButton,
  TextField as MuiTextField,
  Typography as MuiTypography,
  Link,
} from "@mui/material";
import { spacing } from "@mui/system";

import useAuth from "@/hooks/useAuth";

const Alert = styled(MuiAlert)(spacing);

const TextField = styled(MuiTextField)(spacing);

const Button = styled(MuiButton)(spacing);

const Centered = styled(MuiTypography)`
  text-align: center;
`;

function ResetPassword() {
  const { resetPassword } = useAuth();
  const [success, setSuccess] = useState(false);

  return (
    <Formik
      initialValues={{
        email: "",
        submit: false,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Doit être un email valide")
          .max(255)
          .required("L'e-mail est obligatoire"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          await resetPassword(values.email);
          setSuccess(true);
        } catch (error) {
          const message = error.message || "Something went wrong";

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
          {success && (
            <Alert mt={2} mb={1} severity="success">
              Un courriel a été envoyé pour réinitialiser votre mot de passe. Veuillez vérifier votre boîte de réception !
            </Alert>
          )}
          {errors.submit && (
            <Alert mt={2} mb={1} severity="warning">
              {errors.submit}
            </Alert>
          )}
          <TextField
            type="email"
            name="email"
            label="Email Address"
            value={values.email}
            error={Boolean(touched.email && errors.email)}
            fullWidth
            helperText={touched.email && errors.email}
            onBlur={handleBlur}
            onChange={handleChange}
            my={3}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            mb={3}
          >
            Réinitialiser le mot de passe
          </Button>
          <Centered>
          Vous n'avez pas de compte ?{" "}
            <Link to="../sign-up" component={RouterLink}>
              S'Enregistrer
            </Link>
          </Centered>
        </form>
      )}
    </Formik>
  );
}

export default ResetPassword;
