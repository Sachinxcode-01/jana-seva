import React from 'react';
import { Building2, ArrowUp, ExternalLink, Phone } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050507] text-[#8a8a97] border-t border-white/[0.08] text-xs mt-16 no-print">
      {/* Sleek top accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#8f8bff]/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#8f8bff]">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-semibold text-base text-[#f5f5f8] tracking-tight">JANASEVA</span>
            </div>
            <p className="text-xs text-[#8a8a97] leading-relaxed">
              Transparent welfare discovery and preliminary eligibility advisory for Indian citizens.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-semibold text-xs text-[#f5f5f8] uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentTab('schemes')}
                  className="hover:text-[#f5f5f8] transition-colors cursor-pointer"
                >
                  All Schemes
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('eligibility')}
                  className="hover:text-[#f5f5f8] transition-colors cursor-pointer"
                >
                  Eligibility Checker
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('states')}
                  className="hover:text-[#f5f5f8] transition-colors cursor-pointer"
                >
                  28 States Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="hover:text-[#f5f5f8] transition-colors cursor-pointer"
                >
                  About Project
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="font-semibold text-xs text-[#f5f5f8] uppercase tracking-wider mb-3">Official Portals</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://sevasindhugs.karnataka.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#8f8bff] transition-colors inline-flex items-center gap-1"
                >
                  <span>Seva Sindhu</span>
                  <ExternalLink className="w-3 h-3 text-[#60606c]" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#8f8bff] transition-colors inline-flex items-center gap-1"
                >
                  <span>PM-KISAN Portal</span>
                  <ExternalLink className="w-3 h-3 text-[#60606c]" />
                </a>
              </li>
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#8f8bff] transition-colors inline-flex items-center gap-1"
                >
                  <span>National Scholarship</span>
                  <ExternalLink className="w-3 h-3 text-[#60606c]" />
                </a>
              </li>
              <li>
                <a
                  href="https://india.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#8f8bff] transition-colors inline-flex items-center gap-1"
                >
                  <span>india.gov.in</span>
                  <ExternalLink className="w-3 h-3 text-[#60606c]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Citizen Helplines */}
          <div>
            <h4 className="font-semibold text-xs text-[#f5f5f8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#1ed760]" />
              <span>Govt Helplines</span>
            </h4>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#8a8a97]">Seva Sindhu:</span>
                <a href="tel:1902" className="text-[#f3c64f] hover:underline">1902</a>
              </li>
              <li className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#8a8a97]">PM-KISAN:</span>
                <a href="tel:155261" className="text-[#f3c64f] hover:underline">155261</a>
              </li>
              <li className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#8a8a97]">Women Helpline:</span>
                <a href="tel:181" className="text-rose-400 hover:underline">181</a>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-[#8a8a97]">Cyber Crime:</span>
                <a href="tel:1930" className="text-[#6fd8ff] hover:underline">1930</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Clean Bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <span>© 2026 JANASEVA • Free Public Advisory</span>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentTab('compliance')}
              className="hover:text-[#f5f5f8] transition-colors cursor-pointer"
            >
              Privacy & DPDP
            </button>
            <span className="text-white/10">•</span>
            <button
              onClick={() => setCurrentTab('contact')}
              className="hover:text-[#f5f5f8] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <span className="text-white/10">•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-[#8f8bff] transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
