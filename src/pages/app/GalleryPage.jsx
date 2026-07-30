import React, { useEffect, useState } from 'react';
import { ExternalLink, Lock, Sparkles } from 'lucide-react';
import { fetchGalleryFunnels } from '../../lib/funnelsApi';
import { CATEGORIES, getCategory } from '../../lib/funnelTemplates';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import Spinner from '../../components/app/Spinner';

export default function GalleryPage() {
  const { effectiveProfile } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);
  const [funnels, setFunnels] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!plan.gallery) return;
    setFunnels(null);
    fetchGalleryFunnels(activeCategory || undefined)
      .then(setFunnels)
      .catch(() => { setFunnels([]); setError("Impossible de charger la galerie pour l'instant."); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  if (!plan.gallery) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Lock className="w-10 h-10 text-surface/30 mx-auto mb-4" />
        <h1 className="text-xl font-sans font-bold text-surface mb-2">La galerie d'inspiration est réservée aux plans Pro et Entreprise</h1>
        <p className="text-surface/60">Parcours des tunnels réels publiés par d'autres créateurs pour t'inspirer avant de démarrer le tien.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
        <Sparkles className="w-3.5 h-3.5" /> Galerie d'inspiration
      </div>
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Des tunnels créés par la communauté</h1>
      <p className="text-surface/60 mb-6 max-w-2xl">
        Des tunnels réels, publiés par d'autres créateurs qui ont accepté de les partager pour inspirer les débutants. Aucune information sur leur propriétaire n'est affichée.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
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
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {funnels === null && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {funnels && funnels.length === 0 && !error && (
        <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
          <p className="text-surface/60">Aucun tunnel dans la galerie pour l'instant{activeCategory ? ' dans cette catégorie' : ''}.</p>
        </div>
      )}

      {funnels && funnels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {funnels.map((f) => {
            const cat = getCategory(f.category);
            const primary = f.brand?.primaryColor || '#0B2818';
            const accent = f.brand?.accentColor || '#22C55E';
            return (
              <a
                key={f.id}
                href={`/f/${f.slug}`}
                target="_blank"
                rel="noreferrer"
                className="hover-card bg-background border border-surface/10 rounded-[2rem] overflow-hidden shadow-soft flex flex-col"
              >
                <div className="h-24 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }}>
                  <cat.icon className="w-7 h-7 text-white/80" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-surface/40 mb-1">{cat.label}</span>
                  <h3 className="font-sans font-semibold text-surface mb-3">{f.name}</h3>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                    Voir le tunnel <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
