import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, Lock, Mail, User as UserIcon, Phone, MapPin,
  Globe, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2,
  CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ALL_INDIAN_STATES } from '../../utils/indiaStates';

export const RegisterPage: React.FC = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'kn' | 'hi'>('en');
  const [occupation, setOccupation] = useState('General Citizen');
  const [incomeRange, setIncomeRange] = useState('Below 2.5 Lakhs');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Karnataka & popular districts
  const karnatakaDistricts = [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mandya', 'Mysuru', 'Tumakuru',
    'Hassan', 'Shivamogga', 'Dharwad', 'Belagavi', 'Ballari', 'Kalaburagi',
    'Dakshina Kannada', 'Udupi', 'Uttara Kannada', 'Chitradurga', 'Kolar'
  ];

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-white/10' };
    if (pass.length < 6) return { score: 1, label: 'Too short (min 6 chars)', color: 'bg-rose-500' };

    let strength = 1;
    if (pass.length >= 8) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) strength++;

    if (strength === 2) return { score: 2, label: 'Fair strength', color: 'bg-[#f3c64f]' };
    if (strength === 3) return { score: 3, label: 'Good strength', color: 'bg-[#8f8bff]' };
    return { score: 4, label: 'Strong & secure', color: 'bg-[#1ed760]' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (mobileNumber && mobileNumber.replace(/[^0-9]/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the Citizen Portal Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        password,
        state,
        district,
        preferredLanguage,
        occupation,
        incomeRange,
        termsAccepted: true
      });

      if (res.success) {
        setSuccess('Citizen registration successful! Redirecting to your dashboard...');
        setTimeout(() => {
          navigate('/citizen/dashboard', { replace: true });
        }, 1200);
      } else {
        setError(res.message || 'Registration failed. Email might already be registered.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server error during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] py-8 px-4 sm:px-6 lg:px-8 bg-[#050507] text-[#f5f5f8] flex items-center justify-center relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(143,139,255,0.08),_transparent_70%)] pointer-events-none -z-10" />

      <div className="w-full max-w-2xl bg-[#0c0c12] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8f8bff]/15 border border-[#8f8bff]/30 text-xs text-[#8f8bff] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Citizen Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Create Your Citizen Account
          </h1>
          <p className="text-xs sm:text-sm text-[#b6b6c2] max-w-md mx-auto">
            Enroll with JANASEVA to bookmark welfare schemes, check real-time eligibility, and manage your benefit applications.
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-[#1ed760]/10 border border-[#1ed760]/30 text-[#1ed760] text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Gowda"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                />
                <UserIcon className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                />
                <Mail className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Row 2: Mobile Number & Preferred Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">
                Mobile Number <span className="text-[10px] text-[#8a8a97]">(Optional for SMS alerts)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                />
                <Phone className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">Preferred Language *</label>
              <div className="relative">
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as any)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                >
                  <option value="en" className="bg-[#101016]">English</option>
                  <option value="kn" className="bg-[#101016]">ಕನ್ನಡ (Kannada)</option>
                  <option value="hi" className="bg-[#101016]">हिंदी (Hindi)</option>
                </select>
                <Globe className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Row 3: State & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">State of Residence *</label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                >
                  {ALL_INDIAN_STATES.map((s) => (
                    <option key={s.name} value={s.name} className="bg-[#101016]">
                      {s.name}
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">District</label>
              {state === 'Karnataka' ? (
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                >
                  {karnatakaDistricts.map((d) => (
                    <option key={d} value={d} className="bg-[#101016]">{d}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Enter district name"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                />
              )}
            </div>
          </div>

          {/* Row 4: Password & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                />
                <Lock className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#8a8a97] hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex space-x-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all ${
                          strength.score >= step ? strength.color : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#8a8a97]">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                />
                <Lock className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-[#8a8a97] hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="flex items-start space-x-2 pt-2">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-[#8f8bff] focus:ring-[#8f8bff] cursor-pointer"
            />
            <label htmlFor="agreeTerms" className="text-xs text-[#b6b6c2] leading-relaxed cursor-pointer select-none">
              I agree to the <Link to="/compliance" className="text-[#8f8bff] underline hover:text-white">Citizen Terms of Service</Link> and acknowledge the <Link to="/compliance" className="text-[#8f8bff] underline hover:text-white">Privacy Policy</Link> under the Digital Personal Data Protection (DPDP) Act 2023.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#8f8bff] via-[#6fd8ff] to-[#1ed760] hover:opacity-95 text-[#050507] font-semibold text-sm flex items-center justify-center space-x-2 shadow-[0_4px_25px_rgba(143,139,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#050507]" />
                <span>Creating Citizen Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration & Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#050507]" />
              </>
            )}
          </button>
        </form>

        {/* Existing account navigation */}
        <div className="text-center pt-6 border-t border-white/5 mt-6">
          <p className="text-xs text-[#b6b6c2]">
            Already have a registered citizen or administrator account?{' '}
            <Link
              to="/login"
              className="text-[#8f8bff] font-semibold hover:text-[#b6b3ff] transition-colors underline-offset-4 hover:underline"
            >
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
