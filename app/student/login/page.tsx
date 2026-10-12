'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AimstLogo from '@/components/AimstLogo';
import { User, Lock, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function StudentLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('B21010123'); // Default demo: Divyasri
  const [password, setPassword] = useState('AimstStudent2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your Student ID number and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          role: 'student',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid Student ID or password.');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (id: string) => {
    setIdentifier(id);
    setPassword('AimstStudent2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[580px]">
        {/* Left Side: AIMST University Campus Photo matching Reference Image 1 */}
        <div className="relative hidden md:block bg-slate-900 overflow-hidden">
          <Image
            src="/aimst_campus.jpg"
            alt="AIMST University Campus"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E38]/90 via-[#0B1E38]/30 to-transparent flex flex-col justify-end p-8 text-white">
            <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400 mb-1">
              AIMST University
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Academic Excellence & Innovation
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Secure online examination proctoring portal for undergraduate and postgraduate students.
            </p>
          </div>
        </div>

        {/* Right Side: Student Login Card */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* AIMST University Logo */}
            <div className="mb-6">
              <AimstLogo variant="dark" size="md" />
              <p className="text-xs font-semibold text-teal-700 mt-1 uppercase tracking-wider">
                Online Exam Proctoring System
              </p>
              <h1 className="text-2xl font-black text-[#0B1E38] mt-2">
                Student Login
              </h1>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Student ID Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your ID number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E5BF0] focus:border-transparent text-slate-900 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E5BF0] focus:border-transparent text-slate-900 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-[#1E5BF0] focus:ring-[#1E5BF0]" defaultChecked />
                  <span>Remember me</span>
                </label>
                <a href="#" className="font-semibold text-[#1E5BF0] hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Login</span>}
              </button>
            </form>

            {/* Quick Demo Credentials for Viva */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Quick 1-Click Demo Login:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('B21010123')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-mono font-medium transition-colors"
                >
                  Divyasri (B21010123)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('B21010124')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-medium transition-colors"
                >
                  Tan Wei Leng (B21010124)
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center border-t border-slate-100 mt-4">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link href="/student/register" className="font-bold text-[#1E5BF0] hover:underline">
                Create Account
              </Link>
            </p>
            <div className="mt-2">
              <Link href="/examiner/login" className="text-[11px] text-slate-400 hover:text-slate-600">
                Are you an Examiner / Administrator? Click here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
