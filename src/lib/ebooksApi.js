import { apiGet, apiPost, apiPatch, apiDelete, getAccessToken } from './apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function generateOutline({ title, description, tone, language, length, brand, subtitle, authorName }) {
  return apiPost('/ebooks/generate-outline', { title, description, tone, language, length, brand, subtitle, authorName });
}

export async function fetchEbooks() {
  return apiGet('/ebooks');
}

export async function fetchEbook(ebookId) {
  return apiGet(`/ebooks/${ebookId}`);
}

export async function updateEbook(ebookId, patch) {
  return apiPatch(`/ebooks/${ebookId}`, patch);
}

export async function deleteEbook(ebookId) {
  await apiDelete(`/ebooks/${ebookId}`);
}

export async function addChapter(ebookId, { title, description }) {
  return apiPost(`/ebooks/${ebookId}/chapters`, { title, description });
}

export async function updateChapter(chapterId, patch) {
  return apiPatch(`/ebooks/chapters/${chapterId}`, patch);
}

export async function deleteChapter(chapterId) {
  await apiDelete(`/ebooks/chapters/${chapterId}`);
}

export async function reorderChapters(chapterIdsInOrder) {
  await apiPost('/ebooks/chapters/reorder', { chapterIds: chapterIdsInOrder });
}

export async function generateChapterContent(chapterId) {
  return apiPost(`/ebooks/chapters/${chapterId}/generate`);
}

// Actions groupées sur le sommaire (sélection de chapitres).
export async function regenerateChapters(ebookId, chapterIds) {
  const { chapters } = await apiPost(`/ebooks/${ebookId}/chapters/regenerate`, { chapterIds });
  return chapters;
}

export async function bulkDeleteChapters(ebookId, chapterIds) {
  const { chapters } = await apiPost(`/ebooks/${ebookId}/chapters/bulk-delete`, { chapterIds });
  return chapters;
}

export async function generateMoreChapters(ebookId, { count, guidance }) {
  const { chapters } = await apiPost(`/ebooks/${ebookId}/chapters/generate-more`, { count, guidance });
  return chapters;
}

// Génération d'images (couverture / illustration de chapitre) — quota
// image uniquement, voir EbooksService.generateCover/generateChapterImage.
export async function generateCover(ebookId) {
  return apiPost(`/ebooks/${ebookId}/generate-cover`);
}

export async function generateChapterImage(chapterId) {
  return apiPost(`/ebooks/chapters/${chapterId}/generate-image`);
}

export async function fetchEbookUsageThisMonth() {
  const { count } = await apiGet('/ebooks/usage');
  return count || 0;
}

// Téléchargement binaire : le token JWT vit en mémoire (jamais dans un
// cookie ni le storage), donc un simple lien <a href> ne l'enverrait pas —
// on récupère le PDF en Blob authentifié puis on déclenche le téléchargement
// nous-mêmes.
export async function downloadEbookPdf(ebookId, filename) {
  const res = await fetch(`${API_URL}/ebooks/${ebookId}/pdf`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('server_error');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'ebook.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
