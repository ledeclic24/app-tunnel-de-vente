import React from 'react';
import * as Sentry from '@sentry/react';
import Spinner from './app/Spinner';

// Filet de sécurité complémentaire à l'écouteur `vite:preloadError` de
// main.jsx : celui-ci couvre l'échec de PRÉCHARGEMENT du module (avant
// exécution), mais selon le navigateur/la façon dont l'échec se produit,
// l'erreur peut aussi remonter directement ici comme une exception React
// classique — mêmes messages caractéristiques d'un chunk périmé après un
// déploiement (voir main.jsx pour le contexte complet).
const CHUNK_ERROR_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  /load failed/i,
  /chunkloaderror/i,
];

function isChunkLoadError(error) {
  return CHUNK_ERROR_PATTERNS.some((re) => re.test(error?.message || ''));
}

const RELOAD_GUARD_KEY = 'tontunnel_reloaded_after_preload_error';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, reloading: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Un seul rechargement automatique par session d'onglet (même garde que
    // main.jsx) : si l'erreur persiste après ça, ce n'est pas un chunk
    // périmé, pas la peine de boucler.
    if (isChunkLoadError(error) && !window.sessionStorage.getItem(RELOAD_GUARD_KEY)) {
      window.sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
      this.setState({ reloading: true });
      window.location.reload();
      return;
    }
    console.error('Erreur non gérée :', error, info);
    Sentry.captureException(error);
  }

  render() {
    if (this.state.reloading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      );
    }
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-2xl font-sans font-bold text-surface mb-2">Une erreur est survenue</h1>
          <p className="text-surface/60 mb-6 max-w-sm">
            Quelque chose s'est mal passé. Essaie de recharger la page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="magnetic-btn bg-accent text-background px-6 py-3 rounded-xl text-sm font-semibold"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
