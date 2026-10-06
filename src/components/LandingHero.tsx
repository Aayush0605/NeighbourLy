import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  Star,
  Presentation,
  Palette,
  Video,
  Code2,
  FileText,
  Briefcase,
  BarChart3,
  Instagram,
  Sparkles
} from 'lucide-react';
import { ServiceCategory, LocationPoint } from '../types';
import { CATEGORY_PHOTOS, HERO_STUDENTS_BANNER } from '../utils/categoryImages';
import { StudentMascot } from './StudentMascot';
import { ClayHeroVisual } from './ClayHeroVisual';

interface LandingHeroProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: ServiceCategory | 'All') => void;
  onNavigateBrowse: () => void;
  onBecomeSeller?: () => void;
  onPostTask?: () => void;
  onOpenAuthSignup?: () => void;
  onNavigateMessages?: () => void;
  onNavigateOrders?: () => void;
  currentLocation: LocationPoint;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSearch,
  onSelectCategory,
  onNavigateBrowse,
  onBecomeSeller,
  onPostTask,
  onOpenAuthSignup,
  onNavigateMessages,
  onNavigateOrders,
  currentLocation,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
    onNavigateBrowse();
  };

  const quickPills = [
    { label: 'PPT & Presentations', cat: 'PPT & Presentations' },
    { label: 'Video Editing', cat: 'Video Editing' },
    { label: 'Web Development', cat: 'Web Development' },
    { label: 'Assignments', cat: 'Assignments & Academics' },
    { label: 'Design', cat: 'Design & Graphics' },
  ];

  const popularCategories = [
    {
      id: 'PPT & Presentations',
      label: 'PPT & Presentations',
      icon: <Presentation className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
      border: 'border-amber-200/80',
      text: 'text-amber-950',
      photo: CATEGORY_PHOTOS['PPT & Presentations'],
    },
    {
      id: 'Design & Graphics',
      label: 'Design & Graphics',
      icon: <Palette className="w-5 h-5 text-pink-600" />,
      bg: 'bg-pink-50',
      border: 'border-pink-200/80',
      text: 'text-pink-950',
      photo: CATEGORY_PHOTOS['Design & Graphics'],
    },
    {
      id: 'Video Editing',
      label: 'Video Editing',
      icon: <Video className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50',
      border: 'border-rose-200/80',
      text: 'text-rose-950',
      photo: CATEGORY_PHOTOS['Video Editing'],
    },
    {
      id: 'Web Development',
      label: 'Web Development',
      icon: <Code2 className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50',
      border: 'border-purple-200/80',
      text: 'text-purple-950',
      photo: CATEGORY_PHOTOS['Web Development'],
    },
    {
      id: 'Assignments & Academics',
      label: 'Assignments & Academics',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200/80',
      text: 'text-blue-950',
      photo: CATEGORY_PHOTOS['Assignments & Academics'],
    },
    {
      id: 'Resume & Career Help',
      label: 'Resume & Career Help',
      icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80',
      text: 'text-emerald-950',
      photo: CATEGORY_PHOTOS['Resume & Career Help'],
    },
    {
      id: 'Data & Research',
      label: 'Data & Research',
      icon: <BarChart3 className="w-5 h-5 text-orange-600" />,
      bg: 'bg-orange-50',
      border: 'border-orange-200/80',
      text: 'text-orange-950',
      photo: CATEGORY_PHOTOS['Data & Research'],
    },
    {
      id: 'Social Media',
      label: 'Social Media',
      icon: <Instagram className="w-5 h-5 text-fuchsia-600" />,
      bg: 'bg-fuchsia-50',
      border: 'border-fuchsia-200/80',
      text: 'text-fuchsia-950',
      photo: CATEGORY_PHOTOS['Social Media'],
    },
  ];

  const colleges = [
    { name: 'PCTE Ludhiana', icon: '🏛️' },
    { name: 'Lovely Professional University', icon: '🎓' },
    { name: 'Thapar Institute', icon: '⚡' },
    { name: 'Chandigarh University', icon: '🏰' },
    { name: 'Guru Nanak Dev University', icon: '🌟' },
  ];

  return (
    <div className="bg-white text-zinc-900 w-full overflow-hidden">
      
      {/* 1. HERO SECTION (Claymorphism Theme) */}
      <div className="relative bg-gradient-to-b from-indigo-50/50 via-purple-50/20 to-white pt-8 sm:pt-12 pb-12 sm:pb-16 border-b border-indigo-100/50 overflow-hidden w-full max-w-full">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Copy & Search Area */}
            <div className="lg:col-span-7 space-y-6 z-10">
              
              {/* "By Students" Claymorphic Badge */}
              <div 
                onClick={onNavigateBrowse}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full clay-badge-white cursor-pointer hover:scale-105 active:scale-95 transition-all group"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                <span className="text-xs sm:text-sm font-extrabold text-indigo-900 tracking-tight">
                  By Students
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  Campus Marketplace
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-zinc-950 leading-[1.1] break-words">
                Turn Your Skills <br />
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  into Opportunities
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-base text-zinc-600 max-w-xl leading-relaxed font-medium">
                Get projects done. Showcase your skills. Earn while you learn. All within your college community.
              </p>

              {/* Search Bar Input Container (Claymorphism Input Bar) */}
              <form onSubmit={handleSearchSubmit} className="pt-2 w-full max-w-full">
                <div className="relative flex items-center clay-input-bar p-1.5 sm:p-2 transition-all w-full max-w-full min-w-0">
                  <Search className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-500 ml-1.5 sm:ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="What do you need? (e.g. PPT, video, coding...)"
                    className="w-full min-w-0 px-2 sm:px-3 py-1.5 sm:py-2.5 bg-transparent text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 sm:px-7 py-2 sm:py-3 clay-button-primary text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Filter Tag Pills (Claymorphic Pills) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {quickPills.map((pill) => (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => {
                      onSelectCategory(pill.cat as any);
                      onNavigateBrowse();
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold clay-pill text-indigo-950 transition-all cursor-pointer hover:text-indigo-600"
                  >
                    {pill.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onNavigateBrowse}
                  className="px-3 py-1.5 rounded-full text-xs font-bold clay-pill text-zinc-600 hover:text-zinc-900 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>More</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Right Student Claymorphism Banner Visual */}
            <div className="lg:col-span-5 relative w-full max-w-full overflow-hidden">
              <ClayHeroVisual onSearch={onSearch} onNavigateBrowse={onNavigateBrowse} />
            </div>

          </div>

        </div>
      </div>

      {/* 2. POPULAR CATEGORIES SECTION WITH HIGH-RES PHOTOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-hidden w-full max-w-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-zinc-950">
              Popular Categories
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
              Explore skills offered by verified campus peers
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateBrowse}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-indigo-50 transition-all"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Rich Visual Category Cards with Photography (Claymorphism Theme) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
          {popularCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onSelectCategory(cat.id as any);
                onNavigateBrowse();
              }}
              className="clay-card-interactive overflow-hidden cursor-pointer flex flex-col group text-left w-full focus:outline-none"
            >
              {/* Card Photo Preview */}
              <div className="h-28 sm:h-32 w-full overflow-hidden relative bg-indigo-50/50">
                <img
                  src={cat.photo}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 p-2 clay-badge-white">
                  {cat.icon}
                </div>
              </div>

              {/* Card Title */}
              <div className="p-3.5 text-center flex-1 flex items-center justify-center w-full">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                  {cat.label}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. TRUSTED BY STUDENTS ACROSS TOP COLLEGES (Claymorphic Chips) */}
      <div className="border-y border-indigo-100/60 bg-gradient-to-r from-indigo-50/40 via-purple-50/30 to-pink-50/40 py-8 overflow-hidden w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-900/70">
            Trusted by Students Across Top Colleges
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-zinc-700">
            {colleges.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  onSearch(c.name);
                  onNavigateBrowse();
                }}
                className="clay-pill flex items-center gap-2 p-2 px-3.5 cursor-pointer text-zinc-800 hover:text-indigo-600 transition-all active:scale-95"
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={onNavigateBrowse}
              className="text-indigo-600 font-bold hover:underline cursor-pointer text-xs sm:text-sm"
            >
              and 200+ more colleges...
            </button>
          </div>
        </div>
      </div>

      {/* 4. HOW NEIGHBOURLY WORKS + START EARNING CTA BANNER */}
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-hidden w-full max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: 4 Step Process Flow (Claymorphism interactive cards) */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-zinc-950">
              How <span className="text-indigo-600">NeighborLy</span> Works?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Step 1 */}
              <button
                type="button"
                onClick={onOpenAuthSignup || (() => onNavigateBrowse())}
                className="p-4 sm:p-5 clay-card-interactive text-left cursor-pointer space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-xl clay-button-primary text-white text-xs font-black flex items-center justify-center shrink-0">1</span>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-indigo-600 transition-colors">Create Account</h3>
                </div>
                <p className="text-xs text-zinc-500">
                  Verify with your college email and set up your trust profile & skills.
                </p>
              </button>

              {/* Step 2 */}
              <button
                type="button"
                onClick={onPostTask || onNavigateBrowse}
                className="p-4 sm:p-5 clay-card-interactive text-left cursor-pointer space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-xl clay-button-primary text-white text-xs font-black flex items-center justify-center shrink-0">2</span>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-indigo-600 transition-colors">Post or Browse</h3>
                </div>
                <p className="text-xs text-zinc-500">
                  Post a task request or explore verified student creators and skill listings.
                </p>
              </button>

              {/* Step 3 */}
              <button
                type="button"
                onClick={onNavigateMessages || onNavigateBrowse}
                className="p-4 sm:p-5 clay-card-interactive text-left cursor-pointer space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-xl clay-button-primary text-white text-xs font-black flex items-center justify-center shrink-0">3</span>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-indigo-600 transition-colors">Connect & Collaborate</h3>
                </div>
                <p className="text-xs text-zinc-500">
                  Chat in real-time, agree on terms, and get tasks delivered with secured Escrow Protection.
                </p>
              </button>

              {/* Step 4 */}
              <button
                type="button"
                onClick={onNavigateOrders || onNavigateBrowse}
                className="p-4 sm:p-5 clay-card-interactive text-left cursor-pointer space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-xl clay-button-primary text-white text-xs font-black flex items-center justify-center shrink-0">4</span>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-indigo-600 transition-colors">Review & Grow</h3>
                </div>
                <p className="text-xs text-zinc-500">
                  Release payment upon sign-off, leave a review, and build your verified student portfolio.
                </p>
              </button>

            </div>
          </div>

          {/* Right: Start Earning Today Clay Purple Card */}
          <div className="lg:col-span-4 clay-card-purple p-6 sm:p-8 text-white space-y-5 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200 block">
                Join the Network
              </span>
              <h3 className="text-2xl font-black font-heading text-white">
                Start Earning Today!
              </h3>
              <p className="text-xs text-purple-100 leading-relaxed">
                Join thousands of college students turning their skills into real income and portfolio opportunities.
              </p>
            </div>

            <button
              type="button"
              onClick={onBecomeSeller || onNavigateBrowse}
              className="w-full py-3.5 clay-button-secondary text-indigo-950 hover:text-indigo-600 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
