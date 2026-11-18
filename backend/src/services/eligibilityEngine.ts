import { Scheme, EligibilityResult } from '../types.js';

export interface EligibilityInput {
  age: number;
  state: string; // e.g. "Karnataka", "Maharashtra", "Other"
  occupation: string; // "Farmer", "Student", "Street Vendor", "Unemployed", "Self-Employed", "Homemaker", "Salaried"
  gender: 'Female' | 'Male' | 'Other';
  beneficiaryCategory: string; // "Women", "Students", "Farmers", "General"
  annualIncome: number; // in INR
  educationLevel?: string; // "School", "PUC", "Undergraduate", "Postgraduate", "Diploma", "None"
  hasBPLCard?: boolean;
}

export function evaluateEligibility(scheme: Scheme, input: EligibilityInput): EligibilityResult {
  const crit = scheme.eligibilityCriteria;
  const matchingReasons: string[] = [];
  const unmetConditions: string[] = [];
  let score = 100;

  // 1. Check State Domicile
  if (scheme.classification === 'State' && crit.applicableStates && crit.applicableStates.length > 0) {
    if (crit.applicableStates.some(s => s.toLowerCase() === input.state.toLowerCase())) {
      matchingReasons.push(`Resides in ${input.state}, fulfilling state domicile requirement for ${scheme.state} state schemes.`);
    } else {
      unmetConditions.push(`Restricted to residents of ${crit.applicableStates.join(', ')}. Selected state: ${input.state}.`);
      score -= 50;
    }
  } else {
    matchingReasons.push(`Applicable to residents across All India.`);
  }

  // 2. Gender requirement
  if (crit.gender && crit.gender !== 'All') {
    if (input.gender.toLowerCase() === crit.gender.toLowerCase()) {
      matchingReasons.push(`Applicant matches designated gender criteria (${crit.gender}).`);
    } else {
      unmetConditions.push(`This scheme is exclusively reserved for ${crit.gender} applicants.`);
      score -= 60;
    }
  }

  // 3. Age constraints
  if (crit.minAge !== undefined && input.age < crit.minAge) {
    unmetConditions.push(`Minimum age is ${crit.minAge} years (Applicant is ${input.age} years).`);
    score -= 30;
  } else if (crit.minAge !== undefined) {
    matchingReasons.push(`Meets minimum age requirement of ${crit.minAge} years.`);
  }

  if (crit.maxAge !== undefined && input.age > crit.maxAge) {
    unmetConditions.push(`Maximum age limit is ${crit.maxAge} years (Applicant is ${input.age} years).`);
    score -= 30;
  } else if (crit.maxAge !== undefined) {
    matchingReasons.push(`Within the upper age ceiling of ${crit.maxAge} years.`);
  }

  // 4. Annual Income criteria
  if (crit.maxAnnualIncome !== undefined) {
    if (input.annualIncome <= crit.maxAnnualIncome) {
      matchingReasons.push(`Annual family income (₹${input.annualIncome.toLocaleString('en-IN')}) is within the permissible limit of ₹${crit.maxAnnualIncome.toLocaleString('en-IN')}.`);
    } else {
      unmetConditions.push(`Annual family income exceeds threshold of ₹${crit.maxAnnualIncome.toLocaleString('en-IN')}.`);
      score -= 40;
    }
  }

  // 5. Occupation & Beneficiary Category
  if (crit.allowedOccupations && crit.allowedOccupations.length > 0) {
    const occMatch = crit.allowedOccupations.some(o => 
      o.toLowerCase() === input.occupation.toLowerCase() ||
      (input.occupation.toLowerCase() === 'farmer' && o.toLowerCase() === 'agriculture')
    );
    if (occMatch) {
      matchingReasons.push(`Occupation (${input.occupation}) directly matches target beneficiaries.`);
    } else {
      // Check if beneficiary category matches (e.g. Student applying for student scheme)
      if (scheme.beneficiaryCategory.toLowerCase() === input.beneficiaryCategory.toLowerCase()) {
        matchingReasons.push(`Beneficiary group (${input.beneficiaryCategory}) matches scheme objective.`);
      } else {
        unmetConditions.push(`Targeted towards: ${crit.allowedOccupations.join(', ')}. Current occupation: ${input.occupation}.`);
        score -= 35;
      }
    }
  }

  // 6. Special rules (e.g. Gruha Lakshmi, Yuva Nidhi)
  if (scheme.slug.includes('gruha-lakshmi')) {
    if (input.gender === 'Female' && input.state.toLowerCase() === 'karnataka') {
      matchingReasons.push('Identified as woman resident in Karnataka eligible for household head assistance.');
    }
  }

  if (scheme.slug.includes('yuva-nidhi')) {
    if (['Undergraduate', 'Diploma', 'Postgraduate'].includes(input.educationLevel || '')) {
      matchingReasons.push(`Education level (${input.educationLevel}) qualifies for higher educational unemployment support.`);
    } else {
      unmetConditions.push(`Requires completed Degree or Diploma from a recognized institution.`);
      score -= 20;
    }
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const isEligible = unmetConditions.length === 0;

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    category: scheme.category,
    isEligible,
    matchScore: finalScore,
    matchingReasons,
    unmetConditions,
    requiredDocuments: scheme.requiredDocuments,
    officialUrl: scheme.officialWebsite
  };
}
