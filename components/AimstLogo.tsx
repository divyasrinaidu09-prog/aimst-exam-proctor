'use strict';
import React from 'react';
import Link from 'next/link';

interface AimstLogoProps {
  variant?: 'dark' | 'light' | 'crest-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
}

export default function AimstLogo({
  variant = 'dark',
  size = 'md',
  className = '',
  href,
}: AimstLogoProps) {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px] tracking-widest',
    md: 'text-[10px] tracking-widest',
    lg: 'text-xs tracking-widest',
  };

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* University Crest */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-sm">
          <circle cx="32" cy="32" r="30" fill={isLight ? 'rgba(255,255,255,0.1)' : '#E6F4EA'} />

          {/* Overlapping atomic/petal geometry */}
          <path d="M32 6 C38 18 48 26 58 32 C48 38 38 46 32 58 C26 46 16 38 6 32 C16 26 26 18 32 6Z" fill="#0D9488" opacity="0.85" />
          <path d="M14 14 C26 20 32 30 38 40 C32 50 22 56 10 50 C16 38 12 26 14 14Z" fill="#10B981" opacity="0.9" />
          <path d="M50 14 C48 26 44 38 54 50 C42 56 32 50 26 40 C32 30 38 20 50 14Z" fill="#059669" opacity="0.9" />

          {/* Center core */}
          <circle cx="32" cy="32" r="10" fill="#0F766E" />
          <circle cx="32" cy="32" r="6" fill="#F59E0B" />
          <circle cx="32" cy="32" r="3" fill="#FFFFFF" />
        </svg>
      </div>

      {variant !== 'crest-only' && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-wider uppercase ${isLight ? 'text-white' : 'text-[#0B1E38]'} ${titleSizes[size]}`}>
            AIMST
          </span>
          <span className={`font-bold uppercase mt-0.5 ${isLight ? 'text-emerald-400' : 'text-teal-700'} ${subtitleSizes[size]}`}>
            UNIVERSITY
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
