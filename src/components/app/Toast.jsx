import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

// Remplace window.alert par une notification non bloquante, cohérente
// avec le reste de l'app.
const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 6000);
  }, [remove]);

  const api = useMemo(() => ({
    error: (message) => push(message, 'error'),
    success: (message) => push(message, 'success'),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[110] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 px-4 py-3 rounded-xl shadow-lg text-sm text-white ${t.type === 'error' ? 'bg-red-500' : 'bg-primary'}`}
          >
            {t.type === 'error' ? <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button type="button" onClick={() => remove(t.id)} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Fermer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé sous ToastProvider');
  return ctx;
}
