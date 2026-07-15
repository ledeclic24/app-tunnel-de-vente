import { apiGet, apiPost, apiDelete } from './apiClient';

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
// simple <a download> y est ignoré par le navigateur (ouverture dans un
// nouvel onglet) faute de Content-Disposition côté serveur de stockage —
// on récupère donc l'image en Blob puis on déclenche le téléchargement.
export async function downloadImage(url, filename) {
  const res = await fetch(url);
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
