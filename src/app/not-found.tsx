import Link from 'next/link';
import { Wind, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
          <Wind className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">404 – Page Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested civic monitoring page or telemetry route does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
