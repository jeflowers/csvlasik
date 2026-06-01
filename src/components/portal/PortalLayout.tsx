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
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from 'lucide-react';
import { usePatient } from '../../hooks/usePatient';
import LanguageSelector from '../LanguageSelector';
import TikTokIcon from '../icons/TikTokIcon';

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

  const isRTL = i18n.dir() === 'rtl';

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

  const portalLabel = user?.firstName
    ? `${user.firstName}'s Portal`
    : t('portal.title', { defaultValue: 'Patient Portal' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - matches main site */}
      <div className="chopard-gradient text-white relative z-30">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''} ${sidebarOpen ? '' : 'ml-12 lg:ml-0'}`}>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label="X (Twitter)"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>

            <div className={`flex items-center space-x-6 text-sm font-medium ${isRTL ? 'space-x-reverse' : ''}`}>
              <Link to="/portal" className="hidden sm:flex items-center hover:text-gray-200 transition-colors">
                <User className={`h-4 w-4 text-white ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>{portalLabel}</span>
              </Link>
              <Link to="/contact" className="hidden md:flex items-center hover:text-gray-200 transition-colors">
                <Mail className={`h-4 w-4 text-white ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>{t('nav.contactUs', { defaultValue: 'Contact Us' })}</span>
              </Link>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-50 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
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
          lg:translate-x-0 lg:top-[52px] lg:h-[calc(100vh-52px)] lg:z-20
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
                  <p className="text-xs text-gray-500">Atelier LASIK</p>
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
