import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  MapPin,
  Sparkles,
  Check
} from 'lucide-react';
import { UserProfile, LocationPoint } from '../types';
import { loginWithGoogle, loginWithCredentials, registerWithCredentials, resetUserPassword } from '../utils/auth';
import { loginAdmin } from '../utils/adminAuth';
import { NeighborLyLogo } from './NeighborLyLogo';
import { StudentMascot } from './StudentMascot';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onAdminSuccess?: () => void;
  currentLocation: LocationPoint;
  initialMode?: 'login' | 'signup' | 'forgot_password' | 'admin';
  isEmbeddedPage?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  onAdminSuccess,
  currentLocation,
  initialMode = 'login',
  isEmbeddedPage = false,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password' | 'admin'>(initialMode);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Admin form state
  const [adminIdentifier, setAdminIdentifier] = useState('admin@neighborly.in');
  const [adminPassword, setAdminPassword] = useState('admin');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Sign up form state
  const [signupName, setSignupName] = useState('');
  const [signupUserId, setSignupUserId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Password Reset state
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'success'>('request');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('841923');

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Google Auth
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithGoogle('aayushgupta0605@gmail.com', 'Aayush Gupta', undefined, currentLocation);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login Submit (with smart admin credential detection)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both your Email / User ID and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await loginWithCredentials(loginIdentifier, loginPassword);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      // Smart admin detection: check if credentials match the special administrator
      try {
        loginAdmin(loginIdentifier, loginPassword);
        if (onAdminSuccess) {
          onAdminSuccess();
        }
        onClose();
        return;
      } catch {
        // Not admin either
      }
      setErrorMessage(err.message || 'Invalid credentials. Please verify your details or reset your password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dedicated Admin Submit
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminIdentifier.trim() || !adminPassword.trim()) {
      setErrorMessage('Please enter both admin identifier and master key.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      loginAdmin(adminIdentifier, adminPassword);
      if (onAdminSuccess) {
        onAdminSuccess();
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Access denied. Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupUserId.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage('Please complete all registration fields.');
      return;
    }

    if (signupUserId.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await registerWithCredentials({
        name: signupName.trim(),
        userId: signupUserId.trim().toLowerCase().replace(/\s+/g, '_'),
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
        location: currentLocation,
      });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Account creation failed. User ID or Email might already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset Request
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      setErrorMessage('Please enter your registered email or username.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedCode(code);
      setResetStep('verify');
    }, 500);
  };

  // Handle Password Reset Confirm
  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.trim() !== simulatedCode) {
      setErrorMessage('Invalid 6-digit verification code. Please check and try again.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await resetUserPassword(resetIdentifier, newPassword);
      setResetStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-3xl glass-card border border-white/70 shadow-2xl backdrop-blur-2xl">
      
      {/* Ambient Glass Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none animate-float-1" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none animate-float-2" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none animate-float-3" />

      {/* Close button for modal */}
      {!isEmbeddedPage && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/70 hover:bg-white text-zinc-500 hover:text-zinc-900 backdrop-blur-md transition-all cursor-pointer shadow-soft-xs"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Side: Brand Glass Showcase with Modern Premium Aurora (Image 1 & Image 2) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 sm:p-10 bg-gradient-to-br from-[#120F26] via-[#090714] to-zinc-950 text-white relative overflow-hidden">
          {/* Luminous Ambient Aurora Glows */}
          <div className="absolute -top-16 -left-16 w-52 h-52 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 w-36 h-36 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Background 'N' watermark */}
          <div className="absolute -right-8 top-16 opacity-10 text-purple-400 pointer-events-none rotate-12 scale-125">
            <NeighborLyLogo size="2xl" variant="watermark" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <NeighborLyLogo size="lg" theme="dark" showTagline={true} tagline="Students Helping Students" />
            
            <div className="pt-4 space-y-3">
              <h3 className="text-2xl font-heading font-black leading-tight text-white">
                Learn · Earn · Grow, <br />
                <span className="text-purple-400">right on your campus.</span>
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Join thousands of students and neighbors exchanging assignment help, coding, tech fixes, tutoring, and local daily tasks.
              </p>
            </div>
          </div>

          {/* Student Mascot Speech Tip & Trust Highlights */}
          <div className="relative z-10 space-y-3 pt-4">
            <StudentMascot variant="speech" className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-md border border-white/10" />

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Escrow-Lite Protection</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Payment is held securely and only released when you approve the delivered task.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-4 text-[11px] text-zinc-500">
            <span>© 2026 Neighbourly Network · Privacy & Safety Assured</span>
          </div>
        </div>

        {/* Right Side: Glassmorphic Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white/85 backdrop-blur-xl">
          
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-zinc-200/60">
            <NeighborLyLogo size="md" showTagline={true} />
          </div>

          {/* Mode Tabs (Login / Sign Up / Admin Gateway) */}
          {mode !== 'forgot_password' && (
            <div className="flex items-center p-1 bg-zinc-100/90 rounded-2xl mb-6 max-w-sm border border-zinc-200/60">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                  mode === 'login'
                    ? 'bg-white text-zinc-950 shadow-soft-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                  mode === 'signup'
                    ? 'bg-white text-zinc-950 shadow-soft-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('admin');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                  mode === 'admin'
                    ? 'bg-zinc-950 text-white shadow-soft-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </button>
            </div>
          )}

          {/* Form Titles */}
          <div className="mb-5 space-y-1">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-950">
              {mode === 'login' && 'Welcome back, neighbor'}
              {mode === 'signup' && 'Create your free account'}
              {mode === 'forgot_password' && 'Reset account password'}
              {mode === 'admin' && 'Administrative Command Gateway'}
            </h2>
            <p className="text-xs text-zinc-500">
              {mode === 'login' && 'Enter your credentials to access orders, messages and listed skills.'}
              {mode === 'signup' && 'Connect with local neighbors to book gigs or earn by offering services.'}
              {mode === 'forgot_password' && 'Enter your email or username to regain access to your account.'}
              {mode === 'admin' && 'Restricted access for marketplace moderators and escrow officers.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Auth Button (prominent in inspired designs, hidden for admin) */}
          {mode !== 'forgot_password' && mode !== 'admin' && (
            <div className="space-y-4 mb-5">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-2xl text-xs sm:text-sm font-semibold text-zinc-800 shadow-soft-xs hover:shadow-soft flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-200/90 w-full" />
                <span className="bg-white/90 px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  or with email
                </span>
              </div>
            </div>
          )}

          {/* Form: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">Email or Username</label>
                <div className="relative flex items-center bg-zinc-50/90 border border-zinc-200/90 rounded-2xl px-3.5 py-2.5 focus-within:border-zinc-950 focus-within:bg-white transition-all shadow-2xs">
                  <User className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@email.com or username"
                    className="w-full text-xs sm:text-sm text-zinc-900 bg-transparent focus:outline-none placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center bg-zinc-50/90 border border-zinc-200/90 rounded-2xl px-3.5 py-2.5 focus-within:border-zinc-950 focus-within:bg-white transition-all shadow-2xs">
                  <Lock className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full text-xs sm:text-sm text-zinc-900 bg-transparent focus:outline-none placeholder:text-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-400 hover:text-zinc-700 ml-1 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me toggle */}
              <div className="flex items-center justify-between text-xs text-zinc-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                <span>{isLoading ? 'Signing In...' : 'Log In to Neighborly'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('admin');
                    setErrorMessage(null);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-700 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-3 h-3 text-amber-500" />
                  <span>Administrative Portal Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* Form: Admin Special Credentials */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-3.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-2xl text-xs space-y-1.5 shadow-soft-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Special Admin Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminIdentifier('admin@neighborly.in');
                      setAdminPassword('admin');
                    }}
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Quick Fill
                  </button>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between pt-0.5">
                  <span>Username: <strong className="text-white">admin</strong></span>
                  <span>Master Key: <strong className="text-white">admin</strong></span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">Admin Identifier or Email</label>
                <div className="relative flex items-center bg-zinc-50/90 border border-zinc-200/90 rounded-2xl px-3.5 py-2.5 focus-within:border-zinc-950 focus-within:bg-white shadow-2xs">
                  <User className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    placeholder="admin@neighborly.in or admin"
                    className="w-full text-xs sm:text-sm text-zinc-900 bg-transparent focus:outline-none placeholder:text-zinc-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">Administrator Master Key</label>
                <div className="relative flex items-center bg-zinc-50/90 border border-zinc-200/90 rounded-2xl px-3.5 py-2.5 focus-within:border-zinc-950 focus-within:bg-white shadow-2xs">
                  <Lock className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin master password"
                    className="w-full text-xs sm:text-sm text-zinc-900 bg-transparent focus:outline-none placeholder:text-zinc-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="text-zinc-400 hover:text-zinc-700 ml-1 p-0.5 cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft hover:shadow-soft-md mt-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isLoading ? 'Verifying Admin Gate...' : 'Authenticate to Command Center'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-900 font-medium cursor-pointer"
                >
                  ← Return to regular neighbor login
                </button>
              </div>
            </form>
          )}

          {/* Form: Sign Up */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-800">Full Name</label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 bg-zinc-50/90 border border-zinc-200/90 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-800">Neighborhood Username</label>
                  <div className="relative flex items-center bg-zinc-50/90 border border-zinc-200/90 rounded-2xl px-3.5 py-2.5 focus-within:border-zinc-950 focus-within:bg-white shadow-2xs">
                    <span className="text-zinc-400 text-xs font-mono mr-1">@</span>
                    <input
                      type="text"
                      required
                      value={signupUserId}
                      onChange={(e) => setSignupUserId(e.target.value)}
                      placeholder="priya_helper"
                      className="w-full text-xs sm:text-sm text-zinc-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">Email Address</label>
                <div className="relative flex items-center bg-zinc-50/90 border border-zinc-200/90 rounded-2xl px-3.5 py-2.5 focus-within:border-zinc-950 focus-within:bg-white shadow-2xs">
                  <Mail className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full text-xs sm:text-sm text-zinc-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">Create Password</label>
                <div className="relative flex items-center bg-zinc-50/90 border border-zinc-200/90 rounded-2xl px-3.5 py-2.5 focus-within:border-zinc-950 focus-within:bg-white shadow-2xs">
                  <Lock className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs sm:text-sm text-zinc-900 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-400 hover:text-zinc-700 ml-1 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-zinc-600">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 mt-0.5"
                  />
                  <span>
                    I agree to the <span className="font-semibold text-zinc-900">Community Safety Guidelines</span> and Escrow payment terms.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !agreeTerms}
                className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                <span>{isLoading ? 'Creating Account...' : 'Join Neighborly Network'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form: Forgot Password */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              {resetStep === 'request' && (
                <form onSubmit={handleResetRequest} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800">Your Email or Username</label>
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="name@email.com or username"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft"
                  >
                    <span>{isLoading ? 'Sending Code...' : 'Send Recovery Code'}</span>
                  </button>
                </form>
              )}

              {resetStep === 'verify' && (
                <form onSubmit={handleResetConfirm} className="space-y-4">
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                    <p className="font-bold">Recovery Code Generated</p>
                    <p className="text-[11px] text-blue-700">
                      Use code <strong className="font-mono text-zinc-950 font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200">{simulatedCode}</strong> to complete password reset.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800">6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 841923"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-center font-mono text-lg tracking-widest text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft"
                  >
                    <span>{isLoading ? 'Updating...' : 'Set New Password'}</span>
                  </button>
                </form>
              )}

              {resetStep === 'success' && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-950">Password Successfully Updated!</h3>
                  <p className="text-xs text-zinc-500">
                    You can now sign in using your updated credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setResetStep('request');
                      setErrorMessage(null);
                    }}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer shadow-soft"
                  >
                    Back to Log In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Switch Mode Footer */}
          <div className="pt-4 mt-2 border-t border-zinc-100 text-center text-xs text-zinc-600">
            {mode === 'login' && (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-zinc-950 hover:underline cursor-pointer ml-1"
                >
                  Create an account
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-zinc-950 hover:underline cursor-pointer ml-1"
                >
                  Log In
                </button>
              </p>
            )}
            {mode === 'admin' && (
              <p className="text-zinc-500 text-[11px]">
                Restricted to authorized Neighborly marketplace staff. Regular users{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-zinc-950 hover:underline cursor-pointer ml-1"
                >
                  Log In here
                </button>
              </p>
            )}
            {mode === 'forgot_password' && resetStep !== 'success' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
              >
                ← Back to Log In
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );

  if (isEmbeddedPage) {
    return (
      <div className="min-h-[85vh] py-10 sm:py-16 px-4 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {content}
    </div>
  );
};
