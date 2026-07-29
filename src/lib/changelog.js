// Historique des changements notables affichés au vendeur (voir
// NouveautesBanner.jsx) — chaque entrée a un `id` STABLE et jamais
// réutilisé, comparé à la dernière valeur vue en localStorage : c'est LUI
// qui détermine si la bannière doit réapparaître, pas la position dans le
// tableau. La plus récente entrée est toujours en tête.
export const CHANGELOG = [
  {
    id: '2026-07-tunnel-improvements',
    date: '2026-07-26',
    items: [
      "Paiement direct dès le premier bouton (titre principal, appel à l'action) quand une seule offre existe sur la page — plus besoin de configuration supplémentaire.",
      'Tableau de bord : recherche, filtres par catégorie/statut/période, et sélection multiple pour publier, dépublier ou supprimer plusieurs tunnels à la fois.',
      "Statistiques d'acceptation des offres upsell/downsell, visibles dans l'onglet Analytique.",
      'Coût en crédits affiché avant chaque génération IA, et historique complet des mouvements de crédits depuis la page Facturation.',
      'Modèles mis en avant par l\'équipe dans le marketplace de la communauté.',
    ],
  },
];
