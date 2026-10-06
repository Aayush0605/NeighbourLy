import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Star, 
  Clock, 
  Lock, 
  Smartphone, 
  GraduationCap, 
  FileCheck, 
  Award, 
  Zap, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { UserProfile, TrustBadgeType, Order } from '../types';
import { calculateTrustScore, 
  getTrustTier, 
  BADGE_DEFINITIONS, 
  computeTrustBadges 
} from '../utils/trustScore';
import { NeighborLyLogo } from './NeighborLyLogo';
import { CollegeAutocompleteInput } from './CollegeAutocompleteInput';
import { ProfileReviewsSection } from './ProfileReviewsSection';
import { canUserReviewProfile } from '../services/reviewService';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  isCurrentUser?: boolean;
  currentUser?: UserProfile | null;
  orders?: Order[];
  onUpdateUser?: (updated: UserProfile) => void;
  showToast?: (msg: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  isCurrentUser = false,
  currentUser = null,
  orders = [],
  onUpdateUser,
  showToast,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'badges' | 'reviews'>('overview');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneNumberInput, setPhoneNumberInput] = useState(user.phoneNumber || '+91 98765 43210');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp' | 'done'>('input');

  const [isVerifyingStudent, setIsVerifyingStudent] = useState(false);
  const [universityInput, setUniversityInput] = useState(user.studentUniversity || 'Indian Institute of Technology (IIT)');
  const [studentIdInput, setStudentIdInput] = useState(user.studentMajor || 'Computer Science & Engineering');

  const score = calculateTrustScore(user);
  const tier = getTrustTier(score);
  const activeBadges = computeTrustBadges(user);
  const reviewEligibility = !isCurrentUser && currentUser ? canUserReviewProfile(currentUser, user.id, orders) : { canReview: false, completedOrders: [] };

  // Handle Phone Verification
  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneStep === 'input') {
      setPhoneStep('otp');
    } else if (phoneStep === 'otp') {
      const updated: UserProfile = {
        ...user,
        phoneVerified: true,
        phoneNumber: phoneNumberInput,
        trustScore: calculateTrustScore({ ...user, phoneVerified: true }),
      };
      if (onUpdateUser) onUpdateUser(updated);
      setPhoneStep('done');
      setTimeout(() => {
        setIsVerifyingPhone(false);
        setPhoneStep('input');
      }, 1500);
    }
  };

  // Handle Student Verification
  const handleVerifyStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      studentVerified: true,
      studentUniversity: universityInput,
      studentMajor: studentIdInput,
      trustScore: calculateTrustScore({ ...user, studentVerified: true }),
    };
    if (onUpdateUser) onUpdateUser(updated);
    setIsVerifyingStudent(false);
  };

  // Handle Govt ID Verification
  const handleVerifyId = () => {
    const updated: UserProfile = {
      ...user,
      idVerified: true,
      trustScore: calculateTrustScore({ ...user, idVerified: true }),
    };
    if (onUpdateUser) onUpdateUser(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6 sm:p-7 shrink-0 overflow-hidden">
          {/* Subtle Ambient Aurora */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-cyan-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-10"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
            {/* Avatar with Trust Score Ring */}
            <div className="relative shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white/20 shadow-xl"
              />
              <div 
                className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1 border-2 border-zinc-950"
                style={{ backgroundColor: tier.color, color: '#ffffff' }}
                title={`Trust Score: ${score}/100`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{score}</span>
              </div>
            </div>

            {/* Profile Bio & Handle */}
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
                  {user.name}
                </h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tier.badgeBg}`}>
                  {tier.label}
                </span>
              </div>

              <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-2">
                <span className="font-mono">@{user.userId}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  {user.location?.neighborhood || 'Campus'}, {user.location?.city || 'Local'}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  Joined {user.joinedDate}
                </span>
              </p>

              <p className="text-xs text-zinc-300 leading-relaxed max-w-md pt-0.5">
                {user.bio || 'Verified NeighborLy community member providing trusted skills and tasks.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 mt-5 pt-4 border-t border-white/10 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="block font-black text-sm text-white">{user.tasksCompleted}</span>
              <span className="text-[10px] text-zinc-400">Completed</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="block font-black text-sm text-amber-300 flex items-center justify-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                {user.rating?.toFixed(1) || '5.0'}
              </span>
              <span className="text-[10px] text-zinc-400">{user.reviewCount} reviews</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="block font-black text-sm text-emerald-300">{user.onTimePercent ?? 100}%</span>
              <span className="text-[10px] text-zinc-400">On-Time</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="block font-black text-sm text-indigo-300">100%</span>
              <span className="text-[10px] text-zinc-400">Escrow Release</span>
            </div>
          </div>

          {/* Review Status Banner for other users' profiles */}
          {!isCurrentUser && (
            <div className="relative z-10 mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              {reviewEligibility.canReview ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="w-full py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
                >
                  <Star className="w-3.5 h-3.5 fill-zinc-950" />
                  <span>Write Review (Task Completed Together ✓)</span>
                </button>
              ) : (
                <div className="w-full py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-[11px] font-medium flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>Review option unlocks after completing a task together</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 px-4 sm:px-6 bg-zinc-50/70 text-xs font-bold text-zinc-600 shrink-0 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 sm:px-4 border-b-2 cursor-pointer transition-colors shrink-0 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-zinc-950 text-zinc-950 font-black'
                : 'border-transparent hover:text-zinc-950'
            }`}
          >
            Trust Score Breakdown
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`py-3 px-3 sm:px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'badges'
                ? 'border-zinc-950 text-zinc-950 font-black'
                : 'border-transparent hover:text-zinc-950'
            }`}
          >
            <span>Verified Badges</span>
            <span className="text-[10px] bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded-full font-mono">
              {activeBadges.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 sm:px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-zinc-950 text-zinc-950 font-black'
                : 'border-transparent hover:text-zinc-950'
            }`}
          >
            <span>Verified Reviews</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {user.reviewCount || 0}
            </span>
          </button>
          {isCurrentUser && (
            <button
              onClick={() => setActiveTab('verifications')}
              className={`py-3 px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'verifications'
                  ? 'border-purple-600 text-purple-700 font-black'
                  : 'border-transparent hover:text-purple-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Verify Credentials</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: Trust Score Breakdown */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Trust Meter Card */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-950">Neighborhood Trust Index</h4>
                      <p className="text-xs text-zinc-500">{tier.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-zinc-950">{score}</span>
                    <span className="text-xs text-zinc-400 font-bold">/100</span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, backgroundColor: tier.color }}
                  />
                </div>
              </div>

              {/* Three Pillar Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Trust Pillars Calculation
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Pillar 1: Identity & Verification */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                      <span className="flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-blue-600" />
                        <span>Identity Proof</span>
                      </span>
                      <span className="text-blue-600 font-mono">
                        {(user.emailVerified ? 10 : 0) + (user.phoneVerified ? 10 : 0) + (user.studentVerified ? 15 : 0) + (user.idVerified ? 15 : 0)} / 35
                      </span>
                    </div>
                    <ul className="text-[11px] text-zinc-500 space-y-1">
                      <li className="flex items-center justify-between">
                        <span>Email Confirmed</span>
                        <span className="text-emerald-600 font-bold">✓ +10</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Phone / OTP</span>
                        <span className={user.phoneVerified ? 'text-emerald-600 font-bold' : 'text-zinc-400'}>
                          {user.phoneVerified ? '✓ +10' : 'Pending'}
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Campus Student ID</span>
                        <span className={user.studentVerified ? 'text-purple-600 font-bold' : 'text-zinc-400'}>
                          {user.studentVerified ? '✓ +15' : 'Optional'}
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Govt / Resident ID</span>
                        <span className={user.idVerified ? 'text-blue-600 font-bold' : 'text-zinc-400'}>
                          {user.idVerified ? '✓ +15' : 'Optional'}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Pillar 2: Escrow & Task Record */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-indigo-600" />
                        <span>Escrow Track</span>
                      </span>
                      <span className="text-indigo-600 font-mono">
                        {Math.min((user.tasksCompleted || 0) * 5, 25) + 15} / 40
                      </span>
                    </div>
                    <ul className="text-[11px] text-zinc-500 space-y-1">
                      <li className="flex items-center justify-between">
                        <span>Tasks Completed</span>
                        <span className="font-bold text-zinc-800">{user.tasksCompleted}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>On-Time Rate</span>
                        <span className="font-bold text-emerald-600">{user.onTimePercent ?? 100}%</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Dispute-Free Rate</span>
                        <span className="font-bold text-indigo-600">100%</span>
                      </li>
                    </ul>
                  </div>

                  {/* Pillar 3: Peer Ratings */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>Reviews</span>
                      </span>
                      <span className="text-amber-600 font-mono">
                        {Math.min(user.reviewCount * 2, 10) + 15} / 25
                      </span>
                    </div>
                    <ul className="text-[11px] text-zinc-500 space-y-1">
                      <li className="flex items-center justify-between">
                        <span>Star Rating</span>
                        <span className="font-bold text-amber-600">★ {user.rating?.toFixed(1) || '5.0'}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Reviews Count</span>
                        <span className="font-bold text-zinc-800">{user.reviewCount} reviews</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Response Time</span>
                        <span className="font-bold text-zinc-800">&lt; 15 mins</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>

              {/* Skills Tag List */}
              {user.skills && user.skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Verified Skills & Gigs
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((skill, i) => (
                      <span key={i} className="text-xs font-semibold px-3 py-1 rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200/70">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Active Verified Badges */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                Badges earned through verified credentials, flawless escrow transactions, and positive community peer reviews.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(BADGE_DEFINITIONS).map((b) => {
                  const isEarned = activeBadges.includes(b.type);
                  return (
                    <div
                      key={b.type}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                        isEarned
                          ? `${b.bg} ${b.border} shadow-2xs`
                          : 'bg-zinc-50/50 border-zinc-200 opacity-50 grayscale'
                      }`}
                    >
                      <div className="text-2xl shrink-0 p-1.5 rounded-xl bg-white/80 shadow-2xs">
                        {b.icon}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold ${isEarned ? b.color : 'text-zinc-700'}`}>
                            {b.label}
                          </h5>
                          {isEarned && (
                            <span className="text-[10px] font-bold bg-white text-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 shadow-2xs">
                              Earned
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-600 leading-snug">
                          {b.tooltip}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Verify Credentials (Only for logged in user) */}
          {activeTab === 'verifications' && isCurrentUser && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                Enhance your Trust Score to 90+ to get hired 3x faster and unlock priority task bookings.
              </p>

              {/* Verify Student ID */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-purple-950">Campus Student ID Verification</h5>
                      <p className="text-[11px] text-purple-700">Earn the 🎓 Student Verified badge and +15 Trust points</p>
                    </div>
                  </div>
                  {user.studentVerified ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsVerifyingStudent(true)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Verify Now
                    </button>
                  )}
                </div>

                {isVerifyingStudent && (
                  <form onSubmit={handleVerifyStudent} className="pt-3 border-t border-purple-200/80 space-y-3">
                    <div>
                      <CollegeAutocompleteInput
                        value={universityInput}
                        onChange={(val) => setUniversityInput(val)}
                        currentCity={user.location?.city || 'Ludhiana'}
                        label="University / College"
                        placeholder="Type college name (e.g. PCTE, PAU, DU, IIT)..."
                        helperText="Type 'PC' to find PCTE Ludhiana or your local campus"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-purple-900 mb-1">Degree / Department</label>
                      <input
                        type="text"
                        required
                        value={studentIdInput}
                        onChange={(e) => setStudentIdInput(e.target.value)}
                        placeholder="e.g. B.Tech Computer Science"
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-purple-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Confirm Student Status (+15 Pts)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVerifyingStudent(false)}
                        className="px-3 py-2 rounded-xl bg-white text-zinc-700 text-xs font-bold border border-zinc-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Verify Phone Number */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-emerald-950">Mobile Phone Verification</h5>
                      <p className="text-[11px] text-emerald-700">Earn the 📱 Phone Verified badge and +10 Trust points</p>
                    </div>
                  </div>
                  {user.phoneVerified ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsVerifyingPhone(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Verify Phone
                    </button>
                  )}
                </div>

                {isVerifyingPhone && (
                  <form onSubmit={handleVerifyPhone} className="pt-3 border-t border-emerald-200/80 space-y-3">
                    {phoneStep === 'input' ? (
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">Phone Number</label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            required
                            value={phoneNumberInput}
                            onChange={(e) => setPhoneNumberInput(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-emerald-200 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Send OTP
                          </button>
                        </div>
                      </div>
                    ) : phoneStep === 'otp' ? (
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">Enter 4-Digit Verification Code</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            maxLength={4}
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value)}
                            placeholder="1234"
                            className="w-32 px-3 py-2 text-xs text-center font-mono font-bold bg-white rounded-xl border border-emerald-200 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Confirm Code (+10 Pts)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-emerald-700">✓ Phone successfully verified!</p>
                    )}
                  </form>
                )}
              </div>

              {/* Verify Govt ID */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-blue-950">Government / Resident ID</h5>
                    <p className="text-[11px] text-blue-700">Earn the 🛡️ ID Verified badge and +15 Trust points</p>
                  </div>
                </div>
                {user.idVerified ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <button
                    onClick={handleVerifyId}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Quick Verify
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: Verified Reviews (Only allowed after completing a task together) */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <ProfileReviewsSection
                targetUser={user}
                currentUser={currentUser}
                orders={orders}
                onUpdateTargetUser={onUpdateUser}
                showToast={showToast}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Escrow Protected · Bank-grade trust guarantee</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
