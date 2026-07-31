import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../lib/analyticsTracker';

// Trafic anonyme des pages PUBLIQUES seulement — exclut /app (dashboard
// authentifié, hors sujet pour mesurer l'acquisition) et /f/* (tunnels
// publiés des vendeurs, qui ont déjà leur propre compteur de vues, voir
// FunnelStep.views).
function isTrackedPath(pathname) {
  return !pathname.startsWith('/app') && !pathname.startsWith('/f/');
}

export default function AnalyticsTracker() {
  const location = useLocation();
  const lastTracked = useRef(null);

  useEffect(() => {
    if (location.pathname === lastTracked.current) return;
    lastTracked.current = location.pathname;
    if (isTrackedPath(location.pathname)) {
      trackPageview(location.pathname);
    }
  }, [location.pathname]);

  return null;
}
