import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import { ImageIcon, Lock, Sparkles, Copy, Check, Wand2, Download, Trash2, RefreshCw, X, ChevronLeft, ChevronRight, MoreVertical, ImagePlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { generateImages, fetchImages, deleteImage, downloadImage, fetchImageBlob } from '../../lib/imagesApi';
import { fetchCreditsBalance, fetchCreditCosts } from '../../lib/creditsApi';
import { uploadImage } from '../../lib/storage';
import { useConfirm } from '../../components/app/ConfirmDialog';
import { useToast } from '../../components/app/Toast';
import GradientBanner from '../../components/ui/GradientBanner';
import RechargeCreditsButton from '../../components/app/RechargeCreditsButton';

const COMING_SOON = false;

const ERROR_MESSAGES = {
  plan_required: "La génération d'images nécessite le plan Pro ou Entreprise.",
  limit_reached: "Tu as atteint ta limite de générations d'images ce mois-ci.",
  insufficient_credits: 'Crédits IA insuffisants. Achète un pack ou passe au plan supérieur depuis la page Facturation.',
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

function ImageCard({ image, onOpen, onDelete, onRegenerate, regenerating, onDownload, downloading, selected, onToggleSelect }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className={`relative group/img rounded-[1.5rem] overflow-hidden border transition-colors ${selected ? 'border-accent ring-2 ring-accent/40' : 'border-surface/10'}`}>
      {image.id && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(image.id)}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 left-3 z-10 w-4 h-4 rounded cursor-pointer accent-accent"
          aria-label="Sélectionner ce visuel"
        />
      )}
      <img
        src={image.url}
        alt="Visuel généré"
        onClick={onOpen}
        className="w-full h-full object-cover cursor-zoom-in"
      />
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
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
            <IconButton onClick={(e) => { e.stopPropagation(); onDownload(image); }} className={downloading ? 'opacity-50 pointer-events-none' : ''}>
              <Download className="w-3.5 h-3.5" /> {downloading ? 'Téléchargement...' : 'Télécharger'}
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); onRegenerate(image); }} className={regenerating ? 'opacity-50 pointer-events-none' : ''}>
              <RefreshCw className="w-3.5 h-3.5" /> {regenerating ? 'Génération...' : 'Régénérer'}
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); onDelete(image); }}>
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}

// Agrandissement plein écran au clic sur une image : navigation précédent/
// suivant par flèches, balayage tactile (swipe), et un menu "..." reprenant
// les mêmes actions que la carte (copier/télécharger/régénérer/supprimer)
// pour ne pas dupliquer de logique métier.
function Lightbox({ images, index, onClose, onNavigate, onDelete, onRegenerate, regenerating, onDownload, downloading }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef(null);
  const image = images[index];

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onNavigate(-1);
      else if (e.key === 'ArrowRight') onNavigate(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onNavigate]);

  useEffect(() => { setMenuOpen(false); }, [index]);

  if (!image) return null;

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    onNavigate(delta > 0 ? -1 : 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          aria-label="Options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="dropdown-panel absolute top-11 right-0 w-52 bg-background border border-surface/10 rounded-2xl shadow-xl overflow-hidden py-1.5"
          >
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(image.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface hover:bg-primary/5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copié' : "Copier l'URL"}
            </button>
            <button
              type="button"
              onClick={() => onDownload(image)}
              disabled={downloading}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface hover:bg-primary/5 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {downloading ? 'Téléchargement...' : 'Télécharger'}
            </button>
            <button
              type="button"
              onClick={() => onRegenerate(image)}
              disabled={regenerating}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface hover:bg-primary/5 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" /> {regenerating ? 'Génération...' : 'Régénérer'}
            </button>
            <button
              type="button"
              onClick={() => onDelete(image)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        )}
      </div>

      {index > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
          className="absolute left-2 md:left-6 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          aria-label="Image précédente"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {index < images.length - 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
          className="absolute right-2 md:right-6 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          aria-label="Image suivante"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <img
        src={image.url}
        alt="Visuel généré"
        onClick={(e) => e.stopPropagation()}
        className="max-w-[92vw] max-h-[85vh] object-contain rounded-lg select-none"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
        {index + 1} / {images.length}
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
  const [credits, setCredits] = useState(null);
  const [costs, setCosts] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [referenceUploading, setReferenceUploading] = useState(false);
  const referenceFileRef = useRef(null);
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    if (COMING_SOON || !plan.imageGeneration) return;
    fetchCreditsBalance().then(setCredits).catch(() => {});
    fetchCreditCosts().then(setCosts).catch(() => {});
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
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Génère tes visuels directement dans TonTunnel</h1>
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

  const atLimit = credits !== null && credits.balance <= 0;

  const runGeneration = async ({ prompt: p, size: s, n, style: st, imageType: it, background: bg, referenceImageUrl: ref }) => {
    const results = await generateImages({ prompt: p, size: s, n, style: st || undefined, imageType: it || undefined, background: bg || undefined, referenceImageUrl: ref || undefined });
    setImages((prev) => [...results, ...prev]);
    // Chaque génération déduit des crédits IA — sans ça, le solde affiché
    // restait figé jusqu'au prochain rechargement de page. `setUsage` était
    // appelé ici sans qu'aucun état `usage` n'existe dans ce composant : une
    // ReferenceError silencieuse à CHAQUE génération réussie, rattrapée par
    // le catch appelant et affichée comme "Une erreur est survenue" — la
    // vraie cause de l'erreur générique vue même quand l'image était prête.
    fetchCreditsBalance().then(setCredits).catch(() => {});
    return results;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || generating || atLimit) return;
    setGenerating(true);
    setError('');
    setErrorCode('');
    try {
      const results = await runGeneration({
        prompt: prompt.trim(), size, n: count, style, imageType,
        background: transparent ? 'transparent' : undefined,
        referenceImageUrl: referenceImageUrl || undefined,
      });
      toast.success(results.length > 1 ? `${results.length} images générées avec succès.` : 'Image générée avec succès.');
    } catch (err) {
      const message = ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error;
      setError(message);
      setErrorCode(err.message);
      toast.error(message);
    }
    setGenerating(false);
  };

  const handleRegenerate = async (image) => {
    if (regeneratingId) return;
    setRegeneratingId(image.id);
    setError('');
    setErrorCode('');
    try {
      await runGeneration({
        prompt: image.prompt, size: image.size || '1024x1024', n: 1,
        style: image.style, imageType: image.imageType, background: image.background,
      });
      toast.success('Image générée avec succès.');
    } catch (err) {
      const message = ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error;
      setError(message);
      setErrorCode(err.message);
      toast.error(message);
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
      setLightboxIndex(null);
    } catch {
      toast.error("La suppression a échoué. Réessaie.");
    }
  };

  const navigateLightbox = (delta) => {
    setLightboxIndex((prev) => {
      if (prev === null) return prev;
      const next = prev + delta;
      return next >= 0 && next < images.length ? next : prev;
    });
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
      <GradientBanner
        icon={ImageIcon}
        title="Génère des images pour tes tunnels"
        description={credits !== null ? `${credits.balance} crédit${credits.balance > 1 ? 's' : ''} IA disponible${credits.balance > 1 ? 's' : ''}${costs ? ` · ${costs.IMAGE_GENERATION} crédit(s) par image générée` : ''}` : undefined}
        actions={credits !== null && <Link to="/app/billing" className="text-background/80 text-sm font-semibold hover:underline">En acheter plus</Link>}
      />

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
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-2">Visuel de référence (facultatif)</label>
          <p className="text-xs text-surface/50 mb-2">Le générateur s'en inspire (composition, style) et l'adapte à ta description ci-dessus.</p>
          {referenceImageUrl ? (
            <div className="relative inline-block">
              <img src={referenceImageUrl} alt="Référence" className="h-24 w-24 object-cover rounded-xl border border-surface/10" />
              <button
                type="button"
                onClick={() => setReferenceImageUrl('')}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-surface/80 text-background flex items-center justify-center"
                aria-label="Retirer le visuel de référence"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => referenceFileRef.current?.click()}
              disabled={referenceUploading}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-surface/20 text-sm text-surface/60 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            >
              {referenceUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              {referenceUploading ? 'Envoi...' : 'Choisir une image'}
            </button>
          )}
          <input
            ref={referenceFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setReferenceUploading(true);
              try {
                const url = await uploadImage(effectiveProfile?.id, file);
                setReferenceImageUrl(url);
              } catch (err) {
                toast.error(err.message || "L'image n'a pas pu être importée.");
              }
              setReferenceUploading(false);
            }}
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

        {error && (
          <div className="text-sm text-red-500">
            <p>{error}</p>
            {errorCode === 'insufficient_credits' && <RechargeCreditsButton className="mt-2" />}
          </div>
        )}
        {atLimit && (
          <div className="text-sm text-red-500">
            <p>{ERROR_MESSAGES.limit_reached}</p>
            <RechargeCreditsButton className="mt-2" />
          </div>
        )}
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
              onOpen={() => setLightboxIndex(i)}
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

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={navigateLightbox}
          onDelete={handleDelete}
          onRegenerate={handleRegenerate}
          regenerating={regeneratingId === images[lightboxIndex]?.id}
          onDownload={handleDownload}
          downloading={downloadingId === images[lightboxIndex]?.id}
        />
      )}
    </div>
  );
}
