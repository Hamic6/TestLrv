import React from "react";
import { Navigate } from "react-router-dom";
import async from "@/components/Async";

// Layouts
import AuthLayout from "@/layouts/Auth";
import DashboardLayout from "@/layouts/Dashboard";
import ErrorLayout from "@/layouts/Error";

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
const Stats = async(() => import("@/pages/tableau_de_bord/Stats"));
const GraphComponent = async(() => import("@/pages/tableau_de_bord/GraphComponent"));
const PerformanceIndicators = async(() => import("@/pages/tableau_de_bord/PerformanceIndicators"));
const AlertsAndNotifications = async(() => import("@/pages/tableau_de_bord/AlertsAndNotifications"));
const Acceuil = async(() => import("@/pages/Acceuil/Acceuil"));

// Facturation components
const ListeDesFactures = async(() => import("@/pages/facturation/InvoiceList"));
const DetailsFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const CreerFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const ModifierFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const GestionDesClients = async(() => import("@/pages/facturation/ClientList"));
const ClientDetails = async(() => import("@/pages/facturation/ClientDetails"));
const Rapports = async(() => import("@/pages/facturation/InvoiceDetails"));
const ImportInvoices = async(() => import("@/pages/facturation/ImportInvoices")); // Ajout de la page ImportInvoices

// Devis components
const CreateDevis = async(() => import("@/pages/facturation/CreateDevis"));
const SearchDevis = async(() => import("@/pages/facturation/SearchDevis"));
const DevisPDF = async(() => import("@/pages/facturation/DevisPDF"));

// AvisDePassage components
const CreateAvisDePassage = async(() => import("@/pages/AvisDePassage/CreateAvisDePassage"));
const SearchAvisDePassage = async(() => import("@/pages/AvisDePassage/SearchAvisDePassage"));
import ADPmanuel from './pages/AvisDePassage/ADPmanuel';

// Profile component
const Profile = async(() => import("@/pages/pages/Profile"));
const AttribuerRoles = async(() => import("@/pages/roles-permissions/AttribuerRoles"));
const Listes = async(() => import("@/pages/roles-permissions/Listes"));  
const Adduser = async(() => import("@/pages/roles-permissions/Adduser")); 
const StockEntryForm = async(() => import("@/pages/gestion-stock/StockEntryForm"));
const AddProducts = async(() => import("@/pages/gestion-stock/AddProducts"));
const ManageArticle = async(() => import("@/pages/gestion-stock/ManageArticle"));
const StockOutForm = async(() => import("@/pages/gestion-stock/StockOutForm"));
const ValidationBonLivraison = async(() => import("@/pages/gestion-stock/ValidationBdc"));
const GestionLivraison = async(() => import("@/pages/gestion-stock/GestionLivraison"));

// Définition des routes
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
    path: "acceuil",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <Acceuil />,
      },
    ],
  },
  {
    path: "dashboard",
    element: <DashboardLayout />,
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
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <DashboardOverview />,
      },
      {
        path: "stats",
        element: <Stats />,
      },
      {
        path: "graphs",
        element: <GraphComponent />,
      },
   
      {
        path: "performance",
        element: <PerformanceIndicators />,
      },
      {
        path: "alerts",
        element: <AlertsAndNotifications />,
      },
    ],
  },
  {
    path: "roles-permissions",
    element: <DashboardLayout />,
    children: [
      {
        path: "assign",
        element: <AttribuerRoles />,
      },
      {
        path: "permissions",
        element: <Listes />,
      },
      {
        path: "add-user",
        element: <Adduser />,
      },
    ],
  },
  {
    path: "facturation",
    element: <DashboardLayout />,
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
        path: "import-invoices",
        element: <ImportInvoices />, // Ajout de la route pour ImportInvoices
      },
      {
        path: "creer-proforma", // Route pour "Créer un Proforma"
        element: <CreateDevis />, // Réutilisation du composant CreateDevis
      },
      {
        path: "chercher-proforma", // Route pour "Rechercher un Proforma"
        element: <SearchDevis />, // Réutilisation du composant SearchDevis
      },
    ],
  },
  {
    path: "devis",
    element: <DashboardLayout />,
    children: [
      {
        path: "creer-devis",
        element: <CreateDevis />,
      },
      {
        path: "chercher-devis",
        element: <SearchDevis />,
      },
      {
        path: "devis-pdf",
        element: <DevisPDF />,
      },
    ],
  },
  {
    path: "avis-de-passage",
    element: <DashboardLayout />,
    children: [
      {
        path: "creer-avis-passage",
        element: <CreateAvisDePassage />,
      },
      {
        path: "rechercher-avis-passage",
        element: <SearchAvisDePassage />,
      },
      {
        path: "imprimer-avis-passage",
        element: <ADPmanuel />,
      },
    ],
  },
  {
    path: "profile",
    element: <DashboardLayout />,
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
    path: "stock",
    element: <DashboardLayout />,
    children: [
      {
        path: "items",
        element: <StockEntryForm />,
      },
      {
        path: "add",
        element: <AddProducts />,
      },
      {
        path: "management",
        element: <ManageArticle />,
      },
      {
        path: "delivery-note",
        element: <StockOutForm />,
      },
      {
        path: "delivery-management", // Ajoute cette route pour la gestion des bons de livraison
        element: <GestionLivraison />,
      },
      {
        path: "validation/management",
        element: <ValidationBonLivraison />,
      },
      // Ajoutez ici d'autres routes liées au stock si besoin
    ],
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];

export default routes;
