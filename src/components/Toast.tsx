import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
}

export function Toast({ message, type = 'success' }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] pointer-events-none flex justify-center">
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-[13px] font-semibold backdrop-blur-md transition-all ${
          type === 'error'
            ? 'bg-red-600/95 text-white'
            : 'bg-slate-900/95 text-white'
        }`}
      >
        {type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-red-200 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}
