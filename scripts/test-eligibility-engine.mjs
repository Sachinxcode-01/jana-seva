// Unit Test Suite for JANASEVA Deterministic Eligibility Engine
import { evaluateEligibility } from '../backend/dist/services/eligibilityEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`✗ [FAIL] ${testName}`);
    if (details) console.error(`   Details: ${details}`);
    failed++;
  }
}

console.log('====================================================');
console.log('  JANASEVA ELIGIBILITY ENGINE UNIT TEST SUITE       ');
console.log('====================================================\n');

// Mock Schemes
const mockGruhaLakshmi = {
  id: "scheme-gruha-lakshmi",
  slug: "gruha-lakshmi-yojana",
  name: "Gruha Lakshmi Yojana",
  classification: "State",
  state: "Karnataka",
  category: "Women Empowerment",
  beneficiaryCategory: "Women",
  eligibilityCriteria: {
    minAge: 18,
    gender: "Female",
    applicableStates: ["Karnataka"],
    rules: ["Designated female head of family"]
  },
  requiredDocuments: ["Aadhaar", "Ration Card"],
  officialWebsite: "https://sevasindhugs.karnataka.gov.in"
};

const mockSSP = {
  id: "scheme-karnataka-ssp",
  slug: "karnataka-state-scholarship-portal-ssp",
  name: "Karnataka SSP Post-Matric Scholarship",
  classification: "State",
  state: "Karnataka",
  category: "Student Scholarships",
  beneficiaryCategory: "Students",
  eligibilityCriteria: {
    minAge: 15,
    maxAge: 35,
    maxAnnualIncome: 250000,
    applicableStates: ["Karnataka"],
    allowedOccupations: ["Student"],
    rules: ["Enrolled in recognized collegiate institution"]
  },
  requiredDocuments: ["Aadhaar", "College ID", "Income Certificate"],
  officialWebsite: "https://ssp.postmatric.karnataka.gov.in"
};

const mockPMKisan = {
  id: "scheme-pm-kisan",
  slug: "pm-kisan-samman-nidhi",
  name: "PM-KISAN",
  classification: "Central",
  state: "All India",
  category: "Farmer Welfare",
  beneficiaryCategory: "Farmers",
  eligibilityCriteria: {
    minAge: 18,
    allowedOccupations: ["Farmer", "Agriculture"],
    rules: ["Own cultivable land"]
  },
  requiredDocuments: ["Aadhaar", "RTC / Land Record"],
  officialWebsite: "https://pmkisan.gov.in"
};

const mockYuvaNidhi = {
  id: "scheme-yuva-nidhi",
  slug: "yuva-nidhi-scheme",
  name: "Yuva Nidhi Scheme",
  classification: "State",
  state: "Karnataka",
  category: "Employment Opportunities",
  beneficiaryCategory: "Youth",
  eligibilityCriteria: {
    minAge: 21,
    maxAge: 30,
    applicableStates: ["Karnataka"],
    allowedOccupations: ["Unemployed"],
    rules: ["Degree or Diploma graduate unemployed for 6 months"]
  },
  requiredDocuments: ["Aadhaar", "Degree Certificate"],
  officialWebsite: "https://sevasindhugs.karnataka.gov.in"
};

// 1. Gruha Lakshmi: Perfect Match (18+, Female, Karnataka)
const res1 = evaluateEligibility(mockGruhaLakshmi, {
  age: 28,
  gender: 'Female',
  state: 'Karnataka',
  occupation: 'Homemaker',
  beneficiaryCategory: 'Women',
  annualIncome: 120000
});
assert(res1.isEligible === true && res1.matchScore === 100, 'Test 1: Gruha Lakshmi qualifies eligible woman in Karnataka');

// 2. Gruha Lakshmi: Domicile Violation (Female, 28, Maharashtra)
const res2 = evaluateEligibility(mockGruhaLakshmi, {
  age: 28,
  gender: 'Female',
  state: 'Maharashtra',
  occupation: 'Homemaker',
  beneficiaryCategory: 'Women',
  annualIncome: 120000
});
assert(res2.isEligible === false, 'Test 2: Gruha Lakshmi denies non-Karnataka resident');
assert(res2.unmetConditions.some(c => c.includes('Restricted to residents of Karnataka')), 'Test 2b: Gruha Lakshmi explains state domicile unmet condition');

// 3. Gruha Lakshmi: Gender Violation (Male, 28, Karnataka)
const res3 = evaluateEligibility(mockGruhaLakshmi, {
  age: 28,
  gender: 'Male',
  state: 'Karnataka',
  occupation: 'Farmer',
  beneficiaryCategory: 'General',
  annualIncome: 120000
});
assert(res3.isEligible === false, 'Test 3: Gruha Lakshmi denies male applicant');
assert(res3.unmetConditions.some(c => c.includes('Female')), 'Test 3b: Gruha Lakshmi explains gender restriction');

// 4. SSP Scholarship: Income Ceiling Threshold (Income <= 2,50,000)
const res4a = evaluateEligibility(mockSSP, {
  age: 20,
  gender: 'Male',
  state: 'Karnataka',
  occupation: 'Student',
  beneficiaryCategory: 'Students',
  annualIncome: 200000,
  educationLevel: 'Undergraduate'
});
assert(res4a.isEligible === true, 'Test 4a: SSP qualifies student within income ceiling');

// 5. SSP Scholarship: Income Ceiling Exceeded (Income = 5,00,000)
const res4b = evaluateEligibility(mockSSP, {
  age: 20,
  gender: 'Male',
  state: 'Karnataka',
  occupation: 'Student',
  beneficiaryCategory: 'Students',
  annualIncome: 500000,
  educationLevel: 'Undergraduate'
});
assert(res4b.isEligible === false, 'Test 4b: SSP denies applicant exceeding income ceiling');
assert(res4b.unmetConditions.some(c => c.includes('Annual family income exceeds threshold')), 'Test 4c: SSP explains income ceiling condition');

// 6. SSP Scholarship: Age boundary condition (Age 14 is below minAge 15)
const res5a = evaluateEligibility(mockSSP, {
  age: 14,
  gender: 'Female',
  state: 'Karnataka',
  occupation: 'Student',
  beneficiaryCategory: 'Students',
  annualIncome: 100000
});
assert(res5a.isEligible === false && res5a.unmetConditions.some(c => c.includes('Minimum age is 15')), 'Test 5a: SSP enforces lower age boundary');

// 7. SSP Scholarship: Age boundary condition (Age 36 is above maxAge 35)
const res5b = evaluateEligibility(mockSSP, {
  age: 36,
  gender: 'Female',
  state: 'Karnataka',
  occupation: 'Student',
  beneficiaryCategory: 'Students',
  annualIncome: 100000
});
assert(res5b.isEligible === false && res5b.unmetConditions.some(c => c.includes('Maximum age limit is 35')), 'Test 5b: SSP enforces upper age boundary');

// 8. PM-KISAN: Central Scheme applicable across All India
const res6a = evaluateEligibility(mockPMKisan, {
  age: 40,
  gender: 'Male',
  state: 'Uttar Pradesh',
  occupation: 'Farmer',
  beneficiaryCategory: 'Farmers',
  annualIncome: 150000
});
assert(res6a.isEligible === true && res6a.matchScore === 100, 'Test 6a: PM-KISAN qualifies farmer from any Indian state');

// 9. PM-KISAN: Occupation check (Non-farmer)
const res6b = evaluateEligibility(mockPMKisan, {
  age: 40,
  gender: 'Male',
  state: 'Karnataka',
  occupation: 'Salaried Software Engineer',
  beneficiaryCategory: 'General',
  annualIncome: 800000
});
assert(res6b.isEligible === false, 'Test 6b: PM-KISAN denies non-agricultural occupation');

// 10. Yuva Nidhi: Graduate / Diploma qualification
const res7a = evaluateEligibility(mockYuvaNidhi, {
  age: 23,
  gender: 'Male',
  state: 'Karnataka',
  occupation: 'Unemployed',
  beneficiaryCategory: 'Youth',
  annualIncome: 80000,
  educationLevel: 'Undergraduate'
});
assert(res7a.isEligible === true, 'Test 7a: Yuva Nidhi qualifies degree graduate');

const res7b = evaluateEligibility(mockYuvaNidhi, {
  age: 23,
  gender: 'Male',
  state: 'Karnataka',
  occupation: 'Unemployed',
  beneficiaryCategory: 'Youth',
  annualIncome: 80000,
  educationLevel: 'School'
});
assert(res7b.isEligible === false && res7b.unmetConditions.some(c => c.includes('Degree or Diploma')), 'Test 7b: Yuva Nidhi denies non-graduate');

// 11. Boundary and Null Safety
const res8 = evaluateEligibility(mockPMKisan, null);
assert(typeof res8.matchScore === 'number' && res8.matchScore >= 0 && res8.matchScore <= 100, 'Test 8: Handles null/undefined input safely');

console.log('\n====================================================');
console.log(`TOTAL UNIT TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('====================================================\n');

process.exit(failed > 0 ? 1 : 0);
