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
