import React, { useState, useId } from 'react';
import {
  X, Lock, Mail, User as UserIcon, ShieldAlert, Sparkles, Building2,
  Eye, EyeOff, Check, CheckCircle2, KeyRound, ArrowLeft, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, forgotPassword, resetPassword, loginAsDemoCitizen, loginAsDemoAdmin, loading } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [state, setState] = useState('Karnataka');
  const [occupation, setOccupation] = useState('Farmer');
  const [incomeRange, setIncomeRange] = useState('Below 2.5 Lakhs');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeConsent, setAgreeConsent] = useState(false);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password & OTP state
  const [otpCode, setOtpCode] = useState('');
  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);

  // Alerts
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Accessibility unique IDs
  const loginRememberId = useId();
  const consentCheckId = useId();

  if (!isOpen) return null;

  // Real-time password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-white/10', text: '' };
    if (pass.length < 6) return { score: 1, label: 'Too short (min 6 chars)', color: 'bg-rose-500', text: 'text-rose-400' };

    let strength = 1;
    if (pass.length >= 8) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) strength++;

    if (strength === 2) return { score: 2, label: 'Fair', color: 'bg-[#f3c64f]', text: 'text-[#f3c64f]' };
    if (strength === 3) return { score: 3, label: 'Good', color: 'bg-[#8f8bff]', text: 'text-[#8f8bff]' };
    return { score: 4, label: 'Strong', color: 'bg-[#1ed760]', text: 'text-[#1ed760]' };
  };

  const strength = getPasswordStrength(password);

  const resetMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetMessages();
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
      }
    } else if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }
      if (!agreeConsent) {
        setError('Please agree to terms and privacy consent to register.');
        return;
      }

      const res = await register({
        fullName,
        email,
        password,
        state,
        occupation,
        annualIncomeRange: incomeRange
      });

      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Registration failed. Email might already exist.');
      }
    } else if (mode === 'forgot') {
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccessMessage('Reset code successfully generated.');
        if (res.devOtp) {
          setDevOtpNotification(res.devOtp);
        }
        setMode('reset');
      } else {
        setError(res.message || 'Email not found or error generating reset OTP.');
      }
    } else if (mode === 'reset') {
      if (!otpCode || otpCode.length !== 6) {
        setError('Please enter the 6-digit verification code.');
        return;
      }
      if (password.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }

      const res = await resetPassword(email, otpCode, password);
      if (res.success) {
        setSuccessMessage('Password successfully updated! You can now sign in.');
        setDevOtpNotification(null);
        setPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setMode('login');
      } else {
        setError(res.message || 'Failed to reset password. Verify your code and try again.');
      }
    }
  };

  const handleDemoCitizen = async () => {
    await loginAsDemoCitizen();
    onClose();
  };

  const handleDemoAdmin = async () => {
    await loginAsDemoAdmin();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050507]/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bytune-card max-w-md w-full shadow-[0_30px_70px_rgba(0,0,0,0.95)] border border-white/10 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0a0a0e]/90 p-5 flex items-center justify-between border-b border-white/[0.08] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#8f8bff]">
              <Building2 className="w-4 h-4 text-[#8f8bff]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base tracking-tight text-[#f5f5f8] flex items-center gap-1.5">
                JANASEVA Portal
                <span className="text-[10px] font-mono font-semibold bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30 px-2 py-0.5 rounded-full uppercase">
                  Verified
                </span>
              </h3>
              <p className="text-[11px] text-[#8a8a97]">Government Scheme & Livelihood Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close authentication dialog"
            className="bytune-pill p-1.5 text-[#8a8a97] hover:text-[#f5f5f8] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-white/[0.02] border-b border-white/[0.06] p-3.5 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-semibold text-[#8f8bff] uppercase tracking-wider flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#f3c64f] shrink-0" />
              1-Click Examiner Demo Login:
            </p>
            <span className="text-[10px] text-[#8a8a97]">Auto-populates session</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCitizen}
              className="py-1.5 px-3 bg-white/[0.04] border border-white/10 hover:border-white/20 text-xs font-medium text-[#f5f5f8] rounded-full hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#1ed760] shadow-[0_0_6px_#1ed760]"></span>
              <span>Citizen: <strong>Ramesh</strong></span>
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-1.5 px-3 bg-[#f3c64f]/15 border border-[#f3c64f]/30 hover:bg-[#f3c64f]/25 text-xs font-semibold text-[#f3c64f] rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#f3c64f] shadow-[0_0_6px_#f3c64f]"></span>
              <span>Admin: <strong>Govt Officer</strong></span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex border-b border-white/[0.06] shrink-0 bg-[#050507]/40 p-1">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`flex-1 py-2 text-xs font-medium transition-all rounded-full flex items-center justify-center gap-1.5 cursor-pointer ${mode === 'login'
                ? 'bg-white/10 text-[#f5f5f8] font-semibold shadow-sm border border-white/10'
                : 'text-[#8a8a97] hover:text-[#f5f5f8]'
                }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('login')} (Sign In)</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`flex-1 py-2 text-xs font-medium transition-all rounded-full flex items-center justify-center gap-1.5 cursor-pointer ${mode === 'register'
                ? 'bg-white/10 text-[#f5f5f8] font-semibold shadow-sm border border-white/10'
                : 'text-[#8a8a97] hover:text-[#f5f5f8]'
                }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t('register')} (Sign Up)</span>
            </button>
          </div>
        )}

        {/* Back navigation header for Forgot/Reset password modes */}
        {(mode === 'forgot' || mode === 'reset') && (
          <div className="px-5 py-2.5 bg-[#0a0a0e]/60 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className="text-xs font-medium text-[#8f8bff] hover:text-[#6fd8ff] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
            <span className="text-[11px] font-semibold text-[#8a8a97] uppercase tracking-wide">
              {mode === 'forgot' ? 'Account Recovery' : 'Reset Password'}
            </span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs flex-1">
          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start space-x-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11.5px] font-normal leading-snug">{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-[#1ed760]/10 border border-[#1ed760]/20 text-[#1ed760] flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1ed760] mt-0.5" />
              <div className="text-[11.5px] font-normal leading-snug">{successMessage}</div>
            </div>
          )}

          {/* Dev OTP Verification Helper Badge */}
          {devOtpNotification && (
            <div className="p-3.5 rounded-xl bg-[#f3c64f]/10 border border-[#f3c64f]/25 text-[#f3c64f] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] flex items-center gap-1 text-[#f3c64f]">
                  <KeyRound className="w-3.5 h-3.5" />
                  Demonstration Security OTP Code:
                </span>
                <span className="font-mono text-xs font-bold bg-[#f3c64f]/20 px-2.5 py-0.5 rounded-full tracking-wider">
                  {devOtpNotification}
                </span>
              </div>
              <p className="text-[10px] text-[#8a8a97] leading-tight">
                (In production, this code is transmitted via SMS/Email gateway. Use code above to verify immediately).
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FULL NAME */}
            {mode === 'register' && (
              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Gowda"
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none text-xs"
                  />
                </div>
              </div>
            )}

            {/* EMAIL ADDRESS */}
            <div>
              <label className="block font-medium text-[#b6b6c2] mb-1">
                Registered Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  disabled={mode === 'reset'}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@janaseva.gov.in"
                  className={`w-full pl-10 pr-4 py-2 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none text-xs ${mode === 'reset' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                />
              </div>
            </div>

            {/* OTP CODE FIELD */}
            {mode === 'reset' && (
              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">
                  6-Digit Verification OTP <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none font-mono text-xs tracking-wider"
                  />
                </div>
              </div>
            )}

            {/* PASSWORD FIELD */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-[#b6b6c2]">
                    {mode === 'reset' ? 'New Password' : 'Password'}{' '}
                    <span className="text-rose-400">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleModeChange('forgot')}
                      className="text-[11px] font-medium text-[#8f8bff] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-2.5 text-[#8a8a97] hover:text-[#f5f5f8]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {(mode === 'register' || mode === 'reset') && password.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8a8a97]">Security Strength:</span>
                      <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : 'bg-transparent'}`}></div>
                      <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : 'bg-transparent'}`}></div>
                      <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : 'bg-transparent'}`}></div>
                      <div className={`h-full flex-1 transition-all ${strength.score >= 4 ? strength.color : 'bg-transparent'}`}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONFIRM PASSWORD FIELD */}
            {(mode === 'register' || mode === 'reset') && (
              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-2.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-2 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                    className="absolute right-3.5 top-2.5 text-[#8a8a97] hover:text-[#f5f5f8]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    {password === confirmPassword ? (
                      <span className="text-[#1ed760] font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-400 font-medium">Passwords do not match yet</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* DEMOGRAPHIC PROFILES (Register only) */}
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-[#b6b6c2] mb-1">State Domicile</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full py-2 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                    >
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#b6b6c2] mb-1">Occupation</label>
                    <select
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full py-2 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                    >
                      <option value="Farmer">Farmer / Agriculture</option>
                      <option value="Student">Student</option>
                      <option value="Homemaker">Homemaker / Woman Head</option>
                      <option value="Street Vendor">Street Vendor / Hawkers</option>
                      <option value="Unemployed">Unemployed Youth</option>
                      <option value="Self-Employed">Self-Employed / Artisan</option>
                      <option value="Salaried">Salaried / Private</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Annual Family Income Bracket</label>
                  <select
                    value={incomeRange}
                    onChange={(e) => setIncomeRange(e.target.value)}
                    className="w-full py-2 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  >
                    <option value="Below 1 Lakh">Below ₹1,00,000 (BPL/Antyodaya)</option>
                    <option value="1 Lakh - 2.5 Lakhs">₹1,00,000 to ₹2,50,000</option>
                    <option value="2.5 Lakhs - 5 Lakhs">₹2,50,000 to ₹5,00,000</option>
                    <option value="Above 5 Lakhs">Above ₹5,00,000</option>
                  </select>
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start space-x-2 pt-1 text-xs text-[#8a8a97] bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                  <input
                    type="checkbox"
                    id={consentCheckId}
                    checked={agreeConsent}
                    onChange={(e) => setAgreeConsent(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 text-[#8f8bff] focus:ring-[#8f8bff] shrink-0"
                    required
                  />
                  <label htmlFor={consentCheckId} className="text-[11px] leading-tight text-[#b6b6c2] cursor-pointer">
                    I agree to the <strong className="text-[#f5f5f8]">Terms of Use</strong> & <strong className="text-[#f5f5f8]">Privacy Policy</strong>. My demographic details will strictly be utilized for public scheme calculations (DPDP Act 2023).
                  </label>
                </div>
              </>
            )}

            {/* REMEMBER ME */}
            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs text-[#8a8a97] pt-0.5">
                <label htmlFor={loginRememberId} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id={loginRememberId}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 text-[#8f8bff] focus:ring-[#8f8bff]"
                  />
                  <span className="text-[11.5px] select-none text-[#b6b6c2]">Remember my session on this device</span>
                </label>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="bytune-btn-solid w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4 text-xs"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
              <span>
                {loading
                  ? 'Processing Request...'
                  : mode === 'login'
                    ? 'Sign In to Citizen Portal'
                    : mode === 'register'
                      ? 'Create Free Citizen Account'
                      : mode === 'forgot'
                        ? 'Generate Verification OTP'
                        : 'Update & Reset Password'
                }
              </span>
            </button>
          </form>

          {/* Quick toggle footer text */}
          <div className="pt-2 text-center text-[11px] text-[#8a8a97]">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('register')}
                  className="font-medium text-[#8f8bff] hover:underline cursor-pointer"
                >
                  Register now for free
                </button>
              </p>
            ) : mode === 'register' ? (
              <p>
                Already have a registered account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="font-medium text-[#8f8bff] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="font-medium text-[#8f8bff] hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
