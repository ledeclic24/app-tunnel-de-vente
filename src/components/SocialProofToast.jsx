import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { fetchSocialProof } from '../lib/socialProofApi';

const DISMISS_KEY = 'tontunnel_social_proof_dismissed';
const SHOW_MS = 3600;
const GAP_MS = 900;

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

function actionLabel(item) {
  return item.type === 'publish' ? 'vient de publier son tunnel' : 'vient de rejoindre TonTunnel';
}

// Bureau uniquement (desktop) : sur mobile ce coin de l'écran est déjà pris
// par le bandeau CTA collant (StickyMobileCta) — superposer les deux
// créerait de la friction plutôt que de la conviction.
export default function SocialProofToast() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (dismissed) return;
    let alive = true;
    fetchSocialProof()
      .then((res) => {
        if (alive && res?.enabled && Array.isArray(res.items) && res.items.length > 0) {
          setItems(res.items);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [dismissed]);

  useEffect(() => {
    if (dismissed || items.length === 0) return;
    let alive = true;

    async function cycle() {
      while (alive) {
        setVisible(true);
        await new Promise((r) => setTimeout(r, SHOW_MS));
        if (!alive) return;
        setVisible(false);
        await new Promise((r) => setTimeout(r, GAP_MS));
        if (!alive) return;
        setIndex((i) => (i + 1) % items.length);
        await new Promise((r) => setTimeout(r, GAP_MS));
      }
    }
    cycle();
    return () => {
      alive = false;
    };
  }, [items, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* stockage indisponible (mode privé) — le rechargement suffit alors à réafficher, sans conséquence grave */
    }
  };

  if (dismissed || items.length === 0) return null;
  const item = items[index];

  return (
    <div
      className={`hidden md:flex fixed left-5 bottom-5 z-40 items-center gap-3 w-[300px] bg-background rounded-2xl shadow-2xl shadow-black/25 border border-surface/10 p-3.5 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-bold shrink-0">
        {item.firstName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-surface leading-snug">
          {item.firstName} <span className="font-normal text-surface/70">{actionLabel(item)}</span>
        </p>
        <p className="text-[11px] text-surface/40 flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />
          {relativeTime(item.at)}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Fermer"
        className="text-surface/25 hover:text-surface/60 transition-colors shrink-0 p-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
