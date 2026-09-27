import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Heart, 
  Clock, 
  Star, 
  RotateCcw, 
  SlidersHorizontal,
  Navigation,
  Target,
  Plus,
  Briefcase,
  CheckCircle2,
  X,
  ChevronDown,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ServiceListing, ServiceCategory, LocationPoint } from '../types';
import { calculateDistanceKm } from '../utils/location';
import { NeighborLyLogo } from './NeighborLyLogo';

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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  // Count active filters (for badge)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (maxPrice < 3000) count++;
    if (selectedTurnaround !== 'any') count++;
    if (radiusKm !== 10) count++;
    return count;
  }, [selectedCategory, maxPrice, selectedTurnaround, radiusKm]);

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
          distanceKm: Number(dist.toFixed(1)),
        };
      })
      .filter((service) => {
        // Distance Filter
        if (isWorkFromCurrentLocation && service.distanceKm !== undefined) {
          if (service.distanceKm > radiusKm) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== 'All' && service.category !== selectedCategory) {
          return false;
        }

        // Max Price
        if (service.price > maxPrice) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = service.title.toLowerCase().includes(q);
          const matchesCat = service.category.toLowerCase().includes(q);
          const matchesDesc = service.description.toLowerCase().includes(q);
          const matchesSkills = service.skills.some((sk: string) => sk.toLowerCase().includes(q));
          if (!matchesTitle && !matchesCat && !matchesDesc && !matchesSkills) {
            return false;
          }
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

  // Shared Filter Content (Used for desktop sidebar & mobile drawer)
  const renderFilterControls = () => (
    <div className="space-y-6">
      {/* Work from Current Location Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-950">Work from Location</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isWorkFromCurrentLocation}
              onChange={(e) => onToggleWorkFromCurrentLocation(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-950"></div>
          </label>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          {isWorkFromCurrentLocation
            ? `Only show services within ${radiusKm}km of ${currentLocation.neighborhood || 'your area'}`
            : 'Showing all services regardless of distance.'}
        </p>
      </div>

      {/* Radius Slider */}
      {isWorkFromCurrentLocation && (
        <div className="space-y-3 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-zinc-950">Search Radius</label>
            <span className="font-bold text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded-md tabular-nums">
              {radiusKm} km
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={radiusKm}
            onChange={(e) => onChangeRadiusKm(Number(e.target.value))}
            className="w-full accent-zinc-950 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
            <span>1 km</span>
            <span>15 km</span>
            <span>30 km</span>
          </div>
        </div>
      )}

      {/* Delivery / Turnaround Time */}
      <div className="space-y-3 pt-4 border-t border-zinc-100">
        <label className="text-xs font-bold text-zinc-950 block">Turnaround Speed</label>
        <div className="space-y-2 text-xs">
          {[
            { label: 'Any Turnaround', value: 'any' },
            { label: 'Same Day (Today)', value: 'today' },
            { label: 'Within 24 Hours', value: '24h' },
            { label: 'Under 3 Days', value: '3d' },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2.5 text-zinc-700 hover:text-zinc-950 cursor-pointer font-medium">
              <input
                type="radio"
                name="turnaround"
                value={option.value}
                checked={selectedTurnaround === option.value}
                onChange={() => setSelectedTurnaround(option.value)}
                className="accent-zinc-950 h-4 w-4"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3 pt-4 border-t border-zinc-100">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-zinc-950">Max Budget</label>
          <span className="font-bold text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded-md tabular-nums">
            ₹{maxPrice}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="3000"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-zinc-950 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
          <span>₹100</span>
          <span>₹1,500</span>
          <span>₹3,000</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      
      {/* Top Header & Search Bar */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-zinc-950 tracking-tight">
              Neighborhood Services
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Available near <strong className="text-zinc-900 font-semibold">{currentLocation.neighborhood}, {currentLocation.city}</strong>
            </p>
          </div>

          {/* Desktop Sort & Quick Actions */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2.5 bg-white border border-zinc-200/90 rounded-2xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950 cursor-pointer shadow-soft-xs"
            >
              <option value="distance">Sort: Nearest Distance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="rating">Top Rated Providers</option>
            </select>

            {/* Mobile Filter Button (opens bottom sheet) */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-3.5 py-2.5 bg-white border border-zinc-200/90 rounded-2xl text-xs font-semibold text-zinc-800 shadow-soft-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-zinc-950 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Integrated Search & Location Bar with larger radii */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-soft p-1.5 sm:p-2 gap-2">
          <div className="flex items-center flex-1 px-3 py-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search services (e.g. Wi-Fi setup, plumbing, tutor, pet care)..."
              className="w-full text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent focus:outline-none min-h-[38px]"
            />
          </div>

          <div className="h-6 w-px bg-zinc-200 hidden sm:block"></div>

          {/* Location Trigger */}
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center justify-between gap-2 px-3.5 py-2 bg-zinc-50 hover:bg-zinc-100/80 rounded-xl sm:rounded-2xl text-xs font-semibold text-zinc-700 transition-all shrink-0 cursor-pointer border border-zinc-200/70"
          >
            <div className="flex items-center gap-2 text-left">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="max-w-[130px] sm:max-w-[160px] truncate">{currentLocation.neighborhood}</span>
              <span className="text-[10px] text-zinc-600 bg-zinc-200/80 font-bold px-1.5 py-0.5 rounded-md">
                {radiusKm}km
              </span>
            </div>
          </button>
        </div>

        {/* Category Filter Tabs (Horizontal scroll with edge-to-edge mobile overflow) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {categoryPills.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-xl sm:rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-zinc-950 text-white shadow-soft'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/70 shadow-2xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Sidebar Filters (Desktop) + Services List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Filter Sidebar (Desktop only) */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-6 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-zinc-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">Filters</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {renderFilterControls()}
          </div>
        </aside>

        {/* Mobile Filter Drawer / Bottom Sheet */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200">
            <div 
              className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-soft-xl animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-900" />
                  <h3 className="text-base font-bold text-zinc-950">Filters & Distance</h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderFilterControls()}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs font-bold shadow-soft transition-colors cursor-pointer"
                >
                  Apply Filters ({filteredServices.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Content Column */}
        <main className="col-span-1 md:col-span-8 lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium px-1">
            <span>
              Showing <strong className="text-zinc-950 font-bold">{filteredServices.length}</strong> local services
            </span>
            {isWorkFromCurrentLocation && (
              <span className="text-zinc-700 bg-zinc-100/90 font-semibold px-2.5 py-1 rounded-lg text-[11px] border border-zinc-200/60">
                Within {radiusKm}km of {currentLocation.neighborhood}
              </span>
            )}
          </div>

          {/* Clean Empty State */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-zinc-200/80 space-y-5 shadow-soft">
              <div className="flex items-center justify-center">
                <NeighborLyLogo size="xl" variant="icon" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-heading font-extrabold text-zinc-950">
                  No services listed in this radius yet
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                  Be the first neighbor in <strong>{currentLocation.neighborhood}</strong> to offer a skill, or post a request for what you need done.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onOpenPostService}
                  className="w-full sm:w-auto px-5 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-soft hover:shadow-soft-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Offer a Skill in Your Area</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenPostRequest}
                  className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post a Task Request</span>
                </button>
              </div>
            </div>
          ) : (
            /* Responsive Grid with larger border radii & subtle depth */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => onSelectService(service)}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 hover:border-zinc-300 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Card Cover (Clean minimal card header with subtle gradient & brand watermark) */}
                  <div className="h-36 bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100 p-4 flex flex-col justify-between border-b border-zinc-100 relative overflow-hidden">
                    <NeighborLyLogo size="xl" variant="watermark" className="absolute -right-2 -bottom-2" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[11px] font-bold text-zinc-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-2xs border border-zinc-200/50">
                        {service.category}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveService(service.id);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          service.saved 
                            ? 'bg-rose-500 text-white shadow-soft' 
                            : 'bg-white/90 hover:bg-white text-zinc-400 hover:text-zinc-700 shadow-soft-xs'
                        }`}
                        title={service.saved ? 'Remove from saved' : 'Save service'}
                      >
                        <Heart className={`w-4 h-4 ${service.saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="relative z-10">
                      <p className="text-sm font-bold text-zinc-950 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {service.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-zinc-700">{service.distanceKm} km</span>
                        <span>· {service.location?.neighborhood}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-normal">
                      {service.description}
                    </p>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {service.skills.slice(0, 2).map((skill: string) => (
                        <span key={skill} className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                      {service.deliveryDays === 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          <span>Same Day</span>
                        </span>
                      )}
                    </div>

                    {/* Provider info & pricing (Fiverr / Freelancer style) */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={service.provider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={service.provider?.name || 'Provider'}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-200"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 text-xs truncate max-w-[95px]">
                            {service.provider?.name?.split(' ')[0] || 'Neighbor'}
                          </span>
                          <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-zinc-700">{service.rating.toFixed(1)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block font-medium">Starting at</span>
                        <span className="text-base font-extrabold font-heading text-zinc-950 tabular-nums">
                          ₹{service.price}
                        </span>
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
