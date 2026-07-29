import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Lock, Wand2, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { CATEGORIES } from '../../lib/funnelTemplates';
import { generateTunnelWithAI } from '../../lib/aiApi';
import { fetchCreditsBalance, fetchCreditCosts } from '../../lib/creditsApi';
import { createFunnelFromAI, updateFunnel } from '../../lib/funnelsApi';
import MultiImageUpload from '../../components/app/MultiImageUpload';
import { useToast } from '../../components/app/Toast';
import RechargeCreditsButton from '../../components/app/RechargeCreditsButton';

const ERROR_MESSAGES = {
  plan_required: "La génération par IA nécessite le plan Pro ou Entreprise.",
  insufficient_credits: "Crédits IA insuffisants pour cette action. Achète un pack ou passe au plan supérieur depuis la page Facturation.",
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
  const [priceMode, setPriceMode] = useState(''); // 'fixed' | 'free' | 'flexible'
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [testimonialText, setTestimonialText] = useState('');
  const [testimonialScreenshots, setTestimonialScreenshots] = useState([]);
  const [customPalette, setCustomPalette] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#0B0B0B');
  const [accentColor, setAccentColor] = useState('#D4AF37');
  const [showOptions, setShowOptions] = useState(false);

  const [credits, setCredits] = useState(null);
  const [costs, setCosts] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Décrivez votre offre (ce que vous vendez, le public visé, ce qui la rend unique) et je construis un tunnel complet — textes, pages et couleurs inclus.' },
  ]);
  const [brief, setBrief] = useState('');
  const [draftFunnel, setDraftFunnel] = useState(null);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [sourceEbookId, setSourceEbookId] = useState(null);
  const scrollRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (effectiveOwnerId && plan.aiAccess) fetchCreditsBalance().then(setCredits).catch(() => {});
    if (plan.aiAccess) fetchCreditCosts().then(setCosts).catch(() => {});
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
    setSourceEbookId(fromEbook.id || null);
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

  const atLimit = credits !== null && credits.balance <= 0;
  const selectedCategory = categoryKey ? CATEGORIES.find((c) => c.key === categoryKey) : null;
  const categoryLabel = selectedCategory?.label || '';
  const priceRequired = Boolean(selectedCategory?.pricingRequired);
  const effectivePrice = priceMode === 'free'
    ? 'Gratuit'
    : priceMode === 'flexible'
      ? 'Prix libre — le client choisit son montant'
      : price.trim();
  const priceMissing = priceRequired && (!priceMode || (priceMode === 'fixed' && !price.trim()));

  const runGeneration = async (nextBrief) => {
    setGenerating(true);
    setError('');
    setErrorCode('');
    try {
      const generatedFunnel = await generateTunnelWithAI({
        description: nextBrief,
        category: categoryLabel,
        categoryKey,
        cible: cible.trim(),
        images,
        price: effectivePrice,
        paletteHint: customPalette ? `couleur principale ${primaryColor}, couleur d'accent ${accentColor}` : '',
        testimonialText: testimonialText.trim(),
        testimonialScreenshots,
      });
      setDraftFunnel(generatedFunnel);
      const stepCount = generatedFunnel.steps?.length || 0;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `C'est fait — ${stepCount} étape${stepCount > 1 ? 's' : ''} générée${stepCount > 1 ? 's' : ''}${effectivePrice ? `, avec le prix ${effectivePrice} repris tel quel` : ''}. Vous pouvez ouvrir le tunnel pour le voir, ou m'écrire ce que vous voulez ajuster (ex. « rends le titre plus percutant »).`,
        },
      ]);
      toast.success('Tunnel généré avec succès.');
    } catch (err) {
      const message = ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error;
      setError(message);
      setErrorCode(err.message);
      setMessages((prev) => [...prev, { role: 'assistant', text: "Je n'ai pas réussi à générer le tunnel. " + message }]);
      toast.error(message);
    }
    setGenerating(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || generating || atLimit || !name.trim()) return;
    if (priceMissing) {
      setShowOptions(true);
      setError('Indique le prix de ton offre avant de générer ce type de tunnel.');
      return;
    }
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
      // Tunnel créé depuis "Créer un tunnel pour cet ebook" (EbookEditorPage) :
      // relie automatiquement CET ebook comme livrable — sans ça, le champ
      // resterait vide et bloquerait la publication (voir FunnelsService.
      // publish) alors que le choix était évident dès le départ. Best effort :
      // un échec ici ne doit jamais empêcher d'arriver dans l'éditeur, le
      // vendeur peut toujours le régler à la main dans Réglages.
      if (sourceEbookId) {
        updateFunnel(funnel.id, { deliverable_ebook_id: sourceEbookId }).catch(() => {});
      }
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
      {credits !== null ? (
        <p className="text-xs text-surface/40 mb-6 font-mono">
          {credits.balance} crédit{credits.balance > 1 ? 's' : ''} IA disponible{credits.balance > 1 ? 's' : ''}
          {' · '}<Link to="/app/billing" className="underline hover:text-surface/70">en acheter plus</Link>
          {costs && <> · Génération : {costs.TUNNEL_GENERATION} crédits, modification : {costs.TUNNEL_EDIT} crédits</>}
        </p>
      ) : (
        <div className="mb-6" />
      )}

      <div className="bg-background border border-surface/10 rounded-[2rem] p-4 md:p-6 mb-4">
        <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Nom du tunnel</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Lancement de mon ebook"
          className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
        />
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

          {priceRequired ? (
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">
                Prix de votre offre (obligatoire pour ce type de tunnel)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { key: 'fixed', label: 'Prix fixe' },
                  { key: 'free', label: 'Gratuit' },
                  { key: 'flexible', label: 'Prix libre (le client choisit)' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPriceMode(opt.key)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
                      priceMode === opt.key
                        ? 'bg-accent text-background border-accent'
                        : 'bg-primary/5 text-surface/70 border-surface/10 hover:border-accent/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {priceMode === 'fixed' && (
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex : 19 000 FCFA, 49 000 FCFA/mois..."
                  className={`w-full bg-primary/5 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface ${priceMissing ? 'border-red-500' : 'border-surface/10'}`}
                />
              )}
              <p className={`text-xs mt-1.5 ${priceMissing ? 'text-red-500' : 'text-surface/40'}`}>
                {priceMissing
                  ? 'Choisis une modalité de prix (et son montant si "Prix fixe") avant de générer.'
                  : "Ce type de tunnel vend une offre : l'IA reprendra cette information exactement, sans jamais en inventer une autre."}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Prix de votre offre (optionnel)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex : 19 000 FCFA, 49 000 FCFA/mois..."
                className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
              />
              <p className="text-xs text-surface/40 mt-1.5">Précisez-le pour que l'IA l'utilise partout où un prix est affiché, sans en inventer un autre.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Preuves / témoignages clients réels (optionnel)</label>
            <textarea
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              placeholder="Colle ici de vrais avis reçus (ex : « Jean D. — Incroyable, j'ai... »), un par ligne ou séparés par un saut de ligne."
              rows={3}
              className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface resize-y"
            />
            <p className="text-xs text-surface/40 mt-1.5 mb-3">
              Uniquement de vrais avis — l'IA ne les modifie pas dans le fond, et n'en invente jamais si tu laisses ce champ vide.
            </p>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Captures d'écran de vrais avis (optionnel)</label>
            <MultiImageUpload userId={effectiveOwnerId} images={testimonialScreenshots} onChange={setTestimonialScreenshots} />
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

      {error && (
        <div className="text-sm text-red-500 mb-3">
          <p>{error}</p>
          {errorCode === 'insufficient_credits' && <RechargeCreditsButton className="mt-2" />}
        </div>
      )}
      {atLimit && (
        <div className="text-sm text-red-500 mb-3">
          <p>{ERROR_MESSAGES.insufficient_credits}</p>
          <RechargeCreditsButton className="mt-2" />
        </div>
      )}
      {!name.trim() && <p className="text-xs text-surface/40 mb-3">Ajoutez un nom au tunnel ci-dessus avant de discuter avec le copilote.</p>}
      {name.trim() && priceMissing && (
        <p className="text-xs text-red-500 mb-3">
          Indique le prix de ton offre dans les réglages avancés — ce type de tunnel ({categoryLabel}) affiche toujours un prix.
        </p>
      )}

      {/* Fil de discussion et champ de saisie réunis dans une seule carte :
          la barre de saisie est le composer de CE chat, pas un formulaire
          séparé — rien (réglages, erreurs) ne doit plus s'intercaler entre
          les deux. */}
      <div className="bg-background border border-surface/10 rounded-[2rem] overflow-hidden mb-4">
        <div ref={scrollRef} className="p-4 md:p-6 space-y-3 max-h-[420px] overflow-y-auto">
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

        <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-surface/10 p-3 md:p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={draftFunnel ? "Ex : rends le titre plus percutant" : "Ex : Je vends un ebook à 19 000 FCFA qui apprend aux débutants à cuisiner en 15 minutes..."}
            disabled={generating || atLimit || !name.trim() || priceMissing}
            className="flex-1 bg-primary/5 border border-surface/10 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || generating || atLimit || !name.trim() || priceMissing}
            className="magnetic-btn shrink-0 flex items-center justify-center gap-2 gradient-accent text-background w-12 h-12 rounded-full disabled:opacity-50"
            aria-label="Envoyer"
          >
            <Wand2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
