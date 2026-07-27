import { describe, it, expect, beforeEach } from 'vitest';
import { getExitIntentState, markExitIntentShown, applyDiscount } from './exitIntentDiscount';

// Environnement de test en 'node' (voir vite.config.js) : pas de vrai
// localStorage disponible — petit polyfill en mémoire, suffisant pour
// vérifier get/set/scoping sans tirer en dépendance jsdom pour un seul
// fichier de test.
function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    clear: () => store.clear(),
  };
}
globalThis.localStorage = createMemoryStorage();

describe('getExitIntentState / markExitIntentShown', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('returns null when nothing was ever shown', () => {
    expect(getExitIntentState('funnel-1')).toBeNull();
  });

  it('persists shown state with the discount step reference', () => {
    markExitIntentShown('funnel-1', { discountStepId: 'step-1', discountPercent: 20 });
    expect(getExitIntentState('funnel-1')).toEqual({ shown: true, discountStepId: 'step-1', discountPercent: 20 });
  });

  it('survives being read again (simulating a page reload)', () => {
    markExitIntentShown('funnel-1', { discountStepId: 'step-1', discountPercent: 20 });
    // A second read (as would happen after a reload) must return the same state.
    expect(getExitIntentState('funnel-1')).not.toBeNull();
    expect(getExitIntentState('funnel-1').shown).toBe(true);
  });

  it('is scoped per funnel', () => {
    markExitIntentShown('funnel-1', { discountStepId: 'step-1', discountPercent: 20 });
    expect(getExitIntentState('funnel-2')).toBeNull();
  });

  it('handles being shown with no discount configured', () => {
    markExitIntentShown('funnel-1', {});
    expect(getExitIntentState('funnel-1')).toEqual({ shown: true, discountStepId: null, discountPercent: null });
  });
});

describe('applyDiscount', () => {
  it('reduces the amount by the given percentage', () => {
    expect(applyDiscount(100, 20)).toBe(80);
    expect(applyDiscount(19.99, 10)).toBeCloseTo(17.99, 2);
  });

  it('leaves the amount untouched for invalid percentages', () => {
    expect(applyDiscount(100, 0)).toBe(100);
    expect(applyDiscount(100, 100)).toBe(100);
    expect(applyDiscount(100, -5)).toBe(100);
    expect(applyDiscount(100, NaN)).toBe(100);
  });

  it('leaves non-finite amounts untouched', () => {
    expect(applyDiscount(NaN, 20)).toBeNaN();
  });
});
