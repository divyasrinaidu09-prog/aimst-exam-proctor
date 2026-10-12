'use client';

import React, { useState, useEffect } from 'react';
import StudentSidebar from '@/components/StudentSidebar';
import TopNavbar from '@/components/TopNavbar';
import JoinSubjectModal from '@/components/JoinSubjectModal';
import { BookOpen, PlusCircle, CheckCircle2, User, Loader2 } from 'lucide-react';

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      if (uData.authenticated) setUser(uData.user);

      const sRes = await fetch('/api/subjects');
      const sData = await sRes.json();
      if (sData.success) {
        // Enrolled subjects for Divyasri
        setSubjects(sData.subjects.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load student subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="My Enrolled Subjects" />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0B1E38]">
                  My Subjects
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Subjects you are currently enrolled in for examination access.
                </p>
              </div>

              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Join Subject</span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5BF0]" />
                <span className="text-sm">Loading enrolled subjects...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E5BF0] font-mono font-bold text-xs">
                          {sub.subject_code}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Enrolled
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">
                        {sub.subject_name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {sub.description || 'AIMST University Academic Curriculum Course.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lecturer: Dr. Ahmad</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <JoinSubjectModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        studentId={user?.id}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
