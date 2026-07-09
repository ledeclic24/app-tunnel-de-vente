import { describe, it, expect } from 'vitest';
import { hexToRgbTriplet, brandStyleVars } from './colorUtils';

describe('hexToRgbTriplet', () => {
  it('converts a 6-digit hex color to an "r g b" triplet', () => {
    expect(hexToRgbTriplet('#22C55E')).toBe('34 197 94');
  });

  it('expands a 3-digit shorthand hex color', () => {
    expect(hexToRgbTriplet('#fff')).toBe('255 255 255');
  });

  it('returns null for missing or invalid input', () => {
    expect(hexToRgbTriplet(null)).toBeNull();
    expect(hexToRgbTriplet('')).toBeNull();
    expect(hexToRgbTriplet('not-a-color')).toBeNull();
  });
});

describe('brandStyleVars', () => {
  it('returns an empty object when there is no brand', () => {
    expect(brandStyleVars(null)).toEqual({});
    expect(brandStyleVars(undefined)).toEqual({});
  });

  it('maps brand colors to CSS custom properties', () => {
    const vars = brandStyleVars({ primaryColor: '#000000', accentColor: '#22C55E' });
    expect(vars['--color-primary']).toBe('0 0 0');
    expect(vars['--color-accent']).toBe('34 197 94');
  });

  it('maps a custom font to --font-sans', () => {
    const vars = brandStyleVars({ font: 'Poppins' });
    expect(vars['--font-sans']).toBe('Poppins, sans-serif');
  });

  it('ignores unset fields', () => {
    expect(brandStyleVars({})).toEqual({});
  });
});
