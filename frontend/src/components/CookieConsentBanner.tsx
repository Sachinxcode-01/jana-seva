import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface CookieConsentBannerProps {
  onLearnMore: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onLearnMore }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('janaseva_storage_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('janaseva_storage_consent', JSON.stringify({
      acceptedAt: new Date().toISOString(),
      type: 'essential_local_storage',
      version: '1.0'
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 md:left-8 md:right-auto md:max-w-xl z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bytune-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/20 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-[#f5f5f8] flex items-center gap-1.5">
              <span>Citizen Privacy & Essential Storage</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30">
                DPDP 2023 Compliant
              </span>
            </h4>
            <p className="text-[11px] text-[#b6b6c2] leading-relaxed font-normal">
              JANASEVA uses strictly essential browser storage (<code className="text-[#8f8bff] font-mono">localStorage</code>) to maintain
              your login session and language preference (English/ಕನ್ನಡ/हिंदी). We use <strong className="text-[#f5f5f8]">zero</strong> advertising cookies or third-party trackers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={onLearnMore}
            className="bytune-pill px-3 py-1.5 text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#8f8bff]" />
            <span>Details</span>
          </button>
          <button
            onClick={handleAccept}
            className="bytune-btn-solid px-4 py-1.5 text-xs font-semibold cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
