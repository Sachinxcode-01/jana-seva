import React, { useState } from 'react';
import { MapPin, Search, ChevronRight, Globe2 } from 'lucide-react';
import { ALL_INDIAN_STATES } from '../utils/indiaStates';

interface AllStatesDirectoryProps {
  onSelectState: (stateName: string) => void;
  selectedState?: string;
}

export const AllStatesDirectory: React.FC<AllStatesDirectoryProps> = ({
  onSelectState,
  selectedState = 'All'
}) => {
  const [search, setSearch] = useState('');

  const filteredStates = ALL_INDIAN_STATES.filter(s => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(q) ||
        s.capital.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bytune-card p-4 sm:p-6 md:p-8 space-y-5">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#8f8bff]/10 border border-[#8f8bff]/20 text-[#8f8bff] text-[11px] font-medium mb-1.5">
            <MapPin className="w-3 h-3 text-[#6fd8ff]" />
            <span>State Welfare Portals</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-[#f5f5f8] tracking-[-0.02em]">
            Browse Schemes by State
          </h2>
          <p className="text-[11px] sm:text-xs text-[#b6b6c2] mt-0.5 font-normal">
            Select any Indian state to quickly filter regional welfare schemes, DBT programs, and official portals.
          </p>
        </div>

        {/* Compact Search & Count */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-[#8a8a97] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search state..."
              className="w-full sm:w-44 md:w-56 pl-8.5 pr-3 py-1.5 rounded-full border border-white/10 bg-[#101016]/90 text-[11px] sm:text-xs text-[#f5f5f8] placeholder-[#60606c] focus:outline-none focus:border-[#8f8bff]/50 transition-all"
            />
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#8a8a97] shrink-0 whitespace-nowrap">
            {filteredStates.length} / 28
          </span>
        </div>
      </div>

      {/* Quick All-India Reset Button */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => onSelectState('All India')}
          className={`px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            selectedState === 'All India' || selectedState === 'All'
              ? 'bg-[#8f8bff]/15 text-[#8f8bff] border-[#8f8bff]/40 shadow-[0_0_12px_rgba(143,139,255,0.25)]'
              : 'bg-white/[0.03] text-[#b6b6c2] hover:text-[#f5f5f8] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5 text-[#6fd8ff]" />
          <span>All India (Central Schemes)</span>
        </button>

        <button
          onClick={() => onSelectState('Karnataka')}
          className={`px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            selectedState.toLowerCase() === 'karnataka'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-amber-500/[0.06] text-amber-300/90 hover:text-amber-200 border-amber-500/20 hover:border-amber-400/40'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Karnataka (5 Guarantees)</span>
        </button>
      </div>

      {/* Responsive States Grid with Small, Crisp Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2">
        {filteredStates.map((st) => {
          const isSelected = selectedState.toLowerCase() === st.name.toLowerCase();
          const isKarnataka = st.name.toLowerCase() === 'karnataka';

          return (
            <button
              key={st.code}
              type="button"
              onClick={() => onSelectState(st.name)}
              className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 group flex items-center justify-between gap-1.5 cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-[#8f8bff]/20 border-[#8f8bff] text-[#f5f5f8] shadow-[0_0_15px_rgba(143,139,255,0.3)]'
                  : isKarnataka
                  ? 'bg-amber-500/[0.05] hover:bg-amber-500/[0.12] border-amber-500/25 hover:border-amber-400/50 text-[#f5f5f8]'
                  : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.08] hover:border-[#8f8bff]/40 text-[#b6b6c2] hover:text-[#f5f5f8]'
              }`}
            >
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className={`font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                  isKarnataka
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold'
                    : isSelected
                    ? 'bg-[#8f8bff]/25 text-[#8f8bff] border-[#8f8bff]/40 font-semibold'
                    : 'bg-white/[0.04] text-[#8a8a97] border-white/5 group-hover:text-[#8f8bff]'
                }`}>
                  {st.code}
                </span>
                <span className="text-[11px] sm:text-xs font-medium truncate group-hover:text-white transition-colors">
                  {st.name}
                </span>
              </div>

              <ChevronRight className={`w-3 h-3 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                isSelected ? 'text-[#8f8bff]' : 'text-[#8a8a97] opacity-60 group-hover:opacity-100'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
