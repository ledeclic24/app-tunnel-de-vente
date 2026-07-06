import {
  LayoutTemplate, Type, Image, LayoutGrid, MessageSquareQuote,
  Tag, Mail, Timer, HelpCircle, MousePointerClick, ListChecks,
} from 'lucide-react';

export const BLOCK_TYPES = [
  {
    type: 'hero',
    label: 'Hero',
    icon: LayoutTemplate,
    tier: 'starter',
    defaultContent: () => ({
      eyebrow: 'Nouveau',
      heading: 'Un titre percutant pour ta page',
      subheading: "Décris ici la promesse principale de ton offre en une phrase claire.",
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop',
      ctaText: 'Continuer',
      externalUrl: '',
    }),
  },
  {
    type: 'text',
    label: 'Texte',
    icon: Type,
    tier: 'starter',
    defaultContent: () => ({
      heading: 'Un sous-titre',
      body: 'Ajoute ici le texte de ton choix : explique ton offre, ton histoire ou tes arguments.',
    }),
  },
  {
    type: 'image',
    label: 'Image',
    icon: Image,
    tier: 'starter',
    defaultContent: () => ({
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&auto=format&fit=crop',
      caption: '',
    }),
  },
  {
    type: 'form',
    label: 'Formulaire',
    icon: Mail,
    tier: 'starter',
    defaultContent: () => ({
      headline: 'Reçois-le gratuitement par email',
      buttonText: "Je m'inscris",
      successMessage: 'Merci ! Vérifie ta boîte mail.',
    }),
  },
  {
    type: 'cta',
    label: "Appel à l'action",
    icon: MousePointerClick,
    tier: 'starter',
    defaultContent: () => ({
      heading: 'Prêt à commencer ?',
      buttonText: 'Continuer',
      externalUrl: '',
    }),
  },
  {
    type: 'features',
    label: 'Fonctionnalités',
    icon: LayoutGrid,
    tier: 'createur',
    defaultContent: () => ({
      heading: 'Ce que tu obtiens',
      items: [
        { title: 'Premier avantage', description: 'Décris ce bénéfice en une phrase.' },
        { title: 'Deuxième avantage', description: 'Décris ce bénéfice en une phrase.' },
        { title: 'Troisième avantage', description: 'Décris ce bénéfice en une phrase.' },
      ],
    }),
  },
  {
    type: 'testimonials',
    label: 'Témoignages',
    icon: MessageSquareQuote,
    tier: 'createur',
    defaultContent: () => ({
      heading: "Ce qu'ils en disent",
      items: [
        { name: 'Aïcha D.', role: 'Cliente', quote: 'Un résultat au-delà de mes attentes !' },
      ],
    }),
  },
  {
    type: 'pricing',
    label: 'Tarification',
    icon: Tag,
    tier: 'createur',
    defaultContent: () => ({
      heading: 'Choisis ton offre',
      plans: [
        { name: 'Offre unique', price: '29', period: '', features: ['Accès complet', 'Support inclus'], highlight: true },
      ],
    }),
  },
  {
    type: 'countdown',
    label: 'Compte à rebours',
    icon: Timer,
    tier: 'createur',
    defaultContent: () => ({
      headline: 'Offre limitée dans le temps',
      targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    }),
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    tier: 'createur',
    defaultContent: () => ({
      heading: 'Questions fréquentes',
      items: [
        { question: 'Comment ça marche ?', answer: "Ajoute autant de questions que nécessaire pour rassurer tes visiteurs." },
      ],
    }),
  },
  {
    type: 'quiz',
    label: 'Quiz',
    icon: ListChecks,
    tier: 'createur',
    defaultContent: () => ({
      heading: 'Découvre ton profil',
      questions: [
        { question: 'Première question ?', options: ['Option 1', 'Option 2', 'Option 3'] },
      ],
      resultButtonText: 'Voir mon résultat',
    }),
  },
];

export function getBlockDef(type) {
  return BLOCK_TYPES.find((b) => b.type === type);
}

export function createDefaultContent(type) {
  const def = getBlockDef(type);
  return def ? def.defaultContent() : {};
}
