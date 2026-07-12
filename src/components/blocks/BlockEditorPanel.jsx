import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploadField from './ImageUploadField';

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

function ListEditor({ items, onChange, renderRow, emptyItem, addLabel }) {
  const update = (i, patch) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, emptyItem]);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-surface/10 rounded-xl p-3 space-y-2 relative">
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-2 right-2 text-surface/30 hover:text-red-500 transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {renderRow(item, (patch) => update(i, patch))}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="hover-lift w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-surface/20 text-surface/60 text-sm hover:border-accent hover:text-accent transition-colors"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}

function BlockFields({ type, content, set, userId }) {
  switch (type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <Field label="Eyebrow (petit texte au-dessus)">
            <input className={inputClass} value={content.eyebrow || ''} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Titre">
            <textarea className={inputClass} rows={2} value={content.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Sous-titre">
            <textarea className={inputClass} rows={2} value={content.subheading || ''} onChange={(e) => set({ subheading: e.target.value })} />
          </Field>
          <Field label="Image">
            <ImageUploadField userId={userId} value={content.imageUrl} onChange={(imageUrl) => set({ imageUrl })} />
          </Field>
          <Field label="Texte du bouton (laisser vide pour masquer)">
            <input className={inputClass} value={content.ctaText || ''} onChange={(e) => set({ ctaText: e.target.value })} />
          </Field>
          <Field label="Lien externe du bouton (optionnel — sinon avance à l'étape suivante)">
            <input className={inputClass} placeholder="https://..." value={content.externalUrl || ''} onChange={(e) => set({ externalUrl: e.target.value })} />
          </Field>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-4">
          <Field label="Titre">
            <input className={inputClass} value={content.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Texte">
            <textarea className={inputClass} rows={5} value={content.body || ''} onChange={(e) => set({ body: e.target.value })} />
          </Field>
        </div>
      );

    case 'image':
      return (
        <div className="space-y-4">
          <Field label="Image">
            <ImageUploadField userId={userId} value={content.url} onChange={(url) => set({ url })} />
          </Field>
          <Field label="Légende (optionnel)">
            <input className={inputClass} value={content.caption || ''} onChange={(e) => set({ caption: e.target.value })} />
          </Field>
          <Field label="Texte alternatif (pour l'accessibilité et le référencement)">
            <input className={inputClass} placeholder="Décris ce que montre l'image" value={content.alt || ''} onChange={(e) => set({ alt: e.target.value })} />
          </Field>
        </div>
      );

    case 'video':
      return (
        <div className="space-y-4">
          <Field label="Titre">
            <input className={inputClass} value={content.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Lien de la vidéo (YouTube, Vimeo, ou lien direct .mp4)">
            <input className={inputClass} placeholder="https://youtube.com/watch?v=..." value={content.videoUrl || ''} onChange={(e) => set({ videoUrl: e.target.value })} />
          </Field>
          <Field label="Description (optionnel)">
            <textarea className={inputClass} rows={3} value={content.description || ''} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </div>
      );

    case 'features':
      return (
        <div className="space-y-4">
          <Field label="Titre de la section">
            <input className={inputClass} value={content.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Avantages">
            <ListEditor
              items={content.items || []}
              onChange={(items) => set({ items })}
              emptyItem={{ title: 'Nouvel avantage', description: '' }}
              addLabel="Ajouter un avantage"
              renderRow={(item, update) => (
                <>
                  <input className={inputClass} placeholder="Titre" value={item.title || ''} onChange={(e) => update({ title: e.target.value })} />
                  <input className={inputClass} placeholder="Description" value={item.description || ''} onChange={(e) => update({ description: e.target.value })} />
                </>
              )}
            />
          </Field>
        </div>
      );

    case 'testimonials':
      return (
        <div className="space-y-4">
          <Field label="Titre de la section">
            <input className={inputClass} value={content.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Témoignages">
            <ListEditor
              items={content.items || []}
              onChange={(items) => set({ items })}
              emptyItem={{ name: '', role: '', quote: '' }}
              addLabel="Ajouter un témoignage"
              renderRow={(item, update) => (
                <>
                  <textarea className={inputClass} placeholder="Citation" rows={2} value={item.quote || ''} onChange={(e) => update({ quote: e.target.value })} />
                  <input className={inputClass} placeholder="Nom" value={item.name || ''} onChange={(e) => update({ name: e.target.value })} />
                  <input className={inputClass} placeholder="Rôle (optionnel)" value={item.role || ''} onChange={(e) => update({ role: e.target.value })} />
                </>
              )}
            />
          </Field>
        </div>
      );

    case 'pricing':
      return (
        <div className="space-y-4">
          <Field label="Titre de la section">
            <input className={inputClass} value={content.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Offres">
            <ListEditor
              items={content.plans || []}
              onChange={(plans) => set({ plans })}
              emptyItem={{ name: 'Nouvelle offre', price: '0', period: '', features: [], highlight: false }}
              addLabel="Ajouter une offre"
              renderRow={(plan, update) => (
                <>
                  <input className={inputClass} placeholder="Nom de l'offre" value={plan.name || ''} onChange={(e) => update({ name: e.target.value })} />
                  <div className="flex gap-2">
                    <input className={inputClass} placeholder="Prix" value={plan.price || ''} onChange={(e) => update({ price: e.target.value })} />
                    <input className={inputClass} placeholder="Période (ex: / mois)" value={plan.period || ''} onChange={(e) => update({ period: e.target.value })} />
                  </div>
                  <textarea
                    className={inputClass}
                    placeholder={'Une fonctionnalité par ligne'}
                    rows={3}
                    value={(plan.features || []).join('\n')}
                    onChange={(e) => update({ features: e.target.value.split('\n') })}
                  />
                  <label className="flex items-center gap-2 text-sm text-surface/70">
                    <input type="checkbox" checked={!!plan.highlight} onChange={(e) => update({ highlight: e.target.checked })} />
                    Mettre en avant
                  </label>
                </>
              )}
            />
          </Field>
        </div>
      );

    case 'form':
      return (
        <div className="space-y-4">
          <Field label="Titre du formulaire">
            <input className={inputClass} value={content.headline || ''} onChange={(e) => set({ headline: e.target.value })} />
          </Field>
          <Field label="Texte du bouton">
            <input className={inputClass} value={content.buttonText || ''} onChange={(e) => set({ buttonText: e.target.value })} />
          </Field>
          <Field label="Message après envoi">
            <input className={inputClass} value={content.successMessage || ''} onChange={(e) => set({ successMessage: e.target.value })} />
          </Field>
        </div>
      );

    case 'countdown':
      return (
        <div className="space-y-4">
          <Field label="Titre">
            <input className={inputClass} value={content.headline || ''} onChange={(e) => set({ headline: e.target.value })} />
          </Field>
          <Field label="Date et heure cible">
            <input type="datetime-local" className={inputClass} value={content.targetDate || ''} onChange={(e) => set({ targetDate: e.target.value })} />
          </Field>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-4">
          <Field label="Titre de la section">
            <input className={inputClass} value={content.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Questions">
            <ListEditor
              items={content.items || []}
              onChange={(items) => set({ items })}
              emptyItem={{ question: 'Nouvelle question', answer: '' }}
              addLabel="Ajouter une question"
              renderRow={(item, update) => (
                <>
                  <input className={inputClass} placeholder="Question" value={item.question || ''} onChange={(e) => update({ question: e.target.value })} />
                  <textarea className={inputClass} placeholder="Réponse" rows={2} value={item.answer || ''} onChange={(e) => update({ answer: e.target.value })} />
                </>
              )}
            />
          </Field>
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-4">
          <Field label="Titre">
            <input className={inputClass} value={content.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Texte du bouton">
            <input className={inputClass} value={content.buttonText || ''} onChange={(e) => set({ buttonText: e.target.value })} />
          </Field>
          <Field label="Lien externe (optionnel — sinon avance à l'étape suivante)">
            <input className={inputClass} placeholder="https://..." value={content.externalUrl || ''} onChange={(e) => set({ externalUrl: e.target.value })} />
          </Field>
        </div>
      );

    case 'quiz':
      return (
        <div className="space-y-4">
          <Field label="Titre">
            <input className={inputClass} value={content.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Questions">
            <ListEditor
              items={content.questions || []}
              onChange={(questions) => set({ questions })}
              emptyItem={{ question: 'Nouvelle question', options: ['Option 1', 'Option 2'] }}
              addLabel="Ajouter une question"
              renderRow={(item, update) => (
                <>
                  <input className={inputClass} placeholder="Question" value={item.question || ''} onChange={(e) => update({ question: e.target.value })} />
                  <textarea
                    className={inputClass}
                    placeholder="Une option par ligne"
                    rows={3}
                    value={(item.options || []).join('\n')}
                    onChange={(e) => update({ options: e.target.value.split('\n') })}
                  />
                </>
              )}
            />
          </Field>
          <Field label="Texte du bouton final">
            <input className={inputClass} value={content.resultButtonText || ''} onChange={(e) => set({ resultButtonText: e.target.value })} />
          </Field>
        </div>
      );

    default:
      return <p className="text-sm text-surface/50">Aucun réglage pour ce bloc.</p>;
  }
}

export default function BlockEditorPanel({ block, onChange, userId }) {
  const { type, content } = block;
  const set = (patch) => onChange({ ...content, ...patch });

  return (
    <div>
      <BlockFields type={type} content={content} set={set} userId={userId} />
      <p className="pt-4 mt-2 border-t border-surface/10 text-xs text-surface/40">
        Astuce : cliquez directement sur un titre, un bouton, une image ou une carte dans l'aperçu ci-dessus pour personnaliser sa couleur, sa police et ses effets.
      </p>
    </div>
  );
}
