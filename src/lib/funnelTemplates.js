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

  {
    key: 'serie-videos-gratuites',
    name: 'Série de vidéos gratuites',
    description: "Capture des emails en échange d'une série de vidéos gratuites, avec preuve sociale renforcée.",
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
            eyebrow: 'Série gratuite', heading: 'Découvre les secrets pour progresser plus facilement',
            subheading: 'Décris ici ce que cette série de vidéos va apporter concrètement.',
            imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Accéder à la série de vidéos', externalUrl: '',
          } },
          { type: 'process', content: { heading: 'Vous êtes...', layout: 'grid', items: [
            { title: 'Indépendant·e', description: 'Tu gères seul·e ton activité au quotidien.' },
            { title: 'Coach ou formateur·rice', description: 'Tu accompagnes déjà d\'autres personnes.' },
            { title: 'En reconversion', description: 'Tu construis une nouvelle activité.' },
          ] } },
          { type: 'features', content: { heading: 'Ce que vous allez apprendre', items: [
            { title: 'Les clés pour bien démarrer', description: 'Les fondamentaux à connaître avant de te lancer.' },
            { title: 'Comment analyser ta situation', description: 'Identifier précisément ce qui bloque tes résultats.' },
            { title: 'L\'état d\'esprit à adopter', description: 'Ce qui différencie ceux qui réussissent des autres.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ce qu\'ils en disent', items: [
            { name: 'Prénom N.', role: 'Abonné·e', quote: 'Une série claire et directement applicable.' },
          ] } },
          { type: 'form', content: { headline: 'Accède à la série de vidéos offertes', buttonText: 'Je veux y accéder', successMessage: 'Vérifie ta boîte mail pour accéder à la première vidéo.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'C\'est envoyé !', body: 'La première vidéo de la série vient de t\'être envoyée par email.' } },
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
            layout: 'split', trustBadges: ['Paiement sécurisé', 'Accès immédiat'],
          } },
          { type: 'process', content: { heading: 'Tu te reconnais dans l\'une de ces situations ?', layout: 'circular', items: [
            { title: 'Premier blocage typique de ta cible', description: 'Formule-le avec ses propres mots.' },
            { title: 'Deuxième blocage', description: 'Un frein complémentaire du premier.' },
          ] } },
          { type: 'features', content: { heading: 'Ce que tu obtiens', layout: 'rows', items: [
            { title: 'Résultat concret', description: 'Le premier bénéfice clé de ton offre.', imageUrl: '' },
            { title: 'Gain de temps', description: 'Pourquoi c\'est plus simple avec toi.', imageUrl: '' },
          ] } },
          { type: 'countdown', content: { headline: 'Offre de lancement valable jusqu\'à', targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } },
          { type: 'bonus-stack', content: { heading: 'Et en plus, tu reçois...', items: [
            { title: 'Bonus n°1', description: 'Un bonus concret qui renforce la décision d\'achat.', imageUrl: '' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils l\'ont adopté', items: [
            { name: 'Fatou S.', role: 'Cliente', quote: 'Résultat visible dès la première semaine !' },
          ] } },
          { type: 'pricing', content: { heading: 'Choisis ton offre', plans: [
            { name: 'Offre unique', price: '29', period: '€', features: ['Accès complet', 'Support par email', 'Mises à jour incluses'], highlight: true },
          ] } },
          { type: 'team', content: { heading: 'Qui est derrière cette offre', items: [
            { name: 'Ton nom', role: 'Fondateur·rice', bio: 'Un ou deux résultats concrets ou une légitimité claire.' },
          ] } },
          { type: 'text', content: { heading: 'Garantie satisfait ou remboursé', body: 'Explique la garantie proposée pour lever le dernier frein à l\'achat.', styles: { section: { background: 'accent' } } } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Y a-t-il une garantie ?', answer: 'Oui, satisfait ou remboursé sous 14 jours.' },
            { question: 'Cette offre est-elle faite pour moi ?', answer: 'Réponds à l\'objection la plus fréquente de ta cible.' },
            { question: 'Que se passe-t-il après mon achat ?', answer: 'Décris les prochaines étapes pour rassurer.' },
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
            trustBadges: ['Paiement sécurisé', 'Accès immédiat'],
          } },
          { type: 'countdown', content: { headline: 'L\'offre se termine dans', targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } },
          { type: 'features', content: { heading: 'Ce que tu obtiens', items: [
            { title: 'Résultat concret', description: 'Le bénéfice clé de ton offre.' },
            { title: 'Accès immédiat', description: 'Aucune attente, tu commences tout de suite.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont déjà sauté le pas', items: [
            { name: 'Prénom N.', role: 'Client·e', quote: 'Un résultat concret à remplacer par un vrai témoignage.' },
          ] } },
          { type: 'pricing', content: { heading: 'Prix flash', plans: [
            { name: 'Offre flash', originalPrice: '39', price: '19', period: '€', badge: '-50%', features: ['Accès immédiat', 'Prix garanti pendant l\'offre', 'Sans engagement'], highlight: true },
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

  {
    key: 'guide-bonus',
    name: 'Guide numérique avec bonus',
    description: "Vends un guide ou ebook accompagné d'une pile de bonus et de deux formules au choix.",
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
            eyebrow: 'Guide numérique', heading: 'Le guide qui t\'aide à passer du problème à la solution',
            subheading: 'Décris ici la transformation précise que ton guide apporte à celles et ceux qui le lisent.',
            imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je découvre les offres', externalUrl: '',
          } },
          { type: 'features', content: { heading: 'Ce que ce guide va t\'apporter', items: [
            { title: 'Moins de confusion', description: 'Une méthode claire, sans jargon inutile.' },
            { title: 'Un équilibre retrouvé', description: 'Un résultat concret dans ton quotidien.' },
            { title: 'Une meilleure compréhension', description: 'Tu comprends enfin ce qui bloquait.' },
            { title: 'Une progression plus fluide', description: 'Des étapes simples à appliquer une par une.' },
          ] } },
          { type: 'features', content: { heading: 'Les transformations que tu peux attendre', layout: 'rows', items: [
            { title: 'Retrouver la sérénité', description: 'Aborde ton sujet avec plus de clarté et moins de stress.', imageUrl: '' },
            { title: 'Avancer avec confiance', description: 'Des repères concrets pour savoir quoi faire, et quand.', imageUrl: '' },
          ] } },
          { type: 'bonus-stack', content: { heading: 'Ces bonus exclusifs complètent ta lecture', items: [
            { title: 'Produit principal — Le guide complet', description: 'Le cœur de l\'offre : la méthode complète, expliquée pas à pas.' },
            { title: 'Bonus n°1', description: 'Une ressource complémentaire pour aller plus loin sur un point précis.' },
            { title: 'Bonus n°2', description: 'Une checklist ou un outil pratique prêt à l\'emploi.' },
            { title: 'Bonus n°3', description: 'Un module dédié à une situation spécifique fréquente.' },
            { title: 'Bonus n°4', description: 'Un guide complémentaire sur un sujet connexe.' },
            { title: 'Bonus n°5', description: 'Des conseils pratiques pour un cas particulier.' },
            { title: 'Bonus n°6', description: 'Un dernier bonus pour approfondir encore le sujet.' },
          ] } },
          { type: 'pricing', content: { heading: 'Choisis ta formule', layout: 'comparison', plans: [
            { name: 'Offre essentielle', originalPrice: '19 000 FCFA', price: '4 500 FCFA', period: '', highlight: false, paymentLinks: [] },
            { name: 'Offre complète', originalPrice: '29 000 FCFA', price: '5 900 FCFA', period: '', badge: 'Meilleure offre', highlight: true, paymentLinks: [] },
          ], comparisonRows: [
            { label: 'Guide principal', values: [true, true] },
            { label: 'Tous les bonus inclus', values: [false, true] },
            { label: 'Mises à jour futures offertes', values: [false, true] },
          ] } },
          { type: 'text', content: { heading: 'Une question avant de te décider ?', body: 'Rappelle ici brièvement pourquoi ce guide est différent des autres ressources déjà disponibles sur le sujet.', styles: { section: { background: 'accent' } } } },
          { type: 'faq', content: { heading: 'F.A.Q.', items: [
            { question: 'Le guide est-il livré au format physique ?', answer: 'Non, il s\'agit d\'un guide numérique téléchargeable immédiatement.' },
            { question: 'Comment recevoir mon guide et mes bonus ?', answer: 'Tout est envoyé par email juste après ton paiement.' },
            { question: 'Puis-je le lire sur mon téléphone ?', answer: 'Oui, le guide est lisible sur tous les supports.' },
            { question: 'Y a-t-il une garantie ?', answer: 'Précise ici ta politique de garantie ou de remboursement.' },
            { question: 'Quelle est la différence entre les deux offres ?', answer: 'L\'offre complète inclut tous les bonus, l\'offre essentielle seulement le guide principal.' },
            { question: 'Le paiement est-il sécurisé ?', answer: 'Oui, via un prestataire de paiement certifié.' },
            { question: 'Puis-je poser une question avant d\'acheter ?', answer: 'Précise ici comment te contacter.' },
          ] } },
          { type: 'cta', content: { heading: 'Prêt·e à commencer ta lecture ?', buttonText: 'Je découvre les offres', externalUrl: '' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Merci pour ton achat !', body: 'Ton guide et tes bonus arrivent dans ta boîte mail dans quelques instants.' } },
        ],
      },
    ],
  },
  {
    key: 'formation-payante',
    name: 'Formation payante',
    description: "Vends une formation en ligne complète, avec une série de questions qualifiantes pour capter l'attention.",
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
            eyebrow: 'Formation complète', heading: 'Atteins ton objectif grâce à une méthode complète et progressive',
            subheading: 'Décris ici ce que ta formation permet d\'atteindre, en une phrase claire.',
            imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Rejoindre la formation', externalUrl: '',
            layout: 'split', trustBadges: ['Accès immédiat et illimité', 'Programme complet'],
          } },
          { type: 'process', content: { heading: 'L\'une ou plusieurs de ces situations te correspondent-elles ?', layout: 'grid', items: [
            { title: 'Rêves-tu d\'atteindre cet objectif ?', description: 'Formule ici la situation la plus fréquente chez ta cible.' },
            { title: 'Cherches-tu la bonne méthode ?', description: 'Beaucoup essaient seul·e·s avant de se tourner vers un cadre clair.' },
            { title: 'Te demandes-tu par où commencer ?', description: 'Trop d\'informations contradictoires, pas assez de clarté.' },
            { title: 'Aspires-tu à plus de liberté ?', description: 'Le résultat final recherché derrière la formation.' },
            { title: 'Cherches-tu un accompagnement complet ?', description: 'Un cadre structuré plutôt que des conseils épars.' },
            { title: 'Souhaites-tu acquérir de vraies compétences ?', description: 'Des compétences réutilisables, pas juste de la théorie.' },
            { title: 'Aimerais-tu plus de temps pour toi ?', description: 'Le bénéfice indirect une fois l\'objectif atteint.' },
          ] } },
          { type: 'text', content: { heading: 'Tu as ce désir ardent', body: 'De passer enfin à l\'action, mais l\'incertitude, le manque de méthode et les idées reçues sont autant de freins qui t\'empêchent de faire le premier pas. Cette formation existe pour lever ces blocages, un par un.' } },
          { type: 'features', content: { heading: 'Ce que tu vas apprendre', layout: 'rows', items: [
            { title: 'Les fondamentaux', description: 'La base indispensable, expliquée simplement.', imageUrl: '' },
            { title: 'La méthode complète', description: 'Un déroulé pas à pas, du début jusqu\'au résultat.', imageUrl: '' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont suivi la formation', layout: 'carousel', items: [
            { name: 'Prénom N.', role: 'Élève', quote: 'Un résultat concret dès les premières semaines.' },
            { name: 'Prénom N.', role: 'Élève', quote: 'Une méthode enfin claire et applicable.' },
          ] } },
          { type: 'pricing', content: { heading: 'Rejoindre la formation', plans: [
            { name: 'Accès complet', price: '—', period: '', features: ['Programme complet', 'Accès immédiat et illimité', 'Flexibilité de paiement'], highlight: true },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Combien de temps ai-je accès à la formation ?', answer: 'Précise la durée réelle d\'accès.' },
            { question: 'Dois-je avoir de l\'expérience au préalable ?', answer: 'Précise le niveau de départ nécessaire.' },
            { question: 'Cette formation est-elle faite pour moi ?', answer: 'Réponds à l\'objection la plus fréquente de ta cible.' },
          ] } },
          { type: 'cta', content: { heading: 'Prêt·e à te lancer ?', buttonText: 'Rejoindre la formation', externalUrl: '' } },
        ],
      },
      {
        name: 'Commande',
        slug: 'commande',
        step_type: 'order',
        blocks: [
          { type: 'form', content: { headline: 'Finalise ton inscription', buttonText: 'Je m\'inscris', successMessage: 'Inscription reçue ! Tu vas recevoir un email de confirmation.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Bienvenue dans la formation !', body: 'Tu vas recevoir un email avec toutes les informations pour démarrer.' } },
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
            layout: 'split', trustBadges: ['Accès immédiat', '100% gratuit'],
          } },
          { type: 'process', content: { heading: 'Ce que tu vas apprendre', layout: 'grid', items: [
            { title: 'La méthode complète', description: 'Le contenu intégral de l\'atelier en direct.' },
            { title: 'Les erreurs à éviter', description: 'Ce qui bloque la plupart des gens.' },
            { title: 'Comment démarrer', description: 'La première action concrète à poser.' },
          ] } },
          { type: 'features', content: { heading: 'Ce que tu vas voir', layout: 'rows', items: [
            { title: 'La méthode en détail', description: 'Étape par étape, sans rien sauter.', imageUrl: '' },
            { title: 'Questions/réponses', description: 'Les réponses aux questions posées en direct.', imageUrl: '' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont regardé le replay', items: [
            { name: 'Prénom N.', role: 'Spectateur·rice', quote: 'Un résultat concret obtenu grâce à cette méthode.' },
          ] } },
          { type: 'bonus-stack', content: { heading: 'Offre bonus réservée aux spectateurs', items: [
            { title: 'Bonus exclusif', description: 'Une offre spéciale réservée aux spectateurs du replay.', imageUrl: '' },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Le replay est-il vraiment gratuit ?', answer: 'Oui, sans engagement.' },
            { question: 'Combien de temps dure le replay ?', answer: 'Précise la durée réelle de l\'enregistrement.' },
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

  {
    key: 'formation-video-etapes',
    name: 'Formation vidéo en plusieurs parties',
    description: "Débloque une série de vidéos les unes après les autres, puis présente ton offre à la fin.",
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
            eyebrow: 'Masterclass gratuite', heading: 'Comment obtenir ton premier résultat sans expérience, sans gros budget et sans y passer tes soirées',
            subheading: 'Décris ici la promesse précise de ta masterclass, en une phrase concrète.',
            imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je réserve ma place gratuite', externalUrl: '',
          } },
          { type: 'process', content: { heading: 'Tu te reconnais ?', layout: 'grid', items: [
            { title: 'Tu veux plus de liberté', description: 'Décide de tes horaires, où que tu sois.' },
            { title: 'Tu veux plus de temps pour toi', description: 'Retrouve du temps pour ce qui compte vraiment.' },
            { title: 'Tu veux améliorer ta situation', description: 'Une source de revenu supplémentaire, sans tout quitter.' },
          ] } },
          { type: 'features', content: { heading: 'Ce que tu vas découvrir dans cette masterclass', items: [
            { title: 'La meilleure opportunité du moment', description: 'Pourquoi elle fonctionne, même en partant de zéro.' },
            { title: 'La méthode étape par étape', description: 'Le déroulé exact à suivre, sans jargon compliqué.' },
            { title: 'Comment démarrer rapidement', description: 'La première action concrète à poser dès aujourd\'hui.' },
            { title: 'Un secteur en pleine croissance', description: 'Un marché porteur, avec de la place pour toi.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont déjà commencé', layout: 'carousel', items: [
            { name: 'Prénom N.', role: 'Participant·e', quote: 'Résultat concret dès la première semaine.' },
            { name: 'Prénom N.', role: 'Participant·e', quote: 'Une opportunité à ne pas laisser passer.' },
            { name: 'Prénom N.', role: 'Participant·e', quote: 'Enfin une méthode claire et accessible.' },
          ] } },
          { type: 'form', content: { headline: 'Réserve ta place (places limitées)', buttonText: 'Je m\'inscris gratuitement', successMessage: 'Inscription confirmée ! Vérifie ta boîte mail.' } },
        ],
      },
      {
        name: 'Vidéo 1',
        slug: 'video-1',
        step_type: 'video',
        blocks: [
          { type: 'video', content: { heading: 'Vidéo 1 — Le déclic', videoUrl: '', description: 'Raconte ton histoire : la situation de départ, puis la bascule vers la solution que tu proposes.' } },
          { type: 'video-nav', content: { targetSlugs: ['video-1', 'video-2', 'video-3'], labels: ['Vidéo 1', 'Vidéo 2', 'Vidéo 3'] } },
        ],
      },
      {
        name: 'Vidéo 2',
        slug: 'video-2',
        step_type: 'video',
        blocks: [
          { type: 'video', content: { heading: 'Vidéo 2 — La méthode', videoUrl: '', description: 'Explique la méthode : comment elle fonctionne, en quoi elle est différente de ce que ta cible connaît déjà.' } },
          { type: 'video-nav', content: { targetSlugs: ['video-1', 'video-2', 'video-3'], labels: ['Vidéo 1', 'Vidéo 2', 'Vidéo 3'] } },
        ],
      },
      {
        name: 'Vidéo 3',
        slug: 'video-3',
        step_type: 'video',
        blocks: [
          { type: 'video', content: { heading: 'Vidéo 3 — Les résultats', videoUrl: '', description: 'Montre des résultats concrets et des témoignages de personnes ayant appliqué la méthode.' } },
          { type: 'video-nav', content: { targetSlugs: ['video-1', 'video-2', 'video-3'], labels: ['Vidéo 1', 'Vidéo 2', 'Vidéo 3'] } },
          { type: 'testimonials', content: { heading: 'Leurs résultats', items: [
            { name: 'Prénom N.', role: 'Élève accompagné·e', quote: 'Un résultat mesurable à remplacer par un vrai témoignage.' },
          ] } },
        ],
      },
      {
        name: 'Bon de commande',
        slug: 'bon-de-commande',
        step_type: 'order',
        blocks: [
          { type: 'text', content: { heading: 'Voici l\'offre complète', body: 'Présente ici en détail ce que contient ton offre, en lien avec ce que tu viens de montrer dans les vidéos.' } },
          { type: 'process', content: { heading: 'Ce que tu obtiens', layout: 'grid', items: [
            { title: 'Accès complet à la formation', description: 'Tous les modules, immédiatement disponibles.' },
            { title: 'Accompagnement personnalisé', description: 'Un suivi pour répondre à tes questions.' },
            { title: 'Accès à la communauté privée', description: 'Échange avec les autres membres.' },
          ] } },
          { type: 'bonus-stack', content: { heading: 'Et en plus, tu reçois...', items: [
            { title: 'Bonus n°1', description: 'Un bonus concret qui accélère tes premiers résultats.' },
            { title: 'Bonus n°2', description: 'Un second bonus, différent du premier.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont déjà rejoint le programme', items: [
            { name: 'Prénom N.', role: 'Membre du programme', quote: 'Témoignage à remplacer par un vrai retour client.' },
          ] } },
          { type: 'pricing', content: { heading: 'Choisis ton accès', plans: [
            { name: 'Offre unique', price: '—', period: '', features: ['Accès complet au programme', 'Bonus de lancement', 'Support inclus'], highlight: true },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Y a-t-il une garantie ?', answer: 'Oui, satisfait ou remboursé — précise le délai réel.' },
            { question: 'Combien de temps ai-je accès au contenu ?', answer: 'Précise la durée réelle d\'accès.' },
            { question: 'Dois-je avoir de l\'expérience ?', answer: 'Précise le niveau de départ nécessaire.' },
          ] } },
          { type: 'form', content: { headline: 'Finalise ta commande', buttonText: 'Je commande maintenant', successMessage: 'Commande reçue ! Tu vas recevoir un email de confirmation.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci-achat',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Bienvenue dans le programme !', body: 'Confirmation d\'achat et prochaine étape : comment accéder au contenu et démarrer.' } },
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
            layout: 'split', trustBadges: ['Sans engagement', '30 minutes'],
          } },
          { type: 'process', content: { heading: 'Tu te reconnais dans l\'une de ces situations ?', layout: 'circular', items: [
            { title: 'Premier blocage typique de ta cible', description: 'Formule-le avec ses propres mots.' },
            { title: 'Deuxième blocage', description: 'Un frein complémentaire du premier.' },
          ] } },
          { type: 'features', content: { heading: 'Ce que tu vas obtenir', layout: 'rows', items: [
            { title: 'Un diagnostic clair', description: 'On identifie ensemble ce qui bloque.', imageUrl: '' },
            { title: 'Un plan d\'action', description: 'Des étapes concrètes à appliquer dès la sortie de l\'appel.', imageUrl: '' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont réservé leur appel', items: [
            { name: 'Karim B.', role: 'Client accompagné', quote: 'L\'appel à lui seul valait le détour.' },
          ] } },
          { type: 'team', content: { heading: 'Qui je suis', items: [
            { name: 'Ton nom', role: 'Coach', bio: 'Un ou deux résultats concrets ou une légitimité claire.' },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Combien de temps dure l\'appel ?', answer: 'Environ 30 minutes.' },
            { question: 'Est-ce vraiment gratuit ?', answer: 'Oui, sans engagement.' },
            { question: 'Cet appel est-il fait pour moi ?', answer: 'Réponds à l\'objection la plus fréquente de ta cible.' },
          ] } },
          { type: 'form', content: { headline: 'Choisis un créneau', buttonText: 'Réserver mon appel', successMessage: 'C\'est noté ! Tu vas recevoir un email pour confirmer l\'horaire.' } },
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

  {
    key: 'masterclass-equipe',
    name: 'Masterclass avec équipe d\'experts',
    description: "Capte des leads grâce à une ressource gratuite, en t'appuyant sur la preuve sociale de ton équipe.",
    category: 'Coaching',
    categoryKey: 'coaching',
    icon: CalendarCheck,
    tier: 'createur',
    steps: [
      {
        name: 'Inscription',
        slug: 'inscription',
        step_type: 'opt-in',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Ressource gratuite', heading: 'Pour progresser plus facilement et obtenir des résultats',
            subheading: 'Décris ici la promesse précise de ta ressource gratuite (vidéos, guide, série d\'emails...).',
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je veux y accéder', externalUrl: '',
          } },
          { type: 'process', content: { heading: 'Tu te reconnais dans l\'une de ces situations ?', layout: 'grid', items: [
            { title: 'Tu manques de clarté', description: 'Difficile de structurer tes journées et tes priorités.' },
            { title: 'Tu as du mal à motiver ton entourage', description: 'Trouver les bons mots pour embarquer les autres.' },
            { title: 'Ton mindset freine tes résultats', description: 'Les pensées limitantes reviennent sans cesse.' },
            { title: 'Tu manques de ressources internes', description: 'Le sentiment de ne pas avoir tout ce qu\'il faut.' },
            { title: 'Tu vises la liberté financière', description: 'Sans savoir par où commencer concrètement.' },
            { title: 'Tu veux structurer ton activité', description: 'Passer d\'une activité informelle à un vrai cadre.' },
          ] } },
          { type: 'text', content: { heading: 'Nous comprenons tes défis', body: 'C\'est pour cela que nous avons créé cette ressource : pour t\'aider à passer à l\'action avec un cadre clair, plutôt que de rester seul·e face à ces blocages.' } },
          { type: 'features', content: { heading: 'Ce que tu vas apprendre', layout: 'rows', items: [
            { title: 'Les clés pour avancer', description: 'Les 3 à 5 principes fondamentaux à connaître pour progresser.', imageUrl: '' },
            { title: 'Comment adopter le bon mindset', description: 'Ce qui distingue les personnes qui avancent de celles qui restent bloquées.', imageUrl: '' },
          ] } },
          { type: 'features', content: { heading: 'Les avantages concrets que tu en tireras', items: [
            { title: 'Un état d\'esprit positif', description: 'Gagné en confiance sur la durée.' },
            { title: 'Une clarté totale', description: 'Une vision et des priorités enfin nettes.' },
            { title: 'Une confiance renforcée', description: 'Tu reprends confiance en toi et en tes choix.' },
            { title: 'Moins d\'erreurs coûteuses', description: 'Tu évites les erreurs fréquemment commises au début.' },
          ] } },
          { type: 'stats', content: { items: [
            { value: '+50', label: 'Webinaires réalisés' },
            { value: '+2 300', label: 'Personnes accompagnées' },
            { value: '30', label: 'Jours pour progresser' },
          ] } },
          { type: 'team', content: { heading: 'Notre équipe d\'experts', items: [
            { name: 'Prénom Nom', role: 'Coach principal', bio: 'Conférencier professionnel, spécialiste de la prise de parole en public.' },
            { name: 'Prénom Nom', role: 'Spécialiste mindset', bio: 'Accompagne des dirigeants sur la posture et la confiance en soi.' },
            { name: 'Prénom Nom', role: 'Spécialiste leadership', bio: 'Plus de 200 formations données à des équipes et dirigeants.' },
            { name: 'Prénom Nom', role: 'Responsable contenu', bio: 'Réalise les vidéos et documentaires de l\'équipe.' },
          ] } },
          { type: 'form', content: { headline: 'Accède à la ressource gratuite', buttonText: 'Je veux y accéder', successMessage: 'Merci ! Vérifie ta boîte mail pour y accéder.' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'C\'est envoyé !', body: 'Vérifie ta boîte mail : le lien pour accéder à la ressource vient de t\'être envoyé.' } },
        ],
      },
    ],
  },
  {
    key: 'candidature-premium',
    name: 'Candidature haut de gamme',
    description: "Qualifie des prospects premium pour un accompagnement individuel, avec forte preuve sociale.",
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
            eyebrow: 'Accompagnement individuel', heading: 'Un accompagnement sur-mesure, réservé à un nombre limité de profils',
            subheading: 'Décris ici le résultat que tu promets et le profil de client idéal.',
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je dépose ma candidature', externalUrl: '',
            layout: 'split', trustBadges: ['Sur candidature uniquement', 'Places très limitées'],
          } },
          { type: 'process', content: { heading: 'Comment ça se passe', layout: 'grid', items: [
            { title: 'Tu déposes ta candidature', description: 'Un court formulaire pour mieux comprendre ta situation.' },
            { title: 'Un appel de sélection', description: 'On vérifie ensemble que l\'accompagnement est fait pour toi.' },
            { title: 'Démarrage de l\'accompagnement', description: 'Si c\'est un match, on démarre dès la semaine suivante.' },
          ] } },
          { type: 'stats', content: { items: [
            { value: '+80', label: 'Clients accompagnés' },
            { value: '92%', label: 'Taux de résultat atteint' },
            { value: '5 ans', label: 'D\'expérience' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont été accompagnés', layout: 'carousel', items: [
            { name: 'Prénom N.', role: 'Client accompagné', quote: 'Un accompagnement exigeant, et des résultats à la hauteur.' },
            { name: 'Prénom N.', role: 'Cliente accompagnée', quote: 'Le déclic dont j\'avais besoin, avec un vrai suivi.' },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Combien de temps dure l\'accompagnement ?', answer: 'Précise la durée réelle du programme.' },
            { question: 'Est-ce fait pour moi ?', answer: 'Réponds à l\'objection la plus fréquente de ta cible.' },
            { question: 'Que se passe-t-il si ma candidature n\'est pas retenue ?', answer: 'Précise les alternatives que tu proposes.' },
          ] } },
          { type: 'form', content: { headline: 'Ta candidature', buttonText: 'Je candidate', successMessage: 'Candidature reçue ! Je reviens vers toi sous 48h.' } },
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
            layout: 'split', trustBadges: ['Paiement sécurisé', 'Livraison rapide'],
          } },
          { type: 'image', content: { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop', caption: 'Vue en situation' } },
          { type: 'features', content: { heading: 'Pourquoi le choisir', layout: 'rows', items: [
            { title: 'Qualité garantie', description: 'Fabriqué avec des matériaux durables.', imageUrl: '' },
            { title: 'Livraison rapide', description: 'Expédié sous 48h.', imageUrl: '' },
          ] } },
          { type: 'process', content: { heading: 'Comment ça marche', layout: 'grid', items: [
            { title: 'Tu commandes', description: 'En quelques clics, paiement sécurisé.' },
            { title: 'On prépare ton colis', description: 'Expédié sous 48h.' },
            { title: 'Tu reçois ton produit', description: 'Livré directement chez toi.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils l\'ont reçu', layout: 'carousel', items: [
            { name: 'Moussa T.', role: 'Client', quote: 'Livré rapidement, exactement comme décrit.' },
            { name: 'Prénom N.', role: 'Client·e', quote: 'Un second témoignage, sur un bénéfice différent.' },
          ] } },
          { type: 'pricing', content: { heading: 'Choisis ta formule', layout: 'comparison', plans: [
            { name: 'À l\'unité', price: '15', period: '€', highlight: false },
            { name: 'Lot de 3', originalPrice: '45', price: '39', period: '€', badge: 'Économie', highlight: true },
          ], comparisonRows: [
            { label: 'Livraison incluse', values: [true, true] },
            { label: 'Économie de 15%', values: [false, true] },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Quels sont les délais de livraison ?', answer: '48 à 72h ouvrées.' },
            { question: 'Puis-je être remboursé ?', answer: 'Oui, sous 14 jours.' },
            { question: 'Le paiement est-il sécurisé ?', answer: 'Oui, via un prestataire de paiement certifié.' },
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

  {
    key: 'accompagnement-ecommerce',
    name: 'Accompagnement e-commerce',
    description: "Vends un programme d'accompagnement pour aider tes clients à lancer ou développer leur boutique en ligne.",
    category: 'E-commerce',
    categoryKey: 'ecommerce',
    icon: ShoppingBag,
    tier: 'createur',
    steps: [
      {
        name: 'Vente',
        slug: 'vente',
        step_type: 'sales',
        blocks: [
          { type: 'hero', content: {
            eyebrow: 'Programme d\'accompagnement', heading: 'Génère tes premiers résultats en e-commerce en 30 jours',
            subheading: 'Décris ici la promesse précise de ton accompagnement et le délai visé.',
            imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Rejoindre le programme', externalUrl: '',
          } },
          { type: 'features', content: { heading: 'Pour qui est fait ce programme ?', items: [
            { title: 'Débutant·e absolu·e', description: 'Tu ne sais pas par où commencer : ce programme te guide de A à Z.' },
            { title: 'Entrepreneur·e avec peu de résultats', description: 'Tu as déjà lancé ta boutique mais les ventes ne suivent pas.' },
            { title: 'Vendeur·se confirmé·e', description: 'Tu génères déjà des revenus et veux structurer ta croissance.' },
          ] } },
          { type: 'process', content: { heading: 'Voici tout ce que tu vas obtenir', layout: 'grid', items: [
            { title: 'Accès à la formation complète', description: 'Une méthode claire et pratique pour créer, développer et scaler ta boutique en ligne.' },
            { title: 'Accompagnement personnalisé', description: 'Des sessions pour répondre à tes questions et t\'aider à avancer.' },
            { title: 'Accès à une communauté privée', description: 'Échange avec d\'autres entrepreneurs et partage tes avancées.' },
          ] } },
          { type: 'bonus-stack', content: { heading: 'Et ce n\'est pas tout', items: [
            { title: 'Bonus n°1 — Réductions exclusives', description: 'Des réductions sur les outils et fournisseurs essentiels.' },
            { title: 'Bonus n°2 — Guide trafic', description: 'Le top des méthodes gratuites pour lancer ton trafic rapidement.' },
            { title: 'Bonus n°3 — Offre spéciale', description: 'Un accompagnement complémentaire offert aux premiers inscrits.' },
          ] } },
          { type: 'features', content: { heading: 'En choisissant ce programme', items: [
            { title: 'Accès à des résultats prouvés', description: 'Une méthode déjà validée par de nombreux entrepreneurs.' },
            { title: 'Un accompagnement dédié', description: 'Un suivi personnalisé, pas juste du contenu enregistré.' },
            { title: 'Une communauté motivée', description: 'Partage tes avancées et reste motivé·e sur la durée.' },
            { title: 'Une boutique scalable', description: 'Une base solide pour grandir bien au-delà des premiers résultats.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont rejoint le programme', layout: 'carousel', items: [
            { name: 'Prénom N.', role: 'Entrepreneur·e accompagné·e', quote: 'Premiers résultats concrets en quelques semaines.' },
            { name: 'Prénom N.', role: 'Entrepreneur·e accompagné·e', quote: 'Un accompagnement qui change vraiment la donne.' },
          ] } },
          { type: 'pricing', content: { heading: 'Profite d\'une offre exceptionnelle', plans: [
            { name: 'Accès complet', originalPrice: '', price: '29 000 FCFA', period: '', features: ['Accès complet à la formation', '1 mois d\'accompagnement', 'Accès à la communauté privée', 'Bonus exclusifs inclus'], highlight: true, paymentLinks: [] },
          ] } },
          { type: 'text', content: { heading: 'Prêt·e à passer à l\'action ?', body: 'Chaque jour que tu remets ta décision à plus tard est une occasion manquée de faire décoller ta boutique en ligne.', styles: { section: { background: 'accent' } } } },
          { type: 'cta', content: { heading: 'Rejoins le programme dès maintenant', buttonText: 'Rejoindre le programme', externalUrl: '' } },
        ],
      },
      {
        name: 'Merci',
        slug: 'merci',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Bienvenue dans le programme !', body: 'Tu vas recevoir un email avec toutes les informations pour démarrer.' } },
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

  {
    key: 'atelier-intervenants',
    name: 'Atelier premium avec intervenants',
    description: "Vends des places pour un atelier ou une formation en présentiel, en mettant en avant tes intervenants.",
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
            eyebrow: 'Places limitées', heading: 'Une journée pour transformer ta façon de travailler',
            subheading: 'Décris ici le thème de l\'atelier et le résultat attendu pour les participants.',
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je réserve ma place', externalUrl: '',
          } },
          { type: 'countdown', content: { headline: 'L\'atelier a lieu dans', targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } },
          { type: 'process', content: { heading: 'Au programme de la journée', layout: 'grid', items: [
            { title: 'Matinée : les fondamentaux', description: 'Les bases essentielles pour bien démarrer.' },
            { title: 'Après-midi : ateliers pratiques', description: 'Mise en application concrète en petits groupes.' },
            { title: 'Clôture : plan d\'action', description: 'Reparts avec un plan d\'action personnalisé.' },
          ] } },
          { type: 'team', content: { heading: 'Tes intervenants', items: [
            { name: 'Prénom Nom', role: 'Intervenant·e principal·e', bio: 'Expert·e reconnu·e du sujet, plusieurs années d\'expérience terrain.' },
            { name: 'Prénom Nom', role: 'Intervenant·e invité·e', bio: 'Apporte un regard complémentaire sur la thématique de la journée.' },
          ] } },
          { type: 'bonus-stack', content: { heading: 'En plus de la journée, tu repars avec...', items: [
            { title: 'Un support complet', description: 'L\'ensemble des supports présentés pendant l\'atelier.' },
            { title: 'Un accès à la communauté', description: 'Reste en contact avec les autres participants après l\'événement.' },
          ] } },
          { type: 'pricing', content: { heading: 'Choisis ton billet', plans: [
            { name: 'Billet standard', price: '35', period: '€', features: ['Accès à la journée', 'Support de présentation'], highlight: false },
            { name: 'Billet VIP', price: '89', period: '€', features: ['Accès à la journée', 'Place au premier rang', 'Networking avec les intervenants'], highlight: true },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Où a lieu l\'atelier ?', answer: 'Précise ici le lieu exact.' },
            { question: 'Le déjeuner est-il inclus ?', answer: 'Précise ce qui est inclus dans le billet.' },
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

  {
    key: 'quiz-offre-personnalisee',
    name: 'Quiz avec offre personnalisée',
    description: "Qualifie tes visiteurs avec un quiz, puis présente une offre adaptée au résultat obtenu.",
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
            eyebrow: 'Quiz personnalisé', heading: 'Découvre l\'offre faite pour toi en 1 minute',
            subheading: 'Réponds à quelques questions pour recevoir une recommandation sur mesure.',
            imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1600&auto=format&fit=crop',
            ctaText: '', externalUrl: '',
          } },
          { type: 'quiz', content: {
            heading: 'C\'est parti',
            questions: [
              { question: 'Quel est ton objectif principal ?', options: ['Gagner du temps', 'Augmenter mes résultats', 'Me faire accompagner'] },
              { question: 'Quel est ton niveau actuel ?', options: ['Débutant·e complet·e', 'J\'ai déjà des bases', 'Je suis confirmé·e'] },
              { question: 'Combien de temps peux-tu y consacrer ?', options: ['Moins d\'1h par semaine', '1 à 5h par semaine', 'Plus de 5h par semaine'] },
            ],
            resultButtonText: 'Voir mon offre personnalisée',
          } },
          { type: 'form', content: { headline: 'Reçois ton offre personnalisée par email', buttonText: 'Je récupère mon offre', successMessage: 'Résultat envoyé ! Vérifie ta boîte mail.' } },
        ],
      },
      {
        name: 'Ton offre',
        slug: 'offre',
        step_type: 'sales',
        blocks: [
          { type: 'text', content: { heading: 'Voici ce qui correspond à ton profil', body: 'En fonction de tes réponses, voici l\'offre la plus adaptée à ta situation.' } },
          { type: 'features', content: { heading: 'Ce que tu obtiens', items: [
            { title: 'Résultat concret', description: 'Le premier bénéfice clé de l\'offre.' },
            { title: 'Adapté à ton profil', description: 'Une approche pensée pour ton niveau et ton objectif.' },
            { title: 'Accompagnement inclus', description: 'Tu n\'es jamais seul·e face aux difficultés.' },
          ] } },
          { type: 'pricing', content: { heading: 'Ton offre personnalisée', plans: [
            { name: 'Offre recommandée', price: '—', period: '', features: ['Adaptée à ton profil', 'Accès immédiat', 'Support inclus'], highlight: true },
          ] } },
          { type: 'cta', content: { heading: 'Prêt·e à commencer ?', buttonText: 'Je commande', externalUrl: '' } },
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
            layout: 'split', trustBadges: ['Paiement sécurisé', 'Places limitées'],
          } },
          { type: 'process', content: { heading: 'Tu te reconnais dans l\'une de ces situations ?', layout: 'circular', items: [
            { title: 'Premier blocage typique de ta cible', description: 'Formule-le avec ses propres mots.' },
            { title: 'Deuxième blocage', description: 'Un frein complémentaire du premier.' },
          ] } },
          { type: 'features', content: { heading: 'Ce qui est inclus', layout: 'rows', items: [
            { title: 'Suivi personnalisé', description: 'Un accompagnement individuel tout au long du programme.', imageUrl: '' },
            { title: 'Ressources complètes', description: 'Modules, supports et outils fournis.', imageUrl: '' },
          ] } },
          { type: 'process', content: { heading: 'Comment ça marche', layout: 'grid', items: [
            { title: 'Tu t\'inscris', description: 'Une première étape rapide et sans friction.' },
            { title: 'Tu démarres le programme', description: 'Accès immédiat aux premiers modules.' },
            { title: 'Tu es accompagné·e', description: 'Suivi individuel jusqu\'au résultat.' },
          ] } },
          { type: 'bonus-stack', content: { heading: 'Et en plus, tu reçois...', items: [
            { title: 'Groupe privé', description: 'Un espace d\'entraide avec les autres participants.', imageUrl: '' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils ont suivi le programme', items: [
            { name: 'Awa D.', role: 'Ancienne participante', quote: 'Le meilleur investissement que j\'ai fait pour mon activité.' },
          ] } },
          { type: 'pricing', content: { heading: 'Rejoindre le programme', plans: [
            { name: 'Accès complet', price: '297', period: '€', features: ['Suivi sur 8 semaines', 'Appels de groupe', 'Accès à vie aux ressources'], highlight: true },
          ] } },
          { type: 'team', content: { heading: 'Qui t\'accompagne', items: [
            { name: 'Ton nom', role: 'Fondateur·rice', bio: 'Un ou deux résultats concrets ou une légitimité claire.' },
          ] } },
          { type: 'text', content: { heading: 'Garantie satisfait ou remboursé', body: 'Explique la garantie proposée pour lever le dernier frein à l\'inscription.', styles: { section: { background: 'accent' } } } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Combien de temps dure le programme ?', answer: '8 semaines, avec un accès aux ressources à vie.' },
            { question: 'Y a-t-il un accompagnement individuel ?', answer: 'Oui, en plus des sessions de groupe.' },
            { question: 'Ce programme est-il fait pour moi ?', answer: 'Réponds à l\'objection la plus fréquente de ta cible.' },
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

  {
    key: 'mastermind-premium',
    name: 'Mastermind premium',
    description: "Vends l'accès à un mastermind ou une communauté haut de gamme, avec preuve sociale forte.",
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
            eyebrow: 'Mastermind privé', heading: 'Entoure-toi de pairs qui te tirent vers le haut',
            subheading: 'Décris ici le profil des membres et la promesse principale du mastermind.',
            imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1600&auto=format&fit=crop',
            ctaText: 'Je candidate', externalUrl: '',
            layout: 'split', trustBadges: ['Places limitées', 'Sélection sur candidature'],
          } },
          { type: 'stats', content: { items: [
            { value: '+120', label: 'Membres actifs' },
            { value: '15', label: 'Rencontres par an' },
            { value: '4.9/5', label: 'Note moyenne' },
          ] } },
          { type: 'features', content: { heading: 'Ce que tu trouveras à l\'intérieur', layout: 'rows', items: [
            { title: 'Un cercle exigeant', description: 'Des membres triés sur le volet, au même niveau d\'ambition que toi.', imageUrl: '' },
            { title: 'Des rencontres régulières', description: 'En ligne et en présentiel, pour avancer ensemble.', imageUrl: '' },
          ] } },
          { type: 'bonus-stack', content: { heading: 'En rejoignant le mastermind, tu accèdes aussi à...', items: [
            { title: 'Un annuaire privé des membres', description: 'Retrouve facilement les bonnes personnes à contacter.' },
            { title: 'Des sessions avec des invités experts', description: 'Des intervenants extérieurs plusieurs fois par an.' },
          ] } },
          { type: 'team', content: { heading: 'Qui anime le mastermind', items: [
            { name: 'Prénom Nom', role: 'Fondateur·rice', bio: 'Anime la communauté depuis sa création et accompagne les membres au quotidien.' },
          ] } },
          { type: 'testimonials', content: { heading: 'Ils en font partie', items: [
            { name: 'Prénom N.', role: 'Membre', quote: 'Le cercle qui a le plus fait grandir mon activité.' },
          ] } },
          { type: 'pricing', content: { heading: 'Rejoindre le mastermind', plans: [
            { name: 'Adhésion annuelle', price: '—', period: '/ an', features: ['Accès à toutes les rencontres', 'Annuaire privé des membres', 'Sessions avec experts invités'], highlight: true },
          ] } },
          { type: 'faq', content: { heading: 'Questions fréquentes', items: [
            { question: 'Comment se déroule la sélection ?', answer: 'Décris ici le processus de candidature et de sélection.' },
            { question: 'Les rencontres sont-elles en ligne ou en présentiel ?', answer: 'Précise ici le format réel.' },
          ] } },
        ],
      },
      {
        name: 'Candidature',
        slug: 'candidature',
        step_type: 'booking',
        blocks: [
          { type: 'form', content: { headline: 'Dépose ta candidature', buttonText: 'Je candidate', successMessage: 'Candidature reçue ! Nous revenons vers toi sous quelques jours.' } },
        ],
      },
      {
        name: 'Bienvenue',
        slug: 'bienvenue',
        step_type: 'thankyou',
        blocks: [
          { type: 'text', content: { heading: 'Candidature bien reçue !', body: 'Nous l\'étudions avec attention et revenons vers toi très vite par email.' } },
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
