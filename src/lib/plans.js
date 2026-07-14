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
    leadsHistoryLimit: 5,
    aiAccess: false,
    aiMonthlyLimit: 0,
    imageGeneration: false,
    imageGenerationMonthlyLimit: 0,
    ebookAccess: false,
    ebookMonthlyLimit: 0,
    blockLibrary: false,
    pageChrome: false,
    webhooks: false,
    scheduledPublish: false,
    benchmark: false,
    adPixels: false,
    adsManagement: false,
    teamSeats: 1,
    features: [
      '1 tunnel de vente',
      `${STARTER_TEMPLATES.length} modèles de base`,
      'Blocs essentiels (Hero, Texte, Image, Formulaire, CTA)',
      '5 derniers leads visibles',
      'Assistant pas-à-pas',
      'Score de santé du tunnel',
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
    leadsHistoryLimit: Infinity,
    aiAccess: true,
    aiMonthlyLimit: 20,
    imageGeneration: true,
    imageGenerationMonthlyLimit: 15,
    ebookAccess: true,
    ebookMonthlyLimit: 30,
    blockLibrary: true,
    pageChrome: true,
    webhooks: true,
    scheduledPublish: true,
    benchmark: true,
    adPixels: false,
    adsManagement: false,
    teamSeats: 1,
    features: [
      'Tunnels illimités',
      `Les ${ALL_TEMPLATES.length} modèles et tous les blocs`,
      "Sans mention \"Propulsé par Vendeko\"",
      'Copilote IA pour générer et modifier vos tunnels (20 / mois)',
      'Génération d\'images IA pour vos visuels (15 / mois)',
      'Générateur d\'ebook IA avec export PDF',
      'Brand Kit + bibliothèque de blocs réutilisables',
      'Compte à rebours, notification d\'achat et pied de page collant',
      'Webhooks vers Zapier, Make, Google Sheets...',
      'Publication planifiée + benchmark sectoriel',
      'Historique complet des leads + export CSV',
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
    leadsHistoryLimit: Infinity,
    aiAccess: true,
    aiMonthlyLimit: Infinity,
    imageGeneration: true,
    imageGenerationMonthlyLimit: Infinity,
    ebookAccess: true,
    ebookMonthlyLimit: Infinity,
    blockLibrary: true,
    pageChrome: true,
    webhooks: true,
    scheduledPublish: true,
    benchmark: true,
    adPixels: true,
    adsManagement: true,
    teamSeats: 5,
    features: [
      'Tout le plan Pro',
      'Génération de tunnel par IA illimitée',
      'Génération d\'images IA illimitée',
      'Statistiques et taux de conversion par tunnel',
      'Pixels publicitaires (Meta, Google Ads/Analytics)',
      'Gestion des campagnes Meta Ads depuis Vendeko',
      "Jusqu'à 5 membres d'équipe",
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
