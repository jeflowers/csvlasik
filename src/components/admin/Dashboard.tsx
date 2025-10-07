import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  FileText, 
  Image, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewData, statsData] = await Promise.all([
          apiService.getDashboardOverview(),
          apiService.getDashboardStats()
        ]);
        
        setOverview(overviewData.overview);
        setRecentActivity(overviewData.recentActivity);
        setStats(statsData);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Testimonials',
      value: overview.total_testimonials || 0,
      icon: MessageSquare,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Pending Reviews',
      value: overview.pending_testimonials || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: null
    },
    {
      name: 'Published Articles',
      value: overview.published_articles || 0,
      icon: FileText,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      name: 'Media Files',
      value: overview.total_media || 0,
      icon: Image,
      color: 'bg-purple-500',
      change: '+15%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to ClearSight CMS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <span className="ml-2 text-sm text-green-600">{stat.change}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.action === 'CREATE' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {activity.action === 'UPDATE' && (
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                    )}
                    {activity.action === 'DELETE' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.username}</span> {activity.action.toLowerCase()}d a {activity.resource_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Statistics */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Content Statistics</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.procedureStats && stats.procedureStats.map((proc: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{proc.procedure_type} Testimonials</p>
                    <p className="text-xs text-gray-500">Avg Rating: {proc.avg_rating?.toFixed(1)}/5</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{proc.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Testimonial
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FileText className="h-4 w-4 mr-2" />
              Write Article
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Image className="h-4 w-4 mr-2" />
              Upload Media
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;