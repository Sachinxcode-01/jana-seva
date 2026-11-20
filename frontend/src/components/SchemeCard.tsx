import React from 'react';
import {
  Building2, Bookmark, BookmarkCheck, ArrowRight,
  ShieldCheck, Sparkles, MapPin, Users, Clock
} from 'lucide-react';
import { Scheme } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SchemeCardProps {
  scheme: Scheme;
  onViewDetails: (scheme: Scheme) => void;
  onCheckEligibility?: (scheme: Scheme) => void;
  isSaved?: boolean;
  onToggleSave?: (schemeId: string) => void;
}

const getCategoryBadgeClass = (category: string) => {
  switch (category) {
    case 'Women Empowerment':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    case 'Student Scholarships':
      return 'bg-[#8f8bff]/15 text-[#8f8bff] border-[#8f8bff]/30';
    case 'Farmer Welfare':
      return 'bg-[#1ed760]/15 text-[#1ed760] border-[#1ed760]/30';
    case 'Employment Opportunities':
      return 'bg-[#f3c64f]/15 text-[#f3c64f] border-[#f3c64f]/30';
    case 'Financial Assistance':
      return 'bg-[#6fd8ff]/15 text-[#6fd8ff] border-[#6fd8ff]/30';
    case 'Health and Social Welfare':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    default:
      return 'bg-white/[0.06] text-[#b6b6c2] border-white/10';
  }
};

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onViewDetails,
  onCheckEligibility,
  isSaved = false,
  onToggleSave
}) => {
  const { language, t } = useLanguage();

  const displayName = language === 'kn' && scheme.name_kn ? scheme.name_kn :
    language === 'hi' && scheme.name_hi ? scheme.name_hi : scheme.name;

  const displayDesc = language === 'kn' && scheme.description_kn ? scheme.description_kn :
    language === 'hi' && scheme.description_hi ? scheme.description_hi : scheme.description;

  const isKarnataka = scheme.state.toLowerCase().includes('karnataka');

  return (
    <div className="bytune-card bytune-card-hover flex flex-col justify-between group overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.85)] relative">
      {/* Top Banner Tag */}
      <div>
        <div className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-3 border-b border-white/[0.06] flex items-center justify-between gap-2 bg-white/[0.015]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Classification Pill */}
            <span className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${scheme.classification === 'State'
              ? 'bg-[#f3c64f]/15 text-[#f3c64f] border border-[#f3c64f]/30'
              : 'bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30'
              }`}>
              {scheme.classification === 'State' ? t('stateScheme') : t('centralScheme')}
            </span>
            {/* Classification / State Pill */}
            {scheme.classification === 'State' ? (
              <span className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border shrink-0 ${isKarnataka
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-[#f3c64f]/15 text-[#f3c64f] border border-[#f3c64f]/30'
                }`}>
                <MapPin className="w-2.5 h-2.5 shrink-0 opacity-80" />
                <span className="truncate max-w-[120px]">{scheme.state}</span>
              </span>
            ) : (
              <span className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">
                {t('centralScheme')}
              </span>
            )}

            {/* State Domicile Tag */}
            <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border shrink-0 ${isKarnataka
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-white/[0.04] text-[#8a8a97] border-white/[0.08]'
              }`}>
              <MapPin className="w-2.5 h-2.5 shrink-0 opacity-80" />
              <span className="truncate max-w-[90px]">{scheme.state}</span>
            </span>

            {/* Category Pill */}
            <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${getCategoryBadgeClass(scheme.category)}`}>
              {scheme.category}
            </span>
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(scheme.id);
              }}
              className={`p-1.5 rounded-full transition-all border shrink-0 cursor-pointer ${isSaved
                ? 'text-[#8f8bff] bg-[#8f8bff]/20 border-[#8f8bff]/40 shadow-[0_0_12px_rgba(143,139,255,0.4)]'
                : 'text-[#8a8a97] hover:text-[#f5f5f8] border-white/10 bg-white/[0.03] hover:bg-white/[0.08]'
                }`}
              title={isSaved ? "Saved to Bookmarks" : "Save Scheme"}
              aria-label={isSaved ? "Saved to Bookmarks" : "Save Scheme"}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-[#8f8bff]" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5">
          <div className="flex items-center space-x-1.5 text-xs text-[#8a8a97] font-normal">
            <Building2 className="w-3.5 h-3.5 text-[#8a8a97] shrink-0" />
            <span className="truncate">{scheme.department}</span>
          </div>

          <h3
            onClick={() => onViewDetails(scheme)}
            className="text-[15px] sm:text-base font-semibold text-[#f5f5f8] group-hover:text-[#8f8bff] cursor-pointer transition-colors line-clamp-2 leading-snug tracking-[-0.015em]"
          >
            {displayName}
          </h3>

          <p className="text-xs text-[#b6b6c2] line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>

          {/* Target Beneficiary Group metadata */}
          {scheme.beneficiaryCategory && (
            <div className="flex items-center space-x-1.5 text-[11px] text-[#8a8a97]">
              <Users className="w-3 h-3 text-[#6fd8ff] shrink-0" />
              <span>Target: <strong className="text-[#f5f5f8] font-medium">{scheme.beneficiaryCategory}</strong></span>
            </div>
          )}

          {/* Benefits highlight */}
          {scheme.benefits && scheme.benefits.length > 0 && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#1ed760]/[0.05] to-transparent border border-[#1ed760]/20 text-xs text-[#f5f5f8]">
              <div className="flex items-start space-x-1.5 font-medium mb-1 text-[11px] text-[#1ed760]">
                <Sparkles className="w-3.5 h-3.5 text-[#1ed760] shrink-0 mt-0.5" />
                <span className="font-semibold uppercase tracking-wide text-[10px]">Key Welfare Benefit:</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-[#b6b6c2] line-clamp-2">
                {scheme.benefits[0]}
              </p>
            </div>
          )}

          {/* Application Deadline Badge */}
          {scheme.deadline && (
            <div className="flex items-center space-x-1.5 text-[11px] text-amber-300 bg-amber-500/[0.08] px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">
                Deadline: <strong className="font-medium text-[#f5f5f8]">{scheme.deadline}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      {/* Footer Actions */}
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-black/30 border-t border-white/[0.06] flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] text-[#8a8a97] font-normal">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1ed760] shrink-0" />
            <span className="font-normal text-[#8a8a97]">Official Verified</span>
          </div>
          <span className="text-[10px] text-[#8a8a97] font-mono bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] shrink-0">
            {scheme.classification === 'State' ? t('stateScheme') : t('centralScheme')}
            {scheme.classification === 'State' ? (scheme.state || t('stateScheme')) : t('centralScheme')}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full">
          {onCheckEligibility && (
            <button
              onClick={() => onCheckEligibility(scheme)}
              className="flex-1 min-w-0 flex items-center justify-center space-x-1.5 text-xs font-medium text-[#8f8bff] bg-[#8f8bff]/15 hover:bg-[#8f8bff]/25 active:bg-[#8f8bff]/30 px-3 py-2 rounded-full transition-all border border-[#8f8bff]/30 hover:border-[#8f8bff]/50 cursor-pointer shadow-sm active:scale-95 group/eligibility"
              title="Check Scheme Eligibility"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f3c64f] shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline 2xl:hidden xl:inline">Check </span>Eligibility
              </span>
            </button>
          )}

          <button
            onClick={() => onViewDetails(scheme)}
            className={`${onCheckEligibility ? 'flex-1' : 'w-full'} min-w-0 bytune-pill flex items-center justify-center space-x-1.5 text-xs font-medium px-3.5 py-2 hover:border-[#8f8bff]/40 hover:text-[#8f8bff] cursor-pointer bg-white/[0.04] transition-all active:scale-95 group/view`}
            title={t('viewDetails')}
          >
            <span className="truncate">{t('viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover/view:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
