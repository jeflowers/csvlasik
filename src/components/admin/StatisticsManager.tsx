import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Award, 
  MapPin,
  Edit,
  Save,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Statistic {
  id: number;
  metric_name: string;
  metric_value: string;
  metric_type: 'number' | 'percentage' | 'text';
  display_format: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const StatisticsManager: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStats, setEditingStats] = useState<{ [key: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStatistics();
      const stats = Array.isArray(data) ? data : [];
      setStatistics(stats);

      // Initialize edit values
      const initialValues: { [key: string]: string } = {};
      stats.forEach((stat: Statistic) => {
        initialValues[stat.metric_name] = stat.metric_value;
      });
      setEditValues(initialValues);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setStatistics([]);
      setEditValues({});
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (metricName: string) => {
    setEditingStats(prev => ({ ...prev, [metricName]: true }));
  };

  const handleSave = async (metricName: string) => {
    try {
      const statistic = statistics.find(s => s.metric_name === metricName);
      if (!statistic) return;

      await apiService.updateStatistic(metricName, {
        metric_value: editValues[metricName],
        metric_type: statistic.metric_type,
        display_format: statistic.display_format
      });

      setEditingStats(prev => ({ ...prev, [metricName]: false }));
      fetchStatistics();
    } catch (error) {
      console.error('Failed to update statistic:', error);
    }
  };

  const handleCancel = (metricName: string) => {
    const original = statistics.find(s => s.metric_name === metricName);
    if (original) {
      setEditValues(prev => ({ ...prev, [metricName]: original.metric_value }));
    }
    setEditingStats(prev => ({ ...prev, [metricName]: false }));
  };

  const handleDelete = async (metricName: string) => {
    if (confirm('Are you sure you want to delete this statistic?')) {
      try {
        await apiService.deleteStatistic(metricName);
        fetchStatistics();
      } catch (error) {
        console.error('Failed to delete statistic:', error);
      }
    }
  };

  const formatDisplayValue = (value: string, format: string) => {
    if (!format || !value) return value || '';
    return format.replace('{value}', value);
  };

  const getStatIcon = (metricName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      total_procedures: <Users className="h-8 w-8 text-blue-500" />,
      pacific_procedures: <MapPin className="h-8 w-8 text-green-500" />,
      success_rate: <Award className="h-8 w-8 text-yellow-500" />,
      patient_satisfaction: <TrendingUp className="h-8 w-8 text-purple-500" />,
      years_experience: <BarChart3 className="h-8 w-8 text-red-500" />,
      islands_served: <MapPin className="h-8 w-8 text-teal-500" />
    };
    
    return iconMap[metricName] || <BarChart3 className="h-8 w-8 text-gray-500" />;
  };

  const getStatTitle = (metricName: string) => {
    if (!metricName) return 'Unknown Metric';

    const titleMap: { [key: string]: string } = {
      total_procedures: 'Total Procedures',
      pacific_procedures: 'Pacific Procedures',
      success_rate: 'Success Rate',
      patient_satisfaction: 'Patient Satisfaction',
      years_experience: 'Years Experience',
      islands_served: 'Islands Served'
    };

    return titleMap[metricName] || metricName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics Management</h1>
          <p className="text-gray-600">Manage homepage statistics and key metrics</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchStatistics}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Add Statistic
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : (
          statistics.map((stat) => (
            <div key={stat.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getStatIcon(stat.metric_name)}
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getStatTitle(stat.metric_name)}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{stat.metric_type}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {editingStats[stat.metric_name] ? (
                    <>
                      <button
                        onClick={() => handleSave(stat.metric_name)}
                        className="text-green-600 hover:text-green-900"
                        title="Save"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(stat.metric_name)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(stat.metric_name)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stat.metric_name)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4">
                {editingStats[stat.metric_name] ? (
                  <input
                    type="text"
                    value={editValues[stat.metric_name] || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, [stat.metric_name]: e.target.value }))}
                    className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-teal-500 focus:outline-none w-full"
                    autoFocus
                  />
                ) : (
                  <div className="text-3xl font-bold text-gray-900">
                    {formatDisplayValue(stat.metric_value, stat.display_format)}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <p>Last updated: {new Date(stat.updated_at).toLocaleDateString()}</p>
                <p className="mt-1">Format: {stat.display_format}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Statistic Modal */}
      {showCreateModal && (
        <CreateStatisticModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false);
            fetchStatistics();
          }}
        />
      )}
    </div>
  );
};

// Create Statistic Modal Component
const CreateStatisticModal: React.FC<{
  onClose: () => void;
  onSave: () => void;
}> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    metric_name: '',
    metric_value: '',
    metric_type: 'number',
    display_format: '{value}'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiService.createStatistic(formData);
      onSave();
    } catch (error) {
      console.error('Failed to create statistic:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Create New Statistic</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metric Name *
            </label>
            <input
              type="text"
              required
              value={formData.metric_name}
              onChange={(e) => setFormData(prev => ({ ...prev, metric_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., total_procedures"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value *
            </label>
            <input
              type="text"
              required
              value={formData.metric_value}
              onChange={(e) => setFormData(prev => ({ ...prev, metric_value: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., 30000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              required
              value={formData.metric_type}
              onChange={(e) => setFormData(prev => ({ ...prev, metric_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="number">Number</option>
              <option value="percentage">Percentage</option>
              <option value="text">Text</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Format
            </label>
            <input
              type="text"
              value={formData.display_format}
              onChange={(e) => setFormData(prev => ({ ...prev, display_format: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., {value}+, {value}%, {value}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{value}'} as placeholder for the actual value
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Statistic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatisticsManager;