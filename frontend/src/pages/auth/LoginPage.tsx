import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight,
  CheckCircle2, Sparkles, UserCheck, Shield, HelpCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemoCitizen, loginAsDemoAdmin, user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('janaseva_remember_identifier') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Read redirect destination from query params e.g. /login?redirect=/citizen/applications
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') || (user?.role === 'admin' ? '/admin' : '/citizen/dashboard');

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/citizen/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your registered email or mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(identifier.trim(), password, rememberMe);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.message || 'Invalid credentials. Please verify your details.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoCitizen = async () => {
    setIdentifier('citizen@janaseva.gov.in');
    setPassword('Citizen@123');
    setError(null);
    setSubmitting(true);
    try {
      const res = await loginAsDemoCitizen();
      if (res.success) {
        navigate('/citizen/dashboard', { replace: true });
      } else {
        setError(res.message || 'Demo citizen sign-in failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAdmin = async () => {
    setIdentifier('admin@janaseva.gov.in');
    setPassword('Admin@123');
    setError(null);
    setSubmitting(true);
    try {
      const res = await loginAsDemoAdmin();
      if (res.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(res.message || 'Demo admin sign-in failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillCitizenCredentials = () => {
    setIdentifier('citizen@janaseva.gov.in');
    setPassword('Citizen@123');
    setError(null);
  };

  const fillAdminCredentials = () => {
    setIdentifier('admin@janaseva.gov.in');
    setPassword('Admin@123');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col lg:flex-row bg-[#050507] text-[#f5f5f8] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(143,139,255,0.12),_transparent_70%)] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(30,215,96,0.06),_transparent_70%)] pointer-events-none -z-10" />

      {/* LEFT SECTION: Civic Technology Visual Identity & Branding */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative bg-gradient-to-br from-[#0c0c12] via-[#08080c] to-[#050507]">
        {/* Subtle Ashoka / Civic watermark glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/[0.04] bg-radial from-white/[0.02] to-transparent pointer-events-none" />

        {/* Top Branding */}
        <div className="space-y-6 relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#16161d] to-[#0a0a0e] text-[#8f8bff] flex items-center justify-center border border-white/10 group-hover:border-[#8f8bff]/50 shadow-[0_0_20px_rgba(143,139,255,0.2)] transition-all">
              <Building2 className="w-6 h-6 text-[#8f8bff]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white font-sans">
                  JANASEVA
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">
                  Citizen Portal
                </span>
              </div>
              <p className="text-xs text-[#8a8a97]">Government Scheme Awareness for Betterment of Livelihood</p>
            </div>
          </Link>

          <div className="pt-8 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-[#6fd8ff]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified Public Services Platform</span>
            </div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight text-white leading-tight">
              Government Schemes. Opportunities. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8f8bff] via-[#6fd8ff] to-[#1ed760]">Better Livelihoods.</span>
            </h1>
            <p className="text-sm text-[#b6b6c2] leading-relaxed max-w-lg">
              Access Karnataka and Central welfare schemes with deterministic eligibility evaluation, live application tracking, and secure citizen profiles.
            </p>
          </div>
        </div>

        {/* Civic Trust Indicators & Feature Badges */}
        <div className="my-10 space-y-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[#8f8bff]/15 text-[#8f8bff] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Direct Benefit Transfer</p>
                <p className="text-[11px] text-[#8a8a97]">Aadhaar NPCI Enabled</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[#1ed760]/15 text-[#1ed760] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">DPDP Act 2023 Compliant</p>
                <p className="text-[11px] text-[#8a8a97]">Zero Third-party Tracking</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[#f3c64f]/15 text-[#f3c64f] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Verified Welfare Rules</p>
                <p className="text-[11px] text-[#8a8a97]">Karnataka & Central Portals</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[#6fd8ff]/15 text-[#6fd8ff] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Multilingual Access</p>
                <p className="text-[11px] text-[#8a8a97]">ಕನ್ನಡ • हिंदी • English</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-[#8a8a97] flex items-center space-x-2 pt-4 border-t border-white/5 relative z-10">
          <HelpCircle className="w-4 h-4 text-[#8f8bff]" />
          <span>Need assistance? Use the floating Janaseva AI assistant or visit our help desk.</span>
        </div>
      </div>

      {/* RIGHT SECTION: Professional Authentication Card */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center relative">
        <div className="w-full max-w-md space-y-6">
          {/* Card Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Citizen Sign In</h2>
            <p className="text-xs sm:text-sm text-[#b6b6c2]">
              Sign in to manage your saved schemes, track submitted applications, and access personalized welfare eligibility.
            </p>
          </div>

          {/* Quick Demo Access Buttons */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[#8f8bff] uppercase tracking-wider">
                  Lab Evaluation Demo Credentials
                </p>
                <span className="text-[10px] text-[#8a8a97]">Click button to sign in or fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDemoCitizen}
                  disabled={submitting || loading}
                  className="px-3 py-2.5 rounded-xl bg-[#8f8bff]/15 hover:bg-[#8f8bff]/25 border border-[#8f8bff]/30 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#8f8bff]" />
                  <span>Sign in as Citizen</span>
                </button>
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  disabled={submitting || loading}
                  className="px-3 py-2.5 rounded-xl bg-[#f3c64f]/15 hover:bg-[#f3c64f]/25 border border-[#f3c64f]/30 text-[#f3c64f] text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f3c64f]" />
                  <span>Sign in as Admin</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                <div
                  onClick={fillCitizenCredentials}
                  title="Click to fill form with Citizen credentials"
                  className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer text-[#8a8a97] hover:text-[#f5f5f8] transition-colors"
                >
                  <span className="text-[#8f8bff] font-mono font-medium block truncate">citizen@janaseva.gov.in</span>
                  <span className="font-mono">Pass: Citizen@123</span>
                </div>
                <div
                  onClick={fillAdminCredentials}
                  title="Click to fill form with Admin credentials"
                  className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer text-[#8a8a97] hover:text-[#f5f5f8] transition-colors"
                >
                  <span className="text-[#f3c64f] font-mono font-medium block truncate">admin@janaseva.gov.in</span>
                  <span className="font-mono">Pass: Admin@123</span>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2 animate-in fade-in">
                <span className="font-bold">•</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Mobile Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2] flex items-center justify-between">
                  <span>Email Address or Mobile Number</span>
                  <span className="text-[10px] text-[#8a8a97]">e.g. citizen@janaseva.gov.in</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or 10-digit mobile"
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff] transition-all"
                  />
                  <Mail className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#b6b6c2]">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#8f8bff] hover:text-[#b6b3ff] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    className="w-full h-11 pl-10 pr-11 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff] transition-all"
                  />
                  <Lock className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#8a8a97] hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#8f8bff] focus:ring-[#8f8bff] focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-[#b6b6c2] cursor-pointer select-none">
                  Remember my login identifier on this device
                </label>
              </div>

              {/* Primary Login Submit Button */}
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#8f8bff] to-[#6fd8ff] hover:opacity-95 text-[#050507] font-semibold text-sm flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(143,139,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#050507]" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Citizen Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-[#050507]" />
                  </>
                )}
              </button>
            </form>

            {/* Registration Navigation */}
            <div className="text-center pt-2">
              <p className="text-xs text-[#b6b6c2]">
                Don&apos;t have a citizen account?{' '}
                <Link
                  to="/register"
                  className="text-[#8f8bff] font-semibold hover:text-[#b6b3ff] transition-colors underline-offset-4 hover:underline"
                >
                  Register as a New Citizen
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      );
};
