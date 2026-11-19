import React, { useState, useMemo } from 'react';
import {
  Search, X, RotateCcw, CheckCircle2
} from 'lucide-react';
import { Scheme } from '../types';
import { SchemeCard } from '../components/SchemeCard';
import { useLanguage } from '../context/LanguageContext';

interface SchemesPageProps {
  schemes: Scheme[];
  onSelectScheme: (scheme: Scheme) => void;
  onCheckEligibility?: (scheme: Scheme) => void;
  onToggleSaveScheme: (schemeId: string) => void;
  savedSchemeIds: string[];
  initialCategory?: string;
  initialState?: string;
  initialSearch?: string;
  onClearSearch?: () => void;
}

export const SchemesPage: React.FC<SchemesPageProps> = ({
  schemes,
  onSelectScheme,
  onCheckEligibility,
  onToggleSaveScheme,
  savedSchemeIds,
  initialCategory,
  initialState = 'All',
  initialSearch = '',
  onClearSearch
}) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedClassification, setSelectedClassification] = useState<string>('All');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>(initialState || 'All');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'name'>('recent');

  React.useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialState) {
      setSelectedState(initialState);
    }
  }, [initialState]);

  const categories = [
    'All',
    'Women Empowerment',
    'Student Scholarships',
    'Farmer Welfare',
    'Employment Opportunities',
    'Financial Assistance',
    'Health and Social Welfare'
  ];

  const beneficiaries = [
    'All',
    'Women',
    'Students',
    'Farmers',
    'General'
  ];

  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      // 1. Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = scheme.name.toLowerCase().includes(q) ||
          (scheme.name_kn && scheme.name_kn.toLowerCase().includes(q)) ||
          (scheme.name_hi && scheme.name_hi.toLowerCase().includes(q));
        const matchesDept = scheme.department.toLowerCase().includes(q);
        const matchesDesc = scheme.description.toLowerCase().includes(q);
        const matchesCat = scheme.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDept && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'All' && scheme.category !== selectedCategory) {
        return false;
      }

      // 3. Classification
      if (selectedClassification !== 'All' && scheme.classification !== selectedClassification) {
        return false;
      }

      // 4. Beneficiary
      if (selectedBeneficiary !== 'All' && scheme.beneficiaryCategory !== selectedBeneficiary && scheme.beneficiaryCategory !== 'General') {
        return false;
      }

      // 5. State filter
      if (selectedState !== 'All' && scheme.state !== 'All India' && scheme.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });
  }, [schemes, searchTerm, selectedCategory, selectedClassification, selectedBeneficiary, selectedState, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedClassification('All');
    setSelectedBeneficiary('All');
    setSelectedState('All');
    setSortBy('recent');
    if (onClearSearch) onClearSearch();
  };

  const isAnyFilterActive = searchTerm || selectedCategory !== 'All' || selectedClassification !== 'All' || selectedBeneficiary !== 'All' || selectedState !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-[#f5f5f8]">
      {/* Header Banner */}
      <div className="bytune-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,_rgba(143,139,255,0.12),_transparent_70%)] pointer-events-none" />
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8f8bff]">
            Comprehensive Welfare Database
          </span>
          <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f5f5f8]">
            Government Scheme Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#b6b6c2] leading-relaxed font-normal">
            Search, filter, and review verified Central and Karnataka state government welfare programs, entitlement criteria, and direct application links.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bytune-card p-5 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#8a8a97] absolute left-4 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by scheme title, department, or keyword (e.g. Gruha Lakshmi, PM-KISAN, SSP, Shakti)..."
            className="w-full pl-12 pr-10 py-2.5 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] placeholder-[#60606c] focus:border-[#8f8bff]/60 text-xs sm:text-sm focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                if (onClearSearch) onClearSearch();
              }}
              className="absolute right-3.5 top-3 text-[#8a8a97] hover:text-[#f5f5f8] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap text-[11px] font-medium border ${selectedCategory === c
                ? 'bg-[#8f8bff]/20 text-[#8f8bff] border-[#8f8bff]/40 shadow-sm'
                : 'bg-white/[0.03] text-[#8a8a97] hover:text-[#f5f5f8] border-white/[0.06] hover:bg-white/[0.08]'
                }`}
            >
              {c === 'All' ? 'All Schemes' : c}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs pt-1 border-t border-white/[0.05]">
          {/* State Filter */}
          <div>
            <label className="block font-medium text-[#8a8a97] mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full py-2 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
            >
              <option value="All">All 28 States & Central</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Kerala">Kerala</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="All India">Central (All India)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block font-medium text-[#8a8a97] mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Classification (Central vs State) */}
          <div>
            <label className="block font-medium text-[#8a8a97] mb-1">Government Level</label>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="w-full py-2 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
            >
              <option value="All">Central & State Combined</option>
              <option value="Central">Central Government</option>
              <option value="State">Karnataka State Government</option>
            </select>
          </div>

          {/* Beneficiary Filter */}
          <div>
            <label className="block font-medium text-[#8a8a97] mb-1">Beneficiary Group</label>
            <select
              value={selectedBeneficiary}
              onChange={(e) => setSelectedBeneficiary(e.target.value)}
              className="w-full py-2 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
            >
              {beneficiaries.map((b) => (
                <option key={b} value={b}>{b === 'All' ? 'All Beneficiaries' : b}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-medium text-[#8a8a97] mb-1">Sort Results</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 rounded-full border border-white/10 bg-[#101016] text-xs text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
            >
              <option value="recent">Recently Updated</option>
              <option value="popular">Most Viewed</option>
              <option value="name">Scheme Name (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Clear */}
        {isAnyFilterActive && (
          <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <span className="text-[#8a8a97] font-medium">Active Filters:</span>
              {selectedCategory !== 'All' && (
                <span className="px-3 py-1 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30 font-medium flex items-center">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="ml-1.5 hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedClassification !== 'All' && (
                <span className="px-3 py-1 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30 font-medium flex items-center">
                  Govt: {selectedClassification}
                  <button onClick={() => setSelectedClassification('All')} className="ml-1.5 hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBeneficiary !== 'All' && (
                <span className="px-3 py-1 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30 font-medium flex items-center">
                  Target: {selectedBeneficiary}
                  <button onClick={() => setSelectedBeneficiary('All')} className="ml-1.5 hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedState !== 'All' && (
                <span className="px-3 py-1 rounded-full bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30 font-medium flex items-center">
                  State: {selectedState}
                  <button onClick={() => setSelectedState('All')} className="ml-1.5 hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>

            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-[#8a8a97] hover:text-[#f5f5f8] font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetFilters')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Schemes Results Counter */}
      <div className="flex items-center justify-between text-xs text-[#8a8a97]">
        <span>Showing <strong className="text-[#f5f5f8] font-mono">{filteredSchemes.length}</strong> verified government schemes</span>
        <span className="text-[11px] text-[#1ed760] bg-[#1ed760]/10 border border-[#1ed760]/20 px-3 py-0.5 rounded-full flex items-center font-mono">
          <CheckCircle2 className="w-3 h-3 mr-1 text-[#1ed760]" />
          Official Verified Sources
        </span>
      </div>

      {/* Scheme Cards Grid */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onViewDetails={onSelectScheme}
              onCheckEligibility={onCheckEligibility}
              isSaved={savedSchemeIds.includes(scheme.id)}
              onToggleSave={onToggleSaveScheme}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bytune-card p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#8a8a97]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-medium text-[#f5f5f8]">{t('noSchemesFound')}</h3>
          <p className="text-xs text-[#8a8a97] max-w-sm mx-auto">
            Try adjusting your keyword or reset filters to view all available Central and State welfare programs.
          </p>
          <button
            onClick={resetFilters}
            className="bytune-btn-solid px-5 py-2 text-xs font-semibold cursor-pointer"
          >
            {t('resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
};
