import React, { useState } from 'react';
import {
  Calculator, Zap, ShieldCheck, ChevronRight, CheckCircle2, XCircle, Sliders
} from 'lucide-react';
import { Scheme } from '../types';

interface EquationWorkflowProps {
  schemes: Scheme[];
  onSelectScheme?: (scheme: Scheme) => void;
}

export const EquationWorkflow: React.FC<EquationWorkflowProps> = ({ schemes, onSelectScheme }) => {
  const [targetSchemeId, setTargetSchemeId] = useState(schemes[0]?.id || 'scheme-gruha-lakshmi');
  const [testAge, setTestAge] = useState<number>(24);
  const [testIncome, setTestIncome] = useState<number>(180000);
  const [testState, setTestState] = useState<'Karnataka' | 'Other'>('Karnataka');
  const [testGender, setTestGender] = useState<'Female' | 'Male'>('Female');
  const [testOccupation, setTestOccupation] = useState<'Farmer' | 'Student' | 'Homemaker' | 'Vendor' | 'Unemployed'>('Homemaker');

  const selectedScheme = schemes.find(s => s.id === targetSchemeId) || schemes[0];

  // Mathematical Weights
  const W_DOMICILE = 25;
  const W_GENDER = 20;
  const W_AGE = 15;
  const W_INCOME = 25;
  const W_OCCUPATION = 15;

  // Sub-equation values
  const crit = selectedScheme.eligibilityCriteria;

  // Domicile score
  const isDomicileMatch = selectedScheme.classification === 'Central' ||
    (crit.applicableStates ? crit.applicableStates.includes(testState) : true);
  const domicileScore = isDomicileMatch ? W_DOMICILE : 0;

  // Gender score
  const isGenderMatch = !crit.gender || crit.gender === 'All' || crit.gender.toLowerCase() === testGender.toLowerCase();
  const genderScore = isGenderMatch ? W_GENDER : 0;

  // Age score
  const minA = crit.minAge ?? 0;
  const maxA = crit.maxAge ?? 100;
  const isAgeMatch = testAge >= minA && testAge <= maxA;
  const ageScore = isAgeMatch ? W_AGE : 0;

  // Income score
  const maxInc = crit.maxAnnualIncome ?? 10000000;
  const isIncomeMatch = testIncome <= maxInc;
  const incomeScore = isIncomeMatch ? W_INCOME : 0;

  // Occupation score
  const isOccMatch = !crit.allowedOccupations || crit.allowedOccupations.length === 0 ||
    crit.allowedOccupations.some(o => o.toLowerCase() === testOccupation.toLowerCase()) ||
    (selectedScheme.beneficiaryCategory === 'Women' && testGender === 'Female');
  const occScore = isOccMatch ? W_OCCUPATION : 0;

  // Total Score E
  const totalScore = domicileScore + genderScore + ageScore + incomeScore + occScore;
  const isFullyEligible = totalScore === 100;

  return (
    <div className="bytune-card p-6 sm:p-10 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8f8bff]/10 border border-[#8f8bff]/20 text-[#8f8bff] text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5 text-[#8f8bff]" />
            <span>Interactive Algorithmic Model</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#f5f5f8] tracking-[-0.02em]">
            Eligibility Logic Equation & Workflow Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#b6b6c2] mt-1 max-w-2xl font-normal">
            Computer-Based Project evaluation model: Live visualization of the deterministic multi-parameter scoring formula for public welfare schemes.
          </p>
        </div>

        {/* Scheme Selector */}
        <div className="shrink-0">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8a8a97] mb-1">
            Target Government Scheme
          </label>
          <select
            value={targetSchemeId}
            onChange={(e) => setTargetSchemeId(e.target.value)}
            className="py-2 px-4 rounded-full border border-white/10 text-xs font-medium text-[#f5f5f8] bg-[#101016] focus:border-[#8f8bff]/60 focus:outline-none"
          >
            {schemes.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#101016] text-[#f5f5f8]">{s.name} ({s.classification})</option>
            ))}
          </select>
        </div>
      </div>

      {/* The Equation Display Box */}
      <div className="bg-white/[0.02] text-[#f5f5f8] rounded-2xl p-6 sm:p-8 space-y-4 border border-white/[0.08] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#8f8bff] font-semibold tracking-wider uppercase flex items-center">
            <span className="w-2 h-2 rounded-full bg-[#8f8bff] mr-2 shadow-[0_0_8px_#8f8bff]"></span>
            Deterministic Mathematical Objective Function
          </span>
          <span className="text-xs font-mono font-medium px-3 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[#f5f5f8]">
            Score E ∈ [0, 100] %
          </span>
        </div>

        {/* KaTeX / Mathematical Formula representation */}
        <div className="overflow-x-auto py-2 font-mono text-xs sm:text-sm text-[#b6b6c2] leading-relaxed tracking-wide select-all bg-black/40 p-4 rounded-xl border border-white/[0.06]">
          <span className="text-[#f5f5f8] font-bold text-sm sm:text-base">E(u, S)</span> =
          <span className="text-[#6fd8ff]"> [w_d · I_domicile]</span> +
          <span className="text-[#8f8bff]"> [w_g · I_gender]</span> +
          <span className="text-[#f3c64f]"> [w_a · I_age]</span> +
          <span className="text-[#1ed760]"> [w_i · I_income]</span> +
          <span className="text-rose-400"> [w_o · I_occ]</span>
        </div>

        {/* Dynamic substituted values */}
        <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#8a8a97] font-medium">Computed Resolution:</span>
          <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[#f5f5f8] font-bold">
            {domicileScore} + {genderScore} + {ageScore} + {incomeScore} + {occScore} =
            <span className={`ml-1 text-sm font-black ${isFullyEligible ? 'text-[#1ed760]' : 'text-[#f3c64f]'}`}>
              {totalScore}%
            </span>
          </span>
          <span className={`text-[11px] font-sans font-medium px-3 py-1 rounded-full ${isFullyEligible ? 'bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30' : 'bg-[#f3c64f]/15 text-[#f3c64f] border border-[#f3c64f]/30'
            }`}>
            {isFullyEligible ? 'Full Entitlement Satisfied (100% Match)' : 'Conditional Criteria Unmet'}
          </span>
        </div>
      </div>

      {/* Interactive Parameter Control Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: Variables Slider */}
        <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/[0.08] space-y-5">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-[#f5f5f8] flex items-center">
            <Sliders className="w-3.5 h-3.5 mr-1.5 text-[#8f8bff]" />
            Applicant Input Vector (u)
          </h4>

          {/* Age slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-normal text-[#b6b6c2]">
              <span>Applicant Age:</span>
              <span className="font-mono text-[#f5f5f8] font-semibold">{testAge} Years</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={testAge}
              onChange={(e) => setTestAge(Number(e.target.value))}
              className="w-full accent-[#8f8bff] cursor-pointer"
            />
          </div>

          {/* Income slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-normal text-[#b6b6c2]">
              <span>Annual Income:</span>
              <span className="font-mono text-[#f5f5f8] font-semibold">₹{testIncome.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={800000}
              step={20000}
              value={testIncome}
              onChange={(e) => setTestIncome(Number(e.target.value))}
              className="w-full accent-[#8f8bff] cursor-pointer"
            />
          </div>

          {/* State */}
          <div className="space-y-1.5 text-xs">
            <label className="font-normal text-[#b6b6c2] block">State Domicile:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTestState('Karnataka')}
                className={`py-2 rounded-full font-medium text-xs border transition-all cursor-pointer ${testState === 'Karnataka' ? 'bg-[#8f8bff] text-[#050507] border-[#8f8bff] shadow-sm' : 'bg-white/[0.03] text-[#b6b6c2] border-white/10 hover:border-white/20'
                  }`}
              >
                Karnataka
              </button>
              <button
                onClick={() => setTestState('Other')}
                className={`py-2 rounded-full font-medium text-xs border transition-all cursor-pointer ${testState === 'Other' ? 'bg-[#8f8bff] text-[#050507] border-[#8f8bff] shadow-sm' : 'bg-white/[0.03] text-[#b6b6c2] border-white/10 hover:border-white/20'
                  }`}
              >
                Other State
              </button>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1.5 text-xs">
            <label className="font-normal text-[#b6b6c2] block">Gender Identity:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTestGender('Female')}
                className={`py-2 rounded-full font-medium text-xs border transition-all cursor-pointer ${testGender === 'Female' ? 'bg-[#8f8bff] text-[#050507] border-[#8f8bff] shadow-sm' : 'bg-white/[0.03] text-[#b6b6c2] border-white/10 hover:border-white/20'
                  }`}
              >
                Female
              </button>
              <button
                onClick={() => setTestGender('Male')}
                className={`py-2 rounded-full font-medium text-xs border transition-all cursor-pointer ${testGender === 'Male' ? 'bg-[#8f8bff] text-[#050507] border-[#8f8bff] shadow-sm' : 'bg-white/[0.03] text-[#b6b6c2] border-white/10 hover:border-white/20'
                  }`}
              >
                Male
              </button>
            </div>
          </div>

          {/* Occupation */}
          <div className="space-y-1.5 text-xs">
            <label className="font-normal text-[#b6b6c2] block">Occupation Category:</label>
            <select
              value={testOccupation}
              onChange={(e) => setTestOccupation(e.target.value as any)}
              className="w-full py-2 px-3 rounded-full border border-white/10 bg-[#101016] text-xs font-medium text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
            >
              <option value="Homemaker">Homemaker (Woman Head)</option>
              <option value="Farmer">Farmer / Agriculturalist</option>
              <option value="Student">Student (PUC / College)</option>
              <option value="Vendor">Street Vendor / Self-Employed</option>
              <option value="Unemployed">Unemployed Youth</option>
            </select>
          </div>
        </div>

        {/* Col 2 & 3: Computational Workflow Flowchart */}
        <div className="md:col-span-2 bg-white/[0.02] p-6 rounded-2xl border border-white/[0.08] space-y-4 flex flex-col justify-between">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-[#f5f5f8] flex items-center">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-[#f3c64f]" />
            Component Execution Gates & Resolution Breakdown
          </h4>

          {/* Five Component Gates */}
          <div className="space-y-2.5 text-xs">
            {/* Gate 1: Domicile */}
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${isDomicileMatch ? 'bg-[#1ed760]/10 border-[#1ed760]/20' : 'bg-rose-500/10 border-rose-500/20'
              }`}>
              <div className="flex items-center space-x-2.5">
                {isDomicileMatch ? <CheckCircle2 className="w-4 h-4 text-[#1ed760]" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <div>
                  <span className="font-medium text-[#f5f5f8]">1. State Domicile Gate (w_d = 25)</span>
                  <p className="text-[11px] text-[#8a8a97]">
                    Scheme: {selectedScheme.state} • Candidate: {testState}
                  </p>
                </div>
              </div>
              <span className={`font-mono font-semibold ${isDomicileMatch ? 'text-[#1ed760]' : 'text-rose-400'}`}>
                +{domicileScore} pts
              </span>
            </div>

            {/* Gate 2: Gender */}
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${isGenderMatch ? 'bg-[#1ed760]/10 border-[#1ed760]/20' : 'bg-rose-500/10 border-rose-500/20'
              }`}>
              <div className="flex items-center space-x-2.5">
                {isGenderMatch ? <CheckCircle2 className="w-4 h-4 text-[#1ed760]" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <div>
                  <span className="font-medium text-[#f5f5f8]">2. Gender Reservation Gate (w_g = 20)</span>
                  <p className="text-[11px] text-[#8a8a97]">
                    Required: {crit.gender || 'All'} • Candidate: {testGender}
                  </p>
                </div>
              </div>
              <span className={`font-mono font-semibold ${isGenderMatch ? 'text-[#1ed760]' : 'text-rose-400'}`}>
                +{genderScore} pts
              </span>
            </div>

            {/* Gate 3: Age */}
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${isAgeMatch ? 'bg-[#1ed760]/10 border-[#1ed760]/20' : 'bg-rose-500/10 border-rose-500/20'
              }`}>
              <div className="flex items-center space-x-2.5">
                {isAgeMatch ? <CheckCircle2 className="w-4 h-4 text-[#1ed760]" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <div>
                  <span className="font-medium text-[#f5f5f8]">3. Age Bracket Gate (w_a = 15)</span>
                  <p className="text-[11px] text-[#8a8a97]">
                    Window: [{minA} to {maxA} yrs] • Candidate: {testAge} yrs
                  </p>
                </div>
              </div>
              <span className={`font-mono font-semibold ${isAgeMatch ? 'text-[#1ed760]' : 'text-rose-400'}`}>
                +{ageScore} pts
              </span>
            </div>

            {/* Gate 4: Income */}
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${isIncomeMatch ? 'bg-[#1ed760]/10 border-[#1ed760]/20' : 'bg-rose-500/10 border-rose-500/20'
              }`}>
              <div className="flex items-center space-x-2.5">
                {isIncomeMatch ? <CheckCircle2 className="w-4 h-4 text-[#1ed760]" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <div>
                  <span className="font-medium text-[#f5f5f8]">4. Income Ceiling Gate (w_i = 25)</span>
                  <p className="text-[11px] text-[#8a8a97]">
                    Ceiling: {maxInc >= 10000000 ? 'No Limit' : `₹${maxInc.toLocaleString('en-IN')}`} • Candidate: ₹{testIncome.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <span className={`font-mono font-semibold ${isIncomeMatch ? 'text-[#1ed760]' : 'text-rose-400'}`}>
                +{incomeScore} pts
              </span>
            </div>

            {/* Gate 5: Occupation */}
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${isOccMatch ? 'bg-[#1ed760]/10 border-[#1ed760]/20' : 'bg-rose-500/10 border-rose-500/20'
              }`}>
              <div className="flex items-center space-x-2.5">
                {isOccMatch ? <CheckCircle2 className="w-4 h-4 text-[#1ed760]" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <div>
                  <span className="font-medium text-[#f5f5f8]">5. Target Livelihood Gate (w_o = 15)</span>
                  <p className="text-[11px] text-[#8a8a97]">
                    Designated: {selectedScheme.beneficiaryCategory} • Candidate: {testOccupation}
                  </p>
                </div>
              </div>
              <span className={`font-mono font-semibold ${isOccMatch ? 'text-[#1ed760]' : 'text-rose-400'}`}>
                +{occScore} pts
              </span>
            </div>
          </div>

          {/* Final Outcome Summary Box */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#8f8bff]" />
              <span className="text-[#8a8a97]">Deterministic Confidence:</span>
              <strong className="text-[#f5f5f8] font-mono">{totalScore}% Accuracy Score</strong>
            </div>

            {onSelectScheme && (
              <button
                onClick={() => onSelectScheme(selectedScheme)}
                className="text-xs font-medium text-[#8f8bff] hover:text-[#6fd8ff] flex items-center transition-colors cursor-pointer"
              >
                Inspect Official Criteria <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
