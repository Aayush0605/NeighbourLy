import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Heart, 
  Star, 
  ChevronDown,
  MessageSquare,
  SlidersHorizontal,
  X,
  Plus,
  Sparkles,
  Globe,
  Clock,
  AlertCircle,
  Briefcase,
  Trash2
} from 'lucide-react';
import { ServiceListing, TaskRequest, ServiceCategory, LocationPoint, UserProfile } from '../types';
import { calculateDistanceKm } from '../utils/location';
import { getServicePhoto } from '../utils/categoryImages';

interface BrowseServicesProps {
  services: ServiceListing[];
  requests?: TaskRequest[];
  currentLocation: LocationPoint;
  radiusKm: number;
  onChangeRadiusKm: (radius: number) => void;
  onSelectService: (service: ServiceListing) => void;
  onSelectRequest?: (request: TaskRequest) => void;
  onOpenMessageWithUser: (user: UserProfile, service?: ServiceListing) => void;
  onOpenPublicProfile: (user: UserProfile) => void;
  onOpenPostService?: () => void;
  onOpenPostRequest?: () => void;
  onDeleteRequest?: (requestId: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const BrowseServices: React.FC<BrowseServicesProps> = ({
  services,
  requests = [],
  currentLocation,
  radiusKm,
  onChangeRadiusKm,
  onSelectService,
  onSelectRequest,
  onOpenMessageWithUser,
  onOpenPublicProfile,
  onOpenPostService,
  onOpenPostRequest,
  onDeleteRequest,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'requests'>('services');
  // Default to 'all' so users on different devices and locations see all live items
  const [locationScope, setLocationScope] = useState<'all' | 'nearby'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'distance' | 'rating'>('recommended');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categories = [
    { id: 'All', label: 'All Categories' },
    { id: 'Academic Support', label: 'Academic Support' },
    { id: 'PPT & Presentations', label: 'PPT & Presentations' },
    { id: 'Design & Graphics', label: 'Design & Graphics' },
    { id: 'Creative & Design', label: 'Creative & Design' },
    { id: 'Handmade & Crafts', label: 'Handmade & Crafts' },
    { id: 'Web Development', label: 'Web Development' },
    { id: 'Video Editing', label: 'Video Editing' },
    { id: 'Assignments & Academics', label: 'Assignments & Academics' },
    { id: 'Resume & Career Help', label: 'Resume & Career Help' },
    { id: 'Tech & Digital', label: 'Tech & Digital' },
    { id: 'Other', label: 'Other' },
  ];

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredServices = useMemo(() => {
    return services
      .map((s, idx) => {
        const dist = s.location
          ? calculateDistanceKm(
              currentLocation.lat,
              currentLocation.lng,
              s.location.lat,
              s.location.lng
            )
          : (s.distanceKm || 1.2);
        return { ...s, distanceKm: dist, coverImage: s.coverImage || getServicePhoto(s.category, idx) };
      })
      .filter((s) => {
        const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesPrice = s.price <= maxPrice;
        // When locationScope is 'all', do not filter out cross-device / cross-location services
        const matchesDist = locationScope === 'all' || (s.distanceKm || 0) <= maxDistance;
        return matchesCat && matchesQuery && matchesPrice && matchesDist;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'distance') return (a.distanceKm || 0) - (b.distanceKm || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.rating || 0) * (b.reviewCount || 1) - (a.rating || 0) * (a.reviewCount || 1);
      });
  }, [services, currentLocation, selectedCategory, searchQuery, maxPrice, maxDistance, sortBy, locationScope]);

  const filteredRequests = useMemo(() => {
    return requests
      .map((r) => {
        const dist = r.requesterLocation
          ? calculateDistanceKm(
              currentLocation.lat,
              currentLocation.lng,
              r.requesterLocation.lat,
              r.requesterLocation.lng
            )
          : 2.5;
        return { ...r, distanceKm: dist };
      })
      .filter((r) => {
        const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = (r.budget || 0) <= maxPrice;
        const matchesDist = locationScope === 'all' || (r.distanceKm || 0) <= maxDistance;
        return matchesCat && matchesQuery && matchesPrice && matchesDist;
      });
  }, [requests, currentLocation, selectedCategory, searchQuery, maxPrice, maxDistance, locationScope]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-6 sm:py-10 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 w-full max-w-full">
        
        {/* Top Header: Title and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-zinc-950">
                Campus & Neighborhood Marketplace
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  {locationScope === 'all' ? (
                    <>Showing all live community listings (<strong>Cross-Campus & Nationwide</strong>)</>
                  ) : (
                    <>Showing skills within {maxDistance}km of <strong>{currentLocation.neighborhood || currentLocation.city}</strong></>
                  )}
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {onOpenPostService && (
                <button
                  onClick={onOpenPostService}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-soft flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>List a Skill</span>
                </button>
              )}
              {onOpenPostRequest && (
                <button
                  onClick={onOpenPostRequest}
                  className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-soft flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post a Request</span>
                </button>
              )}
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search skills, services, keywords, or topics (e.g., Python, Calculus, Video Editing, PPT)..."
              className="w-full pl-11 pr-10 py-3 bg-white border border-zinc-200/90 rounded-2xl text-xs sm:text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-600/30 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tabs: Offered Skills vs Tasks Needed (Requests) */}
          <div className="flex items-center gap-2 sm:gap-3 border-b border-zinc-200 pb-2 overflow-x-auto no-scrollbar w-full max-w-full whitespace-nowrap">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-zinc-950 text-white shadow-soft-xs'
                  : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Offered Skills ({filteredServices.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'bg-zinc-950 text-white shadow-soft-xs'
                  : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tasks Needed / Requests ({filteredRequests.length})</span>
            </button>
          </div>
        </div>

        {/* Horizontal Category Carousel for Fast Filtering */}
        {/* Quick Category Filter Scroll Bar (Claymorphic Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar w-full max-w-full">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'clay-button-primary text-white shadow-md'
                    : 'clay-pill text-zinc-700 hover:text-indigo-600'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Main Layout Grid: Left Filters Sidebar + Right Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-full">
          
          {/* Left Sidebar Filter (Claymorphic Sticky Desktop) */}
          <div className={`lg:col-span-3 min-w-0 clay-card p-5 sm:p-6 space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                Filter & Scope
              </span>
              <button
                onClick={() => {
                  onCategoryChange('All');
                  setMaxPrice(5000);
                  setMaxDistance(30);
                  setLocationScope('all');
                  onSearchChange('');
                }}
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Cross-Device Location Scope Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-800 block">Location Scope</label>
              <div className="grid grid-cols-2 gap-1.5 bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLocationScope('all')}
                  className={`py-2 px-2 text-center rounded-lg transition-all cursor-pointer ${
                    locationScope === 'all'
                      ? 'bg-white text-zinc-950 shadow-soft-xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  🌐 All Locations
                </button>
                <button
                  type="button"
                  onClick={() => setLocationScope('nearby')}
                  className={`py-2 px-2 text-center rounded-lg transition-all cursor-pointer ${
                    locationScope === 'nearby'
                      ? 'bg-white text-zinc-950 shadow-soft-xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  📍 Nearby Only
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                {locationScope === 'all'
                  ? 'Showing all devices & campus locations nationwide (Remote / Online).'
                  : `Constrained to ${maxDistance}km of ${currentLocation.neighborhood || currentLocation.city}.`}
              </p>
            </div>

            {/* Distance Slider (Only active if Nearby is chosen) */}
            {locationScope === 'nearby' && (
              <div className="space-y-2 pt-3 border-t border-zinc-100 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-800">Local Radius:</span>
                  <span className="font-bold text-indigo-700">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="2"
                  value={maxDistance}
                  onChange={(e) => {
                    setMaxDistance(Number(e.target.value));
                    onChangeRadiusKm(Number(e.target.value));
                  }}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
                />
              </div>
            )}

            {/* Price Range Slider */}
            <div className="space-y-2 pt-3 border-t border-zinc-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-800">Max Price / Budget:</span>
                <span className="font-bold text-indigo-700">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
              />
            </div>

            {/* Trust Assurance Badge */}
            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs space-y-1">
              <span className="font-bold text-indigo-950 block">🔒 Escrow Services Protection</span>
              <p className="text-[11px] text-indigo-800/90 leading-relaxed">
                Your payment is safely held in an audited escrow account until you review and approve the completed task.
              </p>
            </div>
          </div>

          {/* Right Content Area: Either Services or Requests */}
          <div className="lg:col-span-9 min-w-0 space-y-4">
            
            {/* Results Count & Sort Dropdown */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600">
                Showing{' '}
                <strong className="text-zinc-950 font-bold">
                  {activeTab === 'services' ? filteredServices.length : filteredRequests.length}
                </strong>{' '}
                {activeTab === 'services' ? 'services' : 'task requests'} available
              </span>

              {activeTab === 'services' && (
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-white border border-zinc-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="distance">Distance: Closest</option>
                  <option value="rating">Rating: Highest</option>
                </select>
              )}
            </div>

            {/* TAB 1: SERVICES LIST */}
            {activeTab === 'services' && (
              filteredServices.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-zinc-200/80 shadow-2xs space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
                    💼
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-zinc-900">
                      No services match your current filters
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto">
                      Try selecting "All Locations" or reset your category to see all campus skills.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setLocationScope('all');
                        onCategoryChange('All');
                        setMaxPrice(5000);
                        onSearchChange('');
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-soft cursor-pointer"
                    >
                      Show All Locations & Gigs
                    </button>
                    {onOpenPostService && (
                      <button
                        onClick={onOpenPostService}
                        className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-soft cursor-pointer"
                      >
                        List a Skill Now
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filteredServices.map((service, idx) => {
                    const isFav = Boolean(favorites[service.id]);
                    const photo = service.coverImage || getServicePhoto(service.category, idx);
                    const isClose = (service.distanceKm || 0) < 15;

                    return (
                      <div
                        key={service.id}
                        onClick={() => onSelectService(service)}
                        className="clay-card-interactive overflow-hidden flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
                      >
                        {/* High-Resolution Cover Photo */}
                        <div className="h-44 w-full relative bg-zinc-100 overflow-hidden">
                          <img
                            src={photo}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                          
                          {/* Category Tag */}
                          <div className="absolute top-3 left-3">
                            <span className="text-[10px] font-bold text-white bg-black/65 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                              {service.category}
                            </span>
                          </div>

                          {/* Favorite Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(service.id, e)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full clay-badge-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-soft-xs"
                            title="Save to favorites"
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-zinc-600'}`} />
                          </button>

                          {/* Price Tag on Photo */}
                          <div className="absolute bottom-3 left-3">
                            <span className="text-xs sm:text-sm font-black text-white clay-button-primary px-3 py-1 shadow-md">
                              ₹{service.price}{service.pricingType === 'hourly' || service.price < 500 ? '/hr' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-zinc-950 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                              {service.title}
                            </h3>
                            <p className="text-xs text-zinc-500 line-clamp-2">
                              {service.description}
                            </p>
                          </div>

                          {/* Distance & Rating */}
                          <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                              <span className="font-bold text-zinc-900">{service.rating?.toFixed(1) || '5.0'}</span>
                              <span>({service.reviewCount || 0})</span>
                            </div>
                            <span>·</span>
                            <span className="font-medium text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded-md text-[11px]">
                              {isClose ? `📍 ${service.distanceKm?.toFixed(1)} km away` : `🌐 ${service.location?.neighborhood || service.location?.city || 'Online / Remote'}`}
                            </span>
                          </div>

                          {/* Provider Footer */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (service.provider) onOpenPublicProfile(service.provider);
                            }}
                            className="flex items-center justify-between pt-2 border-t border-zinc-100 hover:opacity-80"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={service.provider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={service.provider?.name || 'Student'}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-200"
                              />
                              <div className="text-left">
                                <span className="text-xs font-bold text-zinc-800 block leading-tight">
                                  {service.provider?.name || 'Student Seller'}
                                </span>
                                {service.provider?.studentUniversity && (
                                  <span className="text-[10px] text-indigo-700 font-semibold block leading-tight truncate max-w-[120px]">
                                    {service.provider.studentUniversity}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (service.provider) {
                                  onOpenMessageWithUser(service.provider, service);
                                } else {
                                  onSelectService(service);
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer shrink-0"
                            >
                              Message
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* TAB 2: TASK REQUESTS LIST */}
            {activeTab === 'requests' && (
              filteredRequests.length === 0 ? (
                <div className="clay-card p-10 sm:p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl clay-card-soft text-purple-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                    📋
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-zinc-900">
                      No task requests posted yet
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto">
                      Need help with an assignment, design, code fix, or errand? Post a task request and nearby student helpers will reach out.
                    </p>
                  </div>
                  {onOpenPostRequest && (
                    <button
                      onClick={onOpenPostRequest}
                      className="px-6 py-3 clay-button-primary text-xs font-black cursor-pointer"
                    >
                      Post a Task Needed Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className="clay-card-interactive p-5 sm:p-6 space-y-3 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                            {req.category}
                          </span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            ₹{req.budget} Escrow
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-950">
                          {req.title}
                        </h3>

                        <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                          {req.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={req.requesterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={req.requesterName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="text-left">
                            <span className="text-xs font-bold text-zinc-900 block leading-tight">
                              {req.requesterName}
                            </span>
                            <span className="text-[10px] text-zinc-500 block leading-tight">
                              {req.requesterLocation?.neighborhood || 'Campus Area'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {onDeleteRequest && (
                            <button
                              onClick={() => onDeleteRequest(req.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const pseudoUser: UserProfile = {
                                id: req.requesterId,
                                userId: req.requesterId,
                                name: req.requesterName,
                                email: 'contact@neighborly.in',
                                avatar: req.requesterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                                location: req.requesterLocation || currentLocation,
                                authProvider: 'password',
                                verified: true,
                                role: 'user',
                                tasksCompleted: 0,
                                rating: 5.0,
                                reviewCount: 0,
                                joinedDate: 'Member',
                              };
                              onOpenMessageWithUser(pseudoUser);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-soft transition-all cursor-pointer"
                          >
                            Help With Task
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
