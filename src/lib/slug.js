export function slugify(text) {
  const normalized = text.toString().normalize('NFD');
  let stripped = '';
  for (const ch of normalized) {
    const code = ch.codePointAt(0);
    if (code < 0x0300 || code > 0x036f) stripped += ch;
  }
  return stripped
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'tunnel';
}

export function generateFunnelSlug(name) {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slugify(name)}-${suffix}`;
}
