import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, LayoutDashboard, Wand2, Store, Layers, Palette, Wallet, Rocket,
  Mail, BarChart3, Search, ImageIcon, BookOpen, Webhook, Users, CreditCard, User, ArrowRight,
} from 'lucide-react';
import GradientBanner from '../../components/ui/GradientBanner';

import imgDashboard from '../../assets/guide/01-dashboard.png';
import imgNewFunnelCategories from '../../assets/guide/02-new-funnel-categories.png';
import imgNewFunnelTemplates from '../../assets/guide/03-new-funnel-templates.png';
import imgAiGenerator from '../../assets/guide/04-ai-generator.png';
import imgEditorMain from '../../assets/guide/05-editor-main.png';
import imgEditorBrandkit from '../../assets/guide/06-editor-brandkit.png';
import imgEditorAddBlock from '../../assets/guide/07-editor-add-block.png';
import imgPublishedLive from '../../assets/guide/08-published-live.png';
import imgLeads from '../../assets/guide/09-leads.png';
import imgAnalytics from '../../assets/guide/10-analytics.png';
import imgCommandPalette from '../../assets/guide/11-command-palette.png';
import imgImageStudio from '../../assets/guide/12-image-studio.png';
import imgEbooksList from '../../assets/guide/13-ebooks-list.png';
import imgEbooksNew from '../../assets/guide/13b-ebooks-new.png';
import imgIntegrations from '../../assets/guide/14-integrations.png';
import imgOrgTeam from '../../assets/guide/15-organisation-team.png';
import imgOrgPayments from '../../assets/guide/16-organisation-payments.png';
import imgBilling from '../../assets/guide/17-billing.png';
import imgAccount from '../../assets/guide/18-account.png';
import imgMarketplace from '../../assets/guide/19-templates-marketplace.png';
import imgGallery from '../../assets/guide/20-gallery.png';

const PARTS = [
  {
    id: 'creer',
    label: 'Créer ton premier tunnel',
    sections: [
      { id: 'tableau-de-bord', title: 'Le tableau de bord' },
      { id: 'ia', title: 'Créer avec l’IA' },
      { id: 'modeles', title: 'Créer depuis un modèle' },
      { id: 'marketplace', title: 'La marketplace de la communauté' },
      { id: 'galerie', title: 'La galerie d’inspiration' },
      { id: 'editeur', title: 'L’éditeur de blocs' },
      { id: 'brand-kit', title: 'Ton identité de marque' },
      { id: 'paiement', title: 'Configurer un moyen de paiement' },
      { id: 'publier', title: 'Publier et partager' },
    ],
  },
  {
    id: 'grandir',
    label: 'Faire grandir tes ventes',
    sections: [
      { id: 'leads', title: 'Suivre tes leads' },
      { id: 'analytique', title: 'Analyser tes performances' },
      { id: 'recherche', title: 'Recherche rapide et notifications' },
    ],
  },
  {
    id: 'ia-outils',
    label: 'Outils IA complémentaires',
    sections: [
      { id: 'visuels', title: 'Générer des visuels' },
      { id: 'ebooks', title: 'Créer un ebook' },
    ],
  },
  {
    id: 'connecter',
    label: 'Développer et connecter',
    sections: [
      { id: 'integrations', title: 'Intégrations (webhooks)' },
      { id: 'equipe', title: 'Travailler en équipe' },
    ],
  },
  {
    id: 'compte',
    label: 'Compte et facturation',
    sections: [
      { id: 'facturation', title: 'Abonnement et crédits IA' },
      { id: 'compte', title: 'Réglages du compte' },
    ],
  },
];

function TableOfContents() {
  return (
    <nav className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2">
        {PARTS.map((part, i) => (
          <div key={part.id} className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-wider text-surface/35 mb-2">
              {i + 1}. {part.label}
            </p>
            <ul className="space-y-1">
              {part.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block text-sm text-surface/55 hover:text-accent transition-colors py-0.5"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

function PartHeader({ index, label }) {
  return (
    <div className="flex items-center gap-3 mt-14 mb-6 first:mt-0">
      <span className="shrink-0 w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center font-mono text-sm font-bold">
        {index}
      </span>
      <h2 className="text-2xl font-sans font-bold text-surface">{label}</h2>
      <div className="flex-1 h-px bg-surface/10" />
    </div>
  );
}

// Le même cadre "navigateur" que la démo de génération IA de la landing
// (barre de points + URL simulée) — pour que les captures d'écran du guide
// restent reconnaissables comme "l'application elle-même", pas des images
// génériques.
function Screenshot({ src, alt }) {
  return (
    <div className="rounded-2xl border border-surface/10 bg-surface shadow-lg overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-background/10 bg-background/5">
        <span className="w-2.5 h-2.5 rounded-full bg-background/20" />
        <span className="w-2.5 h-2.5 rounded-full bg-background/20" />
        <span className="w-2.5 h-2.5 rounded-full bg-background/20" />
      </div>
      <img src={src} alt={alt} className="w-full h-auto block" loading="lazy" />
    </div>
  );
}

function GuideSection({ id, icon: Icon, title, children, image, imageAlt, linkTo, linkLabel }) {
  return (
    <section id={id} className="scroll-mt-8 mb-14">
      <div className="flex items-start gap-3 mb-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-xl font-sans font-bold text-surface pt-1.5">{title}</h3>
      </div>
      <div className="text-surface/70 leading-relaxed space-y-3 mb-5 [&_b]:text-surface [&_b]:font-semibold">
        {children}
      </div>
      {image && <Screenshot src={image} alt={imageAlt} />}
      {linkTo && (
        <Link
          to={linkTo}
          className="magnetic-btn inline-flex items-center gap-2 mt-5 bg-primary text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-surface transition-colors"
        >
          {linkLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </section>
  );
}

export default function GuidePage() {
  return (
    <div>
      <GradientBanner
        icon={Compass}
        title="Guide d'utilisation"
        description="Tout ce que fait TonTunnel, expliqué étape par étape avec des captures de la vraie application — et un lien direct vers chaque fonctionnalité."
      />

      <div className="flex gap-10">
        <TableOfContents />

        <div className="min-w-0 flex-1 max-w-3xl">
          <PartHeader index={1} label="Créer ton premier tunnel" />

          <GuideSection
            id="tableau-de-bord"
            icon={LayoutDashboard}
            title="Le tableau de bord"
            image={imgDashboard}
            imageAlt="Tableau de bord TonTunnel avec les statistiques et la checklist de démarrage"
            linkTo="/app"
            linkLabel="Ouvrir le tableau de bord"
          >
            <p>
              C'est ta page d'accueil dans l'application. Elle affiche quatre indicateurs clés — <b>revenu des 30 derniers jours</b>,
              <b> leads des 7 derniers jours</b>, <b>vues totales</b> et <b>tunnels actifs</b> — puis la liste de tous tes tunnels,
              avec recherche, filtres par statut/catégorie/période et tri.
            </p>
            <p>
              La carte <b>« Bien démarrer avec TonTunnel »</b> coche automatiquement trois étapes (créer un tunnel, ajouter un bloc,
              publier) au fur et à mesure que tu avances, puis disparaît une fois les trois terminées. Sur chaque tunnel, un menu
              <b> « ⋯ »</b> donne accès à l'aperçu, la page publique, la publication, la duplication et la suppression.
            </p>
          </GuideSection>

          <p className="text-surface/60 mb-8 leading-relaxed">
            Il y a quatre façons de démarrer un tunnel — l'IA fait tout le travail à ta place, un modèle intégré te donne une base
            déjà écrite à adapter, la marketplace te fait partir d'un tunnel créé par un autre vendeur, et la galerie sert juste à
            t'inspirer sans rien cloner.
          </p>

          <GuideSection
            id="ia"
            icon={Wand2}
            title="Créer avec l'IA"
            image={imgAiGenerator}
            imageAlt="Copilote IA de génération de tunnel avec réglages avancés et fil de discussion"
            linkTo="/app/funnels/ai"
            linkLabel="Essayer le copilote IA"
          >
            <p>
              Donne un <b>nom à ton tunnel</b>, puis décris ton offre en une phrase dans le fil de discussion — c'est tout ce qui est
              obligatoire. Le copilote génère alors les pages, les textes de vente et la mise en page complète.
            </p>
            <p>
              Les <b>réglages avancés</b> (repliés par défaut) te laissent préciser la catégorie, la cible, le prix — obligatoire pour
              les tunnels de vente : prix fixe, gratuit, ou prix libre choisi par le client —, tes preuves/témoignages, tes propres
              images, et même ta palette de couleurs si tu ne veux pas laisser l'IA choisir.
            </p>
            <p>
              Une fois le résultat généré, un message « C'est fait » apparaît avec un bouton <b>« Ouvrir dans l'éditeur »</b> pour
              affiner ce que l'IA a produit. Réservé aux plans Pro et Entreprise.
            </p>
          </GuideSection>

          <GuideSection
            id="modeles"
            icon={LayoutDashboard}
            title="Créer depuis un modèle"
            image={imgNewFunnelCategories}
            imageAlt="Choix d'une catégorie de tunnel parmi les 10 disponibles"
            linkTo="/app/funnels/new"
            linkLabel="Voir les catégories de modèles"
          >
            <p>
              Choisis d'abord une <b>catégorie</b> parmi les dix disponibles — Génération de leads, Vente, Webinaire, Coaching,
              E-commerce, Évènement, Quiz, Communauté, Marque personnelle, Personnalisé — puis un <b>modèle</b> à l'intérieur de
              cette catégorie. Chaque modèle affiche son nombre de pages avant que tu ne le choisisses.
            </p>
            <p>
              Donne un nom à ton tunnel et clique <b>« Créer le tunnel »</b> : tu arrives directement dans l'éditeur, avec toutes
              les pages et tous les blocs déjà en place — il ne te reste qu'à remplacer les textes d'exemple par les tiens.
            </p>
            <Screenshot src={imgNewFunnelTemplates} alt="Liste des modèles disponibles dans la catégorie Vente" />
          </GuideSection>

          <GuideSection
            id="marketplace"
            icon={Store}
            title="La marketplace de la communauté"
            image={imgMarketplace}
            imageAlt="Marketplace de modèles créés par la communauté"
            linkTo="/app/templates"
            linkLabel="Explorer la marketplace"
          >
            <p>
              Ici, tu pars d'un tunnel <b>publié par un autre vendeur</b> et validé par un administrateur — pas un modèle générique,
              un vrai tunnel qui a déjà servi. Filtre par catégorie, cherche par mot-clé, trie par popularité ou par date, puis
              clique <b>« Aperçu »</b> pour le regarder ou <b>« Utiliser »</b> pour en obtenir ta propre copie, modifiable tout de
              suite.
            </p>
            <p>Aucun lien de paiement d'un autre vendeur n'est jamais inclus dans la copie — c'est à toi de configurer le tien.</p>
          </GuideSection>

          <GuideSection
            id="galerie"
            icon={Compass}
            title="La galerie d'inspiration"
            image={imgGallery}
            imageAlt="Galerie d'inspiration de tunnels publiés par la communauté"
            linkTo="/app/gallery"
            linkLabel="Parcourir la galerie"
          >
            <p>
              Contrairement à la marketplace, la galerie ne se clone pas — elle sert uniquement à regarder de vrais tunnels publiés
              par d'autres créateurs pour t'inspirer, sans aucune information sur leur propriétaire. Un simple lien ouvre la page
              publique dans un nouvel onglet. Réservée aux plans Pro et Entreprise.
            </p>
          </GuideSection>

          <GuideSection
            id="editeur"
            icon={Layers}
            title="L'éditeur de blocs"
            image={imgEditorMain}
            imageAlt="Éditeur de tunnel avec la liste des blocs et le score de santé"
            linkTo="/app"
            linkLabel="Retrouver mes tunnels"
          >
            <p>
              Chaque page de ton tunnel est une pile de <b>blocs</b> (Hero, Texte, Image, Formulaire, Appel à l'action,
              Fonctionnalités, Témoignages, Tarification, Compte à rebours, FAQ, Vidéo, Quiz, Étapes, Pile de bonus, Chiffres clés,
              Équipe, Logos, Réassurance...). Glisse la poignée à gauche d'un bloc pour le réordonner, ou clique
              <b> « + Ajouter un bloc »</b> en bas de la liste pour en insérer un nouveau — depuis la bibliothèque complète ou depuis
              tes propres blocs enregistrés.
            </p>
            <p>
              Sur chaque bloc, une petite barre d'icônes permet de : le <b>régénérer avec l'IA</b>, le <b>verrouiller</b> (pour le
              protéger d'une régénération), l'<b>éditer</b> (le crayon, pour modifier chaque champ précisément), le
              <b> dupliquer</b>, l'<b>enregistrer dans ta bibliothèque</b> pour le réutiliser ailleurs, ou le <b>supprimer</b>.
              Le <b>score de santé du tunnel</b>, en haut, pointe directement vers ce qu'il reste à corriger.
            </p>
            <Screenshot src={imgEditorAddBlock} alt="Panneau d'ajout d'un nouveau bloc dans l'éditeur" />
          </GuideSection>

          <GuideSection
            id="brand-kit"
            icon={Palette}
            title="Ton identité de marque"
            image={imgEditorBrandkit}
            imageAlt="Panneau Brand Kit avec couleurs, typographie et logo"
            linkTo="/app"
            linkLabel="Retrouver mes tunnels"
          >
            <p>
              Dans l'éditeur, le menu <b>« Réglages »</b> en haut à droite regroupe trois panneaux — <b>Général</b> (livraison
              automatique, réglages du tunnel), <b>Design</b> (ton Brand Kit : couleur principale, couleur d'accent, couleur des
              boutons, typographie parmi six polices, logo) et <b>Page</b> (compte à rebours, notification d'achat, pied de page
              collant).
            </p>
            <p>
              Sur le plan Entreprise, ce même panneau te laisse aussi rattacher tes identifiants <b>Meta Pixel</b> et
              <b> Google Analytics/Ads</b>, valables uniquement sur les pages publiques de ce tunnel précis.
            </p>
          </GuideSection>

          <GuideSection
            id="paiement"
            icon={Wallet}
            title="Configurer un moyen de paiement"
            image={imgOrgPayments}
            imageAlt="Onglet Paiements de l'organisation avec les moyens de paiement disponibles"
            linkTo="/app/organisation"
            linkLabel="Configurer mes paiements"
          >
            <p>
              Depuis <b>Organisation → Paiements</b>, connecte un <b>lien externe</b> (Wave, Orange Money, ou tout autre lien de
              paiement) ou un vrai <b>compte Moneroo intégré</b> — clé secrète et secret de webhook obtenus sur ton propre tableau
              de bord Moneroo. Dans les deux cas, l'argent de tes ventes va <b>directement sur ton compte</b>, jamais par
              l'intermédiaire de TonTunnel.
            </p>
            <p>
              Une fois un moyen de paiement enregistré, va dans le bloc <b>« Tarification »</b> de ton tunnel pour le rattacher à
              ton offre — sans ça, la publication d'une offre payante est bloquée.
            </p>
          </GuideSection>

          <GuideSection
            id="publier"
            icon={Rocket}
            title="Publier et partager"
            image={imgPublishedLive}
            imageAlt="Page publique d'un tunnel publié"
            linkTo="/app"
            linkLabel="Retrouver mes tunnels"
          >
            <p>
              Le bouton <b>« Publier »</b>, en haut à droite de l'éditeur, met ton tunnel en ligne à une adresse publique
              (<code className="font-mono text-sm bg-surface/5 px-1.5 py-0.5 rounded">tontunnel.com/f/ton-tunnel</code>). Il redevient
              <b> « Publié »</b> (grisé) une fois à jour, et se réactive dès que tu fais une nouvelle modification.
            </p>
            <p>
              Pour une offre payante, TonTunnel vérifie avant de publier qu'un <b>moyen de paiement</b> est bien rattaché à l'offre
              et qu'un <b>livrable</b> est configuré (ebook, fichier à envoyer par email, ou instructions post-achat) — sinon ton
              client paierait sans jamais rien recevoir. Le message d'erreur, s'il apparaît, indique exactement quoi corriger.
            </p>
          </GuideSection>

          <PartHeader index={2} label="Faire grandir tes ventes" />

          <GuideSection
            id="leads"
            icon={Mail}
            title="Suivre tes leads"
            image={imgLeads}
            imageAlt="Liste des leads capturés avec statut de paiement"
            linkTo="/app/leads"
            linkLabel="Voir mes leads"
          >
            <p>
              Chaque inscription ou achat sur l'un de tes tunnels atterrit ici, avec le statut de paiement (<b>Payé</b>,
              <b> En attente</b>, <b>Échoué</b>, ou <b>Remboursé</b> — que tu peux marquer toi-même) et si le contenu promis a bien
              été envoyé par email.
            </p>
            <p>
              L'export <b>CSV</b> (plans Pro et Entreprise) utilise le format attendu par Excel en français, accents compris. Le
              plan Starter garde uniquement tes derniers leads visibles — l'historique complet se débloque avec un plan payant.
            </p>
          </GuideSection>

          <GuideSection
            id="analytique"
            icon={BarChart3}
            title="Analyser tes performances"
            image={imgAnalytics}
            imageAlt="Page Analytique avec sélection d'un tunnel"
            linkTo="/app/analytics"
            linkLabel="Voir mon analytique"
          >
            <p>
              Choisis un tunnel dans la liste pour voir son <b>parcours de conversion</b> page par page (combien de vues, combien
              de leads, combien perdus à chaque étape), le <b>taux d'acceptation</b> de tes offres upsell, et — une fois ton tunnel
              publié — comment il se compare à la <b>moyenne des tunnels de sa catégorie</b> sur TonTunnel. Réservé aux plans Pro
              et Entreprise ; le parcours détaillé est réservé au plan Entreprise.
            </p>
          </GuideSection>

          <GuideSection
            id="recherche"
            icon={Search}
            title="Recherche rapide et notifications"
            image={imgCommandPalette}
            imageAlt="Palette de commandes ouverte avec recherche de tunnels et navigation"
            linkTo="/app"
            linkLabel="Essayer Ctrl+K"
          >
            <p>
              Où que tu sois dans l'application, <b>Ctrl+K</b> (ou <b>⌘K</b> sur Mac) ouvre une recherche instantanée qui mélange
              tes tunnels et les principales pages de navigation — tape quelques lettres pour sauter directement où tu veux aller.
            </p>
            <p>
              La cloche en haut de l'écran liste tes leads les plus récents et te prévient (avec un petit toast) lors de ton
              premier lead et de ta première vente.
            </p>
          </GuideSection>

          <PartHeader index={3} label="Outils IA complémentaires" />

          <GuideSection
            id="visuels"
            icon={ImageIcon}
            title="Générer des visuels"
            image={imgImageStudio}
            imageAlt="Studio de visuels IA avec formulaire de génération"
            linkTo="/app/images"
            linkLabel="Ouvrir le studio de visuels"
          >
            <p>
              Décris le visuel voulu, choisis un <b>type</b> (image, coffret produit, ebook, mockup...), un <b>style</b> (photo
              réaliste, illustration, rendu 3D, aquarelle, minimaliste, néon), un <b>format</b> et jusqu'à <b>4 variantes</b> en une
              génération — avec une option fond transparent pour poser le visuel où tu veux ensuite.
            </p>
            <p>
              Chaque image générée peut être copiée, téléchargée, régénérée ou supprimée individuellement — ou en lot, avec un
              export en ZIP. Réservé aux plans Pro et Entreprise.
            </p>
          </GuideSection>

          <GuideSection
            id="ebooks"
            icon={BookOpen}
            title="Créer un ebook"
            image={imgEbooksList}
            imageAlt="Liste des ebooks avec bouton de création"
            linkTo="/app/ebooks"
            linkLabel="Créer un ebook"
          >
            <p>
              Renseigne le sujet, le ton (professionnel, storytelling, direct), la langue — dont plusieurs langues d'Afrique de
              l'Ouest — et une longueur cible, puis génère d'abord le <b>sommaire</b>. Dans l'éditeur, chaque chapitre se génère,
              se régénère avec des instructions précises, ou se réordonne indépendamment.
            </p>
            <p>
              Une fois ton ebook prêt, le bouton <b>« Créer un tunnel pour cet ebook »</b> ouvre directement le copilote IA avec un
              brief pré-rempli à partir de son contenu — le point de départ le plus rapide pour vendre ce que tu viens d'écrire.
            </p>
            <Screenshot src={imgEbooksNew} alt="Formulaire de création d'un nouvel ebook" />
          </GuideSection>

          <PartHeader index={4} label="Développer et connecter" />

          <GuideSection
            id="integrations"
            icon={Webhook}
            title="Intégrations (webhooks)"
            image={imgIntegrations}
            imageAlt="Page Intégrations avec formulaire de création de webhook"
            linkTo="/app/integrations"
            linkLabel="Configurer un webhook"
          >
            <p>
              TonTunnel envoie chaque nouveau lead vers n'importe quelle URL capable de recevoir un envoi <b>POST au format JSON</b>
              — ce qui couvre <b>Zapier</b> (déclencheur « Webhooks by Zapier »), <b>Make</b>, ou un script sur mesure. Choisis un
              nom, le tunnel concerné (ou tous), colle ton URL de destination, et suis l'historique des envois. Réservé aux plans
              Pro et Entreprise.
            </p>
          </GuideSection>

          <GuideSection
            id="equipe"
            icon={Users}
            title="Travailler en équipe"
            image={imgOrgTeam}
            imageAlt="Onglet Équipe de l'organisation avec formulaire d'invitation"
            linkTo="/app/organisation"
            linkLabel="Inviter mon équipe"
          >
            <p>
              Depuis <b>Organisation → Équipe</b>, invite des collaborateurs par email. Une fois l'invitation acceptée, ils peuvent
              créer et modifier tes tunnels — mais jamais accéder à la facturation ni supprimer le compte. Fonctionnalité réservée
              au propriétaire du compte, sur le plan Entreprise.
            </p>
          </GuideSection>

          <PartHeader index={5} label="Compte et facturation" />

          <GuideSection
            id="facturation"
            icon={CreditCard}
            title="Abonnement et crédits IA"
            image={imgBilling}
            imageAlt="Page de facturation avec les trois plans et les crédits IA"
            linkTo="/app/billing"
            linkLabel="Voir les plans"
          >
            <p>
              Compare les trois plans et change à tout moment via <b>« Passer à ce plan »</b>, qui te redirige vers le paiement
              sécurisé. Sur les plans payants, une section <b>Crédits IA</b> affiche ton solde du mois et te propose des packs
              supplémentaires (Boost, Pro+, Studio) si tu en as besoin avant le renouvellement — avec un historique complet de
              chaque mouvement.
            </p>
          </GuideSection>

          <GuideSection
            id="compte"
            icon={User}
            title="Réglages du compte"
            image={imgAccount}
            imageAlt="Page de réglages du compte avec profil et sécurité"
            linkTo="/app/account"
            linkLabel="Ouvrir mon compte"
          >
            <p>
              Modifie ton prénom et ta <b>devise</b> d'affichage (utilisée partout où un prix apparaît dans tes tunnels), change ton
              mot de passe, ou supprime définitivement ton compte — cette dernière action, irréversible, demande de taper
              « SUPPRIMER » pour confirmer que ce n'est pas un clic accidentel.
            </p>
          </GuideSection>
        </div>
      </div>
    </div>
  );
}
