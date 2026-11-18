import React, { useState, useEffect } from 'react';
import { 
  Bookmark, FileCheck, Plus, Trash2, 
  CheckCircle2, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Scheme, ApplicationRecord } from '../types';
import { SchemeCard } from '../components/SchemeCard';
import { useLanguage } from '../context/LanguageContext';

interface DashboardPageProps {
  schemes: Scheme[];
  onSelectScheme: (scheme: Scheme) => void;
  onToggleSaveScheme: (schemeId: string) => void;
  savedSchemeIds: string[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  schemes,
  onSelectScheme,
  onToggleSaveScheme,
  savedSchemeIds
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved' | 'applications'>('recommended');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // New Application Modal State
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newSchemeId, setNewSchemeId] = useState(schemes[0]?.id || '');
  const [newRefNo, setNewRefNo] = useState('');
  const [newAppliedDate, setNewAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState<'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected'>('Submitted');
  const [newNotes, setNewNotes] = useState('');

  const loadUserData = async () => {
    setLoading(true);
    try {
      const appsRes = await api.getApplications();
      if (appsRes.success) setApplications(appsRes.applications);
    } catch (e) {
      console.error('Failed loading apps:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefNo.trim()) return;

    await api.addApplication({
      schemeId: newSchemeId,
      applicationRefNo: newRefNo.trim(),
      appliedDate: newAppliedDate,
      status: newStatus,
      notes: newNotes.trim()
    });

    setShowAddAppModal(false);
    setNewRefNo('');
    setNewNotes('');
    loadUserData();
  };

  const handleDeleteApp = async (id: string) => {
    await api.deleteApplication(id);
    loadUserData();
  };

  const handleStatusChange = async (id: string, status: any) => {
    await api.updateApplication(id, { status });
    loadUserData();
  };

  // Recommendations: matches user occupation or general schemes
  const recommendedSchemes = schemes.filter(s => {
    if (!user) return true;
    if (user.occupation === 'Farmer' && s.category === 'Farmer Welfare') return true;
    if (user.occupation === 'Student' && s.category === 'Student Scholarships') return true;
    if (user.occupation === 'Homemaker' && s.category === 'Women Empowerment') return true;
    return s.beneficiaryCategory === 'General';
  });

  const savedSchemes = schemes.filter(s => savedSchemeIds.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-[#f5f5f8]">
      {/* Welcome Banner */}
      <div className="bytune-card p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,_rgba(143,139,255,0.12),_transparent_70%)] pointer-events-none" />
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8f8bff]">
            Citizen Public Service Hub
          </span>
          <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f5f5f8]">
            Welcome, {user?.fullName || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-[#b6b6c2] font-normal">
            Manage your personal scheme recommendations, bookmarked programs, and citizen application tracking ledger.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs space-y-1 text-[#b6b6c2] shrink-0 font-mono">
          <p>State: <strong className="text-[#f5f5f8]">{user?.state || 'Karnataka'}</strong></p>
          <p>Occupation: <strong className="text-[#f5f5f8]">{user?.occupation || 'Farmer'}</strong></p>
          <p>Income: <strong className="text-[#f5f5f8]">{user?.incomeRange || '1 Lakh - 2.5 Lakhs'}</strong></p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/[0.06] space-x-2 text-xs">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'recommended'
              ? 'border-[#8f8bff] text-[#f5f5f8] font-semibold'
              : 'border-transparent text-[#8a8a97] hover:text-[#f5f5f8]'
          }`}
        >
          <span>Recommended For You</span>
          <span className="px-2 py-0.5 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] text-[10px] font-mono">
            {recommendedSchemes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'saved'
              ? 'border-[#8f8bff] text-[#f5f5f8] font-semibold'
              : 'border-transparent text-[#8a8a97] hover:text-[#f5f5f8]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Bookmarks</span>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#b6b6c2] text-[10px] font-mono">
            {savedSchemes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'applications'
              ? 'border-[#8f8bff] text-[#f5f5f8] font-semibold'
              : 'border-transparent text-[#8a8a97] hover:text-[#f5f5f8]'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Application Tracker</span>
          <span className="px-2 py-0.5 rounded-full bg-[#1ed760]/15 text-[#1ed760] text-[10px] font-mono">
            {applications.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Recommended */}
      {activeTab === 'recommended' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#8a8a97]">
            <span>Tailored based on profile: <strong className="text-[#f5f5f8]">{user?.occupation || 'Farmer'}</strong> in <strong className="text-[#f5f5f8]">{user?.state || 'Karnataka'}</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onViewDetails={onSelectScheme}
                isSaved={savedSchemeIds.includes(scheme.id)}
                onToggleSave={onToggleSaveScheme}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Saved */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedSchemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  onViewDetails={onSelectScheme}
                  isSaved={true}
                  onToggleSave={onToggleSaveScheme}
                />
              ))}
            </div>
          ) : (
            <div className="bytune-card p-12 text-center space-y-3">
              <Bookmark className="w-8 h-8 text-[#8a8a97] mx-auto" />
              <h3 className="font-medium text-base text-[#f5f5f8]">No Bookmarked Schemes Yet</h3>
              <p className="text-xs text-[#8a8a97] max-w-sm mx-auto font-normal">
                Click the bookmark ribbon on any scheme in the directory to save it here for quick reference.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Application Tracker */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-medium text-[#f5f5f8]">Citizen Application Ledger</h3>
              <p className="text-xs text-[#8a8a97] font-normal">
                Track your submitted applications, record official acknowledgment numbers, and note updates.
              </p>
            </div>

            <button
              onClick={() => setShowAddAppModal(true)}
              className="bytune-btn-solid flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0a0a0c]" />
              <span>Record New Application</span>
            </button>
          </div>

          {applications.length > 0 ? (
            <div className="bytune-card overflow-hidden divide-y divide-white/[0.06]">
              {applications.map((app) => {
                const schemeObj = app.scheme || schemes.find(s => s.id === app.schemeId);
                return (
                  <div key={app.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">
                          {schemeObj?.classification || 'Welfare'}
                        </span>
                        <span className="text-xs font-mono font-medium text-[#f5f5f8] bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full">
                          Ref: {app.applicationRefNo}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-[#f5f5f8]">{schemeObj?.name || 'Welfare Scheme'}</h4>
                      <p className="text-xs text-[#b6b6c2]">{app.notes || 'No remarks recorded.'}</p>
                      <p className="text-[10px] text-[#8a8a97] font-mono">Date Applied: {app.appliedDate}</p>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
                      {/* Status Dropdown */}
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`text-xs font-medium px-3.5 py-1.5 rounded-full border focus:outline-none bg-[#101016] ${
                          app.status === 'Approved' ? 'text-[#1ed760] border-[#1ed760]/30' :
                          app.status === 'In Review' ? 'text-[#f3c64f] border-[#f3c64f]/30' :
                          app.status === 'Rejected' ? 'text-rose-400 border-rose-500/30' :
                          'text-[#8f8bff] border-[#8f8bff]/30'
                        }`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Submitted">Submitted</option>
                        <option value="In Review">In Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="bytune-pill p-2 text-[#8a8a97] hover:text-rose-400 cursor-pointer"
                        title="Delete Application Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bytune-card p-12 text-center space-y-3">
              <FileCheck className="w-8 h-8 text-[#8a8a97] mx-auto" />
              <h3 className="font-medium text-base text-[#f5f5f8]">No Applications Recorded Yet</h3>
              <p className="text-xs text-[#8a8a97] max-w-sm mx-auto font-normal">
                Once you apply on Seva Sindhu or PM-Kisan portal, click "Record New Application" to maintain a personal tracking history.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Record New Application Modal */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-50 bg-[#050507]/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bytune-card max-w-md w-full shadow-2xl overflow-hidden border border-white/10">
            <div className="bg-[#0a0a0e]/90 p-5 flex items-center justify-between border-b border-white/[0.08]">
              <h3 className="font-medium text-sm text-[#f5f5f8]">Record Application Information</h3>
              <button onClick={() => setShowAddAppModal(false)} className="bytune-pill p-1 text-[#8a8a97] hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">Select Scheme</label>
                <select
                  value={newSchemeId}
                  onChange={(e) => setNewSchemeId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-full border border-white/10 bg-[#101016] text-xs font-medium text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                >
                  {schemes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.classification})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">Application Reference Number</label>
                <input
                  type="text"
                  required
                  value={newRefNo}
                  onChange={(e) => setNewRefNo(e.target.value)}
                  placeholder="e.g. KAR-GLY-2026-9812 or PMK-1827"
                  className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={newAppliedDate}
                    onChange={(e) => setNewAppliedDate(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Current Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full py-2.5 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">Notes / Submission Center</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Submitted through Grama One center with Ration Card and Aadhaar."
                  className="w-full py-2 px-3 rounded-2xl border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bytune-btn-solid w-full py-3 rounded-full text-xs font-semibold cursor-pointer mt-2"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
