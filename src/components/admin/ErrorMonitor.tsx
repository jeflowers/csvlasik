import React, { useState, useEffect } from 'react';
import { AlertCircle, Search, Filter, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  error_stack: string | null;
  page_path: string;
  user_agent: string | null;
  visitor_id: string | null;
  created_at: string;
}

export const ErrorMonitor: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorTypeFilter, setErrorTypeFilter] = useState('all');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  useEffect(() => {
    loadErrors();
    const interval = setInterval(loadErrors, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadErrors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('analytics_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrors(data || []);
    } catch (error) {
      console.error('Failed to load errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearError = async (id: string) => {
    try {
      const { error } = await supabase
        .from('analytics_errors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadErrors();
      setSelectedError(null);
    } catch (error) {
      console.error('Failed to delete error:', error);
    }
  };

  const clearAllErrors = async () => {
    if (!confirm('Are you sure you want to clear all error logs?')) return;

    try {
      const { error } = await supabase
        .from('analytics_errors')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      loadErrors();
    } catch (error) {
      console.error('Failed to clear errors:', error);
    }
  };

  const filteredErrors = errors.filter(err => {
    const matchesSearch = err.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         err.page_path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = errorTypeFilter === 'all' || err.error_type === errorTypeFilter;
    return matchesSearch && matchesType;
  });

  const errorTypes = Array.from(new Set(errors.map(e => e.error_type)));
  const errorsByType = errorTypes.reduce((acc, type) => {
    acc[type] = errors.filter(e => e.error_type === type).length;
    return acc;
  }, {} as Record<string, number>);

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
        <h1 className="text-2xl font-bold text-gray-900">Error Monitor</h1>
        <div className="flex space-x-3">
          <button
            onClick={loadErrors}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
          {errors.length > 0 && (
            <button
              onClick={clearAllErrors}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{errors.length}</p>
              <p className="text-sm text-gray-600">Total Errors</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {Object.entries(errorsByType).slice(0, 3).map(([type, count]) => (
          <div key={type} className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-gray-900">{count}</p>
            <p className="text-sm text-gray-600">{type}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={errorTypeFilter}
                onChange={(e) => setErrorTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Types</option>
                {errorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredErrors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || errorTypeFilter !== 'all' ? 'No errors match your filters' : 'No errors logged yet'}
                  </td>
                </tr>
              ) : (
                filteredErrors.map((error) => (
                  <tr key={error.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {error.error_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {error.error_message}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{error.page_path}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(error.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedError(error)}
                        className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => clearError(error.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Clear
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Error Details</h2>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p className="text-sm text-gray-900">{selectedError.error_type}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Message</p>
                  <p className="text-sm text-gray-900">{selectedError.error_message}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Page Path</p>
                  <p className="text-sm text-gray-900">{selectedError.page_path}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Time</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedError.created_at).toLocaleString()}
                  </p>
                </div>

                {selectedError.user_agent && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">User Agent</p>
                    <p className="text-sm text-gray-900 break-all">{selectedError.user_agent}</p>
                  </div>
                )}

                {selectedError.error_stack && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Stack Trace</p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                      {selectedError.error_stack}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedError(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => clearError(selectedError.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear This Error
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorMonitor;
