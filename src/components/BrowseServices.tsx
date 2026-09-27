import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Heart, 
  Clock, 
  Star, 
  Flame, 
  ShieldCheck, 
  RotateCcw, 
  SlidersHorizontal,
  Navigation,
  Target,
  PlusCircle,
  Briefcase
} from 'lucide-react';
import { ServiceListing, ServiceCategory, LocationPoint } from '../types';
import { calculateDistanceKm } from '../utils/location';

interface BrowseServicesProps {
  services: ServiceListing[];
  currentLocation: LocationPoint;
  radiusKm: number;
  onChangeRadiusKm: (radius: number) => void;
  isWorkFromCurrentLocation: boolean;
  onToggleWorkFromCurrentLocation: (enabled: boolean) => void;
  onOpenLocationPicker: () => void;
  onSelectService: (service: ServiceListing) => void;
  onToggleSaveService: (serviceId: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPostService: () => void;
  onOpenPostRequest: () => void;
}

export const BrowseServices: React.FC<BrowseServicesProps> = ({
  services,
  currentLocation,
  radiusKm,
  onChangeRadiusKm,
  isWorkFromCurrentLocation,
  onToggleWorkFromCurrentLocation,
  onOpenLocationPicker,
  onSelectService,
  onToggleSaveService,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onOpenPostService,
  onOpenPostRequest,
}) => {
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [selectedTurnaround, setSelectedTurnaround] = useState<string>('any');
  const [sortBy, setSortBy] = useState<'distance' | 'price_asc' | 'rating'>('distance');

  const categoryPills = [
    { label: 'All', value: 'All' },
    { label: 'Home & Repairs', value: 'Home & Repairs' },
    { label: 'Tech & Digital', value: 'Tech & Digital' },
    { label: 'Creative & Design', value: 'Creative & Design' },
    { label: 'Lessons & Tutoring', value: 'Lessons & Tutoring' },
    { label: 'Pet Care', value: 'Pet Care' },
    { label: 'Errands & Delivery', value: 'Errands & Delivery' },
  ];

  const handleResetFilters = () => {
    onCategoryChange('All');
    onSearchChange('');
    setMaxPrice(3000);
    setSelectedTurnaround('any');
    setSortBy('distance');
    onChangeRadiusKm(10);
  };

  // Filter services and compute distance
  const filteredServices = useMemo(() => {
    return services
      .map((s) => {
        const dist = s.location
          ? calculateDistanceKm(
              currentLocation.lat,
              currentLocation.lng,
              s.location.lat,
              s.location.lng
            )
          : 0;
        return {
          ...s,
          distanceKm: dist,
        };
      })
      .filter((service) => {
        // Category filter
        if (selectedCategory !== 'All' && service.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchesTitle = service.title.toLowerCase().includes(q);
          const matchesCat = service.category.toLowerCase().includes(q);
          const matchesDesc = service.description.toLowerCase().includes(q);
          const matchesSkills = service.skills.some((sk) => sk.toLowerCase().includes(q));
          if (!matchesTitle && !matchesCat && !matchesDesc && !matchesSkills) {
            return false;
          }
        }

        // Work from current location distance filter
        if (isWorkFromCurrentLocation && (service.distanceKm || 0) > radiusKm) {
          return false;
        }

        // Price filter
        if (service.price > maxPrice) {
          return false;
        }

        // Turnaround
        if (selectedTurnaround === 'today' && service.deliveryDays > 0) {
          return false;
        }
        if (selectedTurnaround === '24h' && service.deliveryDays > 1) {
          return false;
        }
        if (selectedTurnaround === '3d' && service.deliveryDays > 3) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return (a.distanceKm || 0) - (b.distanceKm || 0);
        }
        if (sortBy === 'price_asc') {
          return a.price - b.price;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [
    services,
    currentLocation,
    radiusKm,
    isWorkFromCurrentLocation,
    selectedCategory,
    searchQuery,
    maxPrice,
    selectedTurnaround,
    sortBy,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
              Browse Neighborhood Services
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find skilled neighbors offering fixed-rate help near{' '}
              <strong className="text-slate-800">{currentLocation.neighborhood}, {currentLocation.city}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="distance">Sort: Nearest Distance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Integrated Search & Location Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 gap-2">
          <div className="flex items-center flex-1 px-3 py-1">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search services (e.g. Wi-Fi repair, PPT, painting, tutoring, dog walking)..."
              className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Location Trigger */}
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-left">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="max-w-[160px] truncate">{currentLocation.neighborhood}</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.2 rounded-full">
                {radiusKm}km
              </span>
            </div>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categoryPills.map((pill) => {
            const isActive = selectedCategory === pill.value;
            return (
              <button
                key={pill.value}
                onClick={() => onCategoryChange(pill.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid & Left Filter Rail */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Filter Rail */}
        <aside className="md:col-span-4 lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Filters</span>
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Work from Current Location toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Work from Location</span>
                </label>
                <button
                  type="button"
                  onClick={() => onToggleWorkFromCurrentLocation(!isWorkFromCurrentLocation)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    isWorkFromCurrentLocation ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isWorkFromCurrentLocation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Filters services within your designated travel radius ({radiusKm} km).
              </p>
            </div>

            {/* Travel Radius Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">Max Distance</label>
                <span className="font-bold text-emerald-700">{radiusKm} km</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[2, 5, 10, 25].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => onChangeRadiusKm(km)}
                    className={`py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      radiusKm === km
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {km}km
                  </button>
                ))}
              </div>
            </div>

            {/* Turnaround Filter */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800">Turnaround Speed</label>
              <div className="space-y-1.5 text-xs text-slate-600">
                {[
                  { id: 'any', label: 'Any Time' },
                  { id: 'today', label: 'Same Day (Hours)' },
                  { id: '24h', label: 'Within 24 Hours' },
                  { id: '3d', label: 'Within 3 Days' },
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    <input
                      type="radio"
                      name="turnaround"
                      checked={selectedTurnaround === option.id}
                      onChange={() => setSelectedTurnaround(option.id)}
                      className="text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">Max Price</label>
                <span className="font-bold text-slate-900 tabular-nums">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹100</span>
                <span>₹1,500</span>
                <span>₹3,000</span>
              </div>
            </div>

          </div>
        </aside>

        {/* Right Content Column */}
        <main className="md:col-span-8 lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              Showing <strong className="text-slate-900">{filteredServices.length}</strong> services nearby
            </span>
            {isWorkFromCurrentLocation && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Filtered within {radiusKm}km of {currentLocation.neighborhood}
              </span>
            )}
          </div>

          {/* Clean Empty State when no dummy data exists */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-heading font-black text-slate-900">
                  No services listed in this area yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Be the first neighbor in <strong>{currentLocation.neighborhood}</strong> to offer a skill, or post a request for what you need done.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onOpenPostService}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Offer the First Skill in Your Area</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenPostRequest}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Post a Task You Need Done</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => onSelectService(service)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Card Cover */}
                  <div className={`h-40 bg-gradient-to-br ${service.coverGradient} p-4 text-white flex flex-col justify-between relative`}>
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-bold uppercase bg-black/40 backdrop-blur-md px-2 py-0.5 rounded">
                        {service.category}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveService(service.id);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                          service.saved ? 'bg-rose-500 text-white' : 'bg-black/30 hover:bg-black/50 text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${service.saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="relative z-10">
                      <p className="text-xs font-black tracking-tight line-clamp-1">{service.title}</p>
                      <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{service.distanceKm} km away · {service.location?.neighborhood}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={service.provider.avatar}
                          alt={service.provider.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                            {service.provider.name}
                          </p>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            ★ {service.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-900 tabular-nums">
                          ₹{service.price}
                        </p>
                        <span className="text-[10px] text-slate-400 block">Fixed Rate</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
