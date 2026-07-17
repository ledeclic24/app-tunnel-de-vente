import React, { useEffect, useState } from 'react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import BlockExtras from './BlockExtras';

function getRemaining(targetDate) {
  const rawDiff = new Date(targetDate).getTime() - Date.now();
  const diff = Math.max(0, rawDiff);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, expired: rawDiff <= 0 };
}

export default function CountdownBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { headline, targetDate } = content;
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate));
  const headlineProps = getEditableProps({ elementKey: 'headline', kind: 'text', styles: content.styles, editMode, selectedElement, onSelectElement, label: 'Titre' });
  const headlineEditable = getContentEditableProps({ editMode, onContentChange, content, field: 'headline' });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

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
    <section className={cx('px-6 py-16 md:px-16 md:py-24 max-w-2xl mx-auto text-center', bg.sectionClassName)}>
      {headline && (
        <h3
          className={cx('font-sans font-semibold text-xl mb-6 outline-none', bg.headingClassName, headlineProps.className)}
          style={headlineProps.style}
          onClick={headlineProps.onClick}
          {...headlineEditable}
        >
          {headline}
        </h3>
      )}
      {remaining.expired ? (
        <p className="font-mono text-sm uppercase tracking-wider text-surface/50">Offre expirée</p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
          {units.map((u) => (
            <div key={u.label} className="bg-primary text-background rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 min-w-[3.75rem] sm:min-w-[4.5rem]">
              <div className="font-mono text-2xl md:text-3xl font-bold text-accent">{String(u.value).padStart(2, '0')}</div>
              <div className="text-[10px] uppercase tracking-wider text-background/60">{u.label}</div>
            </div>
          ))}
        </div>
      )}
      <BlockExtras
        extras={content.extras}
        styles={content.styles}
        onChange={(extras) => onContentChange?.({ ...content, extras })}
        editMode={editMode}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
        bg={bg}
        userId={userId}
      />
    </section>
  );
}
