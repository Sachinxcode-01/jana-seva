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
  const crit = scheme.eligibilityCriteria || { rules: [] };
  const matchingReasons: string[] = [];
  const unmetConditions: string[] = [];
  let score = 100;

  const safeInput: EligibilityInput = {
    age: Number(input?.age) || 0,
    state: String(input?.state || 'Karnataka'),
    occupation: String(input?.occupation || 'General Citizen'),
    gender: input?.gender || 'Other',
    beneficiaryCategory: String(input?.beneficiaryCategory || 'General'),
    annualIncome: Number(input?.annualIncome) || 0,
    educationLevel: input?.educationLevel ? String(input.educationLevel) : undefined,
    hasBPLCard: Boolean(input?.hasBPLCard)
  };

  // 1. Check State Domicile
      const applicableStates = crit.applicableStates || [];
      if (
        applicableStates.length > 0 &&
        !applicableStates.includes('All India') &&
        (scheme.classification === 'State' || (scheme.state && scheme.state !== 'All India'))
      ) {
        const isResident = applicableStates.some(s => s.toLowerCase() === safeInput.state.toLowerCase());
        if (isResident) {
          matchingReasons.push(`Resides in ${safeInput.state}, fulfilling state domicile requirement for ${scheme.state || applicableStates.join('/')} state schemes.`);
        } else {
          unmetConditions.push(`Restricted to residents of ${applicableStates.join(', ')}. Selected state: ${safeInput.state}.`);
          score -= 50;
        }
      } else {
        matchingReasons.push(`Applicable to eligible residents across All India.`);
      }

      // 2. Gender requirement
      if (crit.gender && crit.gender !== 'All') {
          if (safeInput.gender.toLowerCase() === crit.gender.toLowerCase()) {
            matchingReasons.push(`Applicant matches designated gender criteria (${crit.gender}).`);
          } else {
            unmetConditions.push(`This scheme is exclusively reserved for ${crit.gender} applicants.`);
            score -= 60;
          }
        }

        // 3. Age constraints
          if (crit.minAge !== undefined && safeInput.age < crit.minAge) {
            unmetConditions.push(`Minimum age is ${crit.minAge} years (Applicant is ${safeInput.age} years).`);
            score -= 30;
          } else if (crit.minAge !== undefined) {
            matchingReasons.push(`Meets minimum age requirement of ${crit.minAge} years.`);
          }

            if (crit.maxAge !== undefined && safeInput.age > crit.maxAge) {
              unmetConditions.push(`Maximum age limit is ${crit.maxAge} years (Applicant is ${safeInput.age} years).`);
              score -= 30;
            } else if (crit.maxAge !== undefined) {
              matchingReasons.push(`Within the upper age ceiling of ${crit.maxAge} years.`);
            }

            // 4. Annual Income criteria
                if (crit.maxAnnualIncome !== undefined && crit.maxAnnualIncome > 0) {
                  if (safeInput.annualIncome <= crit.maxAnnualIncome) {
                    matchingReasons.push(`Annual family income (₹${safeInput.annualIncome.toLocaleString('en-IN')}) is within the permissible limit of ₹${crit.maxAnnualIncome.toLocaleString('en-IN')}.`);
                  } else {
                    unmetConditions.push(`Annual family income exceeds threshold of ₹${crit.maxAnnualIncome.toLocaleString('en-IN')}.`);
                    score -= 40;
                  }
                }

                // 5. Occupation & Beneficiary Category
                if (crit.allowedOccupations && crit.allowedOccupations.length > 0) {
                  const occMatch = crit.allowedOccupations.some(o =>
      o.toLowerCase() === safeInput.occupation.toLowerCase() ||
                    (safeInput.occupation.toLowerCase() === 'farmer' && o.toLowerCase() === 'agriculture') ||
                    (safeInput.occupation.toLowerCase() === 'student' && o.toLowerCase() === 'education')
                  );
                  if (occMatch) {
                    matchingReasons.push(`Occupation (${safeInput.occupation}) directly matches target beneficiaries.`);
                  } else {
                    // Check if beneficiary category matches (e.g. Student applying for student scheme)
                      if (scheme.beneficiaryCategory && scheme.beneficiaryCategory.toLowerCase() === safeInput.beneficiaryCategory.toLowerCase()) {
                        matchingReasons.push(`Beneficiary group (${safeInput.beneficiaryCategory}) matches scheme objective.`);
                      } else {
                        unmetConditions.push(`Targeted towards: ${crit.allowedOccupations.join(', ')}. Current occupation: ${safeInput.occupation}.`);
                        score -= 35;
                      }
                    }
                  }

                  // 6. Special rules (e.g. Gruha Lakshmi, Yuva Nidhi)
                      const schemeSlug = (scheme.slug || scheme.name || '').toLowerCase();
                      if (schemeSlug.includes('gruha-lakshmi')) {
                        if (safeInput.gender === 'Female' && safeInput.state.toLowerCase() === 'karnataka') {
                          matchingReasons.push('Identified as woman resident in Karnataka eligible for household head assistance.');
                        }
                      }

                          if (schemeSlug.includes('yuva-nidhi')) {
                            if (['Undergraduate', 'Diploma', 'Postgraduate'].includes(safeInput.educationLevel || '')) {
                              matchingReasons.push(`Education level (${safeInput.educationLevel}) qualifies for higher educational unemployment support.`);
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
