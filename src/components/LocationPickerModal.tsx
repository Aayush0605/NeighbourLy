import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  Compass, 
  Sliders, 
  Building,
  Target
} from 'lucide-react';
import { LocationPoint } from '../types';
import { POPULAR_LOCATIONS, detectBrowserLocation } from '../utils/location';

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-heading font-black text-slate-900">Your Work & Task Location</h2>
              <p className="text-[11px] text-slate-500">Discover or offer local services near you</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Work From My Current Location Banner & GPS Detection Button */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>Work from My Current Location</span>
                </span>
                <p className="text-[11px] text-emerald-800">
                  Filter gigs and requests automatically within your travel radius
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => onToggleWorkFromCurrentLocation(!isWorkFromCurrentLocation)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  isWorkFromCurrentLocation ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    isWorkFromCurrentLocation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* GPS Trigger Button */}
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isDetecting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Detecting GPS Coordinates...' : 'Use My Exact Current Location (GPS)'}</span>
            </button>
          </div>

          {/* Travel Radius Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Travel / Service Radius</span>
              </label>
              <span className="font-bold text-emerald-700 font-mono">Within {radiusKm} km</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 5, 10, 25].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => onChangeRadiusKm(km)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    radiusKm === km
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>

          {/* Search or Enter Custom Neighborhood */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800">Or Select a Neighborhood / Area</label>
            
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search neighborhood or city (e.g. Indiranagar, Saket)"
                className="w-full text-xs sm:text-sm text-slate-900 bg-transparent focus:outline-none"
              />
            </div>

            {/* Popular Neighborhoods List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredPreset.map((loc, idx) => {
                const isSelected =
                  loc.neighborhood.toLowerCase() === currentLocation.neighborhood.toLowerCase() &&
                  loc.city.toLowerCase() === currentLocation.city.toLowerCase();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300 font-bold'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-xs font-bold">{loc.neighborhood}</p>
                        <p className="text-[10px] text-slate-400">{loc.city}, {loc.state}</p>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Address Input */}
          <form onSubmit={handleApplyCustom} className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-[11px] font-semibold text-slate-600">Enter custom street / landmark</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="e.g. 14th Cross, HSR Layout, Bengaluru"
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
