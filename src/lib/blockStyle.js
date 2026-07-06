export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
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
  { value: 'md', label: 'Arrondi' },
  { value: 'full', label: 'Pilule' },
];

const ROUNDED_CLASSES = {
  none: 'rounded-none',
  md: 'rounded-2xl',
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

export function getShadowClass(style) {
  return SHADOW_CLASSES[style?.shadow] || '';
}

export function getButtonStyle(style) {
  const result = {};
  const bg = style?.bgColor ?? style?.buttonColor;
  const text = style?.textColor ?? style?.buttonTextColor;
  if (bg) result.backgroundColor = bg;
  if (text) result.color = text;
  return result;
}

// Combines a per-element style override with editor affordances (hover/selected outline,
// click-to-select) into props that can be spread directly onto the DOM node that already
// renders the element — avoids introducing wrapper divs that would break existing layouts.
export function getEditableProps({ elementKey, kind, styles, editMode, selectedElement, onSelectElement, label }) {
  const style = styles?.[elementKey] || {};
  const classes = [];
  const cssStyle = {};

  if (kind === 'text') {
    if (style.color) cssStyle.color = style.color;
    if (style.font) classes.push(FONT_CLASSES[style.font]);
  } else if (kind === 'button') {
    if (style.bgColor) cssStyle.backgroundColor = style.bgColor;
    if (style.textColor) cssStyle.color = style.textColor;
    if (style.font) classes.push(FONT_CLASSES[style.font]);
    if (style.shadow) classes.push(SHADOW_CLASSES[style.shadow]);
    if (style.rounded) classes.push(ROUNDED_CLASSES[style.rounded]);
  } else if (kind === 'image' || kind === 'card') {
    if (style.bgColor) cssStyle.backgroundColor = style.bgColor;
    if (style.shadow) classes.push(SHADOW_CLASSES[style.shadow]);
    if (style.rounded) classes.push(ROUNDED_CLASSES[style.rounded]);
  }

  if (editMode) {
    classes.push('cursor-pointer outline-dashed outline-1 outline-offset-2 outline-accent/0 hover:outline-accent/50 transition-[outline-color]');
    if (selectedElement === elementKey) {
      classes.push('!outline-2 !outline-accent');
    }
  }

  return {
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
}
