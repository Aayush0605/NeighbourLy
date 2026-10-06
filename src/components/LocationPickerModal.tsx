import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  Sliders, 
  Building,
  Target
} from 'lucide-react';
import { LocationPoint } from '../types';
import { POPULAR_LOCATIONS, detectBrowserLocation } from '../utils/location';
import { NeighborLyLogo } from './NeighborLyLogo';

interface LocationPickerModalProps {
  currentLocation: LocationPoint;
  onSelectLocation: (location: LocationPoint) => void;
  radiusKm: number;
  onChangeRadiusKm: (radius: number) => void;
  isWorkFromCurrentLocation: boolean;
  onToggleWorkFromCurrentLocation: (enabled: boolean) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  currentLocation,
  onSelectLocation,
  radiusKm,
  onChangeRadiusKm,
  isWorkFromCurrentLocation,
  onToggleWorkFromCurrentLocation,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [customAddress, setCustomAddress] = useState('');

  // Handle GPS detection
  const handleDetectGPS = async () => {
    setIsDetecting(true);
    try {
      const detected = await detectBrowserLocation();
      onSelectLocation(detected);
      onToggleWorkFromCurrentLocation(true);
      onClose();
    } catch (e) {
      console.error('Error detecting location', e);
    } finally {
      setIsDetecting(false);
    }
  };

  const filteredPreset = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress.trim()) return;

    const parts = customAddress.split(',');
    const neighborhood = parts[0]?.trim() || 'Custom Neighborhood';
    const city = parts[1]?.trim() || 'Local City';

    onSelectLocation({
      lat: currentLocation.lat + (Math.random() - 0.5) * 0.05,
      lng: currentLocation.lng + (Math.random() - 0.5) * 0.05,
      neighborhood,
      city,
      address: customAddress.trim(),
    });
    onClose();
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-soft-xl border border-zinc-200/90 overflow-hidden my-0 sm:my-auto flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <NeighborLyLogo size="xs" variant="icon" />
              <h2 className="text-base sm:text-lg font-heading font-extrabold text-zinc-950">
                Set Your Neighborhood
              </h2>
            </div>
            <p className="text-xs text-zinc-500">
              Discover vetted local skills within walking or driving distance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto">
          
          {/* Action 1: Instant GPS Detection */}
          <button
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-soft hover:shadow-soft-md flex items-center justify-center gap-2.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Detecting GPS Coordinates...' : 'Detect My Current GPS Location'}</span>
          </button>

          {/* Action 2: Radius Slider */}
          <div className="bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-zinc-950">Active Radius</span>
              </div>
              <span className="text-xs font-extrabold text-zinc-950 bg-white px-2.5 py-1 rounded-lg border border-zinc-200 tabular-nums">
                {radiusKm} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={radiusKm}
              onChange={(e) => onChangeRadiusKm(Number(e.target.value))}
              className="w-full accent-zinc-950 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
              <span>1 km (walking)</span>
              <span>10 km (neighborhood)</span>
              <span>25 km (city-wide)</span>
            </div>
          </div>

          {/* Action 3: Popular Neighborhood Presets */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-950 block">
              Quick Pick Neighborhood
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {filteredPreset.slice(0, 6).map((loc) => {
                const isSelected = currentLocation.neighborhood === loc.neighborhood;
                return (
                  <button
                    key={loc.neighborhood}
                    onClick={() => {
                      onSelectLocation(loc);
                      onToggleWorkFromCurrentLocation(true);
                      onClose();
                    }}
                    className={`p-3 text-left rounded-2xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-soft'
                        : 'border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold line-clamp-1">{loc.neighborhood}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {loc.city}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action 4: Custom Address Form */}
          <form onSubmit={handleApplyCustom} className="space-y-3 pt-4 border-t border-zinc-100">
            <label className="text-xs font-bold text-zinc-950 block">Or Type Custom Area</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="e.g. Sector 62, Noida or Whitefield, Bangalore"
                className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                Set
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
