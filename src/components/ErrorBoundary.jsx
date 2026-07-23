import React from 'react';
import * as Sentry from '@sentry/react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erreur non gérée :', error, info);
    Sentry.captureException(error);
  }

  render() {
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
