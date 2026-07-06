import React from 'react';

export default function ImageBlock({ content }) {
  const { url, caption } = content;
  if (!url) return null;
  return (
    <section className="px-6 py-8 md:px-16 max-w-4xl mx-auto">
      <img src={url} alt={caption || ''} className="w-full h-auto rounded-[2rem] object-cover" />
      {caption && <p className="text-center text-sm text-surface/50 mt-3">{caption}</p>}
    </section>
  );
}
