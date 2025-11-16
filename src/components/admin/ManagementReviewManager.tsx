import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck, Calendar, AlertTriangle, CheckCircle, Clock,
  TrendingUp, TrendingDown, Minus, Plus, FileText, Users, Target
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ManagementReview {
  id: string;
  review_date: string;
  review_period_start: string;
  review_period_end: string;
  review_type: 'quarterly' | 'annual' | 'ad_hoc';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  summary: string | null;
  overall_assessment: 'satisfactory' | 'needs_improvement' | 'critical' | null;
}

interface ReviewFinding {
  id: string;
  review_id: string;
  finding_type: 'issue' | 'observation' | 'opportunity' | 'strength';
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendations: string | null;
}

interface ReviewActionItem {
  id: string;
  review_id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  assigned_to: string | null;
  due_date: string;
  completed_date: string | null;
}

interface ReviewKPI {
  id: string;
  kpi_name: string;
  kpi_category: string;
  description: string;
  target_value: number;
  target_operator: string;
  measurement_unit: string;
  frequency: string;
}

interface KPIValue {
  id: string;
  kpi_id: string;
  measurement_date: string;
  actual_value: number;
  meets_target: boolean;
  variance: number | null;
  notes: string | null;
}

const ManagementReviewManager: React.FC = () => {
  const { t } = useTranslation(['common']);
  const [reviews, setReviews] = useState<ManagementReview[]>([]);
  const [findings, setFindings] = useState<ReviewFinding[]>([]);
  const [actionItems, setActionItems] = useState<ReviewActionItem[]>([]);
  const [kpis, setKPIs] = useState<ReviewKPI[]>([]);
  const [kpiValues, setKPIValues] = useState<KPIValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'findings' | 'actions' | 'kpis'>('reviews');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [reviewsRes, findingsRes, actionsRes, kpisRes, kpiValuesRes, summaryRes] = await Promise.all([
        supabase.from('management_reviews').select('*').order('review_date', { ascending: false }),
        supabase.from('review_findings').select('*').order('created_at', { ascending: false }),
        supabase.from('review_action_items').select('*').order('due_date', { ascending: true }),
        supabase.from('review_kpis').select('*').eq('active', true).order('kpi_category'),
        supabase.from('review_kpi_values').select('*').order('measurement_date', { ascending: false }).limit(100),
        supabase.rpc('get_review_dashboard_summary')
      ]);

      if (reviewsRes.error) throw reviewsRes.error;
      if (findingsRes.error) throw findingsRes.error;
      if (actionsRes.error) throw actionsRes.error;
      if (kpisRes.error) throw kpisRes.error;
      if (kpiValuesRes.error) throw kpiValuesRes.error;

      setReviews(reviewsRes.data || []);
      setFindings(findingsRes.data || []);
      setActionItems(actionsRes.data || []);
      setKPIs(kpisRes.data || []);
      setKPIValues(kpiValuesRes.data || []);
      setDashboardSummary(summaryRes.data?.[0] || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load review data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      not_started: 'bg-gray-100 text-gray-800',
      blocked: 'bg-red-100 text-red-800',
      satisfactory: 'bg-green-100 text-green-800',
      needs_improvement: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[severity as keyof typeof styles]}`}>
        {severity}
      </span>
    );
  };

  const getDashboardCards = () => [
    {
      title: 'Total Reviews',
      value: dashboardSummary?.total_reviews || 0,
      icon: ClipboardCheck,
      color: 'bg-blue-500'
    },
    {
      title: 'Reviews This Quarter',
      value: dashboardSummary?.reviews_this_quarter || 0,
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Open Actions',
      value: dashboardSummary?.open_actions || 0,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Overdue Actions',
      value: dashboardSummary?.overdue_actions || 0,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Critical Findings',
      value: dashboardSummary?.critical_findings || 0,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'KPIs Below Target',
      value: dashboardSummary?.kpis_below_target || 0,
      icon: Target,
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading management reviews...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="h-8 w-8" />
              Management Review System
            </h1>
            <p className="text-gray-600 mt-2">
              ISO 27001 Quarterly Management Reviews and KPI Tracking
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {getDashboardCards().map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className={`${card.color} rounded-md p-2`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">{card.title}</p>
                  <p className="text-xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Calendar className="h-4 w-4 inline-block mr-2" />
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('findings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'findings'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline-block mr-2" />
            Findings ({findings.length})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'actions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <CheckCircle className="h-4 w-4 inline-block mr-2" />
            Action Items ({actionItems.length})
          </button>
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'kpis'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Target className="h-4 w-4 inline-block mr-2" />
            KPIs ({kpis.length})
          </button>
        </div>
      </div>

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Management Reviews</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Review
            </button>
          </div>
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold capitalize">{review.review_type} Review</h3>
                    {getStatusBadge(review.status)}
                    {review.overall_assessment && getStatusBadge(review.overall_assessment)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Review Date:</span> {formatDate(review.review_date)}
                    </div>
                    <div>
                      <span className="font-medium">Period:</span> {formatDate(review.review_period_start)} - {formatDate(review.review_period_end)}
                    </div>
                    <div>
                      <span className="font-medium">Findings:</span> {findings.filter(f => f.review_id === review.id).length}
                    </div>
                  </div>
                  {review.summary && (
                    <p className="mt-3 text-gray-700">{review.summary}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'findings' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Review Findings</h2>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {findings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm capitalize">{finding.finding_type}</td>
                    <td className="px-4 py-3 text-sm">{getSeverityBadge(finding.severity)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{finding.title}</td>
                    <td className="px-4 py-3 text-sm capitalize">{finding.category.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{finding.description.substring(0, 100)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Action Items</h2>
          <div className="space-y-3">
            {actionItems.filter(a => a.status !== 'completed' && a.status !== 'cancelled').map((action) => (
              <div key={action.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{action.title}</h3>
                      {getSeverityBadge(action.priority)}
                      {getStatusBadge(action.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Due: {formatDate(action.due_date)}</span>
                      {new Date(action.due_date) < new Date() && action.status !== 'completed' && (
                        <span className="text-red-600 font-medium">OVERDUE</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'kpis' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kpis.map((kpi) => {
              const latestValue = kpiValues.find(v => v.kpi_id === kpi.id);
              const meets = latestValue?.meets_target;

              return (
                <div key={kpi.id} className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{kpi.kpi_name.replace('_', ' ').toUpperCase()}</h3>
                      <p className="text-xs text-gray-600 mt-1">{kpi.description}</p>
                    </div>
                    {meets !== undefined && (
                      meets ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {latestValue ? latestValue.actual_value : '-'}
                    </span>
                    <span className="text-sm text-gray-600">{kpi.measurement_unit}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Target:</span> {kpi.target_operator} {kpi.target_value} {kpi.measurement_unit}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 capitalize">
                    {kpi.frequency} | {kpi.kpi_category}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementReviewManager;
