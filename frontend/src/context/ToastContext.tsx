import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  showConfirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3500) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error', 4500), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);

  const showConfirm = useCallback(
    (options: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      onConfirm: () => void;
    }) => {
      setConfirmDialog({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Yes, Proceed',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: options.onConfirm,
      });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, showConfirm }}>
      {children}

      {/* Floating Modern Toast Stack (Top Right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl transition-all transform animate-in slide-in-from-top-4 duration-200 backdrop-blur-md ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-700/60 text-emerald-100'
                  : isError
                  ? 'bg-rose-950/90 border-rose-700/60 text-rose-100'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-700/60 text-amber-100'
                  : 'bg-slate-900/90 border-slate-700/60 text-slate-100'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              <div className="flex-1 text-xs sm:text-sm font-semibold leading-relaxed">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modern Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">{confirmDialog.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 transition-colors"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                onClick={() => {
                  setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                  confirmDialog.onConfirm();
                }}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-rose-600/20 transition-all"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
