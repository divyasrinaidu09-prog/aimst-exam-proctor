'use client';

import React, { useState, useEffect } from 'react';
import ExaminerSidebar from '@/components/ExaminerSidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Radio,
} from 'lucide-react';

export default function ExaminerMonitoringPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('BIS1013');
  const [monitorData, setMonitorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'participants' | 'activity'>('participants');
  const [filter, setFilter] = useState<'all' | 'joined' | 'not_joined'>('all');
  const [user, setUser] = useState<any>(null);

  const loadData = async (code: string) => {
    try {
      setLoading(true);
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      if (uData.authenticated) setUser(uData.user);

      const res = await fetch(`/api/monitoring?subject=${code}`);
      const data = await res.json();
      if (data.success && data.data) {
        setMonitorData(data.data);
        if (data.data.subjectsList) {
          setSubjects(data.data.subjectsList);
        }
      }
    } catch (err) {
      console.error('Monitoring load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedSubjectCode);
    const interval = setInterval(() => {
      loadData(selectedSubjectCode);
    }, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, [selectedSubjectCode]);

  const participants = monitorData?.participants || [];
  const filteredParticipants = participants.filter((p: any) => {
    if (filter === 'joined') return p.status === 'Joined' || p.status === 'Present';
    if (filter === 'not_joined') return p.status === 'Not Joined';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <ExaminerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Live Examination Proctoring Telemetry" />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Banner with Exam in Progress matching Reference Image 2 Card 28 */}
          <div className="bg-[#0B1E38] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Exam in Progress
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedSubjectCode}
                </span>
              </div>
              <h1 className="text-2xl font-black mt-2 tracking-tight">
                Live Monitoring - {monitorData?.subject?.subject_name || 'Introduction to Business'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time candidate telemetry, biometric verification status, and anti-cheating alerts.
              </p>
            </div>

            {/* Countdown Clock Display matching Card 28 */}
            <div className="flex items-center gap-3 bg-[#162D4D] px-5 py-3 rounded-2xl border border-slate-700 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Time Left
                </p>
                <p className="text-xl font-black text-emerald-400 font-mono">
                  00:47:32
                </p>
              </div>
            </div>
          </div>

          {/* Controls & Subject Selector Bar matching Reference Image 2 Card 26 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subject:
              </label>
              <select
                value={selectedSubjectCode}
                onChange={(e) => setSelectedSubjectCode(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.subject_code}>
                    {s.subject_code} - {s.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadData(selectedSubjectCode)}
                className="px-4 py-2 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Live</span>
              </button>
            </div>
          </div>

          {/* 3 Metric Cards matching Reference Image 2 Card 26 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Green Card: Joined Students */}
            <div
              onClick={() => setFilter('joined')}
              className={`cursor-pointer rounded-2xl p-6 border transition-all ${
                filter === 'joined'
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                  : 'bg-emerald-50/70 hover:bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Joined Students
                </span>
                <CheckCircle2 className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-4xl font-black mt-2">
                {monitorData?.joinedCount || 18}
              </p>
              <p className="text-xs opacity-80 mt-1 font-medium">Actively seated in session</p>
            </div>

            {/* Red Card: Not Joined Students */}
            <div
              onClick={() => setFilter('not_joined')}
              className={`cursor-pointer rounded-2xl p-6 border transition-all ${
                filter === 'not_joined'
                  ? 'bg-red-500 text-white border-red-600 shadow-md'
                  : 'bg-red-50/70 hover:bg-red-50 text-red-900 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Not Joined Students
                </span>
                <XCircle className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-4xl font-black mt-2">
                {monitorData?.notJoinedCount || 7}
              </p>
              <p className="text-xs opacity-80 mt-1 font-medium">Absent or delayed entry</p>
            </div>

            {/* Blue Card: Total Enrolled */}
            <div
              onClick={() => setFilter('all')}
              className={`cursor-pointer rounded-2xl p-6 border transition-all ${
                filter === 'all'
                  ? 'bg-[#1E5BF0] text-white border-blue-700 shadow-md'
                  : 'bg-blue-50/70 hover:bg-blue-50 text-blue-900 border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Total Enrolled
                </span>
                <Users className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-4xl font-black mt-2">
                {monitorData?.totalEnrolled || 25}
              </p>
              <p className="text-xs opacity-80 mt-1 font-medium">Self-enrolled candidate cohort</p>
            </div>
          </div>

          {/* Detailed View Table with Tabs matching Reference Image 2 Card 28 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="px-6 pt-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'participants'
                      ? 'border-[#1E5BF0] text-[#1E5BF0]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Participants ({filteredParticipants.length})
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'activity'
                      ? 'border-[#1E5BF0] text-[#1E5BF0]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Activity Log (Live Events)
                </button>
              </div>

              {activeTab === 'participants' && (
                <div className="pb-3 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Filter:</span>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      filter === 'all' ? 'bg-slate-200 text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('joined')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      filter === 'joined' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'
                    }`}
                  >
                    Joined
                  </button>
                  <button
                    onClick={() => setFilter('not_joined')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      filter === 'not_joined' ? 'bg-red-100 text-red-800' : 'text-slate-500'
                    }`}
                  >
                    Not Joined
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5BF0]" />
                <span className="text-sm">Refreshing live proctoring telemetry...</span>
              </div>
            ) : activeTab === 'participants' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="py-4 px-6 w-16">No.</th>
                      <th className="py-4 px-6">Student ID</th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Join Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredParticipants.map((p: any) => (
                      <tr key={p.no} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono text-slate-400">{p.no}</td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">
                          {p.studentId}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-900">{p.name}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.status === 'Joined' || p.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-xs text-slate-600">
                          {p.joinTime || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Activity Log tab */
              <div className="p-6 divide-y divide-slate-100 space-y-3">
                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Student <strong>Tan Wei Leng (B21010123)</strong> joined the exam session.</span>
                  </div>
                  <span className="font-mono text-slate-400">09:02 AM</span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Student <strong>Nur Aisyah (B21010145)</strong> passed webcam face verification.</span>
                  </div>
                  <span className="font-mono text-slate-400">09:04 AM</span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Proctoring trigger: Candidate <strong>Tan Wei Leng</strong> switched tabs for 4 seconds. Forensic snapshot recorded.</span>
                  </div>
                  <span className="font-mono text-slate-400">09:14 AM</span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Student <strong>Siti Nurhaliza (B21010211)</strong> joined the exam session.</span>
                  </div>
                  <span className="font-mono text-slate-400">09:10 AM</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
