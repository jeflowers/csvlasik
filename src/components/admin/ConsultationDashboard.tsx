import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Filter,
  Search,
  Download,
  RefreshCw,
  CheckSquare,
  Phone,
  Mail,
  MessageSquare,
  MoreVertical,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { AppointmentRequestCard } from './appointments/AppointmentRequestCard';
import { useAppointmentRequests } from '../../hooks/useAppointmentRequests';
import type { ConsultationRequest, ConsultationStatus } from '../../types/Consultation';
import { NextechBookingWizard } from './NextechBookingWizard';
import { CommunicationHub } from './CommunicationHub';

type TabType = 'unassigned' | 'assigned' | 'scheduled' | 'completed';

interface BulkActionsState {
  enabled: boolean;
  selectedIds: Set<string>;
}

interface ConsultationDashboardProps {
  enableNextech?: boolean;
  enableCommunications?: boolean;
}

export const ConsultationDashboard: React.FC<ConsultationDashboardProps> = ({
  enableNextech = false,
  enableCommunications = false
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('unassigned');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('all');
  const [bulkActions, setBulkActions] = useState<BulkActionsState>({
    enabled: false,
    selectedIds: new Set()
  });
  const [showBookingWizard, setShowBookingWizard] = useState<ConsultationRequest | null>(null);
  const [showCommunicationHub, setShowCommunicationHub] = useState<ConsultationRequest | null>(null);

  const statusMap: Record<TabType, ConsultationStatus | 'all'> = {
    unassigned: 'unassigned',
    assigned: 'assigned',
    scheduled: 'scheduled',
    completed: 'closed'
  };

  const {
    requests,
    loading,
    hasMore,
    loadMore,
    assignRequest,
    markAsScheduled,
    markAsClosed,
    refresh
  } = useAppointmentRequests({
    status: statusMap[activeTab],
    search: searchQuery,
  });

  const stats = {
    unassigned: requests.filter(r => r.status === 'unassigned').length,
    assigned: requests.filter(r => r.status === 'assigned').length,
    scheduled: requests.filter(r => r.status === 'scheduled').length,
    completed: requests.filter(r => r.status === 'closed').length
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = request.status === statusMap[activeTab] || statusMap[activeTab] === 'all';
    const matchesLanguage = selectedLanguage === 'all' || request.preferred_language === selectedLanguage;
    const matchesProcedure = selectedProcedure === 'all' || request.procedure_type === selectedProcedure;
    return matchesStatus && matchesLanguage && matchesProcedure;
  });

  const handleBulkSelect = (requestId: string) => {
    const newSelected = new Set(bulkActions.selectedIds);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setBulkActions({ ...bulkActions, selectedIds: newSelected });
  };

  const handleSelectAll = () => {
    if (bulkActions.selectedIds.size === filteredRequests.length) {
      setBulkActions({ ...bulkActions, selectedIds: new Set() });
    } else {
      const allIds = new Set(filteredRequests.map(r => r.id));
      setBulkActions({ ...bulkActions, selectedIds: allIds });
    }
  };

  const handleBulkAssign = async (staffId: string) => {
    for (const requestId of bulkActions.selectedIds) {
      await assignRequest(requestId, staffId);
    }
    setBulkActions({ enabled: false, selectedIds: new Set() });
    refresh();
  };

  const handleBulkMarkScheduled = async () => {
    for (const requestId of bulkActions.selectedIds) {
      await markAsScheduled(requestId);
    }
    setBulkActions({ enabled: false, selectedIds: new Set() });
    refresh();
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Procedure', 'Language', 'Status', 'Created'],
      ...filteredRequests.map(r => [
        r.patient_name,
        r.email,
        r.phone || '',
        r.procedure_type,
        r.preferred_language || '',
        r.status,
        new Date(r.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultations-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'unassigned': return AlertCircle;
      case 'assigned': return UserPlus;
      case 'scheduled': return CheckCircle;
      case 'completed': return CheckSquare;
    }
  };

  const getTabColor = (tab: TabType) => {
    switch (tab) {
      case 'unassigned': return 'text-orange-600 bg-orange-100';
      case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage appointment requests and schedules
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {(['unassigned', 'assigned', 'scheduled', 'completed'] as TabType[]).map((tab) => {
            const Icon = getTabIcon(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  activeTab === tab
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 capitalize">{tab}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats[tab]}</p>
                  </div>
                  <div className={`p-3 rounded-full ${getTabColor(tab)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters and Bulk Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Language Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="zh">Chinese</option>
                <option value="ko">Korean</option>
                <option value="ja">Japanese</option>
              </select>
            </div>

            {/* Procedure Filter */}
            <select
              value={selectedProcedure}
              onChange={(e) => setSelectedProcedure(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Procedures</option>
              <option value="lasik">LASIK</option>
              <option value="prk">PRK</option>
              <option value="icl">ICL</option>
              <option value="cataract">Cataract</option>
            </select>

            {/* Bulk Actions Toggle */}
            <button
              onClick={() => setBulkActions({ enabled: !bulkActions.enabled, selectedIds: new Set() })}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center space-x-2 ${
                bulkActions.enabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Bulk Actions</span>
            </button>
          </div>

          {/* Bulk Actions Toolbar */}
          {bulkActions.enabled && bulkActions.selectedIds.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {bulkActions.selectedIds.size} item{bulkActions.selectedIds.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50"
                  >
                    {bulkActions.selectedIds.size === filteredRequests.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={() => handleBulkMarkScheduled()}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    Mark Scheduled
                  </button>
                  <button
                    onClick={() => setBulkActions({ ...bulkActions, selectedIds: new Set() })}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Requests List */}
        {loading && requests.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'unassigned' && 'No unassigned consultation requests at the moment.'}
                    {activeTab === 'assigned' && 'No requests assigned to you.'}
                    {activeTab === 'scheduled' && 'No scheduled consultations.'}
                    {activeTab === 'completed' && 'No completed consultations.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {filteredRequests.map((request) => (
                  <div key={request.id} className="relative">
                    {bulkActions.enabled && (
                      <div className="absolute left-4 top-4 z-10">
                        <input
                          type="checkbox"
                          checked={bulkActions.selectedIds.has(request.id)}
                          onChange={() => handleBulkSelect(request.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div className={bulkActions.enabled ? 'ml-12' : ''}>
                      <AppointmentRequestCard
                        request={request}
                        onAssign={assignRequest}
                        onMarkScheduled={markAsScheduled}
                        onClose={markAsClosed}
                        enableNextech={enableNextech}
                        enableCommunications={enableCommunications}
                        onScheduleNextech={() => setShowBookingWizard(request)}
                        onCommunicate={() => setShowCommunicationHub(request)}
                      />
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Nextech Booking Wizard Modal */}
      {showBookingWizard && enableNextech && (
        <NextechBookingWizard
          request={showBookingWizard}
          onClose={() => setShowBookingWizard(null)}
          onComplete={() => {
            setShowBookingWizard(null);
            refresh();
          }}
        />
      )}

      {/* Communication Hub Modal */}
      {showCommunicationHub && enableCommunications && (
        <CommunicationHub
          request={showCommunicationHub}
          onClose={() => setShowCommunicationHub(null)}
        />
      )}
    </div>
  );
};
