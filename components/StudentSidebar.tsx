'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AimstLogo from './AimstLogo';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Award,
  User,
  LogOut,
} from 'lucide-react';

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Examinations', href: '/student/exams', icon: FileText },
    { label: 'My Subjects', href: '/student/subjects', icon: BookOpen },
    { label: 'Results', href: '/student/results', icon: Award },
    { label: 'Profile', href: '/student/profile', icon: User },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/student/login');
    }
  };

  return (
    <aside className="w-64 bg-[#0B1E38] text-white flex flex-col shrink-0 min-h-screen border-r border-[#162D4D]">
      {/* University Brand Header */}
      <div className="p-6 border-b border-[#162D4D]/70">
        <AimstLogo variant="light" size="md" href="/student/dashboard" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/student/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1E5BF0] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#162D4D]/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Link at Bottom */}
      <div className="p-4 border-t border-[#162D4D]/70">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
