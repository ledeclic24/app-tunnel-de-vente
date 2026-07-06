import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchFunnelBySlug, fetchSteps, fetchBlocks, insertLead, incrementStepView } from '../../lib/funnelsApi';
import { brandStyleVars } from '../../lib/colorUtils';
import BlockRenderer from '../../components/blocks/BlockRenderer';

export default function PublishedFunnelPage() {
  const { funnelSlug, stepSlug } = useParams();
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

  const handleAdvance = () => {
    const idx = steps.findIndex((s) => s.id === currentStep?.id);
    const next = steps[idx + 1];
    if (next) navigate(`/f/${funnelSlug}/${next.slug}`);
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
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} onAdvance={handleAdvance} onSubmitLead={handleSubmitLead} />
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
