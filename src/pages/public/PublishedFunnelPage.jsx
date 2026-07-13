import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchFunnelBySlug, fetchSteps, fetchBlocks, insertLead, incrementStepView } from '../../lib/funnelsApi';
import { brandStyleVars } from '../../lib/colorUtils';
import BlockRenderer from '../../components/blocks/BlockRenderer';

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

export default function PublishedFunnelPage({ funnelSlugOverride } = {}) {
  const { funnelSlug: paramSlug, stepSlug } = useParams();
  const funnelSlug = funnelSlugOverride || paramSlug;
  // Domaine personnalisé (pas de préfixe /f/:slug dans l'URL) : la
  // navigation interne doit rester à la racine du domaine.
  const basePath = funnelSlugOverride ? '' : `/f/${funnelSlug}`;
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState(null);
  const [steps, setSteps] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const f = await fetchFunnelBySlug(funnelSlug);
      const s = await fetchSteps(f.id);
      const currentStep = stepSlug ? s.find((st) => st.slug === stepSlug) : s[0];
      if (!currentStep) { setNotFound(true); setLoading(false); return; }
      const b = await fetchBlocks(currentStep.id);
      setFunnel(f);
      setSteps(s);
      setBlocks(b);
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
      document.title = 'Vendeko — Crée ton tunnel de vente sans expertise';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnel, currentStep?.id, steps.length]);

  useAdPixels(funnel?.brand);

  const handleAdvance = () => {
    const idx = steps.findIndex((s) => s.id === currentStep?.id);
    const next = steps[idx + 1];
    if (next) navigate(`${basePath}/${next.slug}`);
  };

  const handleSubmitLead = async ({ name, email }) => {
    await insertLead({ funnelId: funnel.id, stepId: currentStep.id, name, email });
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

  return (
    <div className="min-h-screen bg-background text-surface font-sans" style={brandStyleVars(funnel.brand)}>
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {funnel.brand?.logoUrl && (
          <img src={funnel.brand.logoUrl} alt={funnel.name} className="h-10 mx-auto object-contain" />
        )}
        {blocks.map((block, i) => (
          <BlockRenderer
            key={block.id}
            block={block}
            onAdvance={handleAdvance}
            onSubmitLead={handleSubmitLead}
            defaultBg={i % 2 === 0 ? 'primary' : 'white'}
          />
        ))}
      </div>
      {funnel.show_branding && (
        <footer className="text-center py-8 text-xs text-surface/30">
          Propulsé par <Link to="/" className="text-accent hover:underline">Vendeko</Link>
        </footer>
      )}
    </div>
  );
}
