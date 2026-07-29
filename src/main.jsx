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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
