import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Modèle de document juridique — voir le bandeau d'avertissement ci-dessous
// affiché sur chaque page tant que placeholder=true : les informations
// d'identification (raison sociale, forme juridique, numéro d'immatriculation,
// adresse, capital social...) ne sont volontairement pas inventées ici et
// doivent être complétées avec les vraies informations de l'entreprise,
// idéalement après relecture par un juriste, avant toute mise en production
// réelle (l'app traite des paiements, ces documents ne sont pas optionnels).
const PLACEHOLDER_NOTICE = true;

const DOCS = {
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
      {
        heading: 'Éditeur du site',
        body: `Le site et l'application Vendeko sont édités par [Raison sociale de l'entreprise], [forme juridique — ex. SARL, SAS, entreprise individuelle], au capital de [montant] [devise], immatriculée sous le numéro [RCCM/SIRET/numéro d'immatriculation], dont le siège social est situé [adresse complète].

Numéro de téléphone : [téléphone]
Email de contact : [email de contact]
Directeur de la publication : [nom du responsable]`,
      },
      {
        heading: 'Hébergement',
        body: `Le site (frontend) est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
L'application et les données (backend, base de données) sont hébergées par [nom de l'hébergeur backend/base de données — ex. Render, Railway], [adresse de l'hébergeur si disponible publiquement].`,
      },
      {
        heading: 'Propriété intellectuelle',
        body: `L'ensemble des éléments du site et de l'application Vendeko (textes, logos, interface, code) est protégé par le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.`,
      },
    ],
  },
  cgu: {
    title: "Conditions Générales d'Utilisation",
    sections: [
      {
        heading: 'Objet',
        body: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de l'application Vendeko, permettant à ses utilisateurs de créer des tunnels de vente en ligne. L'utilisation de l'application implique l'acceptation pleine et entière des présentes CGU.`,
      },
      {
        heading: 'Compte utilisateur',
        body: `L'accès à certaines fonctionnalités nécessite la création d'un compte. L'utilisateur est responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis son compte.`,
      },
      {
        heading: "Contenu publié par l'utilisateur",
        body: `L'utilisateur reste seul responsable du contenu (textes, images, offres, prix) qu'il publie via les tunnels qu'il crée avec Vendeko. Vendeko n'exerce pas de contrôle éditorial préalable sur ce contenu et ne saurait être tenu responsable des offres, promesses ou informations publiées par ses utilisateurs sur leurs tunnels.`,
      },
      {
        heading: 'Usage interdit',
        body: `Il est interdit d'utiliser Vendeko pour promouvoir des produits ou services illégaux, frauduleux, ou pour toute activité contraire à la loi en vigueur dans [pays/zone d'application — ex. l'UEMOA, la France].`,
      },
      {
        heading: 'Disponibilité du service',
        body: `Vendeko met en œuvre les moyens raisonnables pour assurer la disponibilité de l'application, sans garantie de disponibilité continue. Des interruptions pour maintenance peuvent survenir.`,
      },
      {
        heading: 'Résiliation',
        body: `L'utilisateur peut supprimer son compte à tout moment. Vendeko se réserve le droit de suspendre ou résilier un compte en cas de manquement grave aux présentes CGU.`,
      },
    ],
  },
  cgv: {
    title: 'Conditions Générales de Vente',
    sections: [
      {
        heading: 'Objet',
        body: `Les présentes Conditions Générales de Vente (CGV) s'appliquent à la souscription d'un abonnement payant à l'application Vendeko (plans [Créateur/Entreprise — à adapter aux noms réels des plans]).`,
      },
      {
        heading: 'Prix et paiement',
        body: `Les prix des abonnements sont indiqués en [devise] toutes taxes comprises sur la page /app/billing. Le paiement s'effectue via [moyens de paiement réellement proposés — ex. Moneroo, Wave, carte bancaire]. L'abonnement est renouvelé automatiquement à échéance sauf résiliation par l'utilisateur.`,
      },
      {
        heading: 'Droit de rétractation',
        body: `Conformément à la réglementation applicable, [préciser les conditions de rétractation applicables à un service numérique dès son accès — à faire valider par un juriste selon la juridiction concernée].`,
      },
      {
        heading: 'Vente entre l’utilisateur et ses propres clients',
        body: `Vendeko fournit un outil permettant à ses utilisateurs de vendre leurs propres produits ou services à des tiers via des tunnels de vente. Vendeko n'est pas partie à la transaction entre l'utilisateur et ses acheteurs, et n'intervient ni dans la fixation des prix, ni dans le traitement du paiement (effectué via les propres moyens de paiement configurés par l'utilisateur), ni dans la livraison du produit ou service vendu. La responsabilité de ces ventes incombe entièrement à l'utilisateur.`,
      },
      {
        heading: 'Facturation',
        body: `Une facture est disponible pour chaque paiement d'abonnement depuis [emplacement — ex. la page Facturation du compte, ou à défaut sur demande à contact@...].`,
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    sections: [
      {
        heading: 'Données collectées',
        body: `Vendeko collecte les données suivantes : données de compte (email, nom), données des tunnels créés, et données des leads/prospects capturés via les tunnels des utilisateurs (nom, email des visiteurs de leurs tunnels).`,
      },
      {
        heading: 'Finalité du traitement',
        body: `Ces données sont utilisées pour fournir le service Vendeko (création et hébergement de tunnels de vente, gestion des leads, envoi d'emails liés à l'activité du compte), et ne sont jamais vendues à des tiers.`,
      },
      {
        heading: 'Sous-traitants et services tiers',
        body: `Vendeko fait appel aux prestataires suivants pour fonctionner : Vercel (hébergement frontend), [hébergeur backend/base de données], Brevo (envoi d'emails transactionnels), [prestataire de paiement — ex. Moneroo], [service de génération IA — ex. OpenAI/Anthropic pour la génération de contenu]. Chacun de ces prestataires traite les données strictement nécessaires à sa fonction.`,
      },
      {
        heading: 'Durée de conservation',
        body: `Les données sont conservées pendant toute la durée d'utilisation du compte, puis supprimées dans un délai de [durée — ex. 12 mois] après la suppression du compte, sauf obligation légale de conservation plus longue.`,
      },
      {
        heading: "Droits de l'utilisateur",
        body: `Conformément à la réglementation applicable en matière de protection des données, tout utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données, en écrivant à [email de contact dédié à la confidentialité].`,
      },
      {
        heading: 'Cookies',
        body: `L'application utilise des cookies strictement nécessaires à son fonctionnement (authentification). [Compléter si des cookies de mesure d'audience ou publicitaires sont utilisés, avec la mention du bandeau de consentement correspondant.]`,
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
        <p className="text-sm text-surface/40 mb-10">Dernière mise à jour : [date à compléter lors de la mise en production]</p>

        {PLACEHOLDER_NOTICE && (
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5 mb-10 text-sm text-surface/80">
            <strong className="text-surface">Modèle à compléter.</strong> Ce document contient des informations entre crochets [ainsi] qui doivent être remplacées par les informations réelles de l'entreprise avant la mise en production. Une relecture par un juriste est recommandée, en particulier pour les CGV (droit de rétractation) et la politique de confidentialité (réglementation applicable selon les pays où Vendeko est utilisé).
          </div>
        )}

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
