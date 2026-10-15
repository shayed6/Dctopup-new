import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-top-3 ${
              isSuccess
                ? 'bg-white border-emerald-300 text-black'
                : isError
                ? 'bg-white border-rose-300 text-black'
                : 'bg-white border-slate-300 text-black'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-700" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-black" />}
            </div>
            <div className="flex-1 text-sm font-bold leading-snug">
              {toast.message}
            </div>
          </div>
        );
      })}
    </div>
  );
};
