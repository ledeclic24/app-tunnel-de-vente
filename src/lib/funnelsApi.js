import { supabase } from './supabaseClient';
import { getTemplate } from './funnelTemplates';
import { generateFunnelSlug } from './slug';

export async function fetchUserFunnels(userId) {
  const { data, error } = await supabase
    .from('funnels')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function insertSteps(funnelId, steps) {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const { data: stepRow, error: stepError } = await supabase
      .from('funnel_steps')
      .insert({ funnel_id: funnelId, name: step.name, slug: step.slug, step_type: step.step_type, position: i })
      .select()
      .single();
    if (stepError) throw stepError;

    if (step.blocks.length > 0) {
      const blockRows = step.blocks.map((b, j) => ({
        step_id: stepRow.id, type: b.type, content: b.content, position: j,
      }));
      const { error: blocksError } = await supabase.from('blocks').insert(blockRows);
      if (blocksError) throw blocksError;
    }
  }
}

export async function createFunnelFromTemplate({ userId, name, templateKey, showBranding = true }) {
  const template = getTemplate(templateKey);
  const slug = generateFunnelSlug(name);

  const { data: funnel, error: funnelError } = await supabase
    .from('funnels')
    .insert({
      user_id: userId, name, slug, template: templateKey, show_branding: showBranding,
      category: template.categoryKey || 'personnalise',
    })
    .select()
    .single();
  if (funnelError) throw funnelError;

  await insertSteps(funnel.id, template.steps);
  return funnel;
}

export async function createFunnelFromAI({ userId, name, generatedFunnel, showBranding = true, category = 'personnalise' }) {
  const slug = generateFunnelSlug(name);

  const { data: funnel, error: funnelError } = await supabase
    .from('funnels')
    .insert({
      user_id: userId,
      name,
      slug,
      template: 'ia',
      show_branding: showBranding,
      brand: generatedFunnel.brand || {},
      category,
    })
    .select()
    .single();
  if (funnelError) throw funnelError;

  await insertSteps(funnel.id, generatedFunnel.steps);
  return funnel;
}

export async function fetchFunnel(funnelId) {
  const { data, error } = await supabase.from('funnels').select('*').eq('id', funnelId).single();
  if (error) throw error;
  return data;
}

export async function fetchFunnelBySlug(slug) {
  const { data, error } = await supabase.from('funnels').select('*').eq('slug', slug).single();
  if (error) throw error;
  return data;
}

export async function updateFunnel(funnelId, patch) {
  const { error } = await supabase.from('funnels').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', funnelId);
  if (error) throw error;
}

export async function deleteFunnel(funnelId) {
  const { error } = await supabase.from('funnels').delete().eq('id', funnelId);
  if (error) throw error;
}

export async function updateBrandingForUser(userId, showBranding) {
  const { error } = await supabase.from('funnels').update({ show_branding: showBranding }).eq('user_id', userId);
  if (error) throw error;
}

export async function fetchSteps(funnelId) {
  const { data, error } = await supabase
    .from('funnel_steps')
    .select('*')
    .eq('funnel_id', funnelId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addStep(funnelId, { name, slug, position }) {
  const { data, error } = await supabase
    .from('funnel_steps')
    .insert({ funnel_id: funnelId, name, slug, step_type: 'custom', position })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStep(stepId, patch) {
  const { error } = await supabase.from('funnel_steps').update(patch).eq('id', stepId);
  if (error) throw error;
}

export async function deleteStep(stepId) {
  const { error } = await supabase.from('funnel_steps').delete().eq('id', stepId);
  if (error) throw error;
}

export async function fetchBlocks(stepId) {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('step_id', stepId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addBlock(stepId, type, content, position) {
  const { data, error } = await supabase
    .from('blocks')
    .insert({ step_id: stepId, type, content, position })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBlock(blockId, content) {
  const { error } = await supabase.from('blocks').update({ content }).eq('id', blockId);
  if (error) throw error;
}

export async function deleteBlock(blockId) {
  const { error } = await supabase.from('blocks').delete().eq('id', blockId);
  if (error) throw error;
}

export async function swapBlockPositions(blockA, blockB) {
  await Promise.all([
    supabase.from('blocks').update({ position: blockB.position }).eq('id', blockA.id),
    supabase.from('blocks').update({ position: blockA.position }).eq('id', blockB.id),
  ]);
}

export async function swapStepPositions(stepA, stepB) {
  await Promise.all([
    supabase.from('funnel_steps').update({ position: stepB.position }).eq('id', stepA.id),
    supabase.from('funnel_steps').update({ position: stepA.position }).eq('id', stepB.id),
  ]);
}

export async function reorderBlocks(blockIdsInOrder) {
  await Promise.all(blockIdsInOrder.map((id, index) => supabase.from('blocks').update({ position: index }).eq('id', id)));
}

export async function reorderSteps(stepIdsInOrder) {
  await Promise.all(stepIdsInOrder.map((id, index) => supabase.from('funnel_steps').update({ position: index }).eq('id', id)));
}

export async function insertLead({ funnelId, stepId, name, email }) {
  const { error } = await supabase.from('leads').insert({ funnel_id: funnelId, step_id: stepId, name, email });
  if (error) throw error;
}

export async function countLeads(funnelId) {
  const { count, error } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('funnel_id', funnelId);
  if (error) throw error;
  return count || 0;
}

export async function incrementStepView(stepId) {
  await supabase.rpc('increment_step_view', { p_step_id: stepId });
}

export async function fetchLeadsForUser(userId) {
  const { data: funnels, error: fErr } = await supabase.from('funnels').select('id, name').eq('user_id', userId);
  if (fErr) throw fErr;
  const funnelMap = new Map(funnels.map((f) => [f.id, f.name]));
  const funnelIds = funnels.map((f) => f.id);
  if (funnelIds.length === 0) return [];
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .in('funnel_id', funnelIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return leads.map((l) => ({ ...l, funnelName: funnelMap.get(l.funnel_id) || '—' }));
}

export async function fetchFunnelStepsAnalytics(funnelId) {
  const { data: steps, error } = await supabase
    .from('funnel_steps')
    .select('*')
    .eq('funnel_id', funnelId)
    .order('position', { ascending: true });
  if (error) throw error;
  const { data: leads, error: lErr } = await supabase.from('leads').select('step_id').eq('funnel_id', funnelId);
  if (lErr) throw lErr;
  const leadCountByStep = {};
  leads.forEach((l) => { leadCountByStep[l.step_id] = (leadCountByStep[l.step_id] || 0) + 1; });
  return steps.map((s) => ({ ...s, leadCount: leadCountByStep[s.id] || 0 }));
}
