import { apiGet, apiPatch } from './apiClient';

// Public — utilisé à la fois par la landing page (lecture seule) et par le
// panneau admin (qui lit le même état avant de le modifier via update()).
export async function fetchSocialProof() {
  return apiGet('/social-proof');
}

export async function updateSocialProof(enabled) {
  return apiPatch('/social-proof', { enabled });
}
