import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Lock, AlertTriangle, Download, 
  Trash2, CheckCircle2, ExternalLink, HelpCircle, UserX, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

type TabType = 'privacy' | 'terms' | 'dpdp_gdpr' | 'my_rights' | 'anti_fraud';

export const CompliancePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('privacy');
  
  // Data Rights state
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    try {
      const res = await api.exportUserData();
      if (res.success && res.data) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res.data, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `janaseva_citizen_data_export_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setStatusMessage('Personal data package generated and downloaded successfully.');
      } else {
        setStatusMessage('Unable to generate data export. Please try again.');
      }
    } catch {
      setStatusMessage('Error downloading citizen data export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setStatusMessage(null);
    try {
      const res = await api.deleteAccount();
      if (res.success) {
        setStatusMessage('Your account and all associated personal data have been permanently erased.');
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        setStatusMessage('Failed to process deletion request.');
      }
    } catch {
      setStatusMessage('Error processing account deletion.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner - ByTune Dark Glass Hero */}
      <div className="bytune-card p-6 sm:p-10 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8f8bff]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#6fd8ff]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#1ed760]/10 text-[#1ed760] text-xs font-medium border border-[#1ed760]/30 shadow-[0_0_15px_rgba(30,215,96,0.15)]">
            <ShieldCheck className="w-4 h-4 text-[#1ed760]" />
            <span>Statutory Compliance & Citizen Privacy Trust</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-medium tracking-[-0.03em] text-[#f5f5f8]">
            Legal Framework & Data Protection Center
          </h1>
          <p className="text-xs sm:text-sm text-[#b6b6c2] leading-relaxed max-w-3xl">
            JANASEVA adheres strictly to India's <strong className="text-[#f5f5f8]">Digital Personal Data Protection Act (DPDP Act 2023)</strong>, 
            the <strong className="text-[#f5f5f8]">Information Technology Act (2000)</strong>, <strong className="text-[#f5f5f8]">CERT-In Directions (2022)</strong>, and 
            international data minimization principles under <strong className="text-[#f5f5f8]">EU GDPR</strong>.
          </p>
        </div>
      </div>

      {/* Tabs Navigation - ByTune Pill Row */}
      <div className="flex flex-wrap gap-2.5 border-b border-white/[0.08] pb-4">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs transition-all duration-200 ${
            activeTab === 'privacy' 
              ? 'bg-[#f5f5f8] text-[#0a0a0c] font-semibold shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
              : 'bg-white/[0.04] text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/[0.08] border border-white/[0.08]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>01 — Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs transition-all duration-200 ${
            activeTab === 'terms' 
              ? 'bg-[#f5f5f8] text-[#0a0a0c] font-semibold shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
              : 'bg-white/[0.04] text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/[0.08] border border-white/[0.08]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>02 — Terms & Conditions</span>
        </button>

        <button
          onClick={() => setActiveTab('dpdp_gdpr')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs transition-all duration-200 ${
            activeTab === 'dpdp_gdpr' 
              ? 'bg-[#f5f5f8] text-[#0a0a0c] font-semibold shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
              : 'bg-white/[0.04] text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/[0.08] border border-white/[0.08]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DPDP Act & GDPR Alignment</span>
        </button>

        <button
          onClick={() => setActiveTab('my_rights')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs transition-all duration-200 ${
            activeTab === 'my_rights' 
              ? 'bg-[#f5f5f8] text-[#0a0a0c] font-semibold shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
              : 'bg-white/[0.04] text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/[0.08] border border-white/[0.08]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Citizen Data Rights & Deletion</span>
        </button>

        <button
          onClick={() => setActiveTab('anti_fraud')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs transition-all duration-200 ${
            activeTab === 'anti_fraud' 
              ? 'bg-[#f5f5f8] text-[#0a0a0c] font-semibold shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
              : 'bg-white/[0.04] text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/[0.08] border border-white/[0.08]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Anti-Fraud & Zero-Fee Notice</span>
        </button>
      </div>

      {/* Tab 1: Privacy Policy */}
      {activeTab === 'privacy' && (
        <div className="bytune-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-lg font-medium tracking-tight text-[#f5f5f8]">JANASEVA Privacy Policy</h2>
            <p className="text-xs text-[#8a8a97] mt-0.5">Effective Date: Academic Session 2026 | Last Updated: February 2026</p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm text-[#b6b6c2] leading-relaxed">
            <div className="bg-[#1ed760]/10 border border-[#1ed760]/30 p-5 rounded-2xl text-[#f5f5f8] shadow-[0_0_20px_rgba(30,215,96,0.1)]">
              <strong className="text-xs font-semibold uppercase tracking-wider text-[#1ed760] mb-1.5 flex items-center space-x-1.5">
                <span>🛡️</span>
                <span>Zero Sensitive Personal Data Guarantee</span>
              </strong>
              JANASEVA explicitly does <strong className="text-white">NOT</strong> collect, request, or store your Aadhaar number, Virtual ID, 
              bank account number, IFSC code, UPI PIN, or biometric data. All actual scheme benefit disbursements occur directly on 
              designated official sovereign government portals (e.g. Seva Sindhu, National Scholarship Portal).
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#f5f5f8] mb-2">1. Personal Data We Collect and Why</h3>
              <ul className="list-disc pl-5 space-y-2 text-xs text-[#b6b6c2]">
                <li><strong className="text-[#f5f5f8]">Account Credentials:</strong> Full Name, Email, and securely salted bcrypt password hash (for citizen login and security).</li>
                <li><strong className="text-[#f5f5f8]">Demographic Profile:</strong> State of domicile, occupation type, and annual family income range (used solely to pre-calculate welfare scheme eligibility).</li>
                <li><strong className="text-[#f5f5f8]">Citizen Application Tracker:</strong> Scheme names, application reference numbers, and personal status updates entered by you in your dashboard.</li>
                <li><strong className="text-[#f5f5f8]">Ephemeral Eligibility Inputs:</strong> Information entered in the 3-step Smart Eligibility Checker is calculated in-memory and discarded upon completion unless explicitly saved.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#f5f5f8] mb-2">2. Technical Storage & Cookies</h3>
              <p className="text-xs text-[#b6b6c2]">
                JANASEVA employs zero third-party commercial advertising trackers or marketing cookies. We use browser local storage 
                strictly for essential session tokens (<code className="bg-white/[0.08] text-[#8f8bff] border border-white/[0.1] px-1.5 py-0.5 rounded font-mono text-[11px]">janaseva_token</code>) and 
                multilingual interface preferences (<code className="bg-white/[0.08] text-[#8f8bff] border border-white/[0.1] px-1.5 py-0.5 rounded font-mono text-[11px]">janaseva_lang</code>).
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#f5f5f8] mb-2">3. Third-Party Disclosures</h3>
              <p className="text-xs text-[#b6b6c2]">
                We never sell, rent, or trade your data to private corporations or marketing agencies. External links to 
                <code className="bg-white/[0.08] text-[#8f8bff] border border-white/[0.1] px-1.5 py-0.5 rounded font-mono text-[11px] ml-1">.gov.in</code> websites redirect you directly to sovereign portals where independent governmental privacy notices apply.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Terms & Conditions */}
      {activeTab === 'terms' && (
        <div className="bytune-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-lg font-medium tracking-tight text-[#f5f5f8]">Terms of Use & Civic Service Rules</h2>
            <p className="text-xs text-[#8a8a97] mt-0.5">Applicable to all visitors, registered citizens, and administrators.</p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm text-[#b6b6c2] leading-relaxed">
            <div>
              <h3 className="text-sm font-medium text-[#f5f5f8] mb-1.5">1. Nature of Platform & Advisory Status</h3>
              <p className="text-xs text-[#b6b6c2]">
                JANASEVA is an educational digital awareness and preliminary eligibility evaluation initiative. 
                The eligibility scores, document checklists, and application step summaries generated on this platform 
                are strictly for informational guidance. JANASEVA holds no executive or judicial authority to sanction welfare schemes, 
                waive fees, or disburse funds. Final sanctioning decisions remain the sole jurisdiction of the respective Central or State Government departments.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#f5f5f8] mb-1.5">2. User Responsibilities & Acceptable Use</h3>
              <ul className="list-disc pl-5 space-y-2 text-xs text-[#b6b6c2]">
                <li>Users agree to provide accurate information when registering or saving tracking entries.</li>
                <li>Unauthorized access to administrative endpoints (<code className="bg-white/[0.08] text-[#8f8bff] border border-white/[0.1] px-1.5 py-0.5 rounded font-mono text-[11px]">/api/admin/*</code>) or attempting denial-of-service exploits is strictly prohibited under the Information Technology Act, 2000.</li>
                <li>Users must maintain the confidentiality of their login credentials.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#f5f5f8] mb-1.5">3. Intellectual Property</h3>
              <p className="text-xs text-[#b6b6c2]">
                Software source code and custom user interface layouts are copyrighted. Government scheme statutory provisions, 
                notifications, and guidelines remain sovereign public records. State crests and emblems are cited strictly for 
                referential accuracy in accordance with the Emblems and Names (Prevention of Improper Use) Act, 1950.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DPDP & GDPR Alignment */}
      {activeTab === 'dpdp_gdpr' && (
        <div className="bytune-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-lg font-medium tracking-tight text-[#f5f5f8]">DPDP Act (2023) & GDPR Compliance Matrix</h2>
            <p className="text-xs text-[#8a8a97] mt-0.5">Harmonizing Indian domestic data protection law with global privacy benchmarks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl border border-[#6fd8ff]/30 bg-gradient-to-br from-[#6fd8ff]/10 via-[#101016]/80 to-[#101016] space-y-3">
              <h4 className="font-semibold text-xs text-[#6fd8ff] uppercase tracking-wider flex items-center space-x-2">
                <span>🇮🇳</span>
                <span>Digital Personal Data Protection Act, 2023</span>
              </h4>
              <ul className="text-xs space-y-2 text-[#b6b6c2]">
                <li>• <strong className="text-[#f5f5f8]">Section 6 (Consent):</strong> Free, specific, informed, and unconditional consent collected during registration.</li>
                <li>• <strong className="text-[#f5f5f8]">Section 8 (Security):</strong> Technical measures including bcrypt password encryption and JWT authorization.</li>
                <li>• <strong className="text-[#f5f5f8]">Section 11 (Access):</strong> Citizens have the right to a summary of personal data being processed.</li>
                <li>• <strong className="text-[#f5f5f8]">Section 12 (Erasure):</strong> Right to correction and erasure of personal data upon request.</li>
                <li>• <strong className="text-[#f5f5f8]">Section 13 (Grievances):</strong> Rapid grievance resolution mechanism available via portal support.</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-[#8f8bff]/30 bg-gradient-to-br from-[#8f8bff]/10 via-[#101016]/80 to-[#101016] space-y-3">
              <h4 className="font-semibold text-xs text-[#8f8bff] uppercase tracking-wider flex items-center space-x-2">
                <span>🇪🇺</span>
                <span>EU GDPR Benchmark Alignment</span>
              </h4>
              <ul className="text-xs space-y-2 text-[#b6b6c2]">
                <li>• <strong className="text-[#f5f5f8]">Article 5(1)(c) (Data Minimization):</strong> Processing limited strictly to necessary demographic factors.</li>
                <li>• <strong className="text-[#f5f5f8]">Article 6(1)(b) (Contract):</strong> Data stored solely to deliver requested tracking and advisory features.</li>
                <li>• <strong className="text-[#f5f5f8]">Article 17 (Right to be Forgotten):</strong> Direct automated account purging.</li>
                <li>• <strong className="text-[#f5f5f8]">Article 20 (Data Portability):</strong> One-click JSON data export functionality.</li>
                <li>• <strong className="text-[#f5f5f8]">Article 33 (Breach Reporting):</strong> Harmonized with CERT-In 6-hour cybersecurity reporting mandate.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Citizen Data Rights Tool */}
      {activeTab === 'my_rights' && (
        <div className="bytune-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-lg font-medium tracking-tight text-[#f5f5f8]">Self-Serve Citizen Data Rights</h2>
            <p className="text-xs text-[#8a8a97] mt-0.5">Exercise your statutory rights under Section 11 & Section 12 of the DPDP Act 2023.</p>
          </div>

          {statusMessage && (
            <div className="p-4 rounded-2xl bg-[#6fd8ff]/10 border border-[#6fd8ff]/30 text-xs text-[#6fd8ff] flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#6fd8ff]" />
              <span className="text-[#f5f5f8]">{statusMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Data Card */}
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3.5">
              <div className="flex items-center space-x-2 text-[#8f8bff] font-medium text-sm">
                <Download className="w-4 h-4" />
                <h3 className="text-[#f5f5f8]">Right to Data Portability</h3>
              </div>
              <p className="text-xs text-[#b6b6c2] leading-relaxed">
                Download a complete, machine-readable JSON copy of your personal profile, saved schemes, eligibility records, and application tracking history.
              </p>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="bytune-btn-accent text-xs px-5 py-2.5 disabled:opacity-50 inline-flex items-center space-x-2"
              >
                {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isExporting ? 'Generating Package...' : 'Download My Data (JSON)'}</span>
              </button>
            </div>

            {/* Erasure Card */}
            <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] space-y-3.5">
              <div className="flex items-center space-x-2 text-rose-400 font-medium text-sm">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-[#f5f5f8]">Right to Erasure (Delete Account)</h3>
              </div>
              <p className="text-xs text-[#b6b6c2] leading-relaxed">
                Permanently purge your citizen profile, login credentials, and all recorded application tracker entries from JANASEVA servers in compliance with statutory erasure laws.
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-full px-5 py-2.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all font-medium text-xs inline-flex items-center space-x-2 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Request Permanent Erasure</span>
                </button>
              ) : (
                <div className="p-4 bg-[#101016] rounded-2xl border border-rose-500/30 space-y-3">
                  <p className="text-xs font-medium text-rose-300">
                    Are you sure? This action is permanent and cannot be undone.
                  </p>
                  <div className="flex space-x-2.5">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-full bg-white/[0.08] text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/[0.12] text-xs font-medium transition-all border border-white/[0.08]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Anti-Fraud Advisory */}
      {activeTab === 'anti_fraud' && (
        <div className="bytune-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-lg font-medium tracking-tight text-[#f5f5f8]">Anti-Fraud Advisory & Zero-Fee Guarantee</h2>
            <p className="text-xs text-[#8a8a97] mt-0.5">Protecting vulnerable rural citizens, farmers, and women from predatory intermediaries.</p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm text-[#b6b6c2] leading-relaxed">
            <div className="p-5 rounded-2xl bg-[#f3c64f]/10 border border-[#f3c64f]/30 text-[#f5f5f8] space-y-2 shadow-[0_0_20px_rgba(243,198,79,0.1)]">
              <div className="flex items-center space-x-2 font-medium text-sm text-[#f3c64f]">
                <AlertTriangle className="w-5 h-5" />
                <span>100% Free Public Civic Utility Notice</span>
              </div>
              <p className="text-xs text-[#f5f5f8]/90 leading-relaxed">
                JANASEVA is an entirely free civic public utility. No fee or subscription is ever charged to search schemes, 
                check eligibility, or track application statuses.
              </p>
            </div>

            <h3 className="text-sm font-medium text-[#f5f5f8] pt-2">How to Identify and Avoid Fraudulent Touts:</h3>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#b6b6c2]">
              <li>
                <strong className="text-[#f5f5f8]">No Official Asks for Money to Sanction Schemes:</strong> Government welfare programs (such as Gruha Lakshmi, PM-KISAN, or SSP Scholarships) deposit funds directly into your verified bank account through Direct Benefit Transfer (DBT).
              </li>
              <li>
                <strong className="text-[#f5f5f8]">Never Share OTPs or Bank PINs:</strong> Authorized government staff will never call you asking for OTPs, ATM PINs, or net-banking credentials.
              </li>
              <li>
                <strong className="text-[#f5f5f8]">Use Official Seva Kendra Touchpoints:</strong> For offline assistance in Karnataka, visit only authorized government centers such as <strong className="text-[#f5f5f8]">Grama One</strong>, <strong className="text-[#f5f5f8]">Karnataka One</strong>, or <strong className="text-[#f5f5f8]">Bapuji Seva Kendra</strong> where standard statutory nominal charges are legally capped.
              </li>
            </ul>

            <div className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-xs font-medium text-[#f5f5f8] mb-1">Grievance & Cybercrime Helplines:</h4>
              <p className="text-xs text-[#b6b6c2]">
                To report fraud or cybercrime in Karnataka or India, call the National Cyber Crime Reporting Portal at <strong className="text-[#6fd8ff]">1930</strong> or visit <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-[#8f8bff] hover:underline">cybercrime.gov.in</a>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
