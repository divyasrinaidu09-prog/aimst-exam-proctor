'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface JoinSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subject: any) => void;
  studentId?: string;
}

export default function JoinSubjectModal({
  isOpen,
  onClose,
  onSuccess,
  studentId,
}: JoinSubjectModalProps) {
  const [subjectCode, setSubjectCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode.trim()) {
      setError('Please enter a subject code.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/subjects/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_code: subjectCode.trim().toUpperCase(),
          student_id: studentId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to join subject.');
      } else {
        setSuccessMessage(data.message || `Successfully enrolled in ${data.subject.subject_name}`);
        onSuccess(data.subject);
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
          setSubjectCode('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E5BF0] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Join Subject</h3>
              <p className="text-xs text-slate-500">Self-enroll using your subject code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Subject Code
            </label>
            <input
              type="text"
              value={subjectCode}
              onChange={(e) => {
                setSubjectCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="e.g. BIMS13108"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E5BF0] focus:border-transparent text-slate-900 font-mono text-sm tracking-wider uppercase"
              autoFocus
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Enter the course code provided by your lecturer (e.g., BIMS13108, BIS1013)
            </p>
          </div>

          {/* Error notification */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success notification */}
          {successMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !subjectCode.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>JOIN SUBJECT</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
