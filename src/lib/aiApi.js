import { supabase } from './supabaseClient';

export async function generateTunnelWithAI({ description, category, images, price, paletteHint }) {
  const { data, error } = await supabase.functions.invoke('generate-tunnel', {
    body: { description, category, images, price, paletteHint },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.funnel;
}

export async function fetchAIUsageThisMonth(userId) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from('ai_generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());
  if (error) throw error;
  return count || 0;
}
