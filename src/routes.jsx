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
import ResetPassword from "@/pages/auth/ResetPassword";
import Page404 from "@/pages/auth/Page404";
import Page500 from "@/pages/auth/Page500";

// Dashboard components
import Default from "@/pages/dashboards/Default";
const Analytics = async(() => import("@/pages/dashboards/Analytics"));
const SaaS = async(() => import("@/pages/dashboards/SaaS"));
const DashboardOverview = async(() => import("@/pages/tableau_de_bord/DashboardOverview"));

// Facturation components
const ListeDesFactures = async(() => import("@/pages/facturation/InvoiceList"));
const DetailsFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const CreerFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const ModifierFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const GestionDesClients = async(() => import("@/pages/facturation/ClientList"));
const ClientDetails = async(() => import("@/pages/facturation/ClientDetails"));
const Rapports = async(() => import("@/pages/facturation/InvoiceDetails"));

// Devis components
const CreateDevis = async(() => import("@/pages/facturation/CreateDevis"));
const SendDevis = async(() => import("@/pages/facturation/SendDevis"));
const DevisPDF = async(() => import("@/pages/facturation/DevisPDF"));

// AvisDePassage components
const CreateAvisDePassage = async(() => import("@/pages/AvisDePassage/CreateAvisDePassage"));
const SendAvisDePassage = async(() => import("@/pages/AvisDePassage/SendAvisDePassage"));
const SearchAvisDePassage = async(() => import("@/pages/AvisDePassage/SearchAvisDePassage"));

// Profile component
const Profile = async(() => import("@/pages/pages/Profile"));
const AttribuerRoles = async(() => import("@/pages/roles-permissions/AttribuerRoles"));
const Listes = async(() => import("@/pages/roles-permissions/Listes"));  // Ajouté pour Listes.jsx

const routes = [
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="/sign-in" replace />,
      },
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "sign-up",
        element: <SignUp />,
      },
      {
        path: "reset-password",
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
    path: "tableau-de-bord",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "",
        element: <DashboardOverview />,
      },
    ],
  },
  {
    path: "roles-permissions",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "assign",
        element: <AttribuerRoles />,
      },
      {
        path: "permissions",
        element: <Listes />,  // Ajout de la route pour Listes.jsx
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
    ],
  },
  {
    path: "devis",
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
        path: "devis-pdf",
        element: <DevisPDF />,
      },
    ],
  },
  {
    path: "avis-de-passage",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "creer-avis-passage",
        element: <CreateAvisDePassage />,
      },
      {
        path: "envoyer-avis-passage",
        element: <SendAvisDePassage />,
      },
      {
        path: "rechercher-avis-passage",
        element: <SearchAvisDePassage />,
      },
    ],
  },
  {
    path: "profile",
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
