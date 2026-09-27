import React from 'react';
import { ShieldCheck, CheckCircle2, Award, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile, TrustBadgeType } from '../types';
import { 
  calculateTrustScore, 
  getTrustTier, 
  BADGE_DEFINITIONS, 
  computeTrustBadges 
} from '../utils/trustScore';

interface TrustBadgeProps {
  user?: Partial<UserProfile>;
  trustScore?: number;
  badges?: TrustBadgeType[];
  variant?: 'pill' | 'badge-list' | 'meter' | 'compact' | 'card';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDetailsOnClick?: boolean;
  onOpenDetails?: () => void;
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  user,
  trustScore,
  badges,
  variant = 'pill',
  size = 'sm',
  showDetailsOnClick = false,
  onOpenDetails,
  className = '',
}) => {
  const score = trustScore ?? (user ? calculateTrustScore(user) : 85);
  const tier = getTrustTier(score);
  const activeBadges = badges ?? (user ? computeTrustBadges(user) : ['student_verified', 'phone_verified']);

  // Compact Pill (Used inside Service Cards, User headers, and chat headers)
  if (variant === 'compact') {
    return (
      <span
        onClick={onOpenDetails}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${tier.badgeBg} border shadow-2xs ${
          onOpenDetails ? 'cursor-pointer hover:scale-105 transition-transform' : ''
        } ${className}`}
        title={`Trust Score: ${score}/100 · ${tier.label}`}
      >
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        <span>{score} Trust</span>
      </span>
    );
  }

  // Badge List (Shows official badges: Student, ID, Escrow)
  if (variant === 'badge-list') {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {/* Trust Score Pill */}
        <span
          onClick={onOpenDetails}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${tier.badgeBg} border shadow-2xs ${
            onOpenDetails ? 'cursor-pointer hover:scale-105 transition-transform' : ''
          }`}
          title={`${score}/100 Trust Score`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{score} Trust</span>
        </span>

        {/* Badges */}
        {activeBadges.slice(0, 3).map((badgeKey) => {
          const b = BADGE_DEFINITIONS[badgeKey];
          if (!b) return null;
          return (
            <span
              key={badgeKey}
              onClick={onOpenDetails}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${b.bg} ${b.color} border ${b.border} shadow-2xs ${
                onOpenDetails ? 'cursor-pointer hover:scale-105 transition-transform' : ''
              }`}
              title={b.tooltip}
            >
              <span>{b.icon}</span>
              <span>{b.shortLabel}</span>
            </span>
          );
        })}
      </div>
    );
  }

  // Visual Score Meter (Radial or Pill with Bar)
  if (variant === 'meter') {
    return (
      <div 
        onClick={onOpenDetails}
        className={`p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 shadow-2xs space-y-2 ${
          onOpenDetails ? 'cursor-pointer hover:border-zinc-300 transition-colors' : ''
        } ${className}`}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Neighborhood Trust Score</span>
          </div>
          <span className={`font-mono font-extrabold text-sm ${tier.textColor}`}>
            {score}<span className="text-zinc-400 text-xs">/100</span>
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              backgroundColor: tier.color,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span className="font-semibold text-zinc-700">{tier.label}</span>
          <span>Escrow Protected</span>
        </div>
      </div>
    );
  }

  // Default Standard Pill Variant
  return (
    <div
      onClick={onOpenDetails}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tier.badgeBg} border shadow-soft-xs ${
        onOpenDetails ? 'cursor-pointer hover:shadow-soft active:scale-98 transition-all' : ''
      } ${className}`}
      title={`${tier.label} (${score}/100)`}
    >
      <div className="relative flex items-center justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      </div>
      <span className="font-bold text-zinc-900">{score}</span>
      <span className="text-zinc-400">·</span>
      <span className={tier.textColor}>{tier.label}</span>
    </div>
  );
};
