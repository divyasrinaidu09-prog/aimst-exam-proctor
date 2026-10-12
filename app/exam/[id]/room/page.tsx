'use client';

import { useState, useEffect, useCallback, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  Send,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import ProctorMonitor from '@/components/proctor/ProctorMonitor';

function ExamRoomContent({ examId }: { examId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(3600); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch exam questions & session data
  useEffect(() => {
    if (!sessionId) {
      router.push(`/exam/${examId}/verify`);
      return;
    }

    async function loadExamData() {
      try {
        setLoading(true);
        // Fetch exam details and questions
        const examRes = await fetch(`/api/examiner/exams/${examId}/questions`);
        const eData = await examRes.json();

        // Also fetch general exam info
        const allExamsRes = await fetch(`/api/student/exams`);
        const allData = await allExamsRes.json();
        const currentExam = (allData.exams || []).find((e: any) => e._id === examId);

        if (currentExam) {
          setExam(currentExam);
          setTimeLeft(currentExam.duration * 60);
        }

        if (eData.questions) {
          setQuestions(eData.questions);
        }
      } catch (err) {
        console.error('Failed to load exam questions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadExamData();
  }, [examId, sessionId, router]);

  // Submit exam callback
  const submitExam = useCallback(async () => {
    if (isSubmitting || !sessionId) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/student/sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionID: sessionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit exam');
      }

      // Route to results screen
      router.push(`/exam/${examId}/result?session=${sessionId}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission error');
      setIsSubmitting(false);
    }
  }, [sessionId, examId, router, isSubmitting]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeLeft, submitExam]);

  // Save selected option
  const handleSelectOption = async (optionId: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !sessionId) return;

    // Optimistic UI update
    setAnswers((prev) => ({ ...prev, [currentQ._id]: optionId }));

    try {
      await fetch('/api/student/sessions/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionID: sessionId,
          questionID: currentQ._id,
          selectedOption: optionId,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync answer:', err);
    }
  };

  // Toggle review flag
  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Format timer into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !sessionId) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-aimst-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400">Loading Monitored Examination Chamber...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none exam-anti-copy">
      {/* Proctoring Shield Monitor */}
      <ProctorMonitor
        sessionId={sessionId}
        examId={examId}
        maxViolations={exam?.maxViolationsAllowed || 5}
        onSessionTerminated={() => {
          alert('Notice: Maximum proctoring violation threshold reached. Your exam is being submitted automatically for committee review.');
          submitExam();
        }}
      />

      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-aimst-700 flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                {exam?.courseCode}
              </span>
              <h1 className="text-sm font-bold text-white hidden sm:inline">
                {exam?.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Live Synchronized Countdown Timer */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm border ${
              timeLeft < 300
                ? 'bg-red-950/80 border-red-500/80 text-red-400 animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-aimst-400" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-xl bg-aimst-600 hover:bg-aimst-500 text-white font-semibold text-xs transition-all shadow-md shadow-aimst-600/30 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish Exam</span>
          </button>
        </div>
      </header>

      {/* Main Examination Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Question Content View */}
        <div className="flex-1 flex flex-col justify-between bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          {currentQ ? (
            <div>
              {/* Question Meta Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-aimst-950 text-aimst-400 border border-aimst-800">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    ({currentQ.points} {currentQ.points === 1 ? 'Mark' : 'Marks'})
                  </span>
                </div>

                <button
                  onClick={() => toggleFlag(currentQ._id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    flagged[currentQ._id]
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flagged[currentQ._id] ? 'Flagged' : 'Flag for Review'}</span>
                </button>
              </div>

              {/* Question Text Prompt */}
              <div className="text-base sm:text-lg font-medium text-white leading-relaxed mb-8">
                {currentQ.questionText}
              </div>

              {/* MCQ Options List */}
              <div className="space-y-3">
                {currentQ.options.map((opt: any) => {
                  const isSelected = answers[currentQ._id] === opt.optionId;
                  return (
                    <button
                      key={opt.optionId}
                      onClick={() => handleSelectOption(opt.optionId)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-aimst-950/80 border-aimst-500 text-white shadow-lg shadow-aimst-900/50 ring-1 ring-aimst-500'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-aimst-500 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {opt.optionId}
                      </div>
                      <span className="text-sm leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <HelpCircle className="w-10 h-10 mx-auto mb-2" />
              <p>No questions configured for this exam session.</p>
            </div>
          )}

          {/* Navigation Prev / Next Buttons */}
          <div className="pt-8 border-t border-slate-800 flex items-center justify-between mt-8">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Question
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Answered {answeredCount} of {questions.length}
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-aimst-700 hover:bg-aimst-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next Question
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar: Question Matrix Navigator */}
        <div className="w-full md:w-64 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm self-start">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Question Overview
          </h3>

          {/* Matrix Grid */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q._id]);
              const isFlagged = Boolean(flagged[q._id]);
              const isCurrent = idx === currentIndex;

              let style = 'bg-slate-800/80 border-slate-700 text-slate-400';
              if (isAnswered) style = 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300';
              if (isFlagged) style = 'bg-amber-950/80 border-amber-500/80 text-amber-300';
              if (isCurrent) style += ' ring-2 ring-aimst-400';

              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg border text-xs font-bold transition-all relative flex items-center justify-center ${style}`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-[11px] text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-500"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>
              <span>Unanswered ({questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-950 border border-amber-500"></span>
              <span>Flagged for Review</span>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal: Submit Exam */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-aimst-500/10 border border-aimst-500/30 flex items-center justify-center mx-auto mb-4 text-aimst-400">
              <FileCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Submit Examination Paper?
            </h3>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              You have completed <strong className="text-white">{answeredCount}</strong> out of{' '}
              <strong className="text-white">{questions.length}</strong> questions. Once submitted, your answers will be locked, auto-graded, and uploaded alongside your proctoring logs.
            </p>

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-left">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Return to Exam
              </button>
              <button
                onClick={submitExam}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-aimst-600 hover:bg-aimst-500 transition-all shadow-lg shadow-aimst-600/30 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Grading & Submitting...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Final Submission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Preparing Exam Room...</div>}>
      <ExamRoomContent examId={resolvedParams.id} />
    </Suspense>
  );
}
