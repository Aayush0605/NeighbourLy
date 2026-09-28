import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  MessageSquare, 
  User, 
  LogOut, 
  ChevronDown, 
  Target, 
  Briefcase,
  Sparkles,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { LocationPoint, UserProfile } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';
import { TrustBadge } from './TrustBadge';

export type NavViewType = 'home' | 'browse' | 'orders' | 'ai' | 'admin' | 'auth';

interface NavbarProps {
  currentLocation: LocationPoint;
  radiusKm: number;
  isWorkFromCurrentLocation: boolean;
  onOpenLocationPicker: () => void;
  activeView: NavViewType;
  onNavigate: (view: NavViewType) => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenPostRequest: () => void;
  onOpenPostService: () => void;
  onOpenAiAssistant: () => void;
  onOpenProfile?: () => void;
  activeOrdersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  radiusKm,
  isWorkFromCurrentLocation,
  onOpenLocationPicker,
  activeView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenPostRequest,
  onOpenPostService,
  onOpenAiAssistant,
  onOpenProfile,
  activeOrdersCount,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-soft-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-4">
        
        {/* Left Section: Brand Logo & Hyperlocal Chip */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0 min-w-0">
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center group text-left cursor-pointer focus-visible:outline-none shrink-0"
            aria-label="NeighborLy Home"
          >
            <div className="hidden sm:block">
              <NeighborLyLogo size="md" />
            </div>
            <div className="sm:hidden">
              <NeighborLyLogo size="sm" />
            </div>
          </button>

          {/* Hyperlocal Location Chip - Responsive and truncated */}
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-zinc-50 hover:bg-zinc-100 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-700 transition-all border border-zinc-200/90 shadow-2xs cursor-pointer shrink-0 whitespace-nowrap min-h-[32px] sm:min-h-[36px]"
            title="Change Location or Set Radius"
          >
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
            <span className="max-w-[55px] xs:max-w-[85px] sm:max-w-[140px] md:max-w-[170px] truncate">
              {currentLocation.neighborhood || currentLocation.city}
            </span>
            <span className="text-[9px] sm:text-[10px] text-zinc-600 font-bold bg-zinc-200/80 px-1 py-0.2 rounded-md hidden xs:inline shrink-0">
              {radiusKm}km
            </span>
            <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400 shrink-0" />
          </button>
        </div>

        {/* Center Section: Primary Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
          {/* Home */}
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeView === 'home'
                ? 'bg-zinc-100 text-zinc-950 font-bold'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
            }`}
          >
            Home
          </button>
          
          {/* Explore */}
          <button
            onClick={() => onNavigate('browse')}
            className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeView === 'browse'
                ? 'bg-zinc-100 text-zinc-950 font-bold'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
            }`}
          >
            <span>Explore</span>
            {isWorkFromCurrentLocation && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" title="Filtered to radius" />
            )}
          </button>

          {/* My Tasks */}
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth('login');
              else onNavigate('orders');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeView === 'orders'
                ? 'bg-zinc-100 text-zinc-950 font-bold'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
            }`}
          >
            <span>My Tasks</span>
            {activeOrdersCount > 0 && (
              <span className="bg-zinc-950 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* AI Assistant - Hyperlocal AI Chatbot */}
          <button
            onClick={() => onNavigate('ai')}
            className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'ai'
                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/70 shadow-2xs'
                : 'text-indigo-600 hover:bg-indigo-50/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>AI Assistant</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.2 rounded-md">
              AI
            </span>
          </button>
        </nav>

        {/* Right Section: Action Buttons & Authentication */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Offer a Skill (Compact, strictly single-line) */}
          <button
            onClick={onOpenPostService}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 rounded-xl transition-all border border-zinc-200/90 shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Briefcase className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>Offer Skill</span>
          </button>

          {/* Post a Task Button (High Contrast, single-line, fluid text on small screens) */}
          <button
            onClick={onOpenPostRequest}
            className="inline-flex items-center gap-1 px-2 xs:px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] xs:text-xs sm:text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg sm:rounded-xl transition-all shadow-soft hover:shadow-soft-md cursor-pointer whitespace-nowrap shrink-0 min-h-[32px] sm:min-h-[36px]"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden xs:inline">Post Task</span>
            <span className="xs:hidden">Post</span>
          </button>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 p-1 sm:p-1.5 sm:pl-1.5 sm:pr-2.5 rounded-full hover:bg-zinc-100/90 border border-zinc-200/90 transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-zinc-300 shrink-0"
                />
                <span className="text-xs font-semibold text-zinc-800 hidden md:inline max-w-[80px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <div className="hidden sm:block">
                  <TrustBadge user={currentUser} variant="compact" />
                </div>
                <div className="sm:hidden text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded-md border border-emerald-200/80">
                  {currentUser.trustScore || 70}
                </div>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400 shrink-0" />
              </button>

              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-soft-xl border border-zinc-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-950 truncate">{currentUser.name}</p>
                      <span className="text-[10px] text-zinc-500 bg-zinc-100 font-mono px-1.5 py-0.5 rounded-md">
                        @{currentUser.userId}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{currentUser.email}</p>
                    <div className="pt-2">
                      <TrustBadge user={currentUser} variant="badge-list" />
                    </div>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-2 pt-1.5 border-t border-zinc-100">
                      <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate">{currentUser.location?.neighborhood || 'Current Neighborhood'}</span>
                    </p>
                  </div>

                  <div className="py-1.5 text-xs text-zinc-700">
                    {onOpenProfile && (
                      <button
                        onClick={onOpenProfile}
                        className="w-full text-left px-4 py-2.5 hover:bg-purple-50/70 text-purple-700 flex items-center gap-2.5 cursor-pointer font-bold"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>My Trust Profile & Badges</span>
                      </button>
                    )}
                    <button
                      onClick={() => onNavigate('orders')}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center justify-between cursor-pointer font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-zinc-500" />
                        <span>My Tasks & Orders</span>
                      </div>
                      {activeOrdersCount > 0 && (
                        <span className="text-[10px] font-bold bg-zinc-950 text-white px-2 py-0.5 rounded-full">
                          {activeOrdersCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => onNavigate('ai')}
                      className="w-full text-left px-4 py-2.5 hover:bg-indigo-50/70 text-indigo-700 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>AI Assistant</span>
                    </button>
                    <button
                      onClick={() => onNavigate('admin')}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-zinc-600" />
                      <span>Admin Dashboard</span>
                    </button>
                    <button
                      onClick={onOpenPostService}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <Briefcase className="w-4 h-4 text-zinc-500" />
                      <span>Offer a Skill / Service</span>
                    </button>
                    <button
                      onClick={onOpenLocationPicker}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <Target className="w-4 h-4 text-zinc-500" />
                      <span>Change Radius & Location</span>
                    </button>
                    <div className="my-1 border-t border-zinc-100" />
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-all shadow-soft hover:shadow-soft-md cursor-pointer whitespace-nowrap shrink-0"
              >
                Sign Up
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
