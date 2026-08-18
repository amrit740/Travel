import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield, User as UserIcon, AlertCircle, Copy, Check, Info } from 'lucide-react';
import { TravelWiseLogo } from '../components/common/TravelWiseLogo';
import { useAuth } from '../contexts/AuthContext';
import { checkIsAdmin, PRIMARY_ADMIN_UID } from '../lib/adminService';
import { auth } from '../lib/firebase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signInWithGoogle, logout } = useAuth();

  const [mode, setMode] = useState<'traveler' | 'admin'>('traveler');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const copyDomainToClipboard = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      if (mode === 'admin') {
        const currentUid = auth.currentUser?.uid;
        const isAdmin = checkIsAdmin(currentUid);
        if (!isAdmin) {
          logout();
          setError(
            `Access Denied: Your account does not have administrator privileges for the TravelWise Control Center.`
          );
          setIsGoogleLoading(false);
          return;
        }
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      if (err.message !== 'Sign-in popup was closed.') {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email.trim(), password);

      // Verify role if logging in via admin mode
      if (mode === 'admin') {
        const currentUid = auth.currentUser?.uid;
        const isAdmin = checkIsAdmin(currentUid);
        if (!isAdmin) {
          logout();
          setError(
            `Access Denied: Your account does not have administrator privileges for the TravelWise Control Center.`
          );
          setIsLoading(false);
          return;
        }
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('auth/invalid-credential') || msg.includes('invalid-credential') || msg.includes('user-not-found')) {
        setError(
          'Incorrect email or password. If you are registering for the first time, please click "Join TravelWise" below.'
        );
      } else if (msg.includes('auth/wrong-password')) {
        setError('Incorrect password. Please verify your password and try again.');
      } else if (msg.includes('auth/too-many-requests')) {
        setError('Access temporarily disabled due to many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#f8fafc]/60">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#e2e8f0] p-8 sm:p-10 shadow-lg space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <TravelWiseLogo variant="full" size="md" />
          <p className="text-xs text-[#64748b] max-w-xs">
            {mode === 'admin'
              ? 'Authorized TravelWise Administrator Control Center'
              : 'Sign in to access your curated journeys, saved spots, and concierge tools'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 p-1 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => {
              setMode('traveler');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'traveler'
                ? 'bg-[#0f172a] text-[#f8fafc] shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Traveler Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'admin'
                ? 'bg-[#0f172a] text-[#E5C365] shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Admin Portal</span>
          </button>
        </div>

        {error && (
          error.includes('Domain not authorized') || error.includes('unauthorized-domain') ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl space-y-2.5">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950">Firebase Domain Authorization Required</p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    To use Google Sign-In, add this app's preview domain to your Firebase Console under{' '}
                    <span className="font-semibold">Authentication &gt; Settings &gt; Authorized domains</span>.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-2 bg-white/90 border border-amber-200/80 rounded-xl">
                <code className="text-[11px] font-mono text-amber-900 truncate select-all">{currentHostname}</code>
                <button
                  type="button"
                  onClick={copyDomainToClipboard}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Copied!' : 'Copy Domain'}</span>
                </button>
              </div>
              <p className="text-[10px] text-amber-700">
                You can also sign in directly using your email and password below.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-medium leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )
        )}

        {/* Continue with Google Option */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 px-4 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#0f172a] font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-xs hover:border-[#cbd5e1] disabled:opacity-50"
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
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#e2e8f0] w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">
              or with email
            </span>
            <div className="border-t border-[#e2e8f0] w-full" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
              {mode === 'admin' ? 'Administrator Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'admin' ? 'admin@travelwise.ai' : 'traveler@example.com'}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e2e8f0] focus:border-[#0f172a] text-xs font-semibold text-[#0f172a] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e2e8f0] focus:border-[#0f172a] text-xs font-semibold text-[#0f172a] outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-[#f8fafc] font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
              mode === 'admin'
                ? 'bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] shadow-[#0f172a]/20'
                : 'bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] shadow-[#0f172a]/20'
            }`}
          >
            <span>
              {isLoading
                ? mode === 'admin'
                  ? 'Authenticating Administrator...'
                  : 'Signing In...'
                : mode === 'admin'
                ? 'Access Admin Control Center'
                : 'Sign In to TravelWise'}
            </span>
            <ArrowRight className="w-4 h-4 text-[#C59B27]" />
          </button>
        </form>

        <div className="pt-2 border-t border-[#e2e8f0]/60 text-center">
          <p className="text-xs text-[#64748b]">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-[#0f172a] hover:underline">
              Join TravelWise for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
