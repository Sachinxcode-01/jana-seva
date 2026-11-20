import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Plus, Search, Filter, Calendar, Edit3, Trash2,
  Clock, CheckCircle2, AlertCircle, X, ExternalLink, ChevronRight,
  Info, Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import { Scheme, ApplicationRecord, ApplicationStatus } from '../../types';

interface CitizenApplicationsPageProps {
  schemes: Scheme[];
  onSelectScheme?: (scheme: Scheme) => void;
}

export const CitizenApplicationsPage: React.FC<CitizenApplicationsPageProps> = ({
  schemes,
  onSelectScheme
}) => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationRecord | null>(null);

  // Form Fields
  const [schemeId, setSchemeId] = useState(schemes[0]?.id || '');
  const [applicationRefNo, setApplicationRefNo] = useState('');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ApplicationStatus>('Submitted');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Timeline Detail Modal
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<ApplicationRecord | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getApplications();
      if (res.success && res.applications) {
        setApplications(res.applications);
      }
    } catch (e) {
      console.warn('Failed loading applications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const openAddModal = () => {
    setEditingApp(null);
    setSchemeId(schemes[0]?.id || '');
    setApplicationRefNo('');
    setAppliedDate(new Date().toISOString().split('T')[0]);
    setStatus('Submitted');
    setNotes('');
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (app: ApplicationRecord) => {
    setEditingApp(app);
    setSchemeId(app.schemeId);
    setApplicationRefNo(app.applicationRefNo);
    setAppliedDate(app.appliedDate);
    setStatus(app.status);
    setNotes(app.notes || '');
    setFormError(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!applicationRefNo.trim()) {
      setFormError('Please enter a valid application reference or acknowledgment number.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingApp) {
        const res = await api.updateApplication(editingApp.id, {
          schemeId,
          applicationRefNo: applicationRefNo.trim(),
          appliedDate,
          status,
          notes: notes.trim()
        });
        if (res.success) {
          setShowModal(false);
          loadApplications();
        } else {
          setFormError(res.message || 'Failed to update record.');
        }
      } else {
        const res = await api.addApplication({
          schemeId,
          applicationRefNo: applicationRefNo.trim(),
          appliedDate,
          status,
          notes: notes.trim()
        });
        if (res.success) {
          setShowModal(false);
          loadApplications();
        } else {
          setFormError(res.message || 'Failed to create record.');
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Server error saving application record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (app: ApplicationRecord) => {
    const ok = window.confirm(`Delete application record "${app.applicationRefNo}"?`);
    if (ok) {
      await api.deleteApplication(app.id);
      loadApplications();
      if (selectedAppForDetail?.id === app.id) {
        setSelectedAppForDetail(null);
      }
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(a => {
      const schemeName = a.scheme?.name || '';
      const matchesSearch =
        schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.applicationRefNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const getStatusBadge = (s: ApplicationStatus) => {
    switch (s) {
      case 'Approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30 flex items-center space-x-1"><CheckCircle2 className="w-3 h-3" /><span>Approved</span></span>;
      case 'In Review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30 flex items-center space-x-1"><Clock className="w-3 h-3" /><span>In Review</span></span>;
      case 'Submitted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#6fd8ff]/15 text-[#6fd8ff] border border-[#6fd8ff]/30 flex items-center space-x-1"><span>Submitted</span></span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>Rejected</span></span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#b6b6c2] border border-white/10">Draft</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Official Citizen-Maintained Advisory Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#ff9933]/10 border border-[#ff9933]/20 text-[#f5f5f8] text-xs flex items-start space-x-3">
        <Info className="w-5 h-5 text-[#ff9933] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[#ff9933]">Citizen-Maintained Application Tracking Ledger</p>
          <p className="text-[#b6b6c2] leading-relaxed">
            These records are maintained by you for personal tracking and audit purposes. To check official government departmental status, reference your acknowledgment number directly on the designated state or central departmental portal.
          </p>
        </div>
      </div>

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Citizen Application Tracker</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">
              {applications.length} Records
            </span>
          </div>
          <p className="text-xs text-[#8a8a97] mt-1">
            Log and track your submitted welfare applications, acknowledgment slips, and departmental status timeline.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8f8bff] to-[#6fd8ff] text-[#050507] text-xs font-semibold transition-all cursor-pointer hover:opacity-90 shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application Record</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-[#0c0c12] border border-white/10 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scheme name, reference number, or notes..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-xs focus:outline-none focus:border-[#8f8bff]"
          />
          <Search className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#101016]">All Statuses</option>
            <option value="Draft" className="bg-[#101016]">Draft</option>
            <option value="Submitted" className="bg-[#101016]">Submitted</option>
            <option value="In Review" className="bg-[#101016]">In Review</option>
            <option value="Approved" className="bg-[#101016]">Approved</option>
            <option value="Rejected" className="bg-[#101016]">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0c0c12] border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8f8bff]/10 text-[#8f8bff] flex items-center justify-center mx-auto border border-[#8f8bff]/20">
            <FileText className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Application Records Found</h3>
            <p className="text-xs text-[#8a8a97] max-w-md mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? 'No application records match your filter criteria.'
                : 'Keep a digital ledger of your scheme application reference numbers and physical visit details.'}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8f8bff] to-[#6fd8ff] text-[#050507] text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Your First Application</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-[#0c0c12] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {app.scheme?.name || 'Welfare Scheme'}
                  </span>
                  {getStatusBadge(app.status)}
                  <span className="text-[10px] text-[#8a8a97] uppercase px-2 py-0.5 rounded bg-white/[0.04]">
                    {app.scheme?.classification || 'Central'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8a8a97] font-mono">
                  <span>Ref: <strong className="text-white">{app.applicationRefNo}</strong></span>
                  <span>Submitted: <strong className="text-white">{app.appliedDate}</strong></span>
                  {app.updatedAt && (
                    <span>Last Updated: {new Date(app.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>

                {app.notes && (
                  <p className="text-xs text-[#b6b6c2] bg-white/[0.02] p-2 rounded-lg border border-white/5 line-clamp-2">
                    {app.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => setSelectedAppForDetail(app)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#b6b6c2] hover:text-white transition-colors cursor-pointer"
                >
                  Timeline
                </button>
                <button
                  onClick={() => openEditModal(app)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8a8a97] hover:text-[#8f8bff] transition-colors cursor-pointer"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(app)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-[#8a8a97] hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT APPLICATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0c0c12] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {editingApp ? 'Edit Application Record' : 'Record New Application'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#8a8a97] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">Select Government Scheme *</label>
                <select
                  value={schemeId}
                  onChange={(e) => setSchemeId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8f8bff]"
                >
                  {schemes.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#101016]">
                      {s.name} ({s.classification})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">
                  Application Reference / Acknowledgment Number *
                </label>
                <input
                  type="text"
                  value={applicationRefNo}
                  onChange={(e) => setApplicationRefNo(e.target.value)}
                  placeholder="e.g. KA-SSP-2026-90412 or PMK-88123"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8f8bff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#b6b6c2]">Submission Date *</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8f8bff]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#b6b6c2]">Citizen Recorded Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8f8bff]"
                  >
                    <option value="Draft" className="bg-[#101016]">Draft</option>
                    <option value="Submitted" className="bg-[#101016]">Submitted</option>
                    <option value="In Review" className="bg-[#101016]">In Review</option>
                    <option value="Approved" className="bg-[#101016]">Approved</option>
                    <option value="Rejected" className="bg-[#101016]">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b6b6c2]">
                  Personal Notes & Submission Center <span className="text-[10px] text-[#8a8a97]">(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Submitted at Grama One Maddur with RTC and Aadhaar e-KYC receipt."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8f8bff]"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#b6b6c2] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#8f8bff] text-[#050507] font-semibold text-xs cursor-pointer hover:opacity-90 flex items-center space-x-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingApp ? 'Save Changes' : 'Record Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLICATION DETAILS & TIMELINE MODAL */}
      {selectedAppForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0c0c12] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white">{selectedAppForDetail.scheme?.name || 'Welfare Scheme'}</h3>
                <p className="text-xs text-[#8a8a97] font-mono">Ref: {selectedAppForDetail.applicationRefNo}</p>
              </div>
              <button
                onClick={() => setSelectedAppForDetail(null)}
                className="p-1.5 rounded-lg text-[#8a8a97] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                <span className="text-[#8a8a97]">Current Recorded Status</span>
                {getStatusBadge(selectedAppForDetail.status)}
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Application Timeline</h4>
                <div className="relative pl-6 space-y-4 border-l border-white/10 my-2">
                  {(selectedAppForDetail.timeline && selectedAppForDetail.timeline.length > 0) ? (
                    selectedAppForDetail.timeline.map((event, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#8f8bff] border-2 border-[#0c0c12]" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{event.status}</span>
                          <span className="text-[11px] text-[#8a8a97]">{event.date}</span>
                        </div>
                        <p className="text-xs text-[#b6b6c2]">{event.note}</p>
                      </div>
                    ))
                  ) : (
                    <div className="relative space-y-1">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#8f8bff] border-2 border-[#0c0c12]" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{selectedAppForDetail.status}</span>
                        <span className="text-[11px] text-[#8a8a97]">{selectedAppForDetail.appliedDate}</span>
                      </div>
                      <p className="text-xs text-[#b6b6c2]">Initial record created by citizen.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Official portal link */}
              {selectedAppForDetail.scheme?.officialWebsite && (
                <div className="pt-2">
                  <a
                    href={selectedAppForDetail.scheme.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#8f8bff] flex items-center justify-center space-x-2 border border-white/10"
                  >
                    <span>Check Official Departmental Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
