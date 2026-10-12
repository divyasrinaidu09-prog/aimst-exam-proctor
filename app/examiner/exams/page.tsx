'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ExaminerSidebar from '@/components/ExaminerSidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  FileText,
  Upload,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react';

export default function ExaminerExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadExams() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated) setUser(uData.user);

        const res = await fetch('/api/exams');
        const data = await res.json();
        if (data.success && data.exams) {
          setExams(data.exams);
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <ExaminerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Examinations & Paper Submissions" />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Exam Submissions Summary matching Reference Image 2 Card 29 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0B1E38]">
                  Exam Submission
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Master index of course examination papers and paper upload statuses.
                </p>
              </div>

              <Link
                href="/examiner/exams/upload"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Paper</span>
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5BF0]" />
                <span className="text-sm">Loading examination papers...</span>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="py-4 px-6">Subject Code</th>
                      <th className="py-4 px-6">Subject Name</th>
                      <th className="py-4 px-6">Submission Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">
                          {exam.subject?.subject_code || 'BIS1013'}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-900">
                          {exam.subject?.subject_name || exam.title}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              exam.document
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {exam.document ? 'Submitted' : 'Not Submitted'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/examiner/exams/upload?subject=${exam.subject?.subject_code}`}
                              className="px-3 py-1.5 rounded-lg border border-blue-200 text-[#1E5BF0] hover:bg-blue-50 text-xs font-bold transition-colors"
                            >
                              Upload
                            </Link>
                            <Link
                              href={`/examiner/exams/${exam.id}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
