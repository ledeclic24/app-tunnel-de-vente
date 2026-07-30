import { apiFetch } from './apiClient';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadImage(_userId, file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Format non supporté (utilise JPG, PNG, WEBP ou GIF).');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image trop lourde (5 Mo maximum).');
  }
  const formData = new FormData();
  formData.append('file', file);
  const { url } = await apiFetch('/storage/images', { method: 'POST', body: formData });
  return url;
}

const MAX_DELIVERABLE_BYTES = 50 * 1024 * 1024; // 50 Mo
const ALLOWED_DELIVERABLE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/epub+zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4',
];

// Fichier de livraison (PDF, archive...) — voir FunnelSettingsPanel.jsx,
// livré au client par lien de téléchargement dans l'e-mail (jamais en
// pièce jointe, taille potentiellement bien plus grande qu'un ebook).
export async function uploadDeliverableFile(file) {
  if (!ALLOWED_DELIVERABLE_TYPES.includes(file.type)) {
    throw new Error('Format non supporté (PDF, ZIP, EPUB, DOC(X), PPT(X) ou MP4).');
  }
  if (file.size > MAX_DELIVERABLE_BYTES) {
    throw new Error('Fichier trop lourd (50 Mo maximum).');
  }
  const formData = new FormData();
  formData.append('file', file);
  const { url } = await apiFetch('/storage/files', { method: 'POST', body: formData });
  return { url, name: file.name };
}
