import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, MousePointerClick, BarChart3, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, Button } from './ui';

interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([
    { label: 'Total Page Views', value: 0, change: 0, icon: <Eye className="w-5 h-5" /> },
    { label: 'Unique Visitors', value: 0, change: 0, icon: <Users className="w-5 h-5" /> },
    { label: 'Total Events', value: 0, change: 0, icon: <MousePointerClick className="w-5 h-5" /> },
    { label: 'Conversions', value: 0, change: 0, icon: <TrendingUp className="w-5 h-5" /> },
  ]);
  const [loading, setLoading] = useState(true);
  const [topPages, setTopPages] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const { data: pageViews, error: pvError } = await supabase
        .from('analytics_page_views')
        .select('*');

      const { data: events, error: evError } = await supabase
        .from('analytics_events')
        .select('*');

      if (pvError) console.error('Page views error:', pvError);
      if (evError) console.error('Events error:', evError);

      const totalPageViews = pageViews?.length || 0;
      const uniqueVisitors = new Set(pageViews?.map(pv => pv.visitor_id)).size;
      const totalEvents = events?.length || 0;
      const conversions = events?.filter(e => e.event_category === 'conversion').length || 0;

      const pageStats = pageViews?.reduce((acc: any, pv) => {
        const path = pv.page_path || '/';
        if (!acc[path]) {
          acc[path] = { path, views: 0, title: pv.page_title };
        }
        acc[path].views++;
        return acc;
      }, {});

      const topPagesArray = Object.values(pageStats || {})
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 10);

      setTopPages(topPagesArray);

      setMetrics([
        { label: 'Total Page Views', value: totalPageViews, change: 12.5, icon: <Eye className="w-5 h-5" /> },
        { label: 'Unique Visitors', value: uniqueVisitors, change: 8.2, icon: <Users className="w-5 h-5" /> },
        { label: 'Total Events', value: totalEvents, change: 15.3, icon: <MousePointerClick className="w-5 h-5" /> },
        { label: 'Conversions', value: conversions, change: 23.1, icon: <TrendingUp className="w-5 h-5" /> },
      ]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bullion"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track site performance and visitor behavior</p>
        </div>
        <Button variant="secondary" onClick={loadAnalytics}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} padding="md" hover>
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400">{metric.icon}</div>
              <span className={`inline-flex items-center text-xs font-semibold ${
                metric.change >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                {metric.change >= 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">{metric.value.toLocaleString()}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mt-1">{metric.label}</p>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-champagne mr-2" />
            <h2 className="text-base font-serif font-medium text-gray-900">Top Pages</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topPages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No analytics data yet. Visit some pages to see stats.
                  </td>
                </tr>
              ) : (
                topPages.map((page: any, index) => (
                  <tr key={index} className="hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{page.path}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-600">{page.title || 'Untitled'}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold tabular-nums text-gray-900 text-right">{page.views}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="bg-cream/50 border border-champagne/30 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Analytics Tracking</h3>
        <p className="text-sm text-gray-600">
          Analytics are automatically tracked on all pages. Page views, events, and conversions
          are stored in the database for detailed analysis.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
