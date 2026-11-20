import React, { useState, useEffect } from 'react';
import {
  FolderArchive, CheckCircle2, Clock, MinusCircle, Printer,
  Save, AlertCircle, Sparkles, FileText, Plus, ShieldCheck,
  Check, Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import { DocumentItem } from '../../types';

export const MyDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments();
      if (res.success && res.documents) {
        setDocuments(res.documents);
      }
    } catch (e) {
      console.warn('Failed loading documents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleStatusChange = async (docId: string, newStatus: 'available' | 'pending' | 'not_applicable') => {
    const updated = documents.map(d => d.id === docId ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d);
    setDocuments(updated);
    try {
      await api.updateDocuments(updated);
      setToastMessage('Document status updated.');
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
      setToastMessage('All checklist notes and details saved.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categories = ['All', 'Identity', 'Residence', 'Income & Caste', 'Agriculture & Land', 'Education', 'Other'];

  const filteredDocs = documents.filter(d => {
    if (selectedCategory === 'All') return true;
    return d.category === selectedCategory;
  });

  const availableCount = documents.filter(d => d.status === 'available').length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto print:p-0 print:bg-white print:text-black">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#101016] border border-[#1ed760]/30 text-[#1ed760] text-xs shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200 print:hidden">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Advisory Banner */}
      <div className="p-4 rounded-2xl bg-[#8f8bff]/10 border border-[#8f8bff]/20 text-white text-xs flex items-start space-x-3 print:hidden">
        <ShieldCheck className="w-5 h-5 text-[#8f8bff] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[#8f8bff]">Document Preparation Readiness Checklist</p>
          <p className="text-[#b6b6c2] leading-relaxed">
            In compliance with the Digital Personal Data Protection (DPDP) Act 2023, physical documents are never stored or uploaded here. Use this preparation ledger to verify which certificates, RD numbers, and identification cards you have ready before visiting Grama One or official portals.
          </p>
        </div>
      </div>

      {/* Header and Print Action */}
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
            Verify mandatory documents required for DBT transfers, state scholarships, and agriculture subsidies.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto print:hidden">
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

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 print:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#8f8bff] text-[#050507] font-semibold'
                : 'bg-white/[0.04] text-[#b6b6c2] hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-[#0c0c12] border border-white/10 overflow-hidden divide-y divide-white/5 print:bg-white print:border-gray-300 print:divide-gray-200">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white print:text-black">{doc.name}</span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-white/[0.04] text-[#8a8a97] print:text-gray-600 print:bg-gray-100">
                    {doc.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={doc.documentNumber || ''}
                    onChange={(e) => handleDocNumberChange(doc.id, e.target.value)}
                    placeholder="Doc / RD / Certificate number (optional)"
                    className="h-8 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder:text-[#8a8a97] text-xs focus:outline-none print:border-gray-400 print:text-black"
                  />
                  <input
                    type="text"
                    value={doc.notes || ''}
                    onChange={(e) => handleNoteChange(doc.id, e.target.value)}
                    placeholder="Personal notes (e.g. Valid till 2027)"
                    className="h-8 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder:text-[#8a8a97] text-xs focus:outline-none print:border-gray-400 print:text-black"
                  />
                </div>
              </div>

              {/* Status Switcher Radio / Buttons */}
              <div className="flex items-center space-x-1.5 shrink-0 self-start md:self-center print:hidden">
                <button
                  type="button"
                  onClick={() => handleStatusChange(doc.id, 'available')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
                    doc.status === 'available'
                      ? 'bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/40'
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
                      ? 'bg-[#ff9933]/20 text-[#ff9933] border border-[#ff9933]/40'
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
                Status: {doc.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
