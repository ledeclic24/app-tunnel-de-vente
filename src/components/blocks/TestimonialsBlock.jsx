import React from 'react';
import { Quote } from 'lucide-react';

export default function TestimonialsBlock({ content }) {
  const { heading, items = [] } = content;
  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-5xl mx-auto">
      {heading && <h2 className="font-sans font-bold text-2xl md:text-3xl text-surface text-center mb-10">{heading}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, i) => (
          <div key={i} className="bg-background border border-surface/10 rounded-[2rem] p-6 shadow-sm">
            <Quote className="w-6 h-6 text-accent mb-3" />
            <p className="text-surface/80 mb-4">{item.quote}</p>
            <p className="text-sm font-semibold text-surface">{item.name}</p>
            {item.role && <p className="text-xs text-surface/50">{item.role}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
