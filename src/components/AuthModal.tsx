import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { UserProfile, LocationPoint } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';
import { authenticateUser, authenticateWithGoogle } from '../services/authService';
import { CollegeAutocompleteInput } from './CollegeAutocompleteInput';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultMode?: 'login' | 'signup';
  currentLocation: LocationPoint;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultMode = 'login',
  currentLocation,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'neighbor'>('student');
  const [university, setUniversity] = useState('PCTE Group of Institutes, Ludhiana');
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Sync mode whenever defaultMode prop changes
  React.useEffect(() => {
    setMode(defaultMode);
    setErrorMessage('');
  }, [defaultMode]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const user = await authenticateWithGoogle(currentLocation, role === 'student' ? 'user' : 'user');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Please provide your email/username and password.');
      return;
    }

    try {
      const userRole = (cleanEmail === 'admin' || cleanEmail === 'admin@neighborly.in') ? 'admin' : 'user';
      const user = await authenticateUser(
        cleanEmail,
        cleanPass,
        name.trim() || cleanEmail.split('@')[0],
        currentLocation,
        userRole
      );
      if (role === 'student' && university) {
        user.studentVerified = true;
        user.studentUniversity = university;
      }
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200/90 relative overflow-hidden space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Aurora Background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-2 relative z-10">
          <div className="flex justify-center mb-2">
            <NeighborLyLogo size="lg" variant="full" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-zinc-950">
            {mode === 'login' ? 'Welcome Back!' : 'Create Your Profile'}
          </h2>
          <p className="text-xs text-zinc-500">
            {mode === 'login' 
              ? 'Connect with verified students and neighbors on your street.' 
              : 'Join your campus & neighborhood micro-skills marketplace.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-zinc-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-zinc-950 shadow-soft-xs' : 'text-zinc-500'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-white text-zinc-950 shadow-soft-xs' : 'text-zinc-500'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full py-3 px-4 bg-white hover:bg-zinc-50 active:scale-[0.99] border border-zinc-200/90 rounded-2xl text-xs sm:text-sm font-bold text-zinc-800 shadow-2xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>
            {isGoogleLoading
              ? 'Connecting to Google...'
              : mode === 'login'
              ? 'Continue with Google'
              : 'Sign Up with Google'}
          </span>
        </button>

        {/* Divider */}
        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-zinc-200"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            or continue with email
          </span>
          <div className="flex-grow border-t border-zinc-200"></div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Your Name</label>
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

              {/* Role selector */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      role === 'student'
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                    }`}
                  >
                    <span>🎓 College Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('neighbor')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      role === 'neighbor'
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                    }`}
                  >
                    <span>🏡 Resident / Neighbor</span>
                  </button>
                </div>
              </div>

              {role === 'student' && (
                <div>
                  <CollegeAutocompleteInput
                    value={university}
                    onChange={(val) => setUniversity(val)}
                    currentCity={currentLocation?.city || 'Ludhiana'}
                    label="University / College"
                    placeholder="Type college name (e.g. PCTE, PAU, DU, IIT)..."
                    helperText="Type 'PC' to instantly suggest PCTE Ludhiana or your nearby colleges"
                  />
                </div>
              )}
            </>
          )}

          {/* Email / Username */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@college.edu (or 'admin')"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            {email.toLowerCase().includes('admin') && (
              <span className="text-[10px] text-purple-700 font-semibold block mt-1">
                🛡️ Master Admin mode will unlock upon signing in with admin credentials.
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{mode === 'login' ? 'Sign In to NeighborLy' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
