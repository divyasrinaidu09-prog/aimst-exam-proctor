'use client';

import React, { useState } from 'react';
import { Lightbulb, Sparkles, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function GradingSuggestionCard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/60 shadow-xs">
            <Lightbulb className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">Grading System (Suggestion)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                Future Enhancement
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              The current system focuses on monitoring and participation. In the future, a grading module can be added to:
            </p>

            <ul className="space-y-2 mb-6 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E5BF0]"></span>
                <span>Auto-calculate scores from structured examination responses</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E5BF0]"></span>
                <span>Set passing marks and automated performance bands</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E5BF0]"></span>
                <span>Provide detailed result reports with item analysis</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E5BF0]"></span>
                <span>Export results directly to Excel (XLSX) / PDF format</span>
              </li>
            </ul>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Future Enhancement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Grading Module Roadmap</h4>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm text-slate-600">
              <p>
                In a future version of the AIMST Online Exam Proctoring System, an automated grading module will be integrated with the document parsing engine:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>AI Semantic Answer Grading:</strong> Evaluates essay and short-answer questions against lecturer marking schemes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Instant MCQ Scoring:</strong> Automatically computes percentages for objective sections.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>University Gradebook Sync:</strong> Direct API integration into AIMST student management portals.</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">
                Note: In this FYP prototype, proctoring security and live monitoring are fully operational. Automated grading is marked as a planned enhancement.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
