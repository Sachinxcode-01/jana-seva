import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams
} from 'react-router-dom';

// Public Components & Pages
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SchemesPage } from './pages/SchemesPage';
import { EligibilityCheckerPage } from './pages/EligibilityCheckerPage';
import { ComparePage } from './pages/ComparePage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CompliancePage } from './pages/CompliancePage';
import { AllStatesDirectory } from './components/AllStatesDirectory';
import { SchemeDetailsModal } from './components/SchemeDetailsModal';
import { JanasevaAssistant } from './components/JanasevaAssistant';
import { AuthModal } from './components/AuthModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Dedicated Authentication Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Citizen Portal Layout & Pages
import { CitizenLayout } from './components/citizen/CitizenLayout';
import { CitizenDashboardPage } from './pages/citizen/CitizenDashboardPage';
import { CitizenProfilePage } from './pages/citizen/CitizenProfilePage';
import { SavedSchemesPage } from './pages/citizen/SavedSchemesPage';
import { CitizenApplicationsPage } from './pages/citizen/CitizenApplicationsPage';
import { EligibilityHistoryPage } from './pages/citizen/EligibilityHistoryPage';
import { MyDocumentsPage } from './pages/citizen/MyDocumentsPage';
import { CitizenNotificationsPage } from './pages/citizen/CitizenNotificationsPage';
import { CitizenSettingsPage } from './pages/citizen/CitizenSettingsPage';

// Contexts & Services
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api, FALLBACK_SCHEMES } from './services/api';
import { Scheme } from './types';

  // ==========================================
  // ROUTE GUARDS
  // ==========================================

  const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050507]">
          <div className="w-8 h-8 border-2 border-[#8f8bff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    return children;
  };

  const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050507]">
          <div className="w-8 h-8 border-2 border-[#8f8bff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    if (!isAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    const [searchParams] = useSearchParams();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050507]">
          <div className="w-8 h-8 border-2 border-[#8f8bff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (user) {
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        return <Navigate to={redirectUrl} replace />;
      }
      return <Navigate to={isAdmin ? "/admin" : "/citizen/dashboard"} replace />;
    }

    return children;
  };

  // ==========================================
  // PUBLIC LAYOUT WRAPPER
  // ==========================================

  interface PublicLayoutProps {
    setCurrentTab: (tab: string) => void;
    openAuthModal: () => void;
    onSelectState: (state: string) => void;
    children: React.ReactNode;
  }

  const PublicLayout: React.FC<PublicLayoutProps> = ({
    setCurrentTab,
    openAuthModal,
    onSelectState,
    children
  }) => {
    return (
      <>
        <Navbar
          setCurrentTab={setCurrentTab}
          openAuthModal={openAuthModal}
          notificationsCount={3}
          onSelectStateFilter={onSelectState}
        />
        <main className="flex-1">
          {children}
        </main>
        <Footer
          setCurrentTab={setCurrentTab}
        />
      </>
    );
  };

  // ==========================================
  // MAIN APP CONTENT
  // ==========================================

  const AppRoutes: React.FC = () => {
    const navigate = useNavigate();
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
      if (tab === 'schemes' || tab === 'categories') {
        navigate('/schemes');
      } else if (tab === 'eligibility') {
        navigate('/eligibility');
      } else if (tab === 'compare') {
        navigate('/compare');
      } else {
        navigate(tab === 'home' ? '/' : `/${tab}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelectState = (stateName: string) => {
      setStateFilter(stateName);
      navigate('/schemes');
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

  const handleTabNavigation = (tab: string) => {
    if (tab === 'home') navigate('/');
        else if (tab === 'dashboard') navigate('/citizen/dashboard');
        else navigate(`/${tab}`);
        window.scrollTo({top: 0, behavior: 'smooth' });
  };

  return (
          <div className="min-h-screen flex flex-col bg-[#050507] text-[#f5f5f8] font-sans antialiased selection:bg-[#8f8bff]/30 selection:text-white relative overflow-x-hidden">
            {/* Civic Ambient Glow Overlays */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(143,139,255,0.14),_transparent_70%)]" />
            <div className="fixed top-[30%] right-[-15%] w-[800px] h-[700px] pointer-events-none -z-10 bg-[radial-gradient(circle,_rgba(111,216,255,0.07),_transparent_65%)]" />
            <div className="fixed bottom-0 left-[-10%] w-[900px] h-[700px] pointer-events-none -z-10 bg-[radial-gradient(circle,_rgba(143,139,255,0.06),_transparent_70%)]" />

            {/* Routes Switcher */}
            <Routes>
              {/* PUBLIC ROUTES WITH STANDARD NAVBAR & FOOTER */}
              <Route
                path="/"
                element={
                  <PublicLayout
                    setCurrentTab={handleTabNavigation}
                    openAuthModal={() => setAuthModalOpen(true)}
                    onSelectState={handleSelectState}
                  >
                    <HomePage
                      schemes={schemes}
                      onSelectScheme={(s) => setSelectedScheme(s)}
                      onNavigateTab={handleNavigateWithCategory}
                      onToggleSaveScheme={handleToggleSaveScheme}
                      savedSchemeIds={savedSchemeIds}
                      onSelectStateFilter={handleSelectState}
                    />
                  </PublicLayout>
                }
              />

                <Route
                  path="/schemes"
                  element={
                    <PublicLayout
                      setCurrentTab={handleTabNavigation}
                      openAuthModal={() => setAuthModalOpen(true)}
                      onSelectState={handleSelectState}
                    >
                      <SchemesPage
                        schemes={schemes}
                        onSelectScheme={(s) => setSelectedScheme(s)}
                        onCheckEligibility={() => {
                          navigate('/eligibility');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onToggleSaveScheme={handleToggleSaveScheme}
                        savedSchemeIds={savedSchemeIds}
                        initialCategory={categoryFilter}
                        initialState={stateFilter}
                        initialSearch={searchFilter}
                        onClearSearch={() => setSearchFilter('')}
                      />
                    </PublicLayout>
                  }
                />

        <Route
          path="/categories"
          element={
            <PublicLayout
              setCurrentTab={handleTabNavigation}
              openAuthModal={() => setAuthModalOpen(true)}
              onSelectState={handleSelectState}
            >
              <SchemesPage
                schemes={schemes}
                onSelectScheme={(s) => setSelectedScheme(s)}
                onCheckEligibility={() => {
                  navigate('/eligibility');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onToggleSaveScheme={handleToggleSaveScheme}
                savedSchemeIds={savedSchemeIds}
                initialCategory={categoryFilter}
                initialState={stateFilter}
                initialSearch={searchFilter}
                onClearSearch={() => setSearchFilter('')}
              />
            </PublicLayout>
          }
        />

        <Route
          path="/states"
          element={
            <PublicLayout
              setCurrentTab={handleTabNavigation}
              openAuthModal={() => setAuthModalOpen(true)}
              onSelectState={handleSelectState}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                <AllStatesDirectory onSelectState={handleSelectState} />
              </div>
            </PublicLayout>
          }
        />

                <Route
                  path="/eligibility"
                  element={
                    <PublicLayout
                      setCurrentTab={handleTabNavigation}
                      openAuthModal={() => setAuthModalOpen(true)}
                      onSelectState={handleSelectState}
                    >
                      <EligibilityCheckerPage
                        onViewSchemeDetails={handleSelectSchemeById}
                      />
                    </PublicLayout>
                  }
                />

                <Route
                  path="/compare"
                  element={
                    <PublicLayout
                      setCurrentTab={handleTabNavigation}
                      openAuthModal={() => setAuthModalOpen(true)}
                      onSelectState={handleSelectState}
                    >
                      <ComparePage
                        schemes={schemes}
                        onSelectScheme={(s) => setSelectedScheme(s)}
                        savedSchemeIds={savedSchemeIds}
                        onToggleSaveScheme={handleToggleSaveScheme}
                      />
                    </PublicLayout>
                  }
                />

        <Route
          path="/about"
          element={
            <PublicLayout
              setCurrentTab={handleTabNavigation}
              openAuthModal={() => setAuthModalOpen(true)}
              onSelectState={handleSelectState}
            >
              <AboutPage />
            </PublicLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <PublicLayout
              setCurrentTab={handleTabNavigation}
              openAuthModal={() => setAuthModalOpen(true)}
              onSelectState={handleSelectState}
            >
              <ContactPage />
            </PublicLayout>
          }
        />

        <Route
          path="/compliance"
          element={
            <PublicLayout
              setCurrentTab={handleTabNavigation}
              openAuthModal={() => setAuthModalOpen(true)}
              onSelectState={handleSelectState}
            >
              <CompliancePage />
            </PublicLayout>
          }
        />

        {/* Backward Compatibility Redirect */}
              <Route path="/dashboard" element={<Navigate to="/citizen/dashboard" replace />} />

              {/* ADMIN ROUTE (PROTECTED BY REQUIREADMIN) */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <PublicLayout
                      setCurrentTab={handleTabNavigation}
                      openAuthModal={() => setAuthModalOpen(true)}
                      onSelectState={handleSelectState}
                    >
                      <AdminPage
                        schemes={schemes}
                        onRefreshSchemes={loadSchemes}
                      />
                    </PublicLayout>
                  </RequireAdmin>
                }
              />

              {/* UNAUTHORIZED (403) PAGE */}
              <Route
                path="/unauthorized"
                element={
                  <PublicLayout
                    setCurrentTab={handleTabNavigation}
                    openAuthModal={() => setAuthModalOpen(true)}
                    onSelectState={handleSelectState}
                  >
                    <UnauthorizedPage />
                  </PublicLayout>
                }
              />

              {/* DEDICATED AUTHENTICATION ROUTES (SPLIT-SCREEN) */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicOnlyRoute>
                    <ForgotPasswordPage />
                  </PublicOnlyRoute>
                }
              />

              {/* CITIZEN PORTAL (PROTECTED BY REQUIREAUTH & NESTED UNDER CITIZENLAYOUT) */}
              <Route
                path="/citizen"
                element={
                  <RequireAuth>
                    <CitizenLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Navigate to="/citizen/dashboard" replace />} />
                <Route
                  path="dashboard"
                  element={
                    <CitizenDashboardPage
                      schemes={schemes}
                      onSelectScheme={(s) => setSelectedScheme(s)}
                      onToggleSaveScheme={handleToggleSaveScheme}
                      savedSchemeIds={savedSchemeIds}
                    />
            }
          />
                <Route path="profile" element={<CitizenProfilePage />} />
                <Route
                  path="saved-schemes"
                  element={
                    <SavedSchemesPage
                      onSelectScheme={(s) => setSelectedScheme(s)}
                      onToggleSaveScheme={handleToggleSaveScheme}
                    />
                  }
                />
                <Route
                  path="applications"
                  element={
                    <CitizenApplicationsPage
                      schemes={schemes}
                      onSelectScheme={(s) => setSelectedScheme(s)}
                    />
            }
          />
                <Route path="eligibility-history" element={<EligibilityHistoryPage />} />
                <Route path="documents" element={<MyDocumentsPage />} />
                <Route path="notifications" element={<CitizenNotificationsPage />} />
                <Route path="settings" element={<CitizenSettingsPage />} />
              </Route>

              {/* CATCH-ALL REDIRECT */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Scheme Details Modal (Available globally) */}
            <SchemeDetailsModal
              scheme={selectedScheme}
              onClose={() => setSelectedScheme(null)}
              onSelectScheme={(s) => setSelectedScheme(s)}
              isSaved={selectedScheme ? savedSchemeIds.includes(selectedScheme.id) : false}
              onToggleSave={handleToggleSaveScheme}
              relatedSchemes={
                selectedScheme
                  ? schemes.filter(s => s.category === selectedScheme.category && s.id !== selectedScheme.id).slice(0, 3)
                  : []
              }
            />

        {/* Fallback Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />

        {/* Floating Janaseva Assistant AI Chatbot (Available globally) */}
        <JanasevaAssistant
          onViewSchemeDetails={handleSelectSchemeById}
        />

        {/* DPDP Act 2023 Compliant Essential Storage & Cookie Consent */}
        <CookieConsentBanner
          onLearnMore={() => {
            navigate('/compliance');
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
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
