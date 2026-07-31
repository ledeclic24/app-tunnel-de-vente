import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Rédigé à partir du fonctionnement réel de l'application (sous-traitants,
// données collectées, moyens de paiement). L'identité légale de
// l'entreprise (raison sociale, adresse, immatriculation...) est
// volontairement gardée générique ici plutôt que placeholder — à préciser
// directement dans les sections ci-dessous quand ces informations seront
// disponibles.

const DOCS = {
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
      {
        heading: 'Éditeur du site',
        body: `Le site et l'application TonTunnel sont édités par TonTunnel.

Email de contact : contact@tontunnel.com`,
      },
      {
        heading: 'Hébergement',
        body: `L'application (interface, serveur applicatif et base de données) est hébergée par des prestataires cloud spécialisés, susceptibles d'évoluer dans le temps.`,
      },
      {
        heading: 'Propriété intellectuelle',
        body: `L'ensemble des éléments du site et de l'application TonTunnel (textes, logos, interface, code) est protégé par le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.`,
      },
    ],
  },
  cgu: {
    title: "Conditions Générales d'Utilisation",
    sections: [
      {
        heading: 'Objet',
        body: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de l'application TonTunnel, qui permet à ses utilisateurs de créer, publier et gérer des tunnels de vente en ligne (pages de vente, formulaires de capture de prospects, paiement), y compris à l'aide d'outils de génération de contenu par intelligence artificielle. L'utilisation de l'application implique l'acceptation pleine et entière des présentes CGU.`,
      },
      {
        heading: 'Compte utilisateur',
        body: `L'accès aux fonctionnalités de création et de gestion de tunnels nécessite la création d'un compte, associé à une adresse email et un mot de passe. L'utilisateur est responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis son compte. Un compte peut être partagé avec des collaborateurs invités selon le plan souscrit ; le titulaire du compte reste seul responsable des actions de ses collaborateurs.`,
      },
      {
        heading: "Contenu publié par l'utilisateur",
        body: `L'utilisateur reste seul responsable du contenu (textes, images, offres, prix, promesses commerciales) qu'il publie via les tunnels qu'il crée avec TonTunnel, qu'il ait été rédigé manuellement ou généré à l'aide des outils d'intelligence artificielle intégrés à l'application. TonTunnel n'exerce pas de contrôle éditorial préalable sur ce contenu et ne saurait être tenu responsable des offres, promesses ou informations publiées par ses utilisateurs sur leurs tunnels.`,
      },
      {
        heading: 'Contenu généré par intelligence artificielle',
        body: `TonTunnel propose des outils de génération de texte et d'images par intelligence artificielle (fournis par des prestataires tiers spécialisés) pour aider l'utilisateur à créer ses tunnels et ses ebooks plus rapidement. Ce contenu est une proposition de départ : il appartient à l'utilisateur de le relire, de le corriger et de s'assurer de son exactitude, de sa légalité et du respect des droits de tiers avant toute publication. TonTunnel ne garantit ni l'exactitude ni la disponibilité continue de ces outils, dépendants de prestataires tiers.`,
      },
      {
        heading: 'Usage interdit',
        body: `Il est interdit d'utiliser TonTunnel pour promouvoir des produits ou services illégaux, frauduleux, trompeurs, ou pour toute activité contraire à la loi applicable. TonTunnel se réserve le droit de suspendre, sans préavis, tout tunnel ou tout compte constaté en infraction avec cette règle.`,
      },
      {
        heading: 'Disponibilité du service',
        body: `TonTunnel met en œuvre les moyens raisonnables pour assurer la disponibilité de l'application, sans garantie de disponibilité continue. Des interruptions pour maintenance, ou liées à un prestataire tiers (hébergement, paiement, envoi d'emails), peuvent survenir.`,
      },
      {
        heading: 'Limitation de responsabilité',
        body: `TonTunnel est un outil de création de tunnels de vente : TonTunnel n'est pas partie aux transactions conclues entre l'utilisateur et ses propres clients (voir les Conditions Générales de Vente) et ne saurait être tenu responsable des conséquences commerciales, financières ou juridiques de l'utilisation de ses tunnels par l'utilisateur ou par les visiteurs de ceux-ci.`,
      },
      {
        heading: 'Résiliation',
        body: `L'utilisateur peut supprimer son compte à tout moment depuis les paramètres de son compte. La suppression du compte entraîne la dépublication de l'ensemble de ses tunnels. TonTunnel se réserve le droit de suspendre ou résilier un compte en cas de manquement grave aux présentes CGU.`,
      },
    ],
  },
  cgv: {
    title: 'Conditions Générales de Vente',
    sections: [
      {
        heading: 'Objet',
        body: `Les présentes Conditions Générales de Vente (CGV) s'appliquent à la souscription d'un abonnement payant à l'application TonTunnel (à ce jour, les plans Pro et Entreprise ; le plan Starter est gratuit). Elles ne s'appliquent pas aux ventes réalisées par les utilisateurs auprès de leurs propres clients via leurs tunnels, régies par la section "Vente entre l'utilisateur et ses propres clients" ci-dessous.`,
      },
      {
        heading: 'Prix et paiement',
        body: `Les prix des abonnements, facturés mensuellement, sont ceux affichés sur la page Facturation de l'application au moment de la souscription et peuvent évoluer dans le temps. Le paiement s'effectue via les moyens proposés sur cette page. L'abonnement est renouvelé automatiquement chaque mois à la même date, sauf résiliation par l'utilisateur avant l'échéance.`,
      },
      {
        heading: 'Droit de rétractation',
        body: `Conformément aux règles applicables aux services numériques fournis avec un accès immédiat, l'utilisateur qui souscrit un abonnement payant reconnaît bénéficier d'un accès immédiat aux fonctionnalités correspondantes dès la confirmation du paiement, et renonce expressément à son droit de rétractation à compter de cette exécution complète.`,
      },
      {
        heading: 'Résiliation de l\'abonnement',
        body: `L'utilisateur peut résilier son abonnement à tout moment depuis la page Facturation de son compte. La résiliation prend effet à la fin de la période déjà payée ; aucun remboursement au prorata n'est effectué pour la période en cours, sauf disposition légale contraire applicable.`,
      },
      {
        heading: "Vente entre l'utilisateur et ses propres clients",
        body: `TonTunnel fournit un outil permettant à ses utilisateurs de vendre leurs propres produits ou services à des tiers via des tunnels de vente. Pour ces ventes, l'utilisateur connecte son propre moyen de paiement (lien externe ou compte personnel chez un prestataire de paiement) : les fonds sont versés directement à l'utilisateur, jamais par l'intermédiaire d'un compte TonTunnel. TonTunnel n'est pas partie à la transaction entre l'utilisateur et ses acheteurs, et n'intervient ni dans la fixation des prix, ni dans le traitement du paiement, ni dans la livraison du produit ou service vendu. La responsabilité de ces ventes (description du produit, livraison, service après-vente, remboursements éventuels) incombe entièrement à l'utilisateur.`,
      },
      {
        heading: 'Facturation',
        body: `Une facture est disponible pour chaque paiement d'abonnement depuis la page Facturation du compte (Organisation → Facturation).`,
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    sections: [
      {
        heading: 'Données collectées',
        body: `TonTunnel collecte : les données de compte (email, nom) ; le contenu des tunnels créés par l'utilisateur ; les données des prospects/clients capturés via les formulaires des tunnels (nom, email, et le cas échéant statut de paiement) ; et, si l'utilisateur connecte un moyen de paiement intégré, ses identifiants d'API, stockés chiffrés et jamais affichés en clair après leur saisie initiale.`,
      },
      {
        heading: 'Finalité du traitement',
        body: `Ces données sont utilisées pour fournir le service (création et hébergement des tunnels, gestion des leads, traitement des paiements intégrés, envoi des emails liés à l'activité du compte ou d'un achat) et ne sont jamais vendues à des tiers.`,
      },
      {
        heading: 'Sous-traitants et services tiers',
        body: `TonTunnel fait appel à des prestataires tiers spécialisés pour fonctionner, chacun ne traitant que les données strictement nécessaires à sa fonction et susceptible d'être remplacé au fil du temps :
— Hébergement de l'interface et du serveur applicatif
— Hébergement de la base de données
— Envoi des emails transactionnels (bienvenue, notifications, réinitialisation de mot de passe, contenus post-achat)
— Traitement des paiements, pour les comptes qui activent cette option
— Génération de texte et d'images par intelligence artificielle, à la demande de l'utilisateur
— Supervision technique des erreurs, si activé

La liste précise et à jour des sous-traitants est disponible sur demande auprès de contact@tontunnel.com.`,
      },
      {
        heading: 'Sécurité des moyens de paiement',
        body: `Les identifiants d'API que l'utilisateur connecte pour son moyen de paiement intégré sont chiffrés en base de données (AES-256) et ne transitent ni ne sont stockés en clair après leur saisie. TonTunnel ne voit ni ne stocke jamais les numéros de carte bancaire ou de mobile money des clients finaux : ces paiements sont traités directement par le prestataire de paiement connecté par l'utilisateur.`,
      },
      {
        heading: 'Durée de conservation',
        body: `Les données sont conservées pendant toute la durée d'utilisation du compte, puis supprimées dans un délai de 12 mois après la suppression du compte, sauf obligation légale de conservation plus longue (ex. données de facturation).`,
      },
      {
        heading: "Droits de l'utilisateur",
        body: `Conformément à la réglementation applicable en matière de protection des données, tout utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données, en écrivant à contact@tontunnel.com.`,
      },
      {
        heading: 'Cookies',
        body: `L'application utilise un cookie strictement nécessaire à l'authentification (maintien de la connexion), et aucun cookie de mesure d'audience ou publicitaire à ce jour. Si cela venait à changer, cette page sera mise à jour et un bandeau de consentement sera ajouté en conséquence.`,
      },
    ],
  },
};

export default function LegalPage({ doc }) {
  const content = DOCS[doc];
  if (!content) return null;

  return (
    <div className="relative w-full bg-background min-h-screen text-surface font-sans">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-20 md:py-28">
        <h1 className="text-3xl md:text-4xl font-sans font-bold text-surface mb-2">{content.title}</h1>
        <p className="text-sm text-surface/40 mb-10">Dernière mise à jour : 28 juillet 2026</p>

        <div className="space-y-8">
          {content.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-sans font-semibold text-surface mb-2">{s.heading}</h2>
              <p className="text-surface/70 whitespace-pre-line leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
