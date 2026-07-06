import { supabase } from './supabaseClient';

export async function fetchAnalyticsData() {
  const [profilesRes, funnelsRes, leadsRes, eventsRes] = await Promise.all([
    supabase.from('profiles').select('id,email,plan,created_at'),
    supabase.from('funnels').select('id,created_at'),
    supabase.from('leads').select('id,created_at'),
    supabase.from('plan_change_events').select('*').order('changed_at', { ascending: false }),
  ]);
  if (profilesRes.error) throw profilesRes.error;
  if (funnelsRes.error) throw funnelsRes.error;
  if (leadsRes.error) throw leadsRes.error;
  if (eventsRes.error) throw eventsRes.error;

  return {
    profiles: profilesRes.data || [],
    funnels: funnelsRes.data || [],
    leads: leadsRes.data || [],
    planEvents: eventsRes.data || [],
  };
}

export function bucketByDay(rows, dateField, days) {
  const buckets = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({ date: d, key: d.toISOString().slice(0, 10), count: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  rows.forEach((row) => {
    const key = new Date(row[dateField]).toISOString().slice(0, 10);
    const bucket = byKey.get(key);
    if (bucket) bucket.count += 1;
  });
  return buckets.map((b) => ({
    label: b.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    count: b.count,
  }));
}
