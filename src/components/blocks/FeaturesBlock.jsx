import React from 'react';
import { Check } from 'lucide-react';

export default function FeaturesBlock({ content }) {
  const { heading, items = [] } = content;
  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-5xl mx-auto">
      {heading && <h2 className="font-sans font-bold text-2xl md:text-3xl text-surface text-center mb-10">{heading}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <div key={i} className="bg-background border border-surface/10 rounded-[2rem] p-6 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
              <Check className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-semibold text-surface mb-2">{item.title}</h3>
            <p className="text-sm text-surface/60">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
