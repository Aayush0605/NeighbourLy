import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  Laptop, 
  Palette, 
  BookOpen, 
  Dog, 
  ShoppingBag, 
  ArrowRight,
  Navigation,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ServiceCategory, LocationPoint } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';
import { BrandIconTile } from './BrandIconTile';
import { StudentMascot } from './StudentMascot';
import { ModernPremiumCard } from './ModernPremiumCard';

interface LandingHeroProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: ServiceCategory | 'All') => void;
  onNavigateBrowse: () => void;
  currentLocation: LocationPoint;
  radiusKm: number;
  isWorkFromCurrentLocation: boolean;
  onDetectLocation: () => void;
  onOpenLocationPicker: () => void;
  onPostRequest: () => void;
  onPostService: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSearch,
  onSelectCategory,
  onNavigateBrowse,
  currentLocation,
  radiusKm,
  isWorkFromCurrentLocation,
  onDetectLocation,
  onOpenLocationPicker,
  onPostRequest,
  onPostService,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [heroCardTab, setHeroCardTab] = useState<'radar' | 'premium'>('radar');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigateBrowse();
    }
  };

  const categories = [
    {
      id: 'Home & Repairs',
      title: 'Home & Repairs',
      desc: 'Assembly, electrical, fixing',
      icon: Wrench,
      accent: 'from-amber-500/10 to-orange-500/10 text-amber-700',
    },
    {
      id: 'Tech & Digital',
      title: 'Tech & Digital',
      desc: 'Wi-Fi, PC setup, troubleshooting',
      icon: Laptop,
      accent: 'from-blue-500/10 to-indigo-500/10 text-blue-700',
    },
    {
      id: 'Creative & Design',
      title: 'Creative & Design',
      desc: 'Presentations, design, media',
      icon: Palette,
      accent: 'from-purple-500/10 to-pink-500/10 text-purple-700',
    },
    {
      id: 'Lessons & Tutoring',
      title: 'Lessons & Tutoring',
      desc: 'Math, languages, academics',
      icon: BookOpen,
      accent: 'from-emerald-500/10 to-teal-500/10 text-emerald-700',
    },
    {
      id: 'Pet Care',
      title: 'Pet Care',
      desc: 'Dog walking, pet sitting',
      icon: Dog,
      accent: 'from-rose-500/10 to-pink-500/10 text-rose-700',
    },
    {
      id: 'Errands & Delivery',
      title: 'Errands & Delivery',
      desc: 'Local pickups, groceries, errands',
      icon: ShoppingBag,
      accent: 'from-sky-500/10 to-cyan-500/10 text-sky-700',
    },
  ];

  return (
    <div className="relative border-b border-zinc-200/70 bg-gradient-to-b from-white via-zinc-50/50 to-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Modern Premium Ambient Background Aurora & Luminous "N" Watermark (Inspired by Image 1 Item 1) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-36 -left-36 w-[450px] h-[450px] bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-36 w-[550px] h-[550px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-[650px] h-[350px] bg-blue-500/8 rounded-full blur-3xl" />
        
        {/* Subtle Giant Floating "N" Watermark in Background */}
        <div className="absolute -right-12 top-8 opacity-[0.035] text-purple-900 pointer-events-none rotate-6 scale-150">
          <NeighborLyLogo size="2xl" variant="watermark" />
        </div>
        <div className="absolute -left-16 bottom-8 opacity-[0.025] text-cyan-900 pointer-events-none -rotate-12 scale-125">
          <NeighborLyLogo size="2xl" variant="watermark" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Headline, Search, Value Badges */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Top Brand & Location context */}
            <div className="flex flex-wrap items-center gap-2.5">
              <NeighborLyLogo variant="badge" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100/90 text-zinc-700 text-xs font-medium border border-zinc-200/80 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Near <strong>{currentLocation.neighborhood || currentLocation.city}</strong></span>
                <span className="text-zinc-300">·</span>
                <span className="text-zinc-600 font-semibold">{radiusKm}km</span>
                <button
                  type="button"
                  onClick={onOpenLocationPicker}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-xs ml-0.5 cursor-pointer hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Clean headline with generous vertical breathing room */}
            <div className="space-y-4">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-zinc-950 leading-[1.1] text-balance">
                Neighborhood skills, <br />
                <span className="text-zinc-900">right on your street.</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-zinc-600 font-normal max-w-xl leading-relaxed">
                Connect directly with trusted neighbors for home repairs, tech setup, pet care, tutoring, and daily tasks. Verified local profiles with escrow protection.
              </p>
            </div>

            {/* Search Bar with larger radii and soft depth */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl">
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-3xl shadow-soft hover:shadow-soft-md border border-zinc-300/90 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/10 transition-all p-1.5 sm:p-2 gap-2">
                <div className="flex items-center flex-1 px-2.5 py-1 sm:py-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="What do you need help with? (e.g. Wi-Fi setup, painting, plumbing)"
                    className="w-full text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent focus:outline-none min-h-[40px]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 sm:py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-soft flex items-center justify-center gap-2 shrink-0 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Find Help</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Actions & GPS */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <button
                type="button"
                onClick={onDetectLocation}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-medium transition-all shadow-2xs hover:shadow-soft-xs cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Use Current GPS Location</span>
              </button>
              <button
                type="button"
                onClick={onPostRequest}
                className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 font-medium transition-colors cursor-pointer py-1"
              >
                <span>Need something done urgently?</span>
                <span className="font-semibold text-blue-600 hover:underline">Post a task request →</span>
              </button>
            </div>

            {/* 3 Clean Trust Points (Unboxed metadata style) */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4 pt-6 border-t border-zinc-100 max-w-xl">
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-950">Hyperlocal</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Under {radiusKm}km radius</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-950">Escrow Protected</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Pay only when satisfied</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-950">Zero Agency Fees</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Direct neighbor rates</p>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Community Hub Spotlight or Modern Premium Card */}
          <div className="lg:col-span-5 space-y-3">
            {/* View Switcher Pills */}
            <div className="flex items-center justify-end gap-1.5 p-1 bg-zinc-100/90 rounded-2xl w-fit ml-auto border border-zinc-200/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setHeroCardTab('radar')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  heroCardTab === 'radar'
                    ? 'bg-white text-zinc-950 shadow-soft-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Neighborhood Radar
              </button>
              <button
                type="button"
                onClick={() => setHeroCardTab('premium')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  heroCardTab === 'premium'
                    ? 'bg-zinc-950 text-white shadow-soft-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Modern Premium
              </button>
            </div>

            {heroCardTab === 'premium' ? (
              <ModernPremiumCard size="md" />
            ) : (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft-lg space-y-6 relative overflow-hidden">
                
                {/* Header inside radar card */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <NeighborLyLogo size="sm" variant="icon" />
                    <div className="space-y-0.5">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400">Neighborhood Hub</span>
                      <h3 className="text-base sm:text-lg font-bold text-zinc-950">{currentLocation.neighborhood}</h3>
                    </div>
                  </div>
                  <button
                    onClick={onOpenLocationPicker}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/70 rounded-xl transition-colors cursor-pointer"
                  >
                    Adjust Radius
                  </button>
                </div>

                {/* Proximity Information Card with subtle shadow */}
                <div className="space-y-4 bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/60 shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-200/80 shadow-soft-xs flex items-center justify-center shrink-0 text-blue-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-zinc-900">Active Hyperlocal Radar</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Showing vetted services within <strong className="text-zinc-800 font-semibold">{radiusKm} km</strong> of {currentLocation.neighborhood}, {currentLocation.city}.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-600">
                    <span className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="font-medium text-zinc-700">GPS Live Tracking</span>
                    </span>
                    <span className="font-semibold text-zinc-900">Direct booking</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={onPostRequest}
                    className="w-full py-3.5 px-5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Post a Task Needed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onPostService}
                    className="w-full py-3.5 px-5 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 rounded-2xl text-xs sm:text-sm font-semibold border border-zinc-200/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-soft-xs"
                  >
                    <span>Offer a Skill / Service</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Student Community Mascot Banner (Image 2, Item 11) */}
        <div className="mt-12 sm:mt-16">
          <StudentMascot variant="banner" showTags={true} />
        </div>

        {/* Brand Elements Bar (Image 1 Item 18 & Image 2 Item 16: Education, Work, Community, Chat, Trusted, Local, Growth, Support) */}
        <div className="mt-12 sm:mt-16 pt-8 pb-2 border-t border-zinc-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-purple-600 uppercase">
                Campus & Neighborhood Ecosystem
              </span>
              <h3 className="text-base sm:text-lg font-heading font-extrabold text-zinc-950 mt-0.5">
                Students Helping Students
              </h3>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm">
              Discover verified campus tutors, student freelancers, tech troubleshooting, and neighbor support.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 py-2">
            <BrandIconTile type="education" showLabel size="md" onClick={() => { onSelectCategory('Lessons & Tutoring'); onNavigateBrowse(); }} />
            <BrandIconTile type="work" showLabel size="md" onClick={() => { onSelectCategory('Home & Repairs'); onNavigateBrowse(); }} />
            <BrandIconTile type="community" showLabel size="md" onClick={() => { onSelectCategory('All'); onNavigateBrowse(); }} />
            <BrandIconTile type="chat" showLabel size="md" onClick={() => { onSelectCategory('Others'); onNavigateBrowse(); }} />
            <BrandIconTile type="trusted" showLabel size="md" onClick={() => { onSelectCategory('All'); onNavigateBrowse(); }} />
            <BrandIconTile type="local" showLabel size="md" onClick={onOpenLocationPicker} />
            <BrandIconTile type="growth" showLabel size="md" onClick={() => { onSelectCategory('Tech & Digital'); onNavigateBrowse(); }} />
            <BrandIconTile type="support" showLabel size="md" onClick={() => { onSelectCategory('Errands & Delivery'); onNavigateBrowse(); }} />
          </div>
        </div>

        {/* Category Row (Responsive scroll on mobile, clean grid on desktop) */}
        <div className="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-zinc-200/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-zinc-950">Explore by Category</h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">Popular services requested in your area</p>
            </div>
            <button
              onClick={() => {
                onSelectCategory('All');
                onNavigateBrowse();
              }}
              className="text-xs font-bold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 cursor-pointer py-1"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal scroll on mobile (no-scrollbar), clean grid on tablet & desktop */}
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id as ServiceCategory);
                    onNavigateBrowse();
                  }}
                  className="group min-w-[150px] sm:min-w-0 p-4 sm:p-5 bg-white hover:bg-zinc-50/70 rounded-2xl sm:rounded-3xl border border-zinc-200/80 hover:border-zinc-300 shadow-soft-xs hover:shadow-soft-md transition-all duration-200 text-left cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100/80 group-hover:bg-white border border-zinc-200/70 flex items-center justify-center text-zinc-700 mb-4 transition-all shadow-2xs group-hover:shadow-soft-xs">
                    <Icon className="w-5 h-5 text-zinc-800" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-zinc-950 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {cat.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1 leading-snug">
                      {cat.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
