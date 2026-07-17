import React from 'react';

export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Emphase inline {{mot}} → accent + semi-gras, pour varier le traitement
// typographique au sein d'une même phrase (cahier des charges "dark
// premium" — pas seulement 1-3 mots systématiquement dans la même couleur
// plate). Uniquement à l'affichage publié : en édition, le champ
// contentEditable garde le texte brut, marqueurs {{...}} visibles, pour
// rester éditable comme n'importe quel autre champ texte.
export function renderRichText(text) {
  if (!text || typeof text !== 'string' || !text.includes('{{')) return text;
  const parts = text.split(/\{\{(.+?)\}\}/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? React.createElement('span', { key: i, className: 'text-accent font-semibold' }, part) : part,
  );
}

export const SHADOW_OPTIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'sm', label: 'Légère' },
  { value: 'md', label: 'Moyenne' },
  { value: 'lg', label: 'Marquée' },
];

const SHADOW_CLASSES = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-lg',
  lg: 'shadow-2xl',
};

export const ROUNDED_OPTIONS = [
  { value: 'none', label: 'Carré' },
  { value: 'sm', label: 'Légèrement arrondi' },
  { value: 'md', label: 'Arrondi' },
  { value: 'lg', label: 'Très arrondi' },
  { value: 'full', label: 'Pilule' },
];

const ROUNDED_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-[2rem]',
  full: 'rounded-full',
};

export const FONT_OPTIONS = [
  { value: 'sans', label: 'Grotesque (par défaut)' },
  { value: 'serif', label: 'Éditorial (serif)' },
  { value: 'mono', label: 'Mono' },
];

const FONT_CLASSES = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
};

export const FONT_WEIGHT_OPTIONS = [
  { value: 'normal', label: 'Normal', css: 400 },
  { value: 'medium', label: 'Moyen', css: 500 },
  { value: 'semibold', label: 'Semi-gras', css: 600 },
  { value: 'bold', label: 'Gras', css: 700 },
  { value: 'extrabold', label: 'Extra-gras', css: 800 },
];

export const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centré' },
  { value: 'right', label: 'Droite' },
];

export const LETTER_SPACING_OPTIONS = [
  { value: 'normal', label: 'Normal', css: 'normal' },
  { value: 'wide', label: 'Espacé', css: '0.02em' },
  { value: 'wider', label: 'Très espacé', css: '0.08em' },
];

export const LINE_HEIGHT_OPTIONS = [
  { value: 'tight', label: 'Compact', css: 1.15 },
  { value: 'normal', label: 'Normal', css: 1.5 },
  { value: 'relaxed', label: 'Aéré', css: 1.75 },
];

export const TEXT_TRANSFORM_OPTIONS = [
  { value: 'none', label: 'Normal' },
  { value: 'uppercase', label: 'MAJUSCULES' },
];

export const PADDING_OPTIONS = [
  { value: 'sm', label: 'Compact', css: 12 },
  { value: 'md', label: 'Confortable', css: 20 },
  { value: 'lg', label: 'Spacieux', css: 32 },
];

export const SECTION_PADDING_OPTIONS = [
  { value: 'sm', label: 'Compact', css: 24 },
  { value: 'md', label: 'Normal (par défaut)', css: 48 },
  { value: 'lg', label: 'Spacieux', css: 72 },
  { value: 'xl', label: 'Très spacieux', css: 112 },
];

export const OBJECT_FIT_OPTIONS = [
  { value: 'cover', label: 'Remplir (recadrer)' },
  { value: 'contain', label: 'Contenir (sans recadrer)' },
];

export const BORDER_WIDTH_OPTIONS = [
  { value: '0', label: 'Aucune' },
  { value: '1', label: 'Fine' },
  { value: '2', label: 'Moyenne' },
  { value: '4', label: 'Épaisse' },
];

// Un <br> ou une nouvelle ligne de bloc (<div>) tapée dans un champ multi-ligne doit devenir
// un vrai retour à la ligne "\n" — sinon .textContent recolle tout sur une seule ligne.
function extractEditableText(el, multiline) {
  if (!multiline) return el.textContent ?? '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  clone.querySelectorAll('div, p').forEach((node) => { node.after('\n'); });
  return (clone.textContent ?? '').replace(/\n{2,}/g, '\n').trim();
}

// Rend un élément de texte directement modifiable au clic dans l'éditeur (comme Elementor) :
// pas besoin d'ouvrir le panneau de contenu pour changer un titre ou un libellé de bouton.
export function getContentEditableProps({ editMode, onContentChange, content, field, multiline = false }) {
  if (!editMode || typeof onContentChange !== 'function') return {};
  return {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: (e) => {
      const next = extractEditableText(e.currentTarget, multiline);
      if (next !== (content?.[field] || '')) onContentChange({ ...content, [field]: next });
    },
    ...(multiline ? {} : {
      onKeyDown: (e) => {
        if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
      },
    }),
  };
}

export function getShadowClass(style) {
  return SHADOW_CLASSES[style?.shadow] || '';
}

export const SECTION_BACKGROUND_OPTIONS = [
  { value: 'white', label: 'Blanc' },
  { value: 'primary', label: 'Principale' },
  { value: 'accent', label: 'Accent (mise en avant)' },
];

// Alternance de fond primaire/blanc entre sections (cahier des charges
// "tunnel standard") : chaque bloc reçoit un fond par défaut calculé selon
// sa position dans la page (voir PublishedFunnelPage.jsx/BlockRenderer.jsx),
// surchageable manuellement via styles.section.background. La couleur hex
// libre existante (styles.section.bgColor) reste prioritaire et désactive
// ce mécanisme de classe pour laisser sa valeur inline s'appliquer sans
// concurrence (elle vit sur le wrapper englobant dans BlockRenderer.jsx).
//
// Le 3e ton "accent" (teinte de la couleur d'accent, jamais calculé par
// défaut — uniquement une surcharge manuelle ou pilotée par l'IA) sert aux
// encadrés de mise en avant (garantie, mentorat...) repérés dans l'étude
// des tunnels de référence.
//
// "primary-alt" (cahier des charges "dark premium" — jamais de fond blanc,
// aucune section ne doit revenir à un fond clair) : une variante du fond
// principal légèrement plus claire, calculée via color-mix() plutôt qu'une
// couleur de marque distincte, pour créer du rythme entre sections tout en
// restant toujours sombre. Remplace l'ancienne alternance primary/white.
export function getSectionBackground(styles, defaultBg) {
  const sectionStyle = styles?.section || {};
  if (sectionStyle.bgColor) {
    return { sectionClassName: '', headingClassName: 'text-surface', bodyClassName: 'text-surface/70', isDark: false };
  }
  const token = sectionStyle.background || defaultBg;
  if (token === 'accent') {
    return {
      sectionClassName: 'bg-accent/10 text-surface',
      headingClassName: 'text-surface',
      bodyClassName: 'text-surface/70',
      isDark: false,
    };
  }
  if (token === 'primary-alt') {
    return {
      sectionClassName: 'bg-[color-mix(in_srgb,rgb(var(--color-primary))_82%,white)] text-background',
      headingClassName: 'text-background',
      bodyClassName: 'text-background/70',
      isDark: true,
    };
  }
  const isDark = token === 'primary';
  return {
    sectionClassName: isDark ? 'bg-primary text-background' : 'bg-background text-surface',
    headingClassName: isDark ? 'text-background' : 'text-surface',
    bodyClassName: isDark ? 'text-background/70' : 'text-surface/70',
    isDark,
  };
}

export function getButtonStyle(style) {
  const result = {};
  const bg = style?.bgColor ?? style?.buttonColor;
  const text = style?.textColor ?? style?.buttonTextColor;
  if (bg) result.backgroundColor = bg;
  if (text) result.color = text;
  return result;
}

function applyTypography(style, cssStyle) {
  if (style.fontSize) cssStyle.fontSize = `${style.fontSize}px`;
  if (style.fontWeight) cssStyle.fontWeight = FONT_WEIGHT_OPTIONS.find((o) => o.value === style.fontWeight)?.css;
  if (style.textAlign) cssStyle.textAlign = style.textAlign;
  if (style.letterSpacing) cssStyle.letterSpacing = LETTER_SPACING_OPTIONS.find((o) => o.value === style.letterSpacing)?.css;
  if (style.lineHeight) cssStyle.lineHeight = LINE_HEIGHT_OPTIONS.find((o) => o.value === style.lineHeight)?.css;
  if (style.textTransform) cssStyle.textTransform = style.textTransform;
}

function applyBorder(style, cssStyle) {
  if (style.borderWidth && style.borderWidth !== '0') {
    cssStyle.borderWidth = `${style.borderWidth}px`;
    cssStyle.borderStyle = 'solid';
    cssStyle.borderColor = style.borderColor || '#0C1F16';
  }
}

// Combines a per-element style override with editor affordances (hover/selected outline,
// click-to-select) into props that can be spread directly onto the DOM node that already
// renders the element — avoids introducing wrapper divs that would break existing layouts.
export function getEditableProps({ elementKey, kind, styles, editMode, selectedElement, onSelectElement, label, blockId }) {
  const style = styles?.[elementKey] || {};
  const classes = [];
  const cssStyle = {};

  if (kind === 'text') {
    if (style.color) cssStyle.color = style.color;
    if (style.font) classes.push(FONT_CLASSES[style.font]);
    applyTypography(style, cssStyle);
  } else if (kind === 'button') {
    if (style.bgColor) cssStyle.backgroundColor = style.bgColor;
    if (style.textColor) cssStyle.color = style.textColor;
    if (style.font) classes.push(FONT_CLASSES[style.font]);
    if (style.shadow) classes.push(SHADOW_CLASSES[style.shadow]);
    if (style.rounded) classes.push(ROUNDED_CLASSES[style.rounded]);
    applyTypography(style, cssStyle);
    applyBorder(style, cssStyle);
    if (style.padding) {
      const p = PADDING_OPTIONS.find((o) => o.value === style.padding)?.css;
      if (p) cssStyle.padding = `${Math.round(p * 0.7)}px ${p * 2}px`;
    }
    if (style.fullWidth) {
      cssStyle.display = 'flex';
      cssStyle.width = '100%';
    }
  } else if (kind === 'image') {
    if (style.bgColor) cssStyle.backgroundColor = style.bgColor;
    if (style.shadow) classes.push(SHADOW_CLASSES[style.shadow]);
    if (style.rounded) classes.push(ROUNDED_CLASSES[style.rounded]);
    applyBorder(style, cssStyle);
    if (style.objectFit) cssStyle.objectFit = style.objectFit;
    if (style.opacity) cssStyle.opacity = Number(style.opacity) / 100;
  } else if (kind === 'card') {
    if (style.bgColor) cssStyle.backgroundColor = style.bgColor;
    if (style.shadow) classes.push(SHADOW_CLASSES[style.shadow]);
    if (style.rounded) classes.push(ROUNDED_CLASSES[style.rounded]);
    applyBorder(style, cssStyle);
    if (style.textAlign) cssStyle.textAlign = style.textAlign;
    if (style.padding) {
      const p = PADDING_OPTIONS.find((o) => o.value === style.padding)?.css;
      if (p) cssStyle.padding = `${p}px`;
    }
  } else if (kind === 'section') {
    if (style.bgColor) cssStyle.backgroundColor = style.bgColor;
    if (style.textColor) cssStyle.color = style.textColor;
    if (style.textAlign) cssStyle.textAlign = style.textAlign;
    if (style.shadow) classes.push(SHADOW_CLASSES[style.shadow]);
    if (style.rounded) classes.push(ROUNDED_CLASSES[style.rounded]);
    applyBorder(style, cssStyle);
    if (style.paddingY) {
      const p = SECTION_PADDING_OPTIONS.find((o) => o.value === style.paddingY)?.css;
      if (p) { cssStyle.paddingTop = `${p}px`; cssStyle.paddingBottom = `${p}px`; }
    }
  }

  if (editMode) {
    classes.push('cursor-pointer outline-dashed outline-1 outline-offset-2 outline-accent/0 hover:outline-accent/50 transition-[outline-color]');
    if (selectedElement === elementKey) {
      classes.push('!outline-2 !outline-accent');
    }
  }

  const props = {
    className: classes.filter(Boolean).join(' '),
    style: cssStyle,
    onClick: editMode
      ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelectElement(elementKey, kind, label);
        }
      : undefined,
  };

  if (blockId && style.desktop && Object.keys(style.desktop).length > 0) {
    props['data-vk'] = `${blockId}__${elementKey}`;
  }

  return props;
}

// Un élément peut avoir un réglage "Bureau" distinct de son réglage "Mobile" (par défaut).
// Comme le rendu peut se produire dans un aperçu réduit (iframe simulant un téléphone), la
// bascule doit se faire par une vraie règle CSS @media — un window.matchMedia() ne verrait
// que la fenêtre réelle du navigateur, pas la largeur simulée de l'aperçu.
const DESKTOP_FIELD_TO_CSS = {
  fontSize: (v) => `font-size:${v}px`,
  textAlign: (v) => `text-align:${v}`,
  paddingY: (v) => {
    const p = SECTION_PADDING_OPTIONS.find((o) => o.value === v)?.css;
    return p ? `padding-top:${p}px;padding-bottom:${p}px` : '';
  },
};

function sanitizeDesktopValue(field, value) {
  if (field === 'fontSize') {
    const n = Number(value);
    return Number.isFinite(n) && n >= 8 && n <= 120 ? n : null;
  }
  if (field === 'textAlign') {
    return TEXT_ALIGN_OPTIONS.some((o) => o.value === value) ? value : null;
  }
  if (field === 'paddingY') {
    return SECTION_PADDING_OPTIONS.some((o) => o.value === value) ? value : null;
  }
  return null;
}

export function buildDesktopStyleTag(blockId, styles) {
  if (!blockId || !styles) return '';
  const rules = [];
  Object.entries(styles).forEach(([elementKey, style]) => {
    if (!style?.desktop) return;
    const declarations = Object.entries(style.desktop)
      .map(([field, value]) => {
        const safeValue = sanitizeDesktopValue(field, value);
        if (safeValue === null) return null;
        const toCss = DESKTOP_FIELD_TO_CSS[field];
        return toCss ? toCss(safeValue) : null;
      })
      .filter(Boolean);
    if (declarations.length > 0) {
      rules.push(`[data-vk="${blockId}__${elementKey}"]{${declarations.join(';')}}`);
    }
  });
  if (rules.length === 0) return '';
  return `@media (min-width:768px){${rules.join('')}}`;
}
