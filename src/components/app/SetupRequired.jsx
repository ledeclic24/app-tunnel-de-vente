import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SetupRequired() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-primary text-background rounded-[2rem] p-8 md:p-10 border border-accent/20 shadow-2xl">
        <div className="flex items-center gap-3 mb-4 text-accent">
          <AlertTriangle className="w-6 h-6" />
          <h1 className="font-sans font-bold text-xl">Configuration Supabase requise</h1>
        </div>
        <p className="text-background/70 text-sm mb-4">
          L'application a besoin d'un projet Supabase pour gérer les comptes et les tunnels.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-background/80 mb-6">
          <li>Crée un projet gratuit sur <span className="font-mono text-accent">supabase.com</span></li>
          <li>Dans <span className="font-mono">Project Settings → API</span>, copie l'URL et la clé "anon public"</li>
          <li>Colle-les dans un fichier <span className="font-mono">.env.local</span> à la racine du projet (voir <span className="font-mono">.env.example</span>)</li>
          <li>Exécute le contenu de <span className="font-mono">sql/schema.sql</span> dans l'éditeur SQL de Supabase</li>
          <li>Relance <span className="font-mono">npm run dev</span></li>
        </ol>
        <p className="text-xs text-background/50">Tant que ces variables ne sont pas définies, l'inscription, la connexion et les tunnels restent inaccessibles.</p>
      </div>
    </div>
  );
}
