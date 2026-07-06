import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { fetchPlanPrices, updatePlanPrice } from '../../../lib/plansApi';
import { PLAN_ORDER, getPlan } from '../../../lib/plans';

export default function AdminPlansPage() {
  const [prices, setPrices] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);

  const load = async () => {
    const data = await fetchPlanPrices();
    setPrices(data);
    const next = {};
    PLAN_ORDER.forEach((key) => { next[key] = data[key]?.price ?? getPlan(key).price; });
    setDrafts(next);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (key) => {
    setSavingKey(key);
    await updatePlanPrice(key, Number(drafts[key]) || 0);
    await load();
    setSavingKey(null);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2000);
  };

  if (!prices) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-zinc-400 mb-6 max-w-xl text-sm">
        Modifie le prix affiché pour chaque plan sur la landing page et l'espace facturation. Les fonctionnalités et limites de chaque plan restent définies dans le code de l'application.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        {PLAN_ORDER.map((key) => {
          const plan = getPlan(key);
          return (
            <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-sans font-semibold text-zinc-100 mb-4">{plan.name}</h3>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Prix (FCFA / mois)</label>
              <input
                type="number"
                min="0"
                value={drafts[key] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors mb-4"
              />
              <button
                onClick={() => handleSave(key)}
                disabled={savingKey === key}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 hover:bg-emerald-400 transition-colors"
              >
                <Save className="w-4 h-4" />
                {savingKey === key ? 'Enregistrement...' : savedKey === key ? 'Enregistré ✓' : 'Enregistrer'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
