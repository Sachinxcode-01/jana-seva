import fs from 'fs';
import path from 'path';

const existingDb = JSON.parse(fs.readFileSync('janaseva_db.json', 'utf8'));

// Update existing 10 schemes with precise deadlines
const updatedExistingSchemes = existingDb.schemes.map(s => {
  if (s.id === 'scheme-gruha-lakshmi') {
    return { ...s, deadline: 'Active - Open Year-Round / Monthly DBT on 20th' };
  }
  if (s.id === 'scheme-shakti-karnataka') {
    return { ...s, deadline: 'Permanent Active Scheme / No Deadline' };
  }
  if (s.id === 'scheme-karnataka-ssp') {
    return { ...s, deadline: 'Annual Academic Cycle: 31st December 2026' };
  }
  if (s.id === 'scheme-national-scholarship-portal') {
    return { ...s, deadline: 'Pre-Matric: 30 Nov 2026 | Post-Matric: 31 Dec 2026' };
  }
  if (s.id === 'scheme-pm-kisan') {
    return { ...s, deadline: 'Open Year-Round (Tranches: April, August, December)' };
  }
  if (s.id === 'scheme-pm-fasal-bima') {
    return { ...s, deadline: 'Kharif Cutoff: 31 July 2026 | Rabi Cutoff: 31 Dec 2026' };
  }
  if (s.id === 'scheme-ayushman-bharat') {
    return { ...s, deadline: 'Open Year-Round / Lifelong Coverage with ABHA e-KYC' };
  }
  if (s.id === 'scheme-pm-svanidhi') {
    return { ...s, deadline: 'Active through 31st December 2026 / Rolling Credit' };
  }
  if (s.id === 'scheme-yuva-nidhi') {
    return { ...s, deadline: 'Continuous Registration for 2023-2026 Batches' };
  }
  if (s.id === 'scheme-mudra-yojana') {
    return { ...s, deadline: 'Open Year-Round via all Member Lending Institutions' };
  }
  return s;
});

const newSchemes = [
  // --- MAHARASHTRA ---
  {
    id: "scheme-majhi-ladki-bahin-mh",
    slug: "mukhyamantri-majhi-ladki-bahin-yojana",
    name: "Mukhyamantri Majhi Ladki Bahin Yojana",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಮಾಝಿ ಲಾಡ್ಕಿ ಬಹಿನ್ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री माझी लाड़की बहिन योजना",
    department: "Department of Women and Child Development, Government of Maharashtra",
    classification: "State",
    state: "Maharashtra",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Flagship direct benefit transfer scheme in Maharashtra providing ₹1,500 monthly financial aid directly into the bank accounts of women aged 21-65 years to ensure economic independence and health nutrition.",
    description_kn: "ಮಹಾರಾಷ್ಟ್ರದ 21-65 ವರ್ಷ ವಯಸ್ಸಿನ ಮಹಿಳೆಯರಿಗೆ ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶ ಬೆಂಬಲಕ್ಕಾಗಿ ಪ್ರತಿ ತಿಂಗಳು ₹1,500 ನೇರ ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ ಒದಗಿಸುವ ಪ್ರಮುಖ ಯೋಜನೆ.",
    description_hi: "महाराष्ट्र में 21 से 65 वर्ष की महिलाओं को आर्थिक स्वावलंबन और पोषण सुरक्षा के लिए प्रति माह ₹1,500 की सीधी बैंक सहायता देने वाली प्रमुख योजना।",
    benefits: [
      "₹1,500 deposited monthly directly via Aadhaar-enabled DBT into beneficiary bank account",
      "Annual total financial assistance of ₹18,000 per eligible woman",
      "Free online and offline application facility via Nari Shakti Doot App and Setu Suvidha Kendras"
    ],
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 65,
      maxAnnualIncome: 250000,
      gender: "Female",
      applicableStates: ["Maharashtra"],
      allowedOccupations: ["Homemaker", "Self-employed", "Agricultural Laborer", "Daily Wage Earner", "Any"],
      rules: [
        "Beneficiary woman must be a permanent resident of Maharashtra State",
        "Combined family annual income from all sources must not exceed ₹2.5 Lakhs",
        "Beneficiary must hold an individual bank account seeded with Aadhaar",
        "No family member should be an income tax payer or regular government employee"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card of the woman applicant",
      "Maharashtra Domicile Certificate or Ration Card (prior to 15 years)",
      "Income Certificate issued by competent authority (or Yellow/Orange Ration Card)",
      "Bank Passbook photocopy showing IFSC and Aadhaar seeding status",
      "Hamipatra (Self-declaration pledge)"
    ],
    applicationProcedure: {
      steps: [
        "Download and install the official Nari Shakti Doot Mobile App or visit the web portal",
        "Register using your Aadhaar-linked mobile number and verify via OTP",
        "Fill out applicant personal details, bank account info, and family details",
        "Upload scanned photograph, Aadhaar card, and self-declaration Hamipatra",
        "Submit the application and obtain your digital application reference tracking number"
      ],
      onlineUrl: "https://ladakibahin.maharashtra.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://ladakibahin.maharashtra.gov.in",
    deadline: "Continuous Rolling Enrollment / Monthly DBT on 15th",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 3820,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-mjpjay-maharashtra",
    slug: "mahatma-jyotiba-phule-jan-arogya-yojana",
    name: "Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY)",
    name_kn: "ಮಹಾತ್ಮ ಜ್ಯೋತಿಬಾ ಫುಲೆ ಜನ್ ಆರೋಗ್ಯ ಯೋಜನೆ",
    name_hi: "महात्मा ज्योतिबा फुले जन आरोग्य योजना",
    department: "Public Health Department, Government of Maharashtra",
    classification: "State",
    state: "Maharashtra",
    category: "Health and Social Welfare",
    beneficiaryCategory: "General",
    description: "Universal cashless health insurance scheme in Maharashtra providing coverage of up to ₹5,00,000 per family per year across 996 recognized medical procedures in empanelled hospitals.",
    description_kn: "ಮಹಾರಾಷ್ಟ್ರದ ಎಲ್ಲಾ ನಾಗರಿಕರಿಗೆ ನೆಟ್‌ವರ್ಕ್ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ 996 ಕ್ಕೂ ಹೆಚ್ಚು ಚಿಕಿತ್ಸೆಗಳಿಗೆ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ನಗದು ರಹಿತ ಆರೋಗ್ಯ ವಿಮೆ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "महाराष्ट्र के नागरिकों को सूचीबद्ध अस्पतालों में 996 गंभीर बीमारियों और सर्जरी के लिए प्रति वर्ष ₹5 लाख तक का कैशलेस स्वास्थ्य बीमा।",
    benefits: [
      "100% cashless hospitalization up to ₹5,00,000 per family per policy year",
      "Covers 996 secondary and tertiary medical treatments, surgical operations, and post-discharge consultations",
      "Network of over 1,000 government and private empanelled multi-specialty hospitals across Maharashtra"
    ],
    eligibilityCriteria: {
      applicableStates: ["Maharashtra"],
      rules: [
        "Beneficiary family must possess valid Ration Card (Yellow, Orange, or White) issued in Maharashtra",
        "Universal health entitlement coverage applies to all resident families of Maharashtra",
        "Pre-existing medical conditions covered from Day 1 of enrollment"
      ]
    },
    requiredDocuments: [
      "Ration Card (Yellow / Orange / White Card)",
      "Aadhaar Card or Voter Identity Card of hospitalized member",
      "Referral slip from government dispensary or Aarogyamitra verification"
    ],
    applicationProcedure: {
      steps: [
        "Visit any empanelled government or private network hospital in Maharashtra",
        "Approach the dedicated Aarogyamitra Helpdesk in the hospital premises",
        "Present your Ration Card and Aadhaar for digital e-authorization and diagnosis capture",
        "Hospital submits electronic pre-authorization request to the State Health Assurance Society",
        "Avail completely cashless medical care, surgery, bed charges, and prescribed medicines"
      ],
      onlineUrl: "https://www.jeevandayee.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://www.jeevandayee.gov.in",
    deadline: "Open Year-Round / Universal Lifelong Enrollment",
    lastUpdated: "2026-02-28",
    isVerified: true,
    isPublished: true,
    viewCount: 2940,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-gopinath-munde-shetkari-mh",
    slug: "gopinath-munde-shetkari-apghat-bima-yojana",
    name: "Gopinath Munde Shetkari Apghat Bima Yojana",
    name_kn: "ಗೋಪಿನಾಥ್ ಮುಂಡೆ ರೈತ ಅಪಘಾತ ವಿಮಾ ಯೋಜನೆ",
    name_hi: "गोपीनाथ मुंडे शेतकरी अपघात सुरक्षा सानुग्रह अनुदान योजना",
    department: "Department of Agriculture, Government of Maharashtra",
    classification: "State",
    state: "Maharashtra",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "Accident relief and social security scheme providing ₹2,00,000 financial ex-gratia compensation to the legal heirs of farmers in Maharashtra in the event of accidental death or permanent disablement.",
    description_kn: "ಅಪಘಾತದಲ್ಲಿ ಮರಣ ಅಥವಾ ಶಾಶ್ವತ ಅಂಗವೈಕಲ್ಯಕ್ಕೊಳಗಾದ ಮಹಾರಾಷ್ಟ್ರದ ರೈತರ ಕುಟುಂಬಕ್ಕೆ ₹2,00,000 ವರೆಗೆ ಆರ್ಥಿಕ ಪರಿಹಾರ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "दुर्घटना में मृत्यु या स्थायी दिव्यांगता के शिकार महाराष्ट्र के किसानों के आश्रित परिवारों को ₹2,00,000 की वित्तीय सहायता।",
    benefits: [
      "₹2,00,000 compensation for accidental death or loss of two limbs/eyes",
      "₹1,00,000 financial grant for permanent loss of one limb or one eye",
      "100% state-funded insurance premium with zero cost burden on the farming family"
    ],
    eligibilityCriteria: {
      minAge: 10,
      maxAge: 75,
      gender: "All",
      applicableStates: ["Maharashtra"],
      allowedOccupations: ["Farmer", "Agricultural Laborer"],
      rules: [
        "Must be a registered landholding farmer (listed on 7/12 extract) or a registered family member in Maharashtra",
        "Event must be an accidental casualty (road accidents, snake bites, electric shock, farm machinery mishaps)"
      ]
    },
    requiredDocuments: [
      "7/12 Land Records Extract and 8-A Certificate",
      "First Information Report (FIR) / Police Spot Panchnama",
      "Post-Mortem Report or Govt Medical Disability Certificate",
      "Death Certificate of the deceased farmer",
      "Legal Heir Certificate and Aadhaar of claimant"
    ],
    applicationProcedure: {
      steps: [
        "In the event of an accident, register FIR at nearest Police Station",
        "Collect Post-Mortem Report and landholding revenue documents",
        "Submit physical/online claim dossier to Taluka Agriculture Officer (TAO) within 30 days",
        "District Level Committee reviews and approves the claim",
        "Compensation disbursed directly into the verified bank account of the legal heir"
      ],
      onlineUrl: "https://krishi.maharashtra.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://krishi.maharashtra.gov.in",
    deadline: "Submit claim within 30 days of accidental event / Active 2026",
    lastUpdated: "2026-02-10",
    isVerified: true,
    isPublished: true,
    viewCount: 1680,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-mahadbt-scholarship-mh",
    slug: "mahadbt-post-matric-scholarship",
    name: "MahaDBT Post-Matric Scholarship Scheme",
    name_kn: "ಮಹಾಡಿಬಿಟಿ ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ",
    name_hi: "महाडीबीटी पोस्ट-मैट्रिक छात्रवृत्ति योजना",
    department: "Social Justice and Special Assistance Department, Maharashtra",
    classification: "State",
    state: "Maharashtra",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "State-wide digital scholarship framework reimbursing 100% tuition fees, exam fees, and offering monthly maintenance allowance to SC, ST, OBC, VJNT, and EBC students in Maharashtra.",
    description_kn: "ಮಹಾರಾಷ್ಟ್ರದ ಉನ್ನತ ಶಿಕ್ಷಣ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಶೇಕಡಾ 100 ರಷ್ಟು ಬೋಧನಾ ಶುಲ್ಕ ಮರುಪಾವತಿ ಮತ್ತು ಮಾಸಿಕ ಭತ್ಯೆ ಒದಗಿಸುವ ಪ್ರಮುಖ ವಿದ್ಯಾರ್ಥಿವೇತನ.",
    description_hi: "महाराष्ट्र में उच्च शिक्षा प्राप्त कर रहे आरक्षित एवं आर्थिक रूप से पिछड़े वर्ग के विद्यार्थियों को पूर्ण शिक्षण शुल्क प्रतिपूर्ति एवं निर्वाह भत्ता।",
    benefits: [
      "100% tuition and examination fee waiver directly reimbursed to college accounts",
      "Monthly maintenance stipend ranging from ₹500 to ₹1,200 deposited into student's Aadhaar bank account",
      "Covers arts, science, commerce, engineering, medical, and polytechnic degree streams"
    ],
    eligibilityCriteria: {
      minAge: 16,
      maxAge: 32,
      maxAnnualIncome: 250000,
      applicableStates: ["Maharashtra"],
      allowedOccupations: ["Student"],
      educationRequirements: "Class 10th Passed / Enrolled in Recognized Post-Matric Course",
      rules: [
        "Student must be a domicile resident of Maharashtra State",
        "Must be admitted to a recognized university, college, or AICTE/UGC approved institute",
        "Annual parental income ceiling: ₹2,50,000 for SC/ST and ₹1,50,000 for OBC/VJNT"
      ]
    },
    requiredDocuments: [
      "Caste Certificate and Caste Validity Certificate (issued by Govt of Maharashtra)",
      "Income Certificate from Tahsildar / Sub-Divisional Magistrate",
      "Domicile Certificate of Maharashtra",
      "Marksheet of previous qualifying examination (SSC/HSC/Degree)",
      "College Admission Fee Receipt and Bonafide Certificate",
      "Aadhaar Card linked to active bank account"
    ],
    applicationProcedure: {
      steps: [
        "Register on the official MahaDBT Aaple Sarkar portal using Aadhaar number",
        "Complete user profile with personal, address, caste, income, and educational history",
        "Select suitable scheme under Social Justice or Tribal Welfare department",
        "Upload scanned certificates and submit application to college for digital scrutiny",
        "Track institutional verification, district social welfare signoff, and direct DBT release"
      ],
      onlineUrl: "https://mahadbt.maharashtra.gov.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://mahadbt.maharashtra.gov.in",
    deadline: "Academic Year 2026-27 Window Closes: 31st January 2027",
    lastUpdated: "2026-02-20",
    isVerified: true,
    isPublished: true,
    viewCount: 4120,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- TAMIL NADU ---
  {
    id: "scheme-magalir-urimai-tn",
    slug: "kalaignar-magalir-urimai-thogai",
    name: "Kalaignar Magalir Urimai Thogai Scheme",
    name_kn: "ಕಲೈಂಜರ್ ಮಗಳಿರ್ ಉರಿಮೈ ತೊಗೈ ಯೋಜನೆ",
    name_hi: "कलैग्नार मगलिर उरीमई थोगई योजना",
    department: "Special Programme Implementation Department, Government of Tamil Nadu",
    classification: "State",
    state: "Tamil Nadu",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Flagship universal basic income initiative in Tamil Nadu providing ₹1,000 every month directly to the bank accounts of over 1.15 crore eligible women heads of households.",
    description_kn: "ತಮಿಳುನಾಡಿನ ಅರ್ಹ ಮಹಿಳಾ ಕುಟುಂಬ ಮುಖ್ಯಸ್ಥರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,000 ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಒದಗಿಸುವ ಪ್ರಮುಖ ಮೂಲ ಆದಾಯ ಯೋಜನೆ.",
    description_hi: "तमिलनाडु में पात्र महिला परिवार मुखियाओं को प्रति माह ₹1,000 की सीधी वित्तीय सहायता देने वाली ऐतिहासिक बुनियादी आय योजना।",
    benefits: [
      "₹1,000 credited automatically on the 15th of every month via DBT into the woman's bank account",
      "Recognizes unpaid domestic labor and provides financial autonomy to rural and urban women",
      "SMS alerts dispatched instantly on every monthly transfer"
    ],
    eligibilityCriteria: {
      minAge: 21,
      gender: "Female",
      maxAnnualIncome: 250000,
      applicableStates: ["Tamil Nadu"],
      allowedOccupations: ["Homemaker", "Agricultural Laborer", "Self-employed", "Domestic Worker", "Any"],
      rules: [
        "Applicant must be the female head of the family as per Tamil Nadu Smart Family Card",
        "Annual family income must be under ₹2,50,000 and domestic electricity consumption under 3,600 units/year",
        "Family should not own a four-wheeler (excluding commercial tractors/taxis) or wetland exceeding 5 acres"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card of the applicant woman",
      "Tamil Nadu Smart Family Ration Card",
      "Electricity Consumer Number / Recent EB bill",
      "Aadhaar-seeded Bank Account Passbook"
    ],
    applicationProcedure: {
      steps: [
        "Receive application token and form at your doorstep via Fair Price Shop staff",
        "Attend designated biometric registration camp in your ward/village",
        "Present Smart Family Card, Aadhaar, and electricity consumer number",
        "Complete biometric e-KYC authentication with camp volunteer",
        "Receive SMS confirmation with application acknowledgement number"
      ],
      onlineUrl: "https://kmut.tn.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://kmut.tn.gov.in",
    deadline: "Continuous Open Enrollment / Monthly DBT on 15th",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4650,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-puthumai-penn-tn",
    slug: "puthumai-penn-scheme-tamil-nadu",
    name: "Puthumai Penn Scheme (Moovalur Ramamirtham Ammaiyar Scheme)",
    name_kn: "ಪುದುಮೈ ಪೆಣ್ ಯೋಜನೆ",
    name_hi: "पुधुमाई पेन योजना",
    department: "Social Welfare and Women Empowerment Department, Government of Tamil Nadu",
    classification: "State",
    state: "Tamil Nadu",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Higher education incentive program providing ₹1,000 per month financial grant to girl students who studied Classes 6 to 12 in Tamil Nadu government schools until completion of their degree or diploma.",
    description_kn: "ತಮಿಳುನಾಡಿನ ಸರ್ಕಾರಿ ಶಾಲೆಗಳಲ್ಲಿ ಓದಿದ ಹೆಣ್ಣು ಮಕ್ಕಳಿಗೆ ಉನ್ನತ ಶಿಕ್ಷಣ ಪದವಿ ಮುಗಿಯುವವರೆಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,000 ಪ್ರೋತ್ಸಾಹ ಧನ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "तमिलनाडु के सरकारी स्कूलों से कक्षा 6 से 12 तक पढ़ने वाली छात्राओं को स्नातक या डिप्लोमा पूरा करने तक प्रति माह ₹1,000 की वित्तीय सहायता।",
    benefits: [
      "₹1,000 deposited monthly directly into student's personal bank account throughout degree duration",
      "Dramatically curbs female college dropouts and promotes STEM, arts, and medical enrollments",
      "Covers arts, science, engineering, polytechnic, and vocational diplomas"
    ],
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 25,
      gender: "Female",
      applicableStates: ["Tamil Nadu"],
      allowedOccupations: ["Student"],
      educationRequirements: "Classes 6-12 completed in TN Government School",
      rules: [
        "Must have studied continuously from Class 6 to 12 in Tamil Nadu Government or recognized Municipal schools",
        "Must be currently enrolled in an undergraduate degree, professional course, or diploma program in Tamil Nadu"
      ]
    },
    requiredDocuments: [
      "Class 10 and Class 12 Transfer Certificates (proving government school study)",
      "EMIS (Education Management Information System) ID number",
      "College Identity Card and Bonafide Certificate",
      "Aadhaar Card and Bank Account details linked to Aadhaar"
    ],
    applicationProcedure: {
      steps: [
        "College nodal officers coordinate special on-campus enrollment drives via the Pen Kalvi portal",
        "Student enters EMIS registration number to automatically pull verified schooling history",
        "Upload college bonafide certificate and Aadhaar-linked bank details",
        "Principal and Social Welfare Officer digitally verify student credentials",
        "Monthly grant disbursed directly into student's bank account via DBT"
      ],
      onlineUrl: "https://penkalvi.tn.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://penkalvi.tn.gov.in",
    deadline: "Academic Year Window: 1st July to 30th November 2026",
    lastUpdated: "2026-02-15",
    isVerified: true,
    isPublished: true,
    viewCount: 3280,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-cmchis-tamilnadu",
    slug: "chief-ministers-comprehensive-health-insurance-tn",
    name: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿಗಳ ಸಮಗ್ರ ಆರೋಗ್ಯ ವಿಮಾ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री व्यापक स्वास्थ्य बीमा योजना (CMCHIS)",
    department: "Health and Family Welfare Department, Government of Tamil Nadu",
    classification: "State",
    state: "Tamil Nadu",
    category: "Health and Social Welfare",
    beneficiaryCategory: "General",
    description: "Universal cashless health insurance scheme in Tamil Nadu providing financial cover of up to ₹5,00,000 per family per year across 1,090 surgical and medical procedures in empanelled hospitals.",
    description_kn: "ತಮಿಳುನಾಡಿನ ಜನತೆಗೆ 1,090 ಕ್ಕೂ ಹೆಚ್ಚು ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಗಳಿಗೆ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸೆ ಒದಗಿಸುವ ಸಮಗ್ರ ಆರೋಗ್ಯ ಯೋಜನೆ.",
    description_hi: "तमिलनाडु में 1,090 विशिष्ट चिकित्सा और शल್ಯ प्रक्रियाओं के लिए प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस स्वास्थ्य सुरक्षा कवच।",
    benefits: [
      "Up to ₹5,00,000 cashless hospitalisation coverage per family per year",
      "Covers 1,090 procedures, 52 diagnostic tests, and 8 specialized high-end procedures like liver/renal transplants",
      "Seamless round-the-clock claim approvals handled by United India Insurance Company"
    ],
    eligibilityCriteria: {
      maxAnnualIncome: 120000,
      applicableStates: ["Tamil Nadu"],
      rules: [
        "Beneficiary family must reside in Tamil Nadu with name listed on valid Smart Family Card",
        "Annual family income should not exceed ₹1,20,000 (No income restriction for Sri Lankan refugee camps or orphans)"
      ]
    },
    requiredDocuments: [
      "Tamil Nadu Smart Family Card (Ration Card)",
      "Income Certificate issued by Revenue Authority (VAO / Tahsildar)",
      "Aadhaar Card of all family members to be enrolled"
    ],
    applicationProcedure: {
      steps: [
        "Visit the District Collectorate CMCHIS Kiosk or nearest e-Sevai Kendra",
        "Submit Smart Family Card, Income Certificate, and Aadhaar cards",
        "Provide biometric fingerprint scan and web-camera photo capture",
        "Receive instant laminated CMCHIS Smart Card with unique policy number",
        "Present card at any empanelled hospital for immediate cashless admission"
      ],
      onlineUrl: "https://www.cmchistn.com",
      offlineModeAvailable: true
    },
    officialWebsite: "https://www.cmchistn.com",
    deadline: "Open Year-Round / Universal Rolling Enrollment",
    lastUpdated: "2026-02-18",
    isVerified: true,
    isPublished: true,
    viewCount: 2890,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-naan-mudhalvan-tn",
    slug: "naan-mudhalvan-skill-development-tn",
    name: "Naan Mudhalvan Skill & Employment Scheme",
    name_kn: "ನಾನ್ ಮುದಲ್ವನ್ ಉದ್ಯೋಗ ಕೌಶಲ್ಯ ಯೋಜನೆ",
    name_hi: "नान मुधलवन कौशल एवं रोजगार योजना",
    department: "Tamil Nadu Skill Development Corporation (TNSDC)",
    classification: "State",
    state: "Tamil Nadu",
    category: "Employment Opportunities",
    beneficiaryCategory: "Students",
    description: "Ambitious skill development and placement initiative offering free industry-recognized courses in AI, Cloud, Cybersecurity, Data Analytics, and Robotics to 10 lakh college students and graduates across Tamil Nadu.",
    description_kn: "ತಮಿಳುನಾಡಿನ 10 ಲಕ್ಷ ಕಾಲೇಜು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ, ಕ್ಲೌಡ್ ಕಂಪ್ಯೂಟಿಂಗ್ ಮತ್ತು ಉದ್ಯೋಗ ಕೌಶಲ್ಯಗಳಲ್ಲಿ ಉಚಿತ ತರಬೇತಿ ಮತ್ತು ನೇಮಕಾತಿ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "तमिलनाडु के 10 लाख कॉलेज छात्रों को एआई, क्लाउड, रोबोटिक्स और डेटा एनालिटिक्स में मुफ्त उच्च स्तरीय कौशल प्रशिक्षण और रोजगार अवसर।",
    benefits: [
      "Zero-cost industry certifications curriculum curated with Microsoft, Google, AWS, and IBM",
      "Direct campus placement drives and paid apprenticeship linkages with top IT & manufacturing MNCs",
      "Special competitive exam coaching wings for UPSC, TNPSC, Banking, and Defense"
    ],
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 28,
      applicableStates: ["Tamil Nadu"],
      allowedOccupations: ["Student", "Unemployed"],
      educationRequirements: "Enrolled in Higher Secondary / Diploma / Engineering / Arts & Science",
      rules: [
        "Applicant must be a bonafide student or graduate residing in Tamil Nadu",
        "Must register with valid student roll number or institutional credentials"
      ]
    },
    requiredDocuments: [
      "College Student ID card or Graduation Certificate",
      "Aadhaar Card",
      "Resume and Educational Marksheets"
    ],
    applicationProcedure: {
      steps: [
        "Log on to the official Naan Mudhalvan portal or register via your college training cell",
        "Create candidate profile with your technical interests and career aspirations",
        "Choose targeted certification tracks (e.g., Full Stack, Electric Vehicles, AI/ML)",
        "Complete hands-on virtual labs and mandatory college integrated coursework",
        "Participate in state mega job fairs and receive corporate appointment letters"
      ],
      onlineUrl: "https://www.naanmudhalvan.tn.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://www.naanmudhalvan.tn.gov.in",
    deadline: "Rolling Semester Batches / Active Academic Intake 2026",
    lastUpdated: "2026-02-24",
    isVerified: true,
    isPublished: true,
    viewCount: 3150,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- UTTAR PRADESH ---
  {
    id: "scheme-kanya-sumangala-up",
    slug: "mukhyamantri-kanya-sumangala-yojana",
    name: "Mukhyamantri Kanya Sumangala Yojana",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಕನ್ಯಾ ಸುಮಂಗಲಾ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री कन्या सुमंगला योजना",
    department: "Women and Child Development Department, Government of Uttar Pradesh",
    classification: "State",
    state: "Uttar Pradesh",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Conditional cash transfer program in Uttar Pradesh providing financial grant of ₹25,000 across 6 progressive life milestones from girl child birth through graduation to eliminate female foeticide and promote girls' higher education.",
    description_kn: "ಉತ್ತರ ಪ್ರದೇಶದಲ್ಲಿ ಹೆಣ್ಣು ಮಗುವಿನ ಜನನದಿಂದ ಕಾಲೇಜು ಪದವಿವರೆಗೆ 6 ಹಂತಗಳಲ್ಲಿ ₹25,000 ಆರ್ಥಿಕ ನೆರವು ಒದಗಿಸುವ ಹೆಣ್ಣು ಮಕ್ಕಳ ಸಬಲೀಕರಣ ಯೋಜನೆ.",
    description_hi: "उत्तर प्रदेश में बालिकाओं को जन्म से लेकर स्नातक तक 6 चरणों में ₹25,000 की कुल वित्तीय सहायता देने वाली कल्याणकारी योजना।",
    benefits: [
      "Total ₹25,000 structured financial assistance disbursed directly into beneficiary bank account",
      "Stage 1: ₹5,000 at birth; Stage 2: ₹2,000 on immunization; Stage 3: ₹3,000 on Class 1; Stage 4: ₹3,000 on Class 6; Stage 5: ₹5,000 on Class 9; Stage 6: ₹7,000 on degree/diploma admission",
      "Encourages institutional deliveries, complete vaccination, and prevents child marriages"
    ],
    eligibilityCriteria: {
      minAge: 0,
      maxAge: 25,
      gender: "Female",
      maxAnnualIncome: 300000,
      applicableStates: ["Uttar Pradesh"],
      rules: [
        "Beneficiary family must be permanent residents of Uttar Pradesh",
        "Annual family income must not exceed ₹3,00,000",
        "Maximum of two daughters per family are eligible (three in case of twin girls in second delivery)"
      ]
    },
    requiredDocuments: [
      "Birth Certificate of girl child",
      "Uttar Pradesh Domicile / Residence Certificate",
      "Income Certificate issued by Tahsildar",
      "Mother/Guardian Aadhaar Card and Joint Bank Account Passbook",
      "Vaccination Card / School Admission Certificate corresponding to the milestone"
    ],
    applicationProcedure: {
      steps: [
        "Visit the MKSY portal and click on 'Citizen Service Portal - Apply Here'",
        "Create an account, verify mobile OTP, and set up login credentials",
        "Add girl child profile and select appropriate stage of application",
        "Upload scanned supporting documents (birth certificate, immunization card, fee receipt)",
        "Block Development Officer (BDO) or SDM verifies and sanctions direct treasury DBT"
      ],
      onlineUrl: "https://mksy.up.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://mksy.up.gov.in",
    deadline: "Open Year-Round (Milestone based application windows)",
    lastUpdated: "2026-02-26",
    isVerified: true,
    isPublished: true,
    viewCount: 4230,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-digishakti-tablet-up",
    slug: "swami-vivekananda-yuva-sashaktikaran-yojana",
    name: "Swami Vivekananda Yuva Sashaktikaran Yojana (DigiShakti)",
    name_kn: "ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ ಯುವ ಸಶಕ್ತೀಕರಣ ಯೋಜನೆ (ಡಿಜಿಶಕ್ತಿ)",
    name_hi: "स्वामी विवेकानन्द युवा सशक्तिकरण योजना (डिजीशक्ति)",
    department: "Department of IT and Electronics, Government of Uttar Pradesh",
    classification: "State",
    state: "Uttar Pradesh",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Digital empowerment initiative in Uttar Pradesh distributing free high-end tablets and smartphones to final year undergraduate, postgraduate, diploma, and skill development students to foster digital learning.",
    description_kn: "ಉತ್ತರ ಪ್ರದೇಶದ ಪದವಿ ಮತ್ತು ತಾಂತ್ರಿಕ ಕಾಲೇಜು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಉಚಿತ ಟ್ಯಾಬ್ಲೆಟ್ ಮತ್ತು ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ವಿತರಿಸುವ ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಡಿಜಿಟಲ್ ಶಿಕ್ಷಣ ಯೋಜನೆ.",
    description_hi: "उत्तर प्रदेश के उच्च शिक्षा, तकनीकी एवं कौशल विकास के छात्र-छात्राओं को मुफ्त टैबलेट एवं स्मार्टफोन वितरित करने की डिजिटल योजना।",
    benefits: [
      "100% free branded tablet or smartphone with pre-loaded education apps and syllabus material",
      "Access to career counseling, job notifications, and digital government skill modules",
      "Zero cost or deposit fee for eligible enrolled students"
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 30,
      applicableStates: ["Uttar Pradesh"],
      allowedOccupations: ["Student"],
      educationRequirements: "Enrolled in Higher Education (BA/BSc/BCom/BTech/MBBS/Diploma/ITI)",
      rules: [
        "Student must be a permanent resident of Uttar Pradesh",
        "Must be regularly enrolled in an approved university, college, ITI, or polytechnic in UP",
        "Should not have previously received a free device under the scheme"
      ]
    },
    requiredDocuments: [
      "College Identity Card and Current Year Fee Receipt",
      "Aadhaar Card with UP address",
      "Previous Semester Marksheet",
      "Active Mobile number linked to DigiShakti Portal"
    ],
    applicationProcedure: {
      steps: [
        "Students do NOT need to apply independently; universities directly upload enrolled student rosters",
        "Verify your uploaded credentials on DigiShakti portal using your college enrollment number",
        "College displays list of sanctioned beneficiaries on notice board",
        "Attend ceremonial distribution camp organized at your college or district stadium",
        "Sign digital receipt upon receiving the smartphone/tablet with IMEI tracking"
      ],
      onlineUrl: "https://digishakti.up.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://digishakti.up.gov.in",
    deadline: "Institutional Roster Cutoff: 31st October 2026",
    lastUpdated: "2026-02-12",
    isVerified: true,
    isPublished: true,
    viewCount: 3540,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-vishwakarma-shram-up",
    slug: "vishwakarma-shram-samman-yojana-up",
    name: "Vishwakarma Shram Samman Yojana (UP)",
    name_kn: "ವಿಶ್ವಕರ್ಮ ಶ್ರಮ ಸಮ್ಮಾನ್ ಯೋಜನೆ",
    name_hi: "विश्वकर्मा श्रम सम्मान योजना",
    department: "Directorate of Industries and MSME, Government of Uttar Pradesh",
    classification: "State",
    state: "Uttar Pradesh",
    category: "Employment Opportunities",
    beneficiaryCategory: "Artisans",
    description: "Self-employment and skill up-gradation scheme in Uttar Pradesh providing free 6-day modern tool training, complimentary certified toolkits, and collateral-free bank loans of up to ₹10 Lakhs to traditional artisans and craftsmen.",
    description_kn: "ಉತ್ತರ ಪ್ರದೇಶದ ಸಾಂಪ್ರದಾಯಿಕ ಕುಶಲಕರ್ಮಿಗಳು, ಬಡಗಿಗಳು, ದರ್ಜಿಗಳು ಮತ್ತು ಕಮ್ಮಾರರಿಗೆ ಉಚಿತ ತರಬೇತಿ, ಉಚಿತ ಆಧುನಿಕ ಟೂಲ್‌ಕಿಟ್ ಮತ್ತು ₹10 ಲಕ್ಷದವರೆಗೆ ಸಾಲ ಸೌಲಭ್ಯ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "उत्तर प्रदेश के बढ़ई, दर्जी, लोहार, कुम्हार व पारंपरिक कारीगरों को 6 दिवसीय मुफ्त प्रशिक्षण, आधुनिक टूलकिट और ₹10 लाख तक का सुगम ऋण।",
    benefits: [
      "Complimentary advanced artisanal toolkits worth ₹15,000 to ₹25,000 upon training completion",
      "6-day specialized skill development training with daily stipend of ₹500",
      "Bank loan facilitation from ₹1 Lakh to ₹10 Lakhs with 25% capital margin subsidy from the state"
    ],
    eligibilityCriteria: {
      minAge: 18,
      applicableStates: ["Uttar Pradesh"],
      allowedOccupations: ["Artisan", "Tailor", "Carpenter", "Blacksmith", "Potter", "Barber", "Cobbler", "Mason"],
      rules: [
        "Applicant must be a permanent resident of Uttar Pradesh",
        "Must be engaged in traditional craftsmanship trades (carpentry, tailoring, pottery, blacksmithing, masonry, goldsmithing)",
        "Only one member per family is eligible for toolkit assistance"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card and Voter ID",
      "Bank Account details with IFSC",
      "Passport size photograph",
      "Caste Certificate or Trade Experience Self-Declaration"
    ],
    applicationProcedure: {
      steps: [
        "Access the official DIUP MSME portal (diupmsme.upsdc.gov.in)",
        "Click on 'Vishwakarma Shram Samman Yojana' and complete registration",
        "Fill in trade details, experience, address, and upload photograph and signature",
        "District Industries Centre (DIC) interviews and selects shortlisted applicants",
        "Attend 6-day hands-on training center and receive certificate + toolkit on graduation day"
      ],
      onlineUrl: "https://diupmsme.upsdc.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://diupmsme.upsdc.gov.in",
    deadline: "Open Rolling Registrations / Batches Scheduled Monthly",
    lastUpdated: "2026-02-22",
    isVerified: true,
    isPublished: true,
    viewCount: 2980,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- RAJASTHAN ---
  {
    id: "scheme-chiranjeevi-rajasthan",
    slug: "mukhyamantri-chiranjeevi-swasthya-bima-yojana",
    name: "Mukhyamantri Chiranjeevi Swasthya Bima Yojana",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಚಿರಂಜೀವಿ ಆರೋಗ್ಯ ವಿಮಾ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री चिरंजीवी स्वास्थ्य बीमा योजना (आयुष्मान राजस्थान)",
    department: "Medical, Health and Family Welfare Department, Government of Rajasthan",
    classification: "State",
    state: "Rajasthan",
    category: "Health and Social Welfare",
    beneficiaryCategory: "General",
    description: "Pioneering universal health insurance scheme in Rajasthan providing up to ₹25,00,000 cashless medical and surgical coverage per family per year across 1,798 packages in empanelled hospitals.",
    description_kn: "ರಾಜಸ್ಥಾನದ ಎಲ್ಲಾ ಕುಟುಂಬಗಳಿಗೆ ಅತ್ಯಾಧುನಿಕ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಗಂಭೀರ ಕಾಯಿಲೆಗಳ ಚಿಕಿತ್ಸೆಗಾಗಿ ವಾರ್ಷಿಕ ₹25 ಲಕ್ಷದವರೆಗೆ ನಗದು ರಹಿತ ಆರೋಗ್ಯ ವಿಮೆ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "राजस्थान के सभी परिवारों को सूचीबद्ध सरकारी व निजी अस्पतालों में प्रति वर्ष ₹25 लाख तक का असाधारण कैशलेस इलाज कवरेज।",
    benefits: [
      "Massive cashless medical coverage of up to ₹25,00,000 per family per policy year",
      "100% free premium for NFSA beneficiaries, small/marginal farmers, contractual workers, and COVID-19 orphans",
      "Covers organ transplants, heart surgeries, cancer immunotherapy, dialysis, and hip replacements"
    ],
    eligibilityCriteria: {
      applicableStates: ["Rajasthan"],
      rules: [
        "Beneficiary family must reside in Rajasthan and possess a valid Jan Aadhaar Card",
        "Free category: NFSA cardholders, SECC families, marginal farmers, and EWS",
        "Other resident families can enroll by paying a nominal co-premium of ₹850 per year"
      ]
    },
    requiredDocuments: [
      "Jan Aadhaar Card or Jan Aadhaar Enrollment Slip",
      "Aadhaar Card of the patient",
      "Ration Card or Category certificate (for free premium category)"
    ],
    applicationProcedure: {
      steps: [
        "Visit the official Chiranjeevi portal or nearest e-Mitra kiosk in Rajasthan",
        "Enter Jan Aadhaar number to verify existing family enrollment status",
        "If under non-subsidized category, pay ₹850 annual premium via payment gateway",
        "Receive policy receipt and e-card valid across all network hospitals",
        "Show Jan Aadhaar at hospital Chiranjeevi Helpdesk for instant cashless admission"
      ],
      onlineUrl: "https://chiranjeevi.rajasthan.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://chiranjeevi.rajasthan.gov.in",
    deadline: "Continuous Open Enrollment (Annual Policy Period: 1 May - 30 April)",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4180,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-yuva-sambal-rajasthan",
    slug: "mukhyamantri-yuva-sambal-yojana-rajasthan",
    name: "Mukhyamantri Yuva Sambal Yojana (Rajasthan)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಯುವ ಸಂಬಲ್ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री युवा संबल योजना (बेरोजगारी भत्ता)",
    department: "Department of Skill, Employment and Entrepreneurship, Government of Rajasthan",
    classification: "State",
    state: "Rajasthan",
    category: "Employment Opportunities",
    beneficiaryCategory: "Youth",
    description: "Unemployment allowance and skill internship initiative providing monthly financial assistance of ₹4,000 to male graduates and ₹4,500 to female/transgender/divyang graduates for up to 2 years.",
    description_kn: "ರಾಜಸ್ಥಾನದ ನಿರುದ್ಯೋಗಿ ಯುವ ಪದವೀಧರರಿಗೆ 2 ವರ್ಷಗಳವರೆಗೆ ಮಾಸಿಕ ₹4,000 ರಿಂದ ₹4,500 ವರೆಗೆ ನಿರುದ್ಯೋಗ ಭತ್ಯೆ ಮತ್ತು ಇಂಟರ್ನ್‌ಶಿಪ್ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "राजस्थान के बेरोजगार युवाओं को 2 वर्ष तक प्रतिमाह ₹4,000 (पुरुष) एवं ₹4,500 (महिला/दिव्यांग) बेरोजगारी भत्ता व 4 घंटे दैनिक इंटर्नशिप।",
    benefits: [
      "Monthly unemployment assistance: ₹4,000 for male graduates, ₹4,500 for female, transgender, and disabled youth",
      "Up to 2 years (or until obtaining employment) financial cushion during competitive preparation",
      "4-hour daily practical public service internship in government departments to build workplace skills"
    ],
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 30,
      maxAnnualIncome: 200000,
      applicableStates: ["Rajasthan"],
      allowedOccupations: ["Unemployed"],
      educationRequirements: "Graduation (Bachelor Degree) from recognized University",
      rules: [
        "Applicant must be an unemployed graduate domiciled in Rajasthan",
        "Family total annual income must not exceed ₹2,00,000",
        "Age relaxation up to 35 years for SC/ST, women, and differently-abled individuals",
        "Must undergo 3 months skill training or mandatory daily internship"
      ]
    },
    requiredDocuments: [
      "Graduation Degree Certificate / Final Year Marksheet",
      "Jan Aadhaar Card and Aadhaar Card",
      "Domicile Certificate of Rajasthan",
      "Income Certificate (Form I and K)",
      "Self-declaration of unemployment on non-judicial stamp"
    ],
    applicationProcedure: {
      steps: [
        "Register on the Rajasthan Employment Portal (employment.livelihoods.rajasthan.gov.in)",
        "Log in using SSO ID (Single Sign-On) and navigate to 'Yuva Sambal Application'",
        "Upload degree certificate, Jan Aadhaar, income affidavit, and bank passbook",
        "District Employment Officer scrutinizes documents and sanctions monthly allowance",
        "Complete allotted department internship to receive automated monthly DBT"
      ],
      onlineUrl: "https://employment.livelihoods.rajasthan.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://employment.livelihoods.rajasthan.gov.in",
    deadline: "Open Year-Round / Monthly Processing Cycles",
    lastUpdated: "2026-02-14",
    isVerified: true,
    isPublished: true,
    viewCount: 3120,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- WEST BENGAL ---
  {
    id: "scheme-lakshmir-bhandar-wb",
    slug: "lakshmir-bhandar-scheme-west-bengal",
    name: "Lakshmir Bhandar Scheme",
    name_kn: "ಲಕ್ಷ್ಮೀರ್ ಭಂಡಾರ್ ಯೋಜನೆ",
    name_hi: "लक्ष्मी भंडार योजना (पश्चिम बंगाल)",
    department: "Department of Women and Child Development and Social Welfare, West Bengal",
    classification: "State",
    state: "West Bengal",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Massive direct financial assistance scheme in West Bengal granting ₹1,200 monthly to SC/ST women and ₹1,000 monthly to General/OBC women heads of households aged 25-60.",
    description_kn: "ಪಶ್ಚಿಮ ಬಂಗಾಳದ 25-60 ವರ್ಷದ ಮಹಿಳೆಯರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,000 ರಿಂದ ₹1,200 ನೇರ ಬ್ಯಾಂಕ್ ಸಹಾಯ ಒದಗಿಸುವ ಪ್ರಮುಖ ಆರ್ಥಿಕ ಸಬಲೀಕರಣ ಯೋಜನೆ.",
    description_hi: "पश्चिम बंगाल में 25 से 60 वर्ष की महिलाओं को प्रति माह ₹1,000 (सामान्य/ओबीसी) और ₹1,200 (एससी/एसटी) की सीधी बैंक वित्तीय सहायता।",
    benefits: [
      "₹1,200 monthly DBT for SC and ST women heads of families",
      "₹1,000 monthly DBT for General and OBC category women",
      "Disbursed automatically on the 1st week of every month into beneficiary's single bank account"
    ],
    eligibilityCriteria: {
      minAge: 25,
      maxAge: 60,
      gender: "Female",
      applicableStates: ["West Bengal"],
      allowedOccupations: ["Homemaker", "Self-employed", "Agricultural Laborer", "Any"],
      rules: [
        "Applicant must be a permanent female resident of West Bengal",
        "Age between 25 and 60 years",
        "Should not be a regular government employee or receiving regular government pension"
      ]
    },
    requiredDocuments: [
      "Swasthya Sathi Card (Mandatory primary identifier)",
      "Aadhaar Card of the woman applicant",
      "SC/ST Certificate (for enhanced ₹1,200 benefit)",
      "Bank Account Passbook (single account seeded with Aadhaar)",
      "Passport size color photograph"
    ],
    applicationProcedure: {
      steps: [
        "Obtain free physical application form from Duare Sarkar outreach camps or BDO office",
        "Fill in personal details, Swasthya Sathi card number, Aadhaar, and bank account info",
        "Attach photocopies of Swasthya Sathi card, Aadhaar, bank passbook, and photo",
        "Submit form at the Duare Sarkar counter and collect acknowledgment slip",
        "Receive SMS notification upon sanction and start receiving monthly DBT"
      ],
      onlineUrl: "https://socialsecurity.wb.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://socialsecurity.wb.gov.in",
    deadline: "Continuous Open Enrollment via Duare Sarkar Camps & BDO Offices",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4890,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-krishak-bandhu-wb",
    slug: "krishak-bandhu-natun-west-bengal",
    name: "Krishak Bandhu (Natun) Scheme",
    name_kn: "ಕೃಷಕ್ ಬಂಧು ಯೋಜನೆ",
    name_hi: "कृषक बंधु (नतून) योजना",
    department: "Department of Agriculture, Government of West Bengal",
    classification: "State",
    state: "West Bengal",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "Agricultural income security and life insurance program in West Bengal providing up to ₹10,000 per year per acre in two installments and ₹2,00,000 death compensation to bereaved farmer families.",
    description_kn: "ಪಶ್ಚಿಮ ಬಂಗಾಳದ ರೈತರಿಗೆ ವಾರ್ಷಿಕ ₹10,000 ರವರೆಗೆ ಕೃಷಿ ಸಹಾಯ ಮತ್ತು ₹2,00,000 ಜೀವ ವಿಮಾ ನೆರವು ನೀಡುವ ಪ್ರಮುಖ ರೈತ ಕಲ್ಯಾಣ ಯೋಜನೆ.",
    description_hi: "पश्चिम बंगाल में किसानों एवं बटाईदारों को प्रति वर्ष ₹10,000 तक की इनपुट सहायता एवं आकस्मिक मृत्यु पर ₹2,00,000 का निःशुल्क जीवन बीमा।",
    benefits: [
      "Financial assistance of ₹10,000 per acre annually (minimum ₹4,000 even for fractional landholdings)",
      "Disbursed in two equal seasonal tranches during Kharif and Rabi crop sowing seasons",
      "Krishak Bandhu Death Benefit: ₹2,00,000 one-time grant to family in case of farmer death aged 18-60"
    ],
    eligibilityCriteria: {
      minAge: 18,
      applicableStates: ["West Bengal"],
      allowedOccupations: ["Farmer", "Agricultural Laborer", "Sharecropper (Bargadar)"],
      rules: [
        "Farmer or recorded Bargadar (sharecropper) holding cultivable land in West Bengal",
        "Name must be entered in the State Land and Land Reforms record of rights (ROR / RoR Parcha)"
      ]
    },
    requiredDocuments: [
      "Latest Land Records RoR (Parcha / Khatian copy)",
      "Aadhaar Card and Voter ID Card",
      "Bank Passbook showing active IFSC and account number",
      "Passport photograph and mobile number"
    ],
    applicationProcedure: {
      steps: [
        "Visit local Assistant Director of Agriculture (ADA) office or Duare Sarkar camp",
        "Fill out Krishak Bandhu registration form with land schedule numbers (Mouza, JL, Khatian)",
        "Attach self-attested copies of Land Parcha, Aadhaar, and bank passbook",
        "Agriculture officer verifies landholding records on Banglarbhumi database",
        "Krishak Bandhu Smart ID is generated and seasonal benefits credit directly via DBT"
      ],
      onlineUrl: "https://krishakbandhu.wb.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://krishakbandhu.wb.gov.in",
    deadline: "Kharif Cycle: 31 July 2026 | Rabi Cycle: 31 December 2026",
    lastUpdated: "2026-02-18",
    isVerified: true,
    isPublished: true,
    viewCount: 3340,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-swasthya-sathi-wb",
    slug: "swasthya-sathi-scheme-west-bengal",
    name: "Swasthya Sathi Scheme",
    name_kn: "ಸ್ವಾಸ್ಥ್ಯ ಸಾಥಿ ಯೋಜನೆ",
    name_hi: "स्वास्थ्य साथी योजना",
    department: "Department of Health and Family Welfare, Government of West Bengal",
    classification: "State",
    state: "West Bengal",
    category: "Health and Social Welfare",
    beneficiaryCategory: "General",
    description: "Universal cashless health insurance scheme in West Bengal providing ₹5,00,000 per family per year basic coverage, issued officially in the name of the woman head of household.",
    description_kn: "ಪಶ್ಚಿಮ ಬಂಗಾಳದ ಎಲ್ಲಾ ಕುಟುಂಬಗಳಿಗೆ ಮಹಿಳಾ ಮುಖ್ಯಸ್ಥೆಯ ಹೆಸರಿನಲ್ಲಿ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸೆ ನೀಡುವ ಸಾರ್ವತ್ರಿಕ ಆರೋಗ್ಯ ಯೋಜನೆ.",
    description_hi: "पश्चिम बंगाल के सभी परिवारों को महिला मुखिया के नाम पर जारी स्मार्ट कार्ड द्वारा प्रति वर्ष ₹5 लाख तक का कैशलेस अस्पताल उपचार।",
    benefits: [
      "₹5,00,000 cashless secondary and tertiary hospitalization cover per family per year",
      "Smart Card issued under the name of the eldest female member of the household",
      "Covers all pre-existing illnesses with zero exclusion and post-hospitalization medicine allowances"
    ],
    eligibilityCriteria: {
      applicableStates: ["West Bengal"],
      rules: [
        "All permanent resident families of West Bengal not covered under any other statutory government health scheme",
        "Issued universally without income cutoff"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card of all family members",
      "West Bengal Digital Ration Card",
      "Passport size photograph of the female head"
    ],
    applicationProcedure: {
      steps: [
        "Visit your nearest Duare Sarkar camp or Municipality/Gram Panchayat office",
        "Fill Form 'B' (Registration for Swasthya Sathi) with family member details",
        "Undergo on-the-spot biometric capture and webcam photograph",
        "Receive instantly printed smart health card encoded with chip and family data",
        "Produce card at any network hospital across West Bengal for immediate cashless care"
      ],
      onlineUrl: "https://swasthyasathi.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://swasthyasathi.gov.in",
    deadline: "Open Year-Round / Universal Lifelong Smart Card",
    lastUpdated: "2026-02-25",
    isVerified: true,
    isPublished: true,
    viewCount: 3950,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- ANDHRA PRADESH ---
  {
    id: "scheme-amma-vodi-ap",
    slug: "jagananna-amma-vodi-ap",
    name: "Jagananna Amma Vodi / Talliki Vandanam",
    name_kn: "ಜಗನನ್ನ ಅಮ್ಮ ವೊಡಿ ಯೋಜನೆ",
    name_hi: "जगन्नना अम्मा वोडी / तल्लिकी वंदनम योजना",
    department: "Department of School Education, Government of Andhra Pradesh",
    classification: "State",
    state: "Andhra Pradesh",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "School education incentive in Andhra Pradesh granting ₹15,000 annually directly into the bank accounts of needy mothers to educate their children from Class 1 to 12 in recognized schools.",
    description_kn: "ಆಂಧ್ರಪ್ರದೇಶದಲ್ಲಿ 1 ರಿಂದ 12 ನೇ ತರಗತಿವರೆಗೆ ಓದುತ್ತಿರುವ ಮಕ್ಕಳ ತಾಯಂದಿರಿಗೆ ವಾರ್ಷಿಕ ₹15,000 ನೇರ ಆರ್ಥಿಕ ನೆರವು ನೀಡುವ ಪ್ರಮುಖ ಶಿಕ್ಷಣ ಯೋಜನೆ.",
    description_hi: "आंध्र प्रदेश में कक्षा 1 से 12 तक के विद्यार्थियों की माताओं के बैंक खाते में वार्षिक ₹15,000 की सीधी शिक्षा सहायता राशि।",
    benefits: [
      "₹15,000 annual direct benefit transfer deposited into mother's Aadhaar-seeded bank account",
      "Covers all students from Class 1 through Intermediate (Class 12) across government and private schools",
      "Substantially eliminates child labor and achieves near 100% gross school enrollment ratio"
    ],
    eligibilityCriteria: {
      minAge: 5,
      maxAge: 18,
      maxAnnualIncome: 120000,
      applicableStates: ["Andhra Pradesh"],
      allowedOccupations: ["Student"],
      educationRequirements: "Enrolled in Class 1 to 12 with 75% minimum attendance",
      rules: [
        "Mother/guardian and student must be permanent residents of Andhra Pradesh",
        "Student must maintain minimum 75% school attendance throughout the academic session",
        "Family should possess valid Rice Card (BPL ration card)"
      ]
    },
    requiredDocuments: [
      "White Ration Card / Rice Card of Andhra Pradesh",
      "Aadhaar Card of the mother and child",
      "School Admission Certificate with Child Info ID",
      "Bank Account details of the mother (Aadhaar linked)"
    ],
    applicationProcedure: {
      steps: [
        "School Headmaster verifies student attendance on the official Child Info portal",
        "Draft beneficiary lists displayed at Ward/Gram Sachivalayam for social audit",
        "Welfare and Education Assistant conducts e-KYC verification with the mother",
        "Final sanctioned list approved by District Educational Officer (DEO)",
        "₹15,000 transferred directly to mother's bank account before academic reopening"
      ],
      onlineUrl: "https://jaganannaammavodi.ap.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://jaganannaammavodi.ap.gov.in",
    deadline: "Annual Verification Window: 1st April to 31st May 2026",
    lastUpdated: "2026-02-15",
    isVerified: true,
    isPublished: true,
    viewCount: 3670,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-ysr-aarogyasri-ap",
    slug: "ysr-aarogyasri-scheme-andhra-pradesh",
    name: "Dr. YSR Aarogyasri Health Scheme",
    name_kn: "ಡಾ. ವೈಎಸ್ಆರ್ ಆರೋಗ್ಯಶ್ರೀ ಯೋಜನೆ",
    name_hi: "डॉ. वाईएसआर आरोग्यश्री स्वास्थ्य योजना",
    department: "Dr. YSR Aarogyasri Health Care Trust, Government of Andhra Pradesh",
    classification: "State",
    state: "Andhra Pradesh",
    category: "Health and Social Welfare",
    beneficiaryCategory: "General",
    description: "Flagship cashless healthcare scheme in Andhra Pradesh providing free medical and surgical coverage of up to ₹25,00,000 for 3,257 recognized procedures across network hospitals.",
    description_kn: "ಆಂಧ್ರಪ್ರದೇಶದ ನಾಗರಿಕರಿಗೆ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ 3,257 ಕ್ಕೂ ಹೆಚ್ಚು ಗಂಭೀರ ಕಾಯಿಲೆಗಳಿಗೆ ವಾರ್ಷಿಕ ₹25 ಲಕ್ಷದವರೆಗೆ ಸಂಪೂರ್ಣ ಉಚಿತ ಚಿಕಿತ್ಸೆ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "आंध्र प्रदेश में सूचीबद्ध अस्पतालों में 3,257 बीमारियों और सर्जरी के लिए प्रति परिवार प्रति वर्ष ₹25 लाख तक का कैशलेस निःशुल्क इलाज।",
    benefits: [
      "100% cashless treatment up to ₹25,00,000 per family per annum",
      "Covers 3,257 procedures including cardiology, oncology, pediatric surgery, and joint replacements",
      "Post-operative allowance (Aarogya Aasara) of up to ₹5,000 per month during recovery period"
    ],
    eligibilityCriteria: {
      maxAnnualIncome: 500000,
      applicableStates: ["Andhra Pradesh"],
      rules: [
        "Family must hold valid Rice Card or YSR Aarogyasri Card issued by Government of Andhra Pradesh",
        "Family annual income ceiling: ₹5,00,000 or landholding under 12 acres wetland / 35 acres dryland"
      ]
    },
    requiredDocuments: [
      "Aarogyasri Health Card / Rice Card",
      "Aadhaar Card of the patient",
      "Medical prescription and diagnosis slips"
    ],
    applicationProcedure: {
      steps: [
        "Report to the Aarogyasri Helpdesk located at any empanelled government or corporate hospital",
        "Aarogya Mithra scans patient's Aarogyasri card or Rice Card for instant authentication",
        "Attending doctor initiates digital pre-authorization request to the Trust",
        "Trust medical team approves procedure within 12 hours (immediate for emergencies)",
        "Receive completely cashless in-patient treatment, surgery, meals, and discharge medications"
      ],
      onlineUrl: "https://aarogyasri.ap.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://aarogyasri.ap.gov.in",
    deadline: "Open Year-Round / Universal Lifelong Enrollment",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 3880,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- TELANGANA ---
  {
    id: "scheme-rythu-bandhu-telangana",
    slug: "rythu-bandhu-rythu-bharosa-telangana",
    name: "Rythu Bandhu / Rythu Bharosa Investment Support",
    name_kn: "ರೈತು ಬಂಧು / ರೈತು ಭರೋಸಾ ಯೋಜನೆ",
    name_hi: "रैतु बंधु / रैतु भरोसा किसान निवेश सहायता योजना",
    department: "Department of Agriculture, Government of Telangana",
    classification: "State",
    state: "Telangana",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "Pioneering agricultural input investment support scheme in Telangana depositing direct financial grant of ₹10,000 to ₹15,000 per acre per year ahead of sowing seasons to free farmers from moneylenders.",
    description_kn: "ತೆಲಂಗಾಣದ ರೈತರಿಗೆ ಬಿತ್ತನೆ ಬೀಜ, ರಸಗೊಬ್ಬರ ಮತ್ತು ಕೃಷಿ ವೆಚ್ಚಗಳಿಗಾಗಿ ಪ್ರತಿ ಎಕರೆಗೆ ವಾರ್ಷಿಕ ₹10,000 ದಿಂದ ₹15,000 ನೇರ ಧನಸಹಾಯ ನೀಡುವ ಪ್ರಮುಖ ಯೋಜನೆ.",
    description_hi: "तेलंगाना में किसानों को खरीफ व रबी की बुवाई से पहले बीज, खाद व कीटनाशक खरीदने के लिए प्रति एकड़ ₹10,000 से ₹15,000 की वार्षिक सीधी सहायता।",
    benefits: [
      "Direct financial grant of ₹5,000 to ₹7,500 per acre per season credited directly via DBT",
      "No restriction on maximum acreage; benefits scale with agricultural land area",
      "Funds credited before onset of monsoon (Kharif) and post-monsoon (Yasangi/Rabi)"
    ],
    eligibilityCriteria: {
      minAge: 18,
      applicableStates: ["Telangana"],
      allowedOccupations: ["Farmer"],
      rules: [
        "Must be a landholding farmer residing in Telangana",
        "Must possess digital Pattadar Passbook issued under Dharani portal system"
      ]
    },
    requiredDocuments: [
      "Pattadar Passbook / Dharani Land Record Copy",
      "Aadhaar Card of the farmer",
      "Aadhaar-seeded Bank Account Passbook"
    ],
    applicationProcedure: {
      steps: [
        "Newly acquired land purchases must ensure Pattadar Passbook generation via Dharani portal",
        "Submit passbook and bank account details to local Agriculture Extension Officer (AEO)",
        "AEO verifies land parcel coordinates and marks eligible record in the Rythu Bandhu database",
        "State Treasury executes electronic DBT payment batch to registered bank account",
        "Receive direct SMS credit alert from bank and department"
      ],
      onlineUrl: "https://rythubandhu.telangana.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://rythubandhu.telangana.gov.in",
    deadline: "Seasonal Sowing Windows (June for Kharif / November for Rabi)",
    lastUpdated: "2026-02-27",
    isVerified: true,
    isPublished: true,
    viewCount: 4310,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-kalyana-lakshmi-tg",
    slug: "kalyana-lakshmi-shaadi-mubarak-telangana",
    name: "Kalyana Lakshmi / Shaadi Mubarak Scheme",
    name_kn: "ಕಲ್ಯಾಣ ಲಕ್ಷ್ಮಿ / ಶಾದಿ ಮುಬಾರಕ್ ಯೋಜನೆ",
    name_hi: "कल्याणा लक्ष्मी / शादी मुबारक योजना",
    department: "Scheduled Castes Development & BC Welfare Department, Telangana",
    classification: "State",
    state: "Telangana",
    category: "Financial Assistance",
    beneficiaryCategory: "Women",
    description: "Flagship social welfare grant in Telangana providing one-time financial aid of ₹1,00,116 to unmarried brides from economically weaker SC, ST, BC, EBC, and Minority families at the time of marriage.",
    description_kn: "ತೆಲಂಗಾಣದ ಆರ್ಥಿಕವಾಗಿ ಹಿಂದುಳಿದ ಕುಟುಂಬಗಳ ಹೆಣ್ಣುಮಕ್ಕಳ ಮದುವೆಗೆ ₹1,00,116 ರ ಒಂದು ಬಾರಿಯ ಆರ್ಥಿಕ ನೆರವು ಒದಗಿಸುವ ಜನಪ್ರಿಯ ಯೋಜನೆ.",
    description_hi: "तेलंगाना में अनुसूचित जाति, जनजाति, पिछड़ा वर्ग एवं अल्पसंख्यक परिवारों की युवतियों के विवाह के समय ₹1,00,116 की एकमुश्त अनुदान सहायता।",
    benefits: [
      "One-time direct financial grant of ₹1,00,116 credited into the mother's bank account",
      "Eliminates crippling dowry debt and prevents minor marriages through strict age verification",
      "Full digital application and status tracking through Telangana ePass portal"
    ],
    eligibilityCriteria: {
      minAge: 18,
      gender: "Female",
      maxAnnualIncome: 200000,
      applicableStates: ["Telangana"],
      rules: [
        "Bride must be at least 18 years of age at the time of marriage",
        "Combined annual income of bride's parents must not exceed ₹2,00,000 (Urban) or ₹1,50,000 (Rural)",
        "Bride and groom must be permanent residents of Telangana"
      ]
    },
    requiredDocuments: [
      "Bride and Groom's Date of Birth proof (SSC marksheet or Birth Certificate)",
      "Aadhaar Cards of Bride, Groom, and Bride's Mother",
      "Integrated Caste and Income Certificate issued via MeeSeva",
      "Wedding Invitation Card (Lagnapatrika) or Marriage Registration Certificate",
      "Mother's Bank Account Passbook (Aadhaar-seeded)"
    ],
    applicationProcedure: {
      steps: [
        "Visit Telangana ePass portal (telanganaepass.cgg.gov.in) and click on 'Kalyana Lakshmi / Shaadi Mubarak'",
        "Fill bride, groom, parents' details, and marriage solemnization date",
        "Upload scanned certificates (Aadhaar, income, caste, birth proof, wedding card)",
        "Tahsildar / Mandal Revenue Officer (MRO) conducts physical inquiry and approves dossier",
        "Amount of ₹1,00,116 deposited directly into bride's mother's bank account before marriage"
      ],
      onlineUrl: "https://telanganaepass.cgg.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://telanganaepass.cgg.gov.in",
    deadline: "Apply prior to marriage or within 30 days of ceremony / Active 2026",
    lastUpdated: "2026-02-19",
    isVerified: true,
    isPublished: true,
    viewCount: 3740,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- KERALA ---
  {
    id: "scheme-life-mission-kerala",
    slug: "life-mission-total-housing-kerala",
    name: "LIFE Mission (Total Housing Security Scheme)",
    name_kn: "ಲೈಫ್ ಮಿಷನ್ ವಸತಿ ಯೋಜನೆ",
    name_hi: "लाइफ मिशन संपूर्ण आवास सुरक्षा योजना (केरल)",
    department: "Local Self Government Department, Government of Kerala",
    classification: "State",
    state: "Kerala",
    category: "Financial Assistance",
    beneficiaryCategory: "General",
    description: "Comprehensive housing security project in Kerala aimed at providing safe, permanent, modern disaster-resilient houses and financial grants of ₹4,00,000 to all landless and homeless families.",
    description_kn: "ಕೇರಳದ ಎಲ್ಲಾ ನಿರಾಶ್ರಿತ ಮತ್ತು ಭೂರಹಿತ ಬಡ ಕುಟುಂಬಗಳಿಗೆ ₹4,00,000 ಸಹಾಯಧನದೊಂದಿಗೆ ಸುಸಜ್ಜಿತ ಶಾಶ್ವತ ಮನೆ ನಿರ್ಮಿಸಿಕೊಡುವ ಯೋಜನೆ.",
    description_hi: "केरल के सभी भूमिहीन एवं बेघर परिवारों को ₹4,00,000 के सरकारी अनुदान से सुरक्षित, पक्का और आधुनिक आवास उपलब्ध कराने की प्रमुख योजना।",
    benefits: [
      "Financial assistance of ₹4,00,000 for homeless families who own land to build a permanent pucca house",
      "Complete multi-storey apartment complex allotment with community hall and drinking water for landless homeless families",
      "Integration with employment, livelihood training, and healthcare benefits"
    ],
    eligibilityCriteria: {
      applicableStates: ["Kerala"],
      rules: [
        "Applicant family must be permanent residents of Kerala without a habitable concrete house",
        "Priority given to widows, differently-abled heads of families, chronic disease patients, and coastal fishing communities"
      ]
    },
    requiredDocuments: [
      "Ration Card of Kerala",
      "Aadhaar Card of all family members",
      "Land Ownership Document (Thandaper / Land Tax receipt, if land is owned)",
      "Non-possession of habitable house certificate from local Village Officer / Grama Panchayat"
    ],
    applicationProcedure: {
      steps: [
        "Apply online during notified intake windows via LIFE Mission portal or through Akshaya Centers",
        "Upload identity proof, land title documents, and residential certificates",
        "Grama Panchayat secretary and field committee conduct physical inspection of existing premises",
        "Social audit beneficiary list published at ward sabha meetings",
        "Funds released in 4 construction milestone stages (Foundation, Walls, Roof, Completion) directly via DBT"
      ],
      onlineUrl: "https://lifemission.kerala.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://lifemission.kerala.gov.in",
    deadline: "Phase-IV Beneficiary Window: 31st October 2026",
    lastUpdated: "2026-02-16",
    isVerified: true,
    isPublished: true,
    viewCount: 2860,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-kudumbashree-kerala",
    slug: "kudumbashree-livelihood-microenterprise-kerala",
    name: "Kudumbashree Livelihood & Micro-Enterprise Scheme",
    name_kn: "ಕುಟುಂಬಶ್ರೀ ಜೀವನೋಪಾಯ ಯೋಜನೆ",
    name_hi: "कुटुंबश्री आजीविका एवं सूक्ष्म उद्यम योजना",
    department: "State Poverty Eradication Mission, Government of Kerala",
    classification: "State",
    state: "Kerala",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Globally acclaimed women-focused poverty eradication movement in Kerala organizing women into neighborhood groups (NHGs) and extending subsidized bank linkages of up to ₹10 Lakhs for micro-enterprises.",
    description_kn: "ಕೇರಳದ ಮಹಿಳೆಯರಿಗೆ ಸ್ವಸಹಾಯ ಸಂಘಗಳ ಮೂಲಕ ₹10 ಲಕ್ಷದವರೆಗೆ ಕಡಿಮೆ ಬಡ್ಡಿದರದ ಸಾಲ, ತರಬೇತಿ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಅವಕಾಶ ಒದಗಿಸುವ ಜಾಗತಿಕ ಮನ್ನಣೆಯ ಯೋಜನೆ.",
    description_hi: "केरल में स्वयं सहायता समूहों (NHG) के माध्यम से महिलाओं को ₹10 लाख तक का रियायती बैंक ऋण, कौशल प्रशिक्षण और सूक्ष्म उद्योग स्थापना सहायता।",
    benefits: [
      "Interest subvention loans up to ₹10 Lakhs for collective micro-enterprises at effectively 4% interest",
      "Technical mentorship in agro-processing, IT services, garment manufacturing, and community catering",
      "Guaranteed marketing support through Kudumbashree retail bazaars and e-commerce platforms"
    ],
    eligibilityCriteria: {
      minAge: 18,
      gender: "Female",
      applicableStates: ["Kerala"],
      allowedOccupations: ["Homemaker", "Artisan", "Self-employed", "Agricultural Laborer", "Any"],
      rules: [
        "Must be an active member of a registered Kudumbashree Neighborhood Group (Ayalkoottam)",
        "Must participate in weekly thrift-saving meetings"
      ]
    },
    requiredDocuments: [
      "Kudumbashree NHG Membership Passbook",
      "Aadhaar Card and Kerala Ration Card",
      "Micro-enterprise project proposal approved by Community Development Society (CDS)"
    ],
    applicationProcedure: {
      steps: [
        "Join your local Ward Neighborhood Group (NHG / Ayalkoottam)",
        "Form a Joint Liability Group (JLG) with 4 to 10 interested women entrepreneurs",
        "Prepare business project plan with assistance from Kudumbashree Community Resource Person (CRP)",
        "Submit plan to Area Development Society (ADS) and bank for credit linkage",
        "Receive loan disbursement and start commercial production with state marketing tie-ups"
      ],
      onlineUrl: "https://www.kudumbashree.org",
      offlineModeAvailable: true
    },
    officialWebsite: "https://www.kudumbashree.org",
    deadline: "Open Rolling Intake / Weekly NHG Formations",
    lastUpdated: "2026-02-28",
    isVerified: true,
    isPublished: true,
    viewCount: 3180,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- GUJARAT ---
  {
    id: "scheme-vahli-dikri-gujarat",
    slug: "vahli-dikri-yojana-gujarat",
    name: "Vahli Dikri Yojana",
    name_kn: "ವಹಲಿ ದಿಕ್ರಿ ಯೋಜನೆ",
    name_hi: "व्हाहली डिकरी योजना (गुजरात)",
    department: "Women and Child Development Department, Government of Gujarat",
    classification: "State",
    state: "Gujarat",
    category: "Student Scholarships",
    beneficiaryCategory: "Women",
    description: "Financial incentive and girl empowerment scheme in Gujarat granting total assistance of ₹1,10,000 in three stages: on Class 1 admission (₹4,000), Class 9 admission (₹6,000), and on turning 18 (₹1,00,000).",
    description_kn: "ಗುಜರಾತ್‌ನಲ್ಲಿ ಹೆಣ್ಣು ಮಕ್ಕಳ ಶಿಕ್ಷಣ ಮತ್ತು ವಿವಾಹ ನೆರವಿಗಾಗಿ 3 ಹಂತಗಳಲ್ಲಿ ಒಟ್ಟು ₹1,10,000 ಆರ್ಥಿಕ ಪ್ರೋತ್ಸಾಹ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "गुजरात में बालिकाओं के जन्म, प्राथमिक शिक्षा और 18 वर्ष की आयु पूरी होने पर तीन चरणों में कुल ₹1,10,000 की वित्तीय सहायता।",
    benefits: [
      "Stage 1: ₹4,00,00 deposited upon enrollment in Class 1",
      "Stage 2: ₹6,000 deposited upon admission into Class 9",
      "Stage 3: Lump-sum financial grant of ₹1,00,000 upon girl reaching 18 years of age for higher studies or marriage"
    ],
    eligibilityCriteria: {
      minAge: 0,
      maxAge: 18,
      gender: "Female",
      maxAnnualIncome: 200000,
      applicableStates: ["Gujarat"],
      rules: [
        "Girl child must be born in Gujarat and parents must be permanent residents of the state",
        "Combined annual family income must not exceed ₹2,00,000",
        "Applicable for first two surviving daughters of a family"
      ]
    },
    requiredDocuments: [
      "Birth Certificate of the girl child",
      "Parents' Aadhaar Cards and Gujarat Domicile Certificate",
      "Income Certificate issued by Mamlatdar / Taluka Development Officer",
      "School Admission Bonafide (for Stage 1 and 2)",
      "Bank Account details of mother or girl"
    ],
    applicationProcedure: {
      steps: [
        "Obtain free application form from local Anganwadi Center, CDPO office, or Digital Gujarat portal",
        "Fill out applicant information and attach birth certificate and income certificate",
        "Submit dossier to Child Development Project Officer (CDPO) within 1 year of child's birth",
        "District Women and Child Officer reviews and issues official sanction letter",
        "Scheduled payments disbursed directly via DBT at each milestone"
      ],
      onlineUrl: "https://digitalgujarat.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://wcd.gujarat.gov.in",
    deadline: "Apply within 1 year of girl child birth / Open 2026",
    lastUpdated: "2026-02-11",
    isVerified: true,
    isPublished: true,
    viewCount: 3040,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-mysy-scholarship-gujarat",
    slug: "mukhyamantri-yuva-swavalamban-yojana-gujarat",
    name: "Mukhyamantri Yuva Swavalamban Yojana (MYSY)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಯುವ ಸ್ವಾವಲಂಬನ್ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री युवा स्वावलंबन योजना (MYSY)",
    department: "Education Department, Government of Gujarat",
    classification: "State",
    state: "Gujarat",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Merit-cum-means scholarship in Gujarat providing 50% tuition fee reimbursement (up to ₹2,00,000/year for medical, ₹50,000 for engineering) plus hostel and book allowances to meritorious students.",
    description_kn: "ಗುಜರಾತ್‌ನ ಪ್ರತಿಭಾವಂತ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವೈದ್ಯಕೀಯ, ಇಂಜಿನಿಯರಿಂಗ್ ಮತ್ತು ಪದವಿ ಕೋರ್ಸ್‌ಗಳಿಗೆ ಶೇಕಡಾ 50 ರಷ್ಟು ಶುಲ್ಕ ಮರುಪಾವತಿ ಮತ್ತು ಹಾಸ್ಟೆಲ್ ನೆರವು ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "गुजरात में मेधावी विद्यार्थियों को मेडिकल में ₹2 लाख/वर्ष एवं इंजीनियरिंग में ₹50,000 तक शिक्षण शुल्क सहायता, छात्रावास व पुस्तक भत्ता।",
    benefits: [
      "50% tuition fee reimbursement up to ₹2,00,000/yr for MBBS/Dental, and up to ₹50,000/yr for Engineering/Pharmacy",
      "Monthly hostel food & accommodation allowance of ₹1,200 (₹12,000 per academic year)",
      "One-time instrument and book grant of ₹10,000 for medical/engineering programs"
    ],
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 25,
      maxAnnualIncome: 600000,
      applicableStates: ["Gujarat"],
      allowedOccupations: ["Student"],
      educationRequirements: "80+ percentile in Class 10 or Class 12 Board Exams",
      rules: [
        "Student must have secured 80 percentile or above in 10th/12th board exams in Gujarat",
        "Annual family income must not exceed ₹6,00,000 from all sources",
        "Must be admitted to an approved government or self-financed college in Gujarat"
      ]
    },
    requiredDocuments: [
      "Class 10 / Class 12 Board Marksheet showing Percentile Rank",
      "Admission letter and Fee Receipt of College",
      "Income Certificate from Mamlatdar or TDO",
      "Hostel Bonafide certificate (if claiming hostel assistance)",
      "Aadhaar Card and Student Bank Passbook"
    ],
    applicationProcedure: {
      steps: [
        "Register online at the official MYSY portal (mysy.guj.nic.in) using board exam roll number",
        "Fill academic, personal, and bank details and upload scanned certificates",
        "Book appointment at nearest designated Help Center (Government Polytechnic/College)",
        "Present original documents for physical verification at the Help Center",
        "Scholarship funds transferred directly into the student's bank account via DBT"
      ],
      onlineUrl: "https://mysy.guj.nic.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://mysy.guj.nic.in",
    deadline: "Academic Year 2026-27 Window Closes: 31st December 2026",
    lastUpdated: "2026-02-23",
    isVerified: true,
    isPublished: true,
    viewCount: 3620,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- MADHYA PRADESH ---
  {
    id: "scheme-ladli-behna-mp",
    slug: "mukhyamantri-ladli-behna-yojana",
    name: "Mukhyamantri Ladli Behna Yojana",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಲಾಡ್ಲಿ ಬೆಹನಾ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री लाड़ली बहना योजना",
    department: "Women and Child Development Department, Government of Madhya Pradesh",
    classification: "State",
    state: "Madhya Pradesh",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Milestone women empowerment scheme in Madhya Pradesh providing ₹1,250 every month via Direct Benefit Transfer to eligible women aged 21-60 alongside heavily subsidized ₹450 domestic gas cylinders.",
    description_kn: "ಮಧ್ಯಪ್ರದೇಶದ 21-60 ವರ್ಷದ ಮಹಿಳೆಯರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,250 ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಮತ್ತು ₹450 ಕ್ಕೆ ಅಡುಗೆ ಅನಿಲ ಸಿಲಿಂಡರ್ ಒದಗಿಸುವ ಪ್ರಮುಖ ಯೋಜನೆ.",
    description_hi: "मध्य प्रदेश में 21 से 60 वर्ष की विवाहित, विधवा व परित्यक्ता महिलाओं को प्रति माह ₹1,250 की सीधी बैंक सहायता एवं ₹450 में गैस सिलेंडर।",
    benefits: [
      "₹1,250 credited directly on the 10th of every month into beneficiary's bank account via Aadhaar DBT",
      "Subsidized domestic LPG gas cylinder refills at just ₹450 per cylinder",
      "Financial self-reliance and improved nutrition for over 1.29 crore women across MP"
    ],
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 60,
      gender: "Female",
      maxAnnualIncome: 250000,
      applicableStates: ["Madhya Pradesh"],
      allowedOccupations: ["Homemaker", "Self-employed", "Agricultural Laborer", "Daily Wage Earner", "Any"],
      rules: [
        "Beneficiary must be a resident of Madhya Pradesh (married, widowed, divorced, or abandoned woman)",
        "Combined family annual income must not exceed ₹2,50,000",
        "Family must own less than 5 acres of agricultural land and no four-wheeler vehicle (except tractor)"
      ]
    },
    requiredDocuments: [
      "Samagra Family ID and Individual Samagra ID",
      "Aadhaar Card with e-KYC completed on Samagra Portal",
      "Aadhaar-linked active Bank Account Passbook",
      "Active Mobile number linked to Aadhaar"
    ],
    applicationProcedure: {
      steps: [
        "Complete Samagra e-KYC via mobile OTP or nearest CSC / Gram Panchayat kiosk",
        "Visit designated Ladli Behna Camp organized at your Gram Panchayat or Ward Office",
        "Camp official enters Samagra ID and Aadhaar to pull verified demographic details",
        "Complete on-the-spot digital biometric photo capture and submit form without fee",
        "Receive printed acknowledgment receipt and start receiving ₹1,250 on the 10th of every month"
      ],
      onlineUrl: "https://cmladlibehna.mp.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://cmladlibehna.mp.gov.in",
    deadline: "Continuous Open Verification / Monthly DBT on 10th",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4780,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-seekho-kamao-mp",
    slug: "mukhyamantri-seekho-kamao-yojana-mp",
    name: "Mukhyamantri Seekho-Kamao Yojana (MMSKY)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಸೀಖೋ-ಕಮಾವೋ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री सीखो-कमाओ योजना",
    department: "Technical Education, Skill Development and Employment Department, MP",
    classification: "State",
    state: "Madhya Pradesh",
    category: "Employment Opportunities",
    beneficiaryCategory: "Youth",
    description: "Flagship learn-and-earn internship scheme in Madhya Pradesh offering modern industrial training across 700+ trades with guaranteed monthly stipends of ₹8,000 to ₹10,000 for youth aged 18-29.",
    description_kn: "ಮಧ್ಯಪ್ರದೇಶದ ಯುವಕರಿಗೆ 700 ಕ್ಕೂ ಹೆಚ್ಚು ಕೈಗಾರಿಕಾ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಉಚಿತ ತರಬೇತಿ ಮತ್ತು ತಿಂಗಳಿಗೆ ₹8,000 ದಿಂದ ₹10,000 ವರೆಗೆ ಸ್ಟೈಫಂಡ್ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "मध्य प्रदेश के 18 से 29 वर्ष के युवाओं को उद्योगों में व्यावसायिक कौशल प्रशिक्षण के साथ प्रतिमाह ₹8,000 से ₹10,000 का निश्चित स्टाइपेंड।",
    benefits: [
      "Monthly DBT stipend: ₹8,000 (12th Pass), ₹8,500 (ITI), ₹9,000 (Diploma), and ₹10,000 (Graduate/Postgraduate)",
      "75% of stipend funded by State Government, 25% paid directly by the partner industry",
      "SCVT/NCVT certified skill certificate recognized nationwide for permanent corporate hiring"
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 29,
      applicableStates: ["Madhya Pradesh"],
      allowedOccupations: ["Unemployed", "Student"],
      educationRequirements: "Class 12th Pass / ITI / Diploma / Any Graduate or PG Degree",
      rules: [
        "Applicant must be a permanent domicile resident of Madhya Pradesh",
        "Must have passed Class 12, ITI, Polytechnic Diploma, or Higher Degree",
        "Must not be currently engaged in full-time government or formal corporate employment"
      ]
    },
    requiredDocuments: [
      "Samagra ID and Aadhaar Card",
      "Educational Marksheet corresponding to highest qualification",
      "Madhya Pradesh Domicile Certificate",
      "Bank Account details linked with Aadhaar for DBT"
    ],
    applicationProcedure: {
      steps: [
        "Register on the MMSKY portal (mmsky.mp.gov.in) with Samagra ID",
        "Verify mobile via OTP and select desired technical training courses and districts",
        "Corporate enterprises review profiles and send electronic apprenticeship contracts",
        "Candidate accepts corporate training contract and joins the factory/office",
        "Monthly stipend credited automatically into student's Aadhaar-linked account"
      ],
      onlineUrl: "https://mmsky.mp.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://mmsky.mp.gov.in",
    deadline: "Rolling Industry Intake / Open Throughout 2026",
    lastUpdated: "2026-02-21",
    isVerified: true,
    isPublished: true,
    viewCount: 3410,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- BIHAR ---
  {
    id: "scheme-udyami-yojana-bihar",
    slug: "mukhyamantri-udyami-yojana-bihar",
    name: "Mukhyamantri Udyami Yojana (Bihar)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಉದ್ಯಮಿ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री उद्यमी योजना (बिहार)",
    department: "Department of Industries, Government of Bihar",
    classification: "State",
    state: "Bihar",
    category: "Employment Opportunities",
    beneficiaryCategory: "Youth",
    description: "Flagship industrial startup initiative in Bihar providing financial project support of ₹10,00,000 (50% grant/subsidy up to ₹5 Lakhs + 50% interest-free loan) to set up manufacturing and service units.",
    description_kn: "ಬಿಹಾರದಲ್ಲಿ ಹೊಸ ಉತ್ಪಾದನಾ ಮತ್ತು ಸೇವಾ ಉದ್ಯಮ ಆರಂಭಿಸಲು ಯುವಕರು ಮತ್ತು ಮಹಿಳೆಯರಿಗೆ ₹10 ಲಕ್ಷದ ಆರ್ಥಿಕ ನೆರವು (₹5 ಲಕ್ಷ ಅನುದಾನ + ₹5 ಲಕ್ಷ ಬಡ್ಡಿ ರಹಿತ ಸಾಲ) ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "बिहार में युवाओं एवं महिलाओं को नए उद्योग स्थापित करने हेतु ₹10 लाख की सहायता (₹5 लाख का अनुदान + ₹5 लाख का ब्याज-मुक्त ऋण)।",
    benefits: [
      "Total ₹10,00,000 project capital: ₹5,00,000 as 100% non-repayable government grant / subsidy",
      "Remaining ₹5,00,000 as interest-free soft loan (1% nominal interest for general youth) repayable in 84 easy EMIs",
      "₹25,000 dedicated post-selection training allowance with hands-on industrial guidance"
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 50,
      applicableStates: ["Bihar"],
      allowedOccupations: ["Unemployed", "Entrepreneur", "Artisan", "Any"],
      educationRequirements: "Intermediate (10+2) / ITI / Polytechnic Diploma or equivalent",
      rules: [
        "Applicant must be a permanent resident of Bihar",
        "Must be registered under one of the 5 categories: SC/ST, EBC, Mahila (Women), Yuva, or Minority Udyami",
        "Must have passed at least 10+2 or equivalent technical qualification"
      ]
    },
    requiredDocuments: [
      "Bihar Domicile / Residence Certificate",
      "Matriculation (10th) Certificate showing Date of Birth",
      "Intermediate / Polytechnic / ITI Marksheet",
      "Caste Certificate issued by Revenue Authority",
      "Current Account Bank Cheque / Passbook under enterprise/applicant name",
      "PAN Card and Aadhaar Card"
    ],
    applicationProcedure: {
      steps: [
        "Log in to the official portal (udyami.bihar.gov.in) during the annual application window",
        "Register with Aadhaar and select enterprise category (e.g., Food Processing, Textile, Engineering)",
        "Upload project proposal, educational marksheets, caste certificate, and bank details",
        "Transparent computerized random lottery selects shortlisted candidates",
        "Selected candidates undergo 2-week training at government institutions and receive funds in 3 project milestones"
      ],
      onlineUrl: "https://udyami.bihar.gov.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://udyami.bihar.gov.in",
    deadline: "Annual Application Window: 1st July to 31st August 2026",
    lastUpdated: "2026-02-17",
    isVerified: true,
    isPublished: true,
    viewCount: 4190,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-student-credit-card-bihar",
    slug: "bihar-student-credit-card-scheme-mnssby",
    name: "Bihar Student Credit Card Scheme (MNSSBY)",
    name_kn: "ಬಿಹಾರ್ ವಿದ್ಯಾರ್ಥಿ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಯೋಜನೆ",
    name_hi: "बिहार स्टूडेंट क्रेडिट कार्ड योजना (MNSSBY)",
    department: "Education Department & Bihar State Educational Finance Corporation",
    classification: "State",
    state: "Bihar",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "State-guaranteed education loan scheme in Bihar providing soft loans of up to ₹4,00,000 at nominal interest rates (1% for women, divyang, and transgender; 4% for others) with repayment deferred until course completion.",
    description_kn: "ಬಿಹಾರದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ದೇಶ-ವಿದೇಶಗಳಲ್ಲಿ ಉನ್ನತ ವ್ಯಾಸಂಗಕ್ಕಾಗಿ ಕೇವಲ ಶೇಕಡಾ 1 ರಿಂದ 4 ರ ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದಲ್ಲಿ ₹4 ಲಕ್ಷದವರೆಗೆ ಶಿಕ್ಷಣ ಸಾಲ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "बिहार के छात्र-छात्राओं को उच्च शिक्षा (सामान्य एवं व्यावसायिक) हेतु सरकार की गारंटी पर ₹4 लाख तक का रियायती शिक्षा ऋण (बालिकाओं हेतु मात्र 1%)।",
    benefits: [
      "Education loan of up to ₹4,00,000 with 100% State Government guarantee (no collateral required)",
      "Nominal 1% simple interest for female, transgender, and disabled students; 4% for male students",
      "Repayment moratorium: Repayment commences only 1 year after course completion or upon securing employment"
    ],
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 25,
      applicableStates: ["Bihar"],
      allowedOccupations: ["Student"],
      educationRequirements: "Class 12th Pass from recognized board in Bihar",
      rules: [
        "Applicant must be a permanent resident of Bihar",
        "Must have cleared Class 12 or equivalent exam from Bihar School Examination Board or CBSE/ICSE in Bihar",
        "Must be enrolled or admitted to an authorized NAAC / NBA / NIRF accredited higher educational institution"
      ]
    },
    requiredDocuments: [
      "Class 10th and 12th Marksheet and Pass Certificate",
      "Admission confirmation slip and College Fee Schedule",
      "Residence Certificate of Bihar",
      "Aadhaar Card and PAN Card of applicant and co-applicant (parent)",
      "Bank Account details of applicant and parents"
    ],
    applicationProcedure: {
      steps: [
        "Register on the 7 Nischay portal (7nishchay-yuvaupmission.bihar.gov.in)",
        "Fill student application form, course details, college fee breakdown, and parent details",
        "Visit your District Registration and Counseling Center (DRCC) with original documents",
        "DRCC verifies physical documents and issues acknowledgement slip",
        "Bihar State Educational Finance Corporation sanctions and disburses loan directly to college accounts"
      ],
      onlineUrl: "https://www.7nishchay-yuvaupmission.bihar.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://www.7nishchay-yuvaupmission.bihar.gov.in",
    deadline: "Open Year-Round prior to Course Enrollment / Active 2026",
    lastUpdated: "2026-02-25",
    isVerified: true,
    isPublished: true,
    viewCount: 3750,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- ODISHA ---
  {
    id: "scheme-subhadra-odisha",
    slug: "subhadra-yojana-odisha",
    name: "Subhadra Yojana (Odisha)",
    name_kn: "ಸುಭದ್ರಾ ಯೋಜನೆ (ಒಡಿಶಾ)",
    name_hi: "सुभद्रा योजना (ओडिशा)",
    department: "Women and Child Development Department, Government of Odisha",
    classification: "State",
    state: "Odisha",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Landmark women empowerment initiative in Odisha providing total financial assistance of ₹50,000 over 5 years (₹10,000 annually in two installments of ₹5,000 on Raksha Bandhan and International Women's Day) to women aged 21-60.",
    description_kn: "ಒಡಿಶಾದ 21-60 ವರ್ಷದ ಮಹಿಳೆಯರಿಗೆ 5 ವರ್ಷಗಳಲ್ಲಿ ಒಟ್ಟು ₹50,000 ನೇರ ಆರ್ಥಿಕ ನೆರವು (ವಾರ್ಷಿಕ ₹10,000) ನೀಡುವ ಪ್ರಮುಖ ಯೋಜನೆ.",
    description_hi: "ओडिशा में 21 से 60 वर्ष की महिलाओं को 5 वर्षों में कुल ₹50,000 (प्रति वर्ष ₹10,000 दो किस्तों में) की ऐतिहासिक वित्तीय सहायता।",
    benefits: [
      "Total ₹50,000 direct benefit transfer over 5 years directly into woman's Aadhaar bank account",
      "Annual assistance of ₹10,000 disbursed in two ₹5,000 tranches (on Raksha Bandhan and 8th March Women's Day)",
      "Subhadra Debit Cards issued with additional digital transaction cashback incentives"
    ],
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 60,
      gender: "Female",
      applicableStates: ["Odisha"],
      allowedOccupations: ["Homemaker", "Self-employed", "Agricultural Laborer", "Any"],
      rules: [
        "Beneficiary woman must be a resident of Odisha",
        "Must be covered under National Food Security Act (NFSA) or State Food Security Scheme (SFSS)",
        "Should not be an income tax payee or regular government employee"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card with linked active mobile number",
      "NFSA / SFSS Ration Card",
      "Single Bank Account seeded with Aadhaar and enabled for NPCI DBT"
    ],
    applicationProcedure: {
      steps: [
        "Obtain free physical form from Mo Seva Kendra, Anganwadi Center, or Block Development Office",
        "Fill in personal details, Aadhaar, and active single bank account information",
        "Submit filled application at nearest Mo Seva Kendra without any charge",
        "Digital scrutiny validates Aadhaar e-KYC and ration card family status",
        "Receive SMS approval and first installment of ₹5,000 directly via DBT"
      ],
      onlineUrl: "https://subhadra.odisha.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://subhadra.odisha.gov.in",
    deadline: "Continuous Open Enrollment via Mo Seva Kendras / Active 2026",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4560,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-cm-kisan-odisha",
    slug: "cm-kisan-odisha-scheme",
    name: "CM-KISAN Odisha (Formerly KALIA)",
    name_kn: "ಸಿಎಂ-ಕಿಸಾನ್ ಒಡಿಶಾ ಯೋಜನೆ",
    name_hi: "सीएम-किसान योजना (ओडिशा)",
    department: "Department of Agriculture & Farmers' Empowerment, Government of Odisha",
    classification: "State",
    state: "Odisha",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "Farmer and landless agricultural laborer income security scheme in Odisha providing ₹4,000 per year in two installments for farmers, and ₹12,500 comprehensive livelihood assistance for landless households.",
    description_kn: "ಒಡಿಶಾದ ಸಣ್ಣ ರೈತರಿಗೆ ವಾರ್ಷಿಕ ₹4,000 ಮತ್ತು ಭೂರಹಿತ ಕೃಷಿ ಕಾರ್ಮಿಕ ಕುಟುಂಬಗಳಿಗೆ ₹12,500 ರ ಜೀವನೋಪಾಯ ಸಹಾಯ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "ओडिशा में छोटे/सीमांत किसानों को ₹4,000 वार्षिक सहायता एवं भूमिहीन खेतिहर परिवारों को ₹12,500 की आजीविका सहायता राशि।",
    benefits: [
      "₹4,00,0 annual income support for small and marginal farmers disbursed on Akshaya Tritiya and Nuakhai festivals",
      "₹12,500 livelihood assistance in 3 installments for landless agricultural households for allied activities (goat rearing, dairy)",
      "Free crop loan interest subvention up to ₹1,00,000 at 0% interest"
    ],
    eligibilityCriteria: {
      minAge: 18,
      applicableStates: ["Odisha"],
      allowedOccupations: ["Farmer", "Agricultural Laborer", "Sharecropper"],
      rules: [
        "Small/marginal farmer holding cultivable land in Odisha or a resident landless agricultural laborer",
        "Beneficiary must not be an income tax payer or government employee"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card and active Mobile number",
      "Land Record RoR copy (for farmers)",
      "Aadhaar-seeded Bank Passbook"
    ],
    applicationProcedure: {
      steps: [
        "Check eligibility on CM-KISAN portal (kalia.odisha.gov.in) using Aadhaar number",
        "Submit fresh registration via online portal or at Gram Panchayat camp",
        "Agriculture Extension Officer verifies land records or landless status",
        "List vetted through Gram Sabha for transparent community approval",
        "Direct fund disbursement into verified DBT bank account"
      ],
      onlineUrl: "https://kalia.odisha.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://kalia.odisha.gov.in",
    deadline: "Bi-annual Installment Cutoffs: Akshaya Tritiya & Nuakhai 2026",
    lastUpdated: "2026-02-14",
    isVerified: true,
    isPublished: true,
    viewCount: 3290,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- PUNJAB ---
  {
    id: "scheme-crop-residue-management-pb",
    slug: "crop-residue-management-punjab",
    name: "Crop Residue Management (CRM) Agricultural Subsidy",
    name_kn: "ಬೆಳೆ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣಾ ಸಬ್ಸಿಡಿ (ಪಂಜಾಬ್)",
    name_hi: "फसल अवशेष प्रबंधन (CRM) कृषि यंत्र सब्सिडी योजना (पंजाब)",
    department: "Department of Agriculture and Farmers Welfare, Government of Punjab",
    classification: "State",
    state: "Punjab",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "Agricultural machinery subsidy in Punjab providing 50% subsidy to individual farmers and 80% subsidy to Custom Hiring Centers on modern stubble management machines (Happy Seeder, Super Seeder, Baler).",
    description_kn: "ಪಂಜಾಬ್ ರೈತರಿಗೆ ಸೂಪರ್ ಸೀಡರ್, ಹ್ಯಾಪಿ ಸೀಡರ್ ಮತ್ತು ಬೇಲರ್ ಕೃಷಿ ಯಂತ್ರಗಳ ಖರೀದಿಗೆ ಶೇಕಡಾ 50 ರಿಂದ 80 ರವರೆಗೆ ಸಹಾಯಧನ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "पंजाब में पराली प्रबंधन हेतु हैप्पी सीडर, सुपर सीडर व बेलर कृषि यंत्रों की खरीद पर किसानों को 50% एवं कस्टम हायरिंग केंद्रों को 80% सब्सिडी।",
    benefits: [
      "50% capital subsidy for individual farmers on approved in-situ stubble management machines",
      "80% capital subsidy for Farmers Producer Organizations (FPOs), Panchayats, and Primary Agricultural Cooperative Societies",
      "Eliminates stubble burning, preserves soil organic carbon, and reduces atmospheric smog"
    ],
    eligibilityCriteria: {
      minAge: 18,
      applicableStates: ["Punjab"],
      allowedOccupations: ["Farmer"],
      rules: [
        "Farmer must be an operational landholder in Punjab registered on the State Agri-DB portal",
        "Machinery must be purchased from state-empanelled manufacturers through digital quotation"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card and Voter Card",
      "Land ownership Farad / Jamabandi certificate",
      "Tractor Registration Certificate (RC) owned by applicant farmer",
      "Bank Account details and quotation from approved machinery manufacturer"
    ],
    applicationProcedure: {
      steps: [
        "Log on to the Punjab Agriculture portal (agrimachinerypb.com)",
        "Register with Aadhaar and enter tractor registration and landholding details",
        "Select machinery type (e.g., Surface Seeder, Super Seeder, Straw Management System)",
        "District level committee issues digital sanction token",
        "Purchase machine, undergo physical GPS verification by agriculture inspector, and receive subsidy directly in bank"
      ],
      onlineUrl: "https://agripunjab.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://agripunjab.gov.in",
    deadline: "Pre-Harvest Window Closes: 15th August 2026",
    lastUpdated: "2026-02-12",
    isVerified: true,
    isPublished: true,
    viewCount: 2680,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- HARYANA ---
  {
    id: "scheme-mmpsy-haryana",
    slug: "mukhyamantri-parivar-samridhi-yojana-haryana",
    name: "Mukhyamantri Parivar Samridhi Yojana (MMPSY)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಪರಿವಾರ ಸಮೃದ್ಧಿ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री परिवार समृद्धि योजना (MMPSY)",
    department: "Citizen Resources Information Department (CRID), Government of Haryana",
    classification: "State",
    state: "Haryana",
    category: "Financial Assistance",
    beneficiaryCategory: "General",
    description: "Umbrella social security scheme in Haryana providing ₹6,000 annual financial aid to vulnerable families earning up to ₹1,80,000 to cover life insurance, accident cover, and farmer/unorganized pensions.",
    description_kn: "ಹರಿಯಾಣದ ಬಡ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕ ₹6,000 ಆರ್ಥಿಕ ನೆರವು ನೀಡಿ ಸಾಮಾಜಿಕ ಭದ್ರತೆ, ಪಿಂಚಣಿ ಮತ್ತು ವಿಮಾ ರಕ್ಷಣೆ ಒದಗಿಸುವ ಪ್ರಮುಖ ಯೋಜನೆ.",
    description_hi: "हरियाणा में ₹1.80 लाख तक वार्षिक आय वाले परिवारों को ₹6,000 की वार्षिक वित्तीय सहायता एवं जीवन ज्योति, सुरक्षा बीमा व पेंशन कवरेज।",
    benefits: [
      "Annual financial assistance of ₹6,000 credited directly into the family head's bank account",
      "State government covers 100% premiums for PMJJBY (life insurance), PMSBY (accident insurance), and PM-KMY (farmer pension)",
      "Zero paperwork: Automatic income and entitlement mapping via Parivar Pehchan Patra (PPP)"
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 60,
      maxAnnualIncome: 180000,
      applicableStates: ["Haryana"],
      rules: [
        "Family must be registered on the Haryana Parivar Pehchan Patra (PPP) Family ID portal",
        "Verified family annual income must not exceed ₹1,80,000 and agricultural land under 5 acres"
      ]
    },
    requiredDocuments: [
      "Parivar Pehchan Patra (PPP) Family ID Card",
      "Aadhaar Card of all family members",
      "Bank Account details seeded with Aadhaar"
    ],
    applicationProcedure: {
      steps: [
        "Check Family ID verification status on the official SARAL Haryana portal",
        "Apply online via SARAL portal or visit nearest Atal Seva Kendra (CSC)",
        "Select desired social security coverage options (pension, insurance, or direct cash)",
        "Submit declaration and authenticate via mobile OTP",
        "Funds and insurance policy bonds issued directly via state treasury integration"
      ],
      onlineUrl: "https://cm-psy.haryana.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://cm-psy.haryana.gov.in",
    deadline: "Continuous Open Enrollment via Parivar Pehchan Patra (PPP)",
    lastUpdated: "2026-02-28",
    isVerified: true,
    isPublished: true,
    viewCount: 3120,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- ASSAM ---
  {
    id: "scheme-orunodoi-assam",
    slug: "orunodoi-scheme-assam",
    name: "Orunodoi 3.0 Scheme",
    name_kn: "ಒರುಣೋದೋಯ್ 3.0 ಯೋಜನೆ",
    name_hi: "ओरुनोदोई 3.0 योजना (असम)",
    department: "Finance Department, Government of Assam",
    classification: "State",
    state: "Assam",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Flagship direct benefit transfer program in Assam depositing ₹1,250 every month into the bank accounts of over 27 lakh women from underprivileged households for nutritional and healthcare needs.",
    description_kn: "ಅಸ್ಸಾಂನ ಬಡ ಕುಟುಂಬಗಳ ಮಹಿಳಾ ಮುಖ್ಯಸ್ಥೆಯರ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಹಾರ ಮತ್ತು ಆರೋಗ್ಯ ರಕ್ಷಣೆಗಾಗಿ ಪ್ರತಿ ತಿಂಗಳು ₹1,250 ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "असम में गरीब परिवारों की महिला मुखियाओं को प्रतिमाह ₹1,250 की सीधी बैंक सहायता देने वाली ऐतिहासिक पोषण एवं सामाजिक सुरक्षा योजना।",
    benefits: [
      "₹1,250 credited directly on the 10th of every month into beneficiary's bank account",
      "Designated for food items, medicines, and nutritional pulses/sugar",
      "Priority inclusion for households with widows, divyang members, and unmarried women above 35"
    ],
    eligibilityCriteria: {
      gender: "Female",
      maxAnnualIncome: 200000,
      applicableStates: ["Assam"],
      allowedOccupations: ["Homemaker", "Self-employed", "Agricultural Laborer", "Any"],
      rules: [
        "Beneficiary woman must be a permanent resident of Assam",
        "Combined family annual income must not exceed ₹2,00,000",
        "Beneficiary must hold an individual bank account in her name"
      ]
    },
    requiredDocuments: [
      "Ration Card of Assam",
      "Aadhaar Card and Voter Card",
      "Income Certificate from Gaon Pradhan / Circle Officer",
      "Bank Passbook showing active single account"
    ],
    applicationProcedure: {
      steps: [
        "Collect application form during Orunodoi outreach camps in your Gaon Panchayat / Ward",
        "Fill out form and submit supporting documents to Gaon Panchayat secretary",
        "District Level Monitoring Committee (DLMC) validates and verifies house-to-house data",
        "Final beneficiary list approved and uploaded on the Orunodoi portal",
        "Monthly DBT of ₹1,250 begins directly from the State Treasury"
      ],
      onlineUrl: "https://orunodoi.assam.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://orunodoi.assam.gov.in",
    deadline: "Continuous Open Enrollment / Monthly 10th DBT",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 3840,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-cmaaa-assam",
    slug: "mukhya-mantri-atmanirbhar-asom-abhijan",
    name: "Mukhya Mantri Atmanirbhar Asom Abhijan (CMAAA)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಆತ್ಮನಿರ್ಭರ ಅಸೋಮ್ ಅಭಿಯಾನ",
    name_hi: "मुख्यमंत्री आत्मनिर्भर असम अभियान (CMAAA)",
    department: "Industries, Commerce and Public Enterprises Department, Assam",
    classification: "State",
    state: "Assam",
    category: "Employment Opportunities",
    beneficiaryCategory: "Youth",
    description: "Self-reliance entrepreneurship program in Assam granting financial aid of ₹2,00,000 (₹1 Lakh grant + ₹1 Lakh interest-free loan) to youth, and up to ₹5,00,000 for professional degree holders to set up micro-enterprises.",
    description_kn: "ಅಸ್ಸಾಂನ ನಿರುದ್ಯೋಗಿ ಯುವಕರಿಗೆ ಕಿರು ಉದ್ಯಮ ಆರಂಭಿಸಲು ₹2 ಲಕ್ಷದಿಂದ ₹5 ಲಕ್ಷದವರೆಗೆ (ಶೇ. 50 ಅನುದಾನ + ಶೇ. 50 ಬಡ್ಡಿ ರಹಿತ ಸಾಲ) ನೆರವು ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "असम के 2 लाख युवाओं को स्वरोजगार हेतु ₹2 लाख (₹1 लाख अनुदान + ₹1 लाख ब्याज-मुक्त ऋण) एवं प्रोफेशनल्स को ₹5 लाख की वित्तीय पैकेज सहायता।",
    benefits: [
      "₹2,00,000 financial assistance for 10+2/ITI/Diploma youth (₹1 Lakh government grant + ₹1 Lakh 0% interest loan)",
      "₹5,00,000 financial package for professional graduates (Engineers, Doctors, Agronomists)",
      "1-month free residential entrepreneurship and management training with daily stipend"
    ],
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 40,
      applicableStates: ["Assam"],
      allowedOccupations: ["Unemployed", "Entrepreneur"],
      educationRequirements: "Class 10th / 10+2 / ITI / Diploma / Degree",
      rules: [
        "Applicant must be a permanent resident of Assam registered on the Employment Exchange portal",
        "Must possess an active bank account opened prior to 1st April 2023",
        "Should not have defaulted on any nationalized bank loans"
      ]
    },
    requiredDocuments: [
      "Assam Employment Exchange Registration Card",
      "Educational Qualification Certificates and Marksheets",
      "Aadhaar Card and PAN Card",
      "Detailed Project Report (DPR) / Business Concept Plan",
      "Bank Account Passbook"
    ],
    applicationProcedure: {
      steps: [
        "Register on the CMAAA portal (cmaaa.assam.gov.in) with Employment Exchange card number",
        "Fill business domain (agriculture, packaging, retail, services) and upload project concept",
        "District Level Task Force Committee (DLTFC) reviews and shortlists proposals",
        "Attend mandatory skill and business management training at designated ITI/Polytechnic",
        "Funds disbursed in 2 installments upon physical verification of enterprise setup"
      ],
      onlineUrl: "https://cmaaa.assam.gov.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://cmaaa.assam.gov.in",
    deadline: "Annual Cohort Intake Closes: 30th September 2026",
    lastUpdated: "2026-02-19",
    isVerified: true,
    isPublished: true,
    viewCount: 3050,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- DELHI ---
  {
    id: "scheme-mahila-samman-delhi",
    slug: "mukhyamantri-mahila-samman-yojana-delhi",
    name: "Mukhyamantri Mahila Samman Yojana (Delhi)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಮಹಿಳಾ ಸಮ್ಮಾನ್ ಯೋಜನೆ (ದೆಹಲಿ)",
    name_hi: "मुख्यमंत्री महिला सम्मान योजना (दिल्ली)",
    department: "Department of Women and Child Development, Government of NCT of Delhi",
    classification: "State",
    state: "Delhi",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Empowerment scheme in Delhi providing ₹1,000 every month directly to all adult women aged 18 and above who are not income tax payers or government pensioners.",
    description_kn: "ದೆಹಲಿಯ 18 ವರ್ಷ ಮೇಲ್ಪಟ್ಟ ಎಲ್ಲಾ ಅರ್ಹ ಮಹಿಳೆಯರಿಗೆ ತಿಂಗಳಿಗೆ ₹1,000 ಆರ್ಥಿಕ ಗೌರವ ಧನ ನೀಡುವ ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಯೋಜನೆ.",
    description_hi: "दिल्ली की 18 वर्ष से अधिक आयु की सभी गैर-करदाता महिलाओं को प्रति माह ₹1,000 की सम्मानजनक सीधी बैंक सहायता।",
    benefits: [
      "₹1,000 deposited monthly directly via DBT into beneficiary's verified bank account",
      "Unrestricted financial freedom to meet personal expenses and health requirements",
      "Digital online enrollment and door-to-door verification"
    ],
    eligibilityCriteria: {
      minAge: 18,
      gender: "Female",
      applicableStates: ["Delhi"],
      allowedOccupations: ["Homemaker", "Student", "Self-employed", "Daily Wage Earner", "Any"],
      rules: [
        "Beneficiary woman must be a registered voter of the National Capital Territory of Delhi",
        "Must be aged 18 years or above",
        "Must not be an income tax payer, government employee, or recipient of other government monthly pensions"
      ]
    },
    requiredDocuments: [
      "Delhi Voter Identity Card (EPIC) proving Delhi residency",
      "Aadhaar Card of the woman applicant",
      "Bank Account details linked to Aadhaar",
      "Self-declaration certificate stating non-taxpayer status"
    ],
    applicationProcedure: {
      steps: [
        "Visit the official portal or designated registration centers in your constituency",
        "Enter Delhi Voter ID number and Aadhaar number for demographic validation",
        "Upload self-declaration form and Aadhaar-seeded bank account details",
        "Sub-Divisional Magistrate (SDM) team validates non-taxpayer status",
        "Approval issued and monthly ₹1,000 disbursement begins via PFMS DBT"
      ],
      onlineUrl: "https://wcd.delhi.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://wcd.delhi.gov.in",
    deadline: "Open Rolling Registration Window 2026",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4210,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-jai-bhim-delhi",
    slug: "jai-bhim-mukhyamantri-pratibha-vikas-delhi",
    name: "Jai Bhim Mukhyamantri Pratibha Vikas Yojana",
    name_kn: "ಜೈ ಭೀಮ್ ಮುಖ್ಯಮಂತ್ರಿ ಪ್ರತಿಭಾ ವಿಕಾಸ್ ಯೋಜನೆ",
    name_hi: "जय भीम मुख्यमंत्री प्रतिभा विकास योजना",
    department: "SC/ST/OBC/Minority Welfare Department, Government of NCT of Delhi",
    classification: "State",
    state: "Delhi",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Premier competitive examination coaching scheme in Delhi providing 100% free coaching in top private institutes for UPSC, JEE, NEET, CLAT, Banking, and SSC along with ₹2,500 monthly stipend.",
    description_kn: "ದೆಹಲಿಯ ಪ್ರತಿಭಾವಂತ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯುಪಿಎಸ್‌ಸಿ, ನೀಟ್, ಜೆಇಇ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಿಗೆ ಉಚಿತ ಕೋಚಿಂಗ್ ಮತ್ತು ತಿಂಗಳಿಗೆ ₹2,500 ಸ್ಟೈಫಂಡ್ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "दिल्ली के आरक्षित एवं ईडब्ल्यूएस वर्ग के मेधावी छात्रों को यूपीएससी, जेईई, नीट, क्लैट आदि के लिए नामी संस्थानों में निःशुल्क कोचिंग व ₹2,500 मासिक स्टाइपेंड।",
    benefits: [
      "100% free professional coaching at reputed empanelled coaching institutes for up to 1 year",
      "Monthly stipend of ₹2,500 deposited directly into student's bank account for books and travel",
      "Covers Civil Services (UPSC), Engineering (JEE), Medical (NEET), Law (CLAT), Banking, and Defense"
    ],
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 30,
      maxAnnualIncome: 800000,
      applicableStates: ["Delhi"],
      allowedOccupations: ["Student"],
      educationRequirements: "Class 10th and 12th passed from schools in Delhi",
      rules: [
        "Student must be a resident of Delhi belonging to SC, ST, OBC, or EWS categories",
        "Must have passed Class 10 and 12 from recognized schools located in Delhi",
        "Annual family income must not exceed ₹8,00,000 (Full 100% fees paid for income under ₹2.5 Lakhs; 75% for income between ₹2.5 - ₹8 Lakhs)"
      ]
    },
    requiredDocuments: [
      "Class 10 and 12 Marksheets and Certificates",
      "Caste Certificate (SC/ST/OBC) or EWS Certificate issued by Delhi Revenue Dept",
      "Income Certificate from Delhi Tahsildar / SDM",
      "Aadhaar Card and Student Bank Passbook",
      "Proof of admission or coaching institute selection slip"
    ],
    applicationProcedure: {
      steps: [
        "Take admission test at any of the Delhi-empanelled coaching institutes",
        "Upon securing admission, fill Jai Bhim Pratibha Vikas application form at the institute or online portal",
        "Attach caste, income, and educational certificates for department verification",
        "Department sanctions tuition fees directly to the coaching institute",
        "Student attends daily classes and receives ₹2,500 monthly stipend via DBT"
      ],
      onlineUrl: "https://scstwelfare.delhi.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://scstwelfare.delhi.gov.in",
    deadline: "Annual Coaching Batch Cutoff: 31st August 2026",
    lastUpdated: "2026-02-15",
    isVerified: true,
    isPublished: true,
    viewCount: 3180,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- CENTRAL GOVERNMENT FLAGSHIPS (Adding PMAY 2.0 & PM Vishwakarma) ---
  {
    id: "scheme-pmay-urban-gramin",
    slug: "pradhan-mantri-awas-yojana",
    name: "Pradhan Mantri Awas Yojana (PMAY Urban 2.0 & Gramin)",
    name_kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ",
    name_hi: "प्रधानमंत्री आवास योजना (PMAY 2.0)",
    department: "Ministry of Housing and Urban Affairs / Ministry of Rural Development, Govt of India",
    classification: "Central",
    state: "All India",
    category: "Financial Assistance",
    beneficiaryCategory: "General",
    description: "Flagship Central Government mission ensuring 'Housing for All' across India, providing direct construction subsidies of ₹1,20,000 to ₹1,30,000 for rural homes and interest subventions up to ₹2,50,000 on home loans for urban families.",
    description_kn: "ಭಾರತದ ಎಲ್ಲಾ ಬಡ ಕುಟುಂಬಗಳಿಗೆ ಸ್ವಂತ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಿಸಿಕೊಳ್ಳಲು ಕೇಂದ್ರ ಸರ್ಕಾರದಿಂದ ₹1,30,000 ದಿಂದ ₹2,50,000 ವರೆಗೆ ಸಹಾಯಧನ ನೀಡುವ ಪ್ರಮುಖ ವಸತಿ ಯೋಜನೆ.",
    description_hi: "देश के सभी बेघर और कच्चे घरों में रहने वाले परिवारों को पक्का मकान बनाने हेतु ₹1.30 लाख से ₹2.50 लाख तक की केंद्रीय वित्तीय एवं ब्याज सब्सिडी।",
    benefits: [
      "PMAY-Gramin: Direct financial assistance of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult regions, plus 90-95 days of MGNREGA wages",
      "PMAY-Urban 2.0: Interest subsidy of 4% on home loans up to ₹25 Lakhs for EWS/LIG/MIG households",
      "Mandatory inclusion of clean piped water, electricity connection under Saubhagya, and clean cooking gas under Ujjwala"
    ],
    eligibilityCriteria: {
      maxAnnualIncome: 900000,
      gender: "All",
      applicableStates: ["All India"],
      rules: [
        "Beneficiary family should not own a permanent pucca house anywhere in India",
        "Must be listed in SECC 2011 / Awas+ surveyed beneficiary waiting list (Gramin)",
        "House must be registered in the name of the female head or jointly with spouse"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card of all family members",
      "MGNREGA Job Card (for PMAY-G)",
      "Bank Account details seeded with Aadhaar and mobile",
      "Land Ownership Document or Land Allotment Patta",
      "Income Certificate and Non-possession of pucca house affidavit"
    ],
    applicationProcedure: {
      steps: [
        "For Rural (Gramin): Gram Sabha validates eligible households based on Awas+ geo-tagged surveys",
        "For Urban: Apply online via the official PMAY 2.0 portal or nearest Common Service Center (CSC)",
        "Upload land documents, Aadhaar details, and applicant photo",
        "Geotagged photographic verification conducted at foundation, lintel, and roof levels",
        "Financial subsidy released in 3-4 progress-based direct installments to bank account"
      ],
      onlineUrl: "https://pmaymis.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://pmaymis.gov.in",
    deadline: "PMAY 2.0 Active Nationwide Mission: 2024-2029",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4620,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-pm-vishwakarma",
    slug: "pm-vishwakarma-yojana-central",
    name: "PM Vishwakarma Yojana",
    name_kn: "ಪಿಎಂ ವಿಶ್ವಕರ್ಮ ಯೋಜನೆ",
    name_hi: "पीएम विश्वकर्मा योजना",
    department: "Ministry of Micro, Small and Medium Enterprises, Government of India",
    classification: "Central",
    state: "All India",
    category: "Employment Opportunities",
    beneficiaryCategory: "Artisans",
    description: "Central Government scheme providing end-to-end holistic support to traditional artisans and craftspeople across 18 trades, offering PM Vishwakarma certification, modern toolkits worth ₹15,000, and collateral-free enterprise loans up to ₹3,00,000 at 5% interest.",
    description_kn: "ಭಾರತದ 18 ಸಾಂಪ್ರದಾಯಿಕ ಕುಶಲಕರ್ಮಿಗಳು ಮತ್ತು ಕುಶಲ ಕೆಲಸಗಾರರಿಗೆ ಗುರುತಿನ ಚೀಟಿ, ₹15,000 ಮೌಲ್ಯದ ಉಚಿತ ಟೂಲ್‌ಕಿಟ್ ಮತ್ತು ಶೇ. 5 ರ ರಿಯಾಯಿತಿ ಬಡ್ಡಿಯಲ್ಲಿ ₹3 ಲಕ್ಷ ಸಾಲ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "देश के 18 पारंपरिक शिल्पकलाओं से जुड़े कारीगरों को पहचान पत्र, ₹15,000 का निःशुल्क टूलकिट और 5% रियायती ब्याज पर ₹3 लाख तक का संपार्श्विक-मुक्त ऋण।",
    benefits: [
      "PM Vishwakarma Certificate and Digital ID Card granting official artisan recognition",
      "Free 5-7 days basic skill training with daily stipend of ₹500",
      "₹15,000 free e-voucher grant for purchasing modern advanced trade toolkits",
      "Collateral-free enterprise credit: 1st tranche of ₹1,00,000 (18 months) and 2nd tranche of ₹2,00,000 (30 months) at 5% subsidized interest rate",
      "Digital transaction incentives of ₹1 per transaction for up to 100 transactions monthly"
    ],
    eligibilityCriteria: {
      minAge: 18,
      applicableStates: ["All India"],
      allowedOccupations: ["Artisan", "Carpenter", "Boat Maker", "Armourer", "Blacksmith", "Hammer and Tool Kit Maker", "Locksmith", "Sculptor", "Goldsmith", "Potter", "Cobbler", "Mason", "Basket Maker", "Doll & Toy Maker", "Barber", "Garland Maker", "Washerman", "Tailor", "Fishing Net Maker"],
      rules: [
        "Artisan or craftsperson working with hands and tools in one of the 18 specified traditional trades",
        "Must be engaged in the trade on the date of application and not availed credit under PMEGP/Mudra in past 5 years",
        "Only one member of the family is eligible for benefits"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card and active Mobile number",
      "Bank Account details seeded with Aadhaar",
      "Ration Card or Family details",
      "Skill Trade Verification from Gram Panchayat Head or Urban Local Body"
    ],
    applicationProcedure: {
      steps: [
        "Visit nearest Common Services Center (CSC) with Aadhaar and mobile",
        "Complete biometric authentication and submit application for your trade",
        "Stage 1: Gram Panchayat / Urban Local Body executes local trade verification",
        "Stage 2: District Implementation Committee screens and recommends dossier",
        "Stage 3: National Screening Committee sanctions certificate, ₹15,000 toolkit voucher, and bank loan access"
      ],
      onlineUrl: "https://pmvishwakarma.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://pmvishwakarma.gov.in",
    deadline: "Continuous Rolling Enrollment across all CSCs nationwide",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4380,
    sourceVerificationStatus: "Official Government Verified"
  }
];

const allCombinedSchemes = [...updatedExistingSchemes, ...newSchemes];
existingDb.schemes = allCombinedSchemes;

fs.writeFileSync('janaseva_db.json', JSON.stringify(existingDb, null, 2), 'utf-8');
console.log(`Successfully updated janaseva_db.json! Total schemes: ${allCombinedSchemes.length}`);
