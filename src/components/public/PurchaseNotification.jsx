import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';

const DEFAULT_NAMES = ['Aminata', 'Kevin', 'Fatou', 'Jean-Marc', 'Aïcha', 'David'];
const VISIBLE_MS = 5000;
const GAP_MS = 7000;

// Notification d'achat simulée, position fixe bas-gauche (cahier des
// charges "tunnel standard") — désactivée par défaut à la création d'un
// tunnel (décision actée : ne jamais afficher d'activité fictive sans
// action explicite du créateur).
export default function PurchaseNotification({ config, liftForFooter }) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const names = config?.names?.length ? config.names : DEFAULT_NAMES;

  useEffect(() => {
    if (!config?.enabled) return undefined;
    let showTimer;
    let hideTimer;
    const cycle = () => {
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        setIndex((i) => (i + 1) % names.length);
        showTimer = setTimeout(cycle, GAP_MS);
      }, VISIBLE_MS);
    };
    showTimer = setTimeout(cycle, 2000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.enabled, names.length]);

  if (!config?.enabled || !config?.productName) return null;

  return (
    <div
      className={`fixed left-4 z-40 max-w-xs bg-background border border-surface/10 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-500 ${liftForFooter ? 'bottom-24' : 'bottom-4'} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
        <ShoppingBag className="w-4 h-4" />
      </div>
      <p className="text-sm text-surface">
        <span className="font-semibold">{names[index]}</span> vient d'acheter{' '}
        <span className="font-semibold">{config.productName}</span>
      </p>
    </div>
  );
}
