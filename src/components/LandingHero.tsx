import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Wrench, 
  Laptop, 
  Palette, 
  BookOpen, 
  Dog, 
  ShoppingBag, 
  ArrowRight,
  Sparkles,
  Target,
  Navigation
} from 'lucide-react';
import { ServiceCategory, LocationPoint } from '../types';

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
      subtitle: 'Assembly, Electrical, Fixing',
      icon: Wrench,
      color: 'bg-amber-50 text-amber-700 border-amber-200/70',
    },
    {
      id: 'Tech & Digital',
      title: 'Tech & Digital',
      subtitle: 'PC, Wi-Fi, Coding, Setup',
      icon: Laptop,
      color: 'bg-blue-50 text-blue-700 border-blue-200/70',
    },
    {
      id: 'Creative & Design',
      title: 'Creative & Design',
      subtitle: 'PPTs, Video, Posters, Logos',
      icon: Palette,
      color: 'bg-purple-50 text-purple-700 border-purple-200/70',
    },
    {
      id: 'Lessons & Tutoring',
      title: 'Lessons & Tutoring',
      subtitle: 'Exams, Languages, Math',
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    },
    {
      id: 'Pet Care',
      title: 'Pet Care',
      subtitle: 'Walking, Sitting, Grooming',
      icon: Dog,
      color: 'bg-rose-50 text-rose-700 border-rose-200/70',
    },
    {
      id: 'Errands & Delivery',
      title: 'Errands & Delivery',
      subtitle: 'Pickups, Groceries, Moving',
      icon: ShoppingBag,
      color: 'bg-teal-50 text-teal-700 border-teal-200/70',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/20 to-white pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Search, Value Badges */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title with handwritten doodle element */}
            <div className="relative">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-slate-950 leading-[1.08] max-w-xl text-balance">
                Local Skills Today. <br />
                <span className="text-emerald-700">Support Tomorrow.</span>
              </h1>

              {/* Playful Handwritten Note with Curved Arrow */}
              <div className="hidden sm:flex absolute -top-5 right-6 lg:right-10 items-center gap-1.5 transform rotate-3">
                <span className="font-handwriting text-2xl lg:text-3xl font-bold text-emerald-700 tracking-wide">
                  Same Neighborhood <br />
                  <span className="text-indigo-600">Faster Help</span>
                </span>
                <svg className="w-8 h-8 text-emerald-600 transform -scale-x-100 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </div>
            </div>

            <p className="text-base sm:text-lg text-slate-600 font-normal max-w-xl leading-relaxed">
              Get tasks done by trusted neighbors right in your area. <br className="hidden sm:inline" />
              <span className="font-bold text-slate-900">Hyperlocal. Affordable. Escrow-Protected.</span>
            </p>

            {/* Location banner & Work from Current Location quick switch */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold flex-1 truncate">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {currentLocation.neighborhood}, {currentLocation.city}
                </span>
                <span className="text-emerald-700 bg-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  within {radiusKm}km
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onDetectLocation}
                  className="px-2.5 py-1 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Detect GPS"
                >
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  <span>GPS</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenLocationPicker}
                  className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Change Radius
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl">
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-emerald-600/30 focus-within:border-emerald-600 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="What do you need help with? (e.g. Wi-Fi setup, PPT, painting, tutoring)"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </form>

            {/* 4 Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 max-w-xl">
              <div className="flex items-center gap-2.5 p-2.5 bg-white/90 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Near You</p>
                  <p className="text-[11px] text-slate-500 font-medium">{radiusKm}km Radius</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-white/90 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Peer Rates</p>
                  <p className="text-[11px] text-slate-500 font-medium">From ₹100</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-white/90 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Same Day</p>
                  <p className="text-[11px] text-slate-500 font-medium">Fast Help</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-white/90 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Escrow Safe</p>
                  <p className="text-[11px] text-slate-500 font-medium">Protected</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Blur glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-3xl opacity-20 blur-xl"></div>
              
              <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 overflow-hidden space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-800">Hyperlocal Community Hub</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {currentLocation.city}
                  </span>
                </div>

                {/* Hero Showcase Card */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white p-5 space-y-3 relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Work from your current location</span>
                  </div>

                  <h3 className="text-xl font-heading font-black tracking-tight text-white leading-snug">
                    Offer skills to your neighbors or get local tasks done quickly.
                  </h3>

                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Zero middlemen. Direct neighbor collaboration with built-in escrow payment safety.
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={onPostService}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all text-center cursor-pointer shadow-sm"
                    >
                      Offer a Skill
                    </button>
                    <button
                      onClick={onPostRequest}
                      className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 text-center cursor-pointer"
                    >
                      Post a Request
                    </button>
                  </div>
                </div>

                {/* Micro info counters */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-black text-slate-900">0% Commission</p>
                    <p className="text-[10px] text-slate-500">For Direct Peer Help</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-black text-emerald-700">GPS Matched</p>
                    <p className="text-[10px] text-slate-500">Within Your Radius</p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* 6 Category Tiles */}
        <div className="mt-14 pt-8 border-t border-slate-200/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-heading font-bold text-slate-900">Explore Neighborhood Skills</h2>
              <p className="text-xs text-slate-500">Find neighbors who can assist you in your local area</p>
            </div>
            <button
              onClick={onNavigateBrowse}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View all services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id as any);
                    onNavigateBrowse();
                  }}
                  className={`group p-4 bg-white hover:bg-slate-50 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${cat.color}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {cat.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
