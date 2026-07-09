import { describe, it, expect } from 'vitest';
import { PLANS, PLAN_ORDER, getPlan, formatPrice } from './plans';

describe('getPlan', () => {
  it('returns the matching plan', () => {
    expect(getPlan('createur').key).toBe('createur');
  });

  it('falls back to starter for unknown or missing plan keys', () => {
    expect(getPlan('nope-not-a-plan')).toBe(PLANS.starter);
    expect(getPlan(undefined)).toBe(PLANS.starter);
  });
});

describe('formatPrice', () => {
  it('formats zero as free', () => {
    expect(formatPrice(0)).toBe('Gratuit');
  });

  it('formats null/undefined as "Sur devis"', () => {
    expect(formatPrice(null)).toBe('Sur devis');
    expect(formatPrice(undefined)).toBe('Sur devis');
  });

  it('formats a positive price with the FCFA suffix', () => {
    const formatted = formatPrice(19000);
    expect(formatted).toContain('19');
    expect(formatted).toContain('000');
    expect(formatted.endsWith('FCFA')).toBe(true);
  });
});

describe('plan hierarchy', () => {
  it('keeps starter as the most restrictive plan', () => {
    expect(PLANS.starter.maxFunnels).toBe(1);
    expect(PLANS.starter.aiAccess).toBe(false);
    expect(PLANS.starter.showBranding).toBe(true);
  });

  it('gives paid plans unlimited funnels', () => {
    expect(PLANS.createur.maxFunnels).toBe(Infinity);
    expect(PLANS.entreprise.maxFunnels).toBe(Infinity);
  });

  it('orders plans from cheapest to most expensive', () => {
    const prices = PLAN_ORDER.map((key) => PLANS[key].price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
