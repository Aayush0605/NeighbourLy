import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  User, 
  LogOut, 
  ChevronDown, 
  Target, 
  Sparkles,
  Sliders,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { LocationPoint, UserProfile } from '../types';

interface NavbarProps {
  currentLocation: LocationPoint;
  radiusKm: number;
  isWorkFromCurrentLocation: boolean;
  onOpenLocationPicker: () => void;
  activeView: 'home' | 'browse' | 'orders';
  onNavigate: (view: 'home' | 'browse' | 'orders') => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenPostRequest: () => void;
  onOpenPostService: () => void;
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
  activeOrdersCount,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand & Location Trigger */}
        <div className="flex items-center gap-3 md:gap-5">
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 group text-left cursor-pointer focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:bg-emerald-700 transition-colors">
              <span className="font-heading font-black text-lg">N</span>
            </div>
            <span className="text-xl font-heading font-black tracking-tight text-slate-900">
              Neighbor<span className="text-emerald-600">Ly</span>
            </span>
          </button>

          {/* Location Button ("Select work from current location") */}
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/90 rounded-full text-xs font-semibold text-slate-700 transition-all border border-slate-200/80 cursor-pointer shadow-2xs"
            title="Change Location or Set Radius"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="max-w-[130px] sm:max-w-[180px] truncate">
              {currentLocation.neighborhood || currentLocation.city}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.2 rounded-full hidden sm:inline">
              {radiusKm}km
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors hover:text-emerald-600 cursor-pointer ${
              activeView === 'home' ? 'text-emerald-600 font-bold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('browse')}
            className={`transition-colors hover:text-emerald-600 cursor-pointer flex items-center gap-1.5 ${
              activeView === 'browse' ? 'text-emerald-600 font-bold' : ''
            }`}
          >
            <span>Browse Nearby</span>
            {isWorkFromCurrentLocation && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Work from current location enabled"></span>
            )}
          </button>
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth('login');
              else onNavigate('orders');
            }}
            className={`transition-colors hover:text-emerald-600 cursor-pointer flex items-center gap-1.5 ${
              activeView === 'orders' ? 'text-emerald-600 font-bold' : ''
            }`}
          >
            <span>My Tasks & Orders</span>
            {activeOrdersCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {activeOrdersCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Post Service / Offer a skill */}
          <button
            onClick={onOpenPostService}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Offer a Skill</span>
          </button>

          {/* Post a Task */}
          <button
            onClick={onOpenPostRequest}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post a Task</span>
          </button>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/40"
                />
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">{currentUser.name}</p>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">
                        @{currentUser.userId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{currentUser.location?.neighborhood || 'Current Neighborhood'}</span>
                    </p>
                  </div>

                  <div className="py-1 text-xs font-medium text-slate-700">
                    <button
                      onClick={() => onNavigate('orders')}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>My Active Tasks & Orders</span>
                    </button>
                    <button
                      onClick={onOpenPostService}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer sm:hidden"
                    >
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>Offer a Skill / Service</span>
                    </button>
                    <button
                      onClick={onOpenLocationPicker}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span>Work from Current Location</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 cursor-pointer"
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
