import React, { useEffect, useState } from 'react';

function getRemaining(targetDate) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function CountdownBlock({ content }) {
  const { headline, targetDate } = content;
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: 'jours', value: remaining.days },
    { label: 'heures', value: remaining.hours },
    { label: 'min', value: remaining.minutes },
    { label: 'sec', value: remaining.seconds },
  ];

  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-2xl mx-auto text-center">
      {headline && <h3 className="font-sans font-semibold text-xl text-surface mb-6">{headline}</h3>}
      <div className="flex items-center justify-center gap-3 md:gap-4">
        {units.map((u) => (
          <div key={u.label} className="bg-primary text-background rounded-2xl px-4 py-3 md:px-6 md:py-4 min-w-[4.5rem]">
            <div className="font-mono text-2xl md:text-3xl font-bold text-accent">{String(u.value).padStart(2, '0')}</div>
            <div className="text-[10px] uppercase tracking-wider text-background/60">{u.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
