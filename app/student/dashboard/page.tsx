'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentSidebar from '@/components/StudentSidebar';
import TopNavbar from '@/components/TopNavbar';
import JoinSubjectModal from '@/components/JoinSubjectModal';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>({
    full_name: 'Divyasri Vijaya Kumaran',
    id_number: 'B21010123',
    role: 'student',
    avatar_url: '/student_divyasri.jpg',
  });
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [stats, setStats] = useState({
    upcomingExams: 2,
    completedExams: 1,
    totalSubjects: 5,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      if (userData.authenticated && userData.user) {
        setUser(userData.user);
      }

      const examRes = await fetch('/api/exams?studentOnly=true');
      const examData = await examRes.json();
      if (examData.success && examData.exams) {
        setExams(examData.exams);
        const upcoming = examData.exams.filter((e: any) => e.status !== 'completed').length;
        setStats({
          upcomingExams: Math.max(upcoming, 2),
          completedExams: 1,
          totalSubjects: 5,
        });
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      {/* Student Sidebar */}
      <StudentSidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Student Portal" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#0B1E38] tracking-tight">
                  Hello, {user.full_name.split(' ')[0]}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1E5BF0] border border-blue-200/60 font-mono">
                  Student ID: {user.id_number}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Welcome back to AIMST Online Exam Proctoring System. Verify your upcoming examination schedule.
              </p>
            </div>

            {/* Join Subject CTA Button */}
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Join Subject</span>
            </button>
          </div>

          {/* 3 Metric Summary Cards matching Reference Image 1 Card 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upcoming Exams Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Upcoming Exams
                </span>
                <Link
                  href="/student/exams"
                  className="text-xs font-semibold text-[#1E5BF0] hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-4xl font-black text-[#0B1E38] mt-3">
                {stats.upcomingExams}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Ready for proctoring</span>
              </div>
            </div>

            {/* Completed Exams Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Completed Exams
                </span>
                <Link
                  href="/student/results"
                  className="text-xs font-semibold text-[#1E5BF0] hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-4xl font-black text-[#0B1E38] mt-3">
                {stats.completedExams}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Responses submitted</span>
              </div>
            </div>

            {/* Total Subjects Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Subjects
                </span>
                <Link
                  href="/student/subjects"
                  className="text-xs font-semibold text-[#1E5BF0] hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-4xl font-black text-[#0B1E38] mt-3">
                {stats.totalSubjects}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-teal-600 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                <span>Active semester enrollments</span>
              </div>
            </div>
          </div>

          {/* Exam Timetable Card Table matching Reference Image 1 Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Exam Timetable</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official examination schedule for your enrolled subjects
                </p>
              </div>
              <Link
                href="/student/exams"
                className="text-xs font-bold text-[#1E5BF0] hover:underline"
              >
                View Full List
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5BF0]" />
                <span className="text-sm">Loading timetable...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <th className="py-3.5 px-6">Date</th>
                      <th className="py-3.5 px-6">Time</th>
                      <th className="py-3.5 px-6">Subject Code</th>
                      <th className="py-3.5 px-6">Subject Name</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">
                          {exam.exam_date || '15 Apr 2026'}
                        </td>
                        <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                          {exam.start_time} - {exam.end_time || '11:00 AM'}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-800">
                          {exam.subject?.subject_code || 'BIMS13108'}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-900">
                          {exam.subject?.subject_name || exam.title}
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
                            <span>Enter Exam</span>
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

      {/* Join Subject Modal */}
      <JoinSubjectModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        studentId={user.id}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
