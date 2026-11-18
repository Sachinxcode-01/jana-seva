export type Role = 'citizen' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  state: string;
  occupation: string;
  incomeRange: string;
  createdAt: string;
}

export type SchemeClassification = 'Central' | 'State';

export type SchemeCategory = 
  | 'Women Empowerment'
  | 'Student Scholarships'
  | 'Farmer Welfare'
  | 'Employment Opportunities'
  | 'Financial Assistance'
  | 'Health and Social Welfare';

export interface Scheme {
  id: string;
  slug: string;
  name: string;
  name_kn: string;
  name_hi: string;
  department: string;
  classification: SchemeClassification;
  state: string; // "Karnataka" or "All India"
  category: SchemeCategory;
  beneficiaryCategory: string; // e.g. "Women", "Students", "Farmers", "General"
  description: string;
  description_kn: string;
  description_hi: string;
  benefits: string[];
  eligibilityCriteria: {
    minAge?: number;
    maxAge?: number;
    maxAnnualIncome?: number; // In INR
    gender?: 'Female' | 'Male' | 'All';
    applicableStates?: string[];
    allowedOccupations?: string[];
    educationRequirements?: string;
    rules: string[];
  };
  requiredDocuments: string[];
  applicationProcedure: {
    steps: string[];
    onlineUrl: string;
    offlineModeAvailable: boolean;
  };
  officialWebsite: string;
  lastUpdated: string;
  isVerified: boolean;
  isPublished: boolean;
  viewCount: number;
  sourceVerificationStatus: 'Official Government Verified' | 'Sample Entry';
}

export interface SavedScheme {
  id: string;
  userId: string;
  schemeId: string;
  savedAt: string;
}

export type ApplicationStatus = 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected';

export interface ApplicationRecord {
  id: string;
  userId: string;
  schemeId: string;
  applicationRefNo: string;
  appliedDate: string;
  status: ApplicationStatus;
  notes: string;
  updatedAt: string;
}

export interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  category: SchemeCategory;
  isEligible: boolean;
  matchScore: number; // 0 - 100%
  matchingReasons: string[];
  unmetConditions: string[];
  requiredDocuments: string[];
  officialUrl: string;
}

export interface EligibilityAssessment {
  id: string;
  userId?: string;
  timestamp: string;
  inputCriteria: {
    age: number;
    state: string;
    occupation: string;
    beneficiaryCategory: string;
    annualIncome: number;
    educationLevel?: string;
  };
  eligibleSchemesCount: number;
}

export interface AppNotification {
  id: string;
  userId?: string; // empty means broadcast
  title: string;
  title_kn: string;
  title_hi: string;
  message: string;
  message_kn: string;
  message_hi: string;
  type: 'scheme_update' | 'application_reminder' | 'new_scheme' | 'general';
  isRead: boolean;
  createdAt: string;
}

export interface AdminActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}
