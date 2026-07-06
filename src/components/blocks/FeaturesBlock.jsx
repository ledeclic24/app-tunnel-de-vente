import React from 'react';
import { Check } from 'lucide-react';
import { getEditableProps, cx } from '../../lib/blockStyle';

export default function FeaturesBlock({ content, editMode, selectedElement, onSelectElement }) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const cardProps = editable(`feature-${i}`, 'card', `Carte ${i + 1}`);
          return (
            <div
              key={i}
              className={cx('bg-background border border-surface/10 rounded-[2rem] p-6 shadow-sm', cardProps.className)}
              style={cardProps.style}
              onClick={cardProps.onClick}
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="font-sans font-semibold text-surface mb-2">{item.title}</h3>
              <p className="text-sm text-surface/60">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
