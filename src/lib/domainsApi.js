import { apiGet, apiPost, apiDelete } from './apiClient';

export async function fetchDomains() {
  return apiGet('/domains');
}

export async function addDomain(funnelId, domain) {
  return apiPost('/domains', { funnelId, domain });
}

export async function checkDomainStatus(domainId) {
  return apiPost(`/domains/${domainId}/check`);
}

export async function removeDomain(domainId) {
  await apiDelete(`/domains/${domainId}`);
}

// Public, non authentifié : résout un nom d'hôte vers le tunnel à afficher
// (voir App.jsx, CustomDomainGate). N'utilise pas apiClient pour rester
// indépendant du cycle de vie du token JWT (appelé avant toute connexion).
export async function resolveDomain(hostname) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await fetch(`${API_URL}/domains/resolve?domain=${encodeURIComponent(hostname)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.funnelSlug || null;
}
