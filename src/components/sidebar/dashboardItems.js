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
  PersonAdd as PersonAddIcon, // Icone pour Ajouter un Utilisateur
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
      children: [
        // Suppression de l'élément "Aperçu Général (maquette)"
        {
          href: "/tableau-de-bord/stats",
          icon: AssessmentIcon,
          title: "Statistiques de facturation",
          visible: isAdmin || roles.includes('manager'),
        },
        {
          href: "/tableau-de-bord/graphs",
          icon: AssessmentIcon,
          title: "Graphiques et visualisations",
          visible: isAdmin || roles.includes('manager'),
        },
        {
          href: "/tableau-de-bord/performance",
          icon: AssessmentIcon,
          title: "Indicateurs de performance",
          visible: isAdmin || roles.includes('manager'),
        },
        {
          href: "/tableau-de-bord/alerts",
          icon: AnnouncementIcon,
          title: "Alertes et notifications",
          visible: isAdmin || roles.includes('manager'),
        }
      ]
    },
    {
      href: "/facturation",
      icon: CreditCard,
      title: "Facturation",
      visible: isAdmin || roles.includes('facturation') || roles.includes('liste-des-factures') || roles.includes('creer-facture') || roles.includes('gestion-des-clients'),
      children: [
        {
          href: "/facturation/liste-des-factures",
          icon: DescriptionIcon,
          title: "Rapports & Listes",
          visible: isAdmin || roles.includes('liste-des-factures'),
        },
        {
          href: "/facturation/creer-facture",
          icon: CreateIcon,
          title: "Créer une Facture",
          visible: isAdmin || roles.includes('creer-facture'),
        },
        {
          href: "/facturation/gestion-des-clients",
          icon: PeopleIcon,
          title: "Gestion des Clients",
          visible: isAdmin || roles.includes('gestion-des-clients'),
        },
      ],
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
          visible: isAdmin || roles.includes('devis'),
        },
        {
          href: "/devis/chercher-devis",
          icon: SearchIcon,
          title: "Rechercher un Devis",
          visible: isAdmin || roles.includes('devis'),
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
          visible: isAdmin || roles.includes('avis-de-passage'),
        },
        
        {
          href: "/avis-de-passage/rechercher-avis-passage",
          icon: SearchIcon,
          title: "Rechercher un Avis de Passage",
          visible: isAdmin || roles.includes('avis-de-passage'),
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
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/item/:id",
          icon: Archive,
          title: "Détails de l'Article",
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/add",
          icon: Archive,
          title: "Ajouter un Article",
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/edit/:id",
          icon: Archive,
          title: "Modifier un Article",
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/reports",
          icon: Archive,
          title: "Rapports de Stock",
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/validation",
          icon: CheckCircle,
          title: "Validation de Stock",
          visible: isAdmin || roles.includes('gestion-de-stock'),
          children: [
            {
              href: "/validation/pending",
              icon: CheckCircle,
              title: "En Attente",
              parentModule: "Gestion de Stock",
              visible: isAdmin || roles.includes('gestion-de-stock'),
            },
            {
              href: "/validation/approved",
              icon: CheckCircle,
              parentModule: "Gestion de Stock",
              title: "Approuvées",
              visible: isAdmin || roles.includes('gestion-de-stock'),
            },
            {
              href: "/validation/rejected",
              icon: CheckCircle,
              parentModule: "Gestion de Stock",
              title: "Rejetées",
              visible: isAdmin || roles.includes('gestion-de-stock'),
            },
            {
              href: "/validation/logs",
              icon: CheckCircle,
              parentModule: "Gestion de Stock",
              title: "Historique de Validation",
              visible: isAdmin || roles.includes('gestion-de-stock'),
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
      visible: isAdmin, // Seuls les administrateurs peuvent voir cette section
      children: [
        {
          href: "/roles-permissions/add-user",
          icon: PersonAddIcon,
          title: "Ajouter un Utilisateur",
          visible: isAdmin,
        },
        {
          href: "/roles-permissions/permissions",
          icon: UsersIcon,  // Icon mise à jour
          title: "Utilisateurs",
          visible: isAdmin,
        },
        {
          href: "/roles-permissions/assign",
          icon: Key,
          title: "Attribuer des Rôles",
          visible: isAdmin,
        },
      ],
    },
  ];

  return pages.filter(page => page.visible).map(page => {
    if (page.children) {
      page.children = page.children.filter(child => child.visible);
    }
    return page;
  });
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
