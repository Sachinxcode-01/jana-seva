import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon, Mail, Phone, MapPin, Briefcase, IndianRupee,
  Shield, KeyRound, Globe, Bell, Trash2, CheckCircle2, AlertCircle,
  Loader2, Save, X, Laptop, LogOut, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { ALL_INDIAN_STATES } from '../../utils/indiaStates';
import { User, UserSession } from '../../types';

export const CitizenProfilePage: React.FC = () => {
  const { user, refreshProfile, logout, updateUserLocally } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Active Tab
  const [activeSection, setActiveSection] = useState<'personal' | 'location' | 'additional' | 'preferences' | 'security'>('personal');

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    state: user?.state || 'Karnataka',
    district: user?.district || 'Bengaluru Urban',
    villageTown: user?.villageTown || '',
    occupation: user?.occupation || 'Farmer',
    beneficiaryCategory: user?.beneficiaryCategory || 'General',
    incomeRange: user?.incomeRange || '1 Lakh - 2.5 Lakhs',
    gender: user?.gender || 'Male',
    preferredLanguage: user?.preferredLanguage || 'en',
    preferences: user?.preferences || {
      language: 'en',
      emailNotifications: true,
      smsNotifications: false,
      schemeUpdates: true,
      theme: 'dark'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<UserSession[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        state: user.state || 'Karnataka',
        district: user.district || 'Bengaluru Urban',
        villageTown: user.villageTown || '',
        occupation: user.occupation || 'Farmer',
        beneficiaryCategory: user.beneficiaryCategory || 'General',
        incomeRange: user.incomeRange || '1 Lakh - 2.5 Lakhs',
        gender: user.gender || 'Male',
        preferredLanguage: user.preferredLanguage || 'en',
        preferences: user.preferences || {
          language: 'en',
          emailNotifications: true,
          smsNotifications: false,
          schemeUpdates: true,
          theme: 'dark'
        }
      });
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const res = await api.getSessions();
      if (res.success && res.sessions) setSessions(res.sessions);
    } catch { }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setMessage(null);
  };

  const handlePrefChange = (prefKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [prefKey]: value
      }
    }));
    setHasChanges(true);
    setMessage(null);
  };

  // Compute profile completion score
  const computeCompletion = () => {
    let score = 0;
    if (formData.fullName) score += 20;
    if (formData.email) score += 15;
    if (formData.mobileNumber) score += 15;
    if (formData.state) score += 15;
    if (formData.district) score += 10;
    if (formData.occupation) score += 15;
    if (formData.incomeRange) score += 10;
    return Math.min(100, score);
  };

  const completionScore = computeCompletion();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setMessage({ type: 'error', text: 'Full name cannot be empty.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.updateProfile(formData);
      if (res.success) {
        updateUserLocally(formData as any);
        setHasChanges(false);
        setMessage({ type: 'success', text: 'Citizen profile details successfully updated.' });
        refreshProfile();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Server error saving profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        state: user.state || 'Karnataka',
        district: user.district || 'Bengaluru Urban',
        villageTown: user.villageTown || '',
        occupation: user.occupation || 'Farmer',
        beneficiaryCategory: user.beneficiaryCategory || 'General',
        incomeRange: user.incomeRange || '1 Lakh - 2.5 Lakhs',
        gender: user.gender || 'Male',
        preferredLanguage: user.preferredLanguage || 'en',
        preferences: user.preferences || {
          language: 'en',
          emailNotifications: true,
          smsNotifications: false,
          schemeUpdates: true,
          theme: 'dark'
        }
      });
      setHasChanges(false);
      setMessage(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: 'Please fill out all password fields.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordUpdating(true);
    setMessage(null);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res.success) {
        setMessage({ type: 'success', text: 'Your password has been securely updated.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: res.message || 'Current password was incorrect.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update password.' });
    } finally {
      setPasswordUpdating(false);
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

  const karnatakaDistricts = [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mandya', 'Mysuru', 'Tumakuru',
    'Hassan', 'Shivamogga', 'Dharwad', 'Belagavi', 'Ballari', 'Kalaburagi',
    'Dakshina Kannada', 'Udupi', 'Uttara Kannada', 'Chitradurga', 'Kolar', 'Bagalkote', 'Vijayapura'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* 1. PROFILE OVERVIEW HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c0c16] via-[#09090f] to-[#050507] border border-white/10 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#8f8bff] to-[#6fd8ff] text-[#050507] flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-[0_0_25px_rgba(143,139,255,0.3)]">
            {formData.fullName?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {formData.fullName || 'Citizen Profile'}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">
                Verified Citizen
              </span>
            </div>
            <p className="text-xs text-[#8a8a97] flex items-center space-x-2">
              <span>{formData.email}</span>
              {formData.mobileNumber && <span>• {formData.mobileNumber}</span>}
            </p>
            <p className="text-[11px] text-[#8a8a97]/80">
              Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Citizen'}
            </p>
          </div>
        </div>

        {/* Profile Completion Indicator */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 min-w-[200px] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8a8a97] font-medium">Profile Completion</span>
            <span className="font-bold text-[#8f8bff]">{completionScore}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8f8bff] to-[#1ed760] rounded-full transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
          <p className="text-[10px] text-[#8a8a97]">
            {completionScore === 100 ? 'All essential demographic fields filled' : 'Complete all fields for accurate scheme matches'}
          </p>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div className="p-3.5 rounded-2xl bg-[#ff9933]/15 border border-[#ff9933]/30 text-white text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#ff9933] shrink-0" />
            <span>You have unsaved changes in your citizen profile.</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-[#b6b6c2] cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-3 py-1 rounded-lg bg-[#8f8bff] text-[#050507] font-semibold text-xs cursor-pointer hover:opacity-90 flex items-center space-x-1"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
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

      {/* SECTION TABS */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto text-xs pb-1">
        {[
          { id: 'personal', label: 'Personal Information', icon: UserIcon },
          { id: 'location', label: 'Location Details', icon: MapPin },
          { id: 'additional', label: 'Demographics & Income', icon: Briefcase },
          { id: 'preferences', label: 'Preferences', icon: Bell },
          { id: 'security', label: 'Security & Account', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                  : 'text-[#8a8a97] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 text-[#8f8bff]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="rounded-3xl bg-[#0c0c12] border border-white/10 p-6 sm:p-8 shadow-xl">
        {/* Section A: Personal Information */}
        {activeSection === 'personal' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Personal Information</h3>
              <p className="text-xs text-[#8a8a97]">Manage your name, contact email, and mobile communication details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                  />
                  <UserIcon className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">Registered Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.02] border border-white/5 text-[#8a8a97] text-sm cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[10px] text-[#8a8a97]">Email address is bound to your national citizen identifier.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleChange('mobileNumber', e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                  />
                  <Phone className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                >
                  <option value="Male" className="bg-[#101016]">Male</option>
                  <option value="Female" className="bg-[#101016]">Female</option>
                  <option value="Other" className="bg-[#101016]">Other / Transgender</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!hasChanges}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#b6b6c2] hover:text-white cursor-pointer disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="px-5 py-2 rounded-xl bg-[#8f8bff] text-[#050507] font-semibold text-xs cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center space-x-1.5"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Personal Information</span>
              </button>
            </div>
          </form>
        )}

        {/* Section B: Location Information */}
        {activeSection === 'location' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Location Information</h3>
              <p className="text-xs text-[#8a8a97]">Used to determine applicable Karnataka state and regional welfare benefits.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">State of Domicile *</label>
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                  >
                    {ALL_INDIAN_STATES.map(s => (
                      <option key={s.name} value={s.name} className="bg-[#101016]">{s.name}</option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">District</label>
                {formData.state === 'Karnataka' ? (
                  <select
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                  >
                    {karnatakaDistricts.map(d => (
                      <option key={d} value={d} className="bg-[#101016]">{d}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    placeholder="Enter District"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                  />
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-[#b6b6c2]">
                  Village / Town / Taluk <span className="text-[10px] text-[#8a8a97]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.villageTown}
                  onChange={(e) => handleChange('villageTown', e.target.value)}
                  placeholder="e.g. Maddur, Mandya Taluk"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!hasChanges}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#b6b6c2] hover:text-white cursor-pointer disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="px-5 py-2 rounded-xl bg-[#8f8bff] text-[#050507] font-semibold text-xs cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center space-x-1.5"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Location Details</span>
              </button>
            </div>
          </form>
        )}

        {/* Section C: Additional Information */}
        {activeSection === 'additional' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Demographics & Livelihood</h3>
              <p className="text-xs text-[#8a8a97]">Used exclusively by our deterministic eligibility engine to calculate matching welfare programs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">Primary Occupation</label>
                <select
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                >
                  <option value="Farmer" className="bg-[#101016]">Farmer / Agricultural Worker</option>
                  <option value="Student" className="bg-[#101016]">Student</option>
                  <option value="Artisan" className="bg-[#101016]">Artisan / Weaver / Craftsman</option>
                  <option value="Small Business Owner" className="bg-[#101016]">Small Business Owner / MSME</option>
                  <option value="Self Employed" className="bg-[#101016]">Self Employed / Gig Worker</option>
                  <option value="Unemployed Youth" className="bg-[#101016]">Unemployed Youth</option>
                  <option value="Homemaker" className="bg-[#101016]">Homemaker</option>
                  <option value="General Citizen" className="bg-[#101016]">General Citizen</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">Beneficiary Category</label>
                <select
                  value={formData.beneficiaryCategory}
                  onChange={(e) => handleChange('beneficiaryCategory', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                >
                  <option value="General" className="bg-[#101016]">General</option>
                  <option value="General / OBC" className="bg-[#101016]">OBC (Other Backward Classes)</option>
                  <option value="SC" className="bg-[#101016]">SC (Scheduled Caste)</option>
                  <option value="ST" className="bg-[#101016]">ST (Scheduled Tribe)</option>
                  <option value="Minority" className="bg-[#101016]">Minority Communities</option>
                  <option value="Women" className="bg-[#101016]">Women Head of Family</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-[#b6b6c2]">Annual Family Income Range</label>
                <select
                  value={formData.incomeRange}
                  onChange={(e) => handleChange('incomeRange', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                >
                  <option value="Below 1 Lakh" className="bg-[#101016]">Below ₹1,00,000 (Antyodaya / BPL)</option>
                  <option value="1 Lakh - 2.5 Lakhs" className="bg-[#101016]">₹1,00,000 - ₹2,50,000 (Eligible for most scholarships/subsidies)</option>
                  <option value="2.5 Lakhs - 5 Lakhs" className="bg-[#101016]">₹2,50,000 - ₹5,00,000</option>
                  <option value="5 Lakhs - 8 Lakhs" className="bg-[#101016]">₹5,00,000 - ₹8,00,000 (EWS threshold)</option>
                  <option value="Above 8 Lakhs" className="bg-[#101016]">Above ₹8,00,000</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!hasChanges}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#b6b6c2] hover:text-white cursor-pointer disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="px-5 py-2 rounded-xl bg-[#8f8bff] text-[#050507] font-semibold text-xs cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center space-x-1.5"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Demographics</span>
              </button>
            </div>
          </form>
        )}

        {/* Section D: Account Preferences */}
        {activeSection === 'preferences' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Preferences & Notification Settings</h3>
              <p className="text-xs text-[#8a8a97]">Customize portal language, notification alerts, and theme preferences.</p>
            </div>

            <div className="space-y-4 max-w-xl">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Preferred Portal Language</p>
                  <p className="text-[11px] text-[#8a8a97]">Language for scheme details and assistant responses</p>
                </div>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => {
                    handleChange('preferredLanguage', e.target.value);
                    setLanguage(e.target.value as any);
                  }}
                  className="h-9 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none"
                >
                  <option value="en" className="bg-[#101016]">English</option>
                  <option value="kn" className="bg-[#101016]">ಕನ್ನಡ (Kannada)</option>
                  <option value="hi" className="bg-[#101016]">हिंदी (Hindi)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Email Welfare Notifications</p>
                  <p className="text-[11px] text-[#8a8a97]">Receive announcements when new relevant schemes are launched</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.preferences?.emailNotifications ?? true}
                  onChange={(e) => handlePrefChange('emailNotifications', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#8f8bff] focus:ring-[#8f8bff] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Scheme Deadline & e-KYC Reminders</p>
                  <p className="text-[11px] text-[#8a8a97]">Alerts for scholarship windows and DBT verification updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.preferences?.schemeUpdates ?? true}
                  onChange={(e) => handlePrefChange('schemeUpdates', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#8f8bff] focus:ring-[#8f8bff] cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="px-5 py-2 rounded-xl bg-[#8f8bff] text-[#050507] font-semibold text-xs cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center space-x-1.5"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        )}

        {/* Section E: Account Management & Security */}
        {activeSection === 'security' && (
          <div className="space-y-8">
            {/* Change Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Change Account Password</h3>
                <p className="text-xs text-[#8a8a97]">Ensure your password uses at least 6 characters with mixed symbols.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#b6b6c2]">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#b6b6c2]">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#b6b6c2]">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#8f8bff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordUpdating}
                className="px-4 py-2 rounded-xl bg-[#8f8bff] text-[#050507] font-semibold text-xs cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center space-x-1.5"
              >
                {passwordUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Update Password</span>
              </button>
            </form>

            {/* Active Sessions */}
            <div className="space-y-3 pt-6 border-t border-white/10">
              <h3 className="text-sm font-bold text-white">Active Login Sessions</h3>
              <p className="text-xs text-[#8a8a97]">Devices authorized to access your citizen records.</p>

              <div className="space-y-2">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#8f8bff]">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{sess.userAgent || 'Web Browser'}</p>
                        <p className="text-[11px] text-[#8a8a97] font-mono">
                          IP: {sess.ip} • Signed in: {new Date(sess.loggedInAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1ed760]/10 text-[#1ed760] font-semibold">
                      Current Session
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delete Account (DPDP Act 2023) */}
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3 pt-4">
              <div>
                <h4 className="text-xs font-bold text-rose-400">Statutory Right to Erasure (DPDP Act 2023 § 12)</h4>
                <p className="text-[11px] text-[#b6b6c2] mt-0.5">
                  Permanently purge your citizen registration, saved welfare schemes, and application logs from the JANASEVA database.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account & Purge Personal Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
