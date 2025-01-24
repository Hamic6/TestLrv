import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "@emotion/styled";
import { TextField, Button, Typography, Alert } from "@mui/material";
import axios from "axios";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
`;

const Form = styled("form")`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AddUser = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Email invalide").required("Email requis"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setError("");
      setSuccess("");
      try {
        await axios.post("/api/send-invite", { email: values.email });
        setSuccess("Invitation envoyée avec succès");
        resetForm();
      } catch (error) {
        setError(error.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Ajouter un Utilisateur
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Form onSubmit={formik.handleSubmit}>
        <TextField
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" disabled={formik.isSubmitting}>
          Envoyer l'Invitation
        </Button>
      </Form>
    </Container>
  );
};

export default AddUser;
