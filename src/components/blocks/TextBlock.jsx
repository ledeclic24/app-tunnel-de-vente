import React from 'react';

export default function TextBlock({ content }) {
  const { heading, body } = content;
  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-3xl mx-auto text-center">
      {heading && <h2 className="font-sans font-bold text-2xl md:text-3xl text-surface mb-4">{heading}</h2>}
      {body && <p className="text-surface/70 text-lg leading-relaxed whitespace-pre-line">{body}</p>}
    </section>
  );
}
