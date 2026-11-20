import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderArchive, CheckCircle2, Clock, MinusCircle, Printer,
  Save, AlertCircle, Sparkles, FileText, Plus, ShieldCheck,
  Check, Loader2, Search, Filter, RotateCcw, Building2, ExternalLink
} from 'lucide-react';
import { api, FALLBACK_SCHEMES } from '../../services/api';
import { DocumentItem, Scheme } from '../../types';

export const MyDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>(FALLBACK_SCHEMES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'available' | 'pending' | 'not_applicable'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadDocumentsAndSchemes = async () => {
    setLoading(true);
    try {
      const [docRes, schemeRes] = await Promise.all([
        api.getDocuments(),
        api.getSchemes()
      ]);
      if (docRes.success && docRes.documents) {
        setDocuments(docRes.documents);
      }
      if (schemeRes.success && schemeRes.schemes) {
        setSchemes(schemeRes.schemes);
      }
    } catch (e) {
      console.warn('Failed loading documents or schemes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentsAndSchemes();
  }, []);

  const handleStatusChange = async (docId: string, newStatus: 'available' | 'pending' | 'not_applicable') => {
    const updated = documents.map(d => d.id === docId ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d);
    setDocuments(updated);
    try {
      await api.updateSingleDocument(docId, { status: newStatus });
      setToastMessage(`Document marked as ${newStatus.replace('_', ' ').toUpperCase()}.`);
      setTimeout(() => setToastMessage(null), 2500);
    } catch { }
  };

  const handleNoteChange = (docId: string, notes: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, notes } : d));
  };

  const handleDocNumberChange = (docId: string, documentNumber: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, documentNumber } : d));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await api.updateDocuments(documents);
      setToastMessage('All checklist document numbers and personal notes saved.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleClearChecklist = async () => {
    const confirmClear = window.confirm('Reset all document statuses to pending and clear custom certificate numbers?');
    if (!confirmClear) return;

    const resetDocs = documents.map(d => ({
      ...d,
      status: 'pending' as const,
      documentNumber: '',
      notes: '',
      updatedAt: new Date().toISOString()
    }));
    setDocuments(resetDocs);
    await api.updateDocuments(resetDocs);
    setToastMessage('Checklist has been cleared and reset to initial status.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Find which schemes require a particular document
  const getSchemesRequiringDoc = (doc: DocumentItem): Scheme[] => {
    const docKeywords = doc.name.toLowerCase().split(/[\s,()/-]+/).filter(w => w.length > 3);
    return schemes.filter(s => {
      const allDocsText = (s.requiredDocuments || []).join(' ').toLowerCase();
      if (doc.category === 'Identity' && allDocsText.includes('identity')) return true;
      if (doc.category === 'Income' && (allDocsText.includes('income') || allDocsText.includes('rd number'))) return true;
      if (doc.category === 'Residence' && (allDocsText.includes('ration') || allDocsText.includes('residential') || allDocsText.includes('domicile'))) return true;
      if (doc.category === 'Education' && (s.category === 'Student Scholarships' || allDocsText.includes('marks') || allDocsText.includes('admission') || allDocsText.includes('bonafide'))) return true;
      if (doc.category === 'Category' && (allDocsText.includes('caste') || allDocsText.includes('ews') || allDocsText.includes('community'))) return true;
      if (doc.category === 'Banking' && (allDocsText.includes('bank') || allDocsText.includes('passbook') || allDocsText.includes('dbt'))) return true;
      if (doc.category === 'Agriculture & Land' && (allDocsText.includes('land') || allDocsText.includes('rtc') || allDocsText.includes('pahani'))) return true;
      return docKeywords.some(kw => allDocsText.includes(kw));
    }).slice(0, 3);
  };

  const categories = [
    'All',
    'Identity',
    'Income',
    'Residence',
    'Education',
    'Category',
    'Banking',
    'Agriculture & Land',
    'Other'
  ];

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.documentNumber && d.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
      const matchesAvailability = availabilityFilter === 'All' || d.status === availabilityFilter;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [documents, searchQuery, selectedCategory, availabilityFilter]);

  const availableCount = documents.filter(d => d.status === 'available').length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const notAppCount = documents.filter(d => d.status === 'not_applicable').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto print:p-0 print:bg-white print:text-black">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#101016] border border-[#1ed760]/30 text-[#1ed760] text-xs shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200 print:hidden">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Advisory Banner (DPDP Act Compliance) */}
      <div className="p-4 rounded-2xl bg-[#8f8bff]/10 border border-[#8f8bff]/20 text-white text-xs flex items-start space-x-3 print:hidden">
        <ShieldCheck className="w-5 h-5 text-[#8f8bff] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[#8f8bff]">Citizen Document Preparation Readiness Checklist</p>
          <p className="text-[#b6b6c2] leading-relaxed">
            In compliance with the Digital Personal Data Protection (DPDP) Act 2023, physical documents and sensitive certificates are never uploaded or stored here. This tool is a preparation readiness checklist to ensure you have the mandatory papers and RD numbers ready before visiting Grama One, Seva Sindhu, or departmental portals.
          </p>
        </div>
      </div>

      {/* Header, Stats, and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight print:text-black">
              Citizen Document Preparation Checklist
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30 print:hidden">
              {availableCount} Available / {pendingCount} Pending
            </span>
          </div>
          <p className="text-xs text-[#8a8a97] mt-1 print:text-gray-600">
            Verify readiness of identification, income, residence, caste, education, and banking records required for welfare schemes.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto print:hidden">
          <button
            onClick={handleClearChecklist}
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 hover:text-rose-400 border border-white/10 text-xs font-semibold text-[#8a8a97] transition-colors cursor-pointer"
            title="Reset all checklist items"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#8f8bff]" />
            <span>Print Checklist</span>
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#8f8bff] text-[#050507] text-xs font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Details</span>
          </button>
        </div>
      </div>

      {/* Summary Readiness Cards */}
      <div className="grid grid-cols-3 gap-3 print:hidden">
        <div className="p-3.5 rounded-2xl bg-[#1ed760]/10 border border-[#1ed760]/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#1ed760]">Ready & Available</p>
            <p className="text-xl font-bold text-white mt-0.5">{availableCount}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-[#1ed760] opacity-80" />
        </div>

        <div className="p-3.5 rounded-2xl bg-[#ff9933]/10 border border-[#ff9933]/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#ff9933]">Pending Verification</p>
            <p className="text-xl font-bold text-white mt-0.5">{pendingCount}</p>
          </div>
          <Clock className="w-6 h-6 text-[#ff9933] opacity-80" />
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#8a8a97]">Not Applicable</p>
            <p className="text-xl font-bold text-white mt-0.5">{notAppCount}</p>
          </div>
          <MinusCircle className="w-6 h-6 text-[#8a8a97] opacity-80" />
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0c0c12] border border-white/10 space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by name, category, or certificate number..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-xs focus:outline-none focus:border-[#8f8bff]"
            />
            <Search className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3" />
          </div>

          {/* Availability Status Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#101016]">All Statuses</option>
              <option value="available" className="bg-[#101016]">Available Only</option>
              <option value="pending" className="bg-[#101016]">Pending Only</option>
              <option value="not_applicable" className="bg-[#101016]">Not Applicable</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#8f8bff] text-[#050507] font-semibold shadow-sm'
                  : 'bg-white/[0.04] text-[#b6b6c2] hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0c0c12] border border-white/10 text-center space-y-4">
          <FolderArchive className="w-12 h-12 text-[#8a8a97] mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Matching Documents</h3>
            <p className="text-xs text-[#8a8a97]">
              No checklist items match your active search or availability filter.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setAvailabilityFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer hover:bg-white/15"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-[#0c0c12] border border-white/10 overflow-hidden divide-y divide-white/5 print:bg-white print:border-gray-300 print:divide-gray-200">
          {filteredDocs.map((doc) => {
            const requiringSchemes = getSchemesRequiringDoc(doc);
            return (
              <div
                key={doc.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-sm font-bold text-white print:text-black">{doc.name}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-[#6fd8ff] print:text-gray-600 print:bg-gray-100">
                      {doc.category}
                    </span>
                    {doc.status === 'available' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30 print:hidden">
                        Ready
                      </span>
                    ) : doc.status === 'pending' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ff9933]/15 text-[#ff9933] border border-[#ff9933]/30 print:hidden">
                        Pending
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#8a8a97] print:hidden">
                        N/A
                      </span>
                    )}
                  </div>

                  {/* Inputs for Document Reference Number and Personal Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={doc.documentNumber || ''}
                      onChange={(e) => handleDocNumberChange(doc.id, e.target.value)}
                      placeholder="Certificate / RD number (e.g. RD003847291)"
                      className="h-8 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder:text-[#8a8a97] text-xs focus:outline-none focus:border-[#8f8bff] print:border-gray-400 print:text-black"
                    />
                    <input
                      type="text"
                      value={doc.notes || ''}
                      onChange={(e) => handleNoteChange(doc.id, e.target.value)}
                      placeholder="Personal notes (e.g. In physical file / Valid till 2027)"
                      className="h-8 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder:text-[#8a8a97] text-xs focus:outline-none focus:border-[#8f8bff] print:border-gray-400 print:text-black"
                    />
                  </div>

                  {/* Schemes requiring this document */}
                  {requiringSchemes.length > 0 && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#8a8a97] print:text-gray-600">
                      <span className="font-semibold text-white/70 print:text-gray-800">Required by:</span>
                      <div className="flex flex-wrap gap-1">
                        {requiringSchemes.map(s => (
                          <span key={s.id} className="px-2 py-0.5 rounded bg-white/[0.03] text-[#b6b6c2] border border-white/5 text-[10px]">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Switcher Radio / Buttons */}
                <div className="flex items-center space-x-1.5 shrink-0 self-start md:self-center print:hidden">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(doc.id, 'available')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
                      doc.status === 'available'
                        ? 'bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/40 shadow-sm'
                        : 'bg-white/5 text-[#8a8a97] hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Available</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(doc.id, 'pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
                      doc.status === 'pending'
                        ? 'bg-[#ff9933]/20 text-[#ff9933] border border-[#ff9933]/40 shadow-sm'
                        : 'bg-white/5 text-[#8a8a97] hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(doc.id, 'not_applicable')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
                      doc.status === 'not_applicable'
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-white/5 text-[#8a8a97] hover:text-white'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>N/A</span>
                  </button>
                </div>

                {/* Printable status indicator */}
                <div className="hidden print:block text-xs font-semibold">
                  Status: {doc.status.toUpperCase()} {doc.documentNumber ? `(${doc.documentNumber})` : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
