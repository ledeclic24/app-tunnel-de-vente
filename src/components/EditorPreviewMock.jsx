import React from 'react';
import { LayoutDashboard, Type, ImageIcon, MousePointerClick, ListChecks } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Hero' },
  { icon: Type, label: 'Texte' },
  { icon: ImageIcon, label: 'Image' },
  { icon: ListChecks, label: 'Formulaire' },
  { icon: MousePointerClick, label: 'CTA' },
];

export default function EditorPreviewMock({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-surface/10 bg-background shadow-2xl shadow-surface/10 overflow-hidden ${className}`}>
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-surface/10 bg-surface/[0.02]">
        <div className="w-2.5 h-2.5 rounded-full bg-surface/15" />
        <div className="w-2.5 h-2.5 rounded-full bg-surface/15" />
        <div className="w-2.5 h-2.5 rounded-full bg-surface/15" />
        <div className="ml-3 flex-1 h-6 rounded-md bg-surface/5 flex items-center px-3 text-[10px] font-mono text-surface/40 truncate">
          vendeko.app/f/mon-lancement
        </div>
      </div>
      <div className="flex">
        <div className="w-36 shrink-0 border-r border-surface/10 p-3 space-y-1 hidden sm:block bg-surface/[0.015]">
          <p className="text-[9px] font-mono uppercase tracking-wider text-surface/30 px-2 mb-2">Blocs</p>
          {SIDEBAR_ITEMS.map(({ icon: Icon, label }, i) => (
            <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] ${i === 0 ? 'bg-accent/10 text-accent font-medium' : 'text-surface/50'}`}>
              <Icon className="w-3 h-3 shrink-0" />
              {label}
            </div>
          ))}
        </div>
        <div className="flex-1 p-6 md:p-8 space-y-4 bg-gradient-to-br from-background to-accent/[0.06] min-w-0">
          <div className="h-2.5 w-20 rounded-full bg-accent/30" />
          <div className="h-5 w-4/5 rounded-md bg-surface/85" />
          <div className="h-5 w-3/5 rounded-md bg-surface/85" />
          <div className="h-3 w-full rounded bg-surface/15" />
          <div className="h-3 w-2/3 rounded bg-surface/15" />
          <div className="flex gap-3 pt-2">
            <div className="h-9 w-32 rounded-full gradient-accent" />
            <div className="h-9 w-24 rounded-full border border-surface/15" />
          </div>
        </div>
      </div>
    </div>
  );
}
