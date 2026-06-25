import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Image,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  Shield,
  Calendar,
  ChevronDown,
  ChevronRight,
  Mail,
  Database,
  Lock,
  ScrollText
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import Logo from '../Logo';
import { roleColor } from '../../utils/roleColor';

interface NavigationSection {
  name: string;
  items: NavigationItem[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

const AdminLayout: React.FC = () => {
  const { user, logout } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    content: true,
    compliance: false,
    system: false,
    communication: false
  });
  const location = useLocation();
  const navigate = useNavigate();

  const navigationSections: NavigationSection[] = [
    {
      name: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ]
    },
    {
      name: 'Content Management',
      items: [
        { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
        { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
        { name: 'External Reviews', href: '/admin/external-reviews', icon: Shield },
        { name: 'Articles', href: '/admin/articles', icon: FileText },
        { name: 'Media Library', href: '/admin/media', icon: Image },
        { name: 'Photo Gallery', href: '/admin/gallery', icon: Image },
      ]
    },
    {
      name: 'Communication',
      items: [
        { name: 'Email Queue', href: '/admin/email-queue', icon: Mail },
        { name: 'Email Templates', href: '/admin/email-templates', icon: FileText },
      ]
    },
    {
      name: 'Compliance & Security',
      items: [
        { name: 'Compliance Dashboard', href: '/admin/compliance', icon: Shield },
        { name: 'HIPAA Audit', href: '/admin/compliance/hipaa-audit', icon: Shield },
        { name: 'ISO 27001', href: '/admin/compliance/iso27001', icon: Shield },
        { name: 'BAA Management', href: '/admin/compliance/baa', icon: Shield },
        { name: 'Data Retention', href: '/admin/data-retention', icon: Database },
        { name: 'Management Review', href: '/admin/management-review', icon: FileText },
        { name: 'Security Dashboard', href: '/admin/security', icon: Lock },
      ]
    },
    {
      name: 'System',
      items: [
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
        { name: 'Translation Editor', href: '/admin/translations/editor', icon: Globe },
        { name: 'Logs', href: '/admin/system/logs', icon: ScrollText },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    },
  ];

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const userRoleColor = roleColor(user?.role);

  const renderNavItems = (section: NavigationSection, closeMobile?: boolean) => {
    const sectionKey = section.name.toLowerCase().replace(/\s+/g, '-');
    const isExpanded = expandedSections[sectionKey];
    return (
      <div key={section.name}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
        >
          <span>{section.name}</span>
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-0.5">
            {section.items.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== '/admin' && location.pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'border-l-[3px] border-bullion bg-cream text-onyx font-medium'
                      : 'border-l-[3px] border-transparent text-gray-600 hover:bg-gray-50 hover:text-graphite'
                  }`}
                  onClick={closeMobile ? () => setSidebarOpen(false) : undefined}
                >
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex h-full w-64 flex-col bg-white">
          <div className="h-[3px] w-full" style={{ background: userRoleColor }} />
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <Logo variant="horizontal" mode="light" height={32} tagline={false} />
              <span className="text-[10px] font-medium bg-champagne/20 text-champagne px-2 py-0.5 rounded">CMS</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <div className="space-y-4">
              {navigationSections.map((section) => renderNavItems(section, true))}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="h-[3px] w-full" style={{ background: userRoleColor }} />
          <div className="flex h-16 items-center px-4">
            <Link to="/" className="flex items-center gap-2">
              <Logo variant="horizontal" mode="light" height={32} tagline={false} />
              <span className="text-[10px] font-medium bg-champagne/20 text-champagne px-2 py-0.5 rounded">CMS</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <div className="space-y-4">
              {navigationSections.map((section) => renderNavItems(section))}
            </div>
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className="h-8 w-8 rounded-full bg-onyx flex items-center justify-center"
                  style={{ boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${userRoleColor}` }}
                >
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-champagne">
                  {user?.role?.replace(/_/g, ' ')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <Logo variant="horizontal" mode="light" height={26} tagline={false} />
              <span className="text-[9px] font-medium bg-champagne/20 text-champagne px-1.5 py-0.5 rounded">CMS</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
