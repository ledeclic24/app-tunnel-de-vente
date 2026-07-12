import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Plus, Trash2, Wand2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { fetchEbooks, generateOutline, deleteEbook } from '../../lib/ebooksApi';

const ERROR_MESSAGES = {
  plan_required: "Le générateur d'ebook nécessite le plan Pro ou Entreprise.",
  limit_reached: 'Tu as atteint ta limite de générations ce mois-ci.',
  invalid_input: 'Précise un peu plus le titre et le sujet de ton ebook.',
  ai_error: "L'IA n'a pas pu répondre pour le moment. Réessaie dans quelques instants.",
  parse_error: 'La génération a échoué. Réessaie avec une description différente.',
  server_error: 'Une erreur est survenue. Réessaie.',
};

const TONES = [
  { key: 'pro', label: 'Professionnel' },
  { key: 'storytelling', label: 'Storytelling' },
  { key: 'direct', label: 'Direct' },
];

const LANGUAGES = [
  { key: 'fr', label: 'Français' },
  { key: 'en', label: 'Anglais' },
];

const LENGTHS = [
  { key: 'short', label: 'Court', hint: '6-9 chapitres, ~20-35 pages' },
  { key: 'medium', label: 'Moyen', hint: '14-20 chapitres, ~45-70 pages' },
  { key: 'long', label: 'Long', hint: '20-28 chapitres, ~70-110 pages' },
];

export default function EbooksPage() {
  const { effectiveProfile } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);
  const navigate = useNavigate();

  const [ebooks, setEbooks] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('pro');
  const [language, setLanguage] = useState('fr');
  const [length, setLength] = useState('medium');
  const [customBrand, setCustomBrand] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#0B2818');
  const [accentColor, setAccentColor] = useState('#22C55E');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!plan.ebookAccess) return;
    fetchEbooks().then(setEbooks).catch(() => setEbooks([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!plan.ebookAccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Lock className="w-10 h-10 text-surface/30 mx-auto mb-4" />
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Le générateur d'ebook est réservé aux plans Pro et Entreprise</h1>
        <p className="text-surface/60">Couverture, sommaire et chapitres générés par IA, exportables en PDF — utilisables comme aimant dans tes tunnels.</p>
      </div>
    );
  }

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || generating) return;
    setGenerating(true);
    setError('');
    try {
      const { ebook } = await generateOutline({
        title: title.trim(),
        description: description.trim(),
        tone,
        language,
        length,
        brand: customBrand ? { primaryColor, accentColor } : undefined,
      });
      navigate(`/app/ebooks/${ebook.id}`);
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error);
    }
    setGenerating(false);
  };

  const handleDelete = async (ebook) => {
    if (!window.confirm(`Supprimer "${ebook.title}" ?`)) return;
    await deleteEbook(ebook.id);
    setEbooks((prev) => prev.filter((e) => e.id !== ebook.id));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Ebooks
          </div>
          <h1 className="text-2xl font-sans font-bold text-surface">Tes ebooks</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="magnetic-btn inline-flex items-center gap-2 bg-accent text-background px-4 py-2.5 rounded-full text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Nouvel ebook
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGenerate} className="bg-background border border-surface/10 rounded-[2rem] p-4 md:p-6 space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Titre de l'ebook</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Les 7 clés pour lancer ton activité de coaching"
              className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Sujet / description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Décris ce que l'ebook doit couvrir et pour qui il est écrit"
              className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Ton d'écriture</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTone(t.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${tone === t.key ? 'bg-primary text-background' : 'bg-primary/5 text-surface/60'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Langue</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => setLanguage(l.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${language === l.key ? 'bg-primary text-background' : 'bg-primary/5 text-surface/60'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Longueur</label>
            <div className="flex flex-wrap gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setLength(l.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${length === l.key ? 'bg-primary text-background' : 'bg-primary/5 text-surface/60'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-surface/70 mb-2">
              <input type="checkbox" checked={customBrand} onChange={(e) => setCustomBrand(e.target.checked)} />
              Choisir mes couleurs
            </label>
            {customBrand && (
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

          <p className="text-xs text-surface/40">
            Sommaire complet garanti : introduction, {LENGTHS.find((l) => l.key === length)?.hint}, conclusion.
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!title.trim() || !description.trim() || generating}
            className="magnetic-btn inline-flex items-center gap-2 bg-accent text-background px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" /> {generating ? 'Génération du sommaire...' : 'Générer le sommaire'}
          </button>
        </form>
      )}

      {ebooks === null && <p className="text-sm text-surface/40">Chargement...</p>}
      {ebooks?.length === 0 && !showForm && (
        <p className="text-sm text-surface/40 text-center py-12">Aucun ebook pour l'instant. Crée le premier avec le bouton ci-dessus.</p>
      )}

      <div className="space-y-3">
        {ebooks?.map((ebook) => (
          <div key={ebook.id} className="flex items-center justify-between bg-background border border-surface/10 rounded-2xl px-5 py-4">
            <button onClick={() => navigate(`/app/ebooks/${ebook.id}`)} className="text-left flex-1 min-w-0">
              <p className="font-semibold text-surface truncate">{ebook.title}</p>
              {ebook.subtitle && <p className="text-sm text-surface/50 truncate">{ebook.subtitle}</p>}
            </button>
            <button onClick={() => handleDelete(ebook)} className="p-2 rounded-lg text-surface/30 hover:text-red-500 shrink-0" aria-label="Supprimer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
