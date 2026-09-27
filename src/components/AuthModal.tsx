import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { UserProfile, LocationPoint } from '../types';
import { loginWithGoogle, loginWithCredentials, registerWithCredentials, resetUserPassword } from '../utils/auth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  currentLocation: LocationPoint;
  initialMode?: 'login' | 'signup' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  currentLocation,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up form state
  const [signupName, setSignupName] = useState('');
  const [signupUserId, setSignupUserId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Password Reset state
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'success'>('request');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('739214');

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Google Auth
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Simulate Google OAuth flow
      const profile = await loginWithGoogle(
        'aayushgupta0605@gmail.com',
        'Aayush Gupta',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        currentLocation
      );
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email/UserID Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithCredentials(loginIdentifier, loginPassword);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await registerWithCredentials({
        name: signupName,
        userId: signupUserId,
        email: signupEmail,
        password: signupPassword,
        location: currentLocation,
      });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check the inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset Request
  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier) return;
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedCode(code);
      setResetStep('verify');
    }, 800);
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-heading font-black tracking-tight text-slate-900">
              {mode === 'login' && 'Welcome to NeighborLy'}
              {mode === 'signup' && 'Join Your Neighborhood'}
              {mode === 'forgot_password' && 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login' && 'Log in to connect with neighbors and manage tasks'}
              {mode === 'signup' && 'Create your account to request or offer local skills'}
              {mode === 'forgot_password' && 'Recover access to your NeighborLy account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode 1 & 2: Login or Sign Up */}
          {mode !== 'forgot_password' && (
            <>
              {/* Google Auth Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 shadow-xs flex items-center justify-center gap-3 transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Or with email / user id
                </span>
              </div>
            </>
          )}

          {/* Form: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Email or User ID</label>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-600/30 focus-within:bg-white transition-all">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@email.com or username"
                    className="w-full text-xs sm:text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-600/30 focus-within:bg-white transition-all">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full text-xs sm:text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 ml-1 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Signing In...' : 'Log In to NeighborLy'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Form: Sign Up */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Full Name</label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">User ID / Handle</label>
                  <input
                    type="text"
                    required
                    value={signupUserId}
                    onChange={(e) => setSignupUserId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="maya_s"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Email Address</label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="maya@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Create Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Neighborhood location attached: <strong>{currentLocation.neighborhood}, {currentLocation.city}</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Creating Account...' : 'Create NeighborLy Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Form: Password Reset */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              {resetStep === 'request' && (
                <form onSubmit={handleResetRequest} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Enter your registered Email or User ID</label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        required
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        placeholder="your@email.com or username"
                        className="w-full text-xs sm:text-sm text-slate-900 bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    {isLoading ? 'Generating code...' : 'Send Password Reset Code'}
                  </button>
                </form>
              )}

              {resetStep === 'verify' && (
                <form onSubmit={handleResetConfirm} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <p className="font-bold">Verification code dispatched:</p>
                    <p className="text-sm font-mono font-black mt-1 tracking-widest text-emerald-700">
                      {simulatedCode}
                    </p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">(In production, this is emailed securely to your address)</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Enter 6-Digit Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 739214"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Set New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 6 chars)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    {isLoading ? 'Updating Password...' : 'Save New Password & Continue'}
                  </button>
                </form>
              )}

              {resetStep === 'success' && (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Password Reset Complete!</h3>
                  <p className="text-xs text-slate-500">
                    Your password has been securely updated. You can now log in with your new credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setResetStep('request');
                    }}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    Return to Log In
                  </button>
                </div>
              )}

              {resetStep !== 'success' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetStep('request');
                    setErrorMessage(null);
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  ← Back to Log In
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
