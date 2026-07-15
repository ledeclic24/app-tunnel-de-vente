import React from 'react';

// Mini-rendu markdown côté lecteur — même schéma que le PDF/EPUB générés
// côté backend (gras/italique/liens + listes à puces/numérotées), pour que
// le contenu généré par l'IA (qui utilise ces marqueurs) ne s'affiche
// jamais avec des astérisques littéraux dans la page de lecture.
const INLINE_REGEX = /(https?:\/\/[^\s]+)|\*\*(.+?)\*\*|\*(.+?)\*/g;

function renderInline(text) {
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  INLINE_REGEX.lastIndex = 0;
  while ((match = INLINE_REGEX.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1]) {
      nodes.push(
        <a key={key++} href={match[1]} target="_blank" rel="noopener noreferrer" className="underline text-accent">
          {match[1]}
        </a>,
      );
    } else if (match[2]) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key++}>{match[3]}</em>);
    }
    lastIndex = INLINE_REGEX.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

const BULLET_LINE = /^[-*•]\s+(.*)$/;
const NUMBERED_LINE = /^\d+[.)]\s+(.*)$/;

function detectListKind(block) {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  if (lines.every((l) => BULLET_LINE.test(l))) return 'bullet';
  if (lines.every((l) => NUMBERED_LINE.test(l))) return 'numbered';
  return null;
}

function MarkdownLiteBlock({ block }) {
  const kind = detectListKind(block);
  if (kind) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const ListTag = kind === 'bullet' ? 'ul' : 'ol';
    return (
      <ListTag className={kind === 'bullet' ? 'list-disc pl-5 space-y-1.5' : 'list-decimal pl-5 space-y-1.5'}>
        {lines.map((line, i) => {
          const content = (kind === 'bullet' ? BULLET_LINE : NUMBERED_LINE).exec(line)[1];
          return <li key={i}>{renderInline(content)}</li>;
        })}
      </ListTag>
    );
  }
  return <p>{renderInline(block)}</p>;
}

// Pour les aperçus tronqués (line-clamp) où le rendu par blocs (listes,
// etc.) n'a pas de sens — on retire juste les marqueurs, comme l'export TXT.
export function stripMarkdown(text) {
  return (text || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}

export function MarkdownLite({ text, className = '' }) {
  const blocks = (text || '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={className}>
      {blocks.map((b, i) => <MarkdownLiteBlock key={i} block={b} />)}
    </div>
  );
}
