'use client';

import React, { useState, useEffect } from 'react';
import ExaminerSidebar from '@/components/ExaminerSidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  BarChart3,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  ShieldCheck,
} from 'lucide-react';

export default function ExaminerReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState('BIMS13109');

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

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'No,Student ID,Name,Subject,Attendance,Violations,Status\n' +
      '1,B21010123,Tan Wei Leng,BIMS13109,Present,1 (Tab Switch),Flagged\n' +
      '2,B21010145,Nur Aisyah,BIMS13109,Present,1 (Multiple Face),Flagged\n' +
      '3,B21010167,Muhammad Afiq,BIMS13109,Present,1 (Face Not Detected),Flagged\n' +
      '4,B21010189,Lim Jia Wen,BIMS13109,Absent,0,Not Joined\n' +
      '5,B21010211,Siti Nurhaliza,BIMS13109,Present,0,Verified\n' +
      '6,B21010155,Aravinth,BIMS13109,Absent,0,Not Joined\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIMST_Proctoring_Report_${selectedSubject}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <ExaminerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Proctoring & Audit Reports" />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Main Report Card matching Reference Image 1 Card 23 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-black text-[#0B1E38]">
                  Proctoring Report - {selectedSubject}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Forensic integrity report and candidate attendance telemetry.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            {/* 3 Metric Cards matching Reference Image 1 Card 23 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Students
                </span>
                <p className="text-4xl font-black text-[#0B1E38] mt-2">8</p>
                <p className="text-xs text-slate-400 mt-1">Enrolled candidate cohort</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Incidents
                </span>
                <p className="text-4xl font-black text-amber-600 mt-2">4</p>
                <p className="text-xs text-slate-400 mt-1">Flagged for review</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Integrity Rate
                </span>
                <p className="text-4xl font-black text-emerald-600 mt-2">95%</p>
                <p className="text-xs text-slate-400 mt-1">Automated compliance rating</p>
              </div>
            </div>

            {/* Report Inclusions Summary */}
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 mb-8 text-xs text-slate-700 space-y-1.5">
              <p className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                Report Includes:
              </p>
              <p>• Student attendance and exact join timestamps</p>
              <p>• Incident summary categorized by violation type</p>
              <p>• Timestamped audit logs for session verification</p>
              <p>• Evidence camera snapshots stored securely in private buckets</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
