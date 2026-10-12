'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, User, BookOpen, BarChart3, GraduationCap } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: 'student' | 'examiner';
    userID?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* University Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#516135] to-[#839958] flex items-center justify-center text-white shadow-md shadow-[#839958]/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">
                AIMST <span className="text-[#839958]">PROCTOR</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#f6f8f2] text-[#516135] border border-[#c2d1a7]">
                MIS FYP
              </span>
            </div>
            <p className="text-[11px] text-slate-700 hidden sm:block">
              Intelligent Online Exam Proctoring & Anti-Cheating
            </p>
          </div>
        </Link>

        {/* User Navigation Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Navigation links based on role */}
              {user.role === 'examiner' ? (
                <div className="hidden md:flex items-center gap-2 mr-2">
                  <Link
                    href="/dashboard/examiner"
                    className="text-xs font-semibold text-slate-800 hover:text-aimst-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Exams Manager
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 mr-2">
                  <Link
                    href="/dashboard/student"
                    className="text-xs font-semibold text-slate-800 hover:text-aimst-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    My Exams
                  </Link>
                </div>
              )}

              {/* User badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-aimst-100 text-aimst-800 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {user.userID || user.role.toUpperCase()}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                  user.role === 'examiner'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {user.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-aimst-700 hover:bg-aimst-800 shadow-sm shadow-aimst-700/20 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
