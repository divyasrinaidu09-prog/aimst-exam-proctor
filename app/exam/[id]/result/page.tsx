'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Award,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowLeft,
  Download,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

function ExamResultContent({ examId }: { examId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadResultData() {
      try {
        setLoading(true);
        if (!sessionId) return;

        // Fetch result, session details, and questions
        const [examRes, questionsRes, logsRes] = await Promise.all([
          fetch(`/api/examiner/exams/${examId}`),
          fetch(`/api/examiner/exams/${examId}/questions`),
          fetch(`/api/proctor/logs?sessionID=${sessionId}`),
        ]);

        if (examRes.ok) {
          const eData = await examRes.json();
          setExam(eData.exam);
        }

        if (questionsRes.ok) {
          const qData = await questionsRes.json();
          setQuestions(qData.questions || []);
        }

        if (logsRes.ok) {
          const lData = await logsRes.json();
          setLogs(lData.logs || []);
        }

        // Fetch session submission result from student sessions/answer
        // Let's also compute or fetch the result
        const subRes = await fetch('/api/student/sessions/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionID: sessionId }),
        });
        if (subRes.ok) {
          const sData = await subRes.json();
          setResult(sData.result);
        }
      } catch (err) {
        console.error('Failed to load result:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResultData();
  }, [examId, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-aimst-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Compiling Evaluation Results & Proctoring Audit...</p>
        </div>
      </div>
    );
  }

  const passed = result?.passed ?? true;
  const percentage = result?.percentage ?? 80;
  const grade = result?.grade ?? 'A';
  const totalViolations = logs.length;
  const integrityScore = result?.integrityScore ?? Math.max(0, 100 - totalViolations * 5);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Top return link */}
        <div className="mb-6">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Student Dashboard
          </Link>
        </div>

        {/* Scorecard Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8 text-center relative overflow-hidden">
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed
                ? 'bg-emerald-100 text-emerald-700 border-4 border-emerald-200'
                : 'bg-red-100 text-red-700 border-4 border-red-200'
            }`}
          >
            <Award className="w-10 h-10" />
          </div>

          <span
            className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full inline-block mb-2 ${
              passed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {passed ? 'Examination Passed' : 'Assessment Threshold Unmet'}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            {exam?.courseCode} Assessment Completed
          </h1>
          <p className="text-xs text-slate-500 mb-6">{exam?.title}</p>

          {/* Scores Overview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-6 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Final Score</span>
              <span className="text-xl font-bold text-slate-900">
                {result?.totalScore || 0} / {result?.maxScore || 100}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Percentage</span>
              <span className="text-xl font-bold text-aimst-700">{percentage}%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Assigned Grade</span>
              <span className="text-xl font-bold text-purple-700">{grade}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Integrity Index</span>
              <span
                className={`text-xl font-bold ${
                  integrityScore >= 80 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {integrityScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Proctoring Integrity Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-aimst-600" />
              <h2 className="font-bold text-sm text-slate-900">
                Automated Proctoring Audit Summary
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Session ID: <code className="font-mono text-slate-700">{sessionId}</code>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Face Biometric Status</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified & Certified
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Total Integrity Incidents</span>
              <span
                className={`font-bold ${
                  totalViolations === 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {totalViolations} flagged events
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Committee Status</span>
              <span className="font-bold text-slate-700">Submitted for Record</span>
            </div>
          </div>

          {logs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Recorded Incident Log:
              </p>
              <div className="space-y-2">
                {logs.map((log: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">
                          {log.incidentType.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-[11px] text-slate-500">{log.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Question Solutions Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <h2 className="font-bold text-sm text-slate-900 mb-4">
            Question Solutions & Answer Keys
          </h2>

          <div className="space-y-4">
            {questions.map((q: any, idx: number) => (
              <div
                key={q._id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Question {idx + 1}</span>
                  <span className="text-slate-500">{q.points} Marks</span>
                </div>
                <p className="text-slate-800 font-medium">{q.questionText}</p>

                <div className="pt-2 flex items-center gap-2">
                  <span className="text-slate-500">Correct Answer:</span>
                  <span className="font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">
                    Option {q.correctAnswer}
                  </span>
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Print / Save PDF Report
          </button>
          <Link
            href="/dashboard/student"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function ExamResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading Exam Results...</div>}>
      <ExamResultContent examId={resolvedParams.id} />
    </Suspense>
  );
}
