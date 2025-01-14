import { 
  CreditCard,
  Sliders,
  Archive,
  CheckCircle,
  Key,
} from "lucide-react";
import { 
  Description as DescriptionIcon, 
  Create as CreateIcon, 
  People as PeopleIcon, 
  Dashboard as DashboardIcon, 
  Assessment as AssessmentIcon, 
  Announcement as AnnouncementIcon, 
  Receipt as ReceiptIcon,
  Send as SendIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const pagesSection = [
  {
    href: "/dashboard",
    icon: Sliders,
    title: "Dashboard",
    children: [
      {
        href: "/dashboard/default",
        icon: Sliders,
        title: "Default",
      },
      {
        href: "/dashboard/analytics",
        icon: Sliders,
        title: "Analytics",
      },
      {
        href: "/dashboard/saas",
        icon: Sliders,
        title: "SaaS",
      },
    ],
  },
  {
    href: "/tableau-de-bord",
    icon: DashboardIcon,
    title: "Tableau de Bord",
    children: [
      {
        href: "/tableau-de-bord/apercu",
        icon: Sliders,
        title: "Aperçu",
      },
    ],
  },
  {
    href: "/rapports",
    icon: AssessmentIcon,
    title: "Rapports de Facturation",
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
      {
        href: "/facturation/creer-devis",
        icon: CreateIcon,
        title: "Créer un Devis",
      },
      {
        href: "/facturation/envoyer-devis",
        icon: SendIcon,
        title: "Envoyer un Devis",
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
            title: "Approuvées",
            parentModule: "Gestion de Stock",
          },
          {
            href: "/validation/rejected",
            icon: CheckCircle,
            title: "Rejetées",
            parentModule: "Gestion de Stock",
          },
          {
            href: "/validation/logs",
            icon: CheckCircle,
            title: "Historique de Validation",
            parentModule: "Gestion de Stock",
          },
        ],
      },
    ],
  },
  {
    href: "/roles-permissions",
    icon: Key,
    title: "Gestion des Rôles et Permissions",
    children: [
      {
        href: "/roles-permissions/roles",
        icon: Key,
        title: "Rôles",
      },
      {
        href: "/roles-permissions/permissions",
        icon: Key,
        title: "Permissions",
      },
      {
        href: "/roles-permissions/assign",
        icon: Key,
        title: "Attribuer des Rôles",
      },
    ],
  },
];

const navItems = [
  {
    title: "Pages",
    pages: pagesSection,
  },
];

export default navItems;
