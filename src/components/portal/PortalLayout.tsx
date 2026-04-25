import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Star,
  History,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Globe,
  ChevronDown,
  Check,
} from 'lucide-react';
import { usePatient } from '../../hooks/usePatient';
import { SUPPORTED_LANGUAGES, DEMOGRAPHIC_GROUPS } from '../../i18n';
import Cookies from 'js-cookie';

const navItems = [
  { path: '/portal', labelKey: 'nav.dashboard', fallback: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/portal/forms', labelKey: 'nav.patientForms', fallback: 'Patient Forms', icon: FileText },
  { path: '/portal/submissions', labelKey: 'nav.mySubmissions', fallback: 'My Submissions', icon: ClipboardList },
  { path: '/portal/testimonial', labelKey: 'nav.shareStory', fallback: 'Share Your Story', icon: Star },
  { path: '/portal/history', labelKey: 'nav.activityHistory', fallback: 'Activity History', icon: History },
];

const PortalLayout: React.FC = () => {
  const { user, logout } = usePatient();
  const { t, i18n } = useTranslation('patientForms');
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES[i18n.language as keyof typeof SUPPORTED_LANGUAGES] || SUPPORTED_LANGUAGES.en;

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'Patient';

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase()
    : (user?.email?.[0] || 'P').toUpperCase();

  const handleLanguageChange = async (code: string) => {
    try {
      await i18n.changeLanguage(code);
      Cookies.set('i18next', code, { expires: 365 });
      const lang = SUPPORTED_LANGUAGES[code as keyof typeof SUPPORTED_LANGUAGES];
      document.documentElement.dir = lang?.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = code;
      if (lang?.rtl) {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
      setLangOpen(false);
    } catch {
      // non-critical
    }
  };

  const sortedLanguages = Object.values(SUPPORTED_LANGUAGES).sort((a, b) => a.order - b.order);
  const grouped: Record<string, typeof sortedLanguages> = { default: [] };
  for (const lang of sortedLanguages) {
    const key = lang.demographic || 'default';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(lang);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {t('portal.title', { defaultValue: 'Patient Portal' })}
                  </h2>
                  <p className="text-xs text-gray-500">ClearSight LASIK</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-teal-700">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.end);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${active
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-teal-600' : 'text-gray-400'}`} />
                  {t(item.labelKey, { defaultValue: item.fallback })}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-3 border-t border-gray-100">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Globe className="h-5 w-5 text-gray-400" />
                <span className="flex-1 text-left truncate">
                  {currentLang.flag} {currentLang.nativeName}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto z-50">
                  {grouped.default.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        i18n.language === lang.code ? 'bg-teal-50 text-teal-900' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="flex-1 text-left truncate">{lang.nativeName}</span>
                      {i18n.language === lang.code && <Check className="h-4 w-4 text-teal-600" />}
                    </button>
                  ))}
                  {[DEMOGRAPHIC_GROUPS.SOUTHERN_CALIFORNIA, DEMOGRAPHIC_GROUPS.PACIFIC_ISLANDS, DEMOGRAPHIC_GROUPS.ADDITIONAL].map(
                    (groupName) =>
                      grouped[groupName] &&
                      grouped[groupName].length > 0 && (
                        <div key={groupName}>
                          <div className="px-3 py-1.5 mt-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              {groupName}
                            </span>
                          </div>
                          {grouped[groupName].map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                                i18n.language === lang.code ? 'bg-teal-50 text-teal-900' : 'text-gray-700'
                              }`}
                            >
                              <span className="text-lg">{lang.flag}</span>
                              <span className="flex-1 text-left truncate">{lang.nativeName}</span>
                              {i18n.language === lang.code && <Check className="h-4 w-4 text-teal-600" />}
                            </button>
                          ))}
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-gray-100">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mb-1"
            >
              <User className="h-5 w-5 text-gray-400" />
              {t('nav.backToWebsite', { defaultValue: 'Back to Website' })}
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
              {t('nav.signOut', { defaultValue: 'Sign Out' })}
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
