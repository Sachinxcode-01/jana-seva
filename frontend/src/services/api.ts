import { Scheme, User, ApplicationRecord, EligibilityResult, AppNotification, SchemeCategory } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initial local seed schemes for guaranteed offline / direct preview resilience
export const FALLBACK_SCHEMES: Scheme[] = [
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
    lastUpdated: "2026-02-08",
    isVerified: true,
    isPublished: true,
    viewCount: 1720,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-ladki-bahin-maharashtra",
    slug: "mukhyamantri-majhi-ladki-bahin-yojana",
    name: "Mukhyamantri Majhi Ladki Bahin Yojana",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಮಾಝಿ ಲಡ್ಕಿ ಬಹಿನ್ ಯೋಜನೆ (ಮಹಾರಾಷ್ಟ್ರ)",
    name_hi: "मुख्यमंत्री माझी लाड़की बहिन योजना (महाराष्ट्र)",
    department: "Women & Child Development, Government of Maharashtra",
    classification: "State",
    state: "Maharashtra",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Flagship monthly DBT financial assistance of ₹1,500 per month for eligible women aged 21 to 65 years domiciled in Maharashtra.",
    description_kn: "ಮಹಾರಾಷ್ಟ್ರದ 21 ರಿಂದ 65 ವರ್ಷದ ಅರ್ಹ ಮಹಿಳೆಯರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,500 ನೇರ ನಗದು ವರ್ಗಾವಣೆ ನೆರವು.",
    description_hi: "महाराष्ट्र की 21 से 65 वर्ष की पात्र महिलाओं को आर्थिक स्वावलंबन हेतु ₹1,500 प्रति माह प्रत्यक्ष वित्तीय सहायता।",
    benefits: [
      "₹1,500 credited monthly directly via DBT into beneficiary's Aadhaar-linked bank account",
      "Financial self-reliance and nutrition security for women from low-income families",
      "Online application facility via Nari Shakti Doot App and Aaple Sarkar portal"
    ],
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 65,
      gender: "Female",
      maxAnnualIncome: 250000,
      applicableStates: ["Maharashtra"],
      rules: [
        "Applicant must be a permanent resident of Maharashtra State with domicile certificate",
        "Annual family income must not exceed ₹2.5 Lakhs",
        "Must possess Yellow or Orange ration card"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Maharashtra Domicile Certificate / School Leaving Certificate",
      "Ration Card (Yellow or Orange)",
      "Bank Account details seeded with Aadhaar",
      "Income Certificate / Hamipatra declaration"
    ],
    applicationProcedure: {
      steps: [
        "Download Nari Shakti Doot App or visit Aaple Sarkar / Setu Suvidha Kendra",
        "Verify mobile number with Aadhaar OTP",
        "Upload identity, domicile, and ration card proofs",
        "Submit e-KYC and track sanction acknowledgment status"
      ],
      onlineUrl: "https://ladkibahin.maharashtra.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://ladkibahin.maharashtra.gov.in",
    lastUpdated: "2026-02-12",
    isVerified: true,
    isPublished: true,
    viewCount: 2450,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-magalir-urimai-tamilnadu",
    slug: "kalaignar-magalir-urimai-thogai-scheme",
    name: "Kalaignar Magalir Urimai Thogai",
    name_kn: "ಕಲೈಂಜರ್ ಮಗಳಿರ್ ಉರಿಮೈ ತೊಗೈ ಯೋಜನೆ (ತಮಿಳುನಾಡು)",
    name_hi: "कलैग्नार मगलिर उरीमई थोगाई योजना (तमिलनाडु)",
    department: "Special Programme Implementation Department, Govt of Tamil Nadu",
    classification: "State",
    state: "Tamil Nadu",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Monthly basic rights grant of ₹1,000 to woman heads of eligible households across Tamil Nadu recognized as an entitlement.",
    description_kn: "ತಮಿಳುನಾಡಿನ ಅರ್ಹ ಮಹಿಳಾ ಕುಟುಂಬ ಮುಖ್ಯಸ್ಥರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,000 ಗೌರವ ಧನ ನೀಡುವ ಪ್ರಮುಖ ಯೋಜನೆ.",
    description_hi: "तमिलनाडु में पात्र परिवारों की महिला मुखिया को ₹1,000 मासिक अधिकार अनुदान प्रदान करने वाली योजना।",
    benefits: [
      "₹1,000 monthly deposited directly on the 15th of every month into beneficiary's bank account",
      "Recognition of unpaid domestic labor and economic empowerment for over 1.15 crore women",
      "Biometric e-Sevai verification at ward and village revenue levels"
    ],
    eligibilityCriteria: {
      minAge: 21,
      gender: "Female",
      maxAnnualIncome: 250000,
      applicableStates: ["Tamil Nadu"],
      rules: [
        "Annual family income must be below ₹2.5 Lakhs",
        "Family landholding must be less than 5 acres of wetland or 10 acres of dry land",
        "Annual electricity consumption should be below 3,600 units"
      ]
    },
    requiredDocuments: [
      "Smart Ration Card (Family Card)",
      "Aadhaar Card of the woman applicant",
      "Bank Passbook linked with Aadhaar",
      "Electricity Consumer Card / bill copy"
    ],
    applicationProcedure: {
      steps: [
        "Collect application token from fair price shop (ration shop)",
        "Visit designated special camp or e-Sevai center in your ward",
        "Provide biometric fingerprint validation with Smart Family Card",
        "Receive SMS confirmation upon successful eligibility sanction"
      ],
      onlineUrl: "https://kmut.tn.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://kmut.tn.gov.in",
    lastUpdated: "2026-02-14",
    isVerified: true,
    isPublished: true,
    viewCount: 2210,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-rythu-bharosa-telangana",
    slug: "rythu-bharosa-bandhu-telangana",
    name: "Rythu Bharosa / Rythu Bandhu",
    name_kn: "ರೈತು ಭರೋಸಾ / ರೈತು ಬಂಧು (ತೆಲಂಗಾಣ)",
    name_hi: "रैतु भरोसा / रैतु बंधु (तेलंगाना)",
    department: "Department of Agriculture, Government of Telangana",
    classification: "State",
    state: "Telangana",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "Agricultural investment support providing ₹10,000 to ₹15,000 per acre per year to farmers for seeds, fertilizers, and field operations.",
    description_kn: "ತೆಲಂಗಾಣದ ರೈತರಿಗೆ ಕೃಷಿ ಹೂಡಿಕೆ ನೆರವಾಗಿ ಪ್ರತಿ ಎಕರೆಗೆ ವಾರ್ಷಿಕ ₹10,000 - ₹15,000 ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "तेलंगाना में किसानों को बीज, खाद और कृषि लागत सहायता के लिए प्रति एकड़ प्रति वर्ष वित्तीय निवेश सहायता।",
    benefits: [
      "Direct Benefit Transfer before Rabi and Kharif agricultural crop seasons",
      "Prevents debt trap from private moneylenders for crop inputs",
      "Direct integration with Dharani integrated land records management system"
    ],
    eligibilityCriteria: {
      minAge: 18,
      allowedOccupations: ["Farmer", "Agriculture"],
      applicableStates: ["Telangana"],
      rules: [
        "Farmer must own agricultural land recorded in Telangana Dharani portal",
        "Both small, marginal, and tenant farmers identified under state revenue survey"
      ]
    },
    requiredDocuments: [
      "Pattadar Passbook / Dharani Land Record ID",
      "Aadhaar Card linked to active bank account",
      "Bank Account details mapped with NPCI"
    ],
    applicationProcedure: {
      steps: [
        "Enroll through Agriculture Extension Officer (AEO) in your village revenue circle",
        "Validate Dharani Passbook survey numbers",
        "Disbursement credited automatically before seasonal sowing begins"
      ],
      onlineUrl: "https://rythubandhu.telangana.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://rythubandhu.telangana.gov.in",
    lastUpdated: "2026-01-28",
    isVerified: true,
    isPublished: true,
    viewCount: 1840,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-kanya-sumangala-up",
    slug: "mukhyamantri-kanya-sumangala-yojana-up",
    name: "Mukhyamantri Kanya Sumangala Yojana",
    name_kn: "ಕನ್ಯಾ ಸುಮಂಗಲಾ ಯೋಜನೆ (ಉತ್ತರ ಪ್ರದೇಶ)",
    name_hi: "मुख्यमंत्री कन्या सुमंगला योजना (उत्तर प्रदेश)",
    department: "Women and Child Development Department, Uttar Pradesh",
    classification: "State",
    state: "Uttar Pradesh",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Conditional cash transfer of up to ₹25,000 across 6 educational and developmental milestones from girl child birth through higher education degree completion.",
    description_kn: "ಹೆಣ್ಣು ಮಗುವಿನ ಜನನದಿಂದ ಉನ್ನತ ಶಿಕ್ಷಣ ಪೂರ್ಣಗೊಳ್ಳುವವರೆಗೆ 6 ಹಂತಗಳಲ್ಲಿ ₹25,000 ವರೆಗೆ ಆರ್ಥಿಕ ಅನುದಾನ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "बालिकाओं के जन्म, टीकाकरण, कक्षा 1, 6, 9 में प्रवेश और स्नातक डिग्री प्रवेश पर कुल ₹25,000 की 6 चरणों में वित्तीय सहायता।",
    benefits: [
      "Structured phased grants: Stage 1 (Birth ₹5,000), Stage 2 (Vaccination ₹2,000), Stages 3-5 (School Entry ₹3,000 to ₹5,000), Stage 6 (Degree ₹7,000)",
      "Promotes institutional birth, complete immunization, and prevents female student dropouts",
      "Direct bank credit into parent or girl beneficiary's account"
    ],
    eligibilityCriteria: {
      minAge: 0,
      maxAge: 25,
      gender: "Female",
      maxAnnualIncome: 300000,
      applicableStates: ["Uttar Pradesh"],
      rules: [
        "Applicant family must be permanent residents of Uttar Pradesh",
        "Family income ceiling is ₹3 Lakhs per annum",
        "Maximum of two daughters per family eligible"
      ]
    },
    requiredDocuments: [
      "UP Domicile Certificate / Permanent Residence Proof",
      "Birth Certificate of girl child",
      "Aadhaar Card of parents and student",
      "Income Certificate issued by Tehsildar",
      "Admission proof / fee receipt of ongoing educational class"
    ],
    applicationProcedure: {
      steps: [
        "Register on MKSY portal (mksy.up.gov.in)",
        "Select applicable stage category based on current academic milestone",
        "Upload required scanned proofs and bank account copy",
        "District Probation Officer verifies and sanctions grant through DBT"
      ],
      onlineUrl: "https://mksy.up.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://mksy.up.gov.in",
    lastUpdated: "2026-02-04",
    isVerified: true,
    isPublished: true,
    viewCount: 1960,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-pm-awas-yojana",
    slug: "pradhan-mantri-awas-yojana-pmay",
    name: "Pradhan Mantri Awas Yojana (PMAY-G & PMAY-U)",
    name_kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ",
    name_hi: "प्रधानमंत्री आवास योजना (पीएमएवाई)",
    department: "Ministry of Rural Development & Ministry of Housing and Urban Affairs",
    classification: "Central",
    state: "All India",
    category: "Financial Assistance",
    beneficiaryCategory: "General",
    description: "Flagship public housing initiative providing financial assistance up to ₹1.20 Lakhs in plains and ₹1.30 Lakhs in hilly areas for pucca house construction with toilet and amenities.",
    description_kn: "ಗ್ರಾಮೀಣ ಮತ್ತು ನಗರ ಪ್ರದೇಶಗಳಲ್ಲಿ ವಸತಿ ರಹಿತ ಮತ್ತು ಕಚ್ಚಾ ಮನೆಗಳಲ್ಲಿ ವಾಸಿಸುವ ಬಡ ಕುಟುಂಬಗಳಿಗೆ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣಕ್ಕಾಗಿ ಆರ್ಥಿಕ ಅನುದಾನ.",
    description_hi: "देश के सभी बेघर और कच्चे मकानों में रहने वाले परिवारों को बुनियादी सुविधाओं से युक्त पक्का घर बनाने हेतु वित्तीय सहायता।",
    benefits: [
      "Direct financial grant of ₹1,20,000 (Plains) and ₹1,30,000 (Hilly/NE states) transferred in geo-tagged installments",
      "Additional ₹12,000 grant for toilet construction under Swachh Bharat Mission",
      "90 to 95 days of unskilled labor wages under MGNREGA for house construction"
    ],
    eligibilityCriteria: {
      maxAnnualIncome: 300000,
      rules: [
        "Family must not own a pucca house anywhere in India",
        "Identification through SECC 2011 deprivation ranking or Awaas+ verified survey",
        "Women co-ownership or sole ownership prioritized"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card of all family members",
      "MGNREGA Job Card number",
      "Bank Account details mapped with Aadhaar",
      "Land possession certificate / self-declaration of land availability"
    ],
    applicationProcedure: {
      steps: [
        "Register name through Gram Panchayat / Village Administrative Officer or online on pmayg.nic.in",
        "Geo-tagging verification of existing kutcha house by field surveyor",
        "Sanction order generation and Direct Benefit Transfer across construction milestones"
      ],
      onlineUrl: "https://pmayg.nic.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://pmayg.nic.in",
    lastUpdated: "2026-02-11",
    isVerified: true,
    isPublished: true,
    viewCount: 2680,
    sourceVerificationStatus: "Official Government Verified"
  }
];

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('janaseva_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('janaseva_token', token);
    } else {
      localStorage.removeItem('janaseva_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('janaseva_token');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Schemes
  async getSchemes(params?: {
    q?: string;
    category?: string;
    classification?: string;
    state?: string;
    beneficiary?: string;
    sortBy?: string;
  }): Promise<{ success: boolean; total: number; schemes: Scheme[] }> {
    try {
      const url = new URL(`${API_BASE_URL}/schemes`);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v && v !== 'All') url.searchParams.append(k, v);
        });
      }
      const res = await fetch(url.toString(), { headers: this.getHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend offline, using client-side scheme filtering:', e);
    }

    // Client-side fallback
    let list = [...FALLBACK_SCHEMES];
    if (params?.q) {
      const q = params.q.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.name_kn && s.name_kn.toLowerCase().includes(q)) ||
        (s.name_hi && s.name_hi.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }
    if (params?.category && params.category !== 'All') {
      list = list.filter(s => s.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.classification && params.classification !== 'All') {
      list = list.filter(s => s.classification.toLowerCase() === params.classification!.toLowerCase());
    }
    if (params?.state && params.state !== 'All') {
      list = list.filter(s => s.state.toLowerCase() === params.state!.toLowerCase() || s.state === 'All India');
    }
    return { success: true, total: list.length, schemes: list };
  }

  async getSchemeById(idOrSlug: string): Promise<{ success: boolean; scheme: Scheme; related?: Scheme[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/schemes/${idOrSlug}`, { headers: this.getHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend fetch failed, using fallback item:', e);
    }
    const found = FALLBACK_SCHEMES.find(s => s.id === idOrSlug || s.slug === idOrSlug) || FALLBACK_SCHEMES[0];
    const related = FALLBACK_SCHEMES.filter(s => s.category === found.category && s.id !== found.id).slice(0, 3);
    return { success: true, scheme: found, related };
  }

  // Eligibility Evaluation
  async checkEligibility(input: {
    age: number;
    state: string;
    occupation: string;
    gender: string;
    beneficiaryCategory: string;
    annualIncome: number;
    educationLevel?: string;
    hasBPLCard?: boolean;
  }): Promise<{
    success: boolean;
    disclaimer: string;
    totalEvaluated: number;
    eligibleCount: number;
    eligibleSchemes: EligibilityResult[];
    partiallyEligible: EligibilityResult[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/eligibility/check`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(input)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend eligibility check offline, using local evaluator:', e);
    }

    // Local evaluation fallback
    const eligible: EligibilityResult[] = [];
    const partial: EligibilityResult[] = [];

    for (const s of FALLBACK_SCHEMES) {
      const reasons: string[] = [];
      const unmet: string[] = [];
      let score = 100;

      if (s.classification === 'State' && s.state.toLowerCase() !== input.state.toLowerCase()) {
        unmet.push(`Requires domicile in ${s.state}. Selected: ${input.state}`);
        score -= 50;
      } else {
        reasons.push(`Domicile verified for ${s.state}`);
      }

      if (s.eligibilityCriteria.gender && s.eligibilityCriteria.gender !== 'All') {
        if (s.eligibilityCriteria.gender.toLowerCase() === input.gender.toLowerCase()) {
          reasons.push(`Meets gender eligibility (${s.eligibilityCriteria.gender})`);
        } else {
          unmet.push(`Reserved for ${s.eligibilityCriteria.gender} applicants`);
          score -= 50;
        }
      }

      if (s.eligibilityCriteria.minAge && input.age < s.eligibilityCriteria.minAge) {
        unmet.push(`Minimum age required is ${s.eligibilityCriteria.minAge} years`);
        score -= 30;
      }

      if (s.eligibilityCriteria.maxAnnualIncome && input.annualIncome > s.eligibilityCriteria.maxAnnualIncome) {
        unmet.push(`Income exceeds max limit of ₹${s.eligibilityCriteria.maxAnnualIncome.toLocaleString('en-IN')}`);
        score -= 40;
      }

      const isElig = unmet.length === 0;
      const resItem: EligibilityResult = {
        schemeId: s.id,
        schemeName: s.name,
        category: s.category,
        isEligible: isElig,
        matchScore: Math.max(10, Math.min(100, score)),
        matchingReasons: reasons,
        unmetConditions: unmet,
        requiredDocuments: s.requiredDocuments,
        officialUrl: s.officialWebsite
      };

      if (isElig) eligible.push(resItem);
      else if (resItem.matchScore >= 40) partial.push(resItem);
    }

    return {
      success: true,
      disclaimer: "Official Disclaimer: Preliminary advisory result only. Final sanction depends on official verification by the concerned government authority.",
      totalEvaluated: FALLBACK_SCHEMES.length,
      eligibleCount: eligible.length,
      eligibleSchemes: eligible,
      partiallyEligible: partial
    };
  }

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch {
      // Mock login for offline demonstration
      if (email.includes('admin')) {
        const demoAdmin: User = {
          id: 'user-admin-01',
          fullName: 'Govt Admin Officer',
          email: 'admin@janaseva.gov.in',
          role: 'admin',
          state: 'Karnataka',
          occupation: 'Public Administrator',
          incomeRange: 'Above 5 Lakhs'
        };
        this.setToken('mock_admin_token');
        return { success: true, token: 'mock_admin_token', user: demoAdmin };
      }
      const demoCitizen: User = {
        id: 'user-citizen-01',
        fullName: 'Ramesh Gowda',
        email: email || 'citizen@janaseva.gov.in',
        role: 'citizen',
        state: 'Karnataka',
        occupation: 'Farmer',
        incomeRange: '1 Lakh - 2.5 Lakhs'
      };
      this.setToken('mock_citizen_token');
      return { success: true, token: 'mock_citizen_token', user: demoCitizen };
    }
  }

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    state?: string;
    occupation?: string;
    incomeRange?: string;
  }): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.token) {
        this.setToken(resData.token);
      }
      return resData;
    } catch {
      const mockUser: User = {
        id: `user-${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        role: 'citizen',
        state: data.state || 'Karnataka',
        occupation: data.occupation || 'General Citizen',
        incomeRange: data.incomeRange || 'Below 2.5 Lakhs'
      };
      this.setToken('mock_user_token');
      return { success: true, token: 'mock_user_token', user: mockUser };
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Demo mode: Password reset code generated.',
        devOtp: '123456'
      };
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Demo mode: Password reset successful.'
      };
    }
  }

  // Saved Schemes
  async getSavedSchemes(): Promise<{ success: boolean; schemes: Scheme[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/saved-schemes`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch { }
    const local = JSON.parse(localStorage.getItem('janaseva_saved_ids') || '["scheme-pm-kisan"]');
    const schemes = FALLBACK_SCHEMES.filter(s => local.includes(s.id));
    return { success: true, schemes };
  }

  async toggleSaveScheme(schemeId: string): Promise<{ success: boolean; saved: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/saved-schemes/${schemeId}/toggle`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch { }
    let local: string[] = JSON.parse(localStorage.getItem('janaseva_saved_ids') || '["scheme-pm-kisan"]');
    let saved = false;
    if (local.includes(schemeId)) {
      local = local.filter(id => id !== schemeId);
    } else {
      local.push(schemeId);
      saved = true;
    }
    localStorage.setItem('janaseva_saved_ids', JSON.stringify(local));
    return { success: true, saved };
  }

  // Applications
  async getApplications(): Promise<{ success: boolean; applications: ApplicationRecord[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/applications`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch { }
    const local: ApplicationRecord[] = JSON.parse(localStorage.getItem('janaseva_apps') || JSON.stringify([
      {
        id: 'app-01',
        userId: 'demo-user',
        schemeId: 'scheme-pm-kisan',
        applicationRefNo: 'PMK-2026-KA-9812',
        appliedDate: '2026-02-01',
        status: 'Submitted',
        notes: 'Submitted RTC through Grama One center.',
        updatedAt: new Date().toISOString(),
        scheme: FALLBACK_SCHEMES.find(s => s.id === 'scheme-pm-kisan')
      }
    ]));
    return { success: true, applications: local };
  }

  async addApplication(record: {
    schemeId: string;
    applicationRefNo: string;
    appliedDate: string;
    status: 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected';
    notes: string;
  }): Promise<{ success: boolean; application: ApplicationRecord }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/applications`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(record)
      });
      if (res.ok) return await res.json();
    } catch { }
    const newApp: ApplicationRecord = {
      id: `app-${Date.now()}`,
      userId: 'demo-user',
      schemeId: record.schemeId,
      applicationRefNo: record.applicationRefNo,
      appliedDate: record.appliedDate,
      status: record.status,
      notes: record.notes,
      updatedAt: new Date().toISOString(),
      scheme: FALLBACK_SCHEMES.find(s => s.id === record.schemeId)
    };
    const current = (await this.getApplications()).applications;
    current.unshift(newApp);
    localStorage.setItem('janaseva_apps', JSON.stringify(current));
    return { success: true, application: newApp };
  }

  async updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<{ success: boolean; application?: ApplicationRecord }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/applications/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch { }
    const current = (await this.getApplications()).applications;
    const idx = current.findIndex(a => a.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('janaseva_apps', JSON.stringify(current));
      return { success: true, application: current[idx] };
    }
    return { success: false };
  }

  async deleteApplication(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/applications/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch { }
    let current = (await this.getApplications()).applications;
    current = current.filter(a => a.id !== id);
    localStorage.setItem('janaseva_apps', JSON.stringify(current));
    return { success: true };
  }

  // Statutory Data Rights: Erasure & Export (DPDP Act 2023 & GDPR)
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/account`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch { }
    // Clear local storage fallbacks
    localStorage.removeItem('janaseva_token');
    localStorage.removeItem('janaseva_user');
    localStorage.removeItem('janaseva_saved_ids');
    localStorage.removeItem('janaseva_apps');
    return { success: true, message: 'Account data purged successfully.' };
  }

  async exportUserData(): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/export-data`, {
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch { }
    // Fallback export from localStorage
    const user = JSON.parse(localStorage.getItem('janaseva_user') || '{}');
    const apps = JSON.parse(localStorage.getItem('janaseva_apps') || '[]');
    const saved = JSON.parse(localStorage.getItem('janaseva_saved_ids') || '[]');
    return {
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        complianceStandard: 'India DPDP Act 2023 & GDPR Article 20',
        profile: user,
        savedSchemes: saved,
        applications: apps
      }
    };
  }

  // Assistant Chat
  async chatWithAssistant(
    message: string,
    language?: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<{
    success: boolean;
    reply: string;
    suggestedSchemes?: Array<{ id: string; name: string; category: string; slug: string; officialWebsite: string }>;
    modelUsed?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language, history })
      });
      if (res.ok) return await res.json();
    } catch { }

    // Offline intelligence
    const q = message.toLowerCase();
    if (q.includes('gruha') || q.includes('ಗೃಹ')) {
      return {
        success: true,
        reply: "Gruha Lakshmi Yojana provides ₹2,000 monthly financial assistance to the woman head of household in Karnataka. Key documents needed: Aadhaar Card, Ration Card (BPL/APL), and Aadhaar-seeded bank account. You can apply at Grama One or Karnataka One centers, or via sevasindhugs.karnataka.gov.in.",
        suggestedSchemes: [{ id: 'scheme-gruha-lakshmi', name: 'Gruha Lakshmi Yojana', category: 'Women Empowerment', slug: 'gruha-lakshmi-yojana', officialWebsite: 'https://sevasindhugs.karnataka.gov.in' }]
      };
    }
    if (q.includes('kisan') || q.includes('ರೈತ') || q.includes('farmer')) {
      return {
        success: true,
        reply: "PM-KISAN provides ₹6,000 per year directly to eligible landholder farmers in 3 installments of ₹2,000 each. Required: Land RTC (Pahani), Aadhaar card, and e-KYC on pmkisan.gov.in.",
        suggestedSchemes: [{ id: 'scheme-pm-kisan', name: 'PM-KISAN', category: 'Farmer Welfare', slug: 'pm-kisan-samman-nidhi', officialWebsite: 'https://pmkisan.gov.in' }]
      };
    }
    return {
      success: true,
      reply: "Welcome to Janaseva Assistant! I can help you find verified Central and Karnataka state government schemes. Ask me about PM-KISAN, Gruha Lakshmi, SSP Scholarship, Shakti bus scheme, or Ayushman Bharat."
    };
  }

  async askChatbot(message: string, language?: string, history?: Array<{ role: 'user' | 'assistant'; content: string }>) {
    return this.chatWithAssistant(message, language, history);
  }

  // VoiceStudio Local Voice Assistant Integration
  async getVoiceStudioStatus(): Promise<{ success: boolean; online: boolean; serviceUrl?: string; engine?: string; voices?: string[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/assistant/voice/status`);
      if (res.ok) return await res.json();
    } catch { }
    return { success: false, online: false };
  }

  async synthesizeSpeechVoiceStudio(text: string, language: 'en' | 'kn' | 'hi' = 'en', voice = 'nova'): Promise<Blob | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/assistant/voice/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, voice })
      });
      if (res.ok) {
        return await res.blob();
      }
    } catch (e) {
      console.warn('VoiceStudio speech synthesis error:', e);
    }
    return null;
  }

  async transcribeSpeechVoiceStudio(audioBlob: Blob, language?: 'en' | 'kn' | 'hi'): Promise<string | null> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = window.btoa(binary);

      const res = await fetch(`${API_BASE_URL}/assistant/voice/stt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64, language })
      });
      if (res.ok) {
        const data = await res.json();
        return data.text || null;
      }
    } catch (e) {
      console.warn('VoiceStudio speech transcription error:', e);
    }
    return null;
  }

  // Admin Schemes Management
  async createScheme(schemeData: any): Promise<{ success: boolean; scheme?: Scheme; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/schemes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(schemeData)
      });
      return await res.json();
    } catch (e: any) {
      console.warn('Admin create scheme failed:', e);
      return { success: false, message: e.message || 'Failed to create scheme' };
    }
  }

  async deleteScheme(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/schemes/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (e: any) {
      console.warn('Admin delete scheme failed:', e);
      return { success: false, message: e.message || 'Failed to delete scheme' };
    }
  }

  async getAdminUsers(): Promise<{ success: boolean; count: number; users: any[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Admin get users failed:', e);
    }
    return {
      success: true,
      count: 2,
      users: [
        { id: 'user-citizen-01', fullName: 'Ramesh Gowda', email: 'citizen@janaseva.gov.in', role: 'citizen', state: 'Karnataka', occupation: 'Farmer', createdAt: '2026-01-15' },
        { id: 'user-admin-01', fullName: 'Govt Admin Officer', email: 'admin@janaseva.gov.in', role: 'admin', state: 'Karnataka', occupation: 'Public Administrator', createdAt: '2026-01-01' }
      ]
    };
  }

  // Admin Metrics
  async getAdminMetrics() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/metrics`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch { }

    // Fallback metrics for dashboard
    return {
      success: true,
      stats: {
        totalUsers: 148,
        citizenCount: 142,
        adminCount: 6,
        totalSchemes: FALLBACK_SCHEMES.length,
        publishedSchemes: FALLBACK_SCHEMES.length,
        verifiedSchemes: FALLBACK_SCHEMES.length,
        totalViews: 14630
      },
      categoryChartData: [
        { category: 'Women Empowerment', count: 2 },
        { category: 'Student Scholarships', count: 2 },
        { category: 'Farmer Welfare', count: 2 },
        { category: 'Health & Welfare', count: 1 },
        { category: 'Employment', count: 2 },
        { category: 'Financial Assistance', count: 1 }
      ],
      mostViewed: [
        { name: 'PM-KISAN', views: 3120 },
        { name: 'Ayushman Bharat', views: 2840 },
        { name: 'Karnataka SSP', views: 2310 },
        { name: 'Yuva Nidhi', views: 2150 },
        { name: 'PMFBY Crop Ins', views: 1980 }
      ],
      classificationCounts: {
        Central: 6,
        State: 4
      },
      recentLogs: [
        {
          id: 'log-01',
          adminEmail: 'admin@janaseva.gov.in',
          action: 'PUBLISH_SCHEME',
          target: 'Gruha Lakshmi Yojana',
          details: 'Official DBT guidelines verified from Women & Child Development Dept.',
          timestamp: new Date().toISOString()
        },
        {
          id: 'log-02',
          adminEmail: 'admin@janaseva.gov.in',
          action: 'SOURCE_VERIFICATION',
          target: 'Karnataka SSP',
          details: 'Academic year 2026-27 Kutumba validation rules integrated.',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
        }
      ]
    };
  }
}

export const api = new ApiService();
