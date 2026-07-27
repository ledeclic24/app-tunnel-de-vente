import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { fetchPublishedSnapshot, insertLead, incrementStepView, fetchLeadStatus } from '../../lib/funnelsApi';
import { createMonerooCheckout } from '../../lib/checkoutApi';
import { brandStyleVars } from '../../lib/colorUtils';
import BlockRenderer from '../../components/blocks/BlockRenderer';
import CountdownBar from '../../components/public/CountdownBar';
import PurchaseNotification from '../../components/public/PurchaseNotification';
import StickyFooterCta from '../../components/public/StickyFooterCta';
import ExitIntentPopup from '../../components/public/ExitIntentPopup';

const META_PIXEL_RE = /^[0-9]{5,20}$/;
const GA_ID_RE = /^(G|UA|AW)-[A-Z0-9-]{4,20}$/i;

function useAdPixels(brand) {
  useEffect(() => {
    const metaPixelId = brand?.metaPixelId;
    const gaId = brand?.googleAnalyticsId;
    const injected = [];

    if (metaPixelId && META_PIXEL_RE.test(metaPixelId)) {
      const script = document.createElement('script');
      script.setAttribute('data-vendeko-pixel', 'meta');
      script.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`;
      document.head.appendChild(script);
      injected.push(script);
    }

    if (gaId && GA_ID_RE.test(gaId)) {
      const loader = document.createElement('script');
      loader.async = true;
      loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      loader.setAttribute('data-vendeko-pixel', 'ga-loader');
      document.head.appendChild(loader);
      injected.push(loader);

      const inline = document.createElement('script');
      inline.setAttribute('data-vendeko-pixel', 'ga-inline');
      inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
      document.head.appendChild(inline);
      injected.push(inline);
    }

    return () => injected.forEach((el) => el.remove());
  }, [brand?.metaPixelId, brand?.googleAnalyticsId]);
}

// Interroge le statut d'un lead au retour de Moneroo (voir ?vk_lead=... dans
// l'URL de retour, ajouté côté backend) et affiche une vraie confirmation
// une fois le paiement validé — jusqu'ici le client revenait simplement sur
// la page de paiement, sans qu'aucune suite ne soit déclenchée. Le webhook
// peut arriver après la redirection du navigateur, jamais avant, d'où le
// court sondage plutôt qu'une seule vérification.
const PAYMENT_POLL_INTERVAL_MS = 2000;
const PAYMENT_POLL_MAX_ATTEMPTS = 20; // ~40s

function PaymentConfirmationOverlay({ status, onDismiss }) {
  if (status === 'checking') {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-surface font-semibold">Vérification de ton paiement...</p>
        <p className="text-surface/50 text-sm max-w-xs">Ça ne prend que quelques secondes.</p>
      </div>
    );
  }
  if (status === 'paid') {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center">
          <Check className="w-7 h-7 text-accent" />
        </div>
        <p className="text-surface font-semibold text-lg">Paiement confirmé, merci !</p>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-surface font-semibold text-lg">Ton paiement est en cours de traitement</p>
      <p className="text-surface/60 text-sm max-w-xs mb-2">Tu recevras un e-mail de confirmation dès qu'il sera validé.</p>
      <button
        type="button"
        onClick={onDismiss}
        className="px-5 py-2.5 rounded-full bg-accent text-background text-sm font-semibold"
      >
        Continuer
      </button>
    </div>
  );
}

export default function PublishedFunnelPage({ funnelSlugOverride } = {}) {
  const { funnelSlug: paramSlug, stepSlug } = useParams();
  const funnelSlug = funnelSlugOverride || paramSlug;
  // Domaine personnalisé (pas de préfixe /f/:slug dans l'URL) : la
  // navigation interne doit rester à la racine du domaine.
  const basePath = funnelSlugOverride ? '' : `/f/${funnelSlug}`;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [funnel, setFunnel] = useState(null);
  const [steps, setSteps] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const pollingRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await fetchPublishedSnapshot(funnelSlug);
      const s = snapshot.steps;
      const currentStep = stepSlug ? s.find((st) => st.slug === stepSlug) : s[0];
      if (!currentStep) { setNotFound(true); setLoading(false); return; }
      setFunnel(snapshot);
      setSteps(s);
      setBlocks(currentStep.blocks);
      incrementStepView(currentStep.id).catch(() => {});
    } catch (err) {
      setNotFound(true);
    }
    setLoading(false);
  }, [funnelSlug, stepSlug]);

  useEffect(() => { load(); }, [load]);

  const currentStep = steps.find((s) => s.slug === (stepSlug || steps[0]?.slug));

  useEffect(() => {
    if (!funnel) return;
    const stepLabel = currentStep && steps.length > 1 ? ` — ${currentStep.name}` : '';
    document.title = `${funnel.name}${stepLabel}`;
    return () => {
      document.title = 'TonTunnel — Crée ton tunnel de vente sans expertise';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnel, currentStep?.id, steps.length]);

  useAdPixels(funnel?.brand);

  const handleAdvance = () => {
    const idx = steps.findIndex((s) => s.id === currentStep?.id);
    const next = steps[idx + 1];
    if (next) navigate(`${basePath}/${next.slug}`);
  };

  // Retour de Moneroo : ?vk_lead=<id> identifie le lead dont on doit
  // confirmer le paiement avant de continuer. Nettoie le paramètre dès le
  // départ (jamais re-décentché sur un simple rechargement de page), sonde
  // le statut réel côté serveur, puis avance automatiquement à l'étape
  // suivante si elle existe (sinon reste sur place avec la confirmation).
  useEffect(() => {
    const leadId = searchParams.get('vk_lead');
    if (!leadId || pollingRef.current || !funnel) return;
    pollingRef.current = true;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('vk_lead');
      return next;
    }, { replace: true });
    setPaymentStatus('checking');

    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const { paymentStatus: status } = await fetchLeadStatus(leadId);
        if (status === 'paid') {
          setPaymentStatus('paid');
          setTimeout(() => {
            setPaymentStatus(null);
            handleAdvance();
          }, 1800);
          return;
        }
        if (status === 'failed') {
          setPaymentStatus(null);
          return;
        }
      } catch {
        // Requête ratée une fois : on continue le sondage plutôt que
        // d'abandonner sur un simple aléa réseau.
      }
      if (attempts >= PAYMENT_POLL_MAX_ATTEMPTS) {
        setPaymentStatus('timeout');
        return;
      }
      setTimeout(poll, PAYMENT_POLL_INTERVAL_MS);
    };
    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnel]);

  const handleNavigateToStep = (slug) => {
    if (steps.some((s) => s.slug === slug)) navigate(`${basePath}/${slug}`);
  };

  const handleSubmitLead = async ({ name, email }) => {
    await insertLead({ funnelId: funnel.id, stepId: currentStep.id, name, email });
  };

  const handleMonerooCheckout = async ({ paymentMethodId, blockId, planIndex, customerEmail, customerName, orderBumpTaken }) => {
    const { checkoutUrl } = await createMonerooCheckout({
      funnelId: funnel.id,
      stepId: currentStep.id,
      paymentMethodId,
      blockId,
      planIndex,
      customerEmail,
      customerName,
      orderBumpTaken,
      returnUrl: window.location.href,
    });
    window.location.href = checkoutUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-2xl font-sans font-bold text-surface mb-2">Cette page n'existe pas</h1>
        <p className="text-surface/60 mb-6">Le tunnel demandé est introuvable ou n'est plus publié.</p>
        <Link to="/" className="text-accent font-semibold hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const chrome = currentStep?.chrome || {};

  return (
    <div className="min-h-screen bg-background text-surface font-sans" style={brandStyleVars(funnel.brand)}>
      <CountdownBar config={chrome.countdownBar} />
      <div className={`max-w-4xl mx-auto py-8 space-y-6 ${chrome.stickyFooterCta?.enabled ? 'pb-24' : ''}`}>
        {funnel.brand?.logoUrl && (
          <img src={funnel.brand.logoUrl} alt={funnel.name} className="h-10 mx-auto object-contain" />
        )}
        {blocks.map((block, i) => (
          <BlockRenderer
            key={block.id}
            block={block}
            onAdvance={handleAdvance}
            onSubmitLead={handleSubmitLead}
            onMonerooCheckout={handleMonerooCheckout}
            defaultBg={i % 2 === 0 ? 'primary' : 'primary-alt'}
            siblingSteps={steps}
            onNavigateToStep={handleNavigateToStep}
            currentStepSlug={currentStep?.slug}
          />
        ))}
      </div>
      {funnel.show_branding && (
        <footer className="text-center py-8 text-xs text-surface/30">
          Propulsé par <Link to="/" className="text-accent hover:underline">TonTunnel</Link>
        </footer>
      )}
      <PurchaseNotification config={chrome.purchaseNotification} liftForFooter={Boolean(chrome.stickyFooterCta?.enabled)} />
      <StickyFooterCta config={chrome.stickyFooterCta} onNavigateToStep={handleNavigateToStep} onAdvance={handleAdvance} />
      <ExitIntentPopup config={chrome.exitIntent} onNavigateToStep={handleNavigateToStep} onAdvance={handleAdvance} />
      {paymentStatus && (
        <PaymentConfirmationOverlay status={paymentStatus} onDismiss={() => setPaymentStatus(null)} />
      )}
    </div>
  );
}
