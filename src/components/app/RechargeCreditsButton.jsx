import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

// Bouton d'action rapide vers la page de facturation, affiché à côté de
// tout message "crédits IA insuffisants" (copilote tunnel, visuels IA,
// ebooks, éditeur de tunnel) — sans lui, l'utilisateur devait deviner
// qu'il fallait naviguer lui-même vers Facturation pour recharger.
export default function RechargeCreditsButton({ className = '' }) {
  return (
    <Link
      to="/app/billing"
      className={`inline-flex items-center gap-1.5 bg-accent text-background px-3.5 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity ${className}`}
    >
      <Zap className="w-3.5 h-3.5" /> Recharger mes crédits
    </Link>
  );
}
