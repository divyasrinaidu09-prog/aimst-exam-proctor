'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AimstLogo from './AimstLogo';
import {
  LayoutDashboard,
  FileSpreadsheet,
  BookOpen,
  Users,
  Activity,
  AlertTriangle,
  BarChart3,
  UserCheck,
  LogOut,
} from 'lucide-react';

export default function ExaminerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/examiner/dashboard', icon: LayoutDashboard },
    { label: 'Exams', href: '/examiner/exams', icon: FileSpreadsheet },
    { label: 'Subjects', href: '/examiner/subjects', icon: BookOpen },
    { label: 'Students', href: '/examiner/students', icon: Users },
    { label: 'Monitoring', href: '/examiner/monitoring', icon: Activity },
    { label: 'Incidents', href: '/examiner/incidents', icon: AlertTriangle },
    { label: 'Reports', href: '/examiner/reports', icon: BarChart3 },
    { label: 'Profile', href: '/examiner/profile', icon: UserCheck },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/examiner/login');
    }
  };

  return (
    <aside className="w-64 bg-[#0B1E38] text-white flex flex-col shrink-0 min-h-screen border-r border-[#162D4D]">
      {/* University Brand Header */}
      <div className="p-6 border-b border-[#162D4D]/70">
        <AimstLogo variant="light" size="md" href="/examiner/dashboard" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/examiner/dashboard' && pathname.startsWith(item.href));
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
