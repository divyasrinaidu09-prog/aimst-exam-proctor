'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ViolationModalProps {
  isOpen: boolean;
  message?: string;
  onDismiss: () => void;
}

export default function ViolationModal({
  isOpen,
  message = 'You have switched tabs. This is not allowed during the examination.',
  onDismiss,
}: ViolationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-500 w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200">
        {/* Red Exclamation Mark Icon matching Card 9 */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-5 text-red-600 shadow-inner">
          <AlertTriangle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h3 className="text-2xl font-black text-red-600 mb-3 tracking-tight">
          Violation Detected!
        </h3>

        <p className="text-sm font-medium text-slate-700 leading-relaxed mb-6">
          {message}
        </p>

        <p className="text-xs text-slate-400 mb-6">
          This security incident has been logged and sent to the examiner for forensic review.
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#EF4444] hover:bg-red-700 text-white font-bold text-base shadow-lg shadow-red-500/30 transition-all uppercase tracking-wider"
        >
          OK
        </button>
      </div>
    </div>
  );
}
