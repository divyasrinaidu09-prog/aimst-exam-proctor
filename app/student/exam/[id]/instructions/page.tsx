'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import StudentSidebar from '@/components/StudentSidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export default function ExamInstructionsPage() {
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
        console.error('Failed to load exam:', err);
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
          <span>Loading examination instructions...</span>
        </div>
      </div>
    );
  }

  const subjectCode = exam?.subject?.subject_code || 'BIMS13108';
  const subjectName = exam?.subject?.subject_name || 'Decision Support Systems';

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Examination Portal" />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm">
            {/* Header matching Reference Image 1 Card 5 */}
            <div className="border-b border-slate-100 pb-6 mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1E5BF0] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Official AIMST Examination
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B1E38] mt-3">
                Exam Instructions
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                {subjectCode} - {subjectName}
              </p>
            </div>

            {/* 3 Metric Specification Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-[#1E5BF0] flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Exam Duration</span>
                  <p className="text-lg font-black text-slate-900">
                    {exam?.duration_minutes ? `${Math.round(exam.duration_minutes / 60)} hours` : '2 hours'}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Total Questions</span>
                  <p className="text-lg font-black text-slate-900">
                    Document-Based
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Format</span>
                  <p className="text-lg font-black text-slate-900">
                    Word DOCX Paper
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notes Box matching Reference Image 1 Card 5 */}
            <div className="bg-slate-50/80 rounded-2xl p-6 sm:p-8 border border-slate-200/90 mb-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Important Notes & Examination Regulations:
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E5BF0] shrink-0 mt-0.5" />
                  <span>Ensure you are in a quiet, private environment with adequate lighting.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E5BF0] shrink-0 mt-0.5" />
                  <span>Keep your face clearly visible to the camera throughout the entire examination.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E5BF0] shrink-0 mt-0.5" />
                  <span>Do not leave or switch away from the examination browser tab. Tab switches will be automatically flagged.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E5BF0] shrink-0 mt-0.5" />
                  <span>Do not use unauthorized applications, secondary monitors, or unauthorized electronic devices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E5BF0] shrink-0 mt-0.5" />
                  <span>Continuous webcam access and browser permission are mandatory.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E5BF0] shrink-0 mt-0.5" />
                  <span>Face presence verification will be conducted immediately before entry.</span>
                </li>
              </ul>
            </div>

            {/* CTA Continue Button */}
            <div className="flex justify-end">
              <Link
                href={`/student/exam/${examId}/verify`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all uppercase tracking-wider"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
