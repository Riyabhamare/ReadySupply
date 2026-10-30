import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000, onUndo = null }) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast = { id, type, title, message, onUndo };

      setToasts((prev) => [...prev, newToast]);

      if (duration && duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const success = (message, title = 'Success') => addToast({ type: 'success', title, message });
  const error = (message, title = 'Error') => addToast({ type: 'error', title, message });
  const info = (message, title = 'Information') => addToast({ type: 'info', title, message });

  // Special toast for soft delete with undo
  const showUndo = (message, onUndoAction, duration = 8000) => {
    return addToast({
      type: 'warning',
      title: 'Item Deleted',
      message,
      duration,
      onUndo: onUndoAction,
    });
  };

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, showUndo, removeToast }}>
      {children}
      {/* Toast Render Area */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-elevated bg-surface-light dark:bg-surface-dark transition-all duration-200 transform translate-y-0 ${
              t.type === 'success'
                ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                : t.type === 'error'
                ? 'border-red-500/50 bg-red-50/20 dark:bg-red-950/20'
                : t.type === 'warning'
                ? 'border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/20'
                : 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                {t.title}
              </p>
              {t.message && (
                <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
                  {t.message}
                </p>
              )}
              {t.onUndo && (
                <button
                  onClick={() => {
                    t.onUndo();
                    removeToast(t.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo Deletion</span>
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

