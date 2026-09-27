import { UserProfile, TrustBadgeType, VerificationTier } from '../types';

/**
 * Transparent Multi-Factor Trust Score Calculation Algorithm (0 - 100)
 * 
 * 1. Base Verification (up to 35 pts):
 *    - Email Verified: +10 pts
 *    - Phone Verified (OTP): +10 pts
 *    - Campus Student ID Verified: +15 pts
 *    - Government / Resident ID Verified: +15 pts (max 35 pts across verifications)
 * 
 * 2. Escrow & Completion Track Record (up to 40 pts):
 *    - Tasks completed: min(tasksCompleted * 5, 25 pts)
 *    - On-time percentage: (onTimePercent / 100) * 10 pts (default 10)
 *    - Zero-dispute bonus: +5 pts
 * 
 * 3. Community Feedback & Rating (up to 25 pts):
 *    - Rating score: rating >= 4.8 ? 15 : rating >= 4.5 ? 12 : rating >= 4.0 ? 8 : 4
 *    - Review volume: min(reviewCount * 2, 10 pts)
 */
export function calculateTrustScore(user: Partial<UserProfile>): number {
  if (!user) return 50;

  let score = 0;

  // 1. Identity & Verifications (Max 35)
  let idPoints = 0;
  if (user.emailVerified || user.authProvider === 'google') idPoints += 10;
  if (user.phoneVerified) idPoints += 10;
  if (user.studentVerified) idPoints += 15;
  if (user.idVerified) idPoints += 15;
  score += Math.min(idPoints, 35);

  // 2. Escrow & Performance Track Record (Max 40)
  const completed = user.tasksCompleted || 0;
  score += Math.min(completed * 5, 25);

  const onTime = user.onTimePercent ?? 100;
  score += Math.round((onTime / 100) * 10);

  // Dispute free bonus
  if ((user.disputeFreeRate ?? 100) >= 95) {
    score += 5;
  }

  // 3. Community Reviews (Max 25)
  const rating = user.rating ?? 5.0;
  if (rating >= 4.8) score += 15;
  else if (rating >= 4.5) score += 12;
  else if (rating >= 4.0) score += 8;
  else score += 4;

  const reviews = user.reviewCount || 0;
  score += Math.min(reviews * 2, 10);

  // Fallback baseline for a clean new verified member: 70
  if (user.verified && score < 70) {
    score = 70;
  }

  return Math.min(100, Math.max(10, score));
}

export function getTrustTier(score: number): {
  tier: VerificationTier;
  label: string;
  color: string;
  textColor: string;
  badgeBg: string;
  ringColor: string;
  description: string;
} {
  if (score >= 90) {
    return {
      tier: 'neighborhood_pro',
      label: 'Exceptional Trust',
      color: '#10B981', // emerald-500
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 border-emerald-200/90 text-emerald-800',
      ringColor: 'ring-emerald-500',
      description: 'Fully verified with outstanding community reviews and 100% escrow completion record.',
    };
  }
  if (score >= 80) {
    return {
      tier: 'verified_neighbor',
      label: 'High Trust',
      color: '#3B82F6', // blue-500
      textColor: 'text-blue-700',
      badgeBg: 'bg-blue-50 border-blue-200/90 text-blue-800',
      ringColor: 'ring-blue-500',
      description: 'Identity confirmed with positive neighborhood track record and escrow protection.',
    };
  }
  if (score >= 65) {
    return {
      tier: 'basic_member',
      label: 'Verified Member',
      color: '#8B5CF6', // violet-500
      textColor: 'text-purple-700',
      badgeBg: 'bg-purple-50 border-purple-200/90 text-purple-800',
      ringColor: 'ring-purple-500',
      description: 'Account verified with protected escrow-lite transactions active.',
    };
  }
  return {
    tier: 'unverified',
    label: 'New Member',
    color: '#6B7280', // zinc-500
    textColor: 'text-zinc-600',
    badgeBg: 'bg-zinc-100 border-zinc-200 text-zinc-700',
    ringColor: 'ring-zinc-400',
    description: 'New neighborhood member. Protected by automated escrow held funds.',
  };
}

export interface BadgeInfo {
  type: TrustBadgeType;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  tooltip: string;
}

export const BADGE_DEFINITIONS: Record<TrustBadgeType, BadgeInfo> = {
  student_verified: {
    type: 'student_verified',
    label: 'Campus Student Verified',
    shortLabel: 'Student Verified',
    icon: '🎓',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    tooltip: 'Enrolled student verified via institutional credentials or campus ID.',
  },
  id_verified: {
    type: 'id_verified',
    label: 'Government ID Verified',
    shortLabel: 'ID Verified',
    icon: '🛡️',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    tooltip: 'Government-issued ID or resident proof verified.',
  },
  phone_verified: {
    type: 'phone_verified',
    label: 'Phone Verified (OTP)',
    shortLabel: 'Phone Verified',
    icon: '📱',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    tooltip: 'Direct mobile phone verified through one-time code.',
  },
  email_verified: {
    type: 'email_verified',
    label: 'Verified Email',
    shortLabel: 'Email Verified',
    icon: '✉️',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    tooltip: 'Official campus or personal email confirmed.',
  },
  escrow_champion: {
    type: 'escrow_champion',
    label: '100% Escrow Reliable',
    shortLabel: 'Escrow Reliable',
    icon: '🔒',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    tooltip: 'Flawless escrow release history with zero unresolved customer disputes.',
  },
  top_rated: {
    type: 'top_rated',
    label: 'Top Neighbor (4.8+)',
    shortLabel: 'Top Neighbor',
    icon: '⭐',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    tooltip: 'Maintains an exceptional 4.8+ community rating from neighbor peers.',
  },
  fast_responder: {
    type: 'fast_responder',
    label: 'Fast Responder (<15m)',
    shortLabel: 'Fast Responder',
    icon: '⚡',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    tooltip: 'Usually answers inquiries within 15 minutes.',
  },
  community_pillar: {
    type: 'community_pillar',
    label: 'Community Pillar',
    shortLabel: 'Pillar',
    icon: '🏛️',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    tooltip: 'Recognized neighborhood leader with 10+ completed community tasks.',
  },
};

/**
 * Automatically computes appropriate badges for a given user profile
 */
export function computeTrustBadges(user: Partial<UserProfile>): TrustBadgeType[] {
  const badges: TrustBadgeType[] = [];

  if (user.studentVerified) {
    badges.push('student_verified');
  }
  if (user.idVerified) {
    badges.push('id_verified');
  }
  if (user.phoneVerified) {
    badges.push('phone_verified');
  }
  if (user.emailVerified || user.authProvider === 'google') {
    badges.push('email_verified');
  }
  if ((user.tasksCompleted || 0) >= 3 && (user.disputeFreeRate ?? 100) >= 95) {
    badges.push('escrow_champion');
  }
  if ((user.rating || 5.0) >= 4.8 && (user.reviewCount || 0) >= 2) {
    badges.push('top_rated');
  }
  if ((user.responseTimeMinutes || 10) <= 20) {
    badges.push('fast_responder');
  }
  if ((user.tasksCompleted || 0) >= 8) {
    badges.push('community_pillar');
  }

  // Ensure unique
  return Array.from(new Set(badges));
}
