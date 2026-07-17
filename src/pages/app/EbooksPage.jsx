import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, BookOpenText, Lock, Plus, Trash2, Wand2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { fetchEbooks, generateOutline, deleteEbook } from '../../lib/ebooksApi';
import { generateImages } from '../../lib/imagesApi';
import ImageUploadField from '../../components/blocks/ImageUploadField';
import DownloadMenu from '../../components/app/DownloadMenu';
import { useConfirm } from '../../components/app/ConfirmDialog';
import { useToast } from '../../components/app/Toast';

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

// Les langues africaines sont moins bien couvertes par les modèles IA que
// le français/anglais — `hint` le signale honnêtement plutôt que de le
// cacher à l'utilisateur (retour explicite demandé côté contenu généré).
const LANGUAGES = [
  { key: 'fr', label: 'Français' },
  { key: 'en', label: 'Anglais' },
  { key: 'sw', label: 'Swahili' },
  { key: 'ha', label: 'Haoussa' },
  { key: 'yo', label: 'Yoruba' },
  { key: 'am', label: 'Amharique' },
  { key: 'wo', label: 'Wolof', hint: 'qualité de rédaction IA plus limitée' },
  { key: 'ln', label: 'Lingala', hint: 'qualité de rédaction IA plus limitée' },
  { key: 'bm', label: 'Bambara', hint: 'qualité de rédaction IA plus limitée' },
];

// Les 3 presets restent des raccourcis pratiques mais renseignent
// désormais un nombre de chapitres précis et modifiable (chapterCount),
// plutôt qu'un preset fixe côté serveur.
const LENGTH_PRESETS = [
  { key: 'short', label: 'Court', chapterCount: 8, hint: '~8 chapitres, ~20-35 pages' },
  { key: 'medium', label: 'Moyen', chapterCount: 17, hint: '~17 chapitres, ~45-70 pages' },
  { key: 'long', label: 'Long', chapterCount: 24, hint: '~24 chapitres, ~70-110 pages' },
];

export default function EbooksPage() {
  const { effectiveProfile, effectiveOwnerId } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);
  const navigate = useNavigate();

  const [ebooks, setEbooks] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('pro');
  const [language, setLanguage] = useState('fr');
  const [chapterCount, setChapterCount] = useState(17);
  const [targetAudience, setTargetAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [avoid, setAvoid] = useState('');
  const [examples, setExamples] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0B2818');
  const [accentColor, setAccentColor] = useState('#22C55E');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverIsGenerated, setCoverIsGenerated] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

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

  const handleGenerateCover = async () => {
    if (!title.trim() || generatingCover) return;
    setGeneratingCover(true);
    setError('');
    try {
      const [image] = await generateImages({
        prompt: `Couverture d'ebook : "${title.trim()}".${description.trim() ? ` Sujet : ${description.trim().slice(0, 200)}` : ''}`,
        imageType: 'ebook-cover',
        size: '1024x1536',
        n: 1,
      });
      setCoverUrl(image.url);
      setCoverIsGenerated(true);
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error);
    }
    setGeneratingCover(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || generating) return;
    setGenerating(true);
    setError('');
    try {
      const { ebook } = await generateOutline({
        title: title.trim(),
        description: description.trim(),
        subtitle: subtitle.trim() || undefined,
        authorName: authorName.trim() || undefined,
        tone,
        language,
        chapterCount,
        targetAudience: targetAudience.trim() || undefined,
        goal: goal.trim() || undefined,
        keyPoints: keyPoints.trim() || undefined,
        callToAction: callToAction.trim() || undefined,
        avoid: avoid.trim() || undefined,
        examples: examples.trim() || undefined,
        brand: { primaryColor, accentColor },
        coverImageUrl: coverUrl || undefined,
        coverIsGenerated: coverUrl ? coverIsGenerated : undefined,
      });
      navigate(`/app/ebooks/${ebook.id}`);
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error);
    }
    setGenerating(false);
  };

  const handleDelete = async (ebook) => {
    if (!(await confirm(`Supprimer "${ebook.title}" ?`))) return;
    await deleteEbook(ebook.id);
    setEbooks((prev) => prev.filter((e) => e.id !== ebook.id));
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(ebook.id); return next; });
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!(await confirm(`Supprimer ${selectedIds.size} ebook${selectedIds.size > 1 ? 's' : ''} ?`))) return;
    setBulkBusy(true);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteEbook(id);
        setEbooks((prev) => prev.filter((e) => e.id !== id));
      } catch {
        toast.error('Une suppression a échoué. Les autres ebooks sélectionnés ont été traités.');
        break;
      }
    }
    setSelectedIds(new Set());
    setBulkBusy(false);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Sous-titre (optionnel)</label>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="L'IA en proposera un si laissé vide"
                className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Nom de l'auteur</label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Affiché sur la couverture et en dernière page"
                className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
              />
            </div>
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

          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Couverture (optionnel — modifiable ensuite)</label>
            <ImageUploadField
              userId={effectiveOwnerId}
              value={coverUrl}
              onChange={(url) => { setCoverUrl(url); setCoverIsGenerated(false); }}
              onGenerate={handleGenerateCover}
              generating={generatingCover}
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
              {LANGUAGES.find((l) => l.key === language)?.hint && (
                <p className="text-xs text-surface/40 mt-1.5">⚠ {LANGUAGES.find((l) => l.key === language).hint}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Public cible (optionnel)</label>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ex : coachs indépendants qui démarrent leur activité"
                className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Objectif de l'ebook (optionnel)</label>
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ex : capter des leads pour un appel découverte"
                className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Éléments à absolument inclure (optionnel)</label>
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                rows={2}
                placeholder="Ex : la méthode des 3 piliers, un chiffre clé, telle étude de cas"
                className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Exemples / anecdotes à intégrer (optionnel)</label>
              <textarea
                value={examples}
                onChange={(e) => setExamples(e.target.value)}
                rows={2}
                placeholder="Ex : le parcours d'un client, une anecdote personnelle"
                className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Appel à l'action final (optionnel)</label>
              <input
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                placeholder="Ex : réserver un appel découverte via ce lien"
                className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">À éviter (optionnel)</label>
              <input
                value={avoid}
                onChange={(e) => setAvoid(e.target.value)}
                placeholder="Ex : jargon technique, promesses chiffrées"
                className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Longueur</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {LENGTH_PRESETS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setChapterCount(l.chapterCount)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${chapterCount === l.chapterCount ? 'bg-primary text-background' : 'bg-primary/5 text-surface/60'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <label className="block text-xs text-surface/50 mb-1">Nombre de chapitres précis (introduction et conclusion inclus)</label>
            <input
              type="number"
              min={3}
              max={40}
              value={chapterCount}
              onChange={(e) => setChapterCount(Math.max(3, Math.min(40, Number(e.target.value) || 3)))}
              className="w-32 bg-primary/5 border border-surface/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Couleurs du design interne</label>
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
          </div>

          <p className="text-xs text-surface/40">
            Le sommaire est toujours proposé en français ; seul le contenu rédigé suit la langue choisie ci-dessus.
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

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-accent/5 border border-accent/20 rounded-2xl px-4 py-3 mb-4">
          <span className="text-xs font-semibold text-surface/60">{selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}</span>
          <button onClick={handleBulkDelete} disabled={bulkBusy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-surface/50 hover:text-surface">
            Tout désélectionner
          </button>
        </div>
      )}

      <div className="space-y-3">
        {ebooks?.map((ebook) => (
          <div key={ebook.id} className={`flex items-center justify-between gap-2 bg-background border rounded-2xl px-5 py-4 transition-colors ${selectedIds.has(ebook.id) ? 'border-accent' : 'border-surface/10'}`}>
            <input
              type="checkbox"
              checked={selectedIds.has(ebook.id)}
              onChange={() => toggleSelect(ebook.id)}
              className="w-4 h-4 rounded cursor-pointer accent-accent shrink-0"
              aria-label="Sélectionner cet ebook"
            />
            <button onClick={() => navigate(`/app/ebooks/${ebook.id}`)} className="text-left flex-1 min-w-0">
              <p className="font-semibold text-surface truncate">{ebook.title}</p>
              {ebook.subtitle && <p className="text-sm text-surface/50 truncate">{ebook.subtitle}</p>}
            </button>
            <div className="flex items-center gap-1 shrink-0">
              <Link to={`/app/ebooks/${ebook.id}/lire`} className="p-2 rounded-lg text-surface/40 hover:text-surface" aria-label="Lire">
                <BookOpenText className="w-4 h-4" />
              </Link>
              <DownloadMenu ebookId={ebook.id} title={ebook.title} compact />
              <button onClick={() => handleDelete(ebook)} className="p-2 rounded-lg text-surface/30 hover:text-red-500" aria-label="Supprimer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
