import React, { useEffect, useState } from 'react';
import { ImageIcon, Lock, Sparkles, Copy, Check, Wand2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { generateImages, fetchImageUsageThisMonth } from '../../lib/imagesApi';

// Le moteur de génération créative est prêt côté serveur mais attend une clé
// API fournisseur (image) — passer à false dès qu'elle est configurée pour
// réactiver la page normalement.
const COMING_SOON = true;

const ERROR_MESSAGES = {
  plan_required: "La génération d'images nécessite le plan Pro ou Entreprise.",
  limit_reached: "Tu as atteint ta limite de générations d'images ce mois-ci.",
  invalid_input: 'Décris un peu plus ce que tu veux obtenir.',
  ai_error: "Le générateur d'images n'a pas pu répondre. Réessaie dans quelques instants.",
  parse_error: "La génération a échoué. Réessaie avec une description différente.",
  server_error: 'Une erreur est survenue. Réessaie.',
};

const SIZES = [
  { key: '1024x1024', label: 'Carré' },
  { key: '1536x1024', label: 'Paysage' },
  { key: '1024x1536', label: 'Portrait' },
];

function CopyUrlButton({ url }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/70 text-background text-xs font-medium opacity-0 group-hover/img:opacity-100 transition-opacity"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copié' : "Copier l'URL"}
    </button>
  );
}

export default function ImageStudioPage() {
  const { effectiveProfile } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);

  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [count, setCount] = useState(1);
  const [images, setImages] = useState([]);
  const [usage, setUsage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (COMING_SOON || !plan.imageGeneration) return;
    fetchImageUsageThisMonth().then(setUsage).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (COMING_SOON) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
          <ImageIcon className="w-7 h-7 text-accent" />
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent/10 text-accent mb-4">
          <Sparkles className="w-3 h-3" /> Bientôt disponible
        </span>
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Génère tes visuels directement dans Vendeko</h1>
        <p className="text-surface/60">
          Images d'illustration et d'arrière-plan générées par IA, réutilisables directement dans tes tunnels — en cours de finalisation.
        </p>
      </div>
    );
  }

  if (!plan.imageGeneration) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Lock className="w-10 h-10 text-surface/30 mx-auto mb-4" />
        <h1 className="text-xl font-sans font-bold text-surface mb-2">La génération d'images est réservée aux plans Pro et Entreprise</h1>
        <p className="text-surface/60">Décris le visuel que tu veux, l'IA le génère pour toi — prêt à utiliser dans tes tunnels.</p>
      </div>
    );
  }

  const remaining = plan.imageGenerationMonthlyLimit === Infinity || usage === null
    ? null : Math.max(plan.imageGenerationMonthlyLimit - usage, 0);
  const atLimit = remaining !== null && remaining <= 0;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || generating || atLimit) return;
    setGenerating(true);
    setError('');
    try {
      const urls = await generateImages({ prompt: prompt.trim(), size, n: count });
      setImages((prev) => [...urls, ...prev]);
      setUsage((u) => (u === null ? null : u + urls.length));
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error);
    }
    setGenerating(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
        <ImageIcon className="w-3.5 h-3.5" /> Studio visuel IA
      </div>
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Génère des images pour tes tunnels</h1>
      {remaining !== null && (
        <p className="text-xs text-surface/40 mb-6 font-mono">{remaining} génération{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} ce mois-ci</p>
      )}
      {remaining === null && <div className="mb-6" />}

      <form onSubmit={handleGenerate} className="bg-background border border-surface/10 rounded-[2rem] p-4 md:p-6 space-y-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Décris le visuel voulu</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Ex : arrière-plan chaleureux pour une offre de coaching bien-être, tons pastel, ambiance sereine"
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Format</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface">
              {SIZES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Variantes</label>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface">
              {[1, 2, 4].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {atLimit && <p className="text-sm text-red-500">{ERROR_MESSAGES.limit_reached}</p>}
        <button
          type="submit"
          disabled={!prompt.trim() || generating || atLimit}
          className="magnetic-btn inline-flex items-center gap-2 bg-accent text-background px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-50"
        >
          <Wand2 className="w-4 h-4" /> {generating ? 'Génération...' : 'Générer'}
        </button>
      </form>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, i) => (
            <div key={url + i} className="relative group/img rounded-[1.5rem] overflow-hidden border border-surface/10">
              <img src={url} alt="Visuel généré" className="w-full h-full object-cover" />
              <CopyUrlButton url={url} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
