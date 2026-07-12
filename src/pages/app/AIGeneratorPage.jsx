import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Lock, Wand2, SlidersHorizontal, ArrowRight } from 'lucide-react';
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

function Bubble({ role, children }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? 'bg-primary text-background rounded-br-sm' : 'bg-background border border-surface/10 text-surface rounded-bl-sm'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function AIGeneratorPage() {
  const { effectiveOwnerId, effectiveProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const plan = getPlan(effectiveProfile?.plan);

  const [name, setName] = useState('');
  const [categoryKey, setCategoryKey] = useState('');
  const [cible, setCible] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [customPalette, setCustomPalette] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#0B2818');
  const [accentColor, setAccentColor] = useState('#22C55E');
  const [showOptions, setShowOptions] = useState(false);

  const [usage, setUsage] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Décrivez votre offre (ce que vous vendez, le public visé, ce qui la rend unique) et je construis un tunnel complet — textes, pages et couleurs inclus.' },
  ]);
  const [brief, setBrief] = useState('');
  const [draftFunnel, setDraftFunnel] = useState(null);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (effectiveOwnerId && plan.aiAccess) fetchAIUsageThisMonth(effectiveOwnerId).then(setUsage).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveOwnerId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, generating]);

  // Pré-remplissage quand on arrive depuis "Créer un tunnel pour cet ebook"
  // (EbookEditorPage) — l'utilisateur garde la main pour ajuster le brief
  // et cliquer Envoyer lui-même, aucune génération n'est déclenchée ici.
  useEffect(() => {
    const fromEbook = location.state?.fromEbook;
    if (!fromEbook) return;
    setName(fromEbook.title || '');
    if (fromEbook.coverImageUrl) setImages([fromEbook.coverImageUrl]);
    if (fromEbook.brand?.primaryColor || fromEbook.brand?.accentColor) {
      setCustomPalette(true);
      if (fromEbook.brand.primaryColor) setPrimaryColor(fromEbook.brand.primaryColor);
      if (fromEbook.brand.accentColor) setAccentColor(fromEbook.brand.accentColor);
    }
    setShowOptions(true);
    const chapterLines = (fromEbook.chapters || []).map((c) => `- ${c.title}`).join('\n');
    setInput(
      `Crée un tunnel de vente adapté pour promouvoir et vendre l'ebook "${fromEbook.title}"${fromEbook.subtitle ? ` — ${fromEbook.subtitle}` : ''}.\n\nChapitres de l'ebook :\n${chapterLines}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!plan.aiAccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Lock className="w-10 h-10 text-surface/30 mx-auto mb-4" />
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Le copilote IA est réservé aux plans Pro et Entreprise</h1>
        <p className="text-surface/60 mb-6">Décrivez votre offre, l'IA construit votre tunnel à votre place — textes, mise en page et palette inclus.</p>
        <Link to="/app/billing" className="magnetic-btn inline-flex bg-accent text-background px-6 py-3 rounded-full font-semibold">
          Voir les offres
        </Link>
      </div>
    );
  }

  const remaining = plan.aiMonthlyLimit === Infinity || usage === null ? null : Math.max(plan.aiMonthlyLimit - usage, 0);
  const atLimit = remaining !== null && remaining <= 0;
  const categoryLabel = categoryKey ? CATEGORIES.find((c) => c.key === categoryKey)?.label || '' : '';

  const runGeneration = async (nextBrief) => {
    setGenerating(true);
    setError('');
    try {
      const generatedFunnel = await generateTunnelWithAI({
        description: nextBrief,
        category: categoryLabel,
        categoryKey,
        cible: cible.trim(),
        images,
        price: price.trim(),
        paletteHint: customPalette ? `couleur principale ${primaryColor}, couleur d'accent ${accentColor}` : '',
      });
      setDraftFunnel(generatedFunnel);
      const stepCount = generatedFunnel.steps?.length || 0;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `C'est fait — ${stepCount} étape${stepCount > 1 ? 's' : ''} générée${stepCount > 1 ? 's' : ''}${price.trim() ? `, avec le prix ${price.trim()} repris tel quel` : ''}. Vous pouvez ouvrir le tunnel pour le voir, ou m'écrire ce que vous voulez ajuster (ex. « rends le titre plus percutant »).`,
        },
      ]);
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error);
      setMessages((prev) => [...prev, { role: 'assistant', text: "Je n'ai pas réussi à générer le tunnel. " + (ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error) }]);
    }
    setGenerating(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || generating || atLimit || !name.trim()) return;
    const message = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: message }]);

    const nextBrief = draftFunnel ? `${brief}\n\nAjustement demandé : ${message}` : message;
    setBrief(nextBrief);
    await runGeneration(nextBrief);
  };

  const handleOpenInEditor = async () => {
    if (!draftFunnel || saving) return;
    setSaving(true);
    setError('');
    try {
      const funnel = await createFunnelFromAI({
        userId: effectiveOwnerId,
        name: name.trim(),
        generatedFunnel: draftFunnel,
        showBranding: plan.showBranding,
        category: categoryKey || 'personnalise',
      });
      navigate(`/app/funnels/${funnel.id}/edit`);
    } catch (err) {
      setError(ERROR_MESSAGES.server_error);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/app/funnels/new" className="inline-flex items-center gap-2 text-sm text-surface/60 hover:text-surface mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour au choix de modèle
      </Link>

      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
        <Sparkles className="w-3.5 h-3.5" /> Copilote IA
      </div>
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Discutez avec le copilote pour construire votre tunnel</h1>
      {remaining !== null && (
        <p className="text-xs text-surface/40 mb-6 font-mono">{remaining} génération{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} ce mois-ci</p>
      )}
      {remaining === null && <div className="mb-6" />}

      <div className="bg-background border border-surface/10 rounded-[2rem] p-4 md:p-6 mb-4">
        <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Nom du tunnel</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Lancement de mon ebook"
          className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
        />
      </div>

      <div ref={scrollRef} className="bg-background border border-surface/10 rounded-[2rem] p-4 md:p-6 space-y-3 max-h-[420px] overflow-y-auto mb-4">
        {messages.map((m, i) => <Bubble key={i} role={m.role}>{m.text}</Bubble>)}
        {generating && (
          <Bubble role="assistant">
            <span className="inline-flex items-center gap-2 text-surface/60">
              <span className="w-3.5 h-3.5 border-2 border-surface/20 border-t-accent rounded-full animate-spin" /> Génération en cours…
            </span>
          </Bubble>
        )}
        {draftFunnel && !generating && (
          <div className="flex justify-start">
            <button
              onClick={handleOpenInEditor}
              disabled={saving || !name.trim()}
              className="magnetic-btn inline-flex items-center gap-2 bg-accent text-background px-4 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Ouverture...' : 'Ouvrir dans l\'éditeur'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {draftFunnel && !name.trim() && !generating && (
          <p className="text-xs text-red-500">Ajoutez un nom au tunnel ci-dessus pour pouvoir l'ouvrir dans l'éditeur.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowOptions((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold text-surface/50 hover:text-surface mb-3"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" /> Réglages avancés (catégorie, cible, prix, images, palette)
      </button>

      {showOptions && (
        <div className="bg-background border border-surface/10 rounded-[2rem] p-4 md:p-6 space-y-5 mb-4">
          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Type de tunnel (optionnel)</label>
            <select
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
              className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            >
              <option value="">Laisser l'IA choisir</option>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Cible / marché visé (optionnel)</label>
            <input
              value={cible}
              onChange={(e) => setCible(e.target.value)}
              placeholder="Ex : jeunes mamans débordées, entrepreneurs débutants..."
              className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            />
            <p className="text-xs text-surface/40 mt-1.5">Précise à qui s'adresse ton offre pour un ton et des exemples plus justes.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Prix de votre offre (optionnel)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex : 19 000 FCFA, 49€/mois, 29$..."
              className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            />
            <p className="text-xs text-surface/40 mt-1.5">Précisez-le pour que l'IA l'utilise partout où un prix est affiché, sans en inventer un autre.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Vos images (optionnel)</label>
            <MultiImageUpload userId={effectiveOwnerId} images={images} onChange={setImages} />
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
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
      {atLimit && <p className="text-sm text-red-500 mb-3">{ERROR_MESSAGES.limit_reached}</p>}
      {!name.trim() && <p className="text-xs text-surface/40 mb-3">Ajoutez un nom au tunnel ci-dessus avant de discuter avec le copilote.</p>}

      <form onSubmit={handleSend} className="flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={draftFunnel ? "Ex : rends le titre plus percutant" : "Ex : Je vends un ebook à 19 000 FCFA qui apprend aux débutants à cuisiner en 15 minutes..."}
          disabled={generating || atLimit || !name.trim()}
          className="flex-1 bg-background border border-surface/10 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || generating || atLimit || !name.trim()}
          className="magnetic-btn shrink-0 flex items-center justify-center gap-2 gradient-accent text-background w-12 h-12 rounded-full disabled:opacity-50"
          aria-label="Envoyer"
        >
          <Wand2 className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
