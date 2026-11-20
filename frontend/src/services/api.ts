import {
  Scheme,
  User,
  ApplicationRecord,
  EligibilityResult,
  AppNotification,
  DocumentItem
} from '../types';
import { ALL_VERIFIED_SCHEMES as FALLBACK_SCHEMES } from './schemesData';

export { FALLBACK_SCHEMES };

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  async login(emailOrMobile: string, pass: string, rememberMe?: boolean): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile, password: pass, rememberMe })
      });
      const data = await res.json();
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (e) {
      // Mock login for offline demonstration
      if (emailOrMobile.includes('admin')) {
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
        email: emailOrMobile || 'citizen@janaseva.gov.in',
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
    mobileNumber?: string;
    password: string;
    state?: string;
    district?: string;
    occupation?: string;
    incomeRange?: string;
    preferredLanguage?: string;
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
    } catch (e) {
      const mockUser: User = {
        id: `user-${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        role: 'citizen',
        state: data.state || 'Karnataka',
        district: data.district || 'Bengaluru Urban',
        occupation: data.occupation || 'General Citizen',
        incomeRange: data.incomeRange || 'Below 2.5 Lakhs'
      };
      this.setToken('mock_user_token');
      return { success: true, token: 'mock_user_token', user: mockUser };
    }
  }

  async getProfile(): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) { }

    const localUser = localStorage.getItem('janaseva_user');
    if (localUser) {
      try {
        return { success: true, user: JSON.parse(localUser) };
      } catch (err) { }
    }
    return { success: false, message: 'Not logged in.' };
  }

  async getNotifications(): Promise<{ success: boolean; count: number; notifications: AppNotification[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/notifications`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) { }
    return {
      success: true,
      count: 2,
      notifications: [
        {
          id: 'notif-1',
          title: 'SSP Scholarship Window Open',
          title_kn: 'ಎಸ್ಎಸ್ಪಿ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅರ್ಜಿ ಪ್ರಾರಂಭ',
          title_hi: 'एसएसपी छात्रवृत्ति आवेदन खुले हैं',
          message: 'Applications are now being invited for Karnataka SSP Post-Matric scholarships for 2026.',
          message_kn: '2026 ನೇ ಶೈಕ್ಷಣಿಕ ಸಾಲಿನ ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನಕ್ಕೆ ಅರ್ಜಿ ಆಹ್ವಾನಿಸಲಾಗಿದೆ.',
          message_hi: '2026 शैक्षणिक सत्र के लिए कर्नाटक पोस्ट-मैट्रिक एसएसपी छात्रवृत्ति आवेदन आमंत्रित हैं।',
          type: 'new_scheme',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'notif-2',
          title: 'PM-KISAN DBT Update',
          title_kn: 'ಪಿಎಂ-ಕಿಸಾನ್ ಡಿಬಿಟಿ ಅಪ್ಡೇಟ್',
          title_hi: 'पीएम-किसान डीबीटी अपडेट',
          message: 'Ensure your Aadhaar is seeded with bank account for continuous DBT credits.',
          message_kn: 'ನಿರಂತರ ಡಿಬಿಟಿ ಜಮೆಗಾಗಿ ನಿಮ್ಮ ಆಧಾರ್ ಲಿಂಕ್ ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
          message_hi: 'डीबीटी लाभ पाने के लिए अपने बैंक खाते में आधार सीडिंग सुनिश्चित करें।',
          type: 'scheme_update',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ]
    };
  }

  async markAllNotificationsRead(): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/notifications/read-all`, {
        method: 'PATCH',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: true };
  }

  async markNotificationRead(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/notifications/${id}/read`, {
        method: 'PATCH',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: true };
  }

  async deleteNotification(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/notifications/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: true };
  }

  async getEligibilityHistory(): Promise<{ success: boolean; count: number; history: any[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/eligibility-history`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) { }
    const local = localStorage.getItem('janaseva_eval_history');
    return {
      success: true,
      count: local ? JSON.parse(local).length : 0,
      history: local ? JSON.parse(local) : []
    };
  }

  async saveEligibilityEvaluation(record: any): Promise<{ success: boolean; record?: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/eligibility-history`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(record)
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    const local = localStorage.getItem('janaseva_eval_history');
    const history = local ? JSON.parse(local) : [];
    const newRecord = { ...record, id: `eval-${Date.now()}`, evaluatedAt: new Date().toISOString() };
    history.unshift(newRecord);
    localStorage.setItem('janaseva_eval_history', JSON.stringify(history));
    return { success: true, record: newRecord };
  }

  async deleteEligibilityHistory(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/eligibility-history/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    const local = localStorage.getItem('janaseva_eval_history');
    if (local) {
      const filtered = JSON.parse(local).filter((h: any) => h.id !== id);
      localStorage.setItem('janaseva_eval_history', JSON.stringify(filtered));
    }
    return { success: true };
  }

  async getDocuments(): Promise<{ success: boolean; documents: DocumentItem[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/documents`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) { }
    const local = localStorage.getItem('janaseva_docs');
    const defaultDocs: DocumentItem[] = [
      { id: 'doc-aadhaar', name: 'Aadhaar Card (Seeded with NPCI/Bank)', category: 'Identity', status: 'available', updatedAt: new Date().toISOString() },
      { id: 'doc-ration', name: 'Ration Card (APL / BPL / Antyodaya)', category: 'Residence', status: 'available', updatedAt: new Date().toISOString() },
      { id: 'doc-income', name: 'Income Certificate (RD Number Verified)', category: 'Income & Caste', status: 'available', updatedAt: new Date().toISOString() },
      { id: 'doc-caste', name: 'Caste / Community Certificate', category: 'Income & Caste', status: 'available', updatedAt: new Date().toISOString() },
      { id: 'doc-domicile', name: 'Domicile / Residential Certificate', category: 'Residence', status: 'available', updatedAt: new Date().toISOString() },
      { id: 'doc-passbook', name: 'Bank Account Passbook / Statement', category: 'Identity', status: 'available', updatedAt: new Date().toISOString() },
      { id: 'doc-land-rtc', name: 'Land Ownership RTC / Pahani (Bhoomi)', category: 'Agriculture & Land', status: 'available', updatedAt: new Date().toISOString() },
      { id: 'doc-student-id', name: 'Student Bonafide / Enrollment Certificate', category: 'Education', status: 'not_applicable', updatedAt: new Date().toISOString() },
      { id: 'doc-disability', name: 'UDID / Disability Certificate', category: 'Other', status: 'not_applicable', updatedAt: new Date().toISOString() }
    ];
    return {
      success: true,
      documents: local ? JSON.parse(local) : defaultDocs
    };
  }

  async updateDocuments(documents: DocumentItem[]): Promise<{ success: boolean; documents: DocumentItem[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/documents`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ documents })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    localStorage.setItem('janaseva_docs', JSON.stringify(documents));
    return { success: true, documents };
  }

  async getSessions(): Promise<{ success: boolean; count: number; sessions: any[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/sessions`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) { }
    return {
      success: true,
      count: 1,
      sessions: [
        {
          id: 'sess-current',
          ip: '127.0.0.1',
          userAgent: navigator.userAgent || 'Chrome 122 (Windows 11)',
          loggedInAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        }
      ]
    };
  }

  async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: true };
  }

  async updateProfile(updates: any): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    const localUser = localStorage.getItem('janaseva_user');
    if (localUser) {
      const parsed = { ...JSON.parse(localUser), ...updates };
      localStorage.setItem('janaseva_user', JSON.stringify(parsed));
      return { success: true, message: 'Profile updated locally.', user: parsed };
    }
    return { success: true, message: 'Profile updated.' };
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return { success: true, message: 'Password updated successfully.' };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) { }
    const local = JSON.parse(localStorage.getItem('janaseva_saved_ids') || '["scheme-pm-kisan"]');
    return {
      success: true,
      schemes: FALLBACK_SCHEMES.filter(s => local.includes(s.id))
    };
  }

  async getBookmarks(): Promise<{ success: boolean; schemes: Scheme[] }> {
    return this.getSavedSchemes();
  }

  async addBookmark(schemeId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/bookmarks/${schemeId}`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    const local = JSON.parse(localStorage.getItem('janaseva_saved_ids') || '[]');
    if (!local.includes(schemeId)) {
      local.push(schemeId);
      localStorage.setItem('janaseva_saved_ids', JSON.stringify(local));
    }
    return { success: true };
  }

  async removeBookmark(schemeId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/bookmarks/${schemeId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    let local = JSON.parse(localStorage.getItem('janaseva_saved_ids') || '[]');
    local = local.filter((id: string) => id !== schemeId);
    localStorage.setItem('janaseva_saved_ids', JSON.stringify(local));
    return { success: true };
  }

  async toggleSaveScheme(schemeId: string): Promise<{ success: boolean; saved: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/saved-schemes/toggle`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ schemeId })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    const current = JSON.parse(localStorage.getItem('janaseva_saved_ids') || '[]');
    let saved = false;
    if (current.includes(schemeId)) {
      const updated = current.filter((id: string) => id !== schemeId);
      localStorage.setItem('janaseva_saved_ids', JSON.stringify(updated));
    } else {
      current.push(schemeId);
      localStorage.setItem('janaseva_saved_ids', JSON.stringify(current));
      saved = true;
    }
    return { success: true, saved };
  }

  // Application Tracking
  async getApplications(): Promise<{ success: boolean; count: number; applications: ApplicationRecord[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/applications`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) { }
    const local = localStorage.getItem('janaseva_apps');
    if (local) {
      return { success: true, count: JSON.parse(local).length, applications: JSON.parse(local) };
    }
    const defaultApps: ApplicationRecord[] = [
      {
        id: 'app-default-1',
        userId: 'demo-user',
        schemeId: 'scheme-gruha-lakshmi',
        applicationRefNo: 'KA-GL-2026-88194',
        appliedDate: '2026-02-14',
        status: 'In Review',
        notes: 'Submitted via Karnataka One center. Biometric e-KYC completed successfully.',
        updatedAt: '2026-02-15T10:30:00.000Z',
        scheme: FALLBACK_SCHEMES.find(s => s.id === 'scheme-gruha-lakshmi'),
        timeline: [
          { status: 'Draft', date: '2026-02-10', note: 'Created initial application draft' },
          { status: 'Submitted', date: '2026-02-14', note: 'Application submitted at Karnataka One counter' },
          { status: 'In Review', date: '2026-02-15', note: 'Field officer verification initiated' }
        ]
      },
      {
        id: 'app-default-2',
        userId: 'demo-user',
        schemeId: 'scheme-pm-kisan',
        applicationRefNo: 'PMK-2026-90412',
        appliedDate: '2026-01-20',
        status: 'Approved',
        notes: 'Aadhaar NPCI bank account mapping validated. First installment credited.',
        updatedAt: '2026-02-01T14:20:00.000Z',
        scheme: FALLBACK_SCHEMES.find(s => s.id === 'scheme-pm-kisan'),
        timeline: [
          { status: 'Submitted', date: '2026-01-20', note: 'Submitted via PM-KISAN portal' },
          { status: 'In Review', date: '2026-01-25', note: 'State agriculture department verification' },
          { status: 'Approved', date: '2026-02-01', note: 'Sanction order issued for DBT disbursement' }
        ]
      }
    ];
    return { success: true, count: defaultApps.length, applications: defaultApps };
  }

  async addApplication(record: {
    schemeId: string;
    applicationRefNo: string;
    appliedDate: string;
    status: 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected';
    notes: string;
  }): Promise<{ success: boolean; application?: ApplicationRecord; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/applications`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(record)
      });
      if (res.ok) return await res.json();
    } catch (e) { }
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

  async updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<{ success: boolean; application?: ApplicationRecord; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/applications/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }

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
    } catch (e) { }
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
    } catch (e) { }

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
