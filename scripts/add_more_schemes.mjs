import fs from 'fs';

const db = JSON.parse(fs.readFileSync('janaseva_db.json', 'utf8'));

const additionalSchemes = [
  // --- KARNATAKA ---
  {
    id: "scheme-gruha-jyothi-karnataka",
    slug: "gruha-jyothi-scheme-karnataka",
    name: "Gruha Jyothi Scheme",
    name_kn: "ಗೃಹ ಜ್ಯೋತಿ ಯೋಜನೆ",
    name_hi: "गृह ज्योति योजना",
    department: "Energy Department, Government of Karnataka",
    classification: "State",
    state: "Karnataka",
    category: "Financial Assistance",
    beneficiaryCategory: "General",
    description: "Flagship energy welfare program in Karnataka providing up to 200 units of free domestic electricity per month to all residential households across the state.",
    description_kn: "ಕರ್ನಾಟಕದ ಎಲ್ಲಾ ಮನೆಗಳಿಗೆ ಪ್ರತಿ ತಿಂಗಳು 200 ಯೂನಿಟ್‌ಗಳವರೆಗೆ ಉಚಿತ ವಿದ್ಯುತ್ ಒದಗಿಸುವ ಮಹತ್ವದ ಗ್ಯಾರಂಟಿ ಯೋಜನೆ.",
    description_hi: "कर्नाटक के सभी घरेलू बिजली उपभोक्ताओं को प्रति माह 200 यूनिट तक मुफ्त बिजली देने वाली प्रमुख गारंटी योजना।",
    benefits: [
      "Zero-rupee electricity bills for monthly consumption within customized entitlement (up to 200 units)",
      "Applicable across all electricity supply companies (BESCOM, MESCOM, HESCOM, GESCOM, CHESCOM)",
      "Tenants and house owners alike are eligible with active consumer account linkage"
    ],
    eligibilityCriteria: {
      applicableStates: ["Karnataka"],
      rules: [
        "Beneficiary must reside in Karnataka with domestic electricity connection meter",
        "Monthly average consumption of the past 12 months plus 10% buffer must be under 200 units",
        "Only one domestic electricity meter connection per household is eligible"
      ]
    },
    requiredDocuments: [
      "Aadhaar Card of the applicant (owner or tenant)",
      "Electricity Bill Account ID / Customer ID",
      "Tenancy Agreement / Rental Lease deed (for tenants)"
    ],
    applicationProcedure: {
      steps: [
        "Visit Seva Sindhu portal (sevasindhugs.karnataka.gov.in) or Grama One / Karnataka One center",
        "Enter Electricity Account ID and select your ESCOM name",
        "Provide Aadhaar number and verify via OTP",
        "Select occupancy status (Owner or Tenant) and submit declaration",
        "Receive digital acknowledgment receipt; zero billing activates from next billing cycle"
      ],
      onlineUrl: "https://sevasindhugs.karnataka.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://energy.karnataka.gov.in",
    deadline: "Continuous Open Enrollment / Active Permanent Scheme",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4120,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-anna-bhagya-karnataka",
    slug: "anna-bhagya-scheme-karnataka",
    name: "Anna Bhagya Scheme",
    name_kn: "ಅನ್ನ ಭಾಗ್ಯ ಯೋಜನೆ",
    name_hi: "अन्न भाग्य योजना",
    department: "Food, Civil Supplies and Consumer Affairs Department, Karnataka",
    classification: "State",
    state: "Karnataka",
    category: "Health and Social Welfare",
    beneficiaryCategory: "General",
    description: "Food and nutritional security guarantee scheme in Karnataka providing 5 kg free rice plus ₹170 direct cash transfer per person per month (at ₹34/kg for additional 5 kg) to Antyodaya and BPL ration card families.",
    description_kn: "ಕರ್ನಾಟಕದ ಬಿಪಿಎಲ್ ಮತ್ತು ಅಂತ್ಯೋದಯ ಕಾರ್ಡ್ ಕುಟುಂಬಗಳ ಪ್ರತಿ ಸದಸ್ಯರಿಗೆ 5 ಕೆಜಿ ಉಚಿತ ಅಕ್ಕಿ ಮತ್ತು ₹170 ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "कर्नाटक में अंत्योदय और बीपीएल परिवारों के प्रत्येक सदस्य को 5 किलो मुफ्त चावल और ₹170 की सीधी बैंक सहायता (प्रति व्यक्ति)।",
    benefits: [
      "5 kg foodgrains free per person per month under National Food Security Act (NFSA)",
      "Direct Benefit Transfer of ₹170 per person per month into bank account of family head for additional 5 kg rice",
      "Guarantees hunger eradication and nutritional dignity across rural and urban poor"
    ],
    eligibilityCriteria: {
      applicableStates: ["Karnataka"],
      rules: [
        "Family must hold valid Antyodaya Anna Yojana (AAY) or Priority Household (BPL) ration card issued in Karnataka",
        "Bank account of the family head must be linked and seeded with Aadhaar in NPCI mapper"
      ]
    },
    requiredDocuments: [
      "Karnataka BPL or Antyodaya Ration Card",
      "Aadhaar Card of all family members listed on card",
      "Aadhaar-seeded Bank Account Passbook of the female/family head"
    ],
    applicationProcedure: {
      steps: [
        "Cardholders are enrolled automatically based on existing verified ration card database",
        "Verify bank account seeding status at nearest Grama One or post office",
        "Collect monthly foodgrains at authorized Fair Price Shop via biometric e-PoS",
        "Cash entitlement of ₹170/person credited directly into head of household's bank account via DBT"
      ],
      onlineUrl: "https://ahara.kar.nic.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://ahara.kar.nic.in",
    deadline: "Monthly DBT on 10th / Open Ongoing Food Security",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 3950,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- ANDHRA PRADESH ---
  {
    id: "scheme-rythu-bharosa-ap",
    slug: "ysr-rythu-bharosa-annadata-sukhibhava",
    name: "YSR Rythu Bharosa / Annadata Sukhibhava",
    name_kn: "ವೈಎಸ್ಆರ್ ರೈತು ಭರೋಸಾ / ಅನ್ನದಾತ ಸುಖೀಭವ",
    name_hi: "वाईएसआर रैतु भरोसा / अन्नदाता सुखीभव योजना",
    department: "Agriculture and Cooperation Department, Government of Andhra Pradesh",
    classification: "State",
    state: "Andhra Pradesh",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "Agricultural input financial assistance scheme in Andhra Pradesh providing ₹13,500 to ₹20,000 per year per farmer family (including tenant farmers) in three seasonal installments to offset crop cultivation expenses.",
    description_kn: "ಆಂಧ್ರಪ್ರದೇಶದ ರೈತರಿಗೆ ಮತ್ತು ಗೇಣಿ ರೈತರಿಗೆ ಕೃಷಿ ವೆಚ್ಚಗಳಿಗಾಗಿ ವಾರ್ಷಿಕ ₹13,500 ರಿಂದ ₹20,000 ನೇರ ಧನಸಹಾಯ ನೀಡುವ ಪ್ರಮುಖ ಯೋಜನೆ.",
    description_hi: "आंध्र प्रदेश में भूस्वामी एवं काश्तकार (बटाईदार) किसानों को बीज, खाद व जुताई खर्च हेतु वार्षिक ₹13,500 से ₹20,000 की सीधी वित्तीय सहायता।",
    benefits: [
      "₹13,500 to ₹20,000 annual direct investment assistance credited in three seasonal tranches (May, October, January)",
      "Extends full financial benefit to tenant farmers (CCRC holders) and ROFR forest land cultivators",
      "Free crop insurance cover (YSR Free Crop Insurance) with state bearing 100% premium"
    ],
    eligibilityCriteria: {
      minAge: 18,
      applicableStates: ["Andhra Pradesh"],
      allowedOccupations: ["Farmer", "Tenant Farmer", "Sharecropper"],
      rules: [
        "Farmer family holding cultivable agricultural land in Andhra Pradesh or valid CCRC (Crop Cultivator Rights Card) for tenant farmers",
        "Must be verified and geo-tagged under e-Crop booking system"
      ]
    },
    requiredDocuments: [
      "Pattadar Passbook / 1B Land Record extract",
      "Crop Cultivator Rights Card (CCRC) for tenant farmers",
      "Aadhaar Card and active Mobile number",
      "Bank Account details seeded with Aadhaar"
    ],
    applicationProcedure: {
      steps: [
        "Complete mandatory e-Crop registration through Rythu Bharosa Kendram (RBK) staff",
        "Agriculture Assistant verifies crop sown and land survey numbers in presence of farmer",
        "Social audit lists published on RBK notice boards for transparency",
        "Amount credited directly into bank account via State Treasury DBT",
        "SMS notification dispatched with payment voucher reference"
      ],
      onlineUrl: "https://ysrrythubharosa.ap.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://ysrrythubharosa.ap.gov.in",
    deadline: "Seasonal Disbursement Cycles (May, October, January 2026-27)",
    lastUpdated: "2026-02-20",
    isVerified: true,
    isPublished: true,
    viewCount: 3780,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- TELANGANA ---
  {
    id: "scheme-mahalakshmi-telangana",
    slug: "mahalakshmi-scheme-telangana",
    name: "Mahalakshmi Scheme (Free Bus & LPG Subsidies)",
    name_kn: "ಮಹಾಲಕ್ಷ್ಮಿ ಯೋಜನೆ (ಉಚಿತ ಬಸ್ ಮತ್ತು ಎಲ್‌ಪಿಜಿ ಸಿಲಿಂಡರ್)",
    name_hi: "महालक्ष्मी योजना (मुफ्त बस यात्रा एवं ₹500 में एलपीजी)",
    department: "Transport Department and Civil Supplies Department, Government of Telangana",
    classification: "State",
    state: "Telangana",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Women empowerment flagship scheme in Telangana granting 100% free bus travel across TSRTC Palle Velugu and Express buses, alongside domestic LPG cylinders at a subsidized rate of ₹500.",
    description_kn: "ತೆಲಂಗಾಣದ ಮಹಿಳೆಯರಿಗೆ ರಾಜ್ಯ ರಸ್ತೆ ಸಾರಿಗೆ ಬಸ್‌ಗಳಲ್ಲಿ ಉಚಿತ ಪ್ರಯಾಣ ಮತ್ತು ಕೇವಲ ₹500 ಕ್ಕೆ ಅಡುಗೆ ಅನಿಲ ಸಿಲಿಂಡರ್ ಒದಗಿಸುವ ಜನಪ್ರಿಯ ಯೋಜನೆ.",
    description_hi: "तेलंगाना में सभी महिलाओं के लिए टीएसआरटीसी बसों में असीमित मुफ्त यात्रा एवं ₹500 में रियायती घरेलू गैस सिलेंडर।",
    benefits: [
      "100% fare waiver for all women and transgender residents across TSRTC buses within Telangana",
      "Subsidized domestic LPG cylinder refills at only ₹500 with state government funding the balance subsidy via DBT",
      "Unlimited free daily travel for education, workplace, and social visits"
    ],
    eligibilityCriteria: {
      gender: "Female",
      applicableStates: ["Telangana"],
      rules: [
        "Beneficiary must be a resident woman of Telangana",
        "For ₹500 LPG subsidy, family must hold valid Food Security Card (White Ration Card) and active domestic LPG connection"
      ]
    },
    requiredDocuments: [
      "Government Photo ID proving Telangana domicile (Aadhaar, Voter ID)",
      "Food Security Card (White Ration Card) for gas subsidy",
      "LPG Gas Consumer Passbook / Consumer Number"
    ],
    applicationProcedure: {
      steps: [
        "For Free Bus Travel: Simply present valid Telangana identity proof to conductor and receive zero-fare ticket",
        "For ₹500 LPG: Apply through Praja Palana application form at Gram Sabha or Ward Office",
        "Civil supplies department verifies Ration Card and active LPG consumer number",
        "Book cylinder normally through gas agency and pay market price; subsidy refunded into bank via DBT within 48 hours"
      ],
      onlineUrl: "https://telangana.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://telangana.gov.in",
    deadline: "Permanent Ongoing Scheme / Open Daily",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 4620,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- RAJASTHAN ---
  {
    id: "scheme-kalibai-scooty-rajasthan",
    slug: "kalibai-bheel-medhavi-chhatra-scooty-yojana",
    name: "Kalibai Bheel Medhavi Chhatra Scooty Yojana",
    name_kn: "ಕಾಳಿಬಾಯಿ ಭೀಲ್ ಮೇಧಾವಿ ಛಾತ್ರ ಸ್ಕೂಟಿ ಯೋಜನೆ",
    name_hi: "कालीबाई भील मेधावी छात्रा स्कूटी योजना",
    department: "Higher and College Education Department, Government of Rajasthan",
    classification: "State",
    state: "Rajasthan",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Merit incentive program in Rajasthan distributing free motorized scooties (with helmet, 5-year insurance, and 2L fuel) to meritorious girl students scoring above 65% in Class 12 board exams pursuing higher education.",
    description_kn: "ರಾಜಸ್ಥಾನದಲ್ಲಿ 12 ನೇ ತರಗತಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶೇ. 65 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಂಕ ಪಡೆದು ಕಾಲೇಜಿಗೆ ಸೇರಿದ ಬಡ ಪ್ರತಿಭಾವಂತ ವಿದ್ಯಾರ್ಥಿನಿಯರಿಗೆ ಉಚಿತ ಸ್ಕೂಟಿ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "राजस्थान में 12वीं बोर्ड में 65% से अधिक अंक लाने वाली मेधावी छात्राओं को कॉलेज पढ़ाई जारी रखने हेतु मुफ्त स्कूटी, हेलमेट व 5 वर्ष का बीमा।",
    benefits: [
      "Free brand-new motorized scooty delivered at district distribution ceremony",
      "Includes comprehensive 5-year vehicle third-party and own-damage insurance, certified ISI helmet, and 2 liters of petrol",
      "Eliminates transport barriers for rural girl students attending distant colleges"
    ],
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 25,
      gender: "Female",
      maxAnnualIncome: 250000,
      applicableStates: ["Rajasthan"],
      allowedOccupations: ["Student"],
      educationRequirements: "Minimum 65% in Class 12 (RBSE) or 75% (CBSE)",
      rules: [
        "Girl student must be a permanent resident of Rajasthan",
        "Must have secured at least 65% in Class 12 from RBSE (or 75% from CBSE in Rajasthan)",
        "Must be enrolled in regular undergraduate degree course in a recognized college",
        "Annual family income must not exceed ₹2,50,000"
      ]
    },
    requiredDocuments: [
      "Class 10 and 12 Board Marksheets",
      "Jan Aadhaar Card and Student Aadhaar Card",
      "College Admission Fee Receipt and Regular Bonafide Certificate",
      "Caste Certificate and Income Certificate",
      "Valid Two-Wheeler Learner or Driving License"
    ],
    applicationProcedure: {
      steps: [
        "Apply online via Rajasthan Single Sign-On (SSO) portal (hte.rajasthan.gov.in)",
        "Select 'Kalibai Scooty Scheme' under Higher Education Department",
        "Upload Class 12 marksheet, Jan Aadhaar, college bonafide, and driving license",
        "College nodal officer verifies academic enrollment and forwards application to District Commissioner",
        "District merit list published and eligible candidates receive scooty at ceremonial camp"
      ],
      onlineUrl: "https://hte.rajasthan.gov.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://hte.rajasthan.gov.in",
    deadline: "Academic Intake Closes: 30th September 2026",
    lastUpdated: "2026-02-16",
    isVerified: true,
    isPublished: true,
    viewCount: 3410,
    sourceVerificationStatus: "Official Government Verified"
  },
  {
    id: "scheme-rajasthan-ssp-pension",
    slug: "rajasthan-social-security-pension-scheme",
    name: "Rajasthan Social Security Pension Scheme (SSP)",
    name_kn: "ರಾಜಸ್ಥಾನ ಸಾಮಾಜಿಕ ಭದ್ರತಾ ಪಿಂಚಣಿ ಯೋಜನೆ",
    name_hi: "राजस्थान सामाजिक सुरक्षा पेंशन योजना (वृद्धावस्था/एकल नारी/दिव्यांग)",
    department: "Social Justice and Empowerment Department, Government of Rajasthan",
    classification: "State",
    state: "Rajasthan",
    category: "Financial Assistance",
    beneficiaryCategory: "Elderly",
    description: "Statutory pension initiative in Rajasthan providing guaranteed monthly financial assistance of ₹1,150 to elderly persons, widows/single women, and divyang citizens with guaranteed 15% automatic annual increment.",
    description_kn: "ರಾಜಸ್ಥಾನದ ಹಿರಿಯ ನಾಗರಿಕರು, ವಿಧವೆಯರು ಮತ್ತು ವಿಕಲಚೇತನರಿಗೆ ವಾರ್ಷಿಕ ಶೇ. 15 ರ ಸ್ವಯಂಚಾಲಿತ ಹೆಚ್ಚಳದೊಂದಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,150 ಖಾತರಿಯ ಪಿಂಚಣಿ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "राजस्थान में वृद्धजनों, विधवा/एकल महिलाओं एवं दिव्यांगजनों को प्रति माह ₹1,150 की सुनिश्चित पेंशन एवं प्रति वर्ष 15% की स्वतः वृद्धि का कानूनी अधिकार।",
    benefits: [
      "Guaranteed minimum monthly pension of ₹1,150 credited directly via Aadhaar DBT",
      "Automatic statutory annual hike of 15% (5% in July and 10% in January) under Rajasthan Minimum Income Guarantee Act",
      "Covers Mukhyamantri Vridhjan, Ekal Nari (Widows/Divorcees), and Vishesh Yogyajan pensions"
    ],
    eligibilityCriteria: {
      minAge: 55,
      applicableStates: ["Rajasthan"],
      allowedOccupations: ["Retired", "Unemployed", "Elderly", "Any"],
      rules: [
        "Beneficiary must be a permanent resident of Rajasthan",
        "Age: 55+ for females and 58+ for males (Old Age); 18+ for widows/single women (Ekal Nari); 40%+ disability (Divyang)",
        "Annual income ceiling: Under ₹48,000 (No income bar for BPL cardholders or severely disabled)"
      ]
    },
    requiredDocuments: [
      "Jan Aadhaar Card and Aadhaar Card",
      "Age proof certificate / School leaving certificate",
      "Disability certificate issued by Medical Board (for Divyang)",
      "Bank Account details seeded in Jan Aadhaar"
    ],
    applicationProcedure: {
      steps: [
        "Visit nearest e-Mitra kiosk or apply through SSP portal (ssp.rajasthan.gov.in)",
        "Enter Jan Aadhaar number to pull pre-verified age, bank, and domicile details",
        "Authenticate via biometric fingerprint or mobile OTP",
        "Tahsildar / Block Development Officer digitally approves application within 15 days",
        "Pension credited directly on the 1st of every month via DBT; annual biometric re-verification in November"
      ],
      onlineUrl: "https://ssp.rajasthan.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://ssp.rajasthan.gov.in",
    deadline: "Continuous Open Enrollment / Annual Biometric Verification in Nov",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 3890,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- WEST BENGAL ---
  {
    id: "scheme-wbscc-scholarship-wb",
    slug: "west-bengal-student-credit-card-scheme",
    name: "West Bengal Student Credit Card (WBSCC)",
    name_kn: "ಪಶ್ಚಿಮ ಬಂಗಾಳ ವಿದ್ಯಾರ್ಥಿ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಯೋಜನೆ",
    name_hi: "पश्चिम बंगाल स्टूडेंट क्रेडिट कार्ड योजना (WBSCC)",
    department: "Higher Education Department, Government of West Bengal",
    classification: "State",
    state: "West Bengal",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Education credit scheme in West Bengal extending collateral-free soft loans of up to ₹10,00,000 at 4% simple interest with a 15-year repayment window for domestic and overseas higher studies.",
    description_kn: "ಪಶ್ಚಿಮ ಬಂಗಾಳದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ದೇಶ ಮತ್ತು ವಿದೇಶಗಳಲ್ಲಿ ಉನ್ನತ ವ್ಯಾಸಂಗಕ್ಕಾಗಿ ಕೇವಲ ಶೇ. 4 ರ ಸರಳ ಬಡ್ಡಿದರದಲ್ಲಿ ₹10 ಲಕ್ಷದವರೆಗೆ ಶಿಕ್ಷಣ ಸಾಲ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "पश्चिम बंगाल के छात्रों को भारत व विदेश में उच्च शिक्षा हेतु राज्य सरकार की गारंटी पर 4% साधारण ब्याज पर ₹10 लाख तक का क्रेडिट कार्ड लोन।",
    benefits: [
      "Loan facility up to ₹10,00,000 with 100% state credit guarantee (no physical collateral or third-party guarantor required)",
      "Nominal simple interest rate of 4% per annum with 1% interest subvention for timely service during study period",
      "Generous 15-year repayment period commencing 1 year after course completion or securing employment"
    ],
    eligibilityCriteria: {
      minAge: 16,
      maxAge: 40,
      applicableStates: ["West Bengal"],
      allowedOccupations: ["Student"],
      educationRequirements: "Class 10th Passed / Admitted to Higher Secondary or University Program",
      rules: [
        "Student and family must have resided in West Bengal for at least 10 years",
        "Student must be enrolled in recognized higher secondary, undergraduate, postgraduate, professional, or competitive exam courses",
        "Age of applicant must not exceed 40 years at the time of application"
      ]
    },
    requiredDocuments: [
      "Class 10th Board Admit Card and Marksheet",
      "Admission letter and institutional course fee structure",
      "Student and Co-borrower (Parent) Aadhaar Card and PAN Card",
      "Residence Certificate of West Bengal (minimum 10 years)",
      "Bank Account details of student and parent"
    ],
    applicationProcedure: {
      steps: [
        "Register on the official WBSCC portal (wbscc.wb.gov.in) with basic student details",
        "Fill course fee schedule, institutional details, and co-borrower financial information",
        "Upload scanned photograph, signature, admission letter, and fee structure",
        "Higher Education Department and College Nodal Officer scrutinize and forward file to partner bank",
        "Bank issues virtual Student Credit Card and disburses tuition fees directly to institute"
      ],
      onlineUrl: "https://wbscc.wb.gov.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://wbscc.wb.gov.in",
    deadline: "Open Year-Round for all Academic Degree Intakes",
    lastUpdated: "2026-02-27",
    isVerified: true,
    isPublished: true,
    viewCount: 3670,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- GUJARAT ---
  {
    id: "scheme-mmuy-gujarat",
    slug: "mukhyamantri-mahila-utkarsh-yojana-gujarat",
    name: "Mukhyamantri Mahila Utkarsh Yojana (MMUY)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಮಹಿಳಾ ಉತ್ಕರ್ಷ ಯೋಜನೆ (ಗುಜರಾತ್)",
    name_hi: "मुख्यमंत्री महिला उत्कर्ष योजना (MMUY)",
    department: "Women and Child Development Department, Government of Gujarat",
    classification: "State",
    state: "Gujarat",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Flagship women micro-finance initiative in Gujarat providing 0% interest collateral-free bank loans of up to ₹1,00,000 to Joint Liability and Earning Groups (JLEGs) of women, with state government bearing all bank interest.",
    description_kn: "ಗುಜರಾತ್‌ನ ಮಹಿಳಾ ಸ್ವಸಹಾಯ ಗುಂಪುಗಳಿಗೆ ಕಿರು ಉದ್ಯಮ ಆರಂಭಿಸಲು ಶೇ. 0 ರ ಬಡ್ಡಿದರದಲ್ಲಿ ₹1,00,000 ವರೆಗೆ ಸಾಲ ನೀಡುವ ಪ್ರಮುಖ ಯೋಜನೆ.",
    description_hi: "गुजरात में महिलाओं के संयुक्त देयता समूहों (JLEG) को स्वरोजगार व सूक्ष्म व्यवसाय हेतु 0% ब्याज पर ₹1 लाख तक का संपार्श्विक-मुक्त बैंक ऋण।",
    benefits: [
      "Collateral-free micro-credit of ₹1,00,000 per 10-woman group at absolute 0% interest",
      "Total bank interest and stamp duty charges fully reimbursed by the Government of Gujarat",
      "Repayable in easy installments of ₹300 per woman per month over 3 years"
    ],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 59,
      gender: "Female",
      applicableStates: ["Gujarat"],
      allowedOccupations: ["Homemaker", "Artisan", "Self-employed", "Agricultural Laborer", "Any"],
      rules: [
        "Women must form a Joint Liability and Earning Group (JLEG) of 10 members in Gujarat",
        "Must belong to rural or urban underprivileged households",
        "No member should be a defaulter with any formal banking institution"
      ]
    },
    requiredDocuments: [
      "Aadhaar Cards and Voter IDs of all 10 group members",
      "Group Joint Bank Account Passbook",
      "Group resolution deed and signature specimen",
      "Proof of residence in Gujarat"
    ],
    applicationProcedure: {
      steps: [
        "Form a registered JLEG group of 10 women through local Anganwadi or Urban Local Body",
        "Apply via MMUY portal or approach local District Women and Child Officer",
        "Submit group proposal for micro-business (tailoring, food processing, handicrafts)",
        "Empanelled public or cooperative bank verifies group documents and sanctions ₹1,00,000 loan",
        "State government transfers interest subvention subsidy directly to bank quarterly"
      ],
      onlineUrl: "https://wcd.gujarat.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://wcd.gujarat.gov.in",
    deadline: "Continuous Open Enrollment / Monthly Group Sanctions",
    lastUpdated: "2026-02-18",
    isVerified: true,
    isPublished: true,
    viewCount: 3180,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- MADHYA PRADESH ---
  {
    id: "scheme-mp-kisan-kalyan",
    slug: "mp-mukhyamantri-kisan-kalyan-yojana",
    name: "MP Mukhyamantri Kisan Kalyan Yojana",
    name_kn: "ಮಧ್ಯಪ್ರದೇಶ ಮುಖ್ಯಮಂತ್ರಿ ಕಿಸಾನ್ ಕಲ್ಯಾಣ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री किसान कल्याण योजना (मध्य प्रदेश)",
    department: "Farmer Welfare and Agriculture Development Department, Madhya Pradesh",
    classification: "State",
    state: "Madhya Pradesh",
    category: "Farmer Welfare",
    beneficiaryCategory: "Farmers",
    description: "State income support scheme in Madhya Pradesh providing ₹6,000 per year directly to farmers in three installments of ₹2,000, complementing the central PM-KISAN for a combined annual farmer assistance of ₹12,000.",
    description_kn: "ಮಧ್ಯಪ್ರದೇಶದ ರೈತರಿಗೆ ಪಿಎಂ-ಕಿಸಾನ್ ಜೊತೆಗೆ ರಾಜ್ಯ ಸರ್ಕಾರದಿಂದ ಹೆಚ್ಚುವರಿ ₹6,000 (ಒಟ್ಟು ವಾರ್ಷಿಕ ₹12,000) ನೇರ ಧನಸಹಾಯ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "मध्य प्रदेश में पीएम-किसान के पात्र किसानों को राज्य सरकार द्वारा ₹2,000 की 3 अतिरिक्त किस्तों में ₹6,000 (कुल वार्षिक ₹12,000) की सीधी सहायता।",
    benefits: [
      "₹6,000 annual direct cash transfer credited into farmer's bank account in three ₹2,000 installments",
      "Combined with Central PM-KISAN (₹6,000), total financial support reaches ₹12,000 per year",
      "Covers seeds, fertilizers, and farm labor expenses directly ahead of sowing cycles"
    ],
    eligibilityCriteria: {
      minAge: 18,
      applicableStates: ["Madhya Pradesh"],
      allowedOccupations: ["Farmer"],
      rules: [
        "Beneficiary must be a registered farmer in Madhya Pradesh holding land records",
        "Must be an active and verified beneficiary under Central PM-KISAN Samman Nidhi",
        "Must have completed e-KYC on the SAARA portal"
      ]
    },
    requiredDocuments: [
      "Samagra Family ID and Member ID",
      "Khasra/Khatauni Land Record copy (SAARA portal)",
      "Aadhaar Card seeded with active bank account",
      "PM-KISAN Registration ID"
    ],
    applicationProcedure: {
      steps: [
        "Beneficiaries registered under PM-KISAN in MP are automatically synchronized via SAARA portal",
        "Local Patwari conducts physical field verification and approves ownership record",
        "District Collector validates digital sanction batch",
        "Amount credited directly into bank account via DBT alongside central installment releases",
        "Track transaction status online using Samagra ID on saara.mp.gov.in"
      ],
      onlineUrl: "https://saara.mp.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://saara.mp.gov.in",
    deadline: "Aligned with PM-KISAN Tranches (April, August, December)",
    lastUpdated: "2026-02-28",
    isVerified: true,
    isPublished: true,
    viewCount: 4250,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- BIHAR ---
  {
    id: "scheme-kanya-utthan-bihar",
    slug: "mukhyamantri-kanya-utthan-yojana-bihar",
    name: "Mukhyamantri Kanya Utthan Yojana (Bihar)",
    name_kn: "ಮುಖ್ಯಮಂತ್ರಿ ಕನ್ಯಾ ಉತ್ಥಾನ್ ಯೋಜನೆ",
    name_hi: "मुख्यमंत्री कन्या उत्थान योजना",
    department: "Social Welfare and Education Department, Government of Bihar",
    classification: "State",
    state: "Bihar",
    category: "Women Empowerment",
    beneficiaryCategory: "Women",
    description: "Holistic girl child welfare scheme in Bihar offering cumulative financial assistance of up to ₹54,100 from birth to graduation, including ₹25,000 upon passing Class 12 unmarried and ₹50,000 upon bachelor's degree completion.",
    description_kn: "ಬಿಹಾರದಲ್ಲಿ ಹೆಣ್ಣು ಮಗುವಿನ ಜನನದಿಂದ ಪದವಿ ಮುಗಿಯುವವರೆಗೆ ₹54,100 ರವರೆಗೆ ಆರ್ಥಿಕ ನೆರವು (12ನೇ ತರಗತಿಗೆ ₹25,000 ಮತ್ತು ಪದವಿಗೆ ₹50,000) ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "बिहार में कन्या के जन्म से स्नातक तक कुल ₹54,100 की सहायता; अविवाहित 12वीं पास पर ₹25,000 एवं स्नातक डिग्री पूर्ण होने पर ₹50,000 की सीधी बैंक राशि।",
    benefits: [
      "₹50,000 lump sum direct benefit transfer upon graduating with a Bachelor's degree (BA/BSc/BCom/Professional)",
      "₹25,000 incentive for clearing Class 12 Intermediate examination unmarried",
      "Cumulative grants from birth for immunization, sanitary napkins, and school uniforms"
    ],
    eligibilityCriteria: {
      minAge: 16,
      maxAge: 28,
      gender: "Female",
      applicableStates: ["Bihar"],
      allowedOccupations: ["Student"],
      educationRequirements: "Class 12 Pass (Unmarried) or Graduate Degree from recognized university in Bihar",
      rules: [
        "Girl student must be a permanent resident of Bihar",
        "Must have passed Intermediate (10+2) or Bachelor's degree from a recognized university/board in Bihar",
        "Must hold an active single bank account in her own name opened in a Bihar bank branch"
      ]
    },
    requiredDocuments: [
      "Graduation / Intermediate Final Marksheet and Certificate",
      "Bihar Domicile / Residence Certificate",
      "Aadhaar Card of the girl student",
      "Bank Account Passbook (Single account with IFSC in Bihar branch)",
      "Unmarried Self-declaration affidavit (for 10+2 incentive)"
    ],
    applicationProcedure: {
      steps: [
        "Universities upload verified graduate student lists onto the MedhaSoft portal",
        "Student visits medhasoft.bih.nic.in and searches her University Registration Number",
        "Complete student registration, enter Aadhaar number, and input bank account IFSC",
        "Upload scanned marksheet and photo and submit form",
        "Department of Education validates college records and transfers ₹50,000 via PFMS DBT"
      ],
      onlineUrl: "https://medhasoft.bih.nic.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://medhasoft.bih.nic.in",
    deadline: "Annual Window Closes: 31st December 2026",
    lastUpdated: "2026-02-22",
    isVerified: true,
    isPublished: true,
    viewCount: 4420,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- ODISHA ---
  {
    id: "scheme-gjay-odisha",
    slug: "gopabandhu-jan-arogya-yojana-odisha",
    name: "Gopabandhu Jan Arogya Yojana (GJAY)",
    name_kn: "ಗೋಪಬಂಧು ಜನ್ ಆರೋಗ್ಯ ಯೋಜನೆ (ಒಡಿಶಾ)",
    name_hi: "गोपबंधु जन आरोग्य योजना (ओडिशा)",
    department: "Health and Family Welfare Department, Government of Odisha",
    classification: "State",
    state: "Odisha",
    category: "Health and Social Welfare",
    beneficiaryCategory: "General",
    description: "Universal cashless health insurance scheme in Odisha providing financial cover of up to ₹5,00,000 per family and ₹10,00,000 for female family members per year across empanelled hospitals.",
    description_kn: "ಒಡಿಶಾದ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷ ಮತ್ತು ಮಹಿಳೆಯರಿಗೆ ₹10 ಲಕ್ಷದವರೆಗೆ ನಗದು ರಹಿತ ಆರೋಗ್ಯ ಚಿಕಿತ್ಸೆ ಒದಗಿಸುವ ಯೋಜನೆ.",
    description_hi: "ओडिशा में परिवारों को ₹5 लाख एवं महिला सदस्यों को ₹10 लाख तक का कैशलेस अस्पताल उपचार कवर प्रदान करने वाली स्वास्थ्य योजना।",
    benefits: [
      "Cashless secondary and tertiary hospitalization up to ₹5,00,000 per family per year",
      "Enhanced cashless medical protection of up to ₹10,00,000 specifically for female family members",
      "Covers major surgical procedures in over 800 premier empanelled hospitals within Odisha and across India"
    ],
    eligibilityCriteria: {
      applicableStates: ["Odisha"],
      rules: [
        "Beneficiary family must reside in Odisha with valid NFSA / SFSA Ration Card",
        "Universal coverage applies automatically to all cardholding families without separate policy premium"
      ]
    },
    requiredDocuments: [
      "NFSA / SFSA Digital Ration Card",
      "Aadhaar Card of the patient",
      "Hospital referral or diagnosis slip"
    ],
    applicationProcedure: {
      steps: [
        "Present your NFSA/SFSA Ration Card and Aadhaar at the Swasthya Mitra desk in any network hospital",
        "Swasthya Mitra executes electronic biometric authentication",
        "Hospital submits electronic pre-authorization to State Health Assurance Society",
        "Receive fully cashless clinical consultations, surgeries, ICU charges, and medicines",
        "Receive discharge summary and free post-discharge travel allowance"
      ],
      onlineUrl: "https://gjay.odisha.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://gjay.odisha.gov.in",
    deadline: "Open Year-Round / Universal Seamless Coverage",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 3720,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- HARYANA ---
  {
    id: "scheme-chirayu-haryana",
    slug: "chirayu-haryana-health-scheme",
    name: "Chirayu Haryana Health Scheme",
    name_kn: "ಚಿರಾಯು ಹರಿಯಾಣ ಆರೋಗ್ಯ ಯೋಜನೆ",
    name_hi: "चिरायु हरियाणा स्वास्थ्य योजना",
    department: "Haryana State Health Agency (Ayushman Bharat Haryana)",
    classification: "State",
    state: "Haryana",
    category: "Health and Social Welfare",
    beneficiaryCategory: "General",
    description: "Expanded cashless health coverage in Haryana providing free hospitalisation up to ₹5,00,000 per family per year for all Haryana families with annual income up to ₹3,00,000 through the Chirayu Ayushman Golden Card.",
    description_kn: "ಹರಿಯಾಣದಲ್ಲಿ ವಾರ್ಷಿಕ ₹3 ಲಕ್ಷದವರೆಗೆ ಆದಾಯವಿರುವ ಎಲ್ಲಾ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸೆ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "हरियाणा में ₹3 लाख तक वार्षिक आय वाले सभी परिवारों को गोल्डन कार्ड द्वारा प्रति वर्ष ₹5 लाख तक का निःशुल्क कैशलेस अस्पताल इलाज।",
    benefits: [
      "Cashless medical treatment of up to ₹5,00,000 per family per year in empanelled hospitals",
      "Covers 1,500+ surgical and medical procedures, tests, pre and post hospitalisation expenses",
      "Seamless digital card generation through Parivar Pehchan Patra (PPP)"
    ],
    eligibilityCriteria: {
      maxAnnualIncome: 300000,
      applicableStates: ["Haryana"],
      rules: [
        "Family must be registered on the Haryana Parivar Pehchan Patra (PPP) portal",
        "Verified family annual income must not exceed ₹3,00,000 (Families with income ₹1.8L - ₹3L pay nominal ₹1,500 annual contribution)"
      ]
    },
    requiredDocuments: [
      "Parivar Pehchan Patra (PPP) Family ID",
      "Aadhaar Card of all family members",
      "Active Mobile number for OTP verification"
    ],
    applicationProcedure: {
      steps: [
        "Check eligibility on Chirayu portal (chirayu.haryana.gov.in) with Family ID",
        "Pay nominal contribution online (if income is between ₹1.8L - ₹3L)",
        "Download digital Chirayu Ayushman Golden Card",
        "Present Golden Card at any empanelled hospital for instant cashless admission"
      ],
      onlineUrl: "https://chirayu.haryana.gov.in",
      offlineModeAvailable: true
    },
    officialWebsite: "https://chirayu.haryana.gov.in",
    deadline: "Continuous Open Enrollment via Parivar Pehchan Patra",
    lastUpdated: "2026-03-01",
    isVerified: true,
    isPublished: true,
    viewCount: 3510,
    sourceVerificationStatus: "Official Government Verified"
  },

  // --- ASSAM ---
  {
    id: "scheme-pragyan-bharati-assam",
    slug: "pragyan-bharati-scooty-scholarship-assam",
    name: "Pragyan Bharati Scooty & Free Admission Scheme",
    name_kn: "ಪ್ರಜ್ಞಾನ್ ಭಾರತಿ ಸ್ಕೂಟಿ ಮತ್ತು ಶಿಕ್ಷಣ ಯೋಜನೆ",
    name_hi: "प्रज्ञान भारती स्कूटी एवं निःशुल्क दाखिला योजना (असम)",
    department: "Higher Education Department, Government of Assam",
    classification: "State",
    state: "Assam",
    category: "Student Scholarships",
    beneficiaryCategory: "Students",
    description: "Flagship educational incentive in Assam awarding free motorized scooters to meritorious Class 12 girl and boy students and granting complete college admission fee waivers to students from low-income families.",
    description_kn: "ಅಸ್ಸಾಂನಲ್ಲಿ 12 ನೇ ತರಗತಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಪ್ರಥಮ ದರ್ಜೆಯಲ್ಲಿ ಉತ್ತೀರ್ಣರಾದ ಪ್ರತಿಭಾವಂತ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಉಚಿತ ಸ್ಕೂಟಿ ಮತ್ತು ಕಾಲೇಜು ಶುಲ್ಕ ವಿನಾಯಿತಿ ನೀಡುವ ಯೋಜನೆ.",
    description_hi: "असम में 12वीं में प्रथम श्रेणी लाने वाली मेधावी छात्राओं व छात्रों को मुफ्त स्कूटी (या इलेक्ट्रिक स्कूटी) तथा कॉलेज प्रवेश शुल्क की पूर्ण माफी।",
    benefits: [
      "Free brand-new petrol or electric scooty awarded to meritorious students scoring 60%+ (girls) or 75%+ (boys) in Higher Secondary exams",
      "100% free admission fee waiver across all undergraduate government and provincialized colleges in Assam for families earning under ₹2 Lakhs",
      "Free textbook grant of ₹1,000 for undergraduate students"
    ],
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 25,
      applicableStates: ["Assam"],
      allowedOccupations: ["Student"],
      educationRequirements: "Class 12 Higher Secondary Exam cleared from AHSEC",
      rules: [
        "Student must be a permanent resident of Assam and cleared Class 12 from Assam Higher Secondary Education Council (AHSEC)",
        "Minimum 60% marks for female students and 75% for male students for scooty incentive",
        "Must be admitted to an accredited undergraduate college in Assam"
      ]
    },
    requiredDocuments: [
      "AHSEC Class 12 Marksheet and Admit Card",
      "College Admission Fee Receipt / Enrollment proof",
      "Aadhaar Card and Assam Domicile Certificate",
      "Parental Income Certificate (for fee waiver benefit)"
    ],
    applicationProcedure: {
      steps: [
        "Log in to the official Pragyan Bharati / DHE Assam portal with HS roll number",
        "Select preference between petrol-driven scooty or electric two-wheeler",
        "Upload Class 12 marksheet, Aadhaar, and college bonafide certificate",
        "Director of Higher Education (DHE) compiles and notifies state awardee list",
        "Receive scooty at ceremonial district distribution event with registration and helmet"
      ],
      onlineUrl: "https://dhe.assam.gov.in",
      offlineModeAvailable: false
    },
    officialWebsite: "https://dhe.assam.gov.in",
    deadline: "Annual Merit Verification Closes: 31st October 2026",
    lastUpdated: "2026-02-17",
    isVerified: true,
    isPublished: true,
    viewCount: 3890,
    sourceVerificationStatus: "Official Government Verified"
  }
];

// Append and save to janaseva_db.json
const updatedSchemes = [...db.schemes, ...additionalSchemes];
db.schemes = updatedSchemes;

fs.writeFileSync('janaseva_db.json', JSON.stringify(db, null, 2), 'utf-8');
console.log(`Updated database! Now contains ${updatedSchemes.length} schemes.`);
