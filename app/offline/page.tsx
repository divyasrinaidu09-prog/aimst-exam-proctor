'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw, ShieldAlert } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-md">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-5 text-red-400">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-300 mb-4">
          <ShieldAlert className="w-3.5 h-3.5" />
          Proctoring System Offline
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Internet Connection Lost
        </h1>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          AIMST University online proctoring requires an active, uninterrupted internet connection to ensure continuous face verification and session integrity.
        </p>

        <div className="bg-slate-950/60 rounded-xl p-4 text-xs text-slate-400 text-left mb-6 border border-slate-800">
          <p className="font-semibold text-slate-300 mb-1">Academic Integrity Policy:</p>
          <p>Exam questions are not cached locally for offline completion to prevent unauthorized offline tampering and browser manipulation.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-aimst-600 hover:bg-aimst-700 text-white font-medium text-sm transition-all shadow-lg shadow-aimst-700/20"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
