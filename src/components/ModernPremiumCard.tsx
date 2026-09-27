import React from 'react';
import { NeighborLyLogo } from './NeighborLyLogo';

interface ModernPremiumCardProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTags?: boolean;
  interactive?: boolean;
}

export const ModernPremiumCard: React.FC<ModernPremiumCardProps> = ({
  className = '',
  size = 'md',
  showTags = true,
  interactive = true,
}) => {
  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#131127] via-[#0C0A17] to-[#07060E] border border-white/15 p-6 sm:p-8 shadow-2xl text-center select-none ${
        interactive ? 'group hover:border-purple-500/40 transition-all duration-300' : ''
      } ${className}`}
    >
      {/* Ambient Aurora Glow in the Background (Reconstructed from Image 1 Item 1) */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-14 inset-x-8 h-36 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Label */}
      <div className="relative z-10 flex items-center justify-between text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-400 mb-6">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Modern Premium
        </span>
        <span className="text-purple-400/90 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/40">
          Primary
        </span>
      </div>

      {/* Center Luminous Connecting 'N' Mark with Radial Light */}
      <div className="relative z-10 py-4 flex flex-col items-center justify-center">
        <div className="relative">
          {/* Subtle Backlight Glow disc */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-full blur-2xl transform scale-125 pointer-events-none" />
          <NeighborLyLogo size={size === 'lg' ? '2xl' : size === 'sm' ? 'lg' : 'xl'} variant="icon" />
        </div>

        {/* Wordmark */}
        <div className="mt-5 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Neighbor<span className="text-purple-400">Ly</span>
          </h2>
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
            Students Helping Students
          </p>
        </div>
      </div>

      {/* Bottom Tag Badges (Modern · Premium · Tech-Forward · Scalable) */}
      {showTags && (
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-center gap-2">
          {['Modern', 'Premium', 'Tech-Forward', 'Scalable'].map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
