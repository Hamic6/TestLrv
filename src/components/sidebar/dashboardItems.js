import { 
  CreditCard,
  Archive,
  CheckCircle,
  Key,
  FileText,
  Home as HomeIcon, // Ajouté pour l'icône Acceuil
} from "lucide-react";
import { 
  Description as DescriptionIcon, 
  Create as CreateIcon, 
  People as PeopleIcon, 
  Group as GroupIcon,
  Dashboard as DashboardIcon, 
  Assessment as AssessmentIcon, 
  Announcement as AnnouncementIcon, 
  Receipt as ReceiptIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Group as UsersIcon,  // Ajouté pour les utilisateurs
} from '@mui/icons-material';
import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/FirebaseAuthContext'; // Utiliser AuthContext

const useAuth = () => {
  const { user } = useContext(AuthContext);
  return user ? user.roles : [];
};

const generatePagesSection = (roles = []) => {
  const isAdmin = roles.includes('admin');

  const pages = [
    {
      href: "/acceuil",
      icon: HomeIcon,
      title: "Acceuil",
      visible: true, // Pour que tous les utilisateurs puissent y accéder
    },
    {
      href: "/tableau-de-bord",
      icon: DashboardIcon,
      title: "Tableau de Bord",
      visible: isAdmin || roles.includes('manager'),
    },
    {
      href: "/rapports",
      icon: AssessmentIcon,
      title: "Rapports de Facturation",
      visible: isAdmin || roles.includes('manager'),
    },
    {
      href: "/facturation",
      icon: CreditCard,
      title: "Facturation",
      children: [
        {
          href: "/facturation/liste-des-factures",
          icon: DescriptionIcon,
          title: "Liste des Factures",
        },
        {
          href: "/facturation/creer-facture",
          icon: CreateIcon,
          title: "Créer une Facture",
        },
        {
          href: "/facturation/gestion-des-clients",
          icon: PeopleIcon,
          title: "Gestion des Clients",
        },
      ],
      visible: isAdmin || roles.includes('facturation'),
    },
    {
      href: "/devis",
      icon: FileText,
      title: "Devis",
      children: [
        {
          href: "/devis/creer-devis",
          icon: CreateIcon,
          title: "Créer un Devis",
        },
        {
          href: "/devis/envoyer-devis",
          icon: SendIcon,
          title: "Envoyer un Devis",
        },
      ],
      visible: isAdmin || roles.includes('devis'),
    },
    {
      href: "/avis-de-passage",
      icon: AnnouncementIcon,
      title: "Avis de Passage",
      children: [
        {
          href: "/avis-de-passage/creer-avis-passage",
          icon: ReceiptIcon,
          title: "Créer un Avis de Passage",
        },
        {
          href: "/avis-de-passage/envoyer-avis-passage",
          icon: SendIcon,
          title: "Envoyer un Avis de Passage",
        },
        {
          href: "/avis-de-passage/rechercher-avis-passage",
          icon: SearchIcon,
          title: "Rechercher un Avis de Passage",
        },
      ],
      visible: isAdmin || roles.includes('avis-de-passage'),
    },
    {
      href: "/stock-management",
      icon: Archive,
      title: "Gestion de Stock",
      children: [
        {
          href: "/stock/items",
          icon: Archive,
          title: "Liste des Articles",
        },
        {
          href: "/stock/item/:id",
          icon: Archive,
          title: "Détails de l'Article",
        },
        {
          href: "/stock/add",
          icon: Archive,
          title: "Ajouter un Article",
        },
        {
          href: "/stock/edit/:id",
          icon: Archive,
          title: "Modifier un Article",
        },
        {
          href: "/stock/reports",
          icon: Archive,
          title: "Rapports de Stock",
        },
        {
          href: "/stock/validation",
          icon: CheckCircle,
          title: "Validation de Stock",
          children: [
            {
              href: "/validation/pending",
              icon: CheckCircle,
              title: "En Attente",
              parentModule: "Gestion de Stock",
            },
            {
              href: "/validation/approved",
              icon: CheckCircle,
              parentModule: "Gestion de Stock",
              title: "Approuvées",
            },
            {
              href: "/validation/rejected",
              icon: CheckCircle,
              parentModule: "Gestion de Stock",
              title: "Rejetées",
            },
            {
              href: "/validation/logs",
              icon: CheckCircle,
              parentModule: "Gestion de Stock",
              title: "Historique de Validation",
            },
          ],
        },
      ],
      visible: isAdmin || roles.includes('gestion-de-stock'),
    },
    {
      href: "/roles-permissions",
      icon: GroupIcon,
      title: "Gestion des Utilisateurs",
      children: [
        {
          href: "/roles-permissions/roles",
          icon: Key,
          title: "Rôles",
        },
        {
          href: "/roles-permissions/permissions",
          icon: UsersIcon,  // Icon mise à jour
          title: "Utilisateurs",  // Titre mis à jour
        },
        {
          href: "/roles-permissions/assign",
          icon: Key,
          title: "Attribuer des Rôles",
        },
      ],
      visible: true, // Pour que tous les utilisateurs puissent y accéder
    },
  ];

  return pages.filter(page => page.visible);
};

const NavItems = () => {
  const accessibleRoles = useAuth();

  return [
    {
      title: "Pages",
      pages: generatePagesSection(accessibleRoles),
    },
  ];
};

export default NavItems;
