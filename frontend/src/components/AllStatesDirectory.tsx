import React, { useState } from 'react';
import { MapPin, Search, ChevronRight, Globe2, X } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#8f8bff]/10 border border-[#8f8bff]/20 text-[#8f8bff] text-[11px] font-medium">
            <MapPin className="w-3 h-3 text-[#6fd8ff] shrink-0" />
            <span>State Welfare Portals</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-[#f5f5f8] tracking-[-0.02em]">
            Browse Schemes by State
          </h2>
          <p className="text-[11px] sm:text-xs text-[#b6b6c2] font-normal">
            Select any Indian state to quickly filter regional welfare schemes, DBT programs, and official portals.
          </p>
        </div>

        {/* Responsive State Search & Counter */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div className="relative flex-1 sm:w-56 md:w-64">
            <Search className="w-3.5 h-3.5 text-[#8a8a97] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search state..."
              className="w-full h-8 sm:h-8.5 pl-9 pr-7 rounded-full border border-white/10 bg-[#101016]/90 text-[11px] sm:text-xs text-[#f5f5f8] placeholder-[#71717a] focus:outline-none focus:border-[#8f8bff]/60 focus:bg-[#12121a] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8a97] hover:text-[#f5f5f8] cursor-pointer p-0.5"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="h-8 sm:h-8.5 px-2.5 sm:px-3 flex items-center justify-center text-[10px] sm:text-[11px] font-mono rounded-full bg-white/[0.04] border border-white/10 text-[#8a8a97] shrink-0 whitespace-nowrap">
            {filteredStates.length} / 28
          </span>
        </div>
      </div>

      {/* Quick All-India & Key State Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSelectState('All India')}
          className={`h-8 sm:h-8.5 px-3 rounded-xl border text-[11px] sm:text-xs font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            selectedState === 'All India' || selectedState === 'All'
              ? 'bg-[#8f8bff]/15 text-[#8f8bff] border-[#8f8bff]/40 shadow-[0_0_12px_rgba(143,139,255,0.25)]'
              : 'bg-white/[0.03] text-[#b6b6c2] hover:text-[#f5f5f8] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5 text-[#6fd8ff] shrink-0" />
          <span>All India (Central Schemes)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectState('Karnataka')}
          className={`h-8 sm:h-8.5 px-3 rounded-xl border text-[11px] sm:text-xs font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            selectedState.toLowerCase() === 'karnataka'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-amber-500/[0.06] text-amber-300/90 hover:text-amber-200 border-amber-500/20 hover:border-amber-400/40'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
          <span>Karnataka (5 Guarantees)</span>
        </button>
      </div>

      {/* Responsive States Grid with Proper Breathing Room */}
      {filteredStates.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8a8a97]">
          No Indian state found matching &ldquo;<span className="text-[#f5f5f8]">{search}</span>&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5">
          {filteredStates.map((st) => {
            const isSelected = selectedState.toLowerCase() === st.name.toLowerCase();
            const isKarnataka = st.name.toLowerCase() === 'karnataka';

            return (
              <button
                key={st.code}
                type="button"
                onClick={() => onSelectState(st.name)}
                className={`min-h-[42px] px-2.5 py-2 rounded-xl border text-left transition-all duration-200 group flex items-center justify-between gap-1.5 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#8f8bff]/20 border-[#8f8bff] text-[#f5f5f8] shadow-[0_0_15px_rgba(143,139,255,0.3)]'
                    : isKarnataka
                    ? 'bg-amber-500/[0.05] hover:bg-amber-500/[0.12] border-amber-500/25 hover:border-amber-400/50 text-[#f5f5f8]'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.08] hover:border-[#8f8bff]/40 text-[#b6b6c2] hover:text-[#f5f5f8]'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className={`font-mono text-[9.5px] sm:text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                    isKarnataka
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold'
                      : isSelected
                      ? 'bg-[#8f8bff]/25 text-[#8f8bff] border-[#8f8bff]/40 font-semibold'
                      : 'bg-white/[0.04] text-[#8a8a97] border-white/5 group-hover:text-[#8f8bff]'
                  }`}>
                    {st.code}
                  </span>
                  <span className="text-[11px] sm:text-[11.5px] font-medium leading-snug group-hover:text-white transition-colors break-words">
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
      )}
    </div>
  );
};
