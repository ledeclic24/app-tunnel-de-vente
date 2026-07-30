import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Star, Eye } from 'lucide-react';
import { fetchTemplates, fetchTemplate, cloneTemplate } from '../../lib/templatesApi';
import { CATEGORIES, getCategory } from '../../lib/funnelTemplates';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import Spinner from '../../components/app/Spinner';
import SortMenu from '../../components/app/SortMenu';
import FunnelPreviewModal from '../../components/app/FunnelPreviewModal';
import { buildTemplatePreviewData } from '../../lib/templatePreview';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularité' },
  { value: 'created_desc', label: 'Plus récent' },
  { value: 'created_asc', label: 'Plus ancien' },
];

// 'popularity' laisse l'ordre déjà renvoyé par le serveur inchangé (voir
// TemplatesService.listApproved, orderBy usageCount DESC) — les deux
// autres options trient par date, entièrement côté client.
function sortTemplates(list, sortBy) {
  if (sortBy === 'popularity') return list;
  const dir = sortBy === 'created_desc' ? -1 : 1;
  return [...list].sort((a, b) => dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
}

export default function TemplatesMarketplacePage() {
  const { effectiveProfile } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [cloningId, setCloningId] = useState(null);
  const [sortBy, setSortBy] = useState('popularity');
  const [previewingId, setPreviewingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    setTemplates(null);
    const t = setTimeout(() => {
      fetchTemplates({ category: activeCategory || undefined, search: search.trim() || undefined })
        .then(setTemplates)
        .catch(() => { setTemplates([]); setError('Impossible de charger le marketplace pour l\'instant.'); });
    }, 300);
    return () => clearTimeout(t);
  }, [activeCategory, search]);

  const handleUse = async (template) => {
    if (cloningId) return;
    setCloningId(template.id);
    setError('');
    try {
      const funnel = await cloneTemplate(template.id, template.name, plan.showBranding);
      navigate(`/app/funnels/${funnel.id}/edit`);
    } catch {
      setError("Impossible d'utiliser ce modèle pour l'instant. Réessaie.");
      setCloningId(null);
    }
  };

  // listApproved (marketplace) ne renvoie qu'un jeu de colonnes réduit —
  // sans `content` — pour ne pas alourdir la liste ; le contenu complet
  // n'est chargé qu'à la demande, au clic sur "Aperçu".
  const handlePreview = async (template) => {
    if (previewingId) return;
    setPreviewingId(template.id);
    try {
      const full = await fetchTemplate(template.id);
      setPreviewTemplate(full);
    } catch {
      setError("Impossible de charger l'aperçu de ce modèle. Réessaie.");
    } finally {
      setPreviewingId(null);
    }
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
        <Store className="w-3.5 h-3.5" /> Marketplace de modèles
      </div>
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Démarre depuis un tunnel créé par la communauté</h1>
      <p className="text-surface/60 mb-6 max-w-2xl">
        Clone un modèle publié par un autre vendeur (validé par un administrateur) pour obtenir ta propre copie, modifiable immédiatement — jamais de lien de paiement d'un autre vendeur inclus.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('')}
          className={`hover-lift px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeCategory === '' ? 'bg-primary text-background' : 'bg-surface/5 text-surface/60'}`}
        >
          Toutes les catégories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`hover-lift px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeCategory === c.key ? 'bg-primary text-background' : 'bg-surface/5 text-surface/60'}`}
          >
            {c.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un modèle..."
          className="ml-auto bg-primary/5 border border-surface/10 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
        />
        <SortMenu value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {templates === null && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {templates && templates.length === 0 && !error && (
        <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
          <p className="text-surface/60">Aucun modèle disponible pour l'instant{activeCategory ? ' dans cette catégorie' : ''}.</p>
        </div>
      )}

      {templates && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortTemplates(templates, sortBy).map((t) => {
            const cat = getCategory(t.category);
            return (
              <div key={t.id} className={`hover-card bg-background border rounded-[2rem] overflow-hidden shadow-soft flex flex-col ${t.featured ? 'border-accent/40' : 'border-surface/10'}`}>
                <div className="h-24 flex items-center justify-center bg-primary/5 relative">
                  <cat.icon className="w-7 h-7 text-accent/70" />
                  {t.featured && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-accent text-background px-2.5 py-1 rounded-full text-[10px] font-semibold">
                      <Star className="w-3 h-3 fill-background" /> Recommandé
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-surface/40 mb-1">{cat.label}</span>
                  <h3 className="font-sans font-semibold text-surface mb-1">{t.name}</h3>
                  {t.description && <p className="text-sm text-surface/60 mb-3 line-clamp-2">{t.description}</p>}
                  <p className="text-xs text-surface/40 mb-4">{t.usage_count} utilisation{t.usage_count > 1 ? 's' : ''}</p>
                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => handlePreview(t)}
                      disabled={previewingId === t.id}
                      className="hover-lift inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full text-sm font-semibold border border-surface/10 text-surface/70 disabled:opacity-50 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" /> {previewingId === t.id ? '...' : 'Aperçu'}
                    </button>
                    <button
                      onClick={() => handleUse(t)}
                      disabled={cloningId === t.id}
                      className="magnetic-btn flex-1 inline-flex items-center justify-center gap-2 bg-accent text-background px-4 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50 min-w-0"
                    >
                      {cloningId === t.id ? 'Création...' : 'Utiliser'} <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewTemplate && (
        <FunnelPreviewModal
          {...buildTemplatePreviewData(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
