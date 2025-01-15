import React from "react";
import { Navigate } from "react-router-dom";
import async from "@/components/Async";

// Layouts
import AuthLayout from "@/layouts/Auth";
import DashboardLayout from "@/layouts/Dashboard";
import ErrorLayout from "@/layouts/Error";

// Guards
import AuthGuard from "@/components/guards/AuthGuard";
import RouteGuard from "@/components/guards/RouteGuard"; // Importer RouteGuard

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

// Facturation components
const ListeDesFactures = async(() => import("@/pages/facturation/InvoiceList"));
const DetailsFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const CreerFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const ModifierFacture = async(() => import("@/pages/facturation/InvoiceDetails"));
const GestionDesClients = async(() => import("@/pages/facturation/ClientList"));
const ClientDetails = async(() => import("@/pages/facturation/ClientDetails"));
const TableauDeBord = async(() => import("@/pages/tableau_de_bord/DashboardOverview"));
const Rapports = async(() => import("@/pages/facturation/InvoiceDetails"));
const CreateDevis = async(() => import("@/pages/facturation/CreateDevis"));

// Avis de Passage components
const CreateAvisDePassage = async(() => import("@/pages/AvisDePassage/CreateAvisDePassage"));
const SendAvisDePassage = async(() => import("@/pages/AvisDePassage/SendAvisDePassage"));
const SearchAvisDePassage = async(() => import("@/pages/AvisDePassage/SearchAvisDePassage"));

// Profile component
const Profile = async(() => import("@/pages/pages/Profile"));
// Importer le composant AttribuerRoles avec le bon chemin
const AttribuerRoles = async(() => import("@/pages/roles-permissions/AttribuerRoles"));

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
        element: (
          <RouteGuard requiredRoles={['admin']} requiredPages={['/dashboard/analytics']}>
            <Analytics />
          </RouteGuard>
        ),
      },
      {
        path: "saas",
        element: (
          <RouteGuard requiredRoles={['admin']} requiredPages={['/dashboard/saas']}>
            <SaaS />
          </RouteGuard>
        ),
      },
      {
        path: "apercu",
        element: (
          <RouteGuard requiredRoles={['admin', 'manager', 'employee']} requiredPages={['/dashboard/apercu']}>
            <TableauDeBord />
          </RouteGuard>
        ),
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
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/roles-permissions/assign']}>
            <AttribuerRoles />
          </RouteGuard>
        ),
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
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/facturation/liste-des-factures']}>
            <ListeDesFactures />
          </RouteGuard>
        ),
      },
      {
        path: "details-facture/:id",
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/facturation/details-facture/:id']}>
            <DetailsFacture />
          </RouteGuard>
        ),
      },
      {
        path: "creer-facture",
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/facturation/creer-facture']}>
            <CreerFacture />
          </RouteGuard>
        ),
      },
      {
        path: "modifier-facture/:id",
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/facturation/modifier-facture/:id']}>
            <ModifierFacture />
          </RouteGuard>
        ),
      },
      {
        path: "gestion-des-clients",
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/facturation/gestion-des-clients']}>
            <GestionDesClients />
          </RouteGuard>
        ),
      },
      {
        path: "clients/:clientId",
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/facturation/clients/:clientId']}>
            <ClientDetails />
          </RouteGuard>
        ),
      },
      {
        path: "creer-devis",
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/facturation/creer-devis']}>
            <CreateDevis />
          </RouteGuard>
        ),
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
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/avis-de-passage/creer-avis-passage']}>
            <CreateAvisDePassage />
          </RouteGuard>
        ),
      },
      {
        path: "envoyer-avis-passage",
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/avis-de-passage/envoyer-avis-passage']}>
            <SendAvisDePassage />
          </RouteGuard>
        ),
      },
      {
        path: "rechercher-avis-passage",
        element: (
          <RouteGuard requiredRoles={['admin', 'manager']} requiredPages={['/avis-de-passage/rechercher-avis-passage']}>
            <SearchAvisDePassage />
          </RouteGuard>
        ),
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
        element: (
          <RouteGuard requiredRoles={['admin', 'manager', 'employee']} requiredPages={['/profile']}>
            <Profile />
          </RouteGuard>
        ),
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
