import React, { useState } from 'react';
import {
  Building2, Globe2, User, LogOut,
  Menu, X, LayoutDashboard, ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
  notificationsCount: number;
  onSelectStateFilter?: (stateName: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const primaryNavItems = [
    { id: 'home', label: t('home') },
    { id: 'schemes', label: t('schemesNav') || t('exploreSchemes') },
    { id: 'eligibility', label: t('eligibilityNav') || t('eligibilityChecker') },
    { id: 'compare', label: t('compareNav') || t('compareSchemes') },
  ];

  const secondaryNavItems = [
    { id: 'about', label: t('aboutNav') || t('aboutUs') },
    { id: 'contact', label: t('contactNav') || t('contact') },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0e]/95 backdrop-blur-[20px] saturate-[1.6] border-b border-white/[0.08] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]">
      {/* 1.5px Glowing Accent Line */}
      <div className="h-[1.5px] w-full bg-gradient-to-r from-[#8f8bff] via-[#6fd8ff] to-[#1ed760] opacity-80"></div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left Group: Brand Logo & Navigation */}
          <div className="flex items-center space-x-3 xl:space-x-4 min-w-0">
            {/* Brand Logo & Title */}
            <div
              onClick={() => setCurrentTab('home')}
              className="flex items-center space-x-2.5 cursor-pointer group select-none shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#16161d] to-[#0a0a0e] text-[#8f8bff] flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] border border-white/10 group-hover:border-[#8f8bff]/50 group-hover:shadow-[0_0_15px_rgba(143,139,255,0.3)] transition-all duration-300 shrink-0">
                <Building2 className="w-4 h-4 text-[#8f8bff]" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base tracking-[-0.03em] text-[#f5f5f8] font-sans leading-none">
                  {t('portalName')}
                </span>
                <span className="text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#6fd8ff] border border-[#6fd8ff]/20 leading-none hidden sm:inline-block">
                  National Portal
                </span>
              </div>
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:block h-4 w-[1px] bg-white/[0.1] shrink-0" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-0.5 bg-white/[0.03] p-1 rounded-full border border-white/[0.07] backdrop-blur-md">
              {/* Primary Links */}
              {primaryNavItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive
                      ? 'bg-[#f5f5f8] text-[#0a0a0c] font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                      : 'text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/[0.06]'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Secondary Links: Visible on XL, otherwise accessible in More dropdown */}
              <div className="hidden xl:flex items-center space-x-0.5">
                {secondaryNavItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive
                        ? 'bg-[#f5f5f8] text-[#0a0a0c] font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : 'text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/[0.06]'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* More Dropdown for 1024px to 1279px screens */}
              <div className="xl:hidden relative">
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1 cursor-pointer ${
                    secondaryNavItems.some(i => i.id === currentTab)
                      ? 'bg-white/10 text-[#f5f5f8] font-semibold'
                      : 'text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/[0.06]'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {moreDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-36 bg-[#101016]/95 backdrop-blur-xl text-[#f5f5f8] rounded-2xl shadow-2xl border border-white/10 py-1.5 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setMoreDropdownOpen(false)}
                  >
                    {secondaryNavItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setMoreDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center transition-colors cursor-pointer ${
                          currentTab === item.id ? 'bg-[#8f8bff]/15 text-[#8f8bff] font-semibold' : 'hover:bg-white/5 text-[#b6b6c2]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action: Language Switcher + User Status / Login Button */}
          <div className="hidden lg:flex items-center space-x-2 shrink-0 ml-auto">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="h-9 px-3.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-[#f5f5f8] text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Globe2 className="w-3.5 h-3.5 text-[#8f8bff] shrink-0" />
                <span>{languages.find(l => l.code === language)?.native || 'Language'}</span>
                <ChevronDown className="w-3 h-3 text-[#8a8a97] shrink-0" />
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-36 bg-[#101016]/95 backdrop-blur-xl text-[#f5f5f8] rounded-2xl shadow-2xl border border-white/10 py-1.5 z-50 animate-in fade-in duration-150"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${language === l.code ? 'bg-[#8f8bff]/15 text-[#8f8bff] font-semibold' : 'hover:bg-white/5 text-[#b6b6c2]'
                        }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-[#8a8a97] font-mono">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Button / Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="h-9 px-3.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-[13px] font-medium text-[#f5f5f8] shadow-sm flex items-center space-x-2 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8f8bff] to-[#6fd8ff] text-[#050507] flex items-center justify-center font-bold text-xs shrink-0">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-[13px]">{user.fullName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8a8a97] shrink-0" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#101016]/95 backdrop-blur-xl text-[#f5f5f8] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-white/5">
                      <p className="text-xs font-semibold text-[#f5f5f8] truncate">{user.fullName}</p>
                      <p className="text-[11px] text-[#8a8a97] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#8f8bff]/15 text-[#8f8bff] capitalize">
                        {user.role} Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-[13px] text-[#b6b6c2] hover:text-[#f5f5f8] hover:bg-white/5 flex items-center space-x-2 font-medium transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#8f8bff] shrink-0" />
                      <span>{t('dashboard')}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentTab('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-[13px] hover:bg-[#f3c64f]/10 flex items-center space-x-2 font-semibold text-[#f3c64f] transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#f3c64f] shrink-0" />
                        <span>{t('adminPanel')}</span>
                      </button>
                    )}

                    <div className="border-t border-white/5 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        setCurrentTab('home');
                      }}
                      className="w-full text-left px-3.5 py-2 text-[13px] text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 font-medium transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="bytune-btn-solid h-9 px-5 text-[13.5px] flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <User className="w-4 h-4 shrink-0 text-[#0a0a0c]" />
                <span>{t('login')} / {t('register')}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-[#f5f5f8] hover:bg-white/10 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 space-y-1 bg-[#0a0a0e]/95 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
            {allNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left h-10 px-4 rounded-xl text-sm flex items-center justify-between transition-colors ${isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-[#b6b6c2] hover:bg-white/5 font-normal'
                    }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between px-2 text-xs text-[#8a8a97]">
                <span>Language:</span>
                <div className="flex space-x-1">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`px-2 py-1 rounded-md text-xs font-mono ${language === l.code ? 'bg-[#8f8bff] text-black font-bold' : 'text-[#b6b6c2]'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {!user ? (
                <button
                  onClick={() => {
                    openAuthModal();
                    setMobileMenuOpen(false);
                  }}
                  className="bytune-btn-solid w-full h-10 text-sm justify-center flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>{t('login')} / {t('register')}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full h-10 px-4 rounded-xl text-sm text-rose-400 bg-rose-500/10 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
