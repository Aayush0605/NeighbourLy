import React from 'react';

interface NeighborLyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'horizontal' | 'icon' | 'badge' | 'admin' | 'watermark';
  theme?: 'dark' | 'light' | 'auto';
  showTagline?: boolean;
  tagline?: string;
  className?: string;
}

export const NeighborLyLogo: React.FC<NeighborLyLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'auto',
  showTagline = false,
  tagline = 'Local Skills · Real Opportunities',
  className = '',
}) => {
  const iconSizes = {
    xs: 20,
    sm: 24,
    md: 32,
    lg: 42,
    xl: 56,
    '2xl': 72,
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  };

  const s = iconSizes[size];
  const isDark = theme === 'dark';

  // Crisp, architectural geometric logo mark with subtle gradient and community dot
  const IconMark = () => (
    <div className="relative inline-flex items-center justify-center shrink-0 group">
      <svg
        width={s}
        height={s}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform group-hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="nMarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>
          <linearGradient id="nAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id="nMarkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Clean geometric frame */}
        <rect
          width="40"
          height="40"
          rx="11"
          fill={isDark ? '#27272A' : 'url(#nMarkGrad)'}
          stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'}
          strokeWidth="1"
        />

        {/* Diagonal accent ray */}
        <path
          d="M6 34L34 6"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />

        {/* Stylized Architectural Community "N" Mark */}
        <path
          d="M12 28V12L23 25V12"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hyperlocal Community Connection Beacon */}
        <circle cx="28" cy="14" r="3" fill="url(#nAccentGrad)" filter="url(#nMarkGlow)" />
        <circle cx="28" cy="14" r="1.2" fill="#FFFFFF" />
      </svg>
    </div>
  );

  // Admin Security Shield Variant
  if (variant === 'admin') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-700/80 flex items-center justify-center text-white shadow-soft">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-heading font-extrabold tracking-tight text-base sm:text-lg text-zinc-950">
            Neighbor<span className="text-blue-600">ly</span> <span className="text-xs bg-zinc-900 text-white px-2 py-0.5 rounded-md ml-1 font-mono uppercase tracking-wider">Admin</span>
          </span>
          <span className="text-[10px] text-zinc-500 tracking-wide mt-1">
            Restricted Command Center
          </span>
        </div>
      </div>
    );
  }

  // Watermark or Minimal Badge
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200 shadow-soft-xs text-xs font-semibold text-zinc-800 ${className}`}>
        <IconMark />
        <span>Neighbor<span className="text-blue-600">ly</span> Verified</span>
      </div>
    );
  }

  if (variant === 'icon') {
    return <IconMark />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <IconMark />
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-heading font-extrabold tracking-tight ${textSizes[size]} ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}
        >
          Neighbor<span className="text-blue-600">ly</span>
        </span>
        {showTagline && (
          <span
            className={`text-[9.5px] tracking-wide font-medium mt-1 ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};
