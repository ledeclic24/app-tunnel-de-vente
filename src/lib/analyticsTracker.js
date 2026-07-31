import { apiPost } from './apiClient';

const VISITOR_ID_KEY = 'tontunnel_visitor_id';

// UUID anonyme persisté côté navigateur — jamais relié à un compte ni à une
// IP, sert uniquement à distinguer "visites" de "visiteurs uniques" dans
// l'admin (voir AppAnalyticsService côté backend). Généré une seule fois,
// réutilisé à chaque visite tant que le stockage local n'est pas vidé.
function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    // Stockage indisponible (mode privé strict) — un id éphémère par appel
    // suffit à ne pas casser le tracking, juste à ne pas compter comme un
    // visiteur "récurrent".
    return crypto.randomUUID();
  }
}

function send(payload) {
  apiPost('/analytics/track', payload).catch(() => {});
}

export function trackPageview(path) {
  send({ type: 'pageview', name: path, path, visitorId: getVisitorId() });
}

export function trackAction(name, path) {
  send({ type: 'action', name, path: path ?? window.location.pathname, visitorId: getVisitorId() });
}
