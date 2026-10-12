'use client';

import React, { useState, useEffect } from 'react';
import ExaminerSidebar from '@/components/ExaminerSidebar';
import TopNavbar from '@/components/TopNavbar';
import { Users, Filter, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

export default function ExaminerStudentsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('BIS1013');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const loadData = async (code: string) => {
    try {
      setLoading(true);
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      if (uData.authenticated) setUser(uData.user);

      const subRes = await fetch('/api/subjects');
      const subData = await subRes.json();
      if (subData.success && subData.subjects) {
        setSubjects(subData.subjects);
      }

      const monRes = await fetch(`/api/monitoring?subject=${code}`);
      const monData = await monRes.json();
      if (monData.success && monData.data?.participants) {
        setStudents(monData.data.participants);
      }
    } catch (err) {
      console.error('Failed to load enrolled students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedSubjectCode);
  }, [selectedSubjectCode]);

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <ExaminerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Enrolled Students Roster" />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            {/* Header matching Reference Image 2 Card 27 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0B1E38]">
                  Enrolled Students
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Students self-enrolled via subject code. No manual examiner entry required.
                </p>
              </div>

              {/* Subject Code Selector dropdown matching Card 27 */}
              <div className="flex items-center gap-3">
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.subject_code}>
                      {s.subject_code} - {s.subject_name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => loadData(selectedSubjectCode)}
                  className="px-4 py-2.5 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5BF0]" />
                <span className="text-sm">Loading enrolled student cohort...</span>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
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
                    {students.map((st) => (
                      <tr key={st.no} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono text-slate-400">{st.no}</td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">
                          {st.studentId}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-900">{st.name}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              st.status === 'Joined' || st.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-xs text-slate-600">
                          {st.joinTime || '-'}
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
