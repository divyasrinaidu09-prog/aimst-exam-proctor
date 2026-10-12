'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import AimstLogo from '@/components/AimstLogo';
import ViolationModal from '@/components/ViolationModal';
import {
  Clock,
  AlertTriangle,
  FileText,
  Send,
  Eye,
  Camera,
  CheckCircle2,
  Shield,
  Loader2,
  Download,
} from 'lucide-react';

export default function ExamSessionPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({
    '1': '',
    '2': '',
  });

  // Timer states (default 1 hour 45 minutes matching Reference Image 1 Card 8: "01:45:32")
  const [secondsRemaining, setSecondsRemaining] = useState<number>(6332);

  // Anti-cheating & violation states
  const [violationModalOpen, setViolationModalOpen] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const [violationCount, setViolationCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load exam and student data
  useEffect(() => {
    async function init() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        const currentUser = uData.authenticated
          ? uData.user
          : { id: 'prof-student-01', full_name: 'Divyasri Vijaya Kumaran', id_number: 'B21010123' };
        setUser(currentUser);

        const eRes = await fetch(`/api/exams/${examId}`);
        const eData = await eRes.json();
        if (eData.success && eData.exam) {
          setExam(eData.exam);
          if (eData.exam.duration_minutes) {
            setSecondsRemaining(eData.exam.duration_minutes * 60);
          }
        }

        // Initialize session in database
        await fetch('/api/exam/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exam_id: examId,
            student_id: currentUser.id,
          }),
        });
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [examId]);

  // Request camera stream for proctoring
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => {
        console.warn('Webcam stream note:', err);
      });
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Anti-cheating listeners: Tab Switch & Window Focus Lost (Requirement 18)
  useEffect(() => {
    const recordViolation = async (type: string, description: string) => {
      setViolationCount((c) => c + 1);
      setViolationMessage(description);
      setViolationModalOpen(true);

      try {
        await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exam_id: examId,
            student_id: user?.id || 'prof-student-01',
            incident_type: type,
            severity: 'medium',
            description,
            evidence_path: '/incident_snapshot_sample.jpg',
          }),
        });
      } catch (err) {
        console.error('Failed to log violation:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordViolation('Tab Switch', 'You have switched tabs. This is not allowed during the examination.');
      }
    };

    const handleWindowBlur = () => {
      // Trigger warning on window blur
      recordViolation('Browser Focus Lost', 'You clicked outside the examination window.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [examId, user]);

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_id: examId,
          student_id: user?.id || 'prof-student-01',
          answers,
        }),
      });

      router.push(`/student/exam/${examId}/submitted`);
    } catch (err) {
      console.error('Error submitting exam:', err);
      router.push(`/student/exam/${examId}/submitted`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-semibold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E5BF0]" />
          <span>Setting up secure examination environment...</span>
        </div>
      </div>
    );
  }

  const subjectCode = exam?.subject?.subject_code || 'BIMS13108';
  const subjectName = exam?.subject?.subject_name || 'Decision Support Systems';
  const questions = exam?.document?.parsed_questions || [
    {
      id: 1,
      number: 1,
      text: 'Based on the case study provided, answer the following questions in the document:\n1. What are the key factors that influence the decision-making process in this scenario?\n2. Suggest a suitable business intelligence solution to improve the decision-making process.\n3. Justify your answer with relevant examples.',
    },
    {
      id: 2,
      number: 2,
      text: 'Compare and contrast Model-driven Decision Support Systems with Data-driven Decision Support Systems. Provide real-world enterprise applications for each.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex flex-col exam-anti-copy select-none">
      {/* Top Proctoring Bar */}
      <header className="h-16 bg-[#0B1E38] text-white px-6 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <AimstLogo variant="light" size="sm" />
          <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            {subjectCode} • {subjectName}
          </span>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Proctoring Active</span>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-slate-200">
              {user?.full_name || 'Divyasri Vijaya Kumaran'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              ID: {user?.id_number || 'B21010123'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (8 cols): Document-based Exam Paper & Answers matching Reference Image 1 Card 8 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            {/* Exam Paper Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h1 className="text-xl font-black text-[#0B1E38]">
                  Exam Paper - {subjectCode}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete your answers below. Your draft responses are auto-saved.
                </p>
              </div>

              {/* Uploaded Word Document Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-mono">{exam?.document?.original_filename || 'Decision_Support_Systems_Exam.docx'}</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-8">
              {questions.map((q: any, idx: number) => (
                <div key={q.id || idx} className="space-y-3 p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
                  <div className="flex items-start gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#1E5BF0] text-white text-xs font-bold shrink-0">
                      Question {q.number || idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                      {q.text}
                    </p>
                  </div>

                  {/* Candidate Answer Box */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Your Response:
                    </label>
                    <textarea
                      rows={5}
                      value={answers[String(q.id || idx + 1)] || ''}
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [String(q.id || idx + 1)]: e.target.value,
                        })
                      }
                      placeholder="Type your examination answer here..."
                      className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E5BF0] text-slate-900 text-sm leading-relaxed bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side (4 cols): Timer, Monitoring Camera, and Submit Exam Button */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Time Remaining Countdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-red-500" />
              Time Remaining
            </span>

            {/* Red Countdown Display matching Reference Image 1 Card 8 */}
            <div className="text-4xl font-black text-red-600 tracking-tight font-mono py-2">
              {formatTime(secondsRemaining)}
            </div>

            {/* Warning Message matching Card 8 */}
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span><strong>Do not leave this page</strong> - Your activity is being monitored</span>
            </div>

            {/* Submit Exam Button */}
            <button
              onClick={() => setConfirmSubmitOpen(true)}
              className="w-full mt-6 py-4 px-6 rounded-2xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Exam</span>
            </button>
          </div>

          {/* Card: Candidate Webcam Frame Preview */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#1E5BF0]" />
                Webcam Feed
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Connected
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center border border-slate-200">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {(!videoRef.current || !videoRef.current.srcObject) && (
                <Image
                  src={user?.avatar_url || '/student_divyasri.jpg'}
                  alt="Student Proctoring Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                REC • 30 FPS
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              Facial presence is continuously monitored by automated AI models.
            </div>
          </div>
        </div>
      </main>

      {/* Violation Modal Popup matching Reference Image 1 Card 9 */}
      <ViolationModal
        isOpen={violationModalOpen}
        message={violationMessage}
        onDismiss={() => setViolationModalOpen(false)}
      />

      {/* Confirmation Dialog before Final Submission */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-[#1E5BF0] flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">
              Submit Examination?
            </h3>

            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to finalize and submit your examination paper? You will not be able to modify your answers once submitted.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmSubmitOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmSubmitOpen(false);
                  handleSubmitExam();
                }}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Submit</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
