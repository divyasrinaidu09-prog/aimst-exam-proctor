'use client';

import React from 'react';
import Link from 'next/link';
import AimstLogo from '@/components/AimstLogo';
import { GraduationCap, UserCheck, ArrowRight } from 'lucide-react';

export default function RegisterRouterPage() {
  return (
    <div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <AimstLogo variant="dark" size="md" />
        </div>
        <h1 className="text-2xl font-black text-[#0B1E38] mb-1">
          Create Account
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Choose your account type to register:
        </p>

        <div className="space-y-3.5">
          <Link
            href="/student/register"
            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#1E5BF0] hover:bg-blue-50/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1E5BF0] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-[#1E5BF0]">
                  Register as Student
                </p>
                <p className="text-[11px] text-slate-500">Access exams and view results</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5BF0] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/examiner/register"
            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#1E5BF0] hover:bg-blue-50/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-[#1E5BF0]">
                  Register as Examiner
                </p>
                <p className="text-[11px] text-slate-500">Manage courses and proctor sessions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5BF0] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#1E5BF0] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
