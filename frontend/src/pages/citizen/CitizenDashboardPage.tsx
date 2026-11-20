import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark, FileText, CheckCircle2, Bell, ArrowRight,
  Sparkles, Compass, FolderArchive, Bot, Clock, ExternalLink,
  ChevronRight, AlertCircle, Building2, ShieldCheck, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Scheme, ApplicationRecord, SavedEligibilityRecord, AppNotification } from '../../types';

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

  const [savedSchemes, setSavedSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [eligibilityHistory, setEligibilityHistory] = useState<SavedEligibilityRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [savedRes, appsRes, evalRes, notifRes] = await Promise.all([
        api.getSavedSchemes(),
        api.getApplications(),
        api.getEligibilityHistory(),
        api.getNotifications()
      ]);

      if (savedRes.success && savedRes.schemes) setSavedSchemes(savedRes.schemes);
      if (appsRes.success && appsRes.applications) setApplications(appsRes.applications);
      if (evalRes.success && evalRes.history) setEligibilityHistory(evalRes.history);
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

  // Personalized scheme recommendations tailored to user's occupation, category, and state
  const recommendedSchemes = schemes.filter(s => {
    if (!user) return true;
    if (user.occupation?.toLowerCase().includes('farmer') && (s.category === 'Farmer Welfare' || s.beneficiaryCategory === 'Farmers')) return true;
    if (user.occupation?.toLowerCase().includes('student') && (s.category === 'Student Scholarships' || s.beneficiaryCategory === 'Students')) return true;
    if (user.gender === 'Female' && (s.category === 'Women Empowerment' || s.beneficiaryCategory === 'Women')) return true;
    if (s.beneficiaryCategory === 'General' || s.category === 'Health and Social Welfare' || s.category === 'Financial Assistance') return true;
    return false;
  }).slice(0, 4);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30">Approved</span>;
      case 'In Review':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">In Review</span>;
      case 'Submitted':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#6fd8ff]/15 text-[#6fd8ff] border border-[#6fd8ff]/30">Submitted</span>;
      case 'Rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-[#b6b6c2] border border-white/10">Draft</span>;
    }
  };

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
              Discover government schemes, evaluate your eligibility, and manage your applications from one place.
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
              <span className="font-semibold text-white">{user?.district || 'Bengaluru'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8a8a97]">Occupation:</span>
              <span className="font-semibold text-white">{user?.occupation || 'Farmer'}</span>
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
        {/* Saved Schemes */}
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
          <div className="text-3xl font-bold text-white tracking-tight">
            {savedSchemes.length}
          </div>
          <p className="text-[11px] text-[#8a8a97] mt-1 flex items-center space-x-1">
            <span>Bookmarked for quick access</span>
          </p>
        </Link>

        {/* Applications Tracked */}
        <Link
          to="/citizen/applications"
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#6fd8ff]/40 transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#b6b6c2]">Applications Tracked</span>
            <div className="w-8 h-8 rounded-xl bg-[#6fd8ff]/15 text-[#6fd8ff] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {applications.length}
          </div>
          <p className="text-[11px] text-[#8a8a97] mt-1">
            <span>Citizen recorded submissions</span>
          </p>
        </Link>

        {/* Eligibility Checks */}
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
          <div className="text-3xl font-bold text-white tracking-tight">
            {eligibilityHistory.length}
          </div>
          <p className="text-[11px] text-[#8a8a97] mt-1">
            <span>Evaluations saved in history</span>
          </p>
        </Link>

        {/* Unread Notifications */}
        <Link
          to="/citizen/notifications"
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#ff9933]/40 transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#b6b6c2]">Unread Notifications</span>
            <div className="w-8 h-8 rounded-xl bg-[#ff9933]/15 text-[#ff9933] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {unreadNotificationsCount}
          </div>
          <p className="text-[11px] text-[#8a8a97] mt-1">
            <span>Welfare updates & alerts</span>
          </p>
        </Link>
      </div>

      {/* 3. QUICK ACTION CARDS */}
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
              <p className="text-[11px] text-[#8a8a97]">Instant rules evaluation</p>
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
              <p className="text-xs font-bold text-white">Browse All Schemes</p>
              <p className="text-[11px] text-[#8a8a97]">Filter Central & Karnataka</p>
            </div>
          </Link>

          <Link
            to="/citizen/applications"
            className="p-4 rounded-2xl bg-gradient-to-br from-[#1ed760]/10 to-transparent border border-[#1ed760]/20 hover:border-[#1ed760]/50 transition-all flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1ed760]/20 text-[#1ed760] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Track Application</p>
              <p className="text-[11px] text-[#8a8a97]">Record submission details</p>
            </div>
          </Link>

          <Link
            to="/citizen/documents"
            className="p-4 rounded-2xl bg-gradient-to-br from-[#f3c64f]/10 to-transparent border border-[#f3c64f]/20 hover:border-[#f3c64f]/50 transition-all flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f3c64f]/20 text-[#f3c64f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Document Checklist</p>
              <p className="text-[11px] text-[#8a8a97]">Prepare required proofs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. TWO-COLUMN CONTENT: RECENT APPLICATION ACTIVITY & IMPORTANT ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Applications Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#8f8bff]" />
              <span>Recent Application Activity</span>
            </h2>
            <Link
              to="/citizen/applications"
              className="text-xs text-[#8f8bff] hover:underline flex items-center space-x-1"
            >
              <span>View all ({applications.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] divide-y divide-white/5 overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <FileText className="w-8 h-8 text-[#8a8a97] mx-auto opacity-40" />
                <p className="text-xs text-[#8a8a97]">No applications recorded yet.</p>
                <Link
                  to="/citizen/applications"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#8f8bff]/15 text-[#8f8bff] text-xs font-semibold hover:bg-[#8f8bff]/25"
                >
                  <span>Add First Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              applications.slice(0, 3).map((app) => (
                <div key={app.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-white">
                        {app.scheme?.name || 'Welfare Scheme'}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-[11px] text-[#8a8a97] font-mono">
                      Ref: {app.applicationRefNo} • Submitted: {app.appliedDate}
                    </p>
                    {app.notes && (
                      <p className="text-[11px] text-[#b6b6c2] line-clamp-1 italic">
                        &ldquo;{app.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <Link
                    to="/citizen/applications"
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#b6b6c2] hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    View Timeline
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Important Announcements & Updates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-[#ff9933]" />
              <span>Announcements</span>
            </h2>
            <Link
              to="/citizen/notifications"
              className="text-xs text-[#8f8bff] hover:underline"
            >
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

      {/* 5. RECENTLY SAVED SCHEMES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-[#8f8bff]" />
              <span>Recently Saved Schemes</span>
            </h2>
            <p className="text-xs text-[#8a8a97]">Schemes bookmarked for future reference and eligibility checks</p>
          </div>
          <Link
            to="/citizen/saved-schemes"
            className="text-xs text-[#8f8bff] hover:underline flex items-center space-x-1"
          >
            <span>Manage saved ({savedSchemes.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {savedSchemes.length === 0 ? (
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
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#6fd8ff]">
                      {scheme.classification} Scheme
                    </span>
                    <button
                      onClick={() => onToggleSaveScheme(scheme.id)}
                      className="text-[#8f8bff] hover:text-white transition-colors cursor-pointer p-1"
                      title="Toggle bookmark"
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

      {/* 6. RECOMMENDED SCHEMES FOR CITIZEN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#1ed760]" />
              <span>Recommended For You</span>
            </h2>
            <p className="text-xs text-[#8a8a97]">
              Tailored based on your profile as a {user?.occupation || 'Citizen'} in {user?.state || 'Karnataka'}
            </p>
          </div>
          <Link to="/schemes" className="text-xs text-[#8f8bff] hover:underline">
            Browse all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
};
