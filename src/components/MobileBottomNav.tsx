import React, { useState } from 'react';
import { 
  Home, 
  Compass, 
  Plus, 
  MessageSquare, 
  Sparkles,
  Briefcase,
  X,
  Wallet
} from 'lucide-react';
import { UserProfile } from '../types';
import { NavViewType } from './Navbar';
import { NeighborLyLogo } from './NeighborLyLogo';

interface MobileBottomNavProps {
  activeView: NavViewType;
  onNavigate: (view: NavViewType) => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenPostTask: () => void;
  onOpenPostSkill: () => void;
  activeOrdersCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onOpenPostTask,
  onOpenPostSkill,
  activeOrdersCount,
}) => {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  return (
    <>
      {/* Create Action Modal / Bottom Sheet for Mobile */}
      {isCreateMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-150"
          onClick={() => setIsCreateMenuOpen(false)}
        >
          <div 
            className="clay-card rounded-b-none p-6 space-y-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <NeighborLyLogo size="xs" />
                  <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Quick Post</span>
                </div>
                <p className="text-xs text-zinc-500">Need help or want to offer a skill in your neighborhood?</p>
              </div>
              <button
                onClick={() => setIsCreateMenuOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
                aria-label="Close action sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  onOpenPostTask();
                }}
                className="p-4 bg-zinc-950 text-white rounded-2xl flex flex-col items-center justify-center gap-2 shadow-soft hover:bg-zinc-800 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Post a Task</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Find nearby helpers</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  onOpenPostSkill();
                }}
                className="p-4 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-2xs hover:bg-zinc-100 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Offer a Skill</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Earn from your street</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar on Small Screens (Claymorphic) */}
      <nav 
        className="fixed bottom-0 inset-x-0 z-40 clay-nav px-2 py-1 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] md:hidden"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 items-center justify-items-center h-14">
          
          {/* 1. Home */}
          <button
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${
              activeView === 'home' ? 'text-indigo-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[10px] mt-1 tracking-tight">Home</span>
          </button>

          {/* 2. Explore */}
          <button
            onClick={() => onNavigate('browse')}
            className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors relative ${
              activeView === 'browse' ? 'text-indigo-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Compass className="w-5 h-5 shrink-0" />
            <span className="text-[10px] mt-1 tracking-tight">Explore</span>
          </button>

          {/* 3. Center Create Action (+) */}
          <div className="flex items-center justify-center -mt-5">
            <button
              onClick={() => setIsCreateMenuOpen(true)}
              className="w-13 h-13 rounded-full clay-button-primary text-white flex items-center justify-center ring-4 ring-white active:scale-95 transition-all cursor-pointer shadow-lg"
              aria-label="Create task or skill"
            >
              <Plus className="w-6 h-6 stroke-[3] shrink-0" />
            </button>
          </div>

          {/* 4. My Tasks */}
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth('login');
              else onNavigate('orders');
            }}
            className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors relative ${
              activeView === 'orders' ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 shrink-0" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-zinc-950 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full tabular-nums border border-white">
                  {activeOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Tasks</span>
          </button>

          {/* 5. Escrow Funds */}
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth('login');
              else onNavigate('wallet');
            }}
            className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${
              activeView === 'wallet' ? 'text-indigo-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Wallet className="w-5 h-5 shrink-0" />
            <span className="text-[10px] mt-1 tracking-tight">Funds</span>
          </button>

        </div>
      </nav>
    </>
  );
};
