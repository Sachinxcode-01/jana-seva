import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SchemesPage } from './pages/SchemesPage';
import { EligibilityCheckerPage } from './pages/EligibilityCheckerPage';
import { ComparePage } from './pages/ComparePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CompliancePage } from './pages/CompliancePage';
import { AllStatesDirectory } from './components/AllStatesDirectory';
import { SchemeDetailsModal } from './components/SchemeDetailsModal';
import { JanasevaAssistant } from './components/JanasevaAssistant';
import { AuthModal } from './components/AuthModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api, FALLBACK_SCHEMES } from './services/api';
import { Scheme } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [schemes, setSchemes] = useState<Scheme[]>(FALLBACK_SCHEMES);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('janaseva_saved_ids') || '["scheme-pm-kisan"]');
  });

  const loadSchemes = async () => {
    try {
      const res = await api.getSchemes();
      if (res.success && res.schemes.length > 0) {
        setSchemes(res.schemes);
      }
    } catch (e) {
      console.warn('API error, using built-in schemes:', e);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const handleToggleSaveScheme = async (schemeId: string) => {
    const res = await api.toggleSaveScheme(schemeId);
    let updated: string[];
    if (res.saved) {
      updated = [...savedSchemeIds, schemeId];
    } else {
      updated = savedSchemeIds.filter(id => id !== schemeId);
    }
    setSavedSchemeIds(updated);
  };

  const handleNavigateWithCategory = (tab: string, cat?: string, search?: string) => {
    if (cat !== undefined) {
      setCategoryFilter(cat);
    }
    if (search !== undefined) {
      setSearchFilter(search);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectState = (stateName: string) => {
    setStateFilter(stateName);
    setCurrentTab('schemes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSchemeById = async (idOrSlug: string) => {
    const found = schemes.find(s => s.id === idOrSlug || s.slug === idOrSlug);
    if (found) {
      setSelectedScheme(found);
    } else {
      const res = await api.getSchemeById(idOrSlug);
      if (res.scheme) setSelectedScheme(res.scheme);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050507] text-[#f5f5f8] font-sans antialiased selection:bg-[#8f8bff]/30 selection:text-white relative overflow-x-hidden">
      {/* ByTune Ambient Glow Overlays */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(143,139,255,0.14),_transparent_70%)]" />
      <div className="fixed top-[30%] right-[-15%] w-[800px] h-[700px] pointer-events-none -z-10 bg-[radial-gradient(circle,_rgba(111,216,255,0.07),_transparent_65%)]" />
      <div className="fixed bottom-0 left-[-10%] w-[900px] h-[700px] pointer-events-none -z-10 bg-[radial-gradient(circle,_rgba(143,139,255,0.06),_transparent_70%)]" />
      {/* Modern Civic Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAuthModal={() => setAuthModalOpen(true)}
        notificationsCount={3}
        onSelectStateFilter={handleSelectState}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            schemes={schemes}
            onSelectScheme={(s) => setSelectedScheme(s)}
            onNavigateTab={handleNavigateWithCategory}
            onToggleSaveScheme={handleToggleSaveScheme}
            savedSchemeIds={savedSchemeIds}
            onSelectStateFilter={handleSelectState}
          />
        )}

        {(currentTab === 'schemes' || currentTab === 'categories') && (
          <SchemesPage
            schemes={schemes}
            onSelectScheme={(s) => setSelectedScheme(s)}
            onCheckEligibility={() => setCurrentTab('eligibility')}
            onToggleSaveScheme={handleToggleSaveScheme}
            savedSchemeIds={savedSchemeIds}
            initialCategory={categoryFilter}
            initialState={stateFilter}
            initialSearch={searchFilter}
            onClearSearch={() => setSearchFilter('')}
          />
        )}

        {currentTab === 'states' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            <AllStatesDirectory onSelectState={handleSelectState} />
          </div>
        )}

        {currentTab === 'eligibility' && (
          <EligibilityCheckerPage
            onViewSchemeDetails={handleSelectSchemeById}
          />
        )}

        {currentTab === 'compare' && (
          <ComparePage
            schemes={schemes}
            onSelectScheme={(s) => setSelectedScheme(s)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            schemes={schemes}
            onSelectScheme={(s) => setSelectedScheme(s)}
            onToggleSaveScheme={handleToggleSaveScheme}
            savedSchemeIds={savedSchemeIds}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPage
            schemes={schemes}
            onRefreshSchemes={loadSchemes}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage />
        )}

        {currentTab === 'contact' && (
          <ContactPage />
        )}

        {currentTab === 'compliance' && (
          <CompliancePage />
        )}
      </main>

      {/* Modern Civic Footer */}
      <Footer
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Scheme Details Modal */}
      <SchemeDetailsModal
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
        onSelectScheme={(s) => setSelectedScheme(s)}
        isSaved={selectedScheme ? savedSchemeIds.includes(selectedScheme.id) : false}
        onToggleSave={handleToggleSaveScheme}
        relatedSchemes={selectedScheme ? schemes.filter(s => s.category === selectedScheme.category && s.id !== selectedScheme.id).slice(0, 3) : []}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Floating Janaseva Assistant AI Chatbot */}
      <JanasevaAssistant
        onViewSchemeDetails={handleSelectSchemeById}
      />

      {/* DPDP Act 2023 Compliant Essential Storage & Cookie Consent */}
      <CookieConsentBanner
        onLearnMore={() => {
          setCurrentTab('compliance');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
