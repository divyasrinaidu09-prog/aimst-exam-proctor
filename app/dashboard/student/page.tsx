'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  GraduationCap,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  BookOpen
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
    fetchExams();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Session fetch error:', err);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/exams');
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (err) {
      console.error('Exams fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Student Banner */}
        <div className="bg-gradient-to-r from-aimst-800 via-aimst-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
            <ShieldCheck className="w-80 h-80" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-aimst-200 mb-3 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AIMST University Candidate Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Welcome, {user?.name || 'Student Candidate'}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-4">
              Your registered examinations are monitored by the AIMST automated proctoring shield. Before entering any exam, ensure your webcam is enabled, your workspace is well-lit, and background applications are closed.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-300">Candidate ID:</span>
                <span className="font-mono font-bold text-white">{user?.userID || 'STD-23091'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-300">Biometric Reference:</span>
                <span className="text-aimst-300 font-semibold">Enrolled & Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Assigned Semester Examinations
            </h2>
            <p className="text-xs text-slate-500">
              Select an ongoing exam to proceed to facial identity verification
            </p>
          </div>
        </div>

        {/* Exams List */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-2 border-aimst-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Checking examination schedule...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No active examinations</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently do not have any pending proctored exams assigned to your cohort.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const isOngoing = exam.status === 'ongoing';
              return (
                <div
                  key={exam._id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm transition-all flex flex-col justify-between ${
                    isOngoing
                      ? 'border-aimst-500/40 ring-2 ring-aimst-500/10 hover:shadow-md'
                      : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                        {exam.courseCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isOngoing
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {isOngoing ? 'Active Now' : exam.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2">
                      {exam.title}
                    </h3>

                    <div className="space-y-2 text-xs text-slate-600 mb-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Duration: {exam.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>Points: {exam.totalPoints} pts (Pass: {exam.passPercentage}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-aimst-600" />
                        <span>Anti-Cheating Shield: Enforced</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    {isOngoing ? (
                      <Link
                        href={`/exam/${exam._id}/verify`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-aimst-700 hover:bg-aimst-800 text-white text-xs font-semibold shadow-md shadow-aimst-700/20 transition-all group"
                      >
                        <span>Start Identity Verification</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
                      >
                        Scheduled (Opens Soon)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
