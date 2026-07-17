import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { ImageIcon, Lock, Sparkles, Copy, Check, Wand2, Download, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { generateImages, fetchImageUsageThisMonth, fetchImages, deleteImage, downloadImage, fetchImageBlob } from '../../lib/imagesApi';
import { useConfirm } from '../../components/app/ConfirmDialog';
import { useToast } from '../../components/app/Toast';

const COMING_SOON = false;

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

// Mêmes clés que TUNNEL_IMAGE_TYPES (BlockEditorPanel.jsx) — dupliquées
// ici (petite liste statique) plutôt que d'importer tout ce module,
// nettement plus lourd et sans rapport avec cette page.
const IMAGE_TYPES = [
  { key: 'photo', label: 'Image' },
  { key: 'box', label: 'Coffret produit' },
  { key: 'ebook-cover', label: 'Ebook' },
  { key: 'mockup', label: 'Mockup' },
  { key: 'mockup-screen', label: 'Mockup écran' },
];

// Même liste que STYLE_PRESETS côté backend (image-style-presets.ts) —
// dupliquée ici seulement pour l'affichage des puces, la formulation du
// prompt reste une responsabilité serveur.
const STYLES = [
  { key: 'photo-real', label: 'Photo réaliste' },
  { key: 'illustration', label: 'Illustration' },
  { key: '3d-render', label: 'Rendu 3D' },
  { key: 'watercolor', label: 'Aquarelle' },
  { key: 'minimal', label: 'Minimaliste' },
  { key: 'neon', label: 'Néon' },
];

function IconButton({ onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/70 text-background text-xs font-medium hover:bg-surface transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function ImageCard({ image, onDelete, onRegenerate, regenerating, onDownload, downloading, selected, onToggleSelect }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className={`relative group/img rounded-[1.5rem] overflow-hidden border transition-colors ${selected ? 'border-accent ring-2 ring-accent/40' : 'border-surface/10'}`}>
      {image.id && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(image.id)}
          className="absolute top-3 left-3 z-10 w-4 h-4 rounded cursor-pointer accent-accent"
          aria-label="Sélectionner ce visuel"
        />
      )}
      <img src={image.url} alt="Visuel généré" className="w-full h-full object-cover" />
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
        <IconButton
          onClick={() => {
            navigator.clipboard.writeText(image.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copié' : "Copier l'URL"}
        </IconButton>
        {image.id && (
          <>
            <IconButton onClick={() => onDownload(image)} className={downloading ? 'opacity-50 pointer-events-none' : ''}>
              <Download className="w-3.5 h-3.5" /> {downloading ? 'Téléchargement...' : 'Télécharger'}
            </IconButton>
            <IconButton onClick={() => onRegenerate(image)} className={regenerating ? 'opacity-50 pointer-events-none' : ''}>
              <RefreshCw className="w-3.5 h-3.5" /> {regenerating ? 'Génération...' : 'Régénérer'}
            </IconButton>
            <IconButton onClick={() => onDelete(image)}>
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}

export default function ImageStudioPage() {
  const { effectiveProfile } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);

  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [count, setCount] = useState(1);
  const [style, setStyle] = useState('');
  const [imageType, setImageType] = useState('');
  const [transparent, setTransparent] = useState(false);
  const [images, setImages] = useState([]);
  const [usage, setUsage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [error, setError] = useState('');
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    if (COMING_SOON || !plan.imageGeneration) return;
    fetchImageUsageThisMonth().then(setUsage).catch(() => {});
    // Bibliothèque persistée : sans ça, la galerie repartait vide à chaque
    // visite alors que les images survivent bien côté serveur.
    fetchImages().then(setImages).catch(() => {});
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

  const runGeneration = async ({ prompt: p, size: s, n, style: st, imageType: it, background: bg }) => {
    const results = await generateImages({ prompt: p, size: s, n, style: st || undefined, imageType: it || undefined, background: bg || undefined });
    setImages((prev) => [...results, ...prev]);
    setUsage((u) => (u === null ? null : u + results.length));
    return results;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || generating || atLimit) return;
    setGenerating(true);
    setError('');
    try {
      await runGeneration({
        prompt: prompt.trim(), size, n: count, style, imageType,
        background: transparent ? 'transparent' : undefined,
      });
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error);
    }
    setGenerating(false);
  };

  const handleRegenerate = async (image) => {
    if (regeneratingId) return;
    setRegeneratingId(image.id);
    setError('');
    try {
      await runGeneration({
        prompt: image.prompt, size: image.size || '1024x1024', n: 1,
        style: image.style, imageType: image.imageType, background: image.background,
      });
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error);
    }
    setRegeneratingId(null);
  };

  const handleDownload = async (image) => {
    setDownloadingId(image.id);
    try {
      await downloadImage(image.id, `vendeko-${image.id}.webp`);
    } catch {
      toast.error("Le téléchargement a échoué. Réessaie.");
    }
    setDownloadingId(null);
  };

  const handleDelete = async (image) => {
    if (!(await confirm('Supprimer ce visuel de ta bibliothèque ?'))) return;
    try {
      await deleteImage(image.id);
      setImages((prev) => prev.filter((i) => i.id !== image.id));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(image.id); return next; });
    } catch {
      toast.error("La suppression a échoué. Réessaie.");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!(await confirm(`Supprimer ${selectedIds.size} visuel${selectedIds.size > 1 ? 's' : ''} de ta bibliothèque ?`))) return;
    setBulkBusy(true);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteImage(id);
        setImages((prev) => prev.filter((i) => i.id !== id));
      } catch {
        toast.error('Une suppression a échoué. Les autres visuels sélectionnés ont été traités.');
        break;
      }
    }
    setSelectedIds(new Set());
    setBulkBusy(false);
  };

  const handleBulkDownload = async () => {
    setBulkBusy(true);
    try {
      const zip = new JSZip();
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        const blob = await fetchImageBlob(id);
        zip.file(`vendeko-${id}.webp`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visuels-vendeko-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Le téléchargement groupé a échoué. Réessaie.");
    }
    setBulkBusy(false);
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

        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Type d'image</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setImageType('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${imageType === '' ? 'bg-primary text-background' : 'bg-primary/5 text-surface/60'}`}
            >
              Aucun
            </button>
            {IMAGE_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setImageType(t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${imageType === t.key ? 'bg-primary text-background' : 'bg-primary/5 text-surface/60'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Style visuel</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStyle('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${style === '' ? 'bg-primary text-background' : 'bg-primary/5 text-surface/60'}`}
            >
              Aucun
            </button>
            {STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setStyle(s.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${style === s.key ? 'bg-primary text-background' : 'bg-primary/5 text-surface/60'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
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

        <label className="flex items-center gap-2 text-sm text-surface/70 cursor-pointer">
          <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="rounded border-surface/20" />
          Fond transparent (détouré, pour poser le visuel sur un fond de couleur)
        </label>

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

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-accent/5 border border-accent/20 rounded-2xl px-4 py-3 mb-4">
          <span className="text-xs font-semibold text-surface/60">{selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}</span>
          <button onClick={handleBulkDownload} disabled={bulkBusy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent disabled:opacity-50">
            <Download className="w-3.5 h-3.5" /> Télécharger en ZIP
          </button>
          <button onClick={handleBulkDelete} disabled={bulkBusy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-surface/50 hover:text-surface">
            Tout désélectionner
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, i) => (
            <ImageCard
              key={image.id || image.url + i}
              image={image}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
              regenerating={regeneratingId === image.id}
              onDownload={handleDownload}
              downloading={downloadingId === image.id}
              selected={selectedIds.has(image.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
