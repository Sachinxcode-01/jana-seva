import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Globe, Bell, Download, Trash2, KeyRound,
  CheckCircle2, AlertCircle, Loader2, Sparkles, Laptop
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Language } from '../../types';

export const CitizenSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(user?.preferences?.emailNotifications ?? true);
  const [schemeAlerts, setSchemeAlerts] = useState(user?.preferences?.schemeUpdates ?? true);

  // Feedback alerts
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPasswordUpdating(true);
    setMessage(null);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res.success) {
        setMessage({ type: 'success', text: 'Password successfully updated.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: res.message || 'Current password incorrect.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server error updating password.' });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await api.exportUserData();
      if (res.success && res.data) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `janaseva_citizen_records_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Your personal records export file has been downloaded.' });
      }
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'DPDP Act 2023 Statutory Right to Erasure:\n\nAre you sure you want to permanently erase your citizen profile and all recorded applications? This operation cannot be reversed.'
    );
    if (confirmation) {
      await api.deleteAccount();
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Citizen Account & Security Settings</h1>
        <p className="text-xs text-[#8a8a97] mt-1">
          Manage your credentials, linguistic preferences, notification channels, and DPDP Act statutory data rights.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 animate-in fade-in ${
            message.type === 'success'
              ? 'bg-[#1ed760]/10 border-[#1ed760]/30 text-[#1ed760]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Language Preferences */}
      <div className="p-6 rounded-3xl bg-[#0c0c12] border border-white/10 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#8f8bff]/15 text-[#8f8bff] flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Linguistic Localization</h2>
            <p className="text-xs text-[#8a8a97]">Choose your preferred official language for schemes & guidance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { code: 'en', label: 'English', native: 'English' },
            { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
            { code: 'hi', label: 'Hindi', native: 'हिंदी' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code as Language);
                api.updateProfile({ preferredLanguage: l.code as Language });
                setMessage({ type: 'success', text: `Portal language switched to ${l.native}.` });
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                language === l.code
                  ? 'bg-[#8f8bff]/20 border-[#8f8bff]/40 text-white'
                  : 'bg-white/[0.03] border-white/5 text-[#b6b6c2] hover:bg-white/[0.06]'
              }`}
            >
              <p className="text-sm font-bold">{l.native}</p>
              <p className="text-[11px] text-[#8a8a97]">{l.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Change Password */}
      <div className="p-6 rounded-3xl bg-[#0c0c12] border border-white/10 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#8f8bff]/15 text-[#8f8bff] flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Change Password</h2>
            <p className="text-xs text-[#8a8a97]">Keep your citizen account protected with a strong password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md pt-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#b6b6c2]">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8f8bff]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#b6b6c2]">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8f8bff]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#b6b6c2]">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8f8bff]"
            />
          </div>

          <button
            type="submit"
            disabled={passwordUpdating}
            className="px-4 py-2 rounded-xl bg-[#8f8bff] text-[#050507] font-semibold text-xs cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center space-x-1.5"
          >
            {passwordUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Update Account Password</span>
          </button>
        </form>
      </div>

      {/* 3. Statutory Data Portability & Erasure (DPDP Act 2023) */}
      <div className="p-6 rounded-3xl bg-[#0c0c12] border border-white/10 space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1ed760]/15 text-[#1ed760] flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Statutory Data Protection Rights</h2>
            <p className="text-xs text-[#8a8a97]">In compliance with India&apos;s Digital Personal Data Protection Act 2023</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export JSON */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-white">Right to Data Portability (Section 11)</h3>
            <p className="text-[11px] text-[#b6b6c2] leading-relaxed">
              Download a complete JSON export of all your saved welfare schemes, recorded application numbers, and eligibility results.
            </p>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#8f8bff]" />}
              <span>Export Personal Records (JSON)</span>
            </button>
          </div>

          {/* Erasure */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
            <h3 className="text-xs font-bold text-rose-400">Right to Erasure (Section 12)</h3>
            <p className="text-[11px] text-[#b6b6c2] leading-relaxed">
              Permanently purge your account, profile data, documents checklist, and all personal scheme logs from JANASEVA servers.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Account Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
