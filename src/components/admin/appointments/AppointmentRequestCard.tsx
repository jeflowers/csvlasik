import React, { useState } from 'react';
import { Phone, Mail, Clock, User, CheckCircle, FileText, ExternalLink } from 'lucide-react';
import type { ConsultationRequestWithUser } from '../../../types/Consultation';
import { useConsultationSettings } from '../../../hooks/useConsultationSettings';
import { ringCentralService } from '../../../services/ringcentral/ringCentralService';
import { auditService } from '../../../services/consultation/auditService';

interface AppointmentRequestCardProps {
  request: ConsultationRequestWithUser;
  onAssign: (requestId: string, userId: string) => void;
  onMarkScheduled: (requestId: string, via: 'built-in' | 'ringcentral', eventId?: string) => void;
  onClose: (requestId: string) => void;
}

export const AppointmentRequestCard: React.FC<AppointmentRequestCardProps> = ({
  request,
  onAssign,
  onMarkScheduled,
  onClose,
}) => {
  const { settings } = useConsultationSettings();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;

    await auditService.logAction(request.id, 'note_added', {
      note: note.trim(),
    });

    setNote('');
    setShowNoteModal(false);
  };

  const handleRingCentralBooking = () => {
    const deepLink = ringCentralService.getBookingDeepLink({} as any, {
      first_name: request.first_name,
      last_name: request.last_name,
      email: request.email,
      phone: request.phone,
      procedure: request.procedure,
    });

    window.open(deepLink, '_blank');
  };

  const isUnassigned = request.status === 'unassigned';
  const isAssignedToMe = request.assigned_to_user_id !== null;

  const renderActions = () => {
    if (settings?.scheduling_method === 'built-in') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onMarkScheduled(request.id, 'built-in')}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center space-x-1"
          >
            <Phone className="w-4 h-4" />
            <span>Contact</span>
          </button>
          <button
            onClick={() => onMarkScheduled(request.id, 'built-in')}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center space-x-1"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Scheduled</span>
          </button>
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>Add Note</span>
          </button>
          {isUnassigned && (
            <button
              onClick={() => {}}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center space-x-1"
            >
              <User className="w-4 h-4" />
              <span>Assign</span>
            </button>
          )}
        </div>
      );
    }

    if (settings?.scheduling_method === 'ringcentral') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRingCentralBooking}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center space-x-1"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open RC Booking</span>
          </button>
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      );
    }

    if (settings?.scheduling_method === 'hybrid') {
      return (
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'builtin') {
                  onMarkScheduled(request.id, 'built-in');
                } else if (value === 'ringcentral') {
                  handleRingCentralBooking();
                }
                e.target.value = '';
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 appearance-none pr-8"
            >
              <option value="">Schedule ▼</option>
              <option value="builtin">📅 Built-in Scheduler</option>
              <option value="ringcentral">📞 RingCentral Booking</option>
            </select>
          </div>
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      );
    }

    return null;
  };

  const statusColor = {
    unassigned: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {request.first_name} {request.last_name}
            </h3>
            <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{getRelativeTime(request.created_at)}</span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[request.status]}`}>
            {request.status.toUpperCase()}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <Mail className="w-4 h-4" />
            <span>{request.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <Phone className="w-4 h-4" />
            <span>{request.phone}</span>
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-medium">Procedure:</span> {request.procedure} |{' '}
            <span className="font-medium">Prefers:</span> {request.preferred_contact}
          </div>
          {request.comments && (
            <p className="text-sm text-gray-600 italic mt-2">"{request.comments}"</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          {renderActions()}
          <p className="text-xs text-gray-500 mt-3">
            ℹ️ All actions logged for compliance
          </p>
        </div>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Note</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your note here..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 resize-none"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
