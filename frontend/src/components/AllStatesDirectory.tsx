import React, { useState } from 'react';
import { MapPin, Search, ArrowRight } from 'lucide-react';
import { ALL_INDIAN_STATES } from '../utils/indiaStates';

interface AllStatesDirectoryProps {
  onSelectState: (stateName: string) => void;
}

export const AllStatesDirectory: React.FC<AllStatesDirectoryProps> = ({ onSelectState }) => {
  const [search, setSearch] = useState('');

  const filteredStates = ALL_INDIAN_STATES.filter(s => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return s.name.toLowerCase().includes(q) || s.capital.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bytune-card p-6 sm:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8f8bff]/10 border border-[#8f8bff]/20 text-[#8f8bff] text-xs font-medium mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#6fd8ff]" />
            <span>National State Coverage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#f5f5f8] tracking-[-0.02em]">
            All 28 States of India Directory
          </h2>
          <p className="text-xs sm:text-sm text-[#b6b6c2] mt-1 max-w-2xl font-normal">
            Select any Indian State to browse regional guarantee schemes, state portal access, and welfare benefit programs.
          </p>
        </div>

        {/* Search Bar & Total Counter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search state or capital..."
              className="pl-9.5 pr-4 py-2 rounded-full border border-white/10 bg-[#101016]/90 text-xs text-[#f5f5f8] placeholder-[#60606c] focus:outline-none focus:border-[#8f8bff]/50 w-52 sm:w-64"
            />
          </div>

          <div className="px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#b6b6c2] whitespace-nowrap">
            {filteredStates.length} / 28 States
          </div>
        </div>
      </div>

      {/* States Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStates.map((st) => {
          const isKarnataka = st.name.toLowerCase() === 'karnataka';
          return (
            <div
              key={st.code}
              onClick={() => onSelectState(st.name)}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden ${
                isKarnataka
                  ? 'bg-gradient-to-br from-amber-500/[0.08] via-white/[0.02] to-transparent border-amber-500/35 hover:border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08] hover:border-[#8f8bff]/40 hover:shadow-[0_10px_25px_-10px_rgba(0,0,0,0.8)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isKarnataka
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-white/[0.05] text-[#8a8a97] border-white/5 group-hover:text-[#8f8bff]'
                  }`}>
                    {st.code}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isKarnataka
                      ? 'bg-[#1ed760]/15 text-[#1ed760] border-[#1ed760]/30 font-semibold'
                      : 'bg-white/[0.04] text-[#b6b6c2] border-white/5'
                  }`}>
                    {isKarnataka ? '5 Guarantees' : 'State Portal'}
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-[#f5f5f8] mt-2.5 group-hover:text-[#8f8bff] transition-colors">
                  {st.name}
                </h4>
                <p className="text-[11px] text-[#8a8a97] mt-0.5">
                  Capital: <strong className="text-[#b6b6c2] font-medium">{st.capital}</strong>
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="font-mono text-[#8a8a97]">
                  <strong className="text-[#f5f5f8]">{st.schemeCount}</strong> Schemes
                </span>
                <span className="font-medium text-[#8f8bff] flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
