import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { fetchEbook } from '../../lib/ebooksApi';
import { brandStyleVars } from '../../lib/colorUtils';
import { MarkdownLite } from '../../lib/markdownLite';

// Lecture seule : pas d'édition ici, juste un aperçu confortable dans le
// navigateur sans passer par l'export PDF/EPUB — réutilise fetchEbook,
// déjà utilisé par l'éditeur (même forme de données ebook + chapters).
export default function EbookReaderPage() {
  const { ebookId } = useParams();
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    fetchEbook(ebookId).then((data) => { setEbook(data.ebook); setChapters(data.chapters); });
  }, [ebookId]);

  if (!ebook) return <p className="text-sm text-surface/40 text-center py-16">Chargement...</p>;

  const author = ebook.authorName || "L'auteur";

  return (
    <div style={brandStyleVars(ebook.brand)} className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/app/ebooks" className="inline-flex items-center gap-2 text-sm text-surface/60 hover:text-surface">
          <ArrowLeft className="w-4 h-4" /> Retour aux ebooks
        </Link>
        <Link to={`/app/ebooks/${ebookId}`} className="inline-flex items-center gap-2 text-sm text-surface/60 hover:text-surface">
          <Pencil className="w-4 h-4" /> Modifier
        </Link>
      </div>

      <div className="text-center mb-12">
        {ebook.coverImageUrl && (
          <div className="w-full max-w-xs mx-auto aspect-[2/3] rounded-2xl overflow-hidden mb-6 border border-surface/10">
            <img src={ebook.coverImageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="w-16 h-1.5 rounded-full bg-accent mx-auto mb-4" />
        <h1 className="text-3xl font-sans font-bold text-surface">{ebook.title}</h1>
        {ebook.subtitle && <p className="text-lg text-surface/60 mt-2">{ebook.subtitle}</p>}
        <p className="text-sm text-surface/40 mt-4">{author}</p>
      </div>

      <div className="space-y-14">
        {chapters.map((chapter, i) => (
          <div key={chapter.id}>
            <h2 className="text-xl font-sans font-bold text-primary mb-3">{i + 1}. {chapter.title}</h2>
            {chapter.imageUrl && (
              <div className="w-full rounded-2xl overflow-hidden mb-4 border border-surface/10">
                <img src={chapter.imageUrl} alt="" className="w-full h-auto object-cover" />
              </div>
            )}
            {chapter.content ? (
              <MarkdownLite text={chapter.content} className="space-y-4 text-surface/80 leading-relaxed" />
            ) : (
              <p className="text-sm text-surface/40 italic">{chapter.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
