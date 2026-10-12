'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ExaminerSidebar from '@/components/ExaminerSidebar';
import TopNavbar from '@/components/TopNavbar';
import GradingSuggestionCard from '@/components/GradingSuggestionCard';
import {
  Upload,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function ExaminerDashboardPage() {
  const [user, setUser] = useState<any>({
    full_name: 'Dr. Ahmad',
    id_number: '88012',
    email: 'ahmad@aimst.edu.my',
    role: 'examiner',
    avatar_url: '/examiner_ahmad.jpg',
  });
  const [stats, setStats] = useState({
    totalSubjects: 8,
    upcomingExams: 3,
    activeSessions: 1,
    recentActivities: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated && uData.user) {
          setUser(uData.user);
        }

        const subRes = await fetch('/api/subjects');
        const subData = await subRes.json();

        setStats({
          totalSubjects: subData?.subjects?.length || 8,
          upcomingExams: 3,
          activeSessions: 1,
          recentActivities: [
            { id: 1, text: 'Student Divyasri Vijaya Kumaran self-enrolled in Decision Support Systems', time: '12 mins ago', type: 'enroll' },
            { id: 2, text: 'Exam paper BIS1013_ExamPaper.docx uploaded & parsed', time: '28 mins ago', type: 'upload' },
            { id: 3, text: 'Active exam in progress: Introduction to Business (BIS1013)', time: '40 mins ago', type: 'session' },
            { id: 4, text: 'Candidate Tan Wei Leng submitted examination responses', time: '1 hour ago', type: 'submission' },
            { id: 5, text: 'Potential violation (Tab Switch) flagged for forensic review', time: '1 hour ago', type: 'incident' },
          ],
        });
      } catch (err) {
        console.error('Failed to load examiner dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      {/* Examiner Dark Navy Sidebar */}
      <ExaminerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Examiner & Administrative Workspace" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Welcome Banner matching Reference Image 2 Card 22 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#0B1E38] tracking-tight">
                  Welcome, {user.full_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1E5BF0] border border-blue-200 uppercase tracking-wider font-mono">
                  {user.role || 'Examiner'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Faculty Portal for subject management, document paper upload, and live anti-cheating telemetry.
              </p>
            </div>
          </div>

          {/* 4 Large Action Cards matching Reference Image 2 Card 22 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Upload Exam Paper */}
            <Link
              href="/examiner/exams/upload"
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E5BF0] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E5BF0] transition-colors">
                  Upload Exam Paper
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload Word document for new exam
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1E5BF0]">
                <span>Upload .DOCX</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Manage Subjects */}
            <Link
              href="/examiner/subjects"
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E5BF0] transition-colors">
                  Manage Subjects
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  View and manage subject list
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1E5BF0]">
                <span>View Subjects</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Monitor Students */}
            <Link
              href="/examiner/monitoring"
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E5BF0] transition-colors">
                  Monitor Students
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Check who has joined or not
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1E5BF0]">
                <span>Live View</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4: View Reports */}
            <Link
              href="/examiner/reports"
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E5BF0] transition-colors">
                  View Reports
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Exam participation and summary
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1E5BF0]">
                <span>Forensic Reports</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* 3 Metric Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Subjects
              </span>
              <p className="text-4xl font-black text-[#0B1E38] mt-2">{stats.totalSubjects}</p>
              <p className="text-xs text-slate-500 mt-1">Managed under AIMST Faculty</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Upcoming Exams
              </span>
              <p className="text-4xl font-black text-[#0B1E38] mt-2">{stats.upcomingExams}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Word papers uploaded</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Sessions
              </span>
              <p className="text-4xl font-black text-[#0B1E38] mt-2">{stats.activeSessions}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Real-time monitoring online</span>
              </div>
            </div>
          </div>

          {/* Recent Activity List matching Reference Image 1 Card 15 & 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Activities</h2>
                <p className="text-xs text-slate-500">
                  Live system audit events and student participation triggers
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Live Sync</span>
            </div>

            <div className="divide-y divide-slate-100">
              {stats.recentActivities.map((act) => (
                <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#1E5BF0]"></span>
                    <span className="text-sm font-medium text-slate-800">{act.text}</span>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grading System Suggestion Card matching Reference Image 2 Card 30 */}
          <GradingSuggestionCard />
        </main>
      </div>
    </div>
  );
}
