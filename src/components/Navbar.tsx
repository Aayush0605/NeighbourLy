import React, { useState } from 'react';
import { 
  Search,
  Bell,
  MapPin, 
  Plus, 
  MessageSquare, 
  User, 
  LogOut, 
  ChevronDown, 
  Briefcase,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { LocationPoint, UserProfile, AppNotification } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';

export type NavViewType = 'home' | 'browse' | 'seller' | 'messages' | 'orders' | 'profile' | 'ai' | 'admin' | 'auth';

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
  onOpenAiAssistant: () => void;
  onOpenPostTask?: () => void;
  activeOrdersCount: number;
  unreadMessagesCount?: number;
  notifications?: AppNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onSelectNotification?: (notification: AppNotification) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  radiusKm,
  onOpenLocationPicker,
  activeView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAiAssistant,
  onOpenPostTask,
  activeOrdersCount,
  unreadMessagesCount = 0,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectNotification,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'browse', label: 'Browse' },
    { id: 'seller', label: 'Become a Seller' },
    { id: 'messages', label: 'Messages', badge: unreadMessagesCount },
    { id: 'orders', label: 'Orders', badge: activeOrdersCount },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/80 shadow-2xs w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center group text-left cursor-pointer focus-visible:outline-none shrink-0"
            aria-label="NeighborLy Home"
          >
            <div className="flex items-center gap-2">
              <NeighborLyLogo size="md" variant="full" />
            </div>
          </button>
        </div>

        {/* Center Section: Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 shrink-0">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id as NavViewType)}
                className={`relative py-5 text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-indigo-900 font-bold' 
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <span>{link.label}</span>
                {Boolean(link.badge && link.badge > 0) && (
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Action Buttons, Search Icon, Notification Bell, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Post a Task Button on Desktop */}
          {onOpenPostTask && (
            <button
              onClick={onOpenPostTask}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white transition-all shadow-soft cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post a Task</span>
            </button>
          )}

          {/* AI Assistant Quick Pill */}
          <button
            onClick={onOpenAiAssistant}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 transition-all border border-indigo-200/70 cursor-pointer"
            title="Ask AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Copilot</span>
          </button>

          {/* Quick Search Button */}
          <button
            onClick={() => onNavigate('browse')}
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 flex items-center justify-center transition-all cursor-pointer"
            title="Search Services"
          >
            <Search className="w-4 h-4 text-cyan-700" />
          </button>

          {/* Notification Bell with interactive dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-9 h-9 rounded-full bg-amber-50/80 hover:bg-amber-100/70 text-amber-700 flex items-center justify-center transition-all cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-amber-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-soft-xl border border-zinc-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900">Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                        {unreadNotificationsCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        onMarkAllNotificationsRead?.();
                        setIsNotificationsOpen(false);
                      }}
                      className="text-[10px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="py-2 space-y-2 text-xs max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center space-y-1.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto text-sm">
                        🔔
                      </div>
                      <p className="text-xs font-semibold text-zinc-700">No notifications yet</p>
                      <p className="text-[11px] text-zinc-400 max-w-[200px] mx-auto">
                        You'll receive alerts when peers message you or task milestones update!
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const icon = n.type === 'message' ? '💬' : n.type === 'order' ? '📦' : n.type === 'request' ? '📋' : '✨';
                      return (
                        <button
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationRead?.(n.id);
                            setIsNotificationsOpen(false);
                            if (onSelectNotification) {
                              onSelectNotification(n);
                            } else if (n.linkView) {
                              onNavigate(n.linkView);
                            }
                          }}
                          className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                            !n.read 
                              ? 'bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100/80' 
                              : 'bg-zinc-50/60 hover:bg-zinc-100/70'
                          }`}
                        >
                          <span className="text-base shrink-0">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`font-bold truncate ${!n.read ? 'text-indigo-950' : 'text-zinc-800'}`}>
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-snug">
                              {n.body}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 hover:ring-2 hover:ring-indigo-300 transition-all flex items-center justify-center overflow-hidden cursor-pointer"
                title={currentUser.name}
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-base">😃</span>
                )}
              </button>

              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-soft-xl border border-zinc-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-950 truncate">{currentUser.name}</p>
                      {currentUser.role === 'admin' ? (
                        <span className="text-[10px] font-mono font-bold bg-zinc-950 text-white px-2 py-0.5 rounded">
                          ADMIN
                        </span>
                      ) : (
                        <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded">
                          🛡️ {currentUser.trustScore || 90} Trust
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{currentUser.email}</p>
                  </div>

                  <div className="py-1.5 text-xs text-zinc-700">
                    <button
                      onClick={() => onNavigate('profile')}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <User className="w-4 h-4 text-zinc-500" />
                      <span>My Profile & Dashboard</span>
                    </button>
                    <button
                      onClick={() => onNavigate('orders')}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center justify-between cursor-pointer font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="w-4 h-4 text-zinc-500" />
                        <span>Your Orders</span>
                      </div>
                      {activeOrdersCount > 0 && (
                        <span className="text-[10px] font-bold bg-zinc-950 text-white px-2 py-0.5 rounded-full">
                          {activeOrdersCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => onNavigate('messages')}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <MessageSquare className="w-4 h-4 text-zinc-500" />
                      <span>Messages</span>
                    </button>
                    <button
                      onClick={() => onNavigate('seller')}
                      className="w-full text-left px-4 py-2.5 hover:bg-purple-50 text-purple-700 flex items-center gap-2.5 cursor-pointer font-semibold"
                    >
                      <Plus className="w-4 h-4 text-purple-600" />
                      <span>Become a Seller / List Skill</span>
                    </button>
                    <button
                      onClick={onOpenLocationPicker}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Location: {currentLocation.neighborhood || currentLocation.city} ({radiusKm}km)</span>
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-xs font-bold text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-xl border border-zinc-200 transition-all cursor-pointer whitespace-nowrap"
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-soft cursor-pointer whitespace-nowrap flex items-center gap-1"
              >
                <span>Sign Up</span>
                <span>→</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Bottom Sub-nav for direct access */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-200/70 bg-white py-2 px-1 text-xs">
        {navLinks.map((link) => {
          const isActive = activeView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => {
                if ((link.id === 'orders' || link.id === 'messages' || link.id === 'profile') && !currentUser) {
                  onOpenAuth('login');
                } else {
                  onNavigate(link.id as NavViewType);
                }
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-600'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

