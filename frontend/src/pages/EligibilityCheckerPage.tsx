import React, { useState } from 'react';
import {
  Sparkles, CheckCircle2, AlertCircle, XCircle, FileText,
  ExternalLink, ArrowRight, RotateCcw, ShieldCheck, Info,
  ChevronRight, ArrowLeft, Calculator, SlidersHorizontal, Bookmark, BookmarkCheck
} from 'lucide-react';
import { api, FALLBACK_SCHEMES } from '../services/api';
import { EligibilityResult } from '../types';
import { EquationWorkflow } from '../components/EquationWorkflow';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ALL_INDIAN_STATES } from '../utils/indiaStates';

interface EligibilityCheckerPageProps {
  onViewSchemeDetails?: (schemeId: string) => void;
}

export const EligibilityCheckerPage: React.FC<EligibilityCheckerPageProps> = ({ onViewSchemeDetails }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'wizard' | 'equation'>('wizard');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [savedHistoryMap, setSavedHistoryMap] = useState<Record<string, boolean>>({});
  const [historyToast, setHistoryToast] = useState<string | null>(null);

  // Form states
  const [age, setAge] = useState<number>(22);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [state, setState] = useState('Karnataka');
  const [occupation, setOccupation] = useState('Farmer');
  const [beneficiaryCategory, setBeneficiaryCategory] = useState('Women');
  const [annualIncome, setAnnualIncome] = useState<number>(150000);
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [hasBPLCard, setHasBPLCard] = useState(true);

  // Results
  const [results, setResults] = useState<{
    disclaimer: string;
    totalEvaluated: number;
    eligibleCount: number;
    eligibleSchemes: EligibilityResult[];
    partiallyEligible: EligibilityResult[];
  } | null>(null);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await api.checkEligibility({
        age,
        state,
        occupation,
        gender,
        beneficiaryCategory,
        annualIncome,
        educationLevel,
        hasBPLCard
      });
      setResults(res);
      setStep(4);
    } catch (e) {
      console.error('Error during eligibility evaluation:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  const handleSaveToHistory = async (res: EligibilityResult) => {
    try {
      await api.saveEligibilityEvaluation({
        schemeId: res.schemeId,
        schemeName: res.schemeName,
        category: res.category,
        matchScore: res.matchScore,
        isEligible: res.isEligible,
        matchingReasons: res.matchingReasons,
        unmetConditions: res.unmetConditions,
        requiredDocuments: res.requiredDocuments,
        inputCriteria: {
          age,
          state,
          occupation,
          beneficiaryCategory,
          annualIncome,
          gender,
          educationLevel
        }
      });
      setSavedHistoryMap(prev => ({ ...prev, [res.schemeId]: true }));
      setHistoryToast(`Evaluation for "${res.schemeName}" saved to your history.`);
      setTimeout(() => setHistoryToast(null), 3000);
    } catch (e) {
      console.warn('Error saving to history:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[#f5f5f8] relative">
      {/* Toast Alert */}
      {historyToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#101016] border border-[#1ed760]/30 text-[#1ed760] text-xs shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{historyToast}</span>
        </div>
      )}
      {/* Page Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#8f8bff]/10 text-[#8f8bff] text-xs font-semibold border border-[#8f8bff]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#f3c64f]" />
            <span>Interactive Civic Advisory Tool</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f5f5f8] mt-2">
            Smart Scheme Eligibility Checker
          </h1>
          <p className="text-xs sm:text-sm text-[#b6b6c2] mt-1 font-normal">
            Verify eligibility against official government welfare rules in 3 simple steps without sharing private credentials.
          </p>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center bg-white/[0.03] p-1 rounded-full border border-white/10 shrink-0 text-xs">
          <button
            onClick={() => setViewMode('wizard')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${viewMode === 'wizard' ? 'bg-white/10 text-[#f5f5f8] font-semibold border border-white/10 shadow-sm' : 'text-[#8a8a97] hover:text-[#f5f5f8]'
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8f8bff]" />
            <span>Citizen Wizard</span>
          </button>
          <button
            onClick={() => setViewMode('equation')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${viewMode === 'equation' ? 'bg-white/10 text-[#f5f5f8] font-semibold border border-white/10 shadow-sm' : 'text-[#8a8a97] hover:text-[#f5f5f8]'
              }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#f3c64f]" />
            <span>Equation Workflow</span>
          </button>
        </div>
      </div>

      {/* When Equation Workflow mode is active */}
      {viewMode === 'equation' && (
        <div className="animate-in fade-in duration-200">
          <EquationWorkflow schemes={FALLBACK_SCHEMES} />
        </div>
      )}

      {/* When Wizard mode is active */}
      {viewMode === 'wizard' && (
        <div className="space-y-8">
          {/* Non-sensitive Privacy Guarantee Badge */}
          <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] text-xs text-[#b6b6c2] flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#1ed760] shrink-0" />
              <span><strong className="text-[#f5f5f8]">Zero Sensitive Data Stored:</strong> We do not ask for or collect Aadhaar numbers, OTPs, or bank account credentials.</span>
            </div>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/20">
              Privacy Safe
            </span>
          </div>

          {/* Step Indicators */}
          {step < 4 && (
            <div className="relative max-w-xl mx-auto py-3">
              <div className="flex items-center justify-between relative z-10 px-2 sm:px-6">
                {[
                  { num: 1, title: '1. Domicile', desc: 'Age, Gender & State' },
                  { num: 2, title: '2. Occupation', desc: 'Livelihood & Group' },
                  { num: 3, title: '3. Economics', desc: 'Income & BPL Status' },
                ].map((s) => (
                  <div key={s.num} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => step > s.num && setStep(s.num as any)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border ${step === s.num
                          ? 'bg-[#8f8bff] text-[#050507] border-[#8f8bff] shadow-[0_0_15px_rgba(143,139,255,0.45)] scale-110'
                          : step > s.num
                            ? 'bg-[#1ed760] text-[#050507] border-[#1ed760] cursor-pointer'
                            : 'bg-white/[0.04] text-[#8a8a97] border-white/10'
                        }`}
                    >
                      {step > s.num ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : s.num}
                    </button>
                    <span className={`text-[11.5px] font-medium mt-1.5 ${step === s.num ? 'text-[#f5f5f8] font-semibold' : 'text-[#8a8a97]'}`}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
              {/* Background Connecting Line */}
              <div className="absolute top-[28px] left-12 right-12 h-[2px] bg-white/[0.08] -z-0">
                <div
                  className="h-full bg-gradient-to-r from-[#8f8bff] to-[#1ed760] transition-all duration-300"
                  style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                />
              </div>
            </div>
          )}

          {/* Step 1: Domicile & Demographics */}
          {step === 1 && (
            <div className="bytune-card p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-white/[0.08] pb-4">
                <div className="inline-flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-[#8f8bff] mb-1">
                  <span>Step 1 of 3</span>
                </div>
                <h2 className="text-lg font-medium text-[#f5f5f8]">Age, Gender & State Domicile</h2>
                <p className="text-xs text-[#8a8a97] mt-0.5">State schemes like Gruha Lakshmi or Shakti require local domicile.</p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Age */}
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1.5">Applicant Age (Years)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-36 py-2.5 px-4 rounded-xl border border-white/10 bg-[#101016] text-sm font-semibold text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                    />
                    <span className="text-[11px] text-[#8a8a97]">Verified against scheme rules (e.g., student vs elder pensions).</span>
                  </div>
                </div>

                {/* Gender Option Cards */}
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-2">Gender Identity</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { val: 'Female', label: 'Female', note: 'Eligible for Gruha Lakshmi, Shakti bus pass, Matru Vandana' },
                      { val: 'Male', label: 'Male', note: 'Eligible for Farmer DBT, SSP, Yuva Nidhi' },
                      { val: 'Other', label: 'Transgender / Other', note: 'Eligible for Mythri pension, welfare reservations' },
                    ].map((g) => (
                      <div
                        key={g.val}
                        onClick={() => setGender(g.val as any)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${gender === g.val
                            ? 'bg-[#8f8bff]/15 border-[#8f8bff]/60 text-[#f5f5f8] shadow-[0_0_15px_rgba(143,139,255,0.2)]'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-[#b6b6c2]'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#f5f5f8]">{g.label}</span>
                          {gender === g.val && <CheckCircle2 className="w-3.5 h-3.5 text-[#8f8bff]" />}
                        </div>
                        <p className="text-[10px] text-[#8a8a97] mt-1 leading-relaxed">{g.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1.5">State of Residence</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl border border-white/10 bg-[#101016] text-xs font-medium text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none cursor-pointer"
                  >
                    <option value="Karnataka">Karnataka (Includes 5 State Guarantees: Gruha Lakshmi, Shakti, Yuva Nidhi, etc.)</option>
                    {ALL_INDIAN_STATES.filter(s => s.name !== 'Karnataka').map(st => (
                      <option key={st.code} value={st.name}>
                        {st.name} (Capital: {st.capital})
                      </option>
                    ))}
                    <option value="Other">Other States & Union Territories (Central DBT Schemes)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => setStep(2)}
                  className="bytune-btn-solid w-full sm:w-auto justify-center flex items-center space-x-1.5 px-6 py-2.5 text-xs font-semibold cursor-pointer active:scale-98"
                >
                  <span>Continue to Step 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Occupation & Beneficiary Group */}
          {step === 2 && (
            <div className="bytune-card p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-white/[0.08] pb-4">
                <h2 className="text-base font-medium text-[#f5f5f8]">Step 2: Livelihood & Beneficiary Group</h2>
                <p className="text-xs text-[#8a8a97] mt-0.5">Identify whether you are a farmer, student, entrepreneur, or homemaker.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                {/* Primary Occupation */}
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Primary Occupation</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-xs font-medium text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  >
                    <option value="Farmer">Farmer / Agriculture Landholder</option>
                    <option value="Student">Student (School / College / Technical)</option>
                    <option value="Homemaker">Homemaker / Woman Head of Family</option>
                    <option value="Street Vendor">Street Vendor / Hawker / Daily Wage</option>
                    <option value="Unemployed">Unemployed Graduate / Youth</option>
                    <option value="Self-Employed">Self-Employed / Small Business Owner</option>
                    <option value="Salaried">Private / Salaried Employee</option>
                  </select>
                </div>

                {/* Target Beneficiary Group */}
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Beneficiary Group</label>
                  <select
                    value={beneficiaryCategory}
                    onChange={(e) => setBeneficiaryCategory(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-xs font-medium text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  >
                    <option value="Women">Women Empowerment Programs</option>
                    <option value="Students">Student Scholarships & Stipends</option>
                    <option value="Farmers">Farmers & Agriculture Welfare</option>
                    <option value="General">General / Citizen at Large</option>
                  </select>
                </div>

                {/* Highest Education */}
                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#b6b6c2] mb-1">Highest Education Level Completed / Ongoing</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-xs font-medium text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  >
                    <option value="Undergraduate">Bachelor's Degree (BA, BSc, BCom, BE, BTech, etc.)</option>
                    <option value="Diploma">Polytechnic Diploma / ITI</option>
                    <option value="PUC">Pre-University (Class 11 / 12)</option>
                    <option value="School">School Education (Class 1 to 10)</option>
                    <option value="Postgraduate">Master's / Ph.D.</option>
                    <option value="None">None / Basic Literacy</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => setStep(1)}
                  className="bytune-pill px-4 py-2.5 sm:py-2 text-xs flex items-center justify-center space-x-1 cursor-pointer w-full sm:w-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="bytune-btn-solid flex items-center justify-center space-x-1.5 px-6 py-2.5 text-xs font-semibold cursor-pointer w-full sm:w-auto active:scale-98"
                >
                  <span>Continue to Step 3</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Economic Bracket & Ration Card */}
          {step === 3 && (
            <div className="bytune-card p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-white/[0.08] pb-4">
                <h2 className="text-base font-medium text-[#f5f5f8]">Step 3: Economic Bracket & Welfare Documentation</h2>
                <p className="text-xs text-[#8a8a97] mt-0.5">Government schemes use income ceilings to prioritize subsidies.</p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Annual Income */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-medium text-[#b6b6c2]">Estimated Annual Family Income: <strong className="text-[#8f8bff] font-mono">₹{annualIncome.toLocaleString('en-IN')}</strong></label>
                  </div>
                  <input
                    type="range"
                    min={30000}
                    max={1000000}
                    step={10000}
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                    className="w-full accent-[#8f8bff] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8a8a97] mt-1 font-mono">
                    <span>₹30,000 (Low Income)</span>
                    <span>₹2,50,000 (Scholarship Limit)</span>
                    <span>₹5,00,000</span>
                    <span>₹10,00,000+</span>
                  </div>
                </div>

                {/* Ration Card */}
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-2">Ration Card / Economic Status</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setHasBPLCard(true)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${hasBPLCard
                          ? 'bg-[#1ed760]/10 border-[#1ed760]/40 text-[#f5f5f8] shadow-[0_0_15px_rgba(30,215,96,0.15)]'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-[#b6b6c2]'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#f5f5f8]">Yes, Holds BPL / Priority Card</span>
                        {hasBPLCard && <CheckCircle2 className="w-4 h-4 text-[#1ed760]" />}
                      </div>
                      <p className="text-[11px] text-[#8a8a97] mt-1 leading-relaxed">
                        Qualifies for Gruha Lakshmi, Ayushman Arogya Karnataka & subsidized food/agriculture.
                      </p>
                    </div>

                    <div
                      onClick={() => setHasBPLCard(false)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${!hasBPLCard
                          ? 'bg-[#8f8bff]/15 border-[#8f8bff]/40 text-[#f5f5f8] shadow-[0_0_15px_rgba(143,139,255,0.15)]'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-[#b6b6c2]'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#f5f5f8]">No / APL / Non-Priority Card</span>
                        {!hasBPLCard && <CheckCircle2 className="w-4 h-4 text-[#8f8bff]" />}
                      </div>
                      <p className="text-[11px] text-[#8a8a97] mt-1 leading-relaxed">
                        Evaluated for universal schemes, merit scholarships & non-BPL welfare programs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => setStep(2)}
                  className="bytune-pill px-4 py-2.5 sm:py-2 text-xs flex items-center justify-center space-x-1 cursor-pointer w-full sm:w-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleEvaluate}
                  disabled={loading}
                  className="bytune-btn-accent flex items-center justify-center space-x-2 px-8 py-3 text-xs font-semibold cursor-pointer disabled:opacity-50 w-full sm:w-auto shadow-md active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-[#050507]" />
                  <span>{loading ? 'Evaluating Rules...' : 'Compute Eligible Schemes'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results Display */}
          {step === 4 && results && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Summary Box */}
              <div className="bytune-card p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(circle,_rgba(143,139,255,0.15),_transparent_70%)] pointer-events-none" />
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#8f8bff]">
                    Evaluation Assessment
                  </span>
                  <h2 className="text-xl sm:text-2xl font-medium text-[#f5f5f8] mt-1">
                    {results.eligibleCount} Welfare Schemes Found For You
                  </h2>
                  <p className="text-xs text-[#b6b6c2] mt-1 max-w-xl font-normal">
                    Evaluated based on Age: {age} • State: {state} • Occupation: {occupation} • Income: ₹{annualIncome.toLocaleString('en-IN')}.
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="bytune-pill px-4 py-2 text-xs font-medium flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8f8bff]" />
                  <span>Re-check Details</span>
                </button>
              </div>

              {/* Mandatory Public Advisory Disclaimer */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#f3c64f]/30 text-xs text-[#b6b6c2] leading-relaxed flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-[#f3c64f] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#f3c64f]">{t('disclaimerTitle')}: </strong>
                  {results.disclaimer}
                </div>
              </div>

              {/* Fully Eligible Schemes */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-[#f5f5f8] flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1ed760]" />
                  <span>Potentially Eligible Schemes (Full Match)</span>
                </h3>

                {results.eligibleSchemes.length > 0 ? (
                  <div className="space-y-4">
                    {results.eligibleSchemes.map((res) => (
                      <div
                        key={res.schemeId}
                        className="bytune-card p-5 sm:p-6 space-y-4 border border-[#1ed760]/30"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/[0.06] pb-3">
                          <div>
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30">
                              {res.category}
                            </span>
                            <h4 className="text-lg font-medium text-[#f5f5f8] mt-1.5">
                              {res.schemeName}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-medium text-[#1ed760] bg-[#1ed760]/10 px-3 py-1 rounded-full border border-[#1ed760]/20">
                              {res.matchScore}% Match
                            </span>
                            {user && (
                              <button
                                onClick={() => handleSaveToHistory(res)}
                                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
                                  savedHistoryMap[res.schemeId]
                                    ? 'bg-[#1ed760]/20 text-[#1ed760] border-[#1ed760]/40'
                                    : 'bg-white/5 text-[#8a8a97] hover:text-white border-white/10'
                                }`}
                                title={savedHistoryMap[res.schemeId] ? "Saved to your Citizen Eligibility History" : "Save to Eligibility History"}
                              >
                                {savedHistoryMap[res.schemeId] ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1ed760]" /> : <Bookmark className="w-3.5 h-3.5" />}
                                <span>{savedHistoryMap[res.schemeId] ? "Saved" : "Save"}</span>
                              </button>
                            )}
                            {onViewSchemeDetails && (
                              <button
                                onClick={() => onViewSchemeDetails(res.schemeId)}
                                className="bytune-pill px-3 py-1.5 text-xs font-medium cursor-pointer hover:border-[#8f8bff]/40 hover:text-[#8f8bff]"
                              >
                                Details
                              </button>
                            )}
                            <a
                              href={res.officialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bytune-btn-solid flex items-center space-x-1 text-xs font-semibold px-4 py-1.5 cursor-pointer"
                            >
                              <span>Apply</span>
                              <ExternalLink className="w-3 h-3 text-[#0a0a0c]" />
                            </a>
                          </div>
                        </div>

                        {/* Why You Qualify */}
                        <div>
                          <p className="text-xs font-medium text-[#f5f5f8] mb-2 flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1ed760] mr-1.5" />
                            {t('whyYouQualify')}:
                          </p>
                          <ul className="space-y-1 text-xs text-[#b6b6c2] pl-4 list-disc">
                            {res.matchingReasons.map((reason, rIdx) => (
                              <li key={rIdx}>{reason}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Required Documents */}
                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
                          <p className="text-xs font-medium text-[#f5f5f8] mb-2 flex items-center">
                            <FileText className="w-3.5 h-3.5 text-[#f3c64f] mr-1.5" />
                            {t('documentsRequired')}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {res.requiredDocuments.map((doc, dIdx) => (
                              <span key={dIdx} className="text-[11px] bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full text-[#b6b6c2]">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-[#8a8a97]">
                    No 100% full match schemes found for this exact demographic combination. Check partially matching schemes below.
                  </div>
                )}
              </div>

              {/* Partially Eligible Schemes */}
              {results.partiallyEligible.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                  <h3 className="text-base font-medium text-[#f5f5f8] flex items-center space-x-2">
                    <Info className="w-5 h-5 text-[#8f8bff]" />
                    <span>Conditionally Eligible Schemes (Close Match)</span>
                  </h3>

                  <div className="space-y-4">
                    {results.partiallyEligible.map((res) => (
                      <div
                        key={res.schemeId}
                        className="bytune-card p-5 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">
                              {res.category}
                            </span>
                            <h4 className="text-base font-medium text-[#f5f5f8] mt-1">
                              {res.schemeName}
                            </h4>
                          </div>
                          <span className="text-xs font-mono text-[#8a8a97] bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/5">
                            {res.matchScore}% Compatibility
                          </span>
                        </div>

                        {/* Unmet conditions */}
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                          <p className="font-semibold flex items-center text-rose-400 mb-1">
                            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />
                            {t('unmetConditions')}:
                          </p>
                          <ul className="space-y-0.5 pl-4 list-disc text-rose-300">
                            {res.unmetConditions.map((u, uIdx) => (
                              <li key={uIdx}>{u}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
