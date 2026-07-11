import { apiGet, apiPost } from './apiClient';

export async function generateTunnelWithAI({ description, category, images, price, paletteHint }) {
  const { funnel } = await apiPost('/ai/funnels', { description, category, images, price, paletteHint });
  return funnel;
}

export async function editFunnelWithAI(funnelId, instruction) {
  const { funnel } = await apiPost(`/ai/funnels/${funnelId}/edit`, { instruction });
  return funnel;
}

export async function fetchAIUsageThisMonth(_userId) {
  const { count } = await apiGet('/ai/usage');
  return count || 0;
}
