'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ExaminerSidebar from '@/components/ExaminerSidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  FileText,
  Download,
  RefreshCw,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export default function ExamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated) setUser(uData.user);

        const eRes = await fetch(`/api/exams/${examId}`);
        const eData = await eRes.json();
        if (eData.success && eData.exam) {
          setExam(eData.exam);
        }
      } catch (err) {
        console.error('Failed to load exam details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-semibold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E5BF0]" />
          <span>Loading exam details...</span>
        </div>
      </div>
    );
  }

  const subjectCode = exam?.subject?.subject_code || 'BIS1013';
  const subjectName = exam?.subject?.subject_name || 'Introduction to Business';
  const docFilename = exam?.document?.original_filename || 'BIS1013_ExamPaper.docx';
  const docSize = exam?.document?.file_size ? `${Math.round(exam.document.file_size / 1024)} KB` : '341 KB';
  const duration = exam?.duration_minutes || 60;
  const startTime = exam?.start_time || '09:00 AM';
  const endTime = exam?.end_time || '10:00 AM';
  const examDate = exam?.exam_date || '16 Oct 2025';
  const questions = exam?.document?.parsed_questions || [];

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <ExaminerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Examination Details & Content" />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="mb-2">
            <Link
              href="/examiner/exams"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E5BF0] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Examinations</span>
            </Link>
          </div>

          {/* Exam Details Card matching Reference Image 2 Card 25 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm">
            <div className="border-b border-slate-100 pb-6 mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#0B1E38]">
                  Exam Details
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Active examination configuration, uploaded paper, and schedule.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Scheduled & Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Subject Code, Name, File Box matching Card 25 */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Subject Code
                  </label>
                  <p className="text-xl font-black text-slate-900 font-mono">
                    {subjectCode}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Subject Name
                  </label>
                  <p className="text-base font-bold text-slate-900">
                    {subjectName}
                  </p>
                </div>

                {/* File Card matching Card 25 */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    File
                  </label>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1E5BF0] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Exam Paper (Word Document)</p>
                        <p className="text-sm font-bold text-slate-900 font-mono">
                          {docFilename} <span className="text-xs text-slate-400 font-normal">({docSize})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => alert(`Downloading ${docFilename} from secure Supabase storage.`)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <Link
                        href={`/examiner/exams/upload?subject=${subjectCode}`}
                        className="px-3 py-1.5 rounded-lg bg-[#1E5BF0] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Exam Information matching Card 25 */}
              <div className="space-y-6 md:border-l md:border-slate-100 md:pl-8">
                <h3 className="text-base font-bold text-slate-900">
                  Exam Information
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Duration
                  </label>
                  <p className="text-sm font-semibold text-slate-800">
                    {duration} minutes
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Start Time
                  </label>
                  <p className="text-sm font-semibold text-slate-800 font-mono">
                    {examDate}, {startTime}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    End Time
                  </label>
                  <p className="text-sm font-semibold text-slate-800 font-mono">
                    {examDate}, {endTime}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/examiner/monitoring?subject=${subjectCode}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1E38] hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span>Launch Live Monitoring</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Extracted Questions Section */}
            {questions.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Extracted Questions ({questions.length})
                </h3>
                <div className="space-y-4">
                  {questions.map((q: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-xs text-[#1E5BF0] uppercase">
                        Question {q.number || i + 1}:
                      </span>
                      <p className="text-sm text-slate-800 mt-1 whitespace-pre-line">
                        {q.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
