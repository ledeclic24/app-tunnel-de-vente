import {
  Mail, Rocket, Video, CalendarCheck, ShoppingBag,
  PartyPopper, ListChecks, Users, UserCircle, FileText,
} from 'lucide-react';

export const CATEGORIES = [
  { key: 'leads', label: 'Génération de leads', icon: Mail, description: "Récolte des adresses email grâce à une offre gratuite." },
  { key: 'vente', label: 'Vente', icon: Rocket, description: "Présente une offre et convertis tes visiteurs en clients." },
  { key: 'webinaire', label: 'Webinaire', icon: Video, description: "Fais s'inscrire tes visiteurs à un évènement en direct ou à un replay." },
  { key: 'coaching', label: 'Coaching', icon: CalendarCheck, description: "Remplis ton agenda d'appels ou de candidatures qualifiées." },
  { key: 'ecommerce', label: 'E-commerce', icon: ShoppingBag, description: "Vends un produit physique en ligne." },
  { key: 'evenement', label: 'Évènement', icon: PartyPopper, description: "Fais s'inscrire des participants à un évènement." },
  { key: 'quiz', label: 'Quiz', icon: ListChecks, description: "Engage tes visiteurs avec un quiz interactif avant de les convertir." },
  { key: 'communaute', label: 'Communauté', icon: Users, description: "Fais grandir une communauté ou un programme payant." },
  { key: 'marque-perso', label: 'Marque personnelle', icon: UserCircle, description: "Présente-toi et centralise tes liens." },
  { key: 'personnalise', label: 'Personnalisé', icon: FileText, description: "Pars d'une page blanche et construis à ta façon." },
];

export function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
}

export const FUNNEL_TEMPLATES = [
  // ============ Génération de leads ============
  {
    key: 'capture',
    name: 'Page de capture',
    description: "Récolte des emails avec une offre gratuite (ebook, guide, checklist...).",
    category: 'Génération de leads',
    categoryKey: 'leads',
    icon: Mail,
    tier: 'starter',
    steps: [
      {
        name: 'Inscription',
        slug: 'inscription',
        step_type: 'opt-in',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Gratuit',
            heading: 'Reçois ton guide gratuit',
            subheading: "Indique ton email ci-dessous pour le recevoir immédiatement dans ta boîte mail.",
            imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'form', content: { headline: 'Où doit-on l\'envoyer ?', buttonText: 'Je le veux', successMessage: 'Merci ! Vérifie ta boîte mail (et tes spams).' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'C\'est fait !', body: 'Ton guide arrive dans ta boîte mail d\'ici quelques minutes.' } },
        ],
      },
    ],
  },
  {
    key: 'ressource-premium',
    name: 'Guide + bonus exclusif',
    description: "Une ressource gratuite enrichie d'un bonus, pour maximiser les inscriptions.",
    category: 'Génération de leads',
    categoryKey: 'leads',
    icon: Mail,
    tier: 'createur',
    steps: [
      {
        name: 'Inscription',
        slug: 'inscription',
        step_type: 'opt-in',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Gratuit + bonus', heading: 'Le guide qui manquait à ta boîte à outils',
            subheading: "Télécharge le guide complet et reçois en bonus une ressource exclusive.",
            imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'features', content: { heading: 'Ce que contient le guide', items: [
            { title: 'Méthode pas-à-pas', description: 'Un plan d\'action clair, sans jargon.' },
            { title: 'Modèles prêts à l\'emploi', description: 'Gagne du temps avec des exemples concrets.' },
            { title: 'Bonus exclusif', description: 'Une ressource supplémentaire réservée aux inscrits.' },
          ] } },
          { type: 'form', content: { headline: 'Reçois le guide et ton bonus', buttonText: 'Je télécharge', successMessage: 'Merci ! Le guide et ton bonus arrivent par email.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'C\'est envoyé !', body: 'Vérifie ta boîte mail : ton guide et ton bonus exclusif arrivent d\'un instant à l\'autre.' } },
        ],
      },
    ],
  },

  // ============ Vente ============
  {
    key: 'vente',
    name: 'Lancement de produit',
    description: "Présente ton offre, crée l'urgence, et convertis en vente.",
    category: 'Vente',
    categoryKey: 'vente',
    icon: Rocket,
    tier: 'createur',
    steps: [
      {
        name: 'Vente',
        slug: 'vente',
        step_type: 'sales',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Offre de lancement', heading: 'Le produit qui va changer la donne',
            subheading: 'Décris ici la transformation que ton offre apporte à tes clients.',
            imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je découvre l\'offre', externalUrl: '',
          } },
          { type: 'features', content: { heading: 'Ce que tu obtiens', items: [
            { title: 'Résultat concret', description: 'Le premier bénéfice clé de ton offre.' },
            { title: 'Gain de temps', description: 'Pourquoi c\'est plus simple avec toi.' },
            { title: 'Accompagnement', description: 'Le soutien apporté après l\'achat.' },
          ] } },
          { type: 'countdown', content: { headline: 'Offre de lancement valable jusqu\'à', targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } },
          { type: 'testimonials', content: { heading: 'Ils l\'ont adopté', items: [
            { name: 'Fatou S.', role: 'Cliente', quote: 'Résultat visible dès la première semaine !' },
          ] } },
          { type: 'pricing', content: { heading: 'Choisis ton offre', plans: [
            { name: 'Offre unique', price: '29', period: '€', features: ['Accès complet', 'Support par email', 'Mises à jour incluses'], highlight: true },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Y a-t-il une garantie ?', answer: 'Oui, satisfait ou remboursé sous 14 jours.' },
          ] } },
          { type: 'cta', content: { heading: 'Prêt à te lancer ?', buttonText: 'Je commande', externalUrl: '' } },
        ],
      },
      {
        name: 'Commande',
        slug: 'commande',
        step_type: 'order',
        blocks: [
          { type: 'text', content: { heading: 'Dernière étape', body: 'Renseigne tes informations pour finaliser ta commande.' } },
          { type: 'form', content: { headline: 'Tes informations', buttonText: 'Confirmer la commande', successMessage: 'Commande reçue ! Tu vas recevoir un email de confirmation.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Merci pour ta confiance !', body: 'Tu vas recevoir tous les détails par email dans quelques instants.' } },
        ],
      },
    ],
  },
  {
    key: 'vente-flash',
    name: 'Vente flash',
    description: "Une seule page, une offre à prix réduit, une urgence forte : direct et efficace.",
    category: 'Vente',
    categoryKey: 'vente',
    icon: Rocket,
    tier: 'createur',
    steps: [
      {
        name: 'Offre flash',
        slug: 'offre-flash',
        step_type: 'sales',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Offre limitée', heading: '-50% pendant 48h seulement',
            subheading: 'Décris ici ton offre choc et pourquoi elle ne durera pas.',
            imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'J\'en profite maintenant', externalUrl: '',
          } },
          { type: 'countdown', content: { headline: 'L\'offre se termine dans', targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } },
          { type: 'pricing', content: { heading: 'Prix flash', plans: [
            { name: 'Offre flash', price: '19', period: '€', features: ['Accès immédiat', 'Prix garanti pendant l\'offre', 'Sans engagement'], highlight: true },
          ] } },
          { type: 'cta', content: { heading: 'Dernière chance', buttonText: 'Je commande avant la fin', externalUrl: '' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Commande confirmée !', body: 'Tu as bien profité de l\'offre flash, les détails arrivent par email.' } },
        ],
      },
    ],
  },

  // ============ Webinaire ============
  {
    key: 'webinaire',
    name: 'Webinaire en direct',
    description: "Fais s'inscrire tes visiteurs à un événement en direct.",
    category: 'Webinaire',
    categoryKey: 'webinaire',
    icon: Video,
    tier: 'createur',
    steps: [
      {
        name: 'Inscription',
        slug: 'inscription',
        step_type: 'opt-in',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Événement en direct', heading: 'Rejoins mon prochain atelier gratuit',
            subheading: 'Décris ici ce que les participants vont apprendre pendant l\'atelier.',
            imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'countdown', content: { headline: 'L\'atelier commence dans', targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } },
          { type: 'form', content: { headline: 'Réserve ta place', buttonText: 'Je m\'inscris', successMessage: 'Inscription confirmée ! Le lien de connexion arrive par email.' } },
        ],
      },
      {
        name: 'Confirmation',
        slug: 'confirmation',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Ta place est réservée !', body: 'Ajoute la date à ton agenda, on t\'envoie le lien de connexion par email avant le direct.' } },
          { type: 'countdown', content: { headline: 'Compte à rebours avant le direct', targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } },
        ],
      },
    ],
  },
  {
    key: 'webinaire-replay',
    name: 'Webinaire replay',
    description: "Donne accès à l'enregistrement d'un webinaire passé pour capter nouveaux emails.",
    category: 'Webinaire',
    categoryKey: 'webinaire',
    icon: Video,
    tier: 'createur',
    steps: [
      {
        name: 'Accès replay',
        slug: 'replay',
        step_type: 'opt-in',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Replay disponible', heading: 'Regarde le replay de l\'atelier',
            subheading: 'Indique ton email pour débloquer l\'enregistrement complet dès maintenant.',
            imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'features', content: { heading: 'Ce que tu vas voir', items: [
            { title: 'La méthode complète', description: 'Le contenu intégral de l\'atelier en direct.' },
            { title: 'Questions/réponses', description: 'Les réponses aux questions posées en direct.' },
            { title: 'Offre bonus', description: 'Une offre spéciale réservée aux spectateurs du replay.' },
          ] } },
          { type: 'form', content: { headline: 'Débloquer le replay', buttonText: 'Je regarde le replay', successMessage: 'Le lien du replay vient de t\'être envoyé par email.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'C\'est envoyé !', body: 'Le lien vers le replay est dans ta boîte mail, bon visionnage.' } },
        ],
      },
    ],
  },

  // ============ Coaching ============
  {
    key: 'coaching',
    name: 'Réserver un appel',
    description: "Remplis ton agenda d'appels découverte qualifiés.",
    category: 'Coaching',
    categoryKey: 'coaching',
    icon: CalendarCheck,
    tier: 'createur',
    steps: [
      {
        name: 'Réserver un appel',
        slug: 'reserver',
        step_type: 'booking',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Séance découverte', heading: 'Réserve ton appel gratuit',
            subheading: "30 minutes pour faire le point sur ta situation et voir comment je peux t'aider.",
            imageUrl: 'https://images.unsplash.com/photo-1543269865-4438870a8bd0?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'features', content: { heading: 'Ce que tu vas obtenir', items: [
            { title: 'Un diagnostic clair', description: 'On identifie ensemble ce qui bloque.' },
            { title: 'Un plan d\'action', description: 'Des étapes concrètes à appliquer dès la sortie de l\'appel.' },
            { title: 'Zéro pression', description: 'Aucune obligation d\'achat, juste de la valeur.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont réservé leur appel', items: [
            { name: 'Karim B.', role: 'Client accompagné', quote: 'L\'appel à lui seul valait le détour.' },
          ] } },
          { type: 'form', content: { headline: 'Choisis un créneau', buttonText: 'Réserver mon appel', successMessage: 'C\'est noté ! Tu vas recevoir un email pour confirmer l\'horaire.' } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Combien de temps dure l\'appel ?', answer: 'Environ 30 minutes.' },
            { question: 'Est-ce vraiment gratuit ?', answer: 'Oui, sans engagement.' },
          ] } },
        ],
      },
      {
        name: 'Confirmation',
        slug: 'confirmation',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Rendez-vous confirmé', body: 'Tu vas recevoir un lien de connexion par email avant l\'appel.' } },
        ],
      },
    ],
  },
  {
    key: 'candidature',
    name: 'Candidature / Postuler',
    description: "Qualifie tes prospects avant de les accepter dans ton programme d'accompagnement.",
    category: 'Coaching',
    categoryKey: 'coaching',
    icon: CalendarCheck,
    tier: 'createur',
    steps: [
      {
        name: 'Postuler',
        slug: 'postuler',
        step_type: 'booking',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Places limitées', heading: 'Postule pour rejoindre l\'accompagnement',
            subheading: 'Décris ici le programme et le profil de client que tu recherches.',
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'text', content: { heading: 'Comment ça se passe', body: 'Explique ici les étapes : candidature, appel de sélection, puis démarrage de l\'accompagnement.' } },
          { type: 'form', content: { headline: 'Ta candidature', buttonText: 'Je postule', successMessage: 'Candidature reçue ! Je reviens vers toi sous 48h.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Candidature bien reçue !', body: 'Je l\'étudie avec attention et je reviens vers toi très vite par email.' } },
        ],
      },
    ],
  },

  // ============ E-commerce ============
  {
    key: 'ecommerce',
    name: 'Produit unique',
    description: "Vends un produit physique avec fiche produit et commande.",
    category: 'E-commerce',
    categoryKey: 'ecommerce',
    icon: ShoppingBag,
    tier: 'createur',
    steps: [
      {
        name: 'Produit',
        slug: 'produit',
        step_type: 'sales',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Livraison rapide', heading: 'Le produit qu\'il te faut',
            subheading: 'Décris ici ton produit : à qui il s\'adresse et pourquoi il change la donne.',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je commande', externalUrl: '',
          } },
          { type: 'image', content: { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop', caption: 'Vue en situation' } },
          { type: 'features', content: { heading: 'Pourquoi le choisir', items: [
            { title: 'Qualité garantie', description: 'Fabriqué avec des matériaux durables.' },
            { title: 'Livraison rapide', description: 'Expédié sous 48h.' },
            { title: 'Satisfait ou remboursé', description: '14 jours pour changer d\'avis.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils l\'ont reçu', items: [
            { name: 'Moussa T.', role: 'Client', quote: 'Livré rapidement, exactement comme décrit.' },
          ] } },
          { type: 'pricing', content: { heading: 'Choisis ta formule', plans: [
            { name: 'À l\'unité', price: '15', period: '€', features: ['1 article', 'Livraison incluse'], highlight: false },
            { name: 'Lot de 3', price: '39', period: '€', features: ['3 articles', 'Livraison incluse', 'Économie de 15%'], highlight: true },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Quels sont les délais de livraison ?', answer: '48 à 72h ouvrées.' },
            { question: 'Puis-je être remboursé ?', answer: 'Oui, sous 14 jours.' },
          ] } },
          { type: 'cta', content: { heading: 'Prêt à passer commande ?', buttonText: 'Je commande', externalUrl: '' } },
        ],
      },
      {
        name: 'Commande',
        slug: 'commande',
        step_type: 'order',
        blocks: [
          { type: 'text', content: { heading: 'Finalise ta commande', body: 'Renseigne tes coordonnées de livraison ci-dessous.' } },
          { type: 'form', content: { headline: 'Tes informations', buttonText: 'Valider ma commande', successMessage: 'Commande confirmée ! Un email de suivi t\'a été envoyé.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Merci pour ta commande !', body: 'Ton colis est en préparation, tu recevras un numéro de suivi par email.' } },
        ],
      },
    ],
  },
  {
    key: 'bundle-promo',
    name: 'Bundle promo',
    description: "Vends plusieurs produits regroupés en pack avec un prix avantageux.",
    category: 'E-commerce',
    categoryKey: 'ecommerce',
    icon: ShoppingBag,
    tier: 'createur',
    steps: [
      {
        name: 'Bundle',
        slug: 'bundle',
        step_type: 'sales',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Pack exclusif', heading: 'Le pack complet, en un seul geste',
            subheading: 'Décris ici les produits inclus dans ce bundle et l\'économie réalisée.',
            imageUrl: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je découvre le pack', externalUrl: '',
          } },
          { type: 'features', content: { heading: 'Ce que contient le pack', items: [
            { title: 'Produit 1', description: 'Décris ici le premier article du bundle.' },
            { title: 'Produit 2', description: 'Décris ici le deuxième article du bundle.' },
            { title: 'Produit 3', description: 'Décris ici le troisième article du bundle.' },
          ] } },
          { type: 'pricing', content: { heading: 'Ton économie', plans: [
            { name: 'Pack complet', price: '49', period: '€', features: ['3 produits inclus', 'Livraison groupée', 'Économie de 25%'], highlight: true },
          ] } },
          { type: 'cta', content: { heading: 'Le pack ne durera pas', buttonText: 'Je commande le pack', externalUrl: '' } },
        ],
      },
      {
        name: 'Commande',
        slug: 'commande',
        step_type: 'order',
        blocks: [
          { type: 'form', content: { headline: 'Tes informations de livraison', buttonText: 'Valider ma commande', successMessage: 'Commande confirmée ! Un email de suivi t\'a été envoyé.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Merci pour ta commande !', body: 'Ton pack est en préparation, tu recevras un numéro de suivi par email.' } },
        ],
      },
    ],
  },

  // ============ Évènement ============
  {
    key: 'evenement',
    name: 'Évènement grand public',
    description: "Fais s'inscrire des participants à un évènement.",
    category: 'Évènement',
    categoryKey: 'evenement',
    icon: PartyPopper,
    tier: 'createur',
    steps: [
      {
        name: 'Inscription',
        slug: 'inscription',
        step_type: 'opt-in',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Évènement', heading: 'Rejoins-nous pour cet évènement unique',
            subheading: 'Décris ici le lieu, la date et ce que les participants vont vivre.',
            imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'countdown', content: { headline: 'L\'évènement commence dans', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } },
          { type: 'features', content: { heading: 'Au programme', items: [
            { title: 'Intervenants inspirants', description: 'Des experts reconnus dans leur domaine.' },
            { title: 'Networking', description: 'Rencontre d\'autres participants motivés.' },
            { title: 'Ateliers pratiques', description: 'Des sessions pour passer à l\'action.' },
          ] } },
          { type: 'form', content: { headline: 'Réserve ta place', buttonText: 'Je m\'inscris', successMessage: 'Inscription confirmée ! Les détails pratiques arrivent par email.' } },
        ],
      },
      {
        name: 'Confirmation',
        slug: 'confirmation',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'À très vite !', body: 'Tu recevras un rappel avec toutes les informations pratiques avant le jour J.' } },
        ],
      },
    ],
  },
  {
    key: 'conference-payante',
    name: 'Conférence à billet payant',
    description: "Vends des places pour une conférence ou un évènement professionnel.",
    category: 'Évènement',
    categoryKey: 'evenement',
    icon: PartyPopper,
    tier: 'createur',
    steps: [
      {
        name: 'Billetterie',
        slug: 'billetterie',
        step_type: 'sales',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Places limitées', heading: 'Réserve ta place pour la conférence',
            subheading: 'Décris ici le thème de la conférence et pourquoi elle est incontournable.',
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'countdown', content: { headline: 'La conférence a lieu dans', targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } },
          { type: 'pricing', content: { heading: 'Choisis ton billet', plans: [
            { name: 'Billet standard', price: '35', period: '€', features: ['Accès à la journée', 'Support de présentation'], highlight: false },
            { name: 'Billet VIP', price: '89', period: '€', features: ['Accès à la journée', 'Place réservée au premier rang', 'Networking avec les intervenants'], highlight: true },
          ] } },
          { type: 'form', content: { headline: 'Réserve ton billet', buttonText: 'Je réserve ma place', successMessage: 'Réservation confirmée ! Ton billet arrive par email.' } },
        ],
      },
      {
        name: 'Confirmation',
        slug: 'confirmation',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Ta place est réservée !', body: 'Ton billet et les informations pratiques arrivent dans ta boîte mail.' } },
        ],
      },
    ],
  },

  // ============ Quiz ============
  {
    key: 'quiz',
    name: 'Quiz profil',
    description: "Engage tes visiteurs avec un quiz avant de capturer leur email.",
    category: 'Quiz',
    categoryKey: 'quiz',
    icon: ListChecks,
    tier: 'createur',
    steps: [
      {
        name: 'Quiz',
        slug: 'quiz',
        step_type: 'quiz',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Quiz', heading: 'Découvre ton profil en 1 minute',
            subheading: 'Réponds à quelques questions pour recevoir une recommandation personnalisée.',
            imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'quiz', content: {
            heading: 'C\'est parti',
            questions: [
              { question: 'Quel est ton principal objectif ?', options: ['Gagner du temps', 'Augmenter mes ventes', 'Me faire connaître'] },
              { question: 'Combien de temps peux-tu y consacrer par semaine ?', options: ['Moins d\'1h', '1 à 5h', 'Plus de 5h'] },
              { question: 'Quel est ton niveau actuel ?', options: ['Débutant complet', 'J\'ai déjà des bases', 'Je suis confirmé'] },
            ],
            resultButtonText: 'Voir mon résultat',
          } },
          { type: 'form', content: { headline: 'Reçois ton résultat personnalisé par email', buttonText: 'Je récupère mon résultat', successMessage: 'Résultat envoyé ! Vérifie ta boîte mail.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Merci d\'avoir répondu !', body: 'Ton résultat personnalisé arrive dans ta boîte mail.' } },
        ],
      },
    ],
  },
  {
    key: 'quiz-produit',
    name: 'Quiz recommandation produit',
    description: "Aide tes visiteurs à trouver le produit ou l'offre fait pour eux.",
    category: 'Quiz',
    categoryKey: 'quiz',
    icon: ListChecks,
    tier: 'createur',
    steps: [
      {
        name: 'Quiz produit',
        slug: 'quiz-produit',
        step_type: 'quiz',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Trouve ton match', heading: 'Quel produit est fait pour toi ?',
            subheading: 'Réponds à ces 3 questions pour recevoir une recommandation sur mesure.',
            imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'quiz', content: {
            heading: 'Réponds en 30 secondes',
            questions: [
              { question: 'Quel est ton budget ?', options: ['Moins de 30€', '30 à 80€', 'Plus de 80€'] },
              { question: 'Pour quel usage ?', options: ['Usage personnel', 'Cadeau', 'Usage professionnel'] },
              { question: 'Qu\'est-ce qui compte le plus pour toi ?', options: ['Le prix', 'La qualité', 'La rapidité de livraison'] },
            ],
            resultButtonText: 'Voir ma recommandation',
          } },
          { type: 'form', content: { headline: 'Reçois ta recommandation personnalisée', buttonText: 'Je découvre mon produit', successMessage: 'Ta recommandation arrive par email !' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Merci d\'avoir joué !', body: 'Ta recommandation personnalisée arrive dans ta boîte mail.' } },
        ],
      },
    ],
  },

  // ============ Communauté ============
  {
    key: 'communaute',
    name: 'Adhésion mensuelle',
    description: "Fais grandir une communauté payante autour de ta passion.",
    category: 'Communauté',
    categoryKey: 'communaute',
    icon: Users,
    tier: 'createur',
    steps: [
      {
        name: 'Rejoindre',
        slug: 'rejoindre',
        step_type: 'sales',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Communauté privée', heading: 'Rejoins une communauté qui te ressemble',
            subheading: 'Décris ici l\'ambiance et la valeur de ta communauté.',
            imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je rejoins la communauté', externalUrl: '',
          } },
          { type: 'features', content: { heading: 'Ce que tu trouveras à l\'intérieur', items: [
            { title: 'Entraide quotidienne', description: 'Une communauté active pour avancer ensemble.' },
            { title: 'Contenus exclusifs', description: 'Des ressources réservées aux membres.' },
            { title: 'Appels mensuels', description: 'Des sessions en direct avec toi.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils en font partie', items: [
            { name: 'Léa M.', role: 'Membre', quote: 'La meilleure décision pour rester motivée.' },
          ] } },
          { type: 'pricing', content: { heading: 'Rejoins-nous', plans: [
            { name: 'Adhésion mensuelle', price: '9', period: '€ / mois', features: ['Accès complet à la communauté', 'Contenus exclusifs', 'Appels mensuels'], highlight: true },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Puis-je annuler à tout moment ?', answer: 'Oui, sans engagement.' },
          ] } },
        ],
      },
      {
        name: 'Bienvenue',
        slug: 'bienvenue',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Bienvenue parmi nous !', body: 'Tu vas recevoir un email avec le lien d\'accès à la communauté.' } },
        ],
      },
    ],
  },
  {
    key: 'programme-accompagnement',
    name: 'Programme d\'accompagnement',
    description: "Vends un programme premium avec suivi, sur plusieurs semaines ou mois.",
    category: 'Communauté',
    categoryKey: 'communaute',
    icon: Users,
    tier: 'createur',
    steps: [
      {
        name: 'Le programme',
        slug: 'programme',
        step_type: 'sales',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Programme premium', heading: 'Un accompagnement complet pour aller plus loin',
            subheading: 'Décris ici la durée du programme et la transformation obtenue à la fin.',
            imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'features', content: { heading: 'Ce qui est inclus', items: [
            { title: 'Suivi personnalisé', description: 'Un accompagnement individuel tout au long du programme.' },
            { title: 'Ressources complètes', description: 'Modules, supports et outils fournis.' },
            { title: 'Groupe privé', description: 'Un espace d\'entraide avec les autres participants.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont suivi le programme', items: [
            { name: 'Awa D.', role: 'Ancienne participante', quote: 'Le meilleur investissement que j\'ai fait pour mon activité.' },
          ] } },
          { type: 'pricing', content: { heading: 'Rejoindre le programme', plans: [
            { name: 'Accès complet', price: '297', period: '€', features: ['Suivi sur 8 semaines', 'Appels de groupe', 'Accès à vie aux ressources'], highlight: true },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Combien de temps dure le programme ?', answer: '8 semaines, avec un accès aux ressources à vie.' },
            { question: 'Y a-t-il un accompagnement individuel ?', answer: 'Oui, en plus des sessions de groupe.' },
          ] } },
          { type: 'cta', content: { heading: 'Prêt à te lancer ?', buttonText: 'Je rejoins le programme', externalUrl: '' } },
        ],
      },
      {
        name: 'Inscription',
        slug: 'inscription',
        step_type: 'order',
        blocks: [
          { type: 'form', content: { headline: 'Finalise ton inscription', buttonText: 'Je m\'inscris', successMessage: 'Inscription reçue ! Tu vas recevoir un email avec les prochaines étapes.' } },
        ],
      },
      {
        name: 'Bienvenue',
        slug: 'bienvenue',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Bienvenue dans le programme !', body: 'Tu vas recevoir un email avec toutes les informations pour démarrer.' } },
        ],
      },
    ],
  },

  // ============ Marque personnelle ============
  {
    key: 'marque-perso',
    name: 'Page bio complète',
    description: "Une page bio simple pour te présenter et centraliser tes liens.",
    category: 'Marque personnelle',
    categoryKey: 'marque-perso',
    icon: UserCircle,
    tier: 'starter',
    steps: [
      {
        name: 'Accueil',
        slug: 'accueil',
        step_type: 'custom',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Bonjour, moi c\'est', heading: 'Ton nom ici',
            subheading: 'Une phrase qui résume qui tu es et ce que tu proposes.',
            imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Me contacter', externalUrl: '',
          } },
          { type: 'text', content: { heading: 'À propos', body: 'Raconte ton histoire, ton parcours et ce qui te rend unique.' } },
          { type: 'form', content: { headline: 'Restons en contact', buttonText: 'Envoyer', successMessage: 'Merci, je te réponds rapidement !' } },
        ],
      },
    ],
  },
  {
    key: 'page-liens',
    name: 'Page de liens',
    description: "Un lien-en-bio minimaliste : ta photo, ta bio, et tous tes liens importants.",
    category: 'Marque personnelle',
    categoryKey: 'marque-perso',
    icon: UserCircle,
    tier: 'starter',
    steps: [
      {
        name: 'Liens',
        slug: 'liens',
        step_type: 'custom',
        blocks: [
          { type: 'hero', content: {
            eyebrow: '', heading: 'Ton nom ici',
            subheading: 'Une courte phrase de présentation.',
            imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'cta', content: { heading: '', buttonText: 'Mon site web', externalUrl: '' } },
          { type: 'cta', content: { heading: '', buttonText: 'Mon Instagram', externalUrl: '' } },
          { type: 'cta', content: { heading: '', buttonText: 'Ma boutique', externalUrl: '' } },
        ],
      },
    ],
  },

  // ============ Personnalisé ============
  {
    key: 'vierge',
    name: 'Tunnel vierge',
    description: 'Pars d\'une page blanche et construis ton tunnel bloc par bloc.',
    category: 'Personnalisé',
    categoryKey: 'personnalise',
    icon: FileText,
    tier: 'starter',
    steps: [
      { name: 'Page 1', slug: 'page-1', step_type: 'custom', blocks: [] },
    ],
  },
];

export function getTemplate(key) {
  return FUNNEL_TEMPLATES.find((t) => t.key === key) || FUNNEL_TEMPLATES[FUNNEL_TEMPLATES.length - 1];
}

export function getTemplatesByCategory(categoryKey) {
  return FUNNEL_TEMPLATES.filter((t) => t.categoryKey === categoryKey);
}
