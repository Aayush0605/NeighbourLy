import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  Wallet,
  FolderKanban,
  Presentation,
  X,
  Trash2
} from 'lucide-react';
import { LocationPoint, UserProfile, AppNotification } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';

export type NavViewType = 
  | 'home' 
  | 'browse' 
  | 'portfolio' 
  | 'seller' 
  | 'messages' 
  | 'orders' 
  | 'profile' 
  | 'wallet' 
  | 'ai' 
  | 'admin' 
  | 'auth';

interface NavbarProps {
  currentLocation: LocationPoint;
  radiusKm: number;
  isWorkFromCurrentLocation?: boolean;
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
  
  // Real unread notifications
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'browse', label: 'Browse' },
    { id: 'portfolio', label: 'Portfolio', icon: <Presentation className="w-3.5 h-3.5 text-purple-600" /> },
    { id: 'seller', label: 'Become a Seller' },
    { id: 'messages', label: 'Messages', badge: unreadMessagesCount },
    { id: 'orders', label: 'Orders', badge: activeOrdersCount },
    { id: 'wallet', label: 'Funds & Escrow' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 clay-nav w-full max-w-full overflow-visible">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1 sm:gap-6 min-w-0">
        
        {/* Left Section: Brand Logo */}
        <div className="flex items-center shrink-0">
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center group text-left cursor-pointer focus-visible:outline-none shrink-0"
            aria-label="NeighborLy Home"
          >
            <div className="hidden sm:block">
              <NeighborLyLogo size="md" variant="full" />
            </div>
            <div className="block sm:hidden">
              <NeighborLyLogo size="sm" variant="full" />
            </div>
          </button>
        </div>

        {/* Center Section: Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-5 shrink-0">
          <button
            onClick={() => onNavigate('browse')}
            className={`relative py-5 px-1.5 text-xs lg:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'browse' 
                ? 'text-indigo-900 font-bold' 
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <span>Browse</span>
            {activeView === 'browse' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          {/* New Portfolio Hub Link */}
          <button
            onClick={() => onNavigate('portfolio')}
            className={`relative py-5 px-1.5 text-xs lg:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'portfolio' 
                ? 'text-purple-900 font-bold' 
                : 'text-zinc-600 hover:text-purple-700'
            }`}
          >
            <span className="text-xs">🎬</span>
            <span>Portfolio</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 font-bold font-mono">
              PPT/Video
            </span>
            {activeView === 'portfolio' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('seller')}
            className={`relative py-5 px-1.5 text-xs lg:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'seller' 
                ? 'text-indigo-900 font-bold' 
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <span>Become a Seller</span>
            {activeView === 'seller' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('messages')}
            className={`relative py-5 px-1.5 text-xs lg:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'messages' 
                ? 'text-indigo-900 font-bold' 
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages</span>
            {unreadMessagesCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-600 text-white font-mono">
                {unreadMessagesCount}
              </span>
            )}
            {activeView === 'messages' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className={`relative py-5 px-1.5 text-xs lg:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'orders' 
                ? 'text-indigo-900 font-bold' 
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <span>Orders</span>
            {activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-600 text-white font-mono">
                {activeOrdersCount}
              </span>
            )}
            {activeView === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('wallet')}
            className={`relative py-5 px-1.5 text-xs lg:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'wallet' 
                ? 'text-emerald-900 font-bold' 
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <span>Funds & Escrow</span>
            {activeView === 'wallet' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          {/* Profile Tab in Main Nav */}
          <button
            onClick={() => onNavigate('profile')}
            className={`relative py-5 px-1.5 text-xs lg:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'profile' 
                ? 'text-indigo-900 font-bold' 
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <span>Profile</span>
            {activeView === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right Section: Location Pill, AI Assistant, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          
          {/* Hyperlocal Radius Location Pill */}
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full clay-pill hover:bg-zinc-100/90 transition-all text-xs font-semibold text-zinc-800 cursor-pointer max-w-[130px] sm:max-w-[190px] truncate shrink-0"
            title="Change neighborhood & search radius"
          >
            <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">
              {currentLocation.neighborhood || currentLocation.city}
            </span>
            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-full border border-purple-200 shrink-0 hidden sm:inline">
              {radiusKm}km
            </span>
          </button>

          {/* AI Grounded Assistant Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[11px] sm:text-xs font-bold shadow-soft cursor-pointer transition-all active:scale-95 shrink-0"
            title="Ask Grounded AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">AI Helper</span>
          </button>

          {/* Quick Direct Messages Button */}
          <button
            type="button"
            onClick={() => onNavigate('messages')}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full clay-pill text-indigo-700 hover:text-indigo-950 flex items-center justify-center cursor-pointer relative transition-all ${
              activeView === 'messages' ? 'ring-2 ring-indigo-600 bg-indigo-50' : ''
            }`}
            title="Open Messages & Chats"
            aria-label="Open messages"
          >
            <MessageSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-indigo-600" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications Bell Dropdown */}
          <div ref={notifDropdownRef} className="relative shrink-0">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full clay-pill text-amber-700 hover:text-amber-900 flex items-center justify-center cursor-pointer relative"
              title="Notifications"
              aria-label="Open notifications"
            >
              <Bell className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 sm:w-88 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-zinc-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-950">Real Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                        {unreadNotificationsCount} unread
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onMarkAllNotificationsRead?.();
                        setIsNotificationsOpen(false);
                      }}
                      className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      Clear & mark read
                    </button>
                  )}
                </div>

                <div className="py-2 space-y-1.5 text-xs max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center space-y-1.5">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto text-base">
                        🔔
                      </div>
                      <p className="text-xs font-bold text-zinc-800">No new notifications</p>
                      <p className="text-[11px] text-zinc-400 max-w-[220px] mx-auto">
                        Notifications appear when buyers order your gig, peers message you, or escrow releases!
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const icon = n.type === 'message' ? '💬' : n.type === 'order' ? '📦' : n.type === 'request' ? '📋' : '✨';
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationRead?.(n.id);
                            setIsNotificationsOpen(false);
                            if (onSelectNotification) {
                              onSelectNotification(n);
                            } else if (n.linkView) {
                              onNavigate(n.linkView as NavViewType);
                            }
                          }}
                          className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                            !n.read 
                              ? 'bg-indigo-50/80 hover:bg-indigo-100/70 border border-indigo-100' 
                              : 'bg-zinc-50/60 hover:bg-zinc-100/70'
                          }`}
                        >
                          <span className="text-base shrink-0">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`font-bold truncate text-xs ${!n.read ? 'text-indigo-950' : 'text-zinc-800'}`}>
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-snug">
                              {n.body}
                            </p>
                            <span className="text-[9px] text-zinc-400 block mt-1">
                              {n.createdAt || 'Just now'} · Click to view & remove
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Sign In */}
          {currentUser ? (
            <div ref={userMenuRef} className="relative">
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
                  <span className="text-base">🎓</span>
                )}
              </button>

              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-zinc-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-950 truncate">{currentUser.name}</p>
                      {currentUser.studentVerified && (
                        <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                          🎓 Student Verified
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
                      <span>My Profile & Trust Dashboard</span>
                    </button>
                    <button
                      onClick={() => onNavigate('portfolio')}
                      className="w-full text-left px-4 py-2.5 hover:bg-purple-50 text-purple-900 flex items-center gap-2.5 cursor-pointer font-semibold"
                    >
                      <Presentation className="w-4 h-4 text-purple-600" />
                      <span>Multi-Format Portfolio (PPT, Videos)</span>
                    </button>
                    <button
                      onClick={() => onNavigate('orders')}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center justify-between cursor-pointer font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="w-4 h-4 text-zinc-500" />
                        <span>Your Tasks & Orders</span>
                      </div>
                      {activeOrdersCount > 0 && (
                        <span className="text-[10px] font-bold bg-zinc-950 text-white px-2 py-0.5 rounded-full">
                          {activeOrdersCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => onNavigate('wallet')}
                      className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-emerald-800 flex items-center gap-2.5 cursor-pointer font-semibold"
                    >
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span>Funds & Escrow Balance</span>
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
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl border border-zinc-200 transition-all cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-soft cursor-pointer whitespace-nowrap flex items-center gap-1"
              >
                <span>Join</span>
                <span className="hidden sm:inline">→</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Bottom Sub-nav for direct access */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-zinc-200/70 bg-white py-2 px-2.5 text-xs w-full max-w-full whitespace-nowrap">
        {navLinks.map((link) => {
          const isActive = activeView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id as NavViewType)}
              className={`py-1 px-3 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                isActive
                  ? 'bg-zinc-950 text-white shadow-soft-xs'
                  : 'bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <span>{link.label}</span>
              {typeof link.badge === 'number' && link.badge > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-mono font-black">
                  {link.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
