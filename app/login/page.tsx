'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AimstLogo from '@/components/AimstLogo';
import { GraduationCap, UserCheck, ArrowRight, Loader2 } from 'lucide-react';

function LoginRouterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams.get('role');
    const demo = searchParams.get('demo');

    if (role === 'examiner' || demo === 'examiner') {
      router.replace('/examiner/login');
    } else if (role === 'student' || demo === 'student') {
      router.replace('/student/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <AimstLogo variant="dark" size="md" />
        </div>
        <h1 className="text-2xl font-black text-[#0B1E38] mb-1">
          AIMST Examination Portal
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Please select your academic role to proceed:
        </p>

        <div className="space-y-3.5">
          <Link
            href="/student/login"
            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#1E5BF0] hover:bg-blue-50/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1E5BF0] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-[#1E5BF0]">
                  Student Candidate
                </p>
                <p className="text-[11px] text-slate-500">Divyasri Vijaya Kumaran & Students</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5BF0] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/examiner/login"
            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#1E5BF0] hover:bg-blue-50/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-[#1E5BF0]">
                  Examiner / Administrator
                </p>
                <p className="text-[11px] text-slate-500">Dr. Ahmad & Academic Staff</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5BF0] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center text-slate-500 font-semibold">Loading AIMST Portal...</div>}>
      <LoginRouterContent />
    </Suspense>
  );
}
