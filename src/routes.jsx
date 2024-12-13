import React from "react";
import { Navigate } from "react-router-dom";
import async from "@/components/Async";

// Layouts
import AuthLayout from "@/layouts/Auth";
import DashboardLayout from "@/layouts/Dashboard";
import ErrorLayout from "@/layouts/Error";

// Guards
import AuthGuard from "@/components/guards/AuthGuard";

// Auth components
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ResetPassword from "@/pages/auth/ResetPassword";  // Correction de l'importation
import Page404 from "@/pages/auth/Page404";
import Page500 from "@/pages/auth/Page500";

// Dashboard components
import Default from "@/pages/dashboards/Default";
const Analytics = async(() => import("@/pages/dashboards/Analytics"));
const SaaS = async(() => import("@/pages/dashboards/SaaS"));

// Facturation components
const ListeDesFactures = async(() => import("@/pages/facturation/InvoiceList"));
const DetailsFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const CreerFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const ModifierFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const GestionDesClients = async(() => import("@/pages/facturation/ClientList"));
const ClientDetails = async(() => import("@/pages/facturation/ClientDetails"));
const TableauDeBord = async(() => import("@/pages/facturation/InvoiceDetails"));
const Rapports = async(() => import("@/pages/facturation/InvoiceDetails"));

// Devis & Avis de Passage components
const CreateDevis = async(() => import("@/pages/Devis/CreateDevis"));
const SendDevis = async(() => import("@/pages/Devis/SendDevis"));
const TransformDevis = async(() => import("@/pages/Devis/TransformDevis"));
const SearchDevis = async(() => import("@/pages/Devis/SearchDevis"));
const CreateAvisDePassage = async(() => import("@/pages/Devis/CreateAvisDePassage"));
const SendAvisDePassage = async(() => import("@/pages/Devis/SendAvisDePassage"));
const TrackAvisDePassage = async(() => import("@/pages/Devis/TrackAvisDePassage"));
const SearchAvisDePassage = async(() => import("@/pages/Devis/SearchAvisDePassage"));

// Profile component
const Profile = async(() => import("@/pages/pages/Profile"));

const routes = [
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "",
        element: <SignIn />,
      },
      {
        path: "sign-up",
        element: <SignUp />,
      },
      {
        path: "reset-password",  // Ajout de la route correcte pour ResetPassword
        element: <ResetPassword />,
      },
      {
        path: "404",
        element: <Page404 />,
      },
    ],
  },
  {
    path: "dashboard",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "",
        element: <Default />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "saas",
        element: <SaaS />,
      },
    ],
  },
  {
    path: "facturation",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "liste-des-factures",
        element: <ListeDesFactures />,
      },
      {
        path: "details-facture/:id",
        element: <DetailsFacture />,
      },
      {
        path: "creer-facture",
        element: <CreerFacture />,
      },
      {
        path: "modifier-facture/:id",
        element: <ModifierFacture />,
      },
      {
        path: "gestion-des-clients",
        element: <GestionDesClients />,
      },
      {
        path: "clients/:clientId",
        element: <ClientDetails />,
      },
      {
        path: "tableau-de-bord",
        element: <TableauDeBord />,
      },
      {
        path: "rapports",
        element: <Rapports />,
      },
    ],
  },
  {
    path: "devis-avis",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "creer-devis",
        element: <CreateDevis />,
      },
      {
        path: "envoyer-devis",
        element: <SendDevis />,
      },
      {
        path: "transformer-devis",
        element: <TransformDevis />,
      },
      {
        path: "rechercher-devis",
        element: <SearchDevis />,
      },
      {
        path: "creer-avis-passage",
        element: <CreateAvisDePassage />,
      },
      {
        path: "envoyer-avis-passage",
        element: <SendAvisDePassage />,
      },
      {
        path: "suivre-avis-passage",
        element: <TrackAvisDePassage />,
      },
      {
        path: "rechercher-avis-passage",
        element: <SearchAvisDePassage />,
      },
    ],
  },
  {
    path: "profile", // Nouvelle route pour le profil
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "",
        element: <Profile />,
      },
    ],
  },
  {
    path: "error",
    element: <ErrorLayout />,
    children: [
      {
        path: "500",
        element: <Page500 />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];

export default routes;
