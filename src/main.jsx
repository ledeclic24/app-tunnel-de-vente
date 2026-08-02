import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Absent en dev / tant que VITE_SENTRY_DSN n'est pas configuré : aucune
// erreur n'est alors envoyée nulle part (même principe que côté backend).
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // tracesSampleRate seul ne suffit pas : sans cette intégration, aucune
    // transaction de performance n'est jamais créée (le taux d'échantillonnage
    // s'applique à des transactions qui n'existaient pas). C'est elle qui
    // capture aussi les Core Web Vitals (LCP/CLS/INP) automatiquement.
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
}

// Chaque route est chargée à la demande (voir App.jsx, React.lazy) sous un
// nom de fichier haché qui change à chaque déploiement. Un onglet resté
// ouvert pendant qu'un nouveau déploiement part en production pointe encore
// vers les anciens noms — dès qu'il navigue vers une route pas encore
// chargée dans cet onglet (typiquement après une mise en veille : usage
// mobile réel signalé, "erreur après quelques minutes d'inactivité"), le
// fichier haché qu'il demande n'existe plus sur le serveur. Vite émet cet
// événement précisément pour ce cas plutôt que de laisser une promesse
// rejetée remonter comme une vraie erreur applicative — un simple
// rechargement (qui récupère le nouvel index.html et ses nouveaux noms de
// fichiers) suffit à résoudre le problème, l'utilisateur n'a rien à faire.
// Garde-fou via sessionStorage : un seul rechargement automatique par
// session d'onglet, pour ne jamais boucler si le problème n'est pas
// réellement un déploiement périmé.
window.addEventListener('vite:preloadError', (event) => {
  // Sans ça, la promesse rejetée continue vers React (Suspense/ErrorBoundary)
  // en plus du rechargement déjà déclenché ici — un cas géré et récupérable
  // n'a pas besoin de remonter comme une vraie erreur applicative (bruit
  // dans Sentry une fois configuré, "Erreur non gérée" inutile en console).
  event.preventDefault();
  if (window.sessionStorage.getItem('tontunnel_reloaded_after_preload_error')) return;
  window.sessionStorage.setItem('tontunnel_reloaded_after_preload_error', '1');
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
