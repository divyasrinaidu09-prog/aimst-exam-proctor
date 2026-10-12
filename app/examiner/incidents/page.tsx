'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ExaminerSidebar from '@/components/ExaminerSidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  User,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export default function ProctoringIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadIncidents() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated) setUser(uData.user);

        const res = await fetch('/api/incidents');
        const data = await res.json();
        if (data.success && data.incidents) {
          setIncidents(data.incidents);
        }
      } catch (err) {
        console.error('Failed to load incidents:', err);
      } finally {
        setLoading(false);
      }
    }
    loadIncidents();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <ExaminerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Proctoring Incident Telemetry" />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            {/* Header matching Reference Image 1 Card 20 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0B1E38]">
                  Proctoring Incidents
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Automated security triggers and forensic webcam snapshots recorded during examinations.
                </p>
              </div>

              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5 self-start">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Potential Proctoring Incidents</span>
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5BF0]" />
                <span className="text-sm">Loading incident log...</span>
              </div>
            ) : incidents.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No active incidents recorded.</p>
                <p className="text-xs text-slate-400 mt-1">High integrity rate observed across active sessions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="py-4 px-6 w-16">ID</th>
                      <th className="py-4 px-6">Candidate</th>
                      <th className="py-4 px-6">Incident Type</th>
                      <th className="py-4 px-6">Details</th>
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">Severity</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {incidents.map((inc, idx) => (
                      <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-slate-400">
                          #{idx + 1}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900 leading-tight">
                            {inc.student?.full_name || 'Tan Wei Leng'}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            {inc.student?.id_number || 'B21010123'}
                          </p>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          {inc.incident_type}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 max-w-xs truncate">
                          {inc.description}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              inc.severity === 'high'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              inc.review_status === 'reviewed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inc.review_status === 'reviewed' ? 'Reviewed' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <Link
                            href={`/examiner/incidents/${inc.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E5BF0] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
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
