import { apiGet, apiPost } from './apiClient';

export async function generateImages({ prompt, size, n }) {
  const { urls } = await apiPost('/images/generate', { prompt, size, n });
  return urls;
}

export async function fetchImageUsageThisMonth() {
  const { count } = await apiGet('/images/usage');
  return count || 0;
}

export async function fetchImages() {
  const { images } = await apiGet('/images');
  return images || [];
}
