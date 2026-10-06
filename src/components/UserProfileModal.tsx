import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Upload,
  ScanLine,
  Eye,
  EyeOff,
  KeyRound,
  RotateCw,
  Mail,
  Camera
} from 'lucide-react';
import { UserProfile, TrustBadgeType, Order } from '../types';
import { 
  calculateTrustScore, 
  getTrustTier, 
  BADGE_DEFINITIONS, 
  computeTrustBadges 
} from '../utils/trustScore';
import { NeighborLyLogo } from './NeighborLyLogo';
import { CollegeAutocompleteInput } from './CollegeAutocompleteInput';
import { ProfileReviewsSection } from './ProfileReviewsSection';
import { canUserReviewProfile } from '../services/reviewService';
import { 
  validateStudentIdText, 
  verifyRollNumberFromCardImage, 
  CardRollVerificationResult 
} from '../utils/studentIdValidator';
import {
  changeUserPassword,
  sendPasswordResetOtp,
  resetPasswordWithOtp,
  sendStudentEmailOtp,
  verifyStudentEmailOtp,
  checkStudentIdAvailability,
  claimStudentId
} from '../services/authService';

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

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'security' | 'badges' | 'reviews'>('overview');
  
  // Phone verification state
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneNumberInput, setPhoneNumberInput] = useState(user.phoneNumber || '+91 98765 43210');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp' | 'done'>('input');

  // Student verification state: Choice of Email OTP or Roll No ID Card Photo
  const [isVerifyingStudent, setIsVerifyingStudent] = useState(false);
  const [studentMethod, setStudentMethod] = useState<'email_otp' | 'roll_card_photo'>('email_otp');
  const [universityInput, setUniversityInput] = useState(user.studentUniversity || 'PCTE Group of Institutes, Ludhiana');
  const [degreeInput, setDegreeInput] = useState(user.studentMajor || 'B.Tech Computer Science');
  const [studentEmailInput, setStudentEmailInput] = useState(user.email || '');
  const [rollNumberInput, setRollNumberInput] = useState(user.studentId || 'PCTE-2024-884');
  
  // Email OTP state for student verification
  const [studentEmailOtpSent, setStudentEmailOtpSent] = useState(false);
  const [studentEmailOtp, setStudentEmailOtp] = useState('');
  const [studentEmailPreviewOtp, setStudentEmailPreviewOtp] = useState<string | null>(null);
  const [isSendingStudentOtp, setIsSendingStudentOtp] = useState(false);

  // Roll No ID Card Photo state
  const [studentCardImage, setStudentCardImage] = useState<string | null>(null);
  const [cardVerificationResult, setCardVerificationResult] = useState<CardRollVerificationResult | null>(null);
  const [isValidatingCard, setIsValidatingCard] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Password & Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  // In-profile Forgot Password state
  const [isProfileForgot, setIsProfileForgot] = useState(false);
  const [profileForgotStep, setProfileForgotStep] = useState<'send' | 'verify'>('send');
  const [profileForgotOtp, setProfileForgotOtp] = useState('');
  const [profileForgotPreviewOtp, setProfileForgotPreviewOtp] = useState<string | null>(null);
  const [profileForgotNewPass, setProfileForgotNewPass] = useState('');
  const [profileForgotConfirmPass, setProfileForgotConfirmPass] = useState('');
  const [isSendingProfileForgot, setIsSendingProfileForgot] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  // Handle Send Student Email OTP
  const handleSendStudentEmailOtp = async () => {
    if (!studentEmailInput.trim()) {
      setValidationError('Please enter your college email address.');
      return;
    }
    setIsSendingStudentOtp(true);
    setValidationError('');
    try {
      const res = await sendStudentEmailOtp(studentEmailInput, rollNumberInput);
      if (res.success) {
        setStudentEmailPreviewOtp(res.previewCode || null);
        setStudentEmailOtpSent(true);
        if (showToast) showToast(`OTP code sent to ${studentEmailInput}`);
      } else {
        setValidationError(res.error || 'Failed to dispatch email OTP.');
      }
    } catch {
      setValidationError('Network error sending student OTP.');
    } finally {
      setIsSendingStudentOtp(false);
    }
  };

  // Handle Student ID Card Image Upload & Roll Number verification
  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!rollNumberInput.trim()) {
      setValidationError('Please enter your student roll number first to match against the card photo.');
      return;
    }

    setIsValidatingCard(true);
    setValidationError('');

    try {
      const reader = new FileReader();
      reader.onload = async (readEv) => {
        const dataUrl = readEv.target?.result as string;
        setStudentCardImage(dataUrl);

        const result = await verifyRollNumberFromCardImage(rollNumberInput, dataUrl);
        setCardVerificationResult(result);

        if (!result.success) {
          setValidationError(result.reason);
        } else {
          setValidationError('');
        }
        setIsValidatingCard(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setValidationError('Failed to inspect student ID card photo.');
      setIsValidatingCard(false);
    }
  };

  // Handle Complete Student Verification (Checks: one ID per user, verifies chosen method)
  const handleVerifyStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanRollNo = rollNumberInput.trim().toUpperCase();
    if (!cleanRollNo) {
      setValidationError('Please enter your college roll number.');
      return;
    }

    // 1. Enforce: One ID can only be used once per user
    const avail = await checkStudentIdAvailability(cleanRollNo, user.id);
    if (!avail.available) {
      setValidationError(avail.error || 'This student roll number is already claimed by another user. One ID can only be used once.');
      return;
    }

    // Method A: Email OTP verification
    if (studentMethod === 'email_otp') {
      if (!studentEmailOtpSent) {
        await handleSendStudentEmailOtp();
        return;
      }
      if (studentEmailOtp.trim().length !== 6) {
        setValidationError('Please enter the 6-digit OTP code sent to your email.');
        return;
      }

      const res = await verifyStudentEmailOtp(studentEmailInput, studentEmailOtp);
      if (!res.success) {
        setValidationError(res.error || 'Invalid OTP code.');
        return;
      }
    } else {
      // Method B: Roll No & Clear ID Card photo verification
      if (!studentCardImage || !cardVerificationResult?.success) {
        setValidationError('Please upload a clear photo of your student ID card where your roll number is readable.');
        return;
      }
    }

    // Claim the ID
    await claimStudentId(cleanRollNo, user.id, studentEmailInput, universityInput);

    const updated: UserProfile = {
      ...user,
      studentVerified: true,
      studentUniversity: universityInput,
      studentMajor: degreeInput,
      studentId: cleanRollNo,
      verificationMethod: studentMethod === 'email_otp' ? 'email_otp' : 'id_card_roll_no',
      trustScore: calculateTrustScore({ ...user, studentVerified: true }),
    };

    if (onUpdateUser) onUpdateUser(updated);
    if (showToast) showToast('🎓 Verified Student Badge Awarded! +15 Trust Points');
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
    if (showToast) showToast('🛡️ ID Verified Badge Awarded! +15 Trust Points');
  };

  // Handle In-Profile Password Update
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMessage('');
    setPasswordSuccessMessage('');

    if (newPassword.trim().length < 6) {
      setPasswordErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword.trim() !== confirmNewPassword.trim()) {
      setPasswordErrorMessage('New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changeUserPassword(user.email, currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccessMessage('✓ Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordErrorMessage(res.error || 'Failed to update password. Please check your current password.');
      }
    } catch {
      setPasswordErrorMessage('Could not update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle In-Profile Forgot Password Flow
  const handleProfileSendResetOtp = async () => {
    setIsSendingProfileForgot(true);
    setPasswordErrorMessage('');
    try {
      const res = await sendPasswordResetOtp(user.email);
      if (res.success) {
        setProfileForgotPreviewOtp(res.previewCode || null);
        setProfileForgotStep('verify');
        setPasswordSuccessMessage(`Reset code sent to ${user.email}`);
      } else {
        setPasswordErrorMessage(res.error || 'Failed to send reset code.');
      }
    } catch {
      setPasswordErrorMessage('Failed to send reset code.');
    } finally {
      setIsSendingProfileForgot(false);
    }
  };

  const handleProfileResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMessage('');
    if (profileForgotOtp.trim().length !== 6) {
      setPasswordErrorMessage('Please enter the 6-digit reset code.');
      return;
    }
    if (profileForgotNewPass.trim().length < 6) {
      setPasswordErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (profileForgotNewPass.trim() !== profileForgotConfirmPass.trim()) {
      setPasswordErrorMessage('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await resetPasswordWithOtp(user.email, profileForgotOtp, profileForgotNewPass);
      if (res.success) {
        setPasswordSuccessMessage('✓ Password reset successfully!');
        setIsProfileForgot(false);
        setProfileForgotStep('send');
        setProfileForgotOtp('');
        setProfileForgotNewPass('');
        setProfileForgotConfirmPass('');
      } else {
        setPasswordErrorMessage(res.error || 'Failed to reset password.');
      }
    } catch {
      setPasswordErrorMessage('Failed to reset password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-5 sm:p-7 shrink-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-cyan-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Prominent Working Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/15 rounded-full transition-colors cursor-pointer z-20"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
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

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
                  {user.name}
                </h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tier.badgeBg}`}>
                  {tier.label}
                </span>
                {user.studentVerified && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    🎓 Verified Student
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-2">
                <span className="font-mono">@{user.userId}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  {user.location?.neighborhood || 'Campus'}, {user.location?.city || 'Local'}
                </span>
                <span>·</span>
                <span>{user.joinedDate || 'Member'}</span>
              </p>

              {user.studentUniversity && (
                <p className="text-xs text-purple-300 flex items-center justify-center sm:justify-start gap-1 font-medium">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{user.studentUniversity} {user.studentId ? `(${user.studentId})` : ''}</span>
                </p>
              )}
            </div>
          </div>
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
            Trust Score
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
          {isCurrentUser && (
            <button
              onClick={() => setActiveTab('verifications')}
              className={`py-3 px-3 sm:px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'verifications'
                  ? 'border-indigo-600 text-indigo-950 font-black'
                  : 'border-transparent hover:text-zinc-950'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Verify ID & Badges</span>
            </button>
          )}
          {isCurrentUser && (
            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-3 sm:px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-zinc-950 text-zinc-950 font-black'
                  : 'border-transparent hover:text-zinc-950'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-zinc-600" />
              <span>Password & Security</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 sm:px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-zinc-950 text-zinc-950 font-black'
                : 'border-transparent hover:text-zinc-950'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Reviews ({user.reviewCount || 0})</span>
          </button>
        </div>

        {/* Scrollable Tab Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: Trust Score Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700">NeighborLy Trust Score</span>
                  <span className="text-sm font-black text-indigo-600">{score}/100</span>
                </div>
                <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500" 
                    style={{ width: `${score}%` }} 
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Scores 90+ unlock instant booking privileges, lower platform fees, and top placement in search.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Tasks Done</span>
                  <span className="text-base font-black text-zinc-950">{user.tasksCompleted || 0}</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Rating</span>
                  <span className="text-base font-black text-amber-600 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{user.rating?.toFixed(1) || '5.0'}</span>
                  </span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Escrow Held</span>
                  <span className="text-base font-black text-emerald-600">100%</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Student ID</span>
                  <span className="text-base font-black text-purple-600">{user.studentVerified ? 'Verified ✓' : 'Pending'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Verified Badges */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(BADGE_DEFINITIONS).map((b) => {
                const isEarned = activeBadges.includes(b.type);
                return (
                  <div
                    key={b.type}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
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
          )}

          {/* TAB 3: Verify Credentials (Only for logged-in user) */}
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
                  <form onSubmit={handleVerifyStudentSubmit} className="pt-3 border-t border-purple-200/80 space-y-3.5">
                    <CollegeAutocompleteInput
                      value={universityInput}
                      onChange={(val) => setUniversityInput(val)}
                      currentCity={user.location?.city || 'Ludhiana'}
                      label="University / College"
                      placeholder="Type college name (e.g. PCTE, PAU, DU, IIT)..."
                      helperText="Type 'PC' to find PCTE Ludhiana or your campus"
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-purple-900 mb-1">College Email ID</label>
                        <input
                          type="email"
                          required
                          value={studentEmailInput}
                          onChange={(e) => setStudentEmailInput(e.target.value)}
                          placeholder="student@college.edu"
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-purple-200 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-purple-900 mb-1">
                          Student Roll / ID Number
                        </label>
                        <input
                          type="text"
                          required
                          value={rollNumberInput}
                          onChange={(e) => {
                            setRollNumberInput(e.target.value);
                            setCardVerificationResult(null);
                            setValidationError('');
                          }}
                          placeholder="e.g. PCTE-2024-884 or 2104598"
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-purple-200 focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Method Choice: Verify 1 of 2 */}
                    <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-950">
                          Verify 1 of 2 Methods:
                        </span>
                        <span className="text-[10px] text-purple-700 font-semibold">Take both, verify only 1</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setStudentMethod('email_otp')}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            studentMethod === 'email_otp'
                              ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-soft-xs'
                              : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold text-xs">
                            <Mail className="w-3.5 h-3.5 text-purple-600" />
                            <span>1. Email OTP</span>
                          </div>
                          <p className="text-[10px] text-zinc-500">6-digit code to email</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStudentMethod('roll_card_photo')}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            studentMethod === 'roll_card_photo'
                              ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-soft-xs'
                              : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold text-xs">
                            <ScanLine className="w-3.5 h-3.5 text-purple-600" />
                            <span>2. ID Card Photo</span>
                          </div>
                          <p className="text-[10px] text-zinc-500">Verify roll no from card</p>
                        </button>
                      </div>

                      {/* SUB-FLOW A: Email OTP */}
                      {studentMethod === 'email_otp' && (
                        <div className="p-2.5 bg-purple-50/60 rounded-xl space-y-2">
                          {!studentEmailOtpSent ? (
                            <button
                              type="button"
                              onClick={handleSendStudentEmailOtp}
                              disabled={isSendingStudentOtp}
                              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {isSendingStudentOtp ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                              <span>Send Verification OTP to Email</span>
                            </button>
                          ) : (
                            <div className="space-y-2">
                              {studentEmailPreviewOtp && (
                                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between text-xs">
                                  <span>OTP Code: <strong>{studentEmailPreviewOtp}</strong></span>
                                  <button
                                    type="button"
                                    onClick={() => setStudentEmailOtp(studentEmailPreviewOtp)}
                                    className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[11px] font-bold"
                                  >
                                    Fill Code
                                  </button>
                                </div>
                              )}
                              <input
                                type="text"
                                maxLength={6}
                                value={studentEmailOtp}
                                onChange={(e) => setStudentEmailOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP code"
                                className="w-full px-3 py-2 text-xs bg-white border border-purple-200 rounded-lg text-center font-mono font-bold"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUB-FLOW B: ID Card Photo */}
                      {studentMethod === 'roll_card_photo' && (
                        <div className="p-2.5 bg-purple-50/60 rounded-xl space-y-2">
                          <label className="flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-purple-300 hover:border-purple-500 rounded-xl bg-white text-xs text-purple-700 font-bold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isValidatingCard ? 'Verifying Card Image...' : studentCardImage ? 'Replace ID Card Photo' : 'Upload Clear College ID Card Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCardImageUpload}
                              className="hidden"
                            />
                          </label>

                          {studentCardImage && (
                            <div className="flex items-center gap-2">
                              <img src={studentCardImage} alt="ID preview" className="w-12 h-10 object-cover rounded border border-purple-300" />
                              <div className="text-[11px]">
                                {cardVerificationResult?.success ? (
                                  <span className="text-emerald-700 font-bold">✓ Clear photo verified · Roll No confirmed</span>
                                ) : (
                                  <span className="text-rose-600 font-medium">{cardVerificationResult?.reason || 'Checking...'}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {validationError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{validationError}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isValidatingCard || isSendingStudentOtp}
                        className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-soft-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Confirm & Unlock Student Badge (+15 Pts)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsVerifyingStudent(false);
                          setValidationError('');
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-white text-zinc-700 text-xs font-bold border border-zinc-200 hover:bg-zinc-50 cursor-pointer"
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
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">Enter 4-Digit Code</label>
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
                            Confirm (+10 Pts)
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

          {/* TAB 4: Password & Security (Convenient password changing & resetting) */}
          {activeTab === 'security' && isCurrentUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">Password & Account Security</h4>
                  <p className="text-xs text-zinc-500">Manage your password or reset via email verification</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileForgot(!isProfileForgot)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  {isProfileForgot ? 'Back to Change Password' : 'Forgot Password?'}
                </button>
              </div>

              {passwordSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccessMessage}</span>
                </div>
              )}

              {passwordErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordErrorMessage}</span>
                </div>
              )}

              {/* FLOW 1: Standard Change Password */}
              {!isProfileForgot ? (
                <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Current Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-10 py-2 bg-white border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-10 py-2 bg-white border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-10 py-2 bg-white border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-soft-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    <span>Update Password</span>
                  </button>
                </form>
              ) : (
                /* FLOW 2: Reset Password via Email OTP */
                <div className="space-y-3.5 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>Reset Password via Email OTP ({user.email})</span>
                  </div>

                  {profileForgotStep === 'send' ? (
                    <button
                      type="button"
                      onClick={handleProfileSendResetOtp}
                      disabled={isSendingProfileForgot}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      {isSendingProfileForgot ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                      <span>Send Password Reset OTP Code</span>
                    </button>
                  ) : (
                    <form onSubmit={handleProfileResetSubmit} className="space-y-3">
                      {profileForgotPreviewOtp && (
                        <div className="p-2 bg-white border border-indigo-200 rounded-lg flex items-center justify-between text-xs">
                          <span>Reset Code: <strong>{profileForgotPreviewOtp}</strong></span>
                          <button
                            type="button"
                            onClick={() => setProfileForgotOtp(profileForgotPreviewOtp)}
                            className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[11px] font-bold"
                          >
                            Fill Code
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">6-Digit Reset Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={profileForgotOtp}
                          onChange={(e) => setProfileForgotOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono font-bold text-center"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">New Password</label>
                        <input
                          type="password"
                          required
                          value={profileForgotNewPass}
                          onChange={(e) => setProfileForgotNewPass(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={profileForgotConfirmPass}
                          onChange={(e) => setProfileForgotConfirmPass(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                      >
                        {isUpdatingPassword ? 'Updating...' : 'Set New Password'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Verified Reviews */}
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
            <span>Escrow Protected · Verified micro-skills marketplace</span>
          </div>
          <button
            type="button"
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
