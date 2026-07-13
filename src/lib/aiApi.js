import { apiGet, apiPost } from './apiClient';

export async function generateTunnelWithAI({ description, category, categoryKey, cible, images, price, paletteHint }) {
  const { funnel } = await apiPost('/ai/funnels', { description, category, categoryKey, cible, images, price, paletteHint });
  return funnel;
}

export async function editFunnelWithAI(funnelId, instruction) {
  const { funnel } = await apiPost(`/ai/funnels/${funnelId}/edit`, { instruction });
  return funnel;
}

export async function regenerateBlockWithAI(blockId, instruction) {
  const { block } = await apiPost(`/ai/blocks/${blockId}/regenerate`, instruction ? { instruction } : {});
  return block;
}

export async function generateBlockImageWithAI(blockId, imageType) {
  const { block } = await apiPost(`/ai/blocks/${blockId}/generate-image`, { imageType });
  return block;
}

export async function fetchAIUsageThisMonth(_userId) {
  const { count } = await apiGet('/ai/usage');
  return count || 0;
}
