'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import StudentSidebar from '@/components/StudentSidebar';
import TopNavbar from '@/components/TopNavbar';
import { User, Mail, Shield, KeyRound, CheckCircle2, Loader2, LogOut } from 'lucide-react';

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({
    full_name: 'Divyasri Vijaya Kumaran',
    id_number: 'B21010123',
    email: 'divyasri@aimst.edu.my',
    role: 'student',
    avatar_url: '/student_divyasri.jpg',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated && uData.user) setUser(uData.user);
      } catch {}
    }
    loadUser();
  }, []);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setStatusMsg('Passwords do not match or field is empty.');
      return;
    }
    setStatusMsg('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/student/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Student Profile Settings" />

        <main className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0">
              <Image
                src={user?.avatar_url || '/student_divyasri.jpg'}
                alt="Student Profile"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-black text-[#0B1E38]">{user.full_name}</h1>
              <p className="text-sm font-mono text-slate-500 mt-1">Student ID: {user.id_number}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1E5BF0] border border-blue-200">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Candidate Account</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#1E5BF0]" />
              Change Password
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Update your account credentials for AIMST portal access.
            </p>

            {statusMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{statusMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                  required
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Update Password
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
