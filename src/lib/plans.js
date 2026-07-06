import { BLOCK_TYPES } from './blockTypes';
import { FUNNEL_TEMPLATES } from './funnelTemplates';

const STARTER_BLOCKS = BLOCK_TYPES.filter((b) => b.tier === 'starter').map((b) => b.type);
const ALL_BLOCKS = BLOCK_TYPES.map((b) => b.type);

const STARTER_TEMPLATES = FUNNEL_TEMPLATES.filter((t) => t.tier === 'starter').map((t) => t.key);
const ALL_TEMPLATES = FUNNEL_TEMPLATES.map((t) => t.key);

export const PLANS = {
  starter: {
    key: 'starter',
    name: 'Starter',
    price: 0,
    period: '/ mois',
    maxFunnels: 1,
    templates: STARTER_TEMPLATES,
    blocks: STARTER_BLOCKS,
    showBranding: true,
    brandKit: false,
    analytics: false,
    leadsExport: false,
    features: [
      '1 tunnel de vente',
      `${STARTER_TEMPLATES.length} modèles de base`,
      'Blocs essentiels (Hero, Texte, Image, Formulaire, CTA)',
      'Assistant pas-à-pas',
      'Mention "Propulsé par Vendeko"',
    ],
  },
  createur: {
    key: 'createur',
    name: 'Pro',
    price: 19000,
    period: '/ mois',
    maxFunnels: Infinity,
    templates: ALL_TEMPLATES,
    blocks: ALL_BLOCKS,
    showBranding: false,
    brandKit: true,
    analytics: false,
    leadsExport: true,
    features: [
      'Tunnels illimités',
      `Les ${ALL_TEMPLATES.length} modèles de tunnels`,
      'Tous les blocs (Quiz, Tarification, Compte à rebours, FAQ...)',
      "Sans mention \"Propulsé par Vendeko\"",
      'Brand Kit : couleurs, typographie et logo personnalisés',
      'Export des leads en CSV',
    ],
  },
  entreprise: {
    key: 'entreprise',
    name: 'Entreprise',
    price: 38000,
    period: '/ mois',
    maxFunnels: Infinity,
    templates: ALL_TEMPLATES,
    blocks: ALL_BLOCKS,
    showBranding: false,
    brandKit: true,
    analytics: true,
    leadsExport: true,
    features: [
      'Tout le plan Pro',
      'Statistiques et taux de conversion par tunnel',
      'Support prioritaire 24/7',
      'Onboarding personnalisé',
    ],
  },
};

export const PLAN_ORDER = ['starter', 'createur', 'entreprise'];

export function getPlan(planKey) {
  return PLANS[planKey] || PLANS.starter;
}

export function formatPrice(price) {
  if (price === null || price === undefined) return 'Sur devis';
  if (price === 0) return 'Gratuit';
  return `${price.toLocaleString('fr-FR')} FCFA`;
}
