import React from "react";
import { Container, Typography, Box, Divider } from "@mui/material";

const sections = [
  {
    title: "1. Acceptation des Conditions",
    content: `L’accès et l’utilisation de l’application Rayonvert.online (ci-après "l’Application") impliquent l’acceptation intégrale des présentes Conditions d’Utilisation par l’utilisateur (ci-après "l’Utilisateur").`,
  },
  {
    title: "2. Description du Service",
    content: `L’Application est un ERP cloud (SaaS) développé par HAMICI Danny, offrant les fonctionnalités suivantes :
    - Gestion de facturation, bons de commande et livraison.
    - Suivi des stocks et analytiques clients.
    - Export de données (PDF, Excel, CSV).
    - Accès multi-utilisateurs avec rôles personnalisables.
    - Hébergement sécurisé (HTTPS, chiffrement Firebase).`,
  },
  {
    title: "3. Licence et Restrictions",
    content: `3.1 Licence :
    Accès accordé sous forme d’abonnement (mensuel/annuel), strictement limité à un usage professionnel.
    Interdiction de : reverse engineering, copie, revente, ou utilisation concurrentielle.
    3.2 Propriété Intellectuelle :
    Le code source, l’interface et les données techniques restent la propriété exclusive du Vendeur.`,
  },
  {
    title: "4. Abonnement et Paiement",
    content: `4.1 Paiement :
    Paiement par virement bancaire. Suspension après 30 jours de retard.
    Stockage Firebase : 1 Go inclus. Dépassements facturés selon tarifs Google Cloud.`,
  },
  {
    title: "5. Disponibilité et Maintenance",
    content: `Taux de disponibilité garanti : 99% (hors maintenances notifiées 48h à l’avance).
    Mises à jour automatiques incluses.`,
  },
  {
    title: "6. Responsabilités",
    content: `6.1 Utilisateur :
    Sauvegarde indépendante de ses données.
    Utilisation conforme aux lois congolaises (ex : facturation électronique).
    6.2 Éditeur :
    Non responsable des pertes dues à une mauvaise utilisation ou problèmes de connexion.`,
  },
  {
    title: "7. Défauts Majeurs et Réclamations",
    content: `Sont considérés comme défauts majeurs (donnant droit à remboursement pro-rata) :
    - Indisponibilité des fonctionnalités critiques > 72h.
    - Perte de données due à une faille système.
    - Non-conformité légale (ex : formats de facturation invalides).
    Procédure : Notification par email avec preuves sous 12 jours. Correction sous 30 jours.`,
  },
  {
    title: "8. Confidentialité et Données",
    content: `Les données utilisateur sont chiffrées (Firebase).
    Confidentialité du code source : toute divulgation entraîne des poursuites.
    Conservation des logs : 12 mois (conformément à la loi congolaise).`,
  },
  {
    title: "9. Résiliation",
    content: `Résiliation avec préavis de 30 jours (abonnements mensuels).
    Aucun remboursement en cas de résiliation anticipée par l’Utilisateur.`,
  },
  {
    title: "10. Litiges et Droit Applicable",
    content: `Droit applicable : Lois de la RDC (Loi n°013/2002).
    Tribunal compétent : Kinshasa, avec médiation obligatoire avant action en justice.`,
  },
  {
    title: "11. Contact",
    content: `Pour toute question :
    Éditeur : HAMICI Danny – dannyhamici@gmail.com
    Client : direction@rayonverts.com`,
  },
];

const Conditions = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Conditions d’Utilisation de Rayonvert.online
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
        Dernière mise à jour : 26/06/2025
      </Typography>
      <Divider sx={{ my: 3 }} />
      {sections.map((section, idx) => (
        <Box key={idx} sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {section.title}
          </Typography>
          {section.content.split("\n").map((line, i) =>
            line.trim().startsWith("-") ? (
              <Typography key={i} component="li" sx={{ ml: 3 }}>
                {line.replace(/^- /, "")}
              </Typography>
            ) : (
              <Typography key={i} variant="body2" paragraph>
                {line.trim()}
              </Typography>
            )
          )}
        </Box>
      ))}
      <Divider sx={{ my: 4 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        En utilisant Rayonvert.online, vous reconnaissez avoir lu et accepté ces Conditions.
      </Typography>
    </Box>
  </Container>
);

export default Conditions;