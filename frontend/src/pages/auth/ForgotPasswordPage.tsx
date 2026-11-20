import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, Mail, Lock, KeyRound, ArrowLeft, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, Sparkles, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, resetPassword, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res.success) {
        setSuccess('A 6-digit verification code has been dispatched.');
        if (res.devOtp) {
          setDevOtpNotification(res.devOtp);
        }
        setStep('reset');
      } else {
        setError(res.message || 'No account found with this email address.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server error requesting password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      if (res.success) {
        setSuccess('Your password has been successfully reset! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } else {
        setError(res.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] py-12 px-4 sm:px-6 lg:px-8 bg-[#050507] text-[#f5f5f8] flex items-center justify-center relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(143,139,255,0.1),_transparent_70%)] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-[#0c0c12] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#8f8bff]/15 text-[#8f8bff] flex items-center justify-center mx-auto border border-[#8f8bff]/30 shadow-[0_0_20px_rgba(143,139,255,0.2)]">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {step === 'request' ? 'Reset Account Password' : 'Enter Verification Code'}
          </h1>
          <p className="text-xs text-[#b6b6c2]">
            {step === 'request'
              ? 'Enter your registered email address to receive an authentication verification code.'
              : `Enter the 6-digit code dispatched for ${email} and set your new password.`}
          </p>
        </div>

        {/* Dev OTP helper pill for instant evaluation */}
        {devOtpNotification && (
          <div className="mb-6 p-3.5 rounded-2xl bg-[#8f8bff]/15 border border-[#8f8bff]/30 text-white text-xs flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#8f8bff]">Verification Code:</p>
              <p className="font-mono text-sm tracking-widest font-bold">{devOtpNotification}</p>
            </div>
            <button
              type="button"
              onClick={() => setOtp(devOtpNotification)}
              className="px-2.5 py-1 rounded-lg bg-[#8f8bff] text-[#050507] font-semibold text-[11px] cursor-pointer hover:opacity-90"
            >
              Fill Code
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-[#1ed760]/10 border border-[#1ed760]/20 text-[#1ed760] text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">Registered Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. citizen@janaseva.gov.in"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-sm focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
                />
                <Mail className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#8f8bff] to-[#6fd8ff] hover:opacity-95 text-[#050507] font-semibold text-sm flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(143,139,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#050507]" />
                  <span>Generating Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4 text-[#050507]" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* OTP Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                className="w-full h-11 px-4 text-center tracking-[0.3em] font-mono text-base rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] focus:outline-none focus:border-[#8f8bff] focus:ring-1 focus:ring-[#8f8bff]"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
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
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#b6b6c2]">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
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

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#8f8bff] to-[#6fd8ff] hover:opacity-95 text-[#050507] font-semibold text-sm flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(143,139,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#050507]" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password & Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#050507]" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-center text-xs text-[#8a8a97] hover:text-[#f5f5f8] transition-colors cursor-pointer py-1"
            >
              Request a different verification code
            </button>
          </form>
        )}

        <div className="text-center pt-6 border-t border-white/5 mt-6">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs text-[#8f8bff] hover:text-[#b6b3ff] transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Citizen Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
