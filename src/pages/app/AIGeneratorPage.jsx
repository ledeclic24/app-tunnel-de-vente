import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Lock, Wand2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { CATEGORIES } from '../../lib/funnelTemplates';
import { generateTunnelWithAI, fetchAIUsageThisMonth } from '../../lib/aiApi';
import { createFunnelFromAI } from '../../lib/funnelsApi';
import MultiImageUpload from '../../components/app/MultiImageUpload';

const ERROR_MESSAGES = {
  plan_required: "La génération par IA nécessite le plan Pro ou Entreprise.",
  limit_reached: "Tu as atteint ta limite de générations IA ce mois-ci. Passe au plan Entreprise pour un accès illimité.",
  invalid_input: "Décris ton offre avec un peu plus de détails.",
  ai_error: "L'IA n'a pas pu répondre pour le moment. Réessaie dans quelques instants.",
  parse_error: "La génération a échoué. Réessaie avec une description un peu différente.",
  server_error: "Une erreur est survenue. Réessaie.",
};

export default function AIGeneratorPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const plan = getPlan(profile?.plan);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [customPalette, setCustomPalette] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#0B2818');
  const [accentColor, setAccentColor] = useState('#22C55E');
  const [usage, setUsage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile && plan.aiAccess) fetchAIUsageThisMonth(profile.id).then(setUsage).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (!plan.aiAccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Lock className="w-10 h-10 text-surface/30 mx-auto mb-4" />
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Génération par IA réservée aux plans Pro et Entreprise</h1>
        <p className="text-surface/60 mb-6">Décris ton offre, l'IA construit ton tunnel à ta place — textes, mise en page et palette inclus.</p>
        <Link to="/app/billing" className="magnetic-btn inline-flex bg-accent text-background px-6 py-3 rounded-full font-semibold">
          Voir les offres
        </Link>
      </div>
    );
  }

  const remaining = plan.aiMonthlyLimit === Infinity || usage === null ? null : Math.max(plan.aiMonthlyLimit - usage, 0);
  const atLimit = remaining !== null && remaining <= 0;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!name.trim() || description.trim().length < 5 || generating || atLimit) return;
    setGenerating(true);
    setError('');
    try {
      const generatedFunnel = await generateTunnelWithAI({
        description: description.trim(),
        category,
        images,
        price: price.trim(),
        paletteHint: customPalette ? `couleur principale ${primaryColor}, couleur d'accent ${accentColor}` : '',
      });
      const funnel = await createFunnelFromAI({
        userId: profile.id,
        name: name.trim(),
        generatedFunnel,
        showBranding: plan.showBranding,
      });
      navigate(`/app/funnels/${funnel.id}/edit`);
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error);
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/app/funnels/new" className="inline-flex items-center gap-2 text-sm text-surface/60 hover:text-surface mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour au choix de modèle
      </Link>

      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
        <Sparkles className="w-3.5 h-3.5" /> Génération par IA
      </div>
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Décris ton offre, l'IA construit ton tunnel</h1>
      <p className="text-surface/60 mb-2">
        Plus ta description est précise (offre, prix, public visé), meilleur sera le résultat. Tu pourras tout modifier ensuite, à la main ou avec l'IA.
      </p>
      {remaining !== null && (
        <p className="text-xs text-surface/40 mb-8 font-mono">{remaining} génération{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} ce mois-ci</p>
      )}
      {remaining === null && <div className="mb-8" />}

      <form onSubmit={handleGenerate} className="space-y-5 bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Nom du tunnel</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Lancement de mon ebook"
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Type de tunnel (optionnel)</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
          >
            <option value="">Laisser l'IA choisir</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.label}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Décris ton offre en détail</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Ex : Je vends un ebook à 19€ qui apprend aux débutants à cuisiner en 15 minutes. Mon public : parents pressés qui veulent manger sainement sans y passer des heures."
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Prix de ton offre (optionnel)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex : 19 000 FCFA, 49€/mois, 29$..."
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
          />
          <p className="text-xs text-surface/40 mt-1.5">Précise-le pour que l'IA l'utilise partout où un prix est affiché, sans en inventer un autre.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Tes images (optionnel)</label>
          <MultiImageUpload userId={profile?.id} images={images} onChange={setImages} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-surface/70 mb-3">
            <input type="checkbox" checked={customPalette} onChange={(e) => setCustomPalette(e.target.checked)} />
            Choisir ma propre palette de couleurs
          </label>
          {customPalette && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-surface/50 mb-1">Couleur principale</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-surface/10 cursor-pointer" />
                  <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 bg-primary/5 border border-surface/10 rounded-xl px-3 py-2 text-sm text-surface" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-surface/50 mb-1">Couleur d'accent</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border border-surface/10 cursor-pointer" />
                  <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 bg-primary/5 border border-surface/10 rounded-xl px-3 py-2 text-sm text-surface" />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {atLimit && !error && <p className="text-sm text-red-500">{ERROR_MESSAGES.limit_reached}</p>}

        <button
          type="submit"
          disabled={!name.trim() || description.trim().length < 5 || generating || atLimit}
          className="magnetic-btn w-full flex items-center justify-center gap-2 gradient-accent text-background px-6 py-4 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          <Wand2 className="w-4 h-4" />
          {generating ? 'Génération en cours...' : 'Générer mon tunnel'}
        </button>
      </form>
    </div>
  );
}
