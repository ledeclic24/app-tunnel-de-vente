import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SetupRequired() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-primary text-background rounded-[2rem] p-8 md:p-10 border border-accent/20 shadow-2xl">
        <div className="flex items-center gap-3 mb-4 text-accent">
          <AlertTriangle className="w-6 h-6" />
          <h1 className="font-sans font-bold text-xl">Configuration de l'API requise</h1>
        </div>
        <p className="text-background/70 text-sm mb-4">
          L'application a besoin de l'URL de l'API backend (NestJS) pour gérer les comptes et les tunnels.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-background/80 mb-6">
          <li>Lance le backend (voir <span className="font-mono">../app-tunnel-de-vente-api</span>)</li>
          <li>Renseigne <span className="font-mono">VITE_API_URL</span> dans un fichier <span className="font-mono">.env.local</span> à la racine du projet (voir <span className="font-mono">.env.example</span>)</li>
          <li>Relance <span className="font-mono">npm run dev</span></li>
        </ol>
        <p className="text-xs text-background/50">Tant que cette variable n'est pas définie, l'inscription, la connexion et les tunnels restent inaccessibles.</p>
      </div>
    </div>
  );
}
