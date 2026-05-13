import React, { useState, useEffect } from 'react';
import { Calendar, Mail, Phone, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { AppointmentRequest } from '../../types/appointments';
import { appointmentRequestService } from '../../services/appointmentRequestService';

const AppointmentRequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const { data } = await appointmentRequestService.getAllRequests();
    setRequests(data);
    setLoading(false);
  };

  const handleConfirm = async (id: string, time: string) => {
    await appointmentRequestService.confirmAppointment(id, time);
    setSelectedRequest(null);
    loadRequests();
  };

  const handleDecline = async (id: string) => {
    await appointmentRequestService.declineAppointment(id, 'Schedule unavailable');
    setSelectedRequest(null);
    loadRequests();
  };

  const handleSetReviewing = async (id: string) => {
    await appointmentRequestService.setReviewing(id);
    loadRequests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Requests</h1>
          <p className="text-gray-600 mt-1">Manage patient consultation requests</p>
        </div>
        <button
          onClick={loadRequests}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointment requests found</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.first_name} {request.last_name}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {request.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {request.phone}
                      </div>
                    </div>

                    {(request.preferred_time_1 || request.preferred_time_2 || request.preferred_time_3) ? (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-2">Preferred Times:</p>
                        <div className="space-y-1 text-sm text-gray-700">
                          {request.preferred_time_1 && <div>1. {new Date(request.preferred_time_1).toLocaleString()}</div>}
                          {request.preferred_time_2 && <div>2. {new Date(request.preferred_time_2).toLocaleString()}</div>}
                          {request.preferred_time_3 && <div>3. {new Date(request.preferred_time_3).toLocaleString()}</div>}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">No preferred times specified. Patient submitted via portal — contact to schedule.</p>
                        {request.notes && <p className="text-sm text-gray-700 mt-2">{request.notes}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleSetReviewing(request.id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Start Review
                      </button>
                    )}
                    {request.status === 'reviewing' && (
                      <>
                        <button
                          onClick={() => handleConfirm(request.id, request.preferred_time_1 || new Date().toISOString())}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleDecline(request.id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentRequestsManager;
