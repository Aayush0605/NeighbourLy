import React from 'react';

export interface NeighborLyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'horizontal' | 'icon' | 'badge' | 'admin' | 'watermark' | 'app-icon' | 'monogram';
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
  tagline = 'Students Helping Students',
  className = '',
}) => {
  const iconSizes = {
    xs: 22,
    sm: 28,
    md: 36,
    lg: 46,
    xl: 60,
    '2xl': 78,
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
    '2xl': 'text-4xl sm:text-5xl',
  };

  const s = iconSizes[size];
  const isDark = theme === 'dark';

  // ID generator for unique gradient IDs when multiple logos appear
  const idPrefix = React.useId().replace(/:/g, '');
  const gradN = `grad_n_${idPrefix}`;
  const gradHeadL = `grad_head_l_${idPrefix}`;
  const gradHeadR = `grad_head_r_${idPrefix}`;
  const glowFilter = `glow_${idPrefix}`;

  /**
   * The Signature NeighborLy "Connecting Two-People N" Mark
   * Directly reconstructed from the official brand identity sheet:
   * - Left student/neighbor: Cyan (#06B6D4) to Electric Royal Blue (#3B82F6)
   * - Diagonal connection: Blue to Indigo (#6366F1)
   * - Right student/neighbor: Vibrant Magenta/Purple (#A855F7 to #C084FC)
   * - Two community heads/dots above each peak
   */
  const NMarkSvg = ({ width = s, height = s }: { width?: number; height?: number }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform group-hover:scale-105 duration-200"
      aria-hidden="true"
    >
      <defs>
        {/* Continuous Fluid Gradient across the 'N' ribbon */}
        <linearGradient id={gradN} x1="15%" y1="85%" x2="85%" y2="15%">
          <stop offset="0%" stopColor="#06B6D4" />    {/* Bright Cyan */}
          <stop offset="32%" stopColor="#3B82F6" />   {/* Royal Blue */}
          <stop offset="68%" stopColor="#8B5CF6" />   {/* Violet */}
          <stop offset="100%" stopColor="#D946EF" />  {/* Radiant Magenta */}
        </linearGradient>

        {/* Left Person Head Gradient (Cyan to Blue) */}
        <linearGradient id={gradHeadL} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Right Person Head Gradient (Purple to Magenta) */}
        <linearGradient id={gradHeadR} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* Subtle Ambient Drop Shadow */}
        <filter id={glowFilter} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#8B5CF6" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Two Heads / Community Beacon Dots */}
      <circle
        cx="31"
        cy="22"
        r="8.5"
        fill={`url(#${gradHeadL})`}
      />
      <circle
        cx="69"
        cy="19"
        r="9"
        fill={`url(#${gradHeadR})`}
      />

      {/* Main Connecting 'N' Ribbon Body */}
      {/* Left upward curve -> Arch -> Diagonal sweep -> Right upright curve */}
      <path
        d="M 21 76 C 21 54, 23 43, 31 41 C 41 39, 51 55, 60 75 C 64 63, 68 49, 72 37"
        stroke={`url(#${gradN})`}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // App Icon Squircle Variant (Image 1, Item 4)
  if (variant === 'app-icon') {
    return (
      <div className={`relative inline-flex items-center justify-center rounded-[24%] bg-gradient-to-b from-zinc-900 to-zinc-950 p-2 shadow-2xl border border-white/10 ${className}`}>
        <NMarkSvg width={s} height={s} />
      </div>
    );
  }

  // Watermark for background cards and hero atmosphere
  if (variant === 'watermark') {
    return (
      <div className={`pointer-events-none select-none opacity-[0.08] ${className}`}>
        <svg
          width={s}
          height={s}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="31" cy="22" r="8.5" fill="currentColor" />
          <circle cx="69" cy="19" r="9" fill="currentColor" />
          <path
            d="M 21 76 C 21 54, 23 43, 31 41 C 41 39, 51 55, 60 75 C 64 63, 68 49, 72 37"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // Academic / Verified Badge Style (Image 1, Item 8)
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200/90 shadow-soft-xs text-xs font-semibold text-zinc-800 ${className}`}>
        <div className="w-5 h-5 flex items-center justify-center">
          <NMarkSvg width={20} height={20} />
        </div>
        <span>
          Neighbor<span className="text-purple-600 font-bold">Ly</span> Verified
        </span>
      </div>
    );
  }

  // Admin Security Shield Variant
  if (variant === 'admin') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-700/80 flex items-center justify-center shadow-soft">
            <NMarkSvg width={24} height={24} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-heading font-extrabold tracking-tight text-base sm:text-lg text-zinc-950">
            Neighbor<span className="text-purple-600">Ly</span> <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-md ml-1 font-mono uppercase tracking-wider">Admin</span>
          </span>
          <span className="text-[10px] text-zinc-500 tracking-wide mt-1">
            Restricted Command Center
          </span>
        </div>
      </div>
    );
  }

  // Icon Only (App Icon / Compact Mark)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <NMarkSvg width={s} height={s} />
      </div>
    );
  }

  // Full Horizontal or Vertical Logo with Official Typography & Purple "Ly"
  return (
    <div className={`inline-flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      <NMarkSvg width={s} height={s} />
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-heading font-extrabold tracking-tight ${textSizes[size]} ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}
        >
          Neighbor<span className="text-purple-600">Ly</span>
        </span>
        {showTagline && (
          <span
            className={`text-[9px] tracking-wider font-bold mt-1 uppercase ${
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
