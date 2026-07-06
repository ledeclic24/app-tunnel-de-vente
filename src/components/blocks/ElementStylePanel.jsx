import React from 'react';
import { X } from 'lucide-react';
import { SHADOW_OPTIONS, ROUNDED_OPTIONS, FONT_OPTIONS } from '../../lib/blockStyle';

const inputClass = "w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface";
const labelClass = "block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1";

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
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

const HAS_TEXT_COLOR = ['text', 'button'];
const HAS_FONT = ['text', 'button'];
const HAS_EFFECTS = ['button', 'image', 'card'];

export default function ElementStylePanel({ block, elementKey, kind, label, onChange, onClose }) {
  const styles = block?.content?.styles || {};
  const style = styles[elementKey] || {};

  const setStyle = (patch) => {
    onChange({ ...styles, [elementKey]: { ...style, ...patch } });
  };

  if (!block) return null;

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

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {HAS_TEXT_COLOR.includes(kind) && (
          <ColorField
            label="Couleur du texte"
            value={kind === 'button' ? style.textColor : style.color}
            defaultValue={kind === 'button' ? '#FFFFFF' : '#0C1F16'}
            onChange={(v) => setStyle(kind === 'button' ? { textColor: v } : { color: v })}
            onReset={() => setStyle(kind === 'button' ? { textColor: undefined } : { color: undefined })}
          />
        )}

        {kind === 'button' && (
          <ColorField
            label="Couleur du fond"
            value={style.bgColor}
            defaultValue="#22C55E"
            onChange={(v) => setStyle({ bgColor: v })}
            onReset={() => setStyle({ bgColor: undefined })}
          />
        )}

        {(kind === 'image' || kind === 'card') && (
          <ColorField
            label="Couleur du fond"
            value={style.bgColor}
            defaultValue="#F6F9F7"
            onChange={(v) => setStyle({ bgColor: v })}
            onReset={() => setStyle({ bgColor: undefined })}
          />
        )}

        {HAS_FONT.includes(kind) && (
          <Field label="Police">
            <select className={inputClass} value={style.font || 'sans'} onChange={(e) => setStyle({ font: e.target.value })}>
              {FONT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        )}

        {HAS_EFFECTS.includes(kind) && (
          <>
            <Field label="Ombre">
              <select className={inputClass} value={style.shadow || 'none'} onChange={(e) => setStyle({ shadow: e.target.value })}>
                {SHADOW_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Arrondi">
              <select className={inputClass} value={style.rounded || 'none'} onChange={(e) => setStyle({ rounded: e.target.value })}>
                {ROUNDED_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </>
        )}

        {Object.keys(style).length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...styles, [elementKey]: {} })}
            className="w-full text-center text-xs text-surface/40 hover:text-red-500 pt-2 border-t border-surface/10"
          >
            Réinitialiser tout cet élément
          </button>
        )}
      </div>
    </div>
  );
}
