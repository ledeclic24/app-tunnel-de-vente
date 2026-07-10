import { apiDelete, apiGet, apiPost } from './apiClient';

export async function startMetaAdsConnect() {
  const { url } = await apiPost('/meta-ads/oauth/start');
  return url;
}

export async function fetchMetaAdAccounts() {
  return apiGet('/meta-ads/accounts');
}

export async function disconnectMetaAdAccount(accountId) {
  await apiDelete(`/meta-ads/accounts/${accountId}`);
}

export async function fetchMetaAdCampaigns(accountId) {
  return apiGet(`/meta-ads/accounts/${accountId}/campaigns`);
}

export async function fetchMetaAdInsights(accountId, datePreset = 'last_30d') {
  return apiGet(`/meta-ads/accounts/${accountId}/insights?datePreset=${encodeURIComponent(datePreset)}`);
}

export async function fetchMetaAdsSummary(accountId, datePreset = 'last_30d') {
  return apiGet(`/meta-ads/accounts/${accountId}/summary?datePreset=${encodeURIComponent(datePreset)}`);
}
