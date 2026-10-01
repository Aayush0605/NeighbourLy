import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Heart, 
  Check, 
  User, 
  Lock,
  Star,
  Zap,
  X,
  MessageSquare
} from 'lucide-react';
import { ServiceListing, LocationPoint, UserProfile } from '../types';
import { calculateDistanceKm } from '../utils/location';
import { NeighborLyLogo } from './NeighborLyLogo';
import { TrustBadge } from './TrustBadge';
import { getServicePhoto } from '../utils/categoryImages';

interface GigDetailModalProps {
  service: ServiceListing;
  currentLocation: LocationPoint;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
  onClose: () => void;
  onRequestOrder: (service: ServiceListing, withRush: boolean) => void;
  onToggleSave: (serviceId: string) => void;
  onOpenMessage?: (provider: UserProfile, service: ServiceListing) => void;
}

export const GigDetailModal: React.FC<GigDetailModalProps> = ({
  service,
  currentLocation,
  currentUser,
  onRequireAuth,
  onClose,
  onRequestOrder,
  onToggleSave,
  onOpenMessage,
}) => {
  const [isRushDelivery, setIsRushDelivery] = useState(false);

  const distanceKm = service.location
    ? calculateDistanceKm(
        currentLocation.lat,
        currentLocation.lng,
        service.location.lat,
        service.location.lng
      )
    : 0;

  const totalPrice = isRushDelivery ? service.price + (service.rushPrice || 100) : service.price;

  const handleBookClick = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    onRequestOrder(service, isRushDelivery);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full shadow-soft-xl border border-zinc-200/90 overflow-hidden my-0 sm:my-auto flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to services</span>
            </button>
            <span className="hidden sm:inline text-zinc-300">|</span>
            <NeighborLyLogo size="xs" variant="badge" className="hidden sm:inline-flex" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(service.id)}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                service.saved
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-2xs'
              }`}
            >
              <Heart className={`w-4 h-4 ${service.saved ? 'fill-current text-rose-500' : ''}`} />
              <span className="hidden sm:inline">{service.saved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="sm:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body with generous vertical spacing */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          
          {/* Full-width High-Res Cover Photography */}
          <div className="w-full h-52 sm:h-64 rounded-3xl overflow-hidden relative shadow-soft-sm bg-zinc-100">
            <img
              src={service.coverImage || getServicePhoto(service.category)}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600/90 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                  {service.category}
                </span>
                <h3 className="text-lg sm:text-xl font-black font-heading mt-1 drop-shadow-md">
                  {service.title}
                </h3>
              </div>
              <span className="text-xl sm:text-2xl font-black drop-shadow-md">
                ₹{service.price}{service.pricingType === 'hourly' || service.price < 500 ? '/hr' : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Clean Service Header Info */}
              <div className="bg-zinc-50/80 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-soft-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 bg-white px-3 py-1 rounded-xl border border-zinc-200/80 shadow-2xs">
                    {service.category}
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{distanceKm.toFixed(1)} km away</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-950 tracking-tight leading-tight">
                    {service.title}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Located in {service.location?.neighborhood}, {service.location?.city}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-zinc-600 pt-3 border-t border-zinc-200/60">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <strong className="text-zinc-900 font-bold">{service.rating.toFixed(1)}</strong>
                    <span className="text-zinc-400">({service.reviewCount || 12} reviews)</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{service.deliveryDays === 0 ? 'Same Day Service' : `${service.deliveryDays} Day Turnaround`}</span>
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">About This Neighborhood Service</h3>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* Skills tags */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Skills & Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {service.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-zinc-100/90 text-zinc-700 text-xs font-medium rounded-xl border border-zinc-200/50">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust Box with larger radii */}
              <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Neighborly Protection Guarantees</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified neighbor identity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Escrow holds payment until done</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Pricing & Booking Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/90 shadow-soft-md space-y-6 sticky top-4">
                
                {/* Provider Card with Trust Badges */}
                <div className="space-y-3 pb-5 border-b border-zinc-100">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={service.provider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={service.provider?.name || 'Neighbor'}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-200"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-zinc-950">{service.provider?.name}</h4>
                        <TrustBadge user={service.provider} variant="compact" />
                      </div>
                      <p className="text-xs text-zinc-500">@{service.provider?.userId}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span>{service.provider?.location?.neighborhood || 'Current Neighborhood'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Trust Score & Verified Badges List */}
                  <div className="pt-2">
                    <TrustBadge user={service.provider} variant="badge-list" />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-600 font-medium">Standard Service Rate</span>
                    <span className="text-lg font-bold text-zinc-950 tabular-nums">₹{service.price}</span>
                  </div>

                  {service.rushPrice && (
                    <label className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200/90 bg-zinc-50/70 hover:bg-zinc-100/60 cursor-pointer transition-all text-xs">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isRushDelivery}
                          onChange={(e) => setIsRushDelivery(e.target.checked)}
                          className="accent-zinc-950 h-4 w-4 rounded"
                        />
                        <div>
                          <p className="font-bold text-zinc-950">Rush Delivery (Same Day)</p>
                          <p className="text-[10px] text-zinc-500">Priority neighbor scheduling</p>
                        </div>
                      </div>
                      <span className="font-bold text-zinc-900">+₹{service.rushPrice}</span>
                    </label>
                  )}

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-950">Total Escrow Amount</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Demo</span>
                      </div>
                      <p className="text-[10px] text-zinc-400">Simulated hold until you approve completion</p>
                    </div>
                    <span className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-950 tabular-nums">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleBookClick}
                    className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-soft hover:shadow-soft-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Book with Escrow-Lite (Demo)</span>
                  </button>

                  {onOpenMessage && service.provider && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenMessage(service.provider!, service);
                      }}
                      className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message Seller First</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-center text-zinc-400 leading-snug">
                  🛡️ Simulated demo payment held in Escrow-Lite and released only when you confirm the service is delivered.
                </p>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
