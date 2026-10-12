'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentSidebar from '@/components/StudentSidebar';
import TopNavbar from '@/components/TopNavbar';
import { ArrowRight, FileText, Loader2, Calendar, Clock } from 'lucide-react';

export default function StudentExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadExams() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated) setUser(uData.user);

        const res = await fetch('/api/exams?studentOnly=true');
        const data = await res.json();
        if (data.success && data.exams) {
          setExams(data.exams);
        }
      } catch (err) {
        console.error('Failed to load available exams:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Available Examinations" />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0B1E38]">
                  Available Examinations
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Examinations for all subjects you have enrolled in for the current session.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5BF0]" />
                <span className="text-sm">Loading examinations...</span>
              </div>
            ) : exams.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-sm">No scheduled examinations found.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Please enroll into your courses using the "Join Subject" function on your dashboard.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                      <th className="py-4 px-6">Subject Code</th>
                      <th className="py-4 px-6">Subject Name</th>
                      <th className="py-4 px-6">Date & Time</th>
                      <th className="py-4 px-6">Duration</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-slate-800">
                          {exam.subject?.subject_code || 'BIMS13108'}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {exam.subject?.subject_name || exam.title}
                        </td>
                        <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                          {exam.exam_date}, {exam.start_time}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {exam.duration_minutes || 120} Minutes
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Upcoming
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <Link
                            href={`/student/exam/${exam.id}/instructions`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
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
