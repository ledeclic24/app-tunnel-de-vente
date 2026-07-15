import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

// Remplace window.confirm par une modale cohérente avec le reste de
// l'app. API volontairement proche de window.confirm (une promesse
// résolue en true/false) pour que chaque appelant n'ait qu'à passer de
// `if (!window.confirm(msg)) return;` à `if (!(await confirm(msg))) return;`.
const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((message, options = {}) => new Promise((resolve) => {
    resolveRef.current = resolve;
    setState({
      message,
      confirmLabel: options.confirmLabel || 'Confirmer',
      cancelLabel: options.cancelLabel || 'Annuler',
      danger: options.danger !== false,
    });
  }), []);

  const settle = (result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4"
          onClick={() => settle(false)}
        >
          <div
            className="bg-background rounded-2xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-surface text-sm leading-relaxed mb-6 whitespace-pre-line">{state.message}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => settle(false)}
                className="px-4 py-2 rounded-full text-sm font-semibold text-surface/60 hover:text-surface transition-colors"
              >
                {state.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                autoFocus
                className={`px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors ${state.danger ? 'bg-red-500 hover:bg-red-600' : 'bg-accent hover:bg-accent/90'}`}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm doit être utilisé sous ConfirmProvider');
  return ctx;
}
