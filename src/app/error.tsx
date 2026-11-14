'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('AirSathi Application Error:', error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl border border-rose-200 shadow-md p-8 max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Application Error</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          An unexpected interface error occurred. Telemetry state and scientific data integrity have been safely preserved.
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Interface</span>
        </button>
      </div>
    </div>
  );
}
