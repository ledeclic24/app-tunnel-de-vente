import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';

export default function QuizBlock({ content, onAdvance, editMode, selectedElement, onSelectElement, onContentChange, defaultBg }) {
  const { heading, questions = [], resultButtonText } = content;
  const [step, setStep] = useState(0);
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const editableText = (field) => getContentEditableProps({ editMode, onContentChange, content, field });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  const headingProps = editable('heading', 'text', 'Titre');
  const questionProps = editable('question', 'text', 'Question');
  const buttonProps = editable('button', 'button', 'Bouton résultat');

  const updateCurrentQuestion = (patch) => {
    const nextQuestions = questions.map((q, idx) => (idx === step ? { ...q, ...patch } : q));
    onContentChange?.({ ...content, questions: nextQuestions });
  };
  const updateOption = (optIndex, text) => {
    const nextOptions = (questions[step]?.options || []).map((o, idx) => (idx === optIndex ? text : o));
    updateCurrentQuestion({ options: nextOptions });
  };

  const isDone = step >= questions.length;
  const progress = questions.length ? (Math.min(step, questions.length) / questions.length) * 100 : 0;

  const handleSelect = () => setStep((s) => s + 1);

  return (
    <section className={cx('px-6 py-12 md:px-16 md:py-16 max-w-2xl mx-auto', bg.sectionClassName)}>
      {heading && (
        <h2
          className={cx('font-sans font-bold text-2xl md:text-3xl text-center mb-8 outline-none', bg.headingClassName, headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
          {...editableText('heading')}
        >
          {heading}
        </h2>
      )}
      <div className="bg-background border border-surface/10 rounded-[2rem] p-8 shadow-sm">
        <div className="h-1.5 bg-surface/10 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 rounded-full"
            style={{ width: `${isDone ? 100 : progress}%` }}
          />
        </div>

        {!isDone && questions.length > 0 ? (
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-accent mb-2">
              Question {step + 1} / {questions.length}
            </p>
            <h3
              className={cx('text-xl font-sans font-semibold text-surface mb-6 outline-none', questionProps.className)}
              style={questionProps.style}
              onClick={questionProps.onClick}
              contentEditable={editMode}
              suppressContentEditableWarning
              onBlur={(e) => editMode && updateCurrentQuestion({ question: e.currentTarget.textContent ?? '' })}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            >
              {questions[step].question}
            </h3>
            <div className="space-y-3">
              {(questions[step].options || []).map((opt, i) => (
                <button
                  key={i}
                  onClick={editMode ? (e) => e.stopPropagation() : handleSelect}
                  className="hover-lift w-full text-left px-5 py-3.5 rounded-xl border border-surface/10 bg-primary/5 hover:border-accent hover:bg-accent/5 transition-colors duration-200 text-surface outline-none"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) => editMode && updateOption(i, e.currentTarget.textContent ?? '')}
                  onKeyDownCapture={(e) => { if (editMode && e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-surface/70 mb-6">Merci d'avoir répondu à toutes les questions !</p>
            <button
              onClick={editMode ? buttonProps.onClick : onAdvance}
              style={buttonProps.style}
              className={cx('magnetic-btn btn-fill-slide group relative inline-flex items-center gap-2 bg-accent text-background px-8 py-4 rounded-full text-base font-medium', buttonProps.className)}
            >
              <span className="relative z-10 outline-none" {...editableText('resultButtonText')}>{resultButtonText || 'Voir mon résultat'}</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <div className="fill-layer bg-white/30 rounded-full"></div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
