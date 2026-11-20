import { apiClient, API_BASE_URL } from './apiClient';
import { authService, AuthResponse } from './authService';
import { schemeService, SchemeQueryParams } from './schemeService';
import { adminService } from './adminService';
import { profileService } from './profileService';
import { bookmarkService } from './bookmarkService';
import { eligibilityService, EligibilityCheckParams } from './eligibilityService';
import { documentService } from './documentService';
import { ALL_VERIFIED_SCHEMES as FALLBACK_SCHEMES } from './schemesData';
import {
  Scheme,
  User,
  ApplicationRecord,
  SavedEligibilityRecord,
  AppNotification,
  DocumentItem,
  UserSession
} from '../types';

export {
  apiClient,
  API_BASE_URL,
  authService,
  schemeService,
  adminService,
  profileService,
  bookmarkService,
  eligibilityService,
  documentService,
  FALLBACK_SCHEMES
};

class UnifiedApiService {
  // Token management
  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('janaseva_token', token);
    } else {
      localStorage.removeItem('janaseva_token');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('janaseva_token');
  }

  // 1. Schemes API
  getSchemes(params?: SchemeQueryParams) {
    return schemeService.getSchemes(params);
  }

  getSchemeById(idOrSlug: string) {
    return schemeService.getSchemeById(idOrSlug);
  }

  // 2. Eligibility Engine & History
  checkEligibility(params: EligibilityCheckParams) {
    return eligibilityService.checkEligibility(params);
  }

  getEligibilityHistory() {
    return eligibilityService.getEvaluationHistory();
  }

  saveEligibilityEvaluation(record: Partial<SavedEligibilityRecord>) {
    return eligibilityService.saveEvaluationHistory(record);
  }

  deleteEligibilityHistory(id: string) {
    return eligibilityService.deleteEvaluationHistory(id);
  }

  // 3. Authentication & Sessions
  login(emailOrMobile: string, pass: string, rememberMe: boolean = true) {
    return authService.login(emailOrMobile, pass, rememberMe);
  }

  register(data: any) {
    return authService.register(data);
  }

  logout() {
    return authService.logout();
  }

  forgotPassword(email: string) {
    return authService.forgotPassword(email);
  }

  resetPassword(email: string, otp: string, newPassword: string) {
    return authService.resetPassword(email, otp, newPassword);
  }

  changePassword(currentPassword: string, newPassword: string) {
    return authService.updatePassword(currentPassword, newPassword);
  }

  getSessions() {
    return authService.getSessions();
  }

  deleteSession(sessionId: string) {
    return authService.revokeSession(sessionId);
  }

  // 4. Citizen Profile & Privacy (DPDP Act 2023)
  getProfile() {
    return profileService.getProfile();
  }

  updateProfile(updates: Partial<User>) {
    return profileService.updateProfile(updates);
  }

  deleteAccount() {
    return profileService.deleteAccount();
  }

  exportUserData() {
    return profileService.exportData();
  }

  // 5. Saved Schemes (Bookmarks)
  getSavedSchemes() {
    return bookmarkService.getSavedSchemes();
  }

  getBookmarks() {
    return bookmarkService.getSavedSchemes();
  }

  addBookmark(schemeId: string) {
    return bookmarkService.saveScheme(schemeId);
  }

  removeBookmark(schemeId: string) {
    return bookmarkService.removeBookmark(schemeId);
  }

  toggleSaveScheme(schemeId: string) {
    return bookmarkService.toggleSaveScheme(schemeId);
  }

  // 6. Citizen Documents Checklist
  getDocuments() {
    return documentService.getUserDocuments();
  }

  updateDocuments(documents: DocumentItem[]) {
    return documentService.updateDocumentsChecklist(documents);
  }

  updateSingleDocument(
    documentId: string,
    updates: { status?: 'available' | 'pending' | 'not_applicable'; documentNumber?: string; notes?: string }
  ) {
    return documentService.updateSingleDocument(documentId, updates);
  }

  // 7. Citizen Application Tracker
  async getApplications(): Promise<{ success: boolean; count: number; applications: ApplicationRecord[] }> {
    try {
      const res = await apiClient.get('/users/me/applications');
      return res.data;
    } catch {
      const local = localStorage.getItem('janaseva_apps');
      return {
        success: true,
        count: local ? JSON.parse(local).length : 0,
        applications: local ? JSON.parse(local) : []
      };
    }
  }

  async addApplication(record: {
    schemeId: string;
    applicationRefNo: string;
    appliedDate: string;
    status: 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected';
    notes: string;
  }): Promise<{ success: boolean; application?: ApplicationRecord; message?: string }> {
    try {
      const res = await apiClient.post('/users/me/applications', record);
      return res.data;
    } catch {
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
      const apps = (await this.getApplications()).applications;
      apps.unshift(newApp);
      localStorage.setItem('janaseva_apps', JSON.stringify(apps));
      return { success: true, application: newApp };
    }
  }

  async updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<{ success: boolean; application?: ApplicationRecord; message?: string }> {
    try {
      const res = await apiClient.put(`/users/me/applications/${id}`, updates);
      return res.data;
    } catch {
      const apps = (await this.getApplications()).applications;
      const idx = apps.findIndex(a => a.id === id);
      if (idx !== -1) {
        apps[idx] = { ...apps[idx], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('janaseva_apps', JSON.stringify(apps));
        return { success: true, application: apps[idx] };
      }
      return { success: false, message: 'Application not found.' };
    }
  }

  async deleteApplication(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.delete(`/users/me/applications/${id}`);
      return res.data;
    } catch {
      const apps = (await this.getApplications()).applications;
      const filtered = apps.filter(a => a.id !== id);
      localStorage.setItem('janaseva_apps', JSON.stringify(filtered));
      return { success: true, message: 'Deleted locally.' };
    }
  }

  // 8. Citizen Notification Center
  async getNotifications(): Promise<{ success: boolean; count: number; notifications: AppNotification[] }> {
    try {
      const res = await apiClient.get('/users/me/notifications');
      return res.data;
    } catch {
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
  }

  async markNotificationRead(id: string) {
    try {
      const res = await apiClient.patch(`/users/me/notifications/${id}/read`);
      return res.data;
    } catch {
      return { success: true };
    }
  }

  async markAllNotificationsRead() {
    try {
      const res = await apiClient.patch('/users/me/notifications/read-all');
      return res.data;
    } catch {
      return { success: true };
    }
  }

  async deleteNotification(id: string) {
    try {
      const res = await apiClient.delete(`/users/me/notifications/${id}`);
      return res.data;
    } catch {
      return { success: true };
    }
  }

  // 9. Aggregated Citizen Dashboard Data
  async getCitizenDashboard() {
    try {
      const res = await apiClient.get('/users/me/dashboard');
      return res.data;
    } catch {
      return { success: false };
    }
  }

  async getDashboard() {
    return this.getCitizenDashboard();
  }

  // 10. AI Assistant & Voice Studio
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
      const res = await apiClient.post('/assistant/chat', { message, language, history });
      return res.data;
    } catch {
      const q = message.toLowerCase();
      if (q.includes('gruha') || q.includes('ಗೃಹ')) {
        return {
          success: true,
          reply: 'Gruha Lakshmi Yojana provides ₹2,000 monthly financial assistance to the woman head of household in Karnataka. Key documents needed: Aadhaar Card, Ration Card (BPL/APL), and Aadhaar-seeded bank account. You can apply at Grama One or Karnataka One centers, or via sevasindhugs.karnataka.gov.in.',
          suggestedSchemes: [{ id: 'scheme-gruha-lakshmi', name: 'Gruha Lakshmi Yojana', category: 'Women Empowerment', slug: 'gruha-lakshmi-yojana', officialWebsite: 'https://sevasindhugs.karnataka.gov.in' }]
        };
      }
      if (q.includes('kisan') || q.includes('ರೈತ') || q.includes('farmer')) {
        return {
          success: true,
          reply: 'PM-KISAN provides ₹6,000 per year directly to eligible landholder farmers in 3 installments of ₹2,000 each. Required: Land RTC (Pahani), Aadhaar card, and e-KYC on pmkisan.gov.in.',
          suggestedSchemes: [{ id: 'scheme-pm-kisan', name: 'PM-KISAN', category: 'Farmer Welfare', slug: 'pm-kisan-samman-nidhi', officialWebsite: 'https://pmkisan.gov.in' }]
        };
      }
      return {
        success: true,
        reply: 'Welcome to Janaseva Assistant! I can help you find verified Central and Karnataka state government schemes. Ask me about PM-KISAN, Gruha Lakshmi, SSP Scholarship, Shakti bus scheme, or Ayushman Bharat.'
      };
    }
  }

  async askChatbot(message: string, language?: string, history?: Array<{ role: 'user' | 'assistant'; content: string }>) {
    return this.chatWithAssistant(message, language, history);
  }

  // 10b. Persistent Conversations & Voice Management
  async createConversation(language = 'kn', title?: string) {
    try {
      const res = await apiClient.post('/assistant/conversations', { language, title });
      return res.data;
    } catch {
      return { success: false, conversation: { id: `conv_${Date.now()}`, language, messages: [] } };
    }
  }

  async getConversations() {
    try {
      const res = await apiClient.get('/assistant/conversations');
      return res.data;
    } catch {
      return { success: false, conversations: [] };
    }
  }

  async getConversation(id: string) {
    try {
      const res = await apiClient.get(`/assistant/conversations/${id}`);
      return res.data;
    } catch {
      return { success: false, conversation: null };
    }
  }

  async deleteConversation(id: string) {
    try {
      const res = await apiClient.delete(`/assistant/conversations/${id}`);
      return res.data;
    } catch {
      return { success: false };
    }
  }

  async sendMessageToConversation(conversationId: string, message: string, language?: string) {
    try {
      const res = await apiClient.post(`/assistant/conversations/${conversationId}/messages`, { message, language });
      return res.data;
    } catch {
      return this.chatWithAssistant(message, language);
    }
  }

  async getVoiceProfiles() {
    try {
      const res = await apiClient.get('/voice/profiles');
      return res.data?.profiles || [];
    } catch {
      return [
        { id: 'kavya-indic', name: 'Kavya (Primary Indian Female Voice)', gender: 'female', isDefault: true },
        { id: 'priya-in', name: 'Priya (Public Service)', gender: 'female' },
        { id: 'neerja-in', name: 'Neerja (Gentle Tone)', gender: 'female' }
      ];
    }
  }

  async getVoiceStudioStatus(): Promise<{ success: boolean; online: boolean; serviceUrl?: string; engine?: string; voices?: string[] }> {
    try {
      const res = await apiClient.get('/assistant/voice/status');
      return res.data;
    } catch {
      return { success: false, online: false };
    }
  }

  async synthesizeSpeechVoiceStudio(text: string, language: 'en' | 'kn' | 'hi' = 'en', voice = 'nova'): Promise<Blob | null> {
    try {
      const res = await apiClient.post('/assistant/voice/tts', { text, language, voice }, { responseType: 'blob' });
      return res.data;
    } catch (e) {
      console.warn('VoiceStudio speech synthesis error:', e);
      return null;
    }
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

      const res = await apiClient.post('/assistant/voice/stt', { audioBase64: base64, language });
      return res.data?.text || null;
    } catch (e) {
      console.warn('VoiceStudio speech transcription error:', e);
      return null;
    }
  }

  // 11. Admin Schemes & Metrics
  createScheme(schemeData: any) {
    return adminService.createScheme(schemeData);
  }

  updateScheme(id: string, updates: Partial<Scheme>) {
    return adminService.updateScheme(id, updates);
  }

  publishScheme(id: string, isPublished?: boolean) {
    return adminService.publishScheme(id, isPublished);
  }

  archiveScheme(id: string, isArchived?: boolean) {
    return adminService.archiveScheme(id, isArchived);
  }

  deleteScheme(id: string) {
    return adminService.deleteScheme(id);
  }

  getAdminUsers() {
    return adminService.getUsers();
  }

  getUserDetails(id: string) {
    return adminService.getUserDetails(id);
  }

  updateUserStatus(id: string, status: 'active' | 'suspended') {
    return adminService.updateUserStatus(id, status);
  }

  getAdminMetrics() {
    return adminService.getMetrics();
  }
}

export const api = new UnifiedApiService();
