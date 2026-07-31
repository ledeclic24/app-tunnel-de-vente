import { apiGet, apiPatch } from './apiClient';

// Public — utilisé par la landing page pour injecter le pixel avant même
// qu'un visiteur soit connecté.
export async function fetchPublicPixelId() {
  return apiGet('/meta-pixel/public-id');
}

export async function fetchMetaPixelSettings() {
  return apiGet('/admin/meta-pixel/settings');
}

export async function updateMetaPixelSettings({ pixelId, capiAccessToken }) {
  const body = {};
  if (pixelId !== undefined) body.pixelId = pixelId;
  if (capiAccessToken !== undefined) body.capiAccessToken = capiAccessToken;
  return apiPatch('/admin/meta-pixel/settings', body);
}

export async function fetchMetaPixelEvents(params = {}) {
  const query = new URLSearchParams();
  if (params.eventName) query.set('eventName', params.eventName);
  if (params.status) query.set('status', params.status);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 20));
  return apiGet(`/admin/meta-pixel/events?${query.toString()}`);
}

export async function fetchMetaPixelStats() {
  return apiGet('/admin/meta-pixel/events/stats');
}
