import { apiGet, apiPost, apiDelete, getAccessToken } from './apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function generateImages({ prompt, size, n, style, imageType, background }) {
  const { images } = await apiPost('/images/generate', { prompt, size, n, style, imageType, background });
  return images;
}

export async function fetchImageUsageThisMonth() {
  const { count } = await apiGet('/images/usage');
  return count || 0;
}

export async function fetchImages() {
  const { images } = await apiGet('/images');
  return images || [];
}

export async function deleteImage(id) {
  await apiDelete(`/images/${id}`);
}

// Les images sont hébergées sur un domaine de stockage tiers (R2/S3) : un
// fetch() direct de leur URL échoue silencieusement (bucket sans en-têtes
// CORS pour la lecture cross-origin — un <img> les affiche très bien, ce
// qui masquait le problème). On passe donc par un proxy authentifié côté
// backend (fetch serveur-à-serveur, jamais soumis à CORS), même schéma que
// downloadEbookPdf/downloadEbookEpub.
export async function downloadImage(id, filename) {
  const res = await fetch(`${API_URL}/images/${id}/download`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('server_error');
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename || 'image.webp';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

// Retourne le Blob directement (sans déclencher de téléchargement) — pour
// le téléchargement groupé en ZIP (voir ImageStudioPage.jsx).
export async function fetchImageBlob(id) {
  const res = await fetch(`${API_URL}/images/${id}/download`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('server_error');
  return res.blob();
}
