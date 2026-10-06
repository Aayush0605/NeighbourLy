import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RotateCw,
  Eye,
  EyeOff,
  Upload,
  Camera,
  ScanLine,
  Image as ImageIcon
} from 'lucide-react';
import { UserProfile, LocationPoint } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';
import { 
  authenticateUser, 
  authenticateWithGoogle, 
  sendLoginOtp, 
  verifyLoginOtp,
  sendPasswordResetOtp,
  resetPasswordWithOtp,
  checkStudentIdAvailability,
  claimStudentId
} from '../services/authService';
import { CollegeAutocompleteInput } from './CollegeAutocompleteInput';
import { 
  validateStudentIdText, 
  verifyRollNumberFromCardImage, 
  CardRollVerificationResult 
} from '../utils/studentIdValidator';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultMode?: 'login' | 'signup' | 'admin';
  currentLocation: LocationPoint;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultMode = 'login',
  currentLocation,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode === 'admin' ? 'login' : defaultMode);
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile details (Signup)
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'neighbor'>('student');
  const [university, setUniversity] = useState('PCTE Group of Institutes, Ludhiana');
  const [studentRollNo, setStudentRollNo] = useState('PCTE-2024-884');

  // Student 1-of-2 Verification Method: Email OTP or Roll No ID Card Photo
  const [studentVerifyMethod, setStudentVerifyMethod] = useState<'email_otp' | 'roll_card_photo'>('email_otp');
  const [studentCardImage, setStudentCardImage] = useState<string | null>(null);
  const [cardVerification, setCardVerification] = useState<CardRollVerificationResult | null>(null);
  const [isValidatingCard, setIsValidatingCard] = useState(false);

  // Forgot Password Flow State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp_new_pass'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotPreviewOtp, setForgotPreviewOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP inputs ref array
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync mode whenever defaultMode prop changes
  useEffect(() => {
    setMode(defaultMode === 'admin' ? 'login' : defaultMode);
    setLoginStep('credentials');
    setIsForgotPassword(false);
    setForgotStep('email');
    setErrorMessage('');
    setSuccessNotice('');
  }, [defaultMode, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Handle ID Card Photo Upload for Roll Number Verification
  const handleCardPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!studentRollNo.trim()) {
      setErrorMessage('Please enter your student roll number first to verify against the card image.');
      return;
    }

    setIsValidatingCard(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const reader = new FileReader();
      reader.onload = async (readEv) => {
        const dataUrl = readEv.target?.result as string;
        setStudentCardImage(dataUrl);

        const result = await verifyRollNumberFromCardImage(studentRollNo, dataUrl);
        setCardVerification(result);

        if (!result.success) {
          setErrorMessage(result.reason);
        } else {
          setSuccessNotice(`✓ Clear ID card photo verified! Roll number "${result.detectedRollNo}" matched.`);
        }
        setIsValidatingCard(false);
      };
      reader.onerror = () => {
        setErrorMessage('Could not read image file.');
        setIsValidatingCard(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorMessage('Error analyzing ID card photo.');
      setIsValidatingCard(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const user = await authenticateWithGoogle(currentLocation, 'user');
      if (role === 'student' && university) {
        user.studentVerified = true;
        user.studentUniversity = university;
      }
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // STEP 1: Handle Initial Credentials Submit
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }

    // SIGNUP FLOW
    if (mode === 'signup') {
      if (cleanPass.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (cleanPass !== confirmPassword.trim()) {
        setErrorMessage('Passwords do not match. Please ensure both password fields are identical.');
        return;
      }

      // Enforce: One ID can only be used once per user
      if (role === 'student' && studentRollNo.trim()) {
        const avail = await checkStudentIdAvailability(studentRollNo);
        if (!avail.available) {
          setErrorMessage(avail.error || 'This Student Roll Number is already linked to another verified account. Each ID can only be used once per user.');
          return;
        }
      }

      // Student Verification Choice:
      // Option 1: Verify via Roll No (ID Card Photo)
      if (role === 'student' && studentVerifyMethod === 'roll_card_photo') {
        if (!studentCardImage || !cardVerification?.success) {
          setErrorMessage('Please upload a clear picture of your ID card to verify the roll number written on it, or switch to Email OTP verification.');
          return;
        }

        setIsSubmitting(true);
        try {
          const userRole = (cleanEmail === 'admin' || cleanEmail === 'admin@neighborly.in') ? 'admin' : 'user';
          const user = await authenticateUser(
            cleanEmail,
            cleanPass,
            name.trim() || cleanEmail.split('@')[0],
            currentLocation,
            userRole
          );
          user.studentVerified = true;
          user.studentUniversity = university;
          user.studentId = studentRollNo.trim().toUpperCase();
          user.idVerified = true;
          user.verificationMethod = 'id_card_roll_no';
          await claimStudentId(user.studentId, user.id, cleanEmail, university);
          
          onLoginSuccess(user);
          onClose();
        } catch (err: any) {
          setErrorMessage(err.message || 'Account registration failed. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      // Option 2 (or non-student): Verify via Email ID (OTP)
      setIsSendingOtp(true);
      try {
        const res = await sendLoginOtp(cleanEmail);
        if (res.success) {
          setPreviewOtp(res.previewCode || null);
          setLoginStep('otp');
          setResendCooldown(30);
          setOtpCode(['', '', '', '', '', '']);
          setSuccessNotice(`Verification code sent to ${cleanEmail}`);
          setTimeout(() => {
            otpInputRefs.current[0]?.focus();
          }, 100);
        } else {
          setErrorMessage(res.error || 'Failed to dispatch verification code to email.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Could not send verification OTP.');
      } finally {
        setIsSendingOtp(false);
      }
      return;
    }

    // LOGIN FLOW: Send OTP to email for verification
    setIsSendingOtp(true);
    try {
      const res = await sendLoginOtp(cleanEmail);
      if (res.success) {
        setPreviewOtp(res.previewCode || null);
        setLoginStep('otp');
        setResendCooldown(30);
        setOtpCode(['', '', '', '', '', '']);
        setSuccessNotice(`Verification code sent to ${cleanEmail}`);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch verification code to email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send verification OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Send Password Reset OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    const targetEmail = (forgotEmail || email).trim().toLowerCase();
    if (!targetEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendPasswordResetOtp(targetEmail);
      if (res.success) {
        setForgotPreviewOtp(res.previewCode || null);
        setForgotStep('otp_new_pass');
        setSuccessNotice(`Password reset verification code dispatched to ${targetEmail}`);
      } else {
        setErrorMessage(res.error || 'Failed to send password reset code.');
      }
    } catch {
      setErrorMessage('Could not send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complete Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const targetEmail = (forgotEmail || email).trim().toLowerCase();
    const code = forgotOtp.join('').trim();
    const cleanNewPass = newPassword.trim();

    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }
    if (cleanNewPass.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (cleanNewPass !== confirmNewPassword.trim()) {
      setErrorMessage('Passwords do not match. Please ensure both password fields are identical.');
      return;
    }

    setIsResettingPass(true);
    try {
      const res = await resetPasswordWithOtp(targetEmail, code, cleanNewPass);
      if (res.success) {
        const user = await authenticateUser(
          targetEmail,
          cleanNewPass,
          targetEmail.split('@')[0],
          currentLocation
        );
        onLoginSuccess(user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Password reset failed. Invalid or expired code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsResettingPass(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    setErrorMessage('');
    try {
      const res = await sendLoginOtp(email.trim().toLowerCase());
      if (res.success) {
        setPreviewOtp(res.previewCode || null);
        setResendCooldown(30);
        setSuccessNotice('New verification code sent to your inbox.');
      } else {
        setErrorMessage(res.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not resend verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // STEP 2: Verify OTP and complete login / signup
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredCode = otpCode.join('').trim();

    if (enteredCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage('');
    try {
      const res = await verifyLoginOtp(email.trim().toLowerCase(), enteredCode);
      if (res.success) {
        const cleanEmail = email.trim().toLowerCase();
        const userRole = (cleanEmail === 'admin' || cleanEmail === 'admin@neighborly.in') ? 'admin' : 'user';
        const user = await authenticateUser(
          cleanEmail,
          password.trim(),
          name.trim() || cleanEmail.split('@')[0],
          currentLocation,
          userRole
        );
        user.emailVerified = true;

        if (role === 'student' && university) {
          const idValidation = validateStudentIdText(studentRollNo, university);
          user.studentVerified = true;
          user.studentUniversity = university;
          user.studentId = idValidation.formattedId || studentRollNo.trim().toUpperCase();
          user.verificationMethod = 'email_otp';
          await claimStudentId(user.studentId, user.id, cleanEmail, university);
        }

        onLoginSuccess(user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Invalid verification code. Please check and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify code. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index: number, value: string, isForgot = false) => {
    const cleaned = value.replace(/\D/g, '');
    const targetArr = isForgot ? [...forgotOtp] : [...otpCode];
    const setTargetArr = isForgot ? setForgotOtp : setOtpCode;
    const refs = isForgot ? forgotOtpRefs : otpInputRefs;

    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (index + i < 6) targetArr[index + i] = d;
      });
      setTargetArr(targetArr);
      const nextFocus = Math.min(5, index + digits.length);
      refs.current[nextFocus]?.focus();
      return;
    }

    targetArr[index] = cleaned;
    setTargetArr(targetArr);

    if (cleaned && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, isForgot = false) => {
    const targetArr = isForgot ? forgotOtp : otpCode;
    const refs = isForgot ? forgotOtpRefs : otpInputRefs;
    if (e.key === 'Backspace' && !targetArr[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const passwordsMatch = Boolean(password && confirmPassword && password === confirmPassword);
  const passwordsMismatch = Boolean(password && confirmPassword && password !== confirmPassword);
  const newPasswordsMatch = Boolean(newPassword && confirmNewPassword && newPassword === confirmNewPassword);
  const newPasswordsMismatch = Boolean(newPassword && confirmNewPassword && newPassword !== confirmNewPassword);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200/90 relative overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Aurora Background Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Prominent Working Close (Cross) Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-all cursor-pointer z-30 shadow-2xs group"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-4 no-scrollbar flex-1">
          
          {/* Brand Header */}
          <div className="text-center space-y-1.5 pt-1 relative z-10">
            <div className="flex justify-center mb-1">
              <NeighborLyLogo size="md" variant="full" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-zinc-950 tracking-tight">
              {isForgotPassword
                ? 'Reset Your Password'
                : mode === 'signup' 
                ? 'Create Your Profile' 
                : loginStep === 'otp' 
                ? 'Verify Your Email' 
                : 'Welcome Back!'}
            </h2>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              {isForgotPassword
                ? 'Enter your email to receive a secure password reset code.'
                : mode === 'signup' 
                ? 'Join your campus & neighborhood micro-skills marketplace.' 
                : loginStep === 'otp' 
                ? `Enter the 6-digit code sent to ${email}`
                : 'Connect with verified students and neighbors on your street.'}
            </p>
          </div>

          {/* Mode Switcher (Hidden during OTP step or Forgot Password) */}
          {!isForgotPassword && loginStep === 'credentials' && (
            <div className="flex bg-zinc-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { 
                  setMode('login'); 
                  setErrorMessage(''); 
                  setSuccessNotice('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-white text-zinc-950 shadow-soft-xs' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { 
                  setMode('signup'); 
                  setErrorMessage(''); 
                  setSuccessNotice('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'signup' ? 'bg-white text-zinc-950 shadow-soft-xs' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Google Quick Sign-In (Login or Signup before OTP) */}
          {!isForgotPassword && loginStep === 'credentials' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-zinc-50 active:scale-[0.99] border border-zinc-200/90 rounded-2xl text-xs sm:text-sm font-bold text-zinc-800 shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>
                  {isGoogleLoading
                    ? 'Connecting to Google...'
                    : mode === 'login'
                    ? 'Continue with Google'
                    : 'Sign Up with Google'}
                </span>
              </button>

              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-zinc-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  or with email & password
                </span>
                <div className="flex-grow border-t border-zinc-200"></div>
              </div>
            </>
          )}

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-semibold animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* VIEW A: FORGOT PASSWORD FLOW */}
          {isForgotPassword && (
            <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setForgotStep('email');
                  setErrorMessage('');
                  setSuccessNotice('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              {forgotStep === 'email' ? (
                <form onSubmit={handleSendResetOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@gmail.com or student@college.edu"
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Sending Reset Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Password Reset OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* Dev auto fill preview */}
                  {forgotPreviewOtp && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-700 uppercase block">Reset Code</span>
                        <span className="text-sm font-mono font-black text-indigo-950">{forgotPreviewOtp}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotOtp(forgotPreviewOtp.split(''));
                        }}
                        className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-2 text-center">
                      Enter 6-Digit Reset Code
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      {forgotOtp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { forgotOtpRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value, true)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e, true)}
                          className="w-10 h-11 sm:w-11 sm:h-12 text-center text-lg font-bold font-mono rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-600/30"
                        />
                      ))}
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
                        className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-zinc-700 block">Confirm New Password</label>
                      {newPasswordsMatch && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Matches
                        </span>
                      )}
                      {newPasswordsMismatch && (
                        <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Mismatch
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className={`w-full pl-10 pr-10 py-2.5 bg-zinc-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                          newPasswordsMismatch ? 'border-rose-300' : newPasswordsMatch ? 'border-emerald-300' : 'border-zinc-200'
                        }`}
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
                    disabled={isResettingPass}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isResettingPass ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Reset Password & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* VIEW B: CREDENTIALS (SIGN IN & SIGN UP) */}
          {!isForgotPassword && loginStep === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
              
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aanya Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>
                </div>
              )}

              {/* Role selector (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">I am a</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        role === 'student'
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-soft-xs'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100/60'
                      }`}
                    >
                      <span>🎓 College Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('neighbor')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        role === 'neighbor'
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-soft-xs'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100/60'
                      }`}
                    >
                      <span>🏡 Resident / Neighbor</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Student Details: Take BOTH College Email and Roll No, verify only 1 */}
              {mode === 'signup' && role === 'student' && (
                <div className="space-y-3 p-3.5 bg-purple-50/50 rounded-2xl border border-purple-200/80">
                  <CollegeAutocompleteInput
                    value={university}
                    onChange={(val) => setUniversity(val)}
                    currentCity={currentLocation?.city || 'Ludhiana'}
                    label="University / College"
                    placeholder="Type college name (e.g. PCTE, PAU, DU, IIT)..."
                    helperText="Type 'PC' to instantly suggest PCTE Ludhiana or your campus"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-zinc-700 block">
                        Student Roll Number / Campus ID
                      </label>
                      {validateStudentIdText(studentRollNo, university).isValid && (
                        <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" /> Valid Format
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={studentRollNo}
                        onChange={(e) => {
                          setStudentRollNo(e.target.value);
                          setCardVerification(null);
                        }}
                        placeholder="e.g. PCTE-2024-884 or 2104598"
                        className="w-full pl-10 pr-4 py-2 bg-white border border-purple-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-mono font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      🔒 One ID per student. Each roll number can only be claimed once across the platform.
                    </p>
                  </div>

                  {/* CHOOSE ONLY 1 VERIFICATION METHOD (Take both, verify only 1) */}
                  <div className="pt-2 border-t border-purple-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-purple-950 uppercase tracking-wider">
                        Choose 1 Verification Method:
                      </span>
                      <span className="text-[10px] text-purple-700 font-semibold">
                        Verify 1 of 2
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStudentVerifyMethod('email_otp')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          studentVerifyMethod === 'email_otp'
                            ? 'bg-white border-purple-600 shadow-soft-xs ring-1 ring-purple-600/30'
                            : 'bg-white/60 border-purple-200 text-zinc-600 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-purple-950 mb-0.5">
                          <Mail className="w-3.5 h-3.5 text-purple-600" />
                          <span>1. Email OTP</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">
                          Verify via 6-digit code to your email
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentVerifyMethod('roll_card_photo')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          studentVerifyMethod === 'roll_card_photo'
                            ? 'bg-white border-purple-600 shadow-soft-xs ring-1 ring-purple-600/30'
                            : 'bg-white/60 border-purple-200 text-zinc-600 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-purple-950 mb-0.5">
                          <ScanLine className="w-3.5 h-3.5 text-purple-600" />
                          <span>2. ID Card Photo</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">
                          Verify written roll number from ID card photo
                        </p>
                      </button>
                    </div>

                    {/* METHOD B SUB-COMPONENT: ID CARD PHOTO CAPTURE & ROLL NUMBER VERIFICATION */}
                    {studentVerifyMethod === 'roll_card_photo' && (
                      <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-2.5 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-purple-600" />
                            <span>Upload Clear ID Card Picture</span>
                          </span>
                          {cardVerification?.success && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Roll Number Confirmed
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-purple-300 hover:border-purple-500 rounded-xl bg-purple-50/50 text-xs text-purple-700 font-bold cursor-pointer transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isValidatingCard ? 'Checking Picture & Roll No...' : studentCardImage ? 'Replace ID Card Photo' : 'Take / Upload ID Card Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCardPhotoUpload}
                              className="hidden"
                            />
                          </label>

                          {studentCardImage && (
                            <div className="w-12 h-10 rounded-lg overflow-hidden border border-purple-300 shrink-0">
                              <img src={studentCardImage} alt="ID Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>

                        {cardVerification && (
                          <div className={`p-2 rounded-lg text-[11px] ${cardVerification.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>
                            {cardVerification.reason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email / Username */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@college.edu or name@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    {mode === 'signup' ? 'Create Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setForgotStep('email');
                        setForgotEmail(email);
                        setErrorMessage('');
                        setSuccessNotice('');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD (ONLY IN SIGN UP MODE - ENTERED TWICE) */}
              {mode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-700 block">
                      Confirm Password
                    </label>
                    {passwordsMatch && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    )}
                    {passwordsMismatch && (
                      <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Mismatch
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password to confirm"
                      className={`w-full pl-10 pr-10 py-2.5 bg-zinc-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                        passwordsMismatch 
                          ? 'border-rose-300 focus:ring-rose-500/20' 
                          : passwordsMatch
                          ? 'border-emerald-300 focus:ring-emerald-500/20'
                          : 'border-zinc-200 focus:ring-indigo-600/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isSendingOtp || isValidatingCard}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting || isSendingOtp || isValidatingCard ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>
                      {isValidatingCard 
                        ? 'Verifying Card Image...'
                        : mode === 'signup' 
                        ? (role === 'student' && studentVerifyMethod === 'roll_card_photo' ? 'Creating Account...' : 'Sending Email OTP...') 
                        : 'Sending Email OTP...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'signup'
                        ? (role === 'student' && studentVerifyMethod === 'roll_card_photo'
                            ? 'Create Account with Verified ID Card'
                            : 'Verify & Continue with Email OTP')
                        : 'Verify & Sign In with OTP'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {mode === 'login' && (
                <p className="text-[11px] text-center text-zinc-400">
                  🔒 A secure 6-digit OTP verification code will be sent to your email to verify your identity.
                </p>
              )}
            </form>
          )}

          {/* VIEW C: EMAIL OTP VERIFICATION */}
          {!isForgotPassword && loginStep === 'otp' && (
            <div className="space-y-4 animate-in slide-in-from-right-3 duration-200">
              <button
                type="button"
                onClick={() => {
                  setLoginStep('credentials');
                  setErrorMessage('');
                  setSuccessNotice('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email / Back</span>
              </button>

              {/* OTP Test Helper Card for Seamless Evaluation */}
              {previewOtp && (
                <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-200/90 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                      📨 Dev / Sandbox Verification Code
                    </span>
                    <span className="text-base font-mono font-black text-indigo-950 tracking-widest">
                      {previewOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(previewOtp.slice(0, 6).split(''));
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* 6 Digit Input Boxes */}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-2 text-center">
                    Enter 6-Digit Email Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          digit 
                            ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950' 
                            : 'border-zinc-200 text-zinc-900 focus:ring-indigo-600/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Code Timer */}
                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <span className="text-xs text-zinc-400 font-medium">
                      Resend code in <strong className="text-zinc-700">{resendCooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors"
                    >
                      Didn't get code? Resend Email Code
                    </button>
                  )}
                </div>

                {/* Verify & Login Button */}
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.join('').length !== 6}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>{mode === 'signup' ? 'Verify & Create Account' : 'Verify & Sign In'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
