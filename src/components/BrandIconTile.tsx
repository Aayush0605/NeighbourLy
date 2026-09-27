import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  MessageCircle, 
  ShieldCheck, 
  MapPin, 
  BarChart3, 
  Heart 
} from 'lucide-react';

export type BrandElementType = 
  | 'education' 
  | 'work' 
  | 'community' 
  | 'chat' 
  | 'trusted' 
  | 'local' 
  | 'growth' 
  | 'support';

interface BrandIconTileProps {
  type: BrandElementType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

const BRAND_CONFIG: Record<BrandElementType, {
  label: string;
  bgGradient: string;
  iconColor: string;
  borderColor: string;
  shadowColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  education: {
    label: 'Education',
    bgGradient: 'from-blue-100 to-blue-200/90 text-blue-600',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200/80',
    shadowColor: 'shadow-blue-500/10',
    icon: GraduationCap,
  },
  work: {
    label: 'Work / Gigs',
    bgGradient: 'from-purple-100 to-purple-200/90 text-purple-600',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200/80',
    shadowColor: 'shadow-purple-500/10',
    icon: Briefcase,
  },
  community: {
    label: 'Community',
    bgGradient: 'from-emerald-100 to-emerald-200/90 text-emerald-600',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200/80',
    shadowColor: 'shadow-emerald-500/10',
    icon: Users,
  },
  chat: {
    label: 'Chat',
    bgGradient: 'from-pink-100 to-pink-200/90 text-pink-600',
    iconColor: 'text-pink-600',
    borderColor: 'border-pink-200/80',
    shadowColor: 'shadow-pink-500/10',
    icon: MessageCircle,
  },
  trusted: {
    label: 'Trusted',
    bgGradient: 'from-amber-100 to-amber-200/90 text-amber-600',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200/80',
    shadowColor: 'shadow-amber-500/10',
    icon: ShieldCheck,
  },
  local: {
    label: 'Local',
    bgGradient: 'from-rose-100 to-rose-200/90 text-rose-600',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-200/80',
    shadowColor: 'shadow-rose-500/10',
    icon: MapPin,
  },
  growth: {
    label: 'Growth',
    bgGradient: 'from-indigo-100 to-indigo-200/90 text-indigo-600',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-200/80',
    shadowColor: 'shadow-indigo-500/10',
    icon: BarChart3,
  },
  support: {
    label: 'Support',
    bgGradient: 'from-cyan-100 to-cyan-200/90 text-cyan-600',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-200/80',
    shadowColor: 'shadow-cyan-500/10',
    icon: Heart,
  },
};

const SIZES = {
  sm: { box: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4', text: 'text-[10px]' },
  md: { box: 'w-11 h-11 rounded-2xl', icon: 'w-5 h-5', text: 'text-xs' },
  lg: { box: 'w-14 h-14 rounded-2xl', icon: 'w-6 h-6', text: 'text-xs font-semibold' },
  xl: { box: 'w-16 h-16 rounded-3xl', icon: 'w-8 h-8', text: 'text-sm font-bold' },
};

export const BrandIconTile: React.FC<BrandIconTileProps> = ({
  type,
  size = 'md',
  showLabel = false,
  className = '',
  onClick,
}) => {
  const config = BRAND_CONFIG[type];
  const sizeConfig = SIZES[size];
  const IconComp = config.icon;

  return (
    <div 
      className={`inline-flex flex-col items-center gap-1.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
    >
      <div 
        className={`${sizeConfig.box} bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} shadow-soft-xs ${config.shadowColor} flex items-center justify-center transition-all duration-200 ${onClick ? 'group-hover:scale-105 group-hover:shadow-soft active:scale-95' : ''}`}
      >
        <IconComp className={`${sizeConfig.icon} ${config.iconColor}`} />
      </div>
      {showLabel && (
        <span className={`${sizeConfig.text} text-zinc-700 tracking-tight text-center leading-tight`}>
          {config.label}
        </span>
      )}
    </div>
  );
};
