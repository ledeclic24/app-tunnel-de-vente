import { apiGet } from './apiClient';

export async function fetchAnalyticsData() {
  const data = await apiGet('/analytics/admin-overview');
  return {
    profiles: (data.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      plan: u.plan,
      created_at: u.createdAt,
    })),
    funnels: (data.funnels || []).map((f) => ({ id: f.id, created_at: f.createdAt })),
    leads: (data.leads || []).map((l) => ({ id: l.id, created_at: l.createdAt })),
    planEvents: (data.planEvents || []).map((e) => ({
      id: e.id,
      old_plan: e.fromPlan,
      new_plan: e.toPlan,
      changed_at: e.changedAt,
    })),
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
