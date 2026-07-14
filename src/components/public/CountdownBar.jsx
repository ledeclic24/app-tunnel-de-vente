import React, { useEffect, useState } from 'react';

function getRemaining(targetDate) {
  const rawDiff = new Date(targetDate).getTime() - Date.now();
  const diff = Math.max(0, rawDiff);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, expired: rawDiff <= 0 };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// Barre d'urgence fixe en haut de page (cahier des charges "tunnel
// standard") — distincte du bloc CountdownBlock (contenu de page normal,
// repositionnable) : un réglage d'étape, unique, toujours en haut.
export default function CountdownBar({ config }) {
  const [remaining, setRemaining] = useState(() => getRemaining(config?.targetDate));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(config?.targetDate)), 1000);
    return () => clearInterval(interval);
  }, [config?.targetDate]);

  if (!config?.enabled || !config?.targetDate || remaining.expired) return null;

  return (
    <div className="sticky top-0 z-40 bg-primary text-background text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 flex-wrap">
      <span>Offre limitée dans le temps :</span>
      <span className="font-mono font-bold">
        {remaining.days > 0 && `${remaining.days}j `}
        {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
      </span>
    </div>
  );
}
