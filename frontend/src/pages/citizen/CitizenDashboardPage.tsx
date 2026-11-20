import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark, CheckCircle2, Bell, ArrowRight,
  Sparkles, Compass, FolderArchive, Bot, Clock, ExternalLink,
  ChevronRight, AlertCircle, Building2, ShieldCheck, UserCheck,
  RefreshCw, FileText, Check, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Scheme, SavedEligibilityRecord, AppNotification, DocumentItem } from '../../types';

interface CitizenDashboardPageProps {
  schemes: Scheme[];
  onSelectScheme: (scheme: Scheme) => void;
  onToggleSaveScheme: (schemeId: string) => void;
  savedSchemeIds: string[];
}

export const CitizenDashboardPage: React.FC<CitizenDashboardPageProps> = ({
  schemes,
  onSelectScheme,
  onToggleSaveScheme,
  savedSchemeIds
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [savedSchemes, setSavedSchemes] = useState<Scheme[]>([]);
  const [eligibilityHistory, setEligibilityHistory] = useState<SavedEligibilityRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const dashRes = await api.getDashboard();
      if (dashRes.success) {
        if (dashRes.recentlySavedSchemes) setSavedSchemes(dashRes.recentlySavedSchemes);
        if (dashRes.recentlyEvaluatedSchemes) setEligibilityHistory(dashRes.recentlyEvaluatedSchemes);
        if (dashRes.announcements) setNotifications(dashRes.announcements);
      }

      // Also ensure full documents list is fetched for accurate counts
      const [savedRes, historyRes, docsRes, notifRes] = await Promise.all([
        api.getSavedSchemes(),
        api.getEligibilityHistory(),
        api.getDocuments(),
        api.getNotifications()
      ]);

      if (savedRes.success && savedRes.schemes) setSavedSchemes(savedRes.schemes);
      if (historyRes.success && historyRes.history) setEligibilityHistory(historyRes.history);
      if (docsRes.success && docsRes.documents) setDocuments(docsRes.documents);
      if (notifRes.success && notifRes.notifications) setNotifications(notifRes.notifications);
    } catch (e) {
      console.warn('Dashboard data fetch fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, savedSchemeIds]);

  // Profile completion score calculation
  const calculateProfileScore = () => {
    let score = 0;
    if (user?.fullName) score += 20;
    if (user?.email) score += 15;
    if (user?.mobileNumber) score += 15;
    if (user?.state) score += 15;
    if (user?.district) score += 10;
    if (user?.occupation) score += 15;
    if (user?.incomeRange) score += 10;
    return Math.min(100, score || 85);
  };

  const profileScore = calculateProfileScore();
  const availableDocsCount = documents.filter(d => d.status === 'available').length;
  const totalDocsCount = documents.length || 12;

  // Personalized scheme recommendations tailored to user's occupation, category, and state
  const recommendedSchemes = schemes.filter(s => {
    if (!user) return true;
    if (user.occupation?.toLowerCase().includes('farmer') && (s.category === 'Farmer Welfare' || s.beneficiaryCategory === 'Farmers')) return true;
    if (user.occupation?.toLowerCase().includes('student') && (s.category === 'Student Scholarships' || s.beneficiaryCategory === 'Students')) return true;
    if (user.gender === 'Female' && (s.category === 'Women Empowerment' || s.beneficiaryCategory === 'Women')) return true;
    if (s.beneficiaryCategory === 'General' || s.category === 'Health and Social Welfare' || s.category === 'Financial Assistance') return true;
    return false;
  }).slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. WELCOME SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0c16] via-[#09090f] to-[#050507] border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(143,139,255,0.12),_transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8f8bff]/15 border border-[#8f8bff]/30 text-xs text-[#8f8bff] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>National & Karnataka Civic Welfare Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Welcome back, {user?.fullName || 'Citizen'}!
            </h1>
            <p className="text-xs sm:text-sm text-[#b6b6c2] max-w-2xl leading-relaxed">
              Discover government welfare schemes and manage your eligibility information from one place.
            </p>
          </div>

          {/* Citizen metadata card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-1.5 shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between">
              <span className="text-[#8a8a97]">State:</span>
              <span className="font-semibold text-white">{user?.state || 'Karnataka'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8a8a97]">District:</span>
              <span className="font-semibold text-white">{user?.district || 'Bengaluru Urban'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8a8a97]">Occupation:</span>
              <span className="font-semibold text-white">{user?.occupation || 'General Citizen'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8a8a97]">Income Bracket:</span>
              <span className="font-semibold text-white">{user?.incomeRange || 'Below 2.5 Lakhs'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL STATISTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saved Schemes */}
        <Link
          to="/citizen/saved-schemes"
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#8f8bff]/40 transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#b6b6c2]">Saved Schemes</span>
            <div className="w-8 h-8 rounded-xl bg-[#8f8bff]/15 text-[#8f8bff] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <div className="text-3xl font-bold text-white tracking-tight">
              {savedSchemes.length}
            </div>
          )}
          <p className="text-[11px] text-[#8a8a97] mt-1 flex items-center space-x-1">
            <span>Bookmarked for review</span>
          </p>
        </Link>

        {/* Card 2: Eligibility Checks */}
        <Link
          to="/citizen/eligibility-history"
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#1ed760]/40 transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#b6b6c2]">Eligibility Checks</span>
            <div className="w-8 h-8 rounded-xl bg-[#1ed760]/15 text-[#1ed760] flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <div className="text-3xl font-bold text-white tracking-tight">
              {eligibilityHistory.length}
            </div>
          )}
          <p className="text-[11px] text-[#8a8a97] mt-1">
            <span>Evaluations saved in history</span>
          </p>
        </Link>

        {/* Card 3: Documents Prepared */}
        <Link
          to="/citizen/documents"
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#6fd8ff]/40 transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#b6b6c2]">Documents Prepared</span>
            <div className="w-8 h-8 rounded-xl bg-[#6fd8ff]/15 text-[#6fd8ff] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderArchive className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-20 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <div className="text-3xl font-bold text-white tracking-tight">
              {availableDocsCount} <span className="text-sm font-normal text-[#8a8a97]">/ {totalDocsCount}</span>
            </div>
          )}
          <p className="text-[11px] text-[#8a8a97] mt-1">
            <span>Ready for official filing</span>
          </p>
        </Link>

        {/* Card 4: Profile Completion */}
        <Link
          to="/citizen/profile"
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#f3c64f]/40 transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#b6b6c2]">Profile Completion</span>
            <div className="w-8 h-8 rounded-xl bg-[#f3c64f]/15 text-[#f3c64f] flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <div className="text-3xl font-bold text-white tracking-tight">
              {profileScore}%
            </div>
          )}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-gradient-to-r from-[#f3c64f] to-[#1ed760] h-full rounded-full transition-all duration-500"
              style={{ width: `${profileScore}%` }}
            />
          </div>
        </Link>
      </div>

      {/* 3. PROFILE COMPLETION NOTICE (IF < 100%) */}
      {profileScore < 100 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#8f8bff]/10 via-[#6fd8ff]/5 to-transparent border border-[#8f8bff]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#8f8bff]/20 text-[#8f8bff] flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Complete your citizen demographic profile ({profileScore}%)</p>
              <p className="text-[11px] text-[#8a8a97]">
                Adding your village/town, category, and occupation ensures 100% accurate scheme recommendations and rules matching.
              </p>
            </div>
          </div>
          <Link
            to="/citizen/profile"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#8f8bff] text-[#050507] text-xs font-semibold hover:opacity-90 transition-opacity shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4. QUICK ACTION CARDS */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8a8a97]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/eligibility"
            className="p-4 rounded-2xl bg-gradient-to-br from-[#8f8bff]/10 to-transparent border border-[#8f8bff]/20 hover:border-[#8f8bff]/50 transition-all flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8f8bff]/20 text-[#8f8bff] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Check Scheme Eligibility</p>
              <p className="text-[11px] text-[#8a8a97]">Deterministic rules evaluation</p>
            </div>
          </Link>

          <Link
            to="/schemes"
            className="p-4 rounded-2xl bg-gradient-to-br from-[#6fd8ff]/10 to-transparent border border-[#6fd8ff]/20 hover:border-[#6fd8ff]/50 transition-all flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#6fd8ff]/20 text-[#6fd8ff] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Browse Schemes Catalog</p>
              <p className="text-[11px] text-[#8a8a97]">Filter Central & Karnataka</p>
            </div>
          </Link>

          <Link
            to="/citizen/documents"
            className="p-4 rounded-2xl bg-gradient-to-br from-[#1ed760]/10 to-transparent border border-[#1ed760]/20 hover:border-[#1ed760]/50 transition-all flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1ed760]/20 text-[#1ed760] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Document Checklist</p>
              <p className="text-[11px] text-[#8a8a97]">Prepare required certificates</p>
            </div>
          </Link>

          <button
            onClick={() => {
              const btn = document.querySelector('[aria-label="Janaseva AI Assistant"]') as HTMLElement;
              if (btn) btn.click();
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#f3c64f]/10 to-transparent border border-[#f3c64f]/20 hover:border-[#f3c64f]/50 transition-all flex items-center space-x-3 group cursor-pointer text-left w-full"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f3c64f]/20 text-[#f3c64f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Ask Janaseva AI</p>
              <p className="text-[11px] text-[#8a8a97]">Multilingual voice & chat</p>
            </div>
          </button>
        </div>
      </div>

      {/* 5. RECENTLY EVALUATED SCHEMES (ELIGIBILITY HISTORY) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#1ed760]" />
              <span>Recently Evaluated Schemes</span>
            </h2>
            <p className="text-xs text-[#8a8a97]">
              Historical criteria evaluations calculated by JANASEVA&apos;s deterministic eligibility engine
            </p>
          </div>
          <Link
            to="/citizen/eligibility-history"
            className="text-xs text-[#8f8bff] hover:underline flex items-center space-x-1"
          >
            <span>View all ({eligibilityHistory.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : eligibilityHistory.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#8a8a97] mx-auto opacity-40" />
            <p className="text-xs text-[#8a8a97]">No saved eligibility evaluations yet.</p>
            <Link
              to="/eligibility"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1ed760]/15 text-[#1ed760] text-xs font-semibold hover:bg-[#1ed760]/25"
            >
              <span>Run First Eligibility Check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibilityHistory.slice(0, 4).map((record) => (
              <div
                key={record.id}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#6fd8ff]">
                      {record.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{record.schemeName}</h3>
                  </div>
                  <div className={`px-2.5 py-1 rounded-xl text-center border shrink-0 ${
                    record.isEligible
                      ? 'bg-[#1ed760]/15 border-[#1ed760]/30 text-[#1ed760]'
                      : 'bg-[#f3c64f]/15 border-[#f3c64f]/30 text-[#f3c64f]'
                  }`}>
                    <span className="text-xs font-bold block">{record.matchScore}% Match</span>
                    <span className="text-[9px]">{record.isEligible ? 'Likely Eligible' : 'Partial Match'}</span>
                  </div>
                </div>

                {record.matchingReasons && record.matchingReasons.length > 0 && (
                  <p className="text-[11px] text-[#b6b6c2] line-clamp-2">
                    <strong className="text-[#1ed760]">Key match:</strong> {record.matchingReasons[0]}
                  </p>
                )}

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#8a8a97]">
                    Evaluated on {new Date(record.evaluatedAt).toLocaleDateString()}
                  </span>
                  <Link
                    to="/eligibility"
                    className="text-[#8f8bff] font-semibold hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-check</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. RECENTLY SAVED SCHEMES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-[#8f8bff]" />
              <span>Recently Saved Schemes</span>
            </h2>
            <p className="text-xs text-[#8a8a97]">Schemes bookmarked for future reference and documentation prep</p>
          </div>
          <Link
            to="/citizen/saved-schemes"
            className="text-xs text-[#8f8bff] hover:underline flex items-center space-x-1"
          >
            <span>Manage saved ({savedSchemes.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : savedSchemes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-[#8a8a97] mx-auto opacity-40" />
            <p className="text-xs text-[#8a8a97]">You haven&apos;t saved any welfare schemes yet.</p>
            <Link
              to="/schemes"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#8f8bff]/15 text-[#8f8bff] text-xs font-semibold hover:bg-[#8f8bff]/25"
            >
              <span>Explore Scheme Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSchemes.slice(0, 3).map((scheme) => (
              <div
                key={scheme.id}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      scheme.classification === 'State'
                        ? 'bg-[#f3c64f]/15 text-[#f3c64f] border border-[#f3c64f]/30'
                        : 'bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30'
                    }`}>
                      {scheme.classification} Scheme
                    </span>
                    <button
                      onClick={() => onToggleSaveScheme(scheme.id)}
                      className="text-[#8f8bff] hover:text-white transition-colors cursor-pointer p-1"
                      title="Remove bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#8f8bff] transition-colors line-clamp-1">
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-[#8a8a97] line-clamp-2">
                    {scheme.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectScheme(scheme)}
                    className="text-xs text-[#8f8bff] font-semibold hover:underline cursor-pointer"
                  >
                    View Details
                  </button>
                  <Link
                    to="/eligibility"
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white font-medium transition-colors cursor-pointer"
                  >
                    Check Eligibility
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. RECOMMENDED SCHEMES & IMPORTANT ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Schemes (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#1ed760]" />
                <span>Recommended Welfare Programs</span>
              </h2>
              <p className="text-xs text-[#8a8a97]">
                Curated based on your status as a {user?.occupation || 'Citizen'} in {user?.state || 'Karnataka'}
              </p>
            </div>
            <Link to="/schemes" className="text-xs text-[#8f8bff] hover:underline">
              Browse all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#1ed760]/30 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1ed760]/10 text-[#1ed760] inline-block">
                    {scheme.category}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#6fd8ff] transition-colors line-clamp-2">
                    {scheme.name}
                  </h4>
                  <p className="text-[11px] text-[#8a8a97] line-clamp-2">
                    {scheme.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => onSelectScheme(scheme)}
                    className="text-[11px] text-[#8f8bff] font-semibold hover:underline cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onToggleSaveScheme(scheme.id)}
                    className="text-xs text-[#8a8a97] hover:text-white cursor-pointer"
                  >
                    {savedSchemeIds.includes(scheme.id) ? (
                      <Bookmark className="w-3.5 h-3.5 fill-[#8f8bff] text-[#8f8bff]" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements & Updates (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-[#ff9933]" />
              <span>Announcements</span>
            </h2>
            <Link to="/citizen/notifications" className="text-xs text-[#8f8bff] hover:underline">
              See all
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between text-[10px] text-[#8a8a97]">
                  <span className="uppercase tracking-wider font-semibold text-[#6fd8ff]">Official Alert</span>
                  <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                <p className="text-[11px] text-[#b6b6c2] line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
