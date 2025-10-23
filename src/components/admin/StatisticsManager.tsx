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
  name: string;
  value: string;
  display_order: number;
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
        initialValues[stat.name] = stat.value;
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

  const handleSave = async (name: string) => {
    try {
      const statistic = statistics.find(s => s.name === name);
      if (!statistic) return;

      await apiService.updateStatistic(name, {
        value: editValues[name]
      });

      setEditingStats(prev => ({ ...prev, [name]: false }));
      fetchStatistics();
    } catch (error) {
      console.error('Failed to update statistic:', error);
    }
  };

  const handleCancel = (name: string) => {
    const original = statistics.find(s => s.name === name);
    if (original) {
      setEditValues(prev => ({ ...prev, [name]: original.value }));
    }
    setEditingStats(prev => ({ ...prev, [name]: false }));
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

  const formatDisplayValue = (value: string, name: string) => {
    if (!value) return '';

    // Auto-format based on metric name
    if (name.includes('rate') || name.includes('satisfaction')) {
      return `${value}%`;
    }
    if (name.includes('rating')) {
      return `${value}/5`;
    }
    return value;
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
                  {getStatIcon(stat.name)}
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getStatTitle(stat.name)}
                    </h3>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {editingStats[stat.name] ? (
                    <>
                      <button
                        onClick={() => handleSave(stat.name)}
                        className="text-green-600 hover:text-green-900"
                        title="Save"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(stat.name)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(stat.name)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stat.name)}
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
                {editingStats[stat.name] ? (
                  <input
                    type="text"
                    value={editValues[stat.name] || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, [stat.name]: e.target.value }))}
                    className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-teal-500 focus:outline-none w-full"
                    autoFocus
                  />
                ) : (
                  <div className="text-3xl font-bold text-gray-900">
                    {formatDisplayValue(stat.value, stat.name)}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <p>Last updated: {new Date(stat.updated_at).toLocaleDateString()}</p>
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
    name: '',
    value: '',
    display_order: 0
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
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., total_procedures"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use underscores for multi-word names (e.g., success_rate, patient_satisfaction)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value *
            </label>
            <input
              type="text"
              required
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., 30000 or 98 or 4.9"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format is auto-applied based on name (rates get %, ratings get /5)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
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