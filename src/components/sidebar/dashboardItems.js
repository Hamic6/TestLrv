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
  Drafts as DraftsIcon, // Nouvelle icône pour "Créer un Proforma"
  Print as PrintIcon, // Importer l'icône d'imprimante
  Inventory2Outlined,
  MoveToInbox, // Ajouté pour Formulaire d'entrée de stock (alternative)
  AddBox, // Nouvelle icône pour "Ajouter un Article"
  VerifiedUser as VerifiedUserIcon,
  LocalShipping as LocalShippingIcon, // Ajoute cette ligne
  NoteAdd, // Nouvelle icône pour "Ajouter/Créer un Proforma"
  FactCheck as FactCheckIcon,
} from '@mui/icons-material';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/FirebaseAuthContext'; // Utiliser AuthContext
import CategoryIcon from '@mui/icons-material/Category';

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
          title: "Gestion des partenaires",
          visible: isAdmin || roles.includes('gestion-des-clients'),
        },
        {
          href: "/facturation/creer-proforma",
          icon: NoteAdd, // Icône feuille avec un + pour "Créer une Proforma"
          title: "Créer une Proforma",
          visible: isAdmin || roles.includes('proforma'),
        },
        {
          href: "/facturation/chercher-proforma",
          icon: ReceiptIcon, // Icône ticket/facture pour "Rechercher un Proforma"
          title: "Proforma",
          visible: isAdmin || roles.includes('proforma'),
        },
      ],
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
          icon: FactCheckIcon,
          title: "Gestion des Avis de Passage",
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
          icon: MoveToInbox, 
          title: "Bon de commande ",
          visible: isAdmin || (roles.includes('gestion-de-stock')),
        },
        {
          href: "/stock/add",
          icon: AddBox, 
          title: "Créer un Article",
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/management",
          icon: CategoryIcon,
          title: "Inventaire",
          visible: isAdmin || roles.includes('gestion-de-stock') || roles.includes('validation-stock'),
        },
        {
          href: "/stock/bon-de-commande",
          icon: Inventory2Outlined,
          title: "Gestion des bons de commande",
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/delivery-note",
          icon: DescriptionIcon,
          title: "Créer un bon de livraison", 
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/delivery-management",
          icon: LocalShippingIcon,
          title: "Gestion des bons de livraison",
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/receptions",
          icon: ReceiptIcon, // ou une autre icône adaptée
          title: "Bons de Réception",
          visible: isAdmin || roles.includes('gestion-de-stock'),
        },
        {
          href: "/stock/validation",
          icon: CheckCircle,
          title: "Validation",
          visible: isAdmin || roles.includes('validation-stock'),
          children: [
            {
              href: "/stock/validation/management",
              icon: VerifiedUserIcon,
              title: "Gestion des validations",
              parentModule: "Gestion de Stock",
              visible: isAdmin || roles.includes('validation-stock'),
            },
          ],
        },
      ],
      visible: isAdmin || roles.includes('gestion-de-stock') || roles.includes('validation-stock'),
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
          href: "/roles-permissions/assign",
          icon: Key,
          title: "Assigner des Rôles",
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
