import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User, Scheme, SavedScheme, ApplicationRecord,
  EligibilityAssessment, SavedEligibilityRecord, AppNotification, AdminActivityLog,
  DocumentItem, UserSession
} from '../types.js';
import { ALL_VERIFIED_SCHEMES } from './schemesData.js';

interface DatabaseSchema {
  users: User[];
  schemes: Scheme[];
  savedSchemes: SavedScheme[];
  applications: ApplicationRecord[];
  assessments: EligibilityAssessment[];
  savedEligibilityRecords: SavedEligibilityRecord[];
  notifications: AppNotification[];
  logs: AdminActivityLog[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'janaseva_db.json');

const INITIAL_SCHEMES: Scheme[] = [
  {
    id: "scheme-gruha-lakshmi",
    slug: "gruha-lakshmi-yojana",
    name: "Gruha Lakshmi Yojana",
    name_kn: "ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ",
    name_hi: "गृह लक्ष्मी योजना",
    department: "Department of Women and Child Development",
    classification: "State",
    state: "Karnataka",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Financial assistance program providing ₹2,000 per month to the woman head of household in eligible families across Karnataka.",
    description_kn: "ಕರ್ನಾಟಕದ ಅರ್ಹ ಕುಟುಂಬಗಳಲ್ಲಿ ಕುಟುಂಬದ ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹2,000 ಆರ್ಥಿಕ ನೆರವು ಒದಗಿಸುವ ಪ್ರಮುಖ ಯೋಜನೆ.",
    description_hi: "कर्नाटक में पात्र परिवारों की महिला मुखिया को प्रति माह ₹2,000 की वित्तीय सहायता प्रदान करने वाली प्रमुख योजना।",
    benefits: [
      "₹2,000 deposited monthly directly via DBT into woman head's Aadhaar-seeded bank account",
      "Economic empowerment and financial independence for rural and urban women",
      "Zero registration charges at Grama One, Karnataka One, and Bapuji Seva Kendra"
    ],
    eligibilityCriteria: {
      minAge: 18,
      gender: "Female",
      applicableStates: ["Karnataka"],
      rules: [
        "Applicant must be the designated female head of family listed on Antyodaya, BPL, or APL ration cards",
        "Neither the applicant woman nor her spouse should be income tax or GST payers",
        "Only one woman per household is eligible for benefit disbursement"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card of the woman applicant and spouse",
      "Ration Card (APL / BPL / Antyodaya Card number)",
      "Bank Passbook seeded with Aadhaar for Direct Benefit Transfer",
      "Active Mobile number linked to Aadhaar"
    ],
    applicationProcedure: {
      steps: [
        "Verify your mobile number linked with Aadhaar at UIDAI portal",
        "Visit nearest Grama One, Karnataka One, or Bangalore One center with original documents",
        "Provide your ration card number for family member authentication",
        "Complete biometric e-KYC or OTP verification",
        "Collect the computer-generated acknowledgment slip with reference number"
      ],
      onlineUrl: "https://sevasindhugs.karnataka.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://sevasindhugs.karnataka.gov.in",
    deadline: "Active - Open Year-Round / Monthly DBT on 20th",
    lastUpdated: "2026-02-15",
    isVerified: true,
    isPublished: true,
    viewCount: 1420,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-shakti-karnataka",
    slug: "shakti-scheme-karnataka",
    name: "Shakti Scheme",
    name_kn: "ಶಕ್ತಿ ಯೋಜನೆ",
    name_hi: "शक्ति योजना",
    department: "Transport Department, Government of Karnataka",
    classification: "State",
    state: "Karnataka",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Provides free public bus transport for all women and transgender citizens domiciled in Karnataka across state-owned road transport corporations.",
    description_kn: "ಕರ್ನಾಟಕದ ಮಹಿಳೆಯರು ಮತ್ತು ಲಿಂಗತ್ವ ಅಲ್ಪಸಂಖ್ಯಾತರಿಗೆ ರಾಜ್ಯ ರಸ್ತೆ ಸಾರಿಗೆ ಸಂಸ್ಥೆಯ ಬಸ್‌ಗಳಲ್ಲಿ ಉಚಿತ ಪ್ರಯಾಣ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "कर्नाटक में रहने वाली सभी महिलाओं और ट्रांसजेंडर नागरिकों के लिए राज्य सड़क परिवहन निगम की बसों में मुफ्त यात्रा।",
    benefits: [
      "100% fare exemption on ordinary, city, express, and suburban government buses",
      "Applicable across KSRTC, BMTC, NWKRTC, and KKRTC within Karnataka borders",
      "No restriction on number of journeys or educational/work purposes"
    ],
    eligibilityCriteria: {
      minAge: 5,
      gender: "Female",
      applicableStates: ["Karnataka"],
      rules: [
        "Beneficiary must be a resident of Karnataka State",
        "Valid government photo ID with Karnataka address is required during transit"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card or Voter ID / Driving License / Karnataka Residential Certificate"
    ],
    applicationProcedure: {
      steps: [
        "Board any ordinary or express service of KSRTC/BMTC/NWKRTC/KKRTC within Karnataka",
        "Show original government photo identity card proving Karnataka domicile to the bus conductor",
        "Receive a zero-fare ticket printed instantly via electronic ticketing machine"
      ],
      onlineUrl: "https://sevasindhu.karnataka.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://transport.karnataka.gov.in",
    deadline: "Permanent Active Scheme / No Deadline",
    lastUpdated: "2026-01-20",
    isVerified: true,
    isPublished: true,
    viewCount: 1890,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-karnataka-ssp",
    slug: "karnataka-state-scholarship-portal-ssp",
    name: "Karnataka SSP Post-Matric Scholarship",
    name_kn: "ಕರ್ನಾಟಕ ಎಸ್‌ಎಸ್‌ಪಿ ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ",
    name_hi: "कर्नाटक एसएसपी पोस्ट-मैट्रिक छात्रवृत्ति",
    department: "Social Welfare & Higher Education Departments",
    classification: "State",
    state: "Karnataka",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Integrated single-window scholarship portal for SC, ST, OBC, and minority students pursuing PUC, Diploma, ITI, Undergraduate, and Postgraduate studies.",
    description_kn: "ಪಿಯುಸಿ, ಡಿಪ್ಲೊಮಾ, ಪದವಿ ಮತ್ತು ಸ್ನಾತಕೋತ್ತರ ವ್ಯಾಸಂಗ ಮಾಡುತ್ತಿರುವ ಪರಿಶಿಷ್ಟ ಜಾತಿ, ಪರಿಶಿಷ್ಟ ಪಂಗಡ, ಹಿಂದುಳಿದ ವರ್ಗಗಳ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಏಕಗವಾಕ್ಷಿ ವಿದ್ಯಾರ್ಥಿವೇತನ.",
    description_hi: "कर्नाटक में उच्च शिक्षा, तकनीकी और व्यावसायिक डिग्री हासिल करने वाले एससी, एसटी, ओबीसी और अल्पसंख्यक छात्रों के लिए समेकित छात्रवृत्ति।",
    benefits: [
      "Tuition fee reimbursement, maintenance allowance, and hostel fee concession",
      "Direct Benefit Transfer into verified student Aadhaar-linked accounts",
      "Automated e-Attestation and verification with Kutumba database"
    ],
    eligibilityCriteria: {
      minAge: 15,
      maxAge: 35,
      maxAnnualIncome: 250000,
      applicableStates: ["Karnataka"],
      allowedOccupations: ["Student"],
      educationRequirements: "Pursuing Post-Matric Studies (PUC / Degree / Engineering / Medicine / Diploma)",
      rules: [
        "Student must be admitted in a recognized university or collegiate institution in Karnataka",
        "Family annual income must not exceed ₹2.5 Lakhs (varies up to ₹8 Lakhs for certain categories)",
        "Minimum 50% attendance record in ongoing semester"
      ]
    },
    requiredDocuments: [
      "Student Aadhaar Card & Kutumba ID",
      "Current College Student Admission/Registration Number (SATS / Registration ID)",
      "Income & Caste Certificate with RD Number issued by Revenue Department",
      "Hostel stay certificate (if applicable)",
      "Fee receipt and SSLC marks card"
    ],
    applicationProcedure: {
      steps: [
        "Create an account on SSP Portal using Student Aadhaar and mobile number",
        "Fetch e-Attested document numbers via RD number validation",
        "Select your college, university, and current academic discipline",
        "Submit online application and download the submission receipt for institutional endorsement"
      ],
      onlineUrl: "https://ssp.postmatric.karnataka.gov.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://ssp.postmatric.karnataka.gov.in",
    deadline: "Annual Academic Cycle: 31st December 2026",
    lastUpdated: "2026-02-10",
    isVerified: true,
    isPublished: true,
    viewCount: 2310,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-national-scholarship-portal",
    slug: "national-scholarship-portal-nsp",
    name: "National Scholarship Portal (Central Sector)",
    name_kn: "ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್ ಯೋಜನೆಗಳು",
    name_hi: "राष्ट्रीय छात्रवृत्ति पोर्टल (केंद्रीय योजनाएं)",
    department: "Ministry of Education & Ministry of Minority Affairs",
    classification: "Central",
    state: "All India",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Centrally sponsored scholarship platform offering financial grants for meritorious and economically weaker students from school level to doctoral degrees.",
    description_kn: "ಶಾಲಾ ಹಂತದಿಂದ ಸಂಶೋಧನಾ ಪದವಿಯವರೆಗೆ ಅರ್ಹ ಮತ್ತು ಆರ್ಥಿಕವಾಗಿ ಹಿಂದುಳಿದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕೇಂದ್ರ ಸರ್ಕಾರದ ಆರ್ಥಿಕ ಅನುದಾನ.",
    description_hi: "मेधावी और वंचित पृष्ठभूमि के छात्रों के लिए कक्षा 1 से लेकर उच्च शिक्षा और अनुसंधान तक के लिए केंद्रीय छात्रवृत्तियां।",
    benefits: [
      "Annual scholarship grant ranging from ₹10,000 to ₹50,000 per academic year",
      "Covers merit-cum-means, top class education, and post-matric fellowships",
      "Disbursement through National Payment Corporation of India (NPCI) gateway"
    ],
    eligibilityCriteria: {
      minAge: 14,
      maxAge: 30,
      maxAnnualIncome: 450000,
      allowedOccupations: ["Student"],
      educationRequirements: "Class 11 to PG / Ph.D.",
      rules: [
        "Candidate must have scored at least 60% in the previous qualifying examination",
        "Applicant should not be receiving any other government scholarship"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card / Aadhaar Enrolment Slip",
      "Bank Passbook with IFSC code (Aadhaar active)",
      "Previous year academic marksheet",
      "Income certificate from competent revenue authority",
      "Bonafide student certificate from current educational institute"
    ],
    applicationProcedure: {
      steps: [
        "Register with One-Time Registration (OTR) on scholarships.gov.in using Aadhaar Face RD or OTP",
        "Fill student educational qualifications and select eligible central schemes",
        "Upload bonafide certificate verified by college Nodal Officer",
        "Track verification through Institute, District, and State Nodal officers online"
      ],
      onlineUrl: "https://scholarships.gov.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://scholarships.gov.in",
    deadline: "Pre-Matric: 30 Nov 2026 | Post-Matric: 31 Dec 2026",
    lastUpdated: "2026-01-30",
    isVerified: true,
    isPublished: true,
    viewCount: 1670,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-pm-kisan",
    slug: "pm-kisan-samman-nidhi",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    name_kn: "ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
    name_hi: "पीएम-किसान सम्मान निधि",
    department: "Ministry of Agriculture and Farmers Welfare",
    classification: "Central",
    state: "All India",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "Central sector initiative providing supplementary income support of ₹6,000 per annum to all landholding farmer families across the country.",
    description_kn: "ದೇಶದ ಎಲ್ಲಾ ಕೃಷಿ ಭೂಮಾಲೀಕ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ವರ್ಷಕ್ಕೆ ₹6,000 ಪೂರಕ ಆದಾಯ ಬೆಂಬಲ ನೀಡುವ ಕೇಂದ್ರ ಸರ್ಕಾರದ ಯೋಜನೆ.",
    description_hi: "देश के सभी भूमिधारक किसान परिवारों को ₹6,000 वार्षिक प्रत्यक्ष आय सहायता प्रदान करने वाली केंद्रीय योजना।",
    benefits: [
      "₹6,000 per year transferred in three equal four-monthly installments of ₹2,000 directly to bank accounts",
      "Enables farmers to procure agricultural inputs like seeds, fertilizers, and equipment",
      "Integrated with state land record databases (Bhoomi in Karnataka)"
    ],
    eligibilityCriteria: {
      minAge: 18,
      allowedOccupations: ["Farmer", "Agriculture"],
      rules: [
        "Family must own cultivable agricultural land registered in official land records",
        "Institutional landholders and serving/retired government employees are excluded",
        "Mandatory biometric e-KYC and land record seeding required"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card seeded with active bank account",
      "Land Ownership Documents (Record of Rights, Tenancy & Crops - RTC / Pahani)",
      "Bank Account details with NPCI mapping",
      "Mobile number linked to Aadhaar"
    ],
    applicationProcedure: {
      steps: [
        "Visit PM-KISAN portal or nearby Common Service Centre (CSC) / Raitha Samparka Kendra",
        "Click on 'New Farmer Registration' and enter Aadhaar number and state",
        "Enter survey number and land ownership details verified via Karnataka Bhoomi integration",
        "Perform OTP / Face Authentication for biometric e-KYC compliance"
      ],
      onlineUrl: "https://pmkisan.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://pmkisan.gov.in",
    deadline: "Open Year-Round (Tranches: April, August, December)",
    lastUpdated: "2026-02-12",
    isVerified: true,
    isPublished: true,
    viewCount: 3120,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-pm-fasal-bima",
    slug: "pradhan-mantri-fasal-bima-yojana-pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    name_kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
    name_hi: "प्रधानमंत्री फसल बीमा योजना",
    department: "Ministry of Agriculture and Farmers Welfare",
    classification: "Central",
    state: "All India",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "Comprehensive agricultural crop insurance against non-preventable natural risks like drought, flood, hailstorm, pest attack, and post-harvest losses.",
    description_kn: "ಬರ, ಪ್ರವಾಹ, ಕೀಟಬಾಧೆ ಮತ್ತು ಕೊಯ್ಲಿನ ನಂತರದ ಹಾನಿಗಳಿಂದ ಬೆಳೆ ರಕ್ಷಣೆ ನೀಡುವ ಸಮಗ್ರ ಕೃಷಿ ವಿಮಾ ಯೋಜನೆ.",
    description_hi: "प्राकृतिक आपदाओं, कीट हमलों और अप्रत्याशित मौसम से फसल नुकसान की भरपाई करने वाली व्यापक बीमा योजना।",
    benefits: [
      "Lowest premium burden on farmers: only 2% for Kharif crops, 1.5% for Rabi, and 5% for commercial/horticultural crops",
      "Balance premium subsidized up to 90% equally by Central and State Governments",
      "Rapid settlement of claims directly into bank account via satellite imagery and remote sensing verification"
    ],
    eligibilityCriteria: {
      minAge: 18,
      allowedOccupations: ["Farmer", "Agriculture"],
      rules: [
        "Applicable to all farmers including sharecroppers and tenant farmers growing notified crops in notified areas",
        "Must apply before the seasonal cutoff deadline announced by State Agriculture Department"
      ]
    },
    requiredDocuments: [
      "Land ownership document (RTC / Form 16 / Tenant Agreement)",
      "Sowing Certificate issued by Village Administrative Officer / Revenue Inspector",
      "Cancelled bank cheque or updated passbook copy",
      "Aadhaar Card"
    ],
    applicationProcedure: {
      steps: [
        "Enroll through your local primary agricultural cooperative society, commercial bank branch, or online via Samrakshane portal (Karnataka)",
        "Submit RTC and crop sowing declaration before the declared cut-off date",
        "Pay the nominal farmer share of premium and preserve the insurance policy certificate"
      ],
      onlineUrl: "https://pmfby.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://pmfby.gov.in",
    deadline: "Kharif Cutoff: 31 July 2026 | Rabi Cutoff: 31 Dec 2026",
    lastUpdated: "2026-02-05",
    isVerified: true,
    isPublished: true,
    viewCount: 1980,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-ayushman-bharat",
    slug: "ayushman-bharat-pm-jay",
    name: "Ayushman Bharat – PM-JAY (Arogya Karnataka)",
    name_kn: "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ – ಆರೋಗ್ಯ ಕರ್ನಾಟಕ",
    name_hi: "आयुष्मान भारत – पीएम-जय",
    department: "National Health Authority, Ministry of Health and Family Welfare",
    classification: "Central",
    state: "All India",
    category: "Health and Social Welfare",
    beneficiaryCategory: "General",
    description: "The world's largest government-funded healthcare program providing ₹5 Lakh annual cashless health coverage per family for secondary and tertiary care.",
    description_kn: "ದ್ವಿತೀಯ ಮತ್ತು ತೃತೀಯ ದರ್ಜೆಯ ಆಸ್ಪತ್ರೆ ಚಿಕಿತ್ಸೆಗಾಗಿ ಕುಟುಂಬಕ್ಕೆ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷ ನಗದುರಹಿತ ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಒದಗಿಸುವ ಬೃಹತ್ ಯೋಜನೆ.",
    description_hi: "माध्यमिक और तृतीयक अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस स्वास्थ्य कवर।",
    benefits: [
      "Cashless and paperless access to healthcare services at all empanelled public and private hospitals nationwide",
      "Covers up to 3 days pre-hospitalization and 15 days post-hospitalization medical expenses",
      "Over 1,949 treatments including oncology, cardiology, neurosurgery, and critical care"
    ],
    eligibilityCriteria: {
      maxAnnualIncome: 300000,
      rules: [
        "Families identified under SECC 2011 deprivation criteria or holders of valid BPL / NFSA ration cards",
        "No restriction on family size, age, or gender"
      ]
    },
    requiredDocuments: [
      "Ration Card (BPL / Antyodaya Anna Yojana)",
      "Aadhaar Card for all family beneficiaries",
      "Active Mobile number for Ayushman Golden Card generation"
    ],
    applicationProcedure: {
      steps: [
        "Visit nearest Government Hospital, District Civil Hospital, or CSC Ayushman Mitra desk",
        "Verify beneficiary entitlement using Ration Card and Aadhaar",
        "Complete instant biometric authentication",
        "Download your co-branded Ayushman Arogya Card immediately"
      ],
      onlineUrl: "https://beneficiary.nha.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://pmjay.gov.in",
    deadline: "Open Year-Round / Lifelong Coverage with ABHA e-KYC",
    lastUpdated: "2026-01-25",
    isVerified: true,
    isPublished: true,
    viewCount: 2840,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-pm-svanidhi",
    slug: "pm-street-vendor-atmanirbhar-nidhi-svanidhi",
    name: "PM SVANidhi (Street Vendor Loan)",
    name_kn: "ಪಿಎಂ ಸ್ವನಿಧಿ ಬೀದಿಬದಿ ವ್ಯಾಪಾರಿಗಳ ಸಾಲ ಯೋಜನೆ",
    name_hi: "पीएम स्वनिधि (स्ट्रीट वेंडर योजना)",
    department: "Ministry of Housing and Urban Affairs",
    classification: "Central",
    state: "All India",
    category: "Employment Opportunities",
    beneficiaryCategory: "General",
    description: "Micro-credit collateral-free working capital loan for street vendors, small hawkers, and informal livelihood workers starting from ₹10,000 up to ₹50,000.",
    description_kn: "ಬೀದಿಬದಿ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಸಣ್ಣ ವ್ಯಾಪಾರಿಗಳಿಗೆ ₹10,000 ರಿಂದ ₹50,000 ವರೆಗೆ ಜಾಮೀನು ರಹಿತ ದುಡಿಯುವ ಬಂಡವಾಳ ಸಾಲ ಸೌಲಭ್ಯ.",
    description_hi: "शहरी और ग्रामीण पथ विक्रेताओं के लिए ₹10,000 से ₹50,000 तक का संपार्श्विक-मुक्त कार्यशील पूंजी ऋण।",
    benefits: [
      "First tranche: ₹10,000, second tranche: ₹20,000, third tranche: ₹50,000 with timely repayment incentives",
      "7% interest subsidy credited directly to bank account on early repayment",
      "Monthly cashback rewards up to ₹100 for digital UPI transactions"
    ],
    eligibilityCriteria: {
      minAge: 18,
      allowedOccupations: ["Street Vendor", "Self-Employed", "Hawker", "Artisan"],
      rules: [
        "Vendor must have a Certificate of Vending or Urban Local Body (ULB) identification card",
        "Active vending business in urban or peri-urban areas"
      ]
    },
    requiredDocuments: [
      "Vending Certificate or Letter of Recommendation from Municipality / Ward Office",
      "Aadhaar Card & linked bank passbook",
      "UPI QR Code or merchant ID proof for digital incentive eligibility"
    ],
    applicationProcedure: {
      steps: [
        "Login on PMSVANidhi portal or mobile app with mobile number linked to Aadhaar",
        "Check your name in Municipal Vending list or request Letter of Recommendation",
        "Select preferred lending institution / bank branch",
        "Sanctioned loan is disbursed directly within 7 to 10 working days"
      ],
      onlineUrl: "https://pmsvanidhi.mohua.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://pmsvanidhi.mohua.gov.in",
    deadline: "Active through 31st December 2026 / Rolling Credit",
    lastUpdated: "2026-02-01",
    isVerified: true,
    isPublished: true,
    viewCount: 1540,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-yuva-nidhi",
    slug: "yuva-nidhi-scheme-karnataka",
    name: "Yuva Nidhi Scheme",
    name_kn: "ಯುವ ನಿಧಿ ಯೋಜನೆ",
    name_hi: "युवा निधि योजना",
    department: "Department of Skill Development, Entrepreneurship and Livelihood",
    classification: "State",
    state: "Karnataka",
    category: "Employment Opportunities",
    beneficiaryCategory: "Students",
    description: "Financial unemployment stipend providing ₹3,000 per month for degree holders and ₹1,500 per month for diploma holders domiciled in Karnataka.",
    description_kn: "ಕರ್ನಾಟಕದ ನಿರುದ್ಯೋಗಿ ಪದವೀಧರರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹3,000 ಮತ್ತು ಡಿಪ್ಲೊಮಾ ಹೊಂದಿರುವವರಿಗೆ ₹1,500 ನಿರುದ್ಯೋಗ ಭತ್ಯೆ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "कर्नाटक के बेरोजगार डिग्री धारकों को ₹3,000 प्रति माह और डिप्लोमा धारकों को ₹1,500 प्रति माह वित्तीय सहायता।",
    benefits: [
      "Monthly allowance disbursed directly to bank account for up to 2 years or until employment is secured",
      "Free access to government skill training and placement workshops organized by Karnataka Skill Development Corporation (KSDC)"
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 30,
      applicableStates: ["Karnataka"],
      allowedOccupations: ["Unemployed", "Student"],
      educationRequirements: "Graduation (Degree) or Diploma completed in accredited Karnataka institutions",
      rules: [
        "Candidate must have completed degree/diploma in the designated academic year and remained unemployed for at least 6 months",
        "Not eligible if pursuing higher education or engaged in private/public sector payroll or self-employment"
      ]
    },
    requiredDocuments: [
      "Degree or Diploma Completion Certificate & Marks Card",
      "Karnataka Domicile Certificate or proof of 6 years study in Karnataka",
      "Aadhaar Card and linked bank account",
      "Self-declaration certificate of unemployment"
    ],
    applicationProcedure: {
      steps: [
        "Visit Seva Sindhu portal or Karnataka One / Bangalore One center",
        "Enter University / Board registration number to fetch degree verification",
        "Submit self-declaration of unemployment status",
        "Monthly stipend will be automatically credited after verification"
      ],
      onlineUrl: "https://sevasindhugs.karnataka.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://sevasindhugs.karnataka.gov.in",
    deadline: "Continuous Registration for 2023-2026 Batches",
    lastUpdated: "2026-02-14",
    isVerified: true,
    isPublished: true,
    viewCount: 2150,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-mudra-yojana",
    slug: "pradhan-mantri-mudra-yojana-pmmy",
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    name_kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಮುದ್ರಾ ಯೋಜನೆ",
    name_hi: "प्रधानमंत्री मुद्रा योजना",
    department: "Department of Financial Services, Ministry of Finance",
    classification: "Central",
    state: "All India",
    category: "Financial Assistance",
    beneficiaryCategory: "General",
    description: "Collateral-free business loans up to ₹10 Lakhs (and up to ₹20 Lakhs under Tarun Plus) to micro and small non-corporate enterprises for income generation.",
    description_kn: "ಕಿರು ಮತ್ತು ಸಣ್ಣ ಉದ್ಯಮಗಳಿಗೆ ಆದಾಯ ಉತ್ಪಾದನೆಗಾಗಿ ₹10 ಲಕ್ಷದವರೆಗೆ ಜಾಮೀನು ರಹಿತ ವ್ಯಾಪಾರ ಸಾಲ ನೀಡುವ ಮಹತ್ವದ ಯೋಜನೆ.",
    description_hi: "सूक्ष्म और लघु गैर-कॉर्पोरेट उद्यमों को ₹10 लाख तक का संपार्श्विक-मुक्त व्यावसायिक ऋण प्रदान करने वाली योजना।",
    benefits: [
      "Three distinct loan categories: Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 Lakhs), and Tarun (₹5 Lakhs to ₹10 Lakhs)",
      "Zero processing fees for Shishu and Kishore loans",
      "Available through commercial banks, RRBs, Small Finance Banks, and MFIs"
    ],
    eligibilityCriteria: {
      minAge: 18,
      allowedOccupations: ["Self-Employed", "Business", "Artisan", "Unemployed"],
      rules: [
        "Any Indian citizen who has a business plan for non-farm income-generating activity",
        "Applicant must not be a defaulter to any bank or financial institution"
      ]
    },
    requiredDocuments: [
      "Identity Proof (Aadhaar / Voter ID / PAN Card)",
      "Business address proof and trade registration (Udyam Registration)",
      "Quotation of machinery/items to be purchased or working capital estimate",
      "Past 6 months bank statement"
    ],
    applicationProcedure: {
      steps: [
        "Apply online via Udyami Mitra portal (udyamimitra.in) or visit any nationalized bank branch",
        "Fill MUDRA application form with business proposal",
        "Submit required quotations and KYC documents",
        "Loan disbursed directly with MUDRA Debit Card issued for working capital withdrawals"
      ],
      onlineUrl: "https://www.udyamimitra.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://www.mudra.org.in",
    deadline: "Open Year-Round via all Member Lending Institutions",
    lastUpdated: "2026-02-08",
    isVerified: true,
    isPublished: true,
    viewCount: 1720,
    sourceVerificationStatus: "Official Government Verified"
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "SSP Scholarship 2026 Application Portal Open",
    title_kn: "ಎಸ್‌ಎಸ್‌ಪಿ ವಿದ್ಯಾರ್ಥಿವೇತನ 2026 ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಪ್ರಾರಂಭ",
    title_hi: "एसएसपी छात्रवृत्ति 2026 आवेदन पोर्टल खुला",
    message: "Karnataka Post-Matric SSP Scholarship applications are now invited for 2026 academic sessions. Check required Kutumba RD numbers.",
    message_kn: "2026 ರ ಸಾಲಿನ ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅರ್ಜಿಗಳನ್ನು ಆಹ್ವಾನಿಸಲಾಗಿದೆ. ಕೂಡಲೇ ನಿಮ್ಮ ಕುಟುಂಬ ಆರ್‌ಡಿ ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸಿ.",
    message_hi: "2026 शैक्षणिक सत्र के लिए कर्नाटक पोस्ट-मैट्रिक एसएसपी छात्रवृत्ति आवेदन आमंत्रित किए गए हैं।",
    type: "new_scheme",
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "notif-2",
    title: "PM-KISAN 19th Installment e-KYC Advisory",
    title_kn: "ಪಿಎಂ-ಕಿಸಾನ್ 19ನೇ ಕಂತಿನ ಇ-ಕೆವೈಸಿ ಪ್ರಕಟಣೆ",
    title_hi: "पीएम-किसान 19वीं किस्त ई-केवाईसी सूचना",
    message: "Ensure biometric e-KYC or OTP verification is updated on pmkisan.gov.in to receive uninterrupted DBT credit.",
    message_kn: "ನಿಮ್ಮ ಡಿಬಿಟಿ ಜಮೆಯನ್ನು ನಿರಂತರವಾಗಿ ಪಡೆಯಲು pmkisan.gov.in ನಲ್ಲಿ ಇ-ಕೆವೈಸಿ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಳಿಸಿ.",
    message_hi: "बिना रुकावट डीबीटी लाभ पाने के लिए पीएम-किसान पोर्टल पर बायोमेट्रिक ई-केवाईसी सुनिश्चित करें।",
    type: "scheme_update",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "notif-3",
    title: "Janaseva Assistant Now Available in Kannada & Hindi",
    title_kn: "ಜನಸೇವಾ ಎಐ ಸಹಾಯಕ ಈಗ ಕನ್ನಡ ಮತ್ತು ಹಿಂದಿಯಲ್ಲಿ ಲಭ್ಯವಿದೆ",
    title_hi: "जनसेवा सहायक अब कन्नड़ और हिंदी में उपलब्ध है",
    message: "Use the interactive Janaseva Assistant to ask questions about required documents, eligibility, and step-by-step procedures.",
    message_kn: "ಅಗತ್ಯ ದಾಖಲೆಗಳು ಮತ್ತು ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಯ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯಲು ಜನಸೇವಾ ಸಹಾಯಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    message_hi: "आवश्यक दस्तावेजों और पात्रता के बारे में जानने के लिए जनसेवा चैट सहायक का उपयोग करें।",
    type: "general",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export const DEFAULT_DOCUMENTS: DocumentItem[] = [
  { id: 'doc-voter-id', name: 'Voter ID Card', category: 'Identity', status: 'available', notes: 'Valid Election Commission Electoral Photo ID', updatedAt: new Date().toISOString() },
  { id: 'doc-other-id', name: 'Other Accepted Identity Proof', category: 'Identity', status: 'pending', notes: 'Government photo identification (Driving License, PAN, Passport)', updatedAt: new Date().toISOString() },
  { id: 'doc-income', name: 'Income Certificate', category: 'Income', status: 'available', notes: 'Revenue Department certified annual household income (RD Number)', updatedAt: new Date().toISOString() },
  { id: 'doc-residence', name: 'Residence Certificate', category: 'Residence', status: 'available', notes: 'Gram Panchayat / Ward Municipal residential certificate', updatedAt: new Date().toISOString() },
  { id: 'doc-domicile', name: 'Domicile Certificate', category: 'Residence', status: 'pending', notes: 'Karnataka state domicile proof for welfare programs', updatedAt: new Date().toISOString() },
  { id: 'doc-marks-cards', name: 'Marks Cards', category: 'Education', status: 'pending', notes: 'SSLC / PUC / Degree semester marks transcripts', updatedAt: new Date().toISOString() },
  { id: 'doc-study-cert', name: 'Study Certificate', category: 'Education', status: 'pending', notes: 'Study certificate countersigned by BEO / DDPU where required', updatedAt: new Date().toISOString() },
  { id: 'doc-bonafide', name: 'Bonafide Certificate', category: 'Education', status: 'pending', notes: 'Current academic year enrollment endorsement from college/school', updatedAt: new Date().toISOString() },
  { id: 'doc-caste', name: 'Caste Certificate', category: 'Category', status: 'available', notes: 'SC / ST / OBC category certificate with RD verification number', updatedAt: new Date().toISOString() },
  { id: 'doc-ews', name: 'EWS Certificate', category: 'Category', status: 'not_applicable', notes: 'Economically Weaker Section eligibility certificate (if applicable)', updatedAt: new Date().toISOString() },
  { id: 'doc-bank-proof', name: 'Bank Account Proof', category: 'Banking', status: 'available', notes: 'Aadhaar-seeded bank account passbook copy for DBT disbursement', updatedAt: new Date().toISOString() },
  { id: 'doc-land-rtc', name: 'Land Ownership RTC / Pahani', category: 'Agriculture & Land', status: 'pending', notes: 'Bhoomi RTC record for agricultural subsidies', updatedAt: new Date().toISOString() }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        parsed.savedEligibilityRecords = parsed.savedEligibilityRecords || [];
        parsed.applications = parsed.applications || [];
        parsed.savedSchemes = parsed.savedSchemes || [];
        parsed.notifications = parsed.notifications || [];
        parsed.assessments = parsed.assessments || [];
        parsed.users = parsed.users || [];
        parsed.logs = parsed.logs || [];
        if (!parsed.schemes || parsed.schemes.length < ALL_VERIFIED_SCHEMES.length) {
          parsed.schemes = ALL_VERIFIED_SCHEMES;
          this.saveDatabase(parsed);
        }
        return parsed;
      } catch (e) {
        console.error('Failed reading existing DB file, reinitializing...', e);
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('Admin@123', salt);
    const citizenHash = bcrypt.hashSync('Citizen@123', salt);

    const initialDb: DatabaseSchema = {
      users: [
        {
          id: "user-admin-01",
          fullName: "Govt Admin Officer",
          email: "admin@janaseva.gov.in",
          passwordHash: adminHash,
          role: "admin",
          state: "Karnataka",
          occupation: "Public Administrator",
          incomeRange: "Above 5 Lakhs",
          createdAt: new Date().toISOString()
        },
        {
          id: "user-citizen-01",
          fullName: "Ramesh Gowda",
          email: "citizen@janaseva.gov.in",
          passwordHash: citizenHash,
          role: "citizen",
          state: "Karnataka",
          occupation: "Farmer",
          incomeRange: "1 Lakh - 2.5 Lakhs",
          createdAt: new Date().toISOString()
        }
      ],
      schemes: INITIAL_SCHEMES,
      savedSchemes: [
        {
          id: "saved-01",
          userId: "user-citizen-01",
          schemeId: "scheme-pm-kisan",
          savedAt: new Date().toISOString()
        }
      ],
      applications: [
        {
          id: "app-01",
          userId: "user-citizen-01",
          schemeId: "scheme-pm-kisan",
          applicationRefNo: "PMK-2026-KA-9812",
          appliedDate: "2026-02-01",
          status: "Submitted",
          notes: "Applied via Raitha Samparka Kendra with RTC Bhoomi document.",
          updatedAt: new Date().toISOString()
        }
      ],
      assessments: [],
      savedEligibilityRecords: [],
      notifications: INITIAL_NOTIFICATIONS,
      logs: [
        {
          id: "log-01",
          adminEmail: "admin@janaseva.gov.in",
          action: "INITIAL_DATABASE_SEED",
          target: "System",
          details: "Verified 10 core national and state welfare schemes seeded.",
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  private saveDatabase(data: DatabaseSchema) {
    const tempPath = `${DB_FILE_PATH}.tmp`;
    try {
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE_PATH);
    } catch (e) {
      console.error('Error writing to database file:', e);
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch { }
    }
  }

  // User Operations
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByEmailOrMobile(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    if (clean.includes('@')) {
      return this.data.users.find(u => u.email.toLowerCase() === clean);
    }
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    return this.data.users.find(u => {
      if (u.email.toLowerCase() === clean) return true;
      if (u.mobileNumber) {
        const userDigits = u.mobileNumber.replace(/[^0-9]/g, '');
        if (cleanDigits.length >= 10 && userDigits.endsWith(cleanDigits.slice(-10))) return true;
        if (u.mobileNumber.trim() === identifier.trim()) return true;
      }
      return false;
    });
  }

  createUser(user: User): User {
    if (user.documents === undefined) {
      user.documents = DEFAULT_DOCUMENTS;
    }
    this.data.users.push(user);
    this.saveDatabase(this.data);
    return user;
  }

  updateUserProfile(id: string, updates: Partial<User>): User | null {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;

    if (updates.fullName !== undefined) user.fullName = updates.fullName.trim();
    if (updates.mobileNumber !== undefined) user.mobileNumber = updates.mobileNumber.trim();
    if (updates.state !== undefined) user.state = updates.state.trim();
    if (updates.district !== undefined) user.district = updates.district.trim();
    if (updates.villageTown !== undefined) user.villageTown = updates.villageTown.trim();
    if (updates.occupation !== undefined) user.occupation = updates.occupation.trim();
    if (updates.beneficiaryCategory !== undefined) user.beneficiaryCategory = updates.beneficiaryCategory.trim();
    if (updates.incomeRange !== undefined) user.incomeRange = updates.incomeRange.trim();
    if (updates.gender !== undefined) user.gender = updates.gender;
    if (updates.preferredLanguage !== undefined) user.preferredLanguage = updates.preferredLanguage;
    if (updates.preferences !== undefined) {
      user.preferences = { ...(user.preferences || {}), ...updates.preferences } as any;
    }
    user.updatedAt = new Date().toISOString();

    this.saveDatabase(this.data);
    return user;
  }

  updateUserPassword(idOrEmail: string, passwordHash: string): boolean {
    const user = this.data.users.find(u =>
      u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase()
    );
    if (!user) return false;
    user.passwordHash = passwordHash;
    user.updatedAt = new Date().toISOString();
    this.saveDatabase(this.data);
    return true;
  }

  // Scheme Operations
  getSchemes(): Scheme[] {
    return this.data.schemes;
  }

  getSchemeByIdOrSlug(idOrSlug: string): Scheme | undefined {
    return this.data.schemes.find(s => s.id === idOrSlug || s.slug === idOrSlug);
  }

  createScheme(scheme: Scheme): Scheme {
    this.data.schemes.push(scheme);
    this.saveDatabase(this.data);
    return scheme;
  }

  updateScheme(id: string, updates: Partial<Scheme>): Scheme | null {
    const idx = this.data.schemes.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.schemes[idx] = { ...this.data.schemes[idx], ...updates, lastUpdated: new Date().toISOString().split('T')[0] };
    this.saveDatabase(this.data);
    return this.data.schemes[idx];
  }

  deleteScheme(id: string): boolean {
    const initialLen = this.data.schemes.length;
    this.data.schemes = this.data.schemes.filter(s => s.id !== id);
    if (this.data.schemes.length !== initialLen) {
      this.saveDatabase(this.data);
      return true;
    }
    return false;
  }

  incrementViewCount(id: string): void {
    const scheme = this.data.schemes.find(s => s.id === id);
    if (scheme) {
      scheme.viewCount = (scheme.viewCount || 0) + 1;
      this.saveDatabase(this.data);
    }
  }

  // Saved Schemes
  getSavedSchemes(userId: string): Scheme[] {
    const savedIds = this.data.savedSchemes
      .filter(s => s.userId === userId)
      .map(s => s.schemeId);
    return this.data.schemes.filter(s => savedIds.includes(s.id));
  }

  addSavedScheme(userId: string, schemeId: string): { saved: boolean } {
    const exists = this.data.savedSchemes.some(s => s.userId === userId && s.schemeId === schemeId);
    if (!exists) {
      this.data.savedSchemes.push({
        id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId,
        schemeId,
        savedAt: new Date().toISOString()
      });
      this.saveDatabase(this.data);
    }
    return { saved: true };
  }

  removeSavedScheme(userId: string, schemeId: string): { saved: boolean } {
    const prevLen = this.data.savedSchemes.length;
    this.data.savedSchemes = this.data.savedSchemes.filter(
      s => !(s.userId === userId && s.schemeId === schemeId)
    );
    if (this.data.savedSchemes.length !== prevLen) {
      this.saveDatabase(this.data);
    }
    return { saved: false };
  }

  toggleSaveScheme(userId: string, schemeId: string): { saved: boolean } {
    const exists = this.data.savedSchemes.findIndex(s => s.userId === userId && s.schemeId === schemeId);
    if (exists >= 0) {
      this.data.savedSchemes.splice(exists, 1);
      this.saveDatabase(this.data);
      return { saved: false };
    } else {
      this.data.savedSchemes.push({
        id: `saved-${Date.now()}`,
        userId,
        schemeId,
        savedAt: new Date().toISOString()
      });
      this.saveDatabase(this.data);
      return { saved: true };
    }
  }

  isSchemeSaved(userId: string, schemeId: string): boolean {
    return this.data.savedSchemes.some(s => s.userId === userId && s.schemeId === schemeId);
  }

  // Application Tracker
  getUserApplications(userId: string): Array<ApplicationRecord & { scheme?: Scheme }> {
    return this.data.applications
      .filter(a => a.userId === userId)
      .map(a => ({
        ...a,
        scheme: this.data.schemes.find(s => s.id === a.schemeId)
      }));
  }

  createApplicationRecord(record: ApplicationRecord): ApplicationRecord {
    this.data.applications.push(record);
    this.saveDatabase(this.data);
    return record;
  }

  updateApplicationRecord(id: string, userId: string, updates: Partial<ApplicationRecord>): ApplicationRecord | null {
    const idx = this.data.applications.findIndex(a => a.id === id && a.userId === userId);
    if (idx === -1) return null;
    const current = this.data.applications[idx];
    const newTimeline = [...(current.timeline || [])];
    if (updates.status && updates.status !== current.status) {
      newTimeline.push({
        status: updates.status,
        date: new Date().toISOString().split('T')[0],
        note: updates.notes || `Status updated to ${updates.status}`
      });
    }
    this.data.applications[idx] = {
      ...current,
      ...updates,
      timeline: newTimeline,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase(this.data);
    return this.data.applications[idx];
  }

  deleteApplicationRecord(id: string, userId: string): boolean {
    const len = this.data.applications.length;
    this.data.applications = this.data.applications.filter(a => !(a.id === id && a.userId === userId));
    if (this.data.applications.length !== len) {
      this.saveDatabase(this.data);
      return true;
    }
    return false;
  }

  // Saved Eligibility History
  saveEligibilityRecord(record: SavedEligibilityRecord): SavedEligibilityRecord {
    this.data.savedEligibilityRecords = this.data.savedEligibilityRecords || [];
    this.data.savedEligibilityRecords.unshift(record);
    this.saveDatabase(this.data);
    return record;
  }

  getUserEligibilityHistory(userId: string): SavedEligibilityRecord[] {
    this.data.savedEligibilityRecords = this.data.savedEligibilityRecords || [];
    return this.data.savedEligibilityRecords.filter(r => r.userId === userId);
  }

  deleteEligibilityHistoryRecord(id: string, userId: string): boolean {
    this.data.savedEligibilityRecords = this.data.savedEligibilityRecords || [];
    const len = this.data.savedEligibilityRecords.length;
    this.data.savedEligibilityRecords = this.data.savedEligibilityRecords.filter(
      r => !(r.id === id && r.userId === userId)
    );
    if (this.data.savedEligibilityRecords.length !== len) {
      this.saveDatabase(this.data);
      return true;
    }
    return false;
  }

  // Documents Checklist
  getUserDocuments(userId: string): DocumentItem[] {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return DEFAULT_DOCUMENTS;
      if (user.documents === undefined) {
        user.documents = JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS));
        this.saveDatabase(this.data);
      }
      return user.documents!;
    }

    updateUserDocuments(userId: string, documents: DocumentItem[]): DocumentItem[] {
      const user = this.data.users.find(u => u.id === userId);
      if (user) {
        user.documents = documents;
        user.updatedAt = new Date().toISOString();
        this.saveDatabase(this.data);
      }
      return documents;
    }

    updateUserSingleDocument(userId: string, documentId: string, updates: Partial<DocumentItem>): DocumentItem | null {
      const user = this.data.users.find(u => u.id === userId);
      if (!user) return null;
      if (user.documents === undefined) {
        user.documents = JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS));
      }
      const docs = user.documents!;
      let doc = docs.find((d: DocumentItem) => d.id === documentId);
      if (!doc) {
        const template = DEFAULT_DOCUMENTS.find(d => d.id === documentId);
        const newDoc: DocumentItem = {
          id: documentId,
          name: template ? template.name : documentId,
          category: template ? template.category : 'Other',
          status: (updates.status as any) || 'pending',
          documentNumber: updates.documentNumber || '',
          notes: updates.notes || '',
          updatedAt: new Date().toISOString()
        };
        docs.push(newDoc);
        doc = newDoc;
      } else {
        if (updates.status !== undefined) doc.status = updates.status;
        if (updates.documentNumber !== undefined) doc.documentNumber = updates.documentNumber;
        if (updates.notes !== undefined) doc.notes = updates.notes;
        doc.updatedAt = new Date().toISOString();
      }
      user.updatedAt = new Date().toISOString();
      this.saveDatabase(this.data);
      return doc;
    }

    // Active User Sessions
    createSession(userId: string, session: UserSession): UserSession {
      const user = this.data.users.find(u => u.id === userId);
      if (user) {
        user.sessions = user.sessions || [];
        user.sessions.unshift(session);
        // Keep only last 10 sessions
        if (user.sessions.length > 10) user.sessions = user.sessions.slice(0, 10);
        this.saveDatabase(this.data);
      }
      return session;
    }

    getUserSessions(userId: string): UserSession[] {
      const user = this.data.users.find(u => u.id === userId);
      return user?.sessions || [];
    }

    removeSession(userId: string, sessionId: string): boolean {
      const user = this.data.users.find(u => u.id === userId);
      if (!user || !user.sessions) return false;
      const len = user.sessions.length;
      user.sessions = user.sessions.filter(s => s.id !== sessionId);
      if (user.sessions.length !== len) {
        this.saveDatabase(this.data);
        return true;
      }
      return false;
    }

    // Assessments
    saveAssessment(assessment: EligibilityAssessment): void {
      this.data.assessments.push(assessment);
      this.saveDatabase(this.data);
    }

    getUserAssessments(userId: string): EligibilityAssessment[] {
      return this.data.assessments.filter(a => a.userId === userId);
    }

    // Notifications
    getNotifications(userId ?: string): AppNotification[] {
      return this.data.notifications
        .filter(n => {
          if (n.userId) return n.userId === userId;
          if (userId && n.dismissedBy?.includes(userId)) return false;
          return true;
        })
        .map(n => {
          if (!n.userId && userId) {
            return {
              ...n,
              isRead: n.readBy?.includes(userId) ?? false
            };
          }
          return n;
        });
    }

    createNotification(notif: AppNotification): AppNotification {
      this.data.notifications.unshift(notif);
      this.saveDatabase(this.data);
      return notif;
    }

    markNotificationAsRead(id: string, userId ?: string): boolean {
      const notif = this.data.notifications.find(n => n.id === id);
      if (!notif) return false;

      if (notif.userId) {
        if (userId && notif.userId !== userId) {
          return false;
        }
        notif.isRead = true;
        this.saveDatabase(this.data);
        return true;
      }

      if (userId) {
        notif.readBy = notif.readBy || [];
        if (!notif.readBy.includes(userId)) {
          notif.readBy.push(userId);
          this.saveDatabase(this.data);
        }
        return true;
      } else {
        notif.isRead = true;
        this.saveDatabase(this.data);
        return true;
      }
    }

    markAllNotificationsAsRead(userId ?: string): void {
      this.data.notifications.forEach(n => {
        if (n.userId) {
          if (!userId || n.userId === userId) {
            n.isRead = true;
          }
        } else if (userId) {
          n.readBy = n.readBy || [];
          if (!n.readBy.includes(userId)) {
            n.readBy.push(userId);
          }
        } else {
          n.isRead = true;
        }
      });
      this.saveDatabase(this.data);
    }

    deleteNotification(id: string, userId ?: string): boolean {
      const notif = this.data.notifications.find(n => n.id === id);
      if (!notif) return false;

      if (notif.userId) {
        if (userId && notif.userId !== userId) {
          return false;
        }
        this.data.notifications = this.data.notifications.filter(n => n.id !== id);
        this.saveDatabase(this.data);
        return true;
      }

      if (userId) {
        notif.dismissedBy = notif.dismissedBy || [];
        if (!notif.dismissedBy.includes(userId)) {
          notif.dismissedBy.push(userId);
          this.saveDatabase(this.data);
        }
        return true;
      } else {
        this.data.notifications = this.data.notifications.filter(n => n.id !== id);
        this.saveDatabase(this.data);
        return true;
      }
    }

    // Admin Logs
    addAdminLog(log: AdminActivityLog): void {
      this.data.logs.unshift(log);
      this.saveDatabase(this.data);
    }

    getAdminLogs(): AdminActivityLog[] {
      return this.data.logs;
    }

    // Statutory Right to Erasure / Account Deletion (DPDP Act 2023 § 12 & GDPR Art 17)
    deleteUserAccount(userId: string): boolean {
      const userIdx = this.data.users.findIndex(u => u.id === userId);
      if (userIdx === -1) return false;

      // Purge user profile
      this.data.users.splice(userIdx, 1);
      // Cascade purge associated citizen personal records
      this.data.savedSchemes = this.data.savedSchemes.filter(s => s.userId !== userId);
      this.data.applications = this.data.applications.filter(a => a.userId !== userId);
      this.data.assessments = this.data.assessments.filter(a => a.userId !== userId);
      if (this.data.savedEligibilityRecords) {
        this.data.savedEligibilityRecords = this.data.savedEligibilityRecords.filter(r => r.userId !== userId);
      }
      this.data.notifications = this.data.notifications.filter(n => n.userId !== userId);

      this.saveDatabase(this.data);
      return true;
    }
  }

  export const db = new Database();
