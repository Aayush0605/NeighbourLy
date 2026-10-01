import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  CheckSquare, 
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
      
      {/* 1. HERO SECTION (Exact Match to Screenshot file_000000001dd482108e9d1a64ff5e2f52.png) */}
      <div className="relative bg-gradient-to-b from-purple-50/40 via-white to-white pt-8 sm:pt-12 pb-12 sm:pb-16 border-b border-zinc-100">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Copy & Search Area */}
            <div className="lg:col-span-7 space-y-6 z-10">
              
              {/* "For Students • By Students" Badge */}
              <div 
                onClick={onNavigateBrowse}
                className="inline-block relative cursor-pointer hover:opacity-90 transition-opacity"
              >
                <span className="text-sm sm:text-base font-extrabold text-indigo-700 tracking-tight">
                  For Students <span className="text-purple-400">•</span> By Students
                </span>
                <svg className="w-36 h-2.5 text-indigo-500 mt-0.5" viewBox="0 0 144 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 7C35 2 95 2 142 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-zinc-950 leading-[1.1]">
                Turn Your Skills <br />
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  into Opportunities
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-zinc-600 max-w-xl leading-relaxed font-medium">
                Get projects done. Showcase your skills. Earn while you learn. All within your college community.
              </p>

              {/* Search Bar Input Container */}
              <form onSubmit={handleSearchSubmit} className="pt-2">
                <div className="relative flex items-center bg-white rounded-2xl shadow-soft-lg border border-zinc-200/90 p-1.5 transition-all focus-within:ring-2 focus-within:ring-indigo-600/30">
                  <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="What do you need? (e.g. PPT, video editing, coding...)"
                    className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-soft transition-all cursor-pointer shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Filter Tag Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {quickPills.map((pill) => (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => {
                      onSelectCategory(pill.cat as any);
                      onNavigateBrowse();
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-900 border border-indigo-100 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    {pill.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onNavigateBrowse}
                  className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 cursor-pointer hover:bg-zinc-100 transition-all"
                >
                  <span>More</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Right Student Photography Banner (Exact Match to Screenshot) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-purple-100 aspect-[4/3] sm:aspect-[16/11] group">
                <img
                  src={HERO_STUDENTS_BANNER}
                  alt="Students Helping Students on NeighbourLy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Ambient Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Badge 1: 1000+ Projects Completed (Clickable to Browse) */}
                <button
                  type="button"
                  onClick={onNavigateBrowse}
                  className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 shadow-xl border border-white/60 flex items-center gap-2.5 cursor-pointer hover:scale-105 transition-transform text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-soft-xs">
                    ✓
                  </div>
                  <div>
                    <span className="block text-xs font-black text-zinc-950">1000+</span>
                    <span className="text-[10px] text-zinc-500 font-medium leading-none">Projects Completed</span>
                  </div>
                </button>

                {/* Floating Student Word Tags (Clickable Search Tags) */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                  {[
                    { label: 'Freelance', bg: 'bg-amber-400 text-zinc-950' },
                    { label: 'Skills', bg: 'bg-purple-600 text-white' },
                    { label: 'Friends', bg: 'bg-pink-500 text-white' },
                    { label: 'Income', bg: 'bg-emerald-500 text-white' },
                  ].map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => {
                        onSearch(tag.label);
                        onNavigateBrowse();
                      }}
                      className={`px-2.5 py-0.5 ${tag.bg} text-[10px] font-black rounded shadow-sm tracking-wider uppercase cursor-pointer hover:scale-110 active:scale-95 transition-transform`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>

                {/* Doodle Callout Text */}
                <button
                  type="button"
                  onClick={onNavigateBrowse}
                  className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[11px] font-bold text-indigo-900 border border-indigo-100 shadow-soft-xs cursor-pointer hover:bg-white transition-all"
                >
                  ✨ Learn • Earn • Grow
                </button>

              </div>
            </div>

          </div>

          {/* 4 Trust Metrics Row (All Clickable to Explore) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-14">
            
            <button
              type="button"
              onClick={onNavigateBrowse}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/90 shadow-2xs flex items-center gap-3.5 hover:shadow-soft hover:-translate-y-0.5 transition-all text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black font-heading text-zinc-950 block">5K+</span>
                <span className="text-[11px] text-zinc-500 font-semibold block">Verified Students</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onNavigateBrowse}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/90 shadow-2xs flex items-center gap-3.5 hover:shadow-soft hover:-translate-y-0.5 transition-all text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black font-heading text-zinc-950 block">200+</span>
                <span className="text-[11px] text-zinc-500 font-semibold block">Colleges Connected</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onNavigateOrders || onNavigateBrowse}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/90 shadow-2xs flex items-center gap-3.5 hover:shadow-soft hover:-translate-y-0.5 transition-all text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black font-heading text-zinc-950 block">10K+</span>
                <span className="text-[11px] text-zinc-500 font-semibold block">Tasks Completed</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onNavigateBrowse}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/90 shadow-2xs flex items-center gap-3.5 hover:shadow-soft hover:-translate-y-0.5 transition-all text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black font-heading text-zinc-950 block">4.8/5</span>
                <span className="text-[11px] text-zinc-500 font-semibold block">Average Rating</span>
              </div>
            </button>

          </div>

        </div>
      </div>

      {/* 2. POPULAR CATEGORIES SECTION WITH HIGH-RES PHOTOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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

        {/* 8 Rich Visual Category Cards with Photography */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
          {popularCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onSelectCategory(cat.id as any);
                onNavigateBrowse();
              }}
              className="bg-white rounded-3xl overflow-hidden border border-zinc-200/90 shadow-2xs hover:shadow-soft transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col group text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              {/* Card Photo Preview */}
              <div className="h-28 sm:h-32 w-full overflow-hidden relative bg-zinc-100">
                <img
                  src={cat.photo}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 p-2 rounded-xl bg-white/95 backdrop-blur-xs shadow-soft-xs border border-white/80">
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

      {/* 3. TRUSTED BY STUDENTS ACROSS TOP COLLEGES (Clickable chips) */}
      <div className="border-y border-zinc-100 bg-zinc-50/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Trusted by Students Across Top Colleges
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold text-zinc-700">
            {colleges.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  onSearch(c.name);
                  onNavigateBrowse();
                }}
                className="flex items-center gap-2 p-2 px-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-all active:scale-95"
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={onNavigateBrowse}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              and 200+ more colleges...
            </button>
          </div>
        </div>
      </div>

      {/* 4. HOW NEIGHBOURLY WORKS + START EARNING CTA BANNER */}
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: 4 Step Process Flow (Interactive cards) */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-zinc-950">
              How <span className="text-indigo-600">NeighborLy</span> Works?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Step 1 */}
              <button
                type="button"
                onClick={onOpenAuthSignup || (() => onNavigateBrowse())}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-50 hover:bg-white border border-zinc-200/80 hover:border-indigo-300 hover:shadow-soft text-left cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center group-hover:scale-110 transition-transform">1</span>
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
                className="p-4 sm:p-5 rounded-2xl bg-zinc-50 hover:bg-white border border-zinc-200/80 hover:border-indigo-300 hover:shadow-soft text-left cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center group-hover:scale-110 transition-transform">2</span>
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
                className="p-4 sm:p-5 rounded-2xl bg-zinc-50 hover:bg-white border border-zinc-200/80 hover:border-indigo-300 hover:shadow-soft text-left cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center group-hover:scale-110 transition-transform">3</span>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-indigo-600 transition-colors">Connect & Collaborate</h3>
                </div>
                <p className="text-xs text-zinc-500">
                  Chat in real-time, agree on terms, and get tasks delivered with Escrow-Lite protection.
                </p>
              </button>

              {/* Step 4 */}
              <button
                type="button"
                onClick={onNavigateOrders || onNavigateBrowse}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-50 hover:bg-white border border-zinc-200/80 hover:border-indigo-300 hover:shadow-soft text-left cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center group-hover:scale-110 transition-transform">4</span>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-indigo-600 transition-colors">Review & Grow</h3>
                </div>
                <p className="text-xs text-zinc-500">
                  Release payment upon sign-off, leave a review, and build your verified student portfolio.
                </p>
              </button>

            </div>
          </div>

          {/* Right: Start Earning Today Purple Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-xl relative overflow-hidden">
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
              className="w-full py-3 bg-white text-indigo-900 hover:bg-purple-50 active:scale-95 text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
