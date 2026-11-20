import React, { useState, useEffect } from 'react';
import {
  Search, ArrowRight, ShieldCheck, Sparkles, Building2,
  Award, BookOpen, HeartHandshake, Briefcase,
  IndianRupee, Stethoscope, ChevronRight, ChevronDown
} from 'lucide-react';
import { Scheme, SchemeCategory } from '../types';
import { SchemeCard } from '../components/SchemeCard';
import { EquationWorkflow } from '../components/EquationWorkflow';
import { AllStatesDirectory } from '../components/AllStatesDirectory';
import { useLanguage } from '../context/LanguageContext';
import SplitText from '../components/SplitText';

interface HomePageProps {
  schemes: Scheme[];
  onSelectScheme: (scheme: Scheme) => void;
  onNavigateTab: (tab: string, filterCategory?: string, search?: string) => void;
  onToggleSaveScheme: (schemeId: string) => void;
  savedSchemeIds: string[];
  onSelectStateFilter?: (stateName: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  schemes,
  onSelectScheme,
  onNavigateTab,
  onToggleSaveScheme,
  savedSchemeIds,
  onSelectStateFilter
}) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Scheme[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'karnataka' | 'farmer' | 'student' | 'health'>('all');

  // Animated rotating text state
  const rotatingWords = language === 'kn'
    ? ['ರೈತರು', 'ಮಹಿಳೆಯರು', 'ವಿದ್ಯಾರ್ಥಿಗಳು', 'ಉದ್ಯಮಿಗಳು', 'ಹಿರಿಯ ನಾಗರಿಕರು']
    : language === 'hi'
      ? ['किसान', 'महिलाएं', 'छात्र', 'उद्यमी', 'वरिष्ठ नागरिक']
      : ['Farmers', 'Rural Women', 'Students', 'Entrepreneurs', 'Senior Citizens'];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val.trim().length > 1) {
      const q = val.toLowerCase().trim();
      const matches = schemes.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.name_kn && s.name_kn.toLowerCase().includes(q)) ||
        (s.name_hi && s.name_hi.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateTab('schemes', undefined, searchTerm.trim());
  };

  const popularSearches = [
    { label: "Gruha Lakshmi", query: "Gruha Lakshmi" },
    { label: "PM-KISAN ₹6,000", query: "PM-KISAN" },
    { label: "SSP Scholarship", query: "SSP" },
    { label: "Shakti Free Bus", query: "Shakti" },
    { label: "Ayushman Bharat", query: "Ayushman" },
  ];

  const categories: {
    name: SchemeCategory;
    icon: any;
    color: string;
    description: string;
    count: number;
  }[] = [
      {
        name: 'Women Empowerment',
        icon: HeartHandshake,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        description: 'Monthly cash grants, free bus travel & livelihood empowerment',
        count: schemes.filter(s => s.category === 'Women Empowerment').length
      },
      {
        name: 'Student Scholarships',
        icon: BookOpen,
        color: 'text-[#8f8bff] bg-[#8f8bff]/10 border-[#8f8bff]/20',
        description: 'Post-matric, merit-cum-means & fee reimbursement schemes',
        count: schemes.filter(s => s.category === 'Student Scholarships').length
      },
      {
        name: 'Farmer Welfare',
        icon: Award,
        color: 'text-[#1ed760] bg-[#1ed760]/10 border-[#1ed760]/20',
        description: 'Direct income support, crop insurance & agricultural subsidies',
        count: schemes.filter(s => s.category === 'Farmer Welfare').length
      },
      {
        name: 'Employment Opportunities',
        icon: Briefcase,
        color: 'text-[#f3c64f] bg-[#f3c64f]/10 border-[#f3c64f]/20',
        description: 'Skill development, unemployment allowance & vendor credits',
        count: schemes.filter(s => s.category === 'Employment Opportunities').length
      },
      {
        name: 'Financial Assistance',
        icon: IndianRupee,
        color: 'text-[#6fd8ff] bg-[#6fd8ff]/10 border-[#6fd8ff]/20',
        description: 'Collateral-free enterprise loans & microfinance initiatives',
        count: schemes.filter(s => s.category === 'Financial Assistance').length
      },
      {
        name: 'Health and Social Welfare',
        icon: Stethoscope,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        description: 'Cashless hospital coverage & social security for families',
        count: schemes.filter(s => s.category === 'Health and Social Welfare').length
      }
    ];

  const filteredFeaturedSchemes = schemes.filter(s => {
    if (featuredFilter === 'karnataka') return s.state.toLowerCase().includes('karnataka');
    if (featuredFilter === 'farmer') return s.category === 'Farmer Welfare';
    if (featuredFilter === 'student') return s.category === 'Student Scholarships';
    if (featuredFilter === 'health') return s.category === 'Health and Social Welfare';
    return true;
  }).slice(0, 4);

  const featuredSchemes = filteredFeaturedSchemes.length > 0 ? filteredFeaturedSchemes : schemes.slice(0, 4);

  const faqs = [
    {
      q: "What is JANASEVA and what problem does it solve?",
      a: "JANASEVA is an academic Computer Science & Engineering CBP (Computer-Based Project) civic technology web portal. It centralizes verified Central and State welfare programs, simplifies eligibility criteria into an automated rule engine, and guides citizens directly to official application portals without broker interference or fees."
    },
    {
      q: "Does JANASEVA collect my Aadhaar number or bank details?",
      a: "No. JANASEVA strictly implements a Privacy-Safe design. We only evaluate demographic parameters (age bracket, state, occupation, income range) to compute preliminary eligibility. We never ask for or store Aadhaar numbers, OTPs, or bank passwords."
    },
    {
      q: "Are the schemes up to date and verified from official government sources?",
      a: "Yes. All initial records are sourced from verified official government notifications (Seva Sindhu, scholarships.gov.in, pmkisan.gov.in, pmjay.gov.in). Each scheme clearly displays its government department, verification status, and direct link."
    },
    {
      q: "How does the Smart Eligibility Checker calculate my match score?",
      a: "The checker uses a deterministic multi-parameter scoring formula evaluating 5 gates: State Domicile (25%), Gender Requirement (20%), Age Bracket (15%), Income Ceiling (25%), and Target Occupation (15%). If all gates are satisfied, you get a 100% Full Match rating with exact required documents."
    }
  ];

  return (
    <div className="pb-24 text-[#f5f5f8]">
      {/* Live Government Notification Ticker Bar */}
      <div className="bg-[#0a0a0e]/60 border-b border-white/[0.06] py-2 px-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 text-[#8f8bff] font-medium shrink-0">
            <span className="flex items-end gap-0.5 h-3 px-1">
              <span className="w-0.5 bg-[#8f8bff] eq-bar-1 rounded-full"></span>
              <span className="w-0.5 bg-[#8f8bff] eq-bar-2 rounded-full"></span>
              <span className="w-0.5 bg-[#8f8bff] eq-bar-3 rounded-full"></span>
              <span className="w-0.5 bg-[#8f8bff] eq-bar-4 rounded-full"></span>
            </span>
            <span className="uppercase tracking-wider text-[11px] font-semibold text-[#f5f5f8]">Official Bulletin:</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap text-[#b6b6c2] font-normal text-xs">
            <span className="inline-block animate-pulse">
              • Karnataka SSP Post-Matric Scholarship 2026 Portal Active • PM-KISAN 19th Installment DBT Verification in Progress • Gruha Lakshmi Beneficiary e-KYC Active at Grama One • Shakti Scheme Free Bus Passes Active Across All 4 State RTCs
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-8 pb-10 sm:pb-14 overflow-visible">
        {/* Ambient Hero Glow Behind Title & Modern Dot Grid */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black_30%,transparent_85%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] pointer-events-none -z-10 bg-[radial-gradient(ellipse,_rgba(143,139,255,0.18),_transparent_70%)] blur-2xl" />
        <div className="absolute top-1/3 left-1/4 w-[320px] h-[320px] pointer-events-none -z-10 bg-[radial-gradient(circle,_rgba(111,216,255,0.12),_transparent_65%)] blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Verified Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs font-medium text-[#f5f5f8] shadow-sm transition-transform hover:scale-102">
              <span className="w-2 h-2 rounded-full bg-[#1ed760] shadow-[0_0_8px_#1ed760] animate-pulse"></span>
              <span>All 28 States & Central Government Welfare</span>
              <span className="text-white/20">•</span>
              <span className="text-[#8f8bff] font-semibold">100% Verified Rules</span>
            </div>

            {/* Dynamic Animated Headline - Balanced & Fully Responsive */}
            <div className="space-y-3 text-center px-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium text-[#f5f5f8] tracking-[-0.035em] leading-[1.15] max-w-4xl mx-auto">
                {language === 'kn' ? (
                  <>
                    ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ <br className="hidden sm:inline" />
                    <span className="text-[#b6b6c2]">ಸಬಲೀಕರಣ: </span>
                    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#8f8bff] via-[#6fd8ff] to-[#1ed760] font-semibold transition-all duration-300">
                      {rotatingWords[currentWordIndex]}
                    </span>
                  </>
                ) : language === 'hi' ? (
                  <>
                    सरकारी योजनाओं की सीधी जानकारी <br className="hidden sm:inline" />
                    <span className="text-[#b6b6c2]">सशक्त नागरिक: </span>
                    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#8f8bff] via-[#6fd8ff] to-[#1ed760] font-semibold transition-all duration-300">
                      {rotatingWords[currentWordIndex]}
                    </span>
                  </>
                ) : (
                  <>
                    Discover Government Schemes. <br className="hidden sm:inline" />
                    <span className="text-[#b6b6c2]">Empowering </span>
                    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#8f8bff] via-[#6fd8ff] to-[#1ed760] font-semibold transition-all duration-300">
                      {rotatingWords[currentWordIndex]}
                    </span>
                  </>
                )}
              </h1>
            </div>

            <p className="text-xs sm:text-sm md:text-base text-[#b6b6c2] leading-relaxed max-w-2xl mx-auto font-normal px-4">
              Explore central and state welfare initiatives, verify your eligibility with official criteria, and get direct access to official government application portals without middlemen.
            </p>

            {/* Smart Search Bar with Autocomplete - ByTune Glass Styling (Responsive & Collision-Free) */}
            <div className="relative max-w-2xl mx-auto w-full pt-1 sm:pt-2 px-2 sm:px-0">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a8a97] absolute left-4 sm:left-5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  placeholder="Search schemes (e.g. Gruha Lakshmi, PM-KISAN, SSP)..."
                  className="w-full pl-11 sm:pl-13 pr-28 sm:pr-36 py-3.5 sm:py-4 rounded-full border border-white/10 focus:border-[#8f8bff]/60 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] text-xs sm:text-sm focus:outline-none bg-[#101016]/90 text-[#f5f5f8] placeholder-[#60606c] backdrop-blur-xl transition-all"
                />
                <button
                  type="submit"
                  className="bytune-btn-solid absolute right-1.5 sm:right-2 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold cursor-pointer shrink-0"
                >
                  <span>Search</span>
                  <span className="hidden sm:inline ml-1">Schemes</span>
                </button>
              </form>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute left-0 right-0 mt-2 bg-[#101016]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50 text-left divide-y divide-white/5"
                  onMouseLeave={() => setShowSuggestions(false)}
                >
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        onSelectScheme(s);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-2.5 hover:bg-[#8f8bff]/10 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-xs font-medium text-[#f5f5f8]">{s.name}</p>
                        <p className="text-[11px] text-[#8a8a97]">{s.department} • {s.state}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#6fd8ff] border border-white/5">
                        {s.classification}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Popular Searches Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-3 text-[11px] sm:text-xs text-[#8a8a97]">
                <span className="font-medium mr-0.5 text-[#b6b6c2]">Trending:</span>
                {popularSearches.map((ps, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchTerm(ps.query);
                      onNavigateTab('schemes', undefined, ps.query);
                    }}
                    className="px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.035] hover:bg-white/[0.09] text-[#b6b6c2] hover:text-[#f5f5f8] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer font-medium text-[11px] sm:text-xs"
                  >
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full max-w-md mx-auto">
              <button
                onClick={() => onNavigateTab('eligibility')}
                className="bytune-btn-accent w-full sm:w-auto justify-center flex items-center space-x-2 px-7 py-3 text-xs sm:text-sm cursor-pointer shadow-[0_0_25px_rgba(143,139,255,0.3)] hover:shadow-[0_0_35px_rgba(143,139,255,0.45)]"
              >
                <Sparkles className="w-4 h-4 text-[#050507]" />
                <span>{t('checkEligibilityBtn')}</span>
              </button>

              <button
                onClick={() => onNavigateTab('schemes')}
                className="bytune-pill w-full sm:w-auto justify-center flex items-center space-x-1.5 px-7 py-3 text-xs sm:text-sm font-medium hover:border-[#8f8bff]/40 hover:text-[#8f8bff] cursor-pointer"
              >
                <span>{t('exploreAllBtn')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* BYTUNE HERO SHOWCASE CARD (Exact specimen from ByTune: Floating Glass Player & Live Counter) */}
            <div className="pt-8 sm:pt-10 flex justify-center w-full px-2 sm:px-0">
              <div className="relative w-full max-w-xl">
                {/* Radial Glow Layer (Card 3 in reference) */}
                <div className="absolute inset-0 -top-6 -bottom-6 bytune-glow pointer-events-none -z-10 rounded-full blur-2xl opacity-75"></div>

                {/* Floating Glass Card (Card 2 in reference) */}
                <div className="bytune-card anim-float text-left p-4 sm:p-6 md:p-7 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#8f8bff] to-[#6fd8ff] flex items-center justify-center text-[#050507] shadow-md shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#f5f5f8] truncate">Gruha Lakshmi Direct Support</h4>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] shadow-[0_0_6px_#1ed760] animate-ping shrink-0"></span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#8a8a97] truncate">Department of Women & Child Development · Karnataka</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs text-[#1ed760] font-mono bg-[#1ed760]/10 border border-[#1ed760]/20 px-2 sm:px-2.5 py-1 rounded-full shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760]"></span>
                      <span>ACTIVE DBT</span>
                    </div>
                  </div>

                  {/* Benefit Status Progress Bar */}
                  <div className="py-3.5 sm:py-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#b6b6c2]">
                      <span className="text-[#8f8bff] font-semibold">₹2,000 / month</span>
                      <span className="text-[#8a8a97]">Direct Bank Transfer</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#8f8bff] via-[#6fd8ff] to-[#1ed760] w-[68%] rounded-full"></div>
                    </div>
                  </div>

                  {/* ByTune Specimen Pills observed from reference: UNLIMITED STREAMING NO ADS OPEN SOURCE LOCAL FILES */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-[9.5px] sm:text-[10px] font-mono tracking-wider px-2 sm:px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[#b6b6c2]">
                      100% FREE ACCESS
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] font-mono tracking-wider px-2 sm:px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[#b6b6c2]">
                      ZERO AGENT FEES
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] font-mono tracking-wider px-2 sm:px-2.5 py-1 rounded-full bg-[#8f8bff]/10 border border-[#8f8bff]/30 text-[#8f8bff]">
                      OPEN SOURCE CSE CBP
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] font-mono tracking-wider px-2 sm:px-2.5 py-1 rounded-full bg-[#1ed760]/10 border border-[#1ed760]/30 text-[#1ed760]">
                      8,400+ CITIZENS ASSISTED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8">
              <div className="bytune-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-2xl sm:text-3xl font-medium text-[#f5f5f8] tracking-tight">28 States</p>
                  <p className="text-xs text-[#8a8a97] mt-0.5">Pan-India State Coverage</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-medium text-[#1ed760] tracking-tight">₹0 Fees</p>
                  <p className="text-xs text-[#8a8a97] mt-0.5">Free Official Guidance</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-medium text-[#8f8bff] tracking-tight">3 Languages</p>
                  <p className="text-xs text-[#8a8a97] mt-0.5">English • ಕನ್ನಡ • हिंदी</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-medium text-[#6fd8ff] tracking-tight">Instant</p>
                  <p className="text-xs text-[#8a8a97] mt-0.5">Rules-Based Match Engine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Sections Container */}
        <div className="space-y-12 sm:space-y-18 mt-8 sm:mt-12">
          {/* SECTION: ALL 28 STATES OF INDIA (Responsive Compact State Buttons) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-8">
            <AllStatesDirectory
              onSelectState={(stateName) => {
                if (onSelectStateFilter) onSelectStateFilter(stateName);
                onNavigateTab('schemes');
              }}
            />
          </section>

          {/* Welfare Categories Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8f8bff]/10 border border-[#8f8bff]/20 text-[#8f8bff] text-xs font-medium tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8f8bff] animate-pulse"></span>
                  <span className="uppercase tracking-wider">Targeted Public Support</span>
                </div>
                <SplitText
                  key={`cat-title-${language}`}
                  text="Explore Schemes by Beneficiary Category"
                  tag="h2"
                  className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#f5f5f8] tracking-[-0.02em] block"
                  delay={25}
                  duration={0.6}
                  splitType="words"
                  effect="rise"
                />
                <p className="text-xs sm:text-sm text-[#b6b6c2] max-w-2xl font-normal">
                  Explore targeted welfare schemes categorized by citizen group, demographic needs, and financial support programs.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('categories')}
                className="text-xs font-medium text-[#8f8bff] hover:text-[#6fd8ff] flex items-center transition-colors cursor-pointer shrink-0 self-start md:self-end pb-1"
              >
                View all categories <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => onNavigateTab('schemes', cat.name)}
                    className="bytune-card bytune-card-hover p-6 cursor-pointer flex items-start space-x-4 group relative overflow-hidden"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${cat.color} group-hover:scale-108 transition-all duration-300 shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-[14px] text-[#f5f5f8] group-hover:text-[#8f8bff] transition-colors truncate">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#b6b6c2] border border-white/5 shrink-0">
                          {cat.count} Schemes
                        </span>
                      </div>
                      <p className="text-xs text-[#b6b6c2] mt-1.5 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                      <div className="mt-2.5 flex items-center text-[11px] font-medium text-[#8a8a97] group-hover:text-[#8f8bff] transition-colors">
                        <span>Explore category</span>
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Flagship Featured Schemes */}
          <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1ed760]/10 border border-[#1ed760]/20 text-[#1ed760] text-xs font-medium tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1ed760]" />
                  <span className="uppercase tracking-wider">Direct Benefit Transfer & Welfare</span>
                </div>
                <SplitText
                  key={`feat-title-${language}`}
                  text={t('featuredSchemesTitle')}
                  tag="h2"
                  className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#f5f5f8] tracking-[-0.02em] block"
                  delay={25}
                  duration={0.6}
                  splitType="words"
                  effect="rise"
                />
                <p className="text-xs sm:text-sm text-[#b6b6c2] max-w-2xl font-normal">
                  {t('featuredSchemesSubtitle')}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('schemes')}
                className="text-xs font-medium text-[#8f8bff] hover:text-[#6fd8ff] flex items-center transition-colors cursor-pointer shrink-0 self-start md:self-end pb-1"
              >
                Explore all {schemes.length} schemes <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Featured Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar text-xs scroll-smooth -webkit-overflow-scrolling-touch">
              {[
                { id: 'all', label: 'All Flagship' },
                { id: 'karnataka', label: 'Karnataka 5 Guarantees' },
                { id: 'farmer', label: 'Farmer Welfare (DBT)' },
                { id: 'student', label: 'Student Scholarships' },
                { id: 'health', label: 'Healthcare & Social' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFeaturedFilter(tab.id as any)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap font-medium text-xs border ${featuredFilter === tab.id
                    ? 'bg-white/12 text-[#f5f5f8] border-white/20 shadow-sm'
                    : 'bg-white/[0.03] text-[#8a8a97] hover:text-[#f5f5f8] border-white/[0.06] hover:bg-white/[0.07]'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  onViewDetails={onSelectScheme}
                  onCheckEligibility={() => onNavigateTab('eligibility')}
                  isSaved={savedSchemeIds.includes(scheme.id)}
                  onToggleSave={onToggleSaveScheme}
                />
              ))}
            </div>
          </section>

          {/* Interactive Equation Workflow Engine */}
          <section className="max-w-7xl mx-auto px-4 sm:px-8">
            <EquationWorkflow
              schemes={schemes}
              onSelectScheme={onSelectScheme}
            />
          </section>

          {/* Frequently Asked Questions (FAQ) Section */}
          <section className="max-w-4xl mx-auto px-4 sm:px-8 space-y-6">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8f8bff]/10 border border-[#8f8bff]/20 text-[#8f8bff] text-xs font-medium tracking-wide">
                <span className="uppercase tracking-wider">Frequently Asked Questions</span>
              </div>
              <SplitText
                key={`faq-title-${language}`}
                text="Common Citizen Inquiries & Answers"
                tag="h2"
                className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#f5f5f8] tracking-[-0.02em] block"
                delay={25}
                duration={0.6}
                splitType="words"
                effect="rise"
                textAlign="center"
              />
            </div>

            <div className="space-y-3">
              {faqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className="bytune-card overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}
                    className="w-full text-left p-5 flex items-center justify-between font-medium text-sm text-[#f5f5f8] hover:text-[#8f8bff] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#8a8a97] transition-transform ${activeFaq === fIdx ? 'rotate-180 text-[#8f8bff]' : ''}`} />
                  </button>
                  {activeFaq === fIdx && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#b6b6c2] leading-relaxed border-t border-white/[0.06] bg-black/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      );
};
