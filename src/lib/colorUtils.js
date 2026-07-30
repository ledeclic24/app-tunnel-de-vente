export function hexToRgbTriplet(hex) {
  if (!hex) return null;
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return null;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r} ${g} ${b}`;
}

export const BRAND_FONTS = [
  { value: 'Manrope', label: 'Manrope (par défaut)' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: '"Playfair Display"', label: 'Playfair Display' },
  { value: '"Space Grotesk"', label: 'Space Grotesk' },
  { value: 'Sora', label: 'Sora' },
];

export function brandStyleVars(brand) {
  if (!brand) return {};
  const style = {};
  const primary = hexToRgbTriplet(brand.primaryColor);
  const accent = hexToRgbTriplet(brand.accentColor);
  const buttonBg = hexToRgbTriplet(brand.buttonColor);
  const buttonText = hexToRgbTriplet(brand.buttonTextColor);
  if (primary) style['--color-primary'] = primary;
  if (accent) style['--color-accent'] = accent;
  // Repli sur --color-accent/--color-background tant qu'aucune couleur de
  // bouton dédiée n'est définie — voir .btn-brand dans index.css.
  if (buttonBg) style['--button-bg'] = buttonBg;
  if (buttonText) style['--button-text'] = buttonText;
  if (brand.font) style['--font-sans'] = `${brand.font}, sans-serif`;
  return style;
}
