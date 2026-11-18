import React from 'react';
import { 
  X, ExternalLink, Printer, ShieldCheck, CheckCircle2, 
  Building2, Bookmark, BookmarkCheck, FileText,
  Calendar
} from 'lucide-react';
import { Scheme } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SchemeDetailsModalProps {
  scheme: Scheme | null;
  onClose: () => void;
  onSelectScheme: (scheme: Scheme) => void;
  isSaved?: boolean;
  onToggleSave?: (schemeId: string) => void;
  relatedSchemes?: Scheme[];
}

export const SchemeDetailsModal: React.FC<SchemeDetailsModalProps> = ({
  scheme,
  onClose,
  onSelectScheme,
  isSaved = false,
  onToggleSave,
  relatedSchemes = []
}) => {
  const { language, t } = useLanguage();

  if (!scheme) return null;

  const displayName = language === 'kn' && scheme.name_kn ? scheme.name_kn :
                      language === 'hi' && scheme.name_hi ? scheme.name_hi : scheme.name;

  const displayDesc = language === 'kn' && scheme.description_kn ? scheme.description_kn :
                      language === 'hi' && scheme.description_hi ? scheme.description_hi : scheme.description;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050507]/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bytune-card max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#f5f5f8] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#0a0a0e]/90 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
              scheme.classification === 'State' 
                ? 'bg-[#f3c64f]/15 text-[#f3c64f] border border-[#f3c64f]/30' 
                : 'bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30'
            }`}>
              {scheme.classification === 'State' ? 'Karnataka State Scheme' : 'Government of India Central Scheme'}
            </span>
            <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-white/[0.04] text-[#b6b6c2] border border-white/5">
              {scheme.category}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bytune-pill p-2 text-[#8a8a97] hover:text-[#f5f5f8] cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {onToggleSave && (
              <button
                onClick={() => onToggleSave(scheme.id)}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isSaved 
                    ? 'text-[#8f8bff] bg-[#8f8bff]/15 border-[#8f8bff]/30' 
                    : 'text-[#8a8a97] hover:text-[#f5f5f8] border-white/10 bg-white/[0.03]'
                }`}
                title={isSaved ? "Saved" : "Save Scheme"}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#8f8bff] fill-[#8f8bff]" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="bytune-pill p-2 text-[#8a8a97] hover:text-[#f5f5f8] cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 print:p-0">
          {/* Main Title Block */}
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#8a8a97] mb-2 font-normal">
              <Building2 className="w-4 h-4 text-[#8f8bff]" />
              <span className="text-[#b6b6c2]">{scheme.department}</span>
              <span>•</span>
              <span className="flex items-center text-[#1ed760] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                {scheme.sourceVerificationStatus}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-medium text-[#f5f5f8] tracking-[-0.025em] leading-tight">
              {displayName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#8a8a97]">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-[#8f8bff]" />
                Updated: {scheme.lastUpdated}
              </span>
              <span>Target: <strong className="text-[#f5f5f8]">{scheme.beneficiaryCategory}</strong></span>
              <span>Region: <strong className="text-[#f5f5f8]">{scheme.state}</strong></span>
            </div>

            <p className="mt-4 text-sm text-[#b6b6c2] leading-relaxed bg-white/[0.025] p-4 rounded-2xl border border-white/[0.06]">
              {displayDesc}
            </p>
          </div>

          {/* Key Benefits */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f5f5f8] mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#1ed760] shadow-[0_0_8px_#1ed760]"></span>
              <span>{t('benefits')}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scheme.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06] text-xs text-[#f5f5f8]">
                  <CheckCircle2 className="w-4 h-4 text-[#1ed760] shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-[#b6b6c2]">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f5f5f8] mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#8f8bff] shadow-[0_0_8px_#8f8bff]"></span>
              <span>{t('eligibility')}</span>
            </h3>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-2.5 text-xs text-[#b6b6c2]">
              {scheme.eligibilityCriteria.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="font-bold text-[#8f8bff]">•</span>
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
              {scheme.eligibilityCriteria.maxAnnualIncome && (
                <div className="flex items-start space-x-2 font-medium text-[#f5f5f8]">
                  <span className="font-bold text-[#8f8bff]">•</span>
                  <span>Maximum Family Annual Income: <strong className="text-[#8f8bff] font-mono">₹{scheme.eligibilityCriteria.maxAnnualIncome.toLocaleString('en-IN')}</strong></span>
                </div>
              )}
              {scheme.eligibilityCriteria.educationRequirements && (
                <div className="flex items-start space-x-2 font-medium text-[#f5f5f8]">
                  <span className="font-bold text-[#8f8bff]">•</span>
                  <span>Educational Qualification: <strong className="text-[#f5f5f8]">{scheme.eligibilityCriteria.educationRequirements}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f5f5f8] mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#f3c64f] shadow-[0_0_8px_#f3c64f]"></span>
              <span>{t('documentsRequired')}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scheme.requiredDocuments.map((doc, i) => (
                <div key={i} className="flex items-start space-x-2 p-3 rounded-xl bg-white/[0.025] border border-white/[0.06] text-xs text-[#b6b6c2]">
                  <FileText className="w-4 h-4 text-[#f3c64f] shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step How to Apply */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f5f5f8] mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#6fd8ff] shadow-[0_0_8px_#6fd8ff]"></span>
              <span>{t('howToApply')}</span>
            </h3>
            <div className="space-y-3">
              {scheme.applicationProcedure.steps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start space-x-3 text-xs text-[#b6b6c2]">
                  <span className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 text-[#8f8bff] flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    {sIdx + 1}
                  </span>
                  <p className="mt-1 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Official Portal Action Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#101016] to-[#16161d] border border-[#8f8bff]/30 text-[#f5f5f8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_-10px_rgba(143,139,255,0.2)]">
            <div>
              <p className="text-xs text-[#8f8bff] font-semibold uppercase tracking-wider">Ready to apply?</p>
              <h4 className="text-base font-medium text-[#f5f5f8] mt-0.5">Proceed to Official Government Portal</h4>
              <p className="text-[11px] text-[#8a8a97] mt-1 font-mono">
                You will be redirected to the verified government portal ({scheme.officialWebsite}). Zero intermediary fees.
              </p>
            </div>
            <a
              href={scheme.applicationProcedure.onlineUrl || scheme.officialWebsite}
              target="_blank"
              rel="noreferrer"
              className="bytune-btn-accent px-6 py-3 text-xs font-semibold inline-flex items-center space-x-2 cursor-pointer shrink-0"
            >
              <span>{t('applyOnline')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Related Schemes */}
          {relatedSchemes.length > 0 && (
            <div className="border-t border-white/[0.08] pt-6">
              <h4 className="text-sm font-semibold text-[#f5f5f8] mb-3">Related Welfare Schemes in {scheme.category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedSchemes.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectScheme(rel)}
                    className="p-3.5 rounded-xl border border-white/[0.08] hover:border-[#8f8bff]/40 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-all text-xs space-y-1.5"
                  >
                    <span className="text-[10px] font-mono text-[#8f8bff]">{rel.classification}</span>
                    <p className="font-medium text-[#f5f5f8] line-clamp-1">{rel.name}</p>
                    <p className="text-[11px] text-[#8a8a97] line-clamp-1">{rel.department}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
