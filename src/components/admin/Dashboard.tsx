import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  FileText,
  Image,
  CheckCircle,
  AlertCircle,
  Calendar,
  Shield,
  Mail,
  BarChart3,
  Activity,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserCog,
  HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { Card, StatusBadge, Button } from './ui';

interface DashboardStats {
  totalTestimonials: number;
  pendingTestimonials: number;
  publishedArticles: number;
  totalMedia: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalUsers: number;
  activeUsers: number;
  testimonialsChange?: number;
  articlesChange?: number;
  appointmentsChange?: number;
}

interface ActivityItem {
  id: string;
  action: string;
  resource_type: string;
  username: string;
  created_at: string;
  details?: string;
}

interface PortalActivityItem {
  id: number;
  activity_type: string;
  activity_label: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
  user_id: string;
}

interface PortalStats {
  totalPatients: number;
  newPatientsThisWeek: number;
  activePatients: number;
  deactivatedPatients: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTestimonials: 0,
    pendingTestimonials: 0,
    publishedArticles: 0,
    totalMedia: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [portalActivity, setPortalActivity] = useState<PortalActivityItem[]>([]);
  const [portalStats, setPortalStats] = useState<PortalStats>({
    totalPatients: 0,
    newPatientsThisWeek: 0,
    activePatients: 0,
    deactivatedPatients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [overviewData, , portalActivityRes, totalPatientsRes, newPatientsRes, activePatientsRes, deactivatedPatientsRes] = await Promise.all([
          apiService.getDashboardOverview(),
          apiService.getDashboardStats(),
          supabase
            .from('patient_activity_log')
            .select('id, activity_type, activity_label, created_at, metadata, user_id')
            .order('created_at', { ascending: false })
            .limit(10),
          supabase.from('patient_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('patient_profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
          supabase.from('patient_profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('patient_profiles').select('id', { count: 'exact', head: true }).eq('is_active', false),
        ]);

        setPortalActivity((portalActivityRes.data as PortalActivityItem[]) || []);
        setPortalStats({
          totalPatients: totalPatientsRes.count ?? 0,
          newPatientsThisWeek: newPatientsRes.count ?? 0,
          activePatients: activePatientsRes.count ?? 0,
          deactivatedPatients: deactivatedPatientsRes.count ?? 0,
        });

        setStats({
          totalTestimonials: overviewData.overview?.total_testimonials || 0,
          pendingTestimonials: overviewData.overview?.pending_testimonials || 0,
          publishedArticles: overviewData.overview?.published_articles || 0,
          totalMedia: overviewData.overview?.total_media || 0,
          totalAppointments: overviewData.overview?.total_appointments || 0,
          pendingAppointments: overviewData.overview?.pending_appointments || 0,
          totalUsers: overviewData.overview?.total_users || 0,
          activeUsers: overviewData.overview?.active_users || 0,
        });
        setRecentActivity(overviewData.recentActivity || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bullion"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Appointments',
      value: stats.totalAppointments,
      pending: stats.pendingAppointments,
      pendingTone: 'warning' as const,
      icon: Calendar,
      color: 'bg-blue-600',
      change: stats.appointmentsChange,
      link: '/admin/appointments'
    },
    {
      name: 'Testimonials',
      value: stats.totalTestimonials,
      pending: stats.pendingTestimonials,
      pendingTone: 'warning' as const,
      icon: MessageSquare,
      color: 'bg-onyx',
      change: stats.testimonialsChange,
      link: '/admin/testimonials'
    },
    {
      name: 'Published Articles',
      value: stats.publishedArticles,
      icon: FileText,
      color: 'bg-emerald-600',
      change: stats.articlesChange,
      link: '/admin/articles'
    },
    {
      name: 'Media Files',
      value: stats.totalMedia,
      icon: Image,
      color: 'bg-gray-600',
      link: '/admin/media'
    },
    {
      name: 'Portal Patients',
      value: portalStats.totalPatients,
      pending: portalStats.newPatientsThisWeek,
      pendingLabel: 'new this week',
      pendingTone: 'info' as const,
      icon: HeartPulse,
      color: 'bg-rose-600',
      link: '/admin/patients'
    }
  ];

  const quickActions = [
    {
      name: 'New Appointment',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      link: '/admin/appointments'
    },
    {
      name: 'Add Testimonial',
      icon: MessageSquare,
      color: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      link: '/admin/testimonials'
    },
    {
      name: 'Write Article',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      link: '/admin/articles'
    },
    {
      name: 'Upload Media',
      icon: Image,
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
      link: '/admin/media'
    },
    {
      name: 'View Analytics',
      icon: BarChart3,
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
      link: '/admin/analytics'
    },
    {
      name: 'Email Queue',
      icon: Mail,
      color: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
      link: '/admin/email-queue'
    }
  ];

  const systemHealth = [
    {
      name: 'Database',
      status: 'Operational',
      icon: Database,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      name: 'API Services',
      status: 'Operational',
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      name: 'Email Service',
      status: 'Operational',
      icon: Mail,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      name: 'Security',
      status: 'All Clear',
      icon: Shield,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome to Atelier CMS</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/admin/analytics">
            <Button variant="secondary">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="primary">Settings</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">
                {stat.name}
              </p>
              <div className={`${stat.color} rounded-md w-10 h-10 flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-3xl font-semibold tabular-nums text-gray-900">{stat.value}</p>
              {stat.pending !== undefined && stat.pending > 0 && (
                <span
                  className={`text-sm ${
                    'pendingTone' in stat && stat.pendingTone === 'info'
                      ? 'text-blue-700'
                      : 'text-amber-700'
                  }`}
                >
                  ({stat.pending} {('pendingLabel' in stat && stat.pendingLabel) ? stat.pendingLabel : 'pending'})
                </span>
              )}
            </div>
            {stat.change !== undefined && (
              <div className="mt-2 flex items-center text-sm">
                {stat.change >= 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">{stat.change}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">{Math.abs(stat.change)}%</span>
                  </>
                )}
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="none">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-base font-serif font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.slice(0, 8).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {activity.action === 'CREATE' && (
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          </div>
                        )}
                        {activity.action === 'UPDATE' && (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        {activity.action === 'DELETE' && (
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.username}</span>{' '}
                          <span className="text-gray-600">
                            {activity.action.toLowerCase()}d a {activity.resource_type}
                          </span>
                        </p>
                        {activity.details && (
                          <p className="text-sm text-gray-500 mt-1">{activity.details}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card padding="none">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-serif font-medium text-gray-900">Portal Activity</h3>
              <Link to="/admin/patients" className="text-sm text-champagne hover:text-bullion font-medium transition-colors">
                View all
              </Link>
            </div>
            <div className="p-6">
              {portalActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No portal activity yet</p>
              ) : (
                <div className="space-y-4">
                  {portalActivity.map((item) => {
                    const isAdminAction = item.activity_type.startsWith('admin_');
                    const isAccountCreated = item.activity_type === 'account_created';
                    const Icon = isAccountCreated ? UserPlus : isAdminAction ? UserCog : Activity;
                    const iconBg = isAccountCreated
                      ? 'bg-emerald-100 text-emerald-600'
                      : isAdminAction
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-sky-100 text-sky-600';
                    const actor = (item.metadata as Record<string, unknown> | null)?.actor as string | undefined;
                    return (
                      <div key={item.id} className="flex items-start space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconBg}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{item.activity_label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {actor === 'admin' ? 'By admin' : actor === 'system' ? 'By system' : 'By patient'}
                            {' \u00b7 '}
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          <Card padding="none">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-base font-serif font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg ${action.color} transition-colors`}
                  >
                    <action.icon className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium text-center">{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="none">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-serif font-medium text-gray-900">System Health</h3>
              {systemHealth.every((s) => s.color === 'text-emerald-600') && (
                <StatusBadge variant="success">All Systems Go</StatusBadge>
              )}
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemHealth.map((system, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${system.bgColor} p-2 rounded-lg`}>
                        <system.icon className={`h-5 w-5 ${system.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{system.name}</p>
                        <p className={`text-xs ${system.color}`}>{system.status}</p>
                      </div>
                    </div>
                    <CheckCircle className={`h-5 w-5 ${system.color}`} />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="bg-gradient-to-br from-onyx to-graphite rounded-lg shadow-sm border border-gray-200 p-6 text-white">
            <h3 className="text-base font-serif font-semibold mb-2">Need Help?</h3>
            <p className="text-white/60 text-sm mb-4">
              Check out our documentation or contact support for assistance.
            </p>
            <div className="flex flex-col space-y-2">
              <button className="px-4 py-2 bg-champagne text-onyx rounded-md text-sm font-medium hover:bg-bullion transition-colors">
                View Documentation
              </button>
              <button className="px-4 py-2 border border-white/20 text-white rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
                Contact Support
              </button>
            </div>
          </div>

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-medium text-gray-900">System Users</h3>
              <Link to="/admin/users" className="text-sm text-champagne hover:text-bullion font-medium transition-colors">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="text-sm font-semibold text-gray-900">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Today</span>
                <span className="text-sm font-semibold text-gray-900">{stats.activeUsers}</span>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-medium text-gray-900">Patient Portal</h3>
              <Link to="/admin/patients" className="text-sm text-champagne hover:text-bullion font-medium transition-colors">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Patients</span>
                <span className="text-sm font-semibold text-gray-900">{portalStats.totalPatients}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New This Week</span>
                <span className="text-sm font-semibold text-emerald-600">{portalStats.newPatientsThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-sm font-semibold text-gray-900">{portalStats.activePatients}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deactivated</span>
                <span className="text-sm font-semibold text-gray-900">{portalStats.deactivatedPatients}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
