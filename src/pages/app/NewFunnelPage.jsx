import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, Rocket, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFunnels, createFunnelFromTemplate } from '../../lib/funnelsApi';
import { getPlan } from '../../lib/plans';
import { CATEGORIES, getTemplatesByCategory } from '../../lib/funnelTemplates';

export default function NewFunnelPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [funnelCount, setFunnelCount] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const plan = getPlan(profile?.plan);
  const atLimit = funnelCount !== null && funnelCount >= plan.maxFunnels;

  useEffect(() => {
    if (!profile) return;
    fetchUserFunnels(profile.id).then((data) => setFunnelCount(data.length)).catch(() => setFunnelCount(0));
  }, [profile]);

  if (atLimit) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Rocket className="w-10 h-10 text-accent mx-auto mb-4" />
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Limite de ton plan atteinte</h1>
        <p className="text-surface/60 mb-6">
          Le plan {plan.name} permet {plan.maxFunnels} tunnel(s). Passe au plan Pro pour en créer sans limite.
        </p>
        <Link to="/app/billing" className="magnetic-btn inline-flex bg-accent text-background px-6 py-3 rounded-full font-semibold">
          Voir les offres
        </Link>
      </div>
    );
  }

  const isTemplateUnlocked = (tpl) => plan.templates.includes(tpl.key);
  const isCategoryUnlocked = (cat) => getTemplatesByCategory(cat.key).some(isTemplateUnlocked);

  const handleCreate = async () => {
    if (!name.trim() || !selectedTemplate) return;
    setCreating(true);
    setError('');
    try {
      const funnel = await createFunnelFromTemplate({
        userId: profile.id,
        name: name.trim(),
        templateKey: selectedTemplate,
        showBranding: plan.showBranding,
      });
      navigate(`/app/funnels/${funnel.id}/edit`);
    } catch (err) {
      setError("La création du tunnel a échoué. Réessaie.");
      setCreating(false);
    }
  };

  // ============ Step 1 : choisir une catégorie ============
  if (!selectedCategory) {
    return (
      <div className="max-w-5xl mx-auto">
        <Link to="/app" className="inline-flex items-center gap-2 text-sm text-surface/60 hover:text-surface mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        <h1 className="text-2xl font-sans font-bold text-surface mb-2">Quel type de tunnel veux-tu créer ?</h1>
        <p className="text-surface/60 mb-6">Choisis la catégorie qui correspond à ton besoin. Tu verras ensuite plusieurs modèles adaptés.</p>

        <Link
          to={plan.aiAccess ? '/app/funnels/ai' : '/app/billing'}
          className="relative flex items-center gap-4 p-6 rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/10 to-transparent mb-8 hover:border-accent/40 transition-colors"
        >
          <div className="w-11 h-11 rounded-full gradient-accent flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <div className="flex-1">
            <h3 className="font-sans font-semibold text-surface flex items-center gap-2">
              Générer mon tunnel avec l'IA
              {!plan.aiAccess && <Lock className="w-3.5 h-3.5 text-surface/40" />}
            </h3>
            <p className="text-sm text-surface/60">Décris ton offre, l'IA assemble pages, textes et palette pour toi.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-surface/40 shrink-0" />
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const unlocked = isCategoryUnlocked(cat);
            const count = getTemplatesByCategory(cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => (unlocked ? setSelectedCategory(cat.key) : navigate('/app/billing'))}
                className={`relative text-left p-6 rounded-[2rem] border transition-colors ${
                  unlocked ? 'border-surface/10 bg-background hover:border-accent/40' : 'border-surface/10 bg-surface/[0.02] opacity-60 hover:opacity-80'
                }`}
              >
                {!unlocked && (
                  <div className="absolute top-5 right-5 w-7 h-7 rounded-full bg-surface/10 flex items-center justify-center text-surface/50">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4 bg-surface/5 text-surface/60">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-semibold text-surface mb-1 pr-6">{cat.label}</h3>
                <p className="text-sm text-surface/60 mb-3">{cat.description}</p>
                <p className="text-xs text-surface/40 font-mono">{count} modèle{count > 1 ? 's' : ''}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ============ Step 2 : choisir un modèle dans la catégorie ============
  const category = CATEGORIES.find((c) => c.key === selectedCategory);
  const templates = getTemplatesByCategory(selectedCategory);

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => { setSelectedCategory(null); setSelectedTemplate(null); }}
        className="inline-flex items-center gap-2 text-sm text-surface/60 hover:text-surface mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Choisir une autre catégorie
      </button>

      <h1 className="text-2xl font-sans font-bold text-surface mb-2">{category.label}</h1>
      <p className="text-surface/60 mb-8">
        Choisis le modèle qui te convient le mieux, tu pourras tout modifier ensuite.
        {templates.some((t) => !isTemplateUnlocked(t)) && (
          <> Les modèles <Lock className="w-3 h-3 inline -mt-0.5" /> se débloquent avec le plan Pro.</>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {templates.map((tpl) => {
          const isSelected = selectedTemplate === tpl.key;
          const unlocked = isTemplateUnlocked(tpl);
          return (
            <button
              key={tpl.key}
              onClick={() => (unlocked ? setSelectedTemplate(tpl.key) : navigate('/app/billing'))}
              className={`relative text-left p-6 rounded-[2rem] border transition-colors ${
                isSelected ? 'border-accent bg-accent/5' : unlocked ? 'border-surface/10 bg-background hover:border-surface/30' : 'border-surface/10 bg-surface/[0.02] opacity-60 hover:opacity-80'
              }`}
            >
              {!unlocked && (
                <div className="absolute top-5 right-5 w-7 h-7 rounded-full bg-surface/10 flex items-center justify-center text-surface/50">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
              <h3 className="font-sans font-semibold text-surface mb-1 pr-6">{tpl.name}</h3>
              <p className="text-sm text-surface/60">{tpl.description}</p>
              <p className="text-xs text-surface/40 font-mono mt-3">{tpl.steps.length} page(s)</p>
            </button>
          );
        })}
      </div>

      {selectedTemplate && (
        <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Nom de ton tunnel</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Lancement de mon ebook"
              className="flex-1 bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            />
            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="magnetic-btn btn-fill-slide group relative bg-accent text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {creating ? 'Création...' : 'Créer le tunnel'}
                {!creating && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
              <div className="fill-layer bg-white/30 rounded-xl"></div>
            </button>
          </div>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>
      )}
    </div>
  );
}
