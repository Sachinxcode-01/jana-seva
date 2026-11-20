import React, { useState } from 'react';
import { Scale, CheckCircle2, X, ExternalLink, Plus, Eye, Bookmark, BookmarkCheck } from 'lucide-react';
import { Scheme } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ComparePageProps {
  schemes: Scheme[];
  onSelectScheme: (scheme: Scheme) => void;
  savedSchemeIds?: string[];
  onToggleSaveScheme?: (schemeId: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  schemes,
  onSelectScheme,
  savedSchemeIds = [],
  onToggleSaveScheme
}) => {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<string[]>([
    schemes[0]?.id || 'scheme-gruha-lakshmi',
    schemes[1]?.id || 'scheme-shakti-karnataka',
  ]);

  const handleAddScheme = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveScheme = (id: string) => {
    if (selectedIds.length > 1) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const comparedSchemes = schemes.filter(s => selectedIds.includes(s.id));
  const availableSchemes = schemes.filter(s => !selectedIds.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-[#f5f5f8]">
      {/* Header */}
      <div className="bytune-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,_rgba(143,139,255,0.12),_transparent_70%)] pointer-events-none" />
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#8f8bff]/10 text-[#8f8bff] text-xs font-semibold border border-[#8f8bff]/20">
            <Scale className="w-3.5 h-3.5 text-[#f3c64f]" />
            <span>Civic Decision Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f5f5f8]">
            Government Scheme Comparison
          </h1>
          <p className="text-xs sm:text-sm text-[#b6b6c2] leading-relaxed font-normal">
            Compare benefits, income criteria, eligibility rules, and required documents side-by-side to choose the right public program for your household.
          </p>
        </div>
      </div>

      {/* Selector Row */}
      {selectedIds.length < 3 && availableSchemes.length > 0 && (
        <div className="bytune-card p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-[#8f8bff]" />
            <span className="font-medium text-[#f5f5f8]">Add another scheme to compare (up to 3):</span>
          </div>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddScheme(e.target.value);
                e.target.value = '';
              }
            }}
            className="py-2 px-4 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] font-medium focus:border-[#8f8bff]/60 focus:outline-none cursor-pointer"
          >
            <option value="">Select a scheme...</option>
            {availableSchemes.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#101016] text-[#f5f5f8]">{s.name} ({s.classification})</option>
            ))}
          </select>
        </div>
      )}

      {/* Comparison Grid */}
      <div className="bytune-card overflow-x-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10">
        <table className="w-full text-xs text-left divide-y divide-white/[0.08]">
          {/* Header Row */}
          <thead className="bg-[#0a0a0e]/80 text-[#f5f5f8]">
            <tr>
              <th className="p-5 w-1/4 font-semibold text-sm border-r border-white/[0.08]">
                Scheme Parameter
              </th>
              {comparedSchemes.map((s) => (
                <th key={s.id} className="p-5 w-1/3 border-r border-white/[0.08] last:border-r-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${s.classification === 'State'
                        ? 'bg-[#f3c64f]/15 text-[#f3c64f] border border-[#f3c64f]/30'
                        : 'bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30'
                        }`}>
                        {s.classification}
                      </span>
                      <h3
                        onClick={() => onSelectScheme(s)}
                        className="font-medium text-base text-[#f5f5f8] mt-2 hover:text-[#8f8bff] hover:underline cursor-pointer transition-colors"
                        title="Click to view full scheme details"
                      >
                        {s.name}
                      </h3>
                      <p className="text-[11px] text-[#8a8a97] font-normal">{s.department}</p>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {onToggleSaveScheme && (
                        <button
                          onClick={() => onToggleSaveScheme(s.id)}
                          className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                            savedSchemeIds.includes(s.id)
                              ? 'text-[#8f8bff] bg-[#8f8bff]/20 border-[#8f8bff]/40 shadow-[0_0_12px_rgba(143,139,255,0.4)]'
                              : 'text-[#8a8a97] hover:text-[#f5f5f8] border-white/10 bg-white/[0.03] hover:bg-white/[0.08]'
                          }`}
                          title={savedSchemeIds.includes(s.id) ? "Saved to Bookmarks" : "Save Scheme"}
                          aria-label={savedSchemeIds.includes(s.id) ? "Saved to Bookmarks" : "Save Scheme"}
                        >
                          {savedSchemeIds.includes(s.id) ? (
                            <BookmarkCheck className="w-3.5 h-3.5 fill-[#8f8bff]" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      {selectedIds.length > 1 && (
                        <button
                          onClick={() => handleRemoveScheme(s.id)}
                          className="bytune-pill p-1.5 text-[#8a8a97] hover:text-rose-400 cursor-pointer"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.06] text-[#b6b6c2]">
            {/* Category */}
            <tr>
              <td className="p-5 font-medium bg-white/[0.02] text-[#f5f5f8] border-r border-white/[0.08]">Category</td>
              {comparedSchemes.map((s) => (
                <td key={s.id} className="p-5 border-r border-white/[0.08] last:border-r-0 font-normal">
                  {s.category}
                </td>
              ))}
            </tr>

            {/* Target Beneficiaries */}
            <tr>
              <td className="p-5 font-medium bg-white/[0.02] text-[#f5f5f8] border-r border-white/[0.08]">Target Beneficiary</td>
              {comparedSchemes.map((s) => (
                <td key={s.id} className="p-5 border-r border-white/[0.08] last:border-r-0 font-normal">
                  {s.beneficiaryCategory}
                </td>
              ))}
            </tr>

            {/* Key Benefits */}
            <tr>
              <td className="p-5 font-medium bg-white/[0.02] text-[#f5f5f8] border-r border-white/[0.08]">Primary Benefits</td>
              {comparedSchemes.map((s) => (
                <td key={s.id} className="p-5 border-r border-white/[0.08] last:border-r-0 space-y-2">
                  {s.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px] text-[#f5f5f8] bg-white/[0.025] border border-white/[0.06] p-2.5 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1ed760] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{b}</span>
                    </div>
                  ))}
                </td>
              ))}
            </tr>

            {/* Income Criteria */}
            <tr>
              <td className="p-5 font-medium bg-white/[0.02] text-[#f5f5f8] border-r border-white/[0.08]">Annual Income Ceiling</td>
              {comparedSchemes.map((s) => (
                <td key={s.id} className="p-5 border-r border-white/[0.08] last:border-r-0 font-mono text-[#f5f5f8]">
                  {s.eligibilityCriteria.maxAnnualIncome
                    ? `Up to ₹${s.eligibilityCriteria.maxAnnualIncome.toLocaleString('en-IN')}`
                    : 'No specific income ceiling specified'}
                </td>
              ))}
            </tr>

            {/* Age Limits */}
            <tr>
              <td className="p-5 font-medium bg-white/[0.02] text-[#f5f5f8] border-r border-white/[0.08]">Age Eligibility</td>
              {comparedSchemes.map((s) => (
                <td key={s.id} className="p-5 border-r border-white/[0.08] last:border-r-0 font-normal">
                  {s.eligibilityCriteria.minAge || s.eligibilityCriteria.maxAge
                    ? `${s.eligibilityCriteria.minAge || 0} to ${s.eligibilityCriteria.maxAge || 100} years`
                    : 'All age groups eligible'}
                </td>
              ))}
            </tr>

            {/* Required Documents */}
            <tr>
              <td className="p-5 font-medium bg-white/[0.02] text-[#f5f5f8] border-r border-white/[0.08]">Required Documents</td>
              {comparedSchemes.map((s) => (
                <td key={s.id} className="p-5 border-r border-white/[0.08] last:border-r-0">
                  <div className="flex flex-wrap gap-1.5">
                    {s.requiredDocuments.map((doc, dIdx) => (
                      <span key={dIdx} className="text-[10px] bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full text-[#b6b6c2]">
                        {doc}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Actions */}
            <tr>
              <td className="p-5 font-medium bg-white/[0.02] text-[#f5f5f8] border-r border-white/[0.08]">Scheme Actions</td>
              {comparedSchemes.map((s) => (
                <td key={s.id} className="p-5 border-r border-white/[0.08] last:border-r-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onSelectScheme(s)}
                      className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#f5f5f8] text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer border border-white/10"
                    >
                      <Eye className="w-3 h-3 text-[#8f8bff]" />
                      <span>View Details</span>
                    </button>
                    <a
                      href={s.officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="bytune-btn-solid inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3 text-[#0a0a0c]" />
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
