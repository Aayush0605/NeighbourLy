import React from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Award, 
  ExternalLink,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, ServiceListing, Order } from '../types';
import { getServicePhoto } from '../utils/categoryImages';
import { ProfileReviewsSection } from './ProfileReviewsSection';

interface PublicSellerModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  services?: ServiceListing[];
  onOpenMessage: (user: UserProfile) => void;
  onSelectService?: (service: ServiceListing) => void;
  currentUser?: UserProfile | null;
  orders?: Order[];
  onUpdateUser?: (updated: UserProfile) => void;
  showToast?: (msg: string) => void;
}

export const PublicSellerModal: React.FC<PublicSellerModalProps> = ({
  user,
  isOpen,
  onClose,
  services = [],
  onOpenMessage,
  onSelectService,
  currentUser = null,
  orders = [],
  onUpdateUser,
  showToast,
}) => {
  if (!isOpen) return null;

  const userServices = services.filter((s) => s.providerId === user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200/90 relative max-h-[90vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-start gap-4 pr-8">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-indigo-100 shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-black text-zinc-950">{user.name}</h2>
              {user.studentVerified && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  🎓 Student Verified
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{user.location?.neighborhood ? `${user.location.neighborhood}${user.location.city ? `, ${user.location.city}` : ''}` : 'Local Campus Area'}</span>
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs text-zinc-600">
              <span className="flex items-center gap-1 font-bold text-zinc-900">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{user.rating?.toFixed(1) || '5.0'} ({user.reviewCount || 0} reviews)</span>
              </span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">🛡️ {user.trustScore || 95} Trust</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-xs sm:text-sm text-zinc-700 leading-relaxed">
          {user.bio || 'Verified student offering quality peer skills with Escrow Services payment protection.'}
        </div>

        {/* University / Credentials */}
        {user.studentUniversity && (
          <div className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
            <span className="text-xl">🎓</span>
            <div>
              <p className="font-bold text-indigo-950">{user.studentUniversity}</p>
              <p className="text-indigo-700 text-[11px]">{user.studentMajor || 'College Student'}</p>
            </div>
          </div>
        )}

        {/* Portfolio Showcase with Photos & Offered Skills */}
        {user.portfolio && user.portfolio.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center justify-between">
              <span>Portfolio & Offered Skills ({user.portfolio.length})</span>
              <span className="text-[10px] text-indigo-600 font-semibold lowercase">click picture to view</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.portfolio.map((item) => (
                <div key={item.id} className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-2xs flex flex-col justify-between group">
                  <div>
                    <div className="h-32 w-full bg-zinc-100 overflow-hidden relative">
                      <img
                        src={item.imageUrl || getServicePhoto(item.category || 'Academic Support')}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {item.category && (
                        <span className="absolute top-2 left-2 text-[10px] font-bold text-indigo-950 bg-white/95 px-2 py-0.5 rounded-md shadow-2xs">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-1.5">
                      <h4 className="text-xs font-bold text-zinc-900">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-zinc-600 line-clamp-2">{item.description}</p>
                      )}
                      {item.offeredSkill && (
                        <div className="bg-amber-50 rounded-xl p-2 border border-amber-200/80 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-amber-950 truncate">
                            ⚡ Skill: {item.offeredSkill}
                          </span>
                          {item.startingPrice ? (
                            <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                              ₹{item.startingPrice}+
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenMessage(user);
                        onClose();
                      }}
                      className="w-full py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                    >
                      <span>Inquire / Hire for This</span>
                      <span className="text-[10px]">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Listed by this seller with Visual Preview */}
        {userServices.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Offered Services ({userServices.length})
            </h3>
            <div className="space-y-2.5">
              {userServices.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => {
                    if (onSelectService) onSelectService(s);
                    onClose();
                  }}
                  className="p-3 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200/90 shadow-2xs flex items-center gap-3 cursor-pointer transition-all group"
                >
                  <img
                    src={s.coverImage || getServicePhoto(s.category, idx)}
                    alt={s.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-950 group-hover:text-indigo-600 transition-colors truncate">
                      {s.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      ₹{s.price}{s.price < 500 ? '/hr' : ''} · {s.deliveryDays || 1} day delivery
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 hover:underline shrink-0">
                    View →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Reviews Section (Review unlocked only after completed task together) */}
        <div className="pt-2">
          <ProfileReviewsSection
            targetUser={user}
            currentUser={currentUser}
            orders={orders}
            onUpdateTargetUser={onUpdateUser}
            showToast={showToast}
          />
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-zinc-100 flex items-center gap-3">
          <button
            onClick={() => {
              onOpenMessage(user);
              onClose();
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-soft transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Message / Book</span>
          </button>
        </div>
      </div>
    </div>
  );
};
