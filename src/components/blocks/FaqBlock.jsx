import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqBlock({ content }) {
  const { heading, items = [] } = content;
  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-3xl mx-auto">
      {heading && <h2 className="font-sans font-bold text-2xl md:text-3xl text-surface text-center mb-10">{heading}</h2>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <details key={i} className="group bg-background border border-surface/10 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer font-sans font-medium text-surface list-none">
              {item.question}
              <ChevronDown className="w-4 h-4 text-surface/50 group-open:rotate-180 transition-transform shrink-0" />
            </summary>
            <p className="text-sm text-surface/60 mt-3">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
