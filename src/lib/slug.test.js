import { describe, it, expect } from 'vitest';
import { slugify, generateFunnelSlug } from './slug';

describe('slugify', () => {
  it('lowercases and dasherizes text', () => {
    expect(slugify('Mon Super Tunnel')).toBe('mon-super-tunnel');
  });

  it('strips accents', () => {
    expect(slugify('Élégance Française')).toBe('elegance-francaise');
  });

  it('removes non-alphanumeric characters', () => {
    expect(slugify('50% de réduction !!!')).toBe('50-de-reduction');
  });

  it('falls back to "tunnel" for empty input', () => {
    expect(slugify('')).toBe('tunnel');
    expect(slugify('   ')).toBe('tunnel');
  });
});

describe('generateFunnelSlug', () => {
  it('appends a random suffix to the slugified name', () => {
    const slug = generateFunnelSlug('Ma Formation');
    expect(slug).toMatch(/^ma-formation-[a-z0-9]{4}$/);
  });

  it('produces different slugs for the same name', () => {
    const a = generateFunnelSlug('Même Nom');
    const b = generateFunnelSlug('Même Nom');
    expect(a).not.toBe(b);
  });
});
