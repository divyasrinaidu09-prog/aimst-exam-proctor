'use client';

import React, { useState, useEffect } from 'react';
import StudentSidebar from '@/components/StudentSidebar';
import TopNavbar from '@/components/TopNavbar';
import GradingSuggestionCard from '@/components/GradingSuggestionCard';
import { Award, CheckCircle2, Clock, Eye, FileText } from 'lucide-react';

export default function StudentResultsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated) setUser(uData.user);
      } catch {}
    }
    loadUser();
  }, []);

  const results = [
    {
      code: 'BIMS13108',
      name: 'Decision Support Systems',
      date: '15 Apr 2026',
      status: 'Completed',
      integrity: 'Verified (0 Violations)',
    },
    {
      code: 'BIMS13109',
      name: 'Strategic Management IS',
      date: '18 Apr 2026',
      status: 'Upcoming',
      integrity: 'Scheduled',
    },
    {
      code: 'BIMS13142',
      name: 'Business Analytics',
      date: '20 Apr 2026',
      status: 'Upcoming',
      integrity: 'Scheduled',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Examination Results & History" />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Results Table matching Reference Image 1 Card 12 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="pb-6 border-b border-slate-100 mb-4">
              <h1 className="text-2xl font-black text-[#0B1E38]">
                My Results
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Forensic participation records and official exam status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                    <th className="py-4 px-6">Subject Code</th>
                    <th className="py-4 px-6">Subject Name</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Proctoring Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {results.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">
                        {r.code}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {r.name}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {r.date}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            r.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        {r.integrity}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grading System Suggestion Card */}
          <GradingSuggestionCard />
        </main>
      </div>
    </div>
  );
}
