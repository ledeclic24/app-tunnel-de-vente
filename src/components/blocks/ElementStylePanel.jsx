import React, { useState } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';
import {
  SHADOW_OPTIONS, ROUNDED_OPTIONS, FONT_OPTIONS, FONT_WEIGHT_OPTIONS, TEXT_ALIGN_OPTIONS,
  LETTER_SPACING_OPTIONS, LINE_HEIGHT_OPTIONS, TEXT_TRANSFORM_OPTIONS, PADDING_OPTIONS,
  SECTION_PADDING_OPTIONS, OBJECT_FIT_OPTIONS, BORDER_WIDTH_OPTIONS, SECTION_BACKGROUND_OPTIONS,
} from '../../lib/blockStyle';

const inputClass = "w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface";
const labelClass = "block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1";
const groupLabelClass = "text-[11px] font-bold uppercase tracking-widest text-accent mb-3";

function Field({ label, children, hint }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="text-[11px] text-surface/40 mt-1">{hint}</p>}
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div className="pt-5 border-t border-surface/10 first:pt-0 first:border-0 space-y-4">
      <p className={groupLabelClass}>{label}</p>
      {children}
    </div>
  );
}

function ColorField({ label, value, defaultValue, onChange, onReset }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || defaultValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-surface/10 cursor-pointer shrink-0"
        />
        {value && (
          <button type="button" onClick={onReset} className="text-xs text-surface/40 hover:text-surface/70">
            Réinitialiser
          </button>
        )}
      </div>
    </Field>
  );
}

function SegmentedField({ label, options, value, defaultValue, onChange }) {
  return (
    <Field label={label}>
      <div className="flex bg-surface/[0.04] rounded-xl p-1 gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              (value || defaultValue) === o.value ? 'bg-background text-surface shadow-sm' : 'text-surface/50 hover:text-surface'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

function SelectField({ label, options, value, defaultValue, onChange }) {
  return (
    <Field label={label}>
      <select className={inputClass} value={value || defaultValue} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

function SliderField({ label, value, defaultValue, min, max, step = 1, unit = '', onChange, onReset }) {
  const current = value ?? defaultValue;
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-accent"
        />
        <span className="text-xs font-mono text-surface/60 w-12 text-right shrink-0">{current}{unit}</span>
      </div>
      {value !== undefined && value !== null && (
        <button type="button" onClick={onReset} className="text-xs text-surface/40 hover:text-surface/70 mt-1">
          Réinitialiser
        </button>
      )}
    </Field>
  );
}

const TEXT_KINDS = ['text'];
const HAS_BG = ['button', 'image', 'card'];
const HAS_FONT = ['text', 'button'];
const HAS_TYPOGRAPHY = ['text', 'button'];
const HAS_BORDER = ['button', 'image', 'card'];
const HAS_EFFECTS = ['button', 'image', 'card'];
const HAS_SPACING = ['button', 'card'];

export default function ElementStylePanel({ block, elementKey, kind, label, onChange, onClose }) {
  const [device, setDevice] = useState('mobile');
  const styles = block?.content?.styles || {};
  const style = styles[elementKey] || {};
  const desktop = style.desktop || {};

  const setStyle = (patch) => onChange({ ...styles, [elementKey]: { ...style, ...patch } });
  const setDesktop = (patch) => onChange({ ...styles, [elementKey]: { ...style, desktop: { ...desktop, ...patch } } });
  const resetDesktop = (field) => {
    const next = { ...desktop };
    delete next[field];
    onChange({ ...styles, [elementKey]: { ...style, desktop: next } });
  };

  if (!block) return null;

  const hasContent = Object.keys(style).some((k) => k !== 'desktop' && style[k] !== undefined) || Object.keys(desktop).length > 0;

  return (
    <div className="fixed right-4 top-24 bottom-4 w-80 max-w-[90vw] bg-background border border-surface/10 rounded-[2rem] shadow-2xl z-30 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface/10 bg-surface/[0.02]">
        <div>
          <p className="text-xs text-surface/40 uppercase tracking-wider">Élément sélectionné</p>
          <p className="font-sans font-semibold text-surface">{label}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-surface/40 hover:text-surface" aria-label="Fermer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {kind === 'section' && (
        <div className="flex items-center gap-1 mx-5 mt-4 bg-surface/[0.04] rounded-xl p-1 shrink-0">
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${device === 'mobile' ? 'bg-background text-surface shadow-sm' : 'text-surface/50'}`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${device === 'desktop' ? 'bg-background text-surface shadow-sm' : 'text-surface/50'}`}
          >
            <Monitor className="w-3.5 h-3.5" /> Bureau
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {kind === 'section' ? (
          device === 'mobile' ? (
            <>
              <Group label="Couleurs">
                <SegmentedField label="Fond de section" options={SECTION_BACKGROUND_OPTIONS} value={style.background} defaultValue="white" onChange={(v) => setStyle({ background: v })} />
                <p className="text-[11px] text-surface/40 -mt-2">Par défaut, les sections alternent automatiquement blanc/principale le long de la page.</p>
                <ColorField label="Fond personnalisé (remplace l'alternance)" value={style.bgColor} defaultValue="#F6F9F7" onChange={(v) => setStyle({ bgColor: v })} onReset={() => setStyle({ bgColor: undefined })} />
                <ColorField label="Couleur du texte" value={style.textColor} defaultValue="#0C1F16" onChange={(v) => setStyle({ textColor: v })} onReset={() => setStyle({ textColor: undefined })} />
              </Group>
              <Group label="Mise en page">
                <SegmentedField label="Alignement du contenu" options={TEXT_ALIGN_OPTIONS} value={style.textAlign} defaultValue="left" onChange={(v) => setStyle({ textAlign: v })} />
                <SelectField label="Espacement vertical" options={SECTION_PADDING_OPTIONS} value={style.paddingY} defaultValue="md" onChange={(v) => setStyle({ paddingY: v })} />
              </Group>
              <Group label="Bordure & effets">
                <SelectField label="Arrondi" options={ROUNDED_OPTIONS} value={style.rounded} defaultValue="none" onChange={(v) => setStyle({ rounded: v })} />
                <SelectField label="Ombre" options={SHADOW_OPTIONS} value={style.shadow} defaultValue="none" onChange={(v) => setStyle({ shadow: v })} />
                <SelectField label="Épaisseur de bordure" options={BORDER_WIDTH_OPTIONS} value={style.borderWidth} defaultValue="0" onChange={(v) => setStyle({ borderWidth: v })} />
                {style.borderWidth && style.borderWidth !== '0' && (
                  <ColorField label="Couleur de la bordure" value={style.borderColor} defaultValue="#0C1F16" onChange={(v) => setStyle({ borderColor: v })} onReset={() => setStyle({ borderColor: undefined })} />
                )}
              </Group>
            </>
          ) : (
            <Group label="Réglages bureau (≥ 768px)">
              <p className="text-xs text-surface/50 -mt-1">Ces réglages remplacent la version mobile uniquement sur grand écran.</p>
              <SelectField
                label="Espacement vertical"
                options={SECTION_PADDING_OPTIONS}
                value={desktop.paddingY}
                defaultValue={style.paddingY || 'md'}
                onChange={(v) => setDesktop({ paddingY: v })}
              />
              {desktop.paddingY && (
                <button type="button" onClick={() => resetDesktop('paddingY')} className="text-xs text-surface/40 hover:text-surface/70 -mt-2">Revenir à la valeur mobile</button>
              )}
              <SegmentedField
                label="Alignement du contenu"
                options={TEXT_ALIGN_OPTIONS}
                value={desktop.textAlign}
                defaultValue={style.textAlign || 'left'}
                onChange={(v) => setDesktop({ textAlign: v })}
              />
              {desktop.textAlign && (
                <button type="button" onClick={() => resetDesktop('textAlign')} className="text-xs text-surface/40 hover:text-surface/70 -mt-2">Revenir à la valeur mobile</button>
              )}
            </Group>
          )
        ) : (
          <>
            {TEXT_KINDS.includes(kind) && (
              <Group label="Couleur">
                <ColorField label="Couleur du texte" value={style.color} defaultValue="#0C1F16" onChange={(v) => setStyle({ color: v })} onReset={() => setStyle({ color: undefined })} />
              </Group>
            )}

            {kind === 'button' && (
              <Group label="Couleurs">
                <ColorField label="Couleur du texte" value={style.textColor} defaultValue="#FFFFFF" onChange={(v) => setStyle({ textColor: v })} onReset={() => setStyle({ textColor: undefined })} />
                <ColorField label="Couleur du fond" value={style.bgColor} defaultValue="#22C55E" onChange={(v) => setStyle({ bgColor: v })} onReset={() => setStyle({ bgColor: undefined })} />
              </Group>
            )}

            {HAS_BG.includes(kind) && kind !== 'button' && (
              <Group label="Couleur">
                <ColorField label="Couleur du fond" value={style.bgColor} defaultValue="#F6F9F7" onChange={(v) => setStyle({ bgColor: v })} onReset={() => setStyle({ bgColor: undefined })} />
              </Group>
            )}

            {HAS_TYPOGRAPHY.includes(kind) && (
              <Group label="Typographie">
                {HAS_FONT.includes(kind) && (
                  <SelectField label="Police" options={FONT_OPTIONS} value={style.font} defaultValue="sans" onChange={(v) => setStyle({ font: v })} />
                )}
                <SliderField label="Taille du texte" value={style.fontSize} defaultValue={16} min={10} max={72} unit="px" onChange={(v) => setStyle({ fontSize: v })} onReset={() => setStyle({ fontSize: undefined })} />
                <SelectField label="Graisse" options={FONT_WEIGHT_OPTIONS} value={style.fontWeight} defaultValue="normal" onChange={(v) => setStyle({ fontWeight: v })} />
                {kind === 'text' && (
                  <>
                    <SegmentedField label="Alignement" options={TEXT_ALIGN_OPTIONS} value={style.textAlign} defaultValue="left" onChange={(v) => setStyle({ textAlign: v })} />
                    <SelectField label="Interligne" options={LINE_HEIGHT_OPTIONS} value={style.lineHeight} defaultValue="normal" onChange={(v) => setStyle({ lineHeight: v })} />
                    <SelectField label="Espacement des lettres" options={LETTER_SPACING_OPTIONS} value={style.letterSpacing} defaultValue="normal" onChange={(v) => setStyle({ letterSpacing: v })} />
                    <SegmentedField label="Casse" options={TEXT_TRANSFORM_OPTIONS} value={style.textTransform} defaultValue="none" onChange={(v) => setStyle({ textTransform: v })} />
                  </>
                )}
              </Group>
            )}

            {kind === 'image' && (
              <Group label="Image">
                <SelectField label="Ajustement" options={OBJECT_FIT_OPTIONS} value={style.objectFit} defaultValue="cover" onChange={(v) => setStyle({ objectFit: v })} />
                <SliderField label="Opacité" value={style.opacity} defaultValue={100} min={20} max={100} step={5} unit="%" onChange={(v) => setStyle({ opacity: v })} onReset={() => setStyle({ opacity: undefined })} />
              </Group>
            )}

            {HAS_SPACING.includes(kind) && (
              <Group label="Espacement interne">
                <SelectField label="Espacement" options={PADDING_OPTIONS} value={style.padding} defaultValue="md" onChange={(v) => setStyle({ padding: v })} />
                {kind === 'button' && (
                  <label className="flex items-center gap-2 text-sm text-surface/70 pt-1">
                    <input type="checkbox" checked={!!style.fullWidth} onChange={(e) => setStyle({ fullWidth: e.target.checked || undefined })} />
                    Bouton pleine largeur
                  </label>
                )}
              </Group>
            )}

            {HAS_BORDER.includes(kind) && (
              <Group label="Bordure & angles">
                <SelectField label="Arrondi" options={ROUNDED_OPTIONS} value={style.rounded} defaultValue="none" onChange={(v) => setStyle({ rounded: v })} />
                <SelectField label="Épaisseur de bordure" options={BORDER_WIDTH_OPTIONS} value={style.borderWidth} defaultValue="0" onChange={(v) => setStyle({ borderWidth: v })} />
                {style.borderWidth && style.borderWidth !== '0' && (
                  <ColorField label="Couleur de la bordure" value={style.borderColor} defaultValue="#0C1F16" onChange={(v) => setStyle({ borderColor: v })} onReset={() => setStyle({ borderColor: undefined })} />
                )}
              </Group>
            )}

            {HAS_EFFECTS.includes(kind) && (
              <Group label="Ombre">
                <SelectField label="Intensité" options={SHADOW_OPTIONS} value={style.shadow} defaultValue="none" onChange={(v) => setStyle({ shadow: v })} />
              </Group>
            )}
          </>
        )}

        {hasContent && (
          <button
            type="button"
            onClick={() => onChange({ ...styles, [elementKey]: {} })}
            className="w-full text-center text-xs text-surface/40 hover:text-red-500 pt-4 border-t border-surface/10"
          >
            Réinitialiser tout cet élément
          </button>
        )}
      </div>
    </div>
  );
}
