import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { AppointmentRequestCard } from '../../components/admin/appointments/AppointmentRequestCard';
import { useAppointmentRequests } from '../../hooks/useAppointmentRequests';
import type { ConsultationStatus } from '../../types/Consultation';

export const AppointmentsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<ConsultationStatus | 'all' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    requests,
    loading,
    hasMore,
    loadMore,
    assignRequest,
    markAsScheduled,
    markAsClosed,
  } = useAppointmentRequests({
    status: filterStatus,
    search: searchQuery,
  });

  const groupedRequests = {
    unassigned: requests.filter((r) => r.status === 'unassigned'),
    assigned: requests.filter((r) => r.status === 'assigned'),
    scheduled: requests.filter((r) => r.status === 'scheduled'),
    closed: requests.filter((r) => r.status === 'closed'),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Appointment Requests</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>New Request</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>

            {(['all', 'unassigned', 'mine', 'assigned', 'scheduled', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}

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
          </div>
        </div>

        {loading && requests.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {filterStatus === 'all' && (
              <>
                {groupedRequests.unassigned.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                      Unassigned
                    </h2>
                    <div className="grid gap-4">
                      {groupedRequests.unassigned.map((request) => (
                        <AppointmentRequestCard
                          key={request.id}
                          request={request}
                          onAssign={assignRequest}
                          onMarkScheduled={markAsScheduled}
                          onClose={markAsClosed}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {groupedRequests.assigned.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                      Assigned to You
                    </h2>
                    <div className="grid gap-4">
                      {groupedRequests.assigned.map((request) => (
                        <AppointmentRequestCard
                          key={request.id}
                          request={request}
                          onAssign={assignRequest}
                          onMarkScheduled={markAsScheduled}
                          onClose={markAsClosed}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {filterStatus !== 'all' && (
              <div className="grid gap-4">
                {requests.map((request) => (
                  <AppointmentRequestCard
                    key={request.id}
                    request={request}
                    onAssign={assignRequest}
                    onMarkScheduled={markAsScheduled}
                    onClose={markAsClosed}
                  />
                ))}
              </div>
            )}

            {requests.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No appointment requests found.</p>
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Load More
                </button>
              </div>
            )}

            {!loading && requests.length > 0 && (
              <div className="text-center text-sm text-gray-500">
                Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
