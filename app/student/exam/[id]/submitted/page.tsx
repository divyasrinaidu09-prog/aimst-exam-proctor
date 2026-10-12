'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import StudentSidebar from '@/components/StudentSidebar';
import TopNavbar from '@/components/TopNavbar';
import { CheckCircle2, ArrowRight, Home, Award } from 'lucide-react';

export default function ExamSubmittedPage() {
  const params = useParams();
  const examId = params?.id as string;

  const [exam, setExam] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [submissionTime, setSubmissionTime] = useState('');

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
        console.error('Failed to load submitted exam data:', err);
      }
    }

    setSubmissionTime(
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
        ', ' +
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );

    loadData();
  }, [examId]);

  const subjectCode = exam?.subject?.subject_code || 'BIMS13108';
  const subjectName = exam?.subject?.subject_name || 'Decision Support Systems';

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Submission Confirmation" />

        <main className="flex-1 p-6 sm:p-8 max-w-3xl w-full mx-auto flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center w-full">
            {/* Green Checkmark Circle matching Reference Image 1 Card 10 & 11 */}
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1E38] mb-2">
              Exam Submitted Successfully!
            </h1>

            <p className="text-sm text-slate-500 mb-8">
              Your exam has been submitted. Thank you for your participation.
            </p>

            {/* Exam Summary Details Box matching Reference Image 1 Card 10 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left max-w-md mx-auto mb-8 space-y-3">
              <div className="flex justify-between py-1 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium">Subject Code:</span>
                <span className="font-mono font-bold text-slate-900">{subjectCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium">Subject Name:</span>
                <span className="font-semibold text-slate-900 text-right">{subjectName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium">Submission Time:</span>
                <span className="font-mono text-slate-800">{submissionTime}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-slate-500 font-medium">Proctoring Status:</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Completed & Verified
                </span>
              </div>
            </div>

            {/* Action Buttons matching Card 10 & 11 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/student/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>

              <Link
                href="/student/results"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>View Results (Suggestion)</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
