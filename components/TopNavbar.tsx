'use client';

import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface TopNavbarProps {
  user?: {
    full_name: string;
    id_number?: string;
    role: string;
    avatar_url?: string | null;
  } | null;
  title?: string;
}

export default function TopNavbar({ user, title }: TopNavbarProps) {
  const isExaminer = user?.role === 'examiner' || user?.role === 'admin';
  const displayName = user?.full_name || (isExaminer ? 'Dr. Ahmad' : 'Divyasri Vijaya Kumaran');
  const displayId = user?.id_number || (isExaminer ? '88012' : 'B21010123');
  const avatarSrc = user?.avatar_url || (isExaminer ? '/examiner_ahmad.jpg' : '/student_divyasri.jpg');

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Pill */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={displayName}
                fill
                sizes="36px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {displayName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-slate-500 font-mono">
                {isExaminer ? `Staff ID: ${displayId}` : `Student ID: ${displayId}`}
              </span>
              {isExaminer && (
                <span className="inline-block px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 uppercase">
                  {user?.role || 'Examiner'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
