import { describe, it, expect } from 'vitest';
import { formatPrice, resolveStickyFooterPrice } from './currency';

describe('formatPrice', () => {
  it('formats XOF with the F CFA symbol', () => {
    const result = formatPrice(29000, 'XOF');
    expect(result).toContain('29');
    expect(result).toContain('000');
    expect(result).toContain('F');
    expect(result).toContain('CFA');
  });

  it('formats USD and EUR with their symbols', () => {
    expect(formatPrice(29000, 'USD')).toContain('$');
    expect(formatPrice(29000, 'EUR')).toContain('€');
  });

  it('falls back to the ISO code for GHS and NGN', () => {
    expect(formatPrice(29000, 'GHS')).toContain('GHS');
    expect(formatPrice(29000, 'NGN')).toContain('NGN');
  });

  it('defaults to XOF when no currency is given', () => {
    expect(formatPrice(1000)).toBe(formatPrice(1000, 'XOF'));
  });

  it('keeps decimals only when the amount has them', () => {
    expect(formatPrice(19.99, 'EUR')).toContain('19,99');
    expect(formatPrice(20, 'EUR')).not.toContain(',');
  });

  it('returns an empty string for non-finite amounts (e.g. unparsable free text)', () => {
    expect(formatPrice(NaN, 'XOF')).toBe('');
    expect(formatPrice(Infinity, 'XOF')).toBe('');
  });
});

describe('resolveStickyFooterPrice', () => {
  const blocks = [
    { id: 'b1', type: 'pricing', content: { plans: [{ name: 'Standard', price: '19000' }, { name: 'Premium', price: '29 000 FCFA' }] } },
    { id: 'b2', type: 'hero', content: {} },
  ];

  it('resolves the referenced plan and formats it', () => {
    const result = resolveStickyFooterPrice({ priceBlockId: 'b1', planIndex: 1 }, blocks, 'XOF');
    expect(result).toContain('29');
    expect(result).toContain('000');
  });

  it('returns empty when nothing is referenced yet', () => {
    expect(resolveStickyFooterPrice({}, blocks, 'XOF')).toBe('');
    expect(resolveStickyFooterPrice(null, blocks, 'XOF')).toBe('');
  });

  it('returns empty when the referenced block was deleted', () => {
    expect(resolveStickyFooterPrice({ priceBlockId: 'gone', planIndex: 0 }, blocks, 'XOF')).toBe('');
  });

  it('returns empty when the referenced block is not a pricing block', () => {
    expect(resolveStickyFooterPrice({ priceBlockId: 'b2', planIndex: 0 }, blocks, 'XOF')).toBe('');
  });
});
