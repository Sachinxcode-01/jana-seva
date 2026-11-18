export type Language = 'en' | 'kn' | 'hi';

export type Role = 'citizen' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  state: string;
  occupation: string;
  incomeRange: string;
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
  state: string;
  category: SchemeCategory;
  beneficiaryCategory: string;
  description: string;
  description_kn: string;
  description_hi: string;
  benefits: string[];
  eligibilityCriteria: {
    minAge?: number;
    maxAge?: number;
    maxAnnualIncome?: number;
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
  sourceVerificationStatus: string;
}

export interface ApplicationRecord {
  id: string;
  userId: string;
  schemeId: string;
  applicationRefNo: string;
  appliedDate: string;
  status: 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected';
  notes: string;
  updatedAt: string;
  scheme?: Scheme;
}

export interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  category: SchemeCategory;
  isEligible: boolean;
  matchScore: number;
  matchingReasons: string[];
  unmetConditions: string[];
  requiredDocuments: string[];
  officialUrl: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
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
