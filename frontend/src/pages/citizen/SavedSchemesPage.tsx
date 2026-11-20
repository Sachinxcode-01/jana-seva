import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark, Search, Filter, ArrowUpDown, ExternalLink,
  CheckCircle2, Building2, Calendar, Sparkles, Trash2, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Scheme, SchemeCategory, SchemeClassification } from '../../types';

interface SavedSchemesPageProps {
  onSelectScheme: (scheme: Scheme) => void;
  onToggleSaveScheme: (schemeId: string) => void;
}

export const SavedSchemesPage: React.FC<SavedSchemesPageProps> = ({
  onSelectScheme,
  onToggleSaveScheme
}) => {
  const [savedSchemes, setSavedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedClassification, setSelectedClassification] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'recent'>('recent');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadSavedSchemes = async () => {
    setLoading(true);
    try {
      const res = await api.getSavedSchemes();
      if (res.success && res.schemes) {
        setSavedSchemes(res.schemes);
      }
    } catch (e) {
      console.warn('Failed fetching saved schemes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedSchemes();
  }, []);

  const handleRemoveBookmark = async (scheme: Scheme) => {
    const confirmRemove = window.confirm(`Remove "${scheme.name}" from your bookmarked schemes?`);
    if (!confirmRemove) return;

    await onToggleSaveScheme(scheme.id);
    setSavedSchemes(prev => prev.filter(s => s.id !== scheme.id));
    setToastMessage(`"${scheme.name}" removed from saved schemes.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories = [
    'All',
    'Women Empowerment',
    'Student Scholarships',
    'Farmer Welfare',
    'Employment Opportunities',
    'Financial Assistance',
    'Health and Social Welfare'
  ];

  const filteredSchemes = useMemo(() => {
    return savedSchemes
      .filter(s => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
        const matchesClass = selectedClassification === 'All' || s.classification === selectedClassification;

        return matchesSearch && matchesCat && matchesClass;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // recently saved preserves retrieval order
      });
  }, [savedSchemes, searchQuery, selectedCategory, selectedClassification, sortBy]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#101016] border border-[#8f8bff]/30 text-white text-xs shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <Bookmark className="w-4 h-4 text-[#8f8bff]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Saved Welfare Schemes</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">
              {savedSchemes.length} Bookmarked
            </span>
          </div>
          <p className="text-xs text-[#8a8a97] mt-1">
            Schemes you have bookmarked for quick review, documentation check, and application filing.
          </p>
        </div>

        <Link
          to="/schemes"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Explore All Schemes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c0c12] border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved schemes by title, keyword, or department..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-[#8a8a97] text-xs focus:outline-none focus:border-[#8f8bff]"
            />
            <Search className="w-4 h-4 text-[#8a8a97] absolute left-3.5 top-3" />
          </div>

          {/* Classification Filter (Central / State) */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#101016]">All Classifications</option>
              <option value="Central" className="bg-[#101016]">Central Schemes</option>
              <option value="State" className="bg-[#101016]">State (Karnataka)</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="recent" className="bg-[#101016]">Recently Saved</option>
              <option value="name" className="bg-[#101016]">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#8f8bff] text-[#050507] font-semibold shadow-sm'
                  : 'bg-white/[0.04] text-[#b6b6c2] hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Saved Schemes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse p-6 space-y-4">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-6 w-48 bg-white/10 rounded" />
              <div className="h-16 w-full bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0c0c12] border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8f8bff]/10 text-[#8f8bff] flex items-center justify-center mx-auto border border-[#8f8bff]/20">
            <Bookmark className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Saved Schemes Found</h3>
            <p className="text-xs text-[#8a8a97] max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'All' || selectedClassification !== 'All'
                ? 'No schemes match your current search and filter criteria.'
                : 'Bookmark welfare schemes while browsing to keep them organized here for easy tracking.'}
            </p>
          </div>
          <Link
            to="/schemes"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8f8bff] to-[#6fd8ff] text-[#050507] text-xs font-semibold cursor-pointer"
          >
            <span>Explore Schemes Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="p-6 rounded-3xl bg-[#0c0c12] border border-white/10 hover:border-[#8f8bff]/40 transition-all flex flex-col justify-between space-y-5 group relative"
            >
              <div className="space-y-3">
                {/* Header row: badge + remove button */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    scheme.classification === 'State'
                      ? 'bg-[#f3c64f]/15 text-[#f3c64f] border border-[#f3c64f]/30'
                      : 'bg-[#6fd8ff]/15 text-[#6fd8ff] border border-[#6fd8ff]/30'
                  }`}>
                    {scheme.classification} • {scheme.state}
                  </span>

                  <button
                    onClick={() => handleRemoveBookmark(scheme)}
                    className="p-1.5 rounded-lg text-[#8f8bff] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove from saved schemes"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Scheme Title */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#8f8bff] transition-colors line-clamp-2">
                    {scheme.name}
                  </h3>
                  <p className="text-[11px] text-[#8a8a97] mt-0.5">{scheme.department}</p>
                </div>

                {/* Short description */}
                <p className="text-xs text-[#b6b6c2] line-clamp-3 leading-relaxed">
                  {scheme.description}
                </p>

                {/* Key Benefits Preview */}
                {scheme.benefits && scheme.benefits.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <p className="text-[10px] font-semibold uppercase text-[#1ed760] tracking-wider">
                      Key Benefit
                    </p>
                    <p className="text-xs text-[#f5f5f8] line-clamp-2">
                      {scheme.benefits[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#8a8a97]">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Verified: {scheme.lastUpdated || '2026'}</span>
                  </span>
                  {scheme.officialWebsite && (
                    <a
                      href={scheme.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white flex items-center space-x-1"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onSelectScheme(scheme)}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer text-center"
                  >
                    View Details
                  </button>
                  <Link
                    to="/eligibility"
                    className="px-3 py-2 rounded-xl bg-[#8f8bff]/20 hover:bg-[#8f8bff]/30 text-[#8f8bff] border border-[#8f8bff]/30 text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Check Eligibility
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
