import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, LayoutDashboard, Mail, BarChart3, Webhook, Building2, User, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFunnels } from '../../lib/funnelsApi';

const FIXED_DESTINATIONS = [
  { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/app/leads', label: 'Leads', icon: Mail },
  { to: '/app/analytics', label: 'Analytique', icon: BarChart3 },
  { to: '/app/integrations', label: 'Intégrations', icon: Webhook },
  { to: '/app/organisation', label: 'Organisation', icon: Building2 },
  { to: '/app/account', label: 'Compte', icon: User },
  { to: '/app/billing', label: 'Facturation', icon: CreditCard },
];

export default function CommandPalette({ open, onOpenChange }) {
  const { effectiveOwnerId } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [funnels, setFunnels] = useState([]);
  const inputRef = useRef(null);

  // Raccourci clavier global Ctrl+K / Cmd+K, actif même quand la palette est fermée.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(true);
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    const timer = setTimeout(() => inputRef.current?.focus(), 10);
    if (effectiveOwnerId) {
      fetchUserFunnels(effectiveOwnerId).then(setFunnels).catch(() => setFunnels([]));
    }
    return () => clearTimeout(timer);
  }, [open, effectiveOwnerId]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const filteredFunnels = q ? funnels.filter((f) => f.name?.toLowerCase().includes(q)) : funnels;
  const filteredDestinations = q ? FIXED_DESTINATIONS.filter((d) => d.label.toLowerCase().includes(q)) : FIXED_DESTINATIONS;

  const go = (to) => {
    navigate(to);
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-lg mx-auto mt-24 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface/10">
          <Search className="w-4 h-4 text-surface/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un tunnel ou une page..."
            className="flex-1 bg-transparent outline-none text-sm text-surface placeholder:text-surface/40"
          />
          <button onClick={() => onOpenChange(false)} className="text-surface/40 hover:text-surface" aria-label="Fermer la recherche">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto py-2">
          {filteredFunnels.length > 0 && (
            <div className="px-2 mb-2">
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-surface/40 font-mono">Tunnels</p>
              {filteredFunnels.map((f) => (
                <button
                  key={f.id}
                  onClick={() => go(`/app/funnels/${f.id}/edit`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-accent/10 hover:text-accent text-left transition-colors"
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {filteredDestinations.length > 0 && (
            <div className="px-2">
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-surface/40 font-mono">Navigation</p>
              {filteredDestinations.map(({ to, label, icon: Icon }) => (
                <button
                  key={to}
                  onClick={() => go(to)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-accent/10 hover:text-accent text-left transition-colors"
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          )}

          {filteredFunnels.length === 0 && filteredDestinations.length === 0 && (
            <p className="px-5 py-6 text-sm text-surface/40 text-center">Aucun résultat.</p>
          )}
        </div>
      </div>
    </div>
  );
}
