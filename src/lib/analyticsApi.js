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
    pageviews: (data.pageviews || []).map((p) => ({
      name: p.name,
      visitor_id: p.visitorId,
      created_at: p.createdAt,
    })),
    actions: (data.actions || []).map((a) => ({
      name: a.name,
      path: a.path,
      visitor_id: a.visitorId,
      created_at: a.createdAt,
    })),
  };
}

// Clé de jour calendaire LOCALE (année-mois-jour tels qu'affichés à
// l'utilisateur), jamais via toISOString() qui convertit en UTC : pour
// n'importe quel fuseau à décalage positif (dont l'Afrique de l'Ouest/
// Centrale, cœur de cible de l'app), minuit local converti en UTC retombe
// sur la veille, ce qui décale silencieusement tous les évènements du jour
// même hors de leur case (ils disparaissent du graphe au lieu de s'afficher).
function localDayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function bucketByDay(rows, dateField, days) {
  const buckets = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({ date: d, key: localDayKey(d), count: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  rows.forEach((row) => {
    const bucket = byKey.get(localDayKey(new Date(row[dateField])));
    if (bucket) bucket.count += 1;
  });
  return buckets.map((b) => ({
    label: b.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    count: b.count,
  }));
}

// Même principe que bucketByDay, mais répartit chaque ligne dans une série
// distincte (ex. plan d'abonnement) au lieu d'un seul total par jour —
// nécessaire pour un graphe empilé (aire empilée gratuit/payant par jour).
export function bucketByDayMultiSeries(rows, dateField, seriesField, seriesKeys, days) {
  const buckets = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const entry = { key: localDayKey(d), label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) };
    seriesKeys.forEach((s) => { entry[s] = 0; });
    buckets.push(entry);
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  rows.forEach((row) => {
    const bucket = byKey.get(localDayKey(new Date(row[dateField])));
    const series = row[seriesField] || seriesKeys[0];
    if (bucket && series in bucket) bucket[series] += 1;
  });
  return buckets;
}

// Compte les identifiants uniques par jour plutôt que le nombre de lignes —
// nécessaire pour le nombre de visiteurs uniques quotidiens (une même
// personne peut générer plusieurs pageviews le même jour).
export function bucketUniqueByDay(rows, dateField, idField, days) {
  const buckets = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({ date: d, key: localDayKey(d), set: new Set() });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  rows.forEach((row) => {
    const bucket = byKey.get(localDayKey(new Date(row[dateField])));
    if (bucket) bucket.set.add(row[idField]);
  });
  return buckets.map((b) => ({
    label: b.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    count: b.set.size,
  }));
}
