import React from 'react';
import { Quote } from 'lucide-react';
import { getEditableProps, cx } from '../../lib/blockStyle';

export default function TestimonialsBlock({ content, editMode, selectedElement, onSelectElement }) {
  const { heading, items = [] } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });

  const headingProps = editable('heading', 'text', 'Titre');

  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-5xl mx-auto">
      {heading && (
        <h2
          className={cx('font-sans font-bold text-2xl md:text-3xl text-surface text-center mb-10', headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
        >
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, i) => {
          const cardProps = editable(`testimonial-${i}`, 'card', `Témoignage ${i + 1}`);
          return (
            <div
              key={i}
              className={cx('bg-background border border-surface/10 rounded-[2rem] p-6 shadow-sm', cardProps.className)}
              style={cardProps.style}
              onClick={cardProps.onClick}
            >
              <Quote className="w-6 h-6 text-accent mb-3" />
              <p className="text-surface/80 mb-4">{item.quote}</p>
              <p className="text-sm font-semibold text-surface">{item.name}</p>
              {item.role && <p className="text-xs text-surface/50">{item.role}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
