import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
  Activity,
  Target,
  Award,
  Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ControlDomain {
  id: string;
  domain_number: string;
  domain_name: string;
  description: string;
  display_order: number;
}

interface Control {
  id: string;
  control_number: string;
  control_name: string;
  control_objective: string;
  implementation?: {
    implementation_status: string;
    responsible_person: string;
    last_reviewed_date: string;
  };
}

interface DomainWithControls extends ControlDomain {
  controls: Control[];
  implementationStats: {
    total: number;
    implemented: number;
    verified: number;
    partial: number;
    planned: number;
    not_applicable: number;
  };
}

const ISO27001Dashboard: React.FC = () => {
  const [domains, setDomains] = useState<DomainWithControls[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [overallStats, setOverallStats] = useState({
    totalControls: 0,
    implemented: 0,
    verified: 0,
    inProgress: 0,
    notStarted: 0,
    completionPercentage: 0
  });

  useEffect(() => {
    fetchISO27001Data();
  }, []);

  const fetchISO27001Data = async () => {
    try {
      setLoading(true);

      const { data: domainsData, error: domainsError } = await supabase
        .from('iso27001_control_domains')
        .select('*')
        .order('display_order');

      if (domainsError) throw domainsError;

      const { data: controlsData, error: controlsError } = await supabase
        .from('iso27001_controls')
        .select('*')
        .order('display_order');

      if (controlsError) throw controlsError;

      const { data: implementationsData, error: implementationsError } = await supabase
        .from('control_implementations')
        .select('*');

      if (implementationsError) throw implementationsError;

      const domainsWithControls: DomainWithControls[] = (domainsData || []).map(domain => {
        const domainControls = (controlsData || [])
          .filter(c => c.domain_id === domain.id)
          .map(control => ({
            ...control,
            implementation: (implementationsData || []).find(impl => impl.control_id === control.id)
          }));

        const stats = {
          total: domainControls.length,
          implemented: domainControls.filter(c => c.implementation?.implementation_status === 'implemented').length,
          verified: domainControls.filter(c => c.implementation?.implementation_status === 'verified').length,
          partial: domainControls.filter(c => c.implementation?.implementation_status === 'partial').length,
          planned: domainControls.filter(c => c.implementation?.implementation_status === 'planned').length,
          not_applicable: domainControls.filter(c => c.implementation?.implementation_status === 'not_applicable').length
        };

        return {
          ...domain,
          controls: domainControls,
          implementationStats: stats
        };
      });

      setDomains(domainsWithControls);
      calculateOverallStats(domainsWithControls);
    } catch (error) {
      console.error('Error fetching ISO 27001 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = (domainsList: DomainWithControls[]) => {
    const allControls = domainsList.flatMap(d => d.controls);
    const implemented = allControls.filter(c =>
      c.implementation?.implementation_status === 'implemented' ||
      c.implementation?.implementation_status === 'verified'
    ).length;
    const inProgress = allControls.filter(c =>
      c.implementation?.implementation_status === 'partial' ||
      c.implementation?.implementation_status === 'planned'
    ).length;
    const notStarted = allControls.filter(c =>
      !c.implementation || c.implementation.implementation_status === 'planned'
    ).length;

    setOverallStats({
      totalControls: allControls.length,
      implemented,
      verified: allControls.filter(c => c.implementation?.implementation_status === 'verified').length,
      inProgress,
      notStarted,
      completionPercentage: allControls.length > 0 ? Math.round((implemented / allControls.length) * 100) : 0
    });
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'implemented': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-orange-100 text-orange-800';
      case 'not_applicable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ISO 27001 controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ISO 27001:2013 Controls</h1>
          <p className="text-gray-600">ISMS Annex A control implementation tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-8 w-8 text-blue-600" />
          <div>
            <div className="text-2xl font-bold text-blue-600">{overallStats.completionPercentage}%</div>
            <div className="text-xs text-gray-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Controls</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalControls}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Implemented</p>
              <p className="text-2xl font-bold text-blue-600">{overallStats.implemented}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600">{overallStats.verified}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{overallStats.inProgress}</p>
            </div>
            <Activity className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Not Started</p>
              <p className="text-2xl font-bold text-red-600">{overallStats.notStarted}</p>
            </div>
            <Clock className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Overall Implementation Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{overallStats.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-300 ${getCompletionColor(overallStats.completionPercentage)}`}
            style={{ width: `${overallStats.completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{overallStats.implemented} of {overallStats.totalControls} controls implemented</span>
          <span>{overallStats.totalControls - overallStats.implemented} remaining</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search controls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* Control Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {domains.map((domain) => {
          const completionPercentage = domain.implementationStats.total > 0
            ? Math.round(((domain.implementationStats.implemented + domain.implementationStats.verified) / domain.implementationStats.total) * 100)
            : 0;

          return (
            <div key={domain.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{domain.domain_number}</h3>
                    <p className="text-sm text-gray-600 mb-2">{domain.domain_name}</p>
                    <p className="text-xs text-gray-500">{domain.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
                    <div className="text-xs text-gray-500">
                      {domain.implementationStats.implemented + domain.implementationStats.verified} of {domain.implementationStats.total}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getCompletionColor(completionPercentage)}`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                {/* Status Breakdown */}
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {domain.implementationStats.verified > 0 && (
                    <div className="text-center">
                      <div className="font-bold text-green-600">{domain.implementationStats.verified}</div>
                      <div className="text-gray-500">Verified</div>
                    </div>
                  )}
                  {domain.implementationStats.implemented > 0 && (
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{domain.implementationStats.implemented}</div>
                      <div className="text-gray-500">Implemented</div>
                    </div>
                  )}
                  {domain.implementationStats.partial > 0 && (
                    <div className="text-center">
                      <div className="font-bold text-yellow-600">{domain.implementationStats.partial}</div>
                      <div className="text-gray-500">Partial</div>
                    </div>
                  )}
                  {domain.implementationStats.planned > 0 && (
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{domain.implementationStats.planned}</div>
                      <div className="text-gray-500">Planned</div>
                    </div>
                  )}
                  {domain.implementationStats.not_applicable > 0 && (
                    <div className="text-center">
                      <div className="font-bold text-gray-600">{domain.implementationStats.not_applicable}</div>
                      <div className="text-gray-500">N/A</div>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedDomain(selectedDomain === domain.id ? null : domain.id)}
                  className="mt-4 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {selectedDomain === domain.id ? 'Hide Controls' : 'View Controls'}
                </button>

                {/* Controls List */}
                {selectedDomain === domain.id && (
                  <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                    {domain.controls.map((control) => (
                      <div
                        key={control.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {control.control_number}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {control.control_name}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(control.implementation?.implementation_status)}`}>
                            {control.implementation?.implementation_status || 'not started'}
                          </span>
                        </div>
                        {control.implementation?.last_reviewed_date && (
                          <div className="text-xs text-gray-500 mt-2">
                            Last reviewed: {new Date(control.implementation.last_reviewed_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Certification Readiness */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-blue-600" />
          Certification Readiness
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Implementation Status</div>
            <div className={`text-2xl font-bold ${overallStats.completionPercentage >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
              {overallStats.completionPercentage >= 95 ? 'Ready' : overallStats.completionPercentage >= 75 ? 'Nearly Ready' : 'In Progress'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Controls Verified</div>
            <div className="text-2xl font-bold text-blue-600">
              {overallStats.verified} / {overallStats.totalControls}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Remaining Work</div>
            <div className="text-2xl font-bold text-gray-900">
              {overallStats.totalControls - overallStats.implemented} controls
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISO27001Dashboard;
