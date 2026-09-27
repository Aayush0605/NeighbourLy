import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Zap, 
  Check, 
  User, 
  MessageSquare
} from 'lucide-react';
import { ServiceListing, LocationPoint, UserProfile } from '../types';
import { calculateDistanceKm } from '../utils/location';

interface GigDetailModalProps {
  service: ServiceListing;
  currentLocation: LocationPoint;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
  onClose: () => void;
  onRequestOrder: (service: ServiceListing, withRush: boolean) => void;
  onToggleSave: (serviceId: string) => void;
}

export const GigDetailModal: React.FC<GigDetailModalProps> = ({
  service,
  currentLocation,
  currentUser,
  onRequireAuth,
  onClose,
  onRequestOrder,
  onToggleSave,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to services</span>
          </button>

          <button
            onClick={() => onToggleSave(service.id)}
            className={`p-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              service.saved
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${service.saved ? 'fill-current text-rose-500' : ''}`} />
            <span className="hidden sm:inline">{service.saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Cover & Details */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Visual Cover Header */}
              <div className={`rounded-3xl bg-gradient-to-br ${service.coverGradient} p-6 text-white min-h-[200px] flex flex-col justify-between shadow-md`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-md">
                    {service.category}
                  </span>
                  <span className="text-xs font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center gap-1 text-emerald-300">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{distanceKm} km from you</span>
                  </span>
                </div>

                <div className="my-3 space-y-1">
                  <h2 className="text-2xl font-heading font-black tracking-tight text-white leading-tight">
                    {service.title}
                  </h2>
                  <p className="text-xs text-white/80">
                    Offered in {service.location?.neighborhood}, {service.location?.city}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/70 border-t border-white/10 pt-2.5">
                  <span>★ {service.rating.toFixed(1)} Rating</span>
                  <span>{service.deliveryDays === 0 ? 'Same Day Help' : `${service.deliveryDays} Day Turnaround`}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">About This Neighborhood Service</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Skills tags */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Skills & Focus</h4>
                <div className="flex flex-wrap gap-1.5">
                  {service.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust Box */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>NeighborLy Protection Guarantees</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified Neighbor Profile</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Escrow Payment Safety</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Pricing & Order Action */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Provider Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={service.provider.avatar}
                    alt={service.provider.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{service.provider.name}</h4>
                    <p className="text-xs text-slate-500">{service.location?.neighborhood}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                      Local Neighbor
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "{service.provider.bio || 'Happy to help nearby neighbors with quality work!'}"
                </p>
              </div>

              {/* Purchase Module */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fixed Peer Rate</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-heading font-black text-slate-950 tabular-nums">
                      ₹{totalPrice}
                    </span>
                    <span className="text-xs text-slate-500">all-inclusive</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{isRushDelivery ? 'Fast Turnaround' : `${service.deliveryDays} Day Turnaround`}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    <span>{service.revisions} Revisions</span>
                  </div>
                </div>

                {/* Rush toggle if available */}
                {service.rushPrice && service.rushPrice > 0 && (
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-950 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Need it urgently?</span>
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Priority turnaround (+₹{service.rushPrice})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRushDelivery(!isRushDelivery)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isRushDelivery
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isRushDelivery ? 'Added' : '+ Add Rush'}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBookClick}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Request This Service (₹{totalPrice})</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Payment is held in Escrow-Lite until you confirm completion.
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
