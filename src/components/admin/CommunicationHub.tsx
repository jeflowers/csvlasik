import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  User,
  Calendar
} from 'lucide-react';
import type { ConsultationRequest } from '../../types/Consultation';
import { ringCentralService } from '../../services/ringcentral/ringCentralService';

interface CommunicationHubProps {
  request: ConsultationRequest;
  onClose: () => void;
}

type CommunicationType = 'phone' | 'sms' | 'email';

interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  category: 'confirmation' | 'reminder' | 'followup' | 'general';
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'confirmation' | 'reminder' | 'followup' | 'general';
}

const smsTemplates: SMSTemplate[] = [
  {
    id: '1',
    name: 'Consultation Confirmation',
    content: 'Hi {name}, your consultation for {procedure} has been scheduled for {date} at {time}. Reply CONFIRM to confirm.',
    category: 'confirmation'
  },
  {
    id: '2',
    name: 'Appointment Reminder',
    content: 'Hi {name}, this is a reminder of your {procedure} consultation tomorrow at {time}. See you soon!',
    category: 'reminder'
  },
  {
    id: '3',
    name: 'Follow-up Request',
    content: 'Hi {name}, how did your consultation go? We\'d love to hear your feedback. Reply to this message or call us at {phone}.',
    category: 'followup'
  },
  {
    id: '4',
    name: 'Information Request',
    content: 'Hi {name}, thank you for your interest in {procedure}. What additional information can we provide?',
    category: 'general'
  }
];

const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Consultation Confirmation',
    subject: 'Your {procedure} Consultation is Scheduled',
    body: `Dear {name},\n\nThank you for choosing Atelier Vision Institute for your {procedure} consultation.\n\nYour appointment details:\nDate: {date}\nTime: {time}\nLocation: {location}\n\nPlease arrive 15 minutes early to complete any necessary paperwork.\n\nBest regards,\nAtelier Vision Institute`,
    category: 'confirmation'
  },
  {
    id: '2',
    name: 'Appointment Reminder',
    subject: 'Reminder: {procedure} Consultation Tomorrow',
    body: `Dear {name},\n\nThis is a friendly reminder of your upcoming consultation:\n\nProcedure: {procedure}\nDate: {date}\nTime: {time}\n\nIf you need to reschedule, please contact us at least 24 hours in advance.\n\nLooking forward to seeing you!\n\nBest regards,\nAtelier Vision Institute`,
    category: 'reminder'
  },
  {
    id: '3',
    name: 'Follow-up',
    subject: 'Thank You for Your Consultation',
    body: `Dear {name},\n\nThank you for meeting with us to discuss your {procedure} options.\n\nWe hope we answered all your questions. If you have any additional concerns or would like to proceed with scheduling, please don't hesitate to contact us.\n\nBest regards,\nAtelier Vision Institute`,
    category: 'followup'
  }
];

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  request,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<CommunicationType>('phone');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // SMS State
  const [smsMessage, setSmsMessage] = useState('');
  const [selectedSmsTemplate, setSelectedSmsTemplate] = useState<string | null>(null);

  // Email State
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string | null>(null);

  // Call State
  const [callNotes, setCallNotes] = useState('');

  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/{name}/g, request.patient_name)
      .replace(/{procedure}/g, request.procedure_type)
      .replace(/{date}/g, request.preferred_date || 'TBD')
      .replace(/{time}/g, request.preferred_time || 'TBD')
      .replace(/{location}/g, 'Atelier Vision Institute')
      .replace(/{phone}/g, '(555) 123-4567');
  };

  const handleSmsTemplateSelect = (templateId: string) => {
    const template = smsTemplates.find(t => t.id === templateId);
    if (template) {
      setSmsMessage(replacePlaceholders(template.content));
      setSelectedSmsTemplate(templateId);
    }
  };

  const handleEmailTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(replacePlaceholders(template.subject));
      setEmailBody(replacePlaceholders(template.body));
      setSelectedEmailTemplate(templateId);
    }
  };

  const handleSendSms = async () => {
    if (!request.phone || !smsMessage.trim()) {
      setError('Phone number and message are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await ringCentralService.sendSMS({
        to: request.phone,
        message: smsMessage,
        consultationId: request.id
      });

      setSuccess('SMS sent successfully!');
      setSmsMessage('');
      setSelectedSmsTemplate(null);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!request.email || !emailSubject.trim() || !emailBody.trim()) {
      setError('Email address, subject, and body are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // TODO: Implement email service
      // await emailService.send({
      //   to: request.email,
      //   subject: emailSubject,
      //   body: emailBody,
      //   consultationId: request.id
      // });

      setSuccess('Email sent successfully!');
      setEmailSubject('');
      setEmailBody('');
      setSelectedEmailTemplate(null);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateCall = async () => {
    if (!request.phone) {
      setError('Phone number is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await ringCentralService.initiateCall({
        to: request.phone,
        consultationId: request.id
      });

      setSuccess('Call initiated! Check your RingCentral app.');

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate call');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Communication Hub</h2>
              <div className="flex items-center space-x-4 text-teal-100 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{request.patient_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{request.procedure_type}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-teal-800 rounded-lg p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contact Info Summary */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{request.phone || 'No phone'}</span>
              {request.phone && (
                <button
                  onClick={() => copyToClipboard(request.phone!)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{request.email}</span>
              <button
                onClick={() => copyToClipboard(request.email)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Preferred: {request.preferred_contact_method || 'Any'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('phone')}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'phone'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'sms'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'email'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 340px)' }}>
          {/* Phone Tab */}
          {activeTab === 'phone' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Click-to-Call
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Initiate a call through RingCentral to {request.patient_name}
                </p>
                <button
                  onClick={handleInitiateCall}
                  disabled={loading || !request.phone}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Initiating...' : `Call ${request.phone || 'No phone number'}`}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Notes (Optional)
                </label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Add notes about this call..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* SMS Tab */}
          {activeTab === 'sms' && (
            <div className="space-y-6">
              {/* Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Templates
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {smsTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSmsTemplateSelect(template.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedSmsTemplate === template.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {template.content.substring(0, 60)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Composer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message ({smsMessage.length}/160 characters)
                </label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Type your SMS message..."
                  rows={4}
                  maxLength={160}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSendSms}
                disabled={loading || !smsMessage.trim() || !request.phone}
                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send SMS'}</span>
              </button>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              {/* Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Email Templates
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {emailTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleEmailTemplateSelect(template.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedEmailTemplate === template.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.subject}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Composer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Type your email message..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSendEmail}
                disabled={loading || !emailSubject.trim() || !emailBody.trim()}
                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send Email'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Request submitted {new Date(request.created_at).toLocaleDateString()}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
