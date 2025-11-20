import React, { useState, useEffect } from 'react';
import { Mail, Send, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmailQueueItem {
  id: string;
  to_email: string;
  from_email: string;
  subject: string;
  status: string;
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
}

export const EmailQueueMonitor: React.FC = () => {
  const [emails, setEmails] = useState<EmailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadEmails();
    const interval = setInterval(loadEmails, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const retryEmail = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_queue')
        .update({ status: 'pending', attempts: 0, error_message: null })
        .eq('id', id);

      if (error) throw error;
      loadEmails();
    } catch (error) {
      console.error('Failed to retry email:', error);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    pending: Clock,
    processing: Send,
    sent: CheckCircle,
    failed: AlertCircle,
  };

  const counts = {
    all: emails.length,
    pending: emails.filter(e => e.status === 'pending').length,
    sent: emails.filter(e => e.status === 'sent').length,
    failed: emails.filter(e => e.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Email Queue Monitor</h1>
        <button
          onClick={loadEmails}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            statusFilter === 'all' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
          <p className="text-sm text-gray-600">Total</p>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            statusFilter === 'pending' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200'
          }`}
        >
          <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </button>

        <button
          onClick={() => setStatusFilter('sent')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            statusFilter === 'sent' ? 'border-green-600 bg-green-50' : 'border-gray-200'
          }`}
        >
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{counts.sent}</p>
          <p className="text-sm text-gray-600">Sent</p>
        </button>

        <button
          onClick={() => setStatusFilter('failed')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            statusFilter === 'failed' ? 'border-red-600 bg-red-50' : 'border-gray-200'
          }`}
        >
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{counts.failed}</p>
          <p className="text-sm text-gray-600">Failed</p>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {emails.map((email) => {
                const StatusIcon = statusIcons[email.status as keyof typeof statusIcons];
                return (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[email.status as keyof typeof statusColors]
                      }`}>
                        {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                        {email.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{email.to_email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{email.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {email.attempts} / {email.max_attempts}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(email.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {email.status === 'failed' && (
                        <button
                          onClick={() => retryEmail(email.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
