import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History, CheckCircle2, AlertCircle, Trash2, ArrowRight,
  FileCheck, ShieldCheck, Sparkles, RefreshCw, Calendar
} from 'lucide-react';
import { api } from '../../services/api';
import { SavedEligibilityRecord } from '../../types';

export const EligibilityHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<SavedEligibilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getEligibilityHistory();
      if (res.success && res.history) {
        setHistory(res.history);
      }
    } catch (e) {
      console.warn('Failed loading eligibility history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string, schemeName: string) => {
    const ok = window.confirm(`Remove eligibility evaluation for "${schemeName}" from your history?`);
    if (ok) {
      await api.deleteEligibilityHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Saved Eligibility Evaluations</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30">
              {history.length} Evaluations
            </span>
          </div>
          <p className="text-xs text-[#8a8a97] mt-1">
            Historical assessments calculated by JANASEVA&apos;s deterministic eligibility engine based on your demographic profile.
          </p>
        </div>

        <Link
          to="/eligibility"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8f8bff] to-[#6fd8ff] text-[#050507] text-xs font-semibold transition-all cursor-pointer hover:opacity-90 shadow-md self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run New Eligibility Check</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-44 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0c0c12] border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1ed760]/10 text-[#1ed760] flex items-center justify-center mx-auto border border-[#1ed760]/20">
            <History className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Saved Eligibility Assessments</h3>
            <p className="text-xs text-[#8a8a97] max-w-md mx-auto">
              You haven&apos;t saved any scheme eligibility evaluations yet. Run an eligibility check to evaluate age, income, and state criteria.
            </p>
          </div>
          <Link
            to="/eligibility"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8f8bff] to-[#6fd8ff] text-[#050507] text-xs font-semibold cursor-pointer"
          >
            <span>Check My Scheme Eligibility</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <div
              key={record.id}
              className="p-6 rounded-3xl bg-[#0c0c12] border border-white/10 hover:border-white/20 transition-all space-y-4"
            >
              {/* Header row: Scheme name + match score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#6fd8ff]">
                      {record.category}
                    </span>
                    <span className="text-xs text-[#8a8a97] flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(record.evaluatedAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{record.schemeName}</h3>
                </div>

                <div className="flex items-center space-x-3 self-start sm:self-auto">
                  <div className={`px-3 py-1.5 rounded-2xl border text-center ${
                    record.isEligible
                      ? 'bg-[#1ed760]/15 border-[#1ed760]/30 text-[#1ed760]'
                      : 'bg-[#f3c64f]/15 border-[#f3c64f]/30 text-[#f3c64f]'
                  }`}>
                    <span className="text-xs font-bold block">{record.matchScore}% Match</span>
                    <span className="text-[10px]">{record.isEligible ? 'Likely Eligible' : 'Partially Eligible'}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(record.id, record.schemeName)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-[#8a8a97] hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Evaluated Demographic Criteria Chips */}
              {record.inputCriteria && (
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8a8a97]">
                  <span>Age: <strong className="text-white">{record.inputCriteria.age}</strong></span>
                  <span>State: <strong className="text-white">{record.inputCriteria.state}</strong></span>
                  <span>Occupation: <strong className="text-white">{record.inputCriteria.occupation}</strong></span>
                  <span>Category: <strong className="text-white">{record.inputCriteria.beneficiaryCategory}</strong></span>
                  <span>Annual Income: <strong className="text-white">₹{record.inputCriteria.annualIncome.toLocaleString('en-IN')}</strong></span>
                </div>
              )}

              {/* Matching & Unmet Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {record.matchingReasons && record.matchingReasons.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-[#1ed760] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Satisfied Criteria ({record.matchingReasons.length})</span>
                    </p>
                    <ul className="space-y-1 text-[#b6b6c2]">
                      {record.matchingReasons.map((r, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-[#1ed760] mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {record.unmetConditions && record.unmetConditions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-[#f3c64f] flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Unmet Criteria / Discrepancies ({record.unmetConditions.length})</span>
                    </p>
                    <ul className="space-y-1 text-[#b6b6c2]">
                      {record.unmetConditions.map((u, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-[#f3c64f] mt-0.5">•</span>
                          <span>{u}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Required Documents */}
              {record.requiredDocuments && record.requiredDocuments.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <p className="text-[11px] font-semibold text-[#8a8a97]">Mandatory Documentation Required:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {record.requiredDocuments.map((doc, idx) => (
                      <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-[#b6b6c2] border border-white/5">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recheck Action */}
              <div className="pt-2 flex justify-end">
                <Link
                  to="/eligibility"
                  className="inline-flex items-center space-x-1.5 text-xs text-[#8f8bff] font-semibold hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-evaluate With New Criteria</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
