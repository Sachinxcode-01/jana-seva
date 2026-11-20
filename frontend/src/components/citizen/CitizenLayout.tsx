import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, User as UserIcon, Bookmark, FileText, History,
  FolderArchive, Compass, CheckCircle2, SlidersHorizontal, Bot,
  Bell, Globe, Shield, HelpCircle, LogOut, ChevronLeft, ChevronRight,
  Menu, X, Building2, ChevronDown, Check, ExternalLink, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { AppNotification, Language } from '../../types';

interface CitizenLayoutProps {
  onOpenAssistant?: () => void;
  children?: React.ReactNode;
}

interface SidebarItem {
  path: string;
  label: string;
  icon: any;
  external?: boolean;
  action?: () => void;
  badge?: number;
}

interface SidebarSection {
  group: string;
  items: SidebarItem[];
}

export const CitizenLayout: React.FC<CitizenLayoutProps> = ({ onOpenAssistant, children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter((n: AppNotification) => !n.isRead).length);
      }
    } catch { }
  };

  useEffect(() => {
    loadNotifications();
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  ];

  const sidebarSections: SidebarSection[] = [
    {
      group: 'OVERVIEW',
      items: [
        { path: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'MY ACCOUNT',
      items: [
        { path: '/citizen/profile', label: 'My Profile', icon: UserIcon },
        { path: '/citizen/saved-schemes', label: 'Saved Schemes', icon: Bookmark },
        { path: '/citizen/applications', label: 'My Applications', icon: FileText },
        { path: '/citizen/eligibility-history', label: 'Eligibility History', icon: History },
        { path: '/citizen/documents', label: 'My Documents', icon: FolderArchive }
      ]
    },
    {
      group: 'DISCOVER',
      items: [
        { path: '/schemes', label: 'Browse Schemes', icon: Compass, external: false },
        { path: '/eligibility', label: 'Eligibility Checker', icon: CheckCircle2, external: false },
        { path: '/compare', label: 'Compare Schemes', icon: SlidersHorizontal, external: false },
        {
          path: '#assistant',
          label: 'Janaseva AI Assistant',
          icon: Bot,
          action: () => {
            if (onOpenAssistant) onOpenAssistant();
            else {
              const btn = document.querySelector('[aria-label="Janaseva AI Assistant"]') as HTMLElement;
              if (btn) btn.click();
            }
          }
        }
      ]
    },
    {
      group: 'SETTINGS',
      items: [
        {
          path: '#language',
          label: 'Language Preferences',
          icon: Globe,
          action: () => setLangDropdownOpen(prev => !prev)
        },
        { path: '/citizen/settings', label: 'Security Settings', icon: Shield },
        { path: '/citizen/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined }
      ]
    },
    {
      group: 'SUPPORT',
      items: [
        { path: '/contact', label: 'Help & Support', icon: HelpCircle },
        {
          path: '#logout',
          label: 'Logout',
          icon: LogOut,
          action: () => {
            logout();
            navigate('/login');
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050507] text-[#f5f5f8] antialiased">
      {/* Top Civic Accent Strip */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#ff9933] via-[#ffffff] to-[#138808] opacity-90 shrink-0" />

      {/* DASHBOARD HEADER */}
      <header className="sticky top-0 z-30 bg-[#0a0a0e]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Logo / Breadcrumb */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#b6b6c2] hover:text-white hover:bg-white/5 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/citizen/dashboard" className="flex items-center space-x-2.5 group select-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#16161d] to-[#0a0a0e] text-[#8f8bff] flex items-center justify-center border border-white/10 group-hover:border-[#8f8bff]/50 transition-all shadow-[0_0_12px_rgba(143,139,255,0.2)]">
                <Building2 className="w-4 h-4 text-[#8f8bff]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5 leading-none">
                  <span className="font-bold text-sm tracking-tight text-white">JANASEVA</span>
                  <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">
                    Citizen
                  </span>
                </div>
                <span className="text-[10px] text-[#8a8a97] hidden sm:inline">Citizen Welfare Portal</span>
              </div>
            </Link>
          </div>

          {/* Center: Greeting */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-[#b6b6c2]">
            <span>Welcome back,</span>
            <span className="font-semibold text-white truncate max-w-[200px]">
              {user?.fullName || 'Citizen'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[#8a8a97]">
              {user?.state || 'Karnataka'}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2.5">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="h-9 px-3 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#8f8bff]" />
                <span className="hidden sm:inline">{languages.find(l => l.code === language)?.native || 'Lang'}</span>
                <ChevronDown className="w-3 h-3 text-[#8a8a97]" />
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-36 bg-[#101016]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${language === l.code ? 'bg-[#8f8bff]/15 text-[#8f8bff] font-semibold' : 'text-[#b6b6c2] hover:bg-white/5'
                        }`}
                    >
                      <span>{l.native}</span>
                      {language === l.code && <Check className="w-3 h-3 text-[#8f8bff]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center relative text-[#b6b6c2] hover:text-white transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff9933] text-[9px] font-bold text-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#101016]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in"
                  onMouseLeave={() => setNotifDropdownOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
                    <span className="text-xs font-semibold text-white">Notifications ({unreadCount} unread)</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#8f8bff] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 py-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#8a8a97] text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs transition-colors ${n.isRead ? 'bg-white/[0.02] border-white/5 text-[#8a8a97]' : 'bg-[#8f8bff]/10 border-[#8f8bff]/20 text-white'
                            }`}
                        >
                          <p className="font-semibold text-[11px] mb-0.5">{n.title}</p>
                          <p className="text-[11px] text-[#b6b6c2] line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 text-center">
                    <Link
                      to="/citizen/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-xs text-[#8f8bff] hover:underline font-semibold"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Account Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="h-9 px-2 sm:px-3 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] flex items-center space-x-2 text-xs font-medium cursor-pointer transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8f8bff] to-[#6fd8ff] text-[#050507] flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.fullName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate text-white">
                  {user?.fullName || 'Citizen'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8a8a97]" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#101016]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-white/10">
                    <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                    <p className="text-[11px] text-[#8a8a97] truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8f8bff]/15 text-[#8f8bff]">
                      {user?.role} Account
                    </span>
                  </div>

                  <Link
                    to="/citizen/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#b6b6c2] hover:text-white hover:bg-white/5 flex items-center space-x-2 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#8f8bff]" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/citizen/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#b6b6c2] hover:text-white hover:bg-white/5 flex items-center space-x-2 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#8f8bff]" />
                    <span>Security & Settings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#f3c64f] hover:bg-[#f3c64f]/10 flex items-center space-x-2 font-semibold transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#f3c64f]" />
                      <span>Admin Portal</span>
                    </Link>
                  )}

                  <div className="border-t border-white/5 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY WITH COLLAPSIBLE SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto relative">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden lg:flex flex-col border-r border-white/[0.08] bg-[#08080c]/80 backdrop-blur-md transition-all duration-300 shrink-0 select-none ${collapsed ? 'w-20' : 'w-64'
            }`}
        >
          {/* Collapse Toggle */}
          <div className="p-3 flex justify-end border-b border-white/[0.05]">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-xl hover:bg-white/5 text-[#8a8a97] hover:text-white transition-colors cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {sidebarSections.map((section) => (
              <div key={section.group} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#8a8a97]/80">
                    {section.group}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    if (item.action) {
                      return (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#b6b6c2] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer group"
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon className="w-4 h-4 shrink-0 text-[#8f8bff] group-hover:scale-110 transition-transform" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive
                            ? 'bg-gradient-to-r from-[#8f8bff]/20 to-[#6fd8ff]/10 text-white font-semibold border border-[#8f8bff]/30 shadow-sm'
                            : 'text-[#b6b6c2] hover:text-white hover:bg-white/[0.05]'
                          }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8f8bff]' : 'text-[#8a8a97]'}`} />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!collapsed && item.badge !== undefined && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#ff9933] text-black shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Logout Button in Footer of Sidebar */}
          <div className="p-3 border-t border-white/[0.05]">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title={collapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER BACKDROP & MENU */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-[#0c0c12] border-r border-white/10 p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-[#8f8bff]" />
                    <span className="font-bold text-sm text-white">JANASEVA Citizen</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#8a8a97] hover:text-white hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {sidebarSections.map((section) => (
                  <div key={section.group} className="space-y-1">
                    <p className="px-2 text-[10px] uppercase font-bold tracking-wider text-[#8a8a97]">
                      {section.group}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        if (item.action) {
                          return (
                            <button
                              key={item.label}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                item.action!();
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#b6b6c2] hover:text-white hover:bg-white/5"
                            >
                              <Icon className="w-4 h-4 text-[#8f8bff]" />
                              <span>{item.label}</span>
                            </button>
                          );
                        }

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${isActive ? 'bg-[#8f8bff]/20 text-white font-semibold border border-[#8f8bff]/30' : 'text-[#b6b6c2] hover:text-white hover:bg-white/5'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-[#8f8bff]' : 'text-[#8a8a97]'}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#ff9933] text-black">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN OUTLET CONTAINER */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
