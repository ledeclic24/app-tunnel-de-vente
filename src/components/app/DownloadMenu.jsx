import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { downloadEbookPdf, downloadEbookEpub, downloadEbookTxt } from '../../lib/ebooksApi';
import { useToast } from './Toast';

const FORMATS = [
  { key: 'pdf', label: 'PDF', ext: 'pdf', run: downloadEbookPdf },
  { key: 'epub', label: 'EPUB', ext: 'epub', run: downloadEbookEpub },
  { key: 'txt', label: 'Texte (.txt)', ext: 'txt', run: downloadEbookTxt },
];

// Menu de téléchargement d'ebook (PDF/EPUB/TXT) — remplace les boutons
// séparés "Exporter en PDF" / "Exporter en EPUB" par un seul point
// d'entrée cohérent, réutilisé dans la liste (icône compacte) et
// l'éditeur (bouton complet).
export default function DownloadMenu({ ebookId, title, disabled, compact = false, variant = 'primary' }) {
  const [open, setOpen] = useState(false);
  const [busyFormat, setBusyFormat] = useState(null);
  const toast = useToast();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const busy = busyFormat !== null;

  const handlePick = async (format) => {
    setOpen(false);
    setBusyFormat(format.key);
    try {
      await format.run(ebookId, `${title || 'ebook'}.${format.ext}`);
    } catch {
      toast.error(`L'export ${format.label} a échoué. Réessaie.`);
    }
    setBusyFormat(null);
  };

  const menu = open && (
    <div className="absolute right-0 top-full mt-2 z-20 bg-background border border-surface/10 rounded-2xl shadow-xl py-2 min-w-[180px]">
      {FORMATS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => handlePick(f)}
          disabled={busy}
          className="w-full text-left px-4 py-2.5 text-sm text-surface hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  if (compact) {
    return (
      <div className="relative inline-block" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={disabled || busy}
          className="p-2 rounded-lg text-surface/40 hover:text-surface disabled:opacity-50"
          aria-label="Télécharger"
          title="Télécharger"
        >
          <Download className="w-4 h-4" />
        </button>
        {menu}
      </div>
    );
  }

  const baseClass = variant === 'primary'
    ? 'bg-accent text-background'
    : 'bg-primary/5 border border-surface/10 text-surface hover:border-accent';

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || busy}
        className={`magnetic-btn inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-50 transition-colors ${baseClass}`}
      >
        <Download className="w-4 h-4" /> {busy ? 'Génération...' : 'Télécharger'} <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {menu}
    </div>
  );
}
