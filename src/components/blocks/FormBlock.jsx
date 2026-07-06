import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { getButtonStyle, getEditableProps, cx } from '../../lib/blockStyle';

export default function FormBlock({ content, onSubmitLead, onAdvance, editMode, selectedElement, onSelectElement }) {
  const { headline, buttonText, successMessage } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });

  const headlineProps = editable('headline', 'text', 'Titre');
  const buttonProps = editable('button', 'button', 'Bouton');
  const buttonStyle = { ...getButtonStyle(content.style), ...buttonProps.style };

  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmitLead) {
      setSubmitted(true);
      return;
    }
    setSubmitting(true);
    await onSubmitLead({ name, email });
    setSubmitting(false);
    setSubmitted(true);
    // laisse le visiteur voir le message de succès avant d'avancer à l'étape suivante
    if (onAdvance) setTimeout(onAdvance, 1500);
  };

  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-lg mx-auto">
      <div className="bg-background border border-surface/10 rounded-[2rem] p-8 shadow-sm text-center">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="w-10 h-10 text-accent" />
            <p className="text-surface font-medium">{successMessage || 'Merci !'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {headline && (
              <h3
                className={cx('font-sans font-bold text-xl text-surface mb-2', headlineProps.className)}
                style={headlineProps.style}
                onClick={headlineProps.onClick}
              >
                {headline}
              </h3>
            )}
            <input
              type="text"
              placeholder="Prénom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            />
            <button
              type="submit"
              disabled={submitting}
              style={buttonStyle}
              className={cx('magnetic-btn btn-fill-slide group relative w-full bg-accent text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60', buttonProps.className)}
              onClick={editMode ? buttonProps.onClick : undefined}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {submitting ? 'Envoi...' : (buttonText || 'Envoyer')}
                {!submitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
              <div className="fill-layer bg-white/30 rounded-xl"></div>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
