import React, { useState, useEffect } from 'react';
import { Users, Plus, Save, X, Globe, Stethoscope, Clock, TrendingUp } from 'lucide-react';
import type { StaffCapabilities } from '../../types/Nextech';
import { assignmentService } from '../../services/assignmentService';
import { supabase } from '../../lib/supabase';

interface StaffUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hy', name: 'Armenian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'zh', name: 'Chinese' },
];

const AVAILABLE_PROCEDURES = ['LASIK', 'PRK', 'ICL', 'Cataract', 'Consultation'];

const AVAILABLE_TIMEZONES = ['PST', 'ChST', 'EST', 'CST', 'MST'];

export const StaffCapabilitiesManager: React.FC = () => {
  const [staffMembers, setStaffMembers] = useState<StaffUser[]>([]);
  const [capabilities, setCapabilities] = useState<Record<string, StaffCapabilities>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [workloadStats, setWorkloadStats] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .in('role', ['admin', 'scheduler']);

    if (users) {
      setStaffMembers(users);

      const capsMap: Record<string, StaffCapabilities> = {};
      const workloadMap: Record<string, any> = {};

      for (const user of users) {
        const caps = await assignmentService.getStaffCapabilities(user.id);
        if (caps) {
          capsMap[user.id] = caps;
        }

        const workload = await assignmentService.getStaffWorkload(user.id);
        workloadMap[user.id] = workload;
      }

      setCapabilities(capsMap);
      setWorkloadStats(workloadMap);
    }

    setLoading(false);
  };

  const handleSaveCapabilities = async (userId: string) => {
    setSaving(userId);

    try {
      const caps = capabilities[userId];

      if (caps) {
        await assignmentService.updateStaffCapabilities(userId, caps);
      } else {
        await assignmentService.updateStaffCapabilities(userId, {
          languages: ['en'],
          procedures: [],
          time_zones: ['PST'],
          max_active_consultations: 10,
          is_active: true,
        });
      }

      setEditingStaff(null);
      await loadData();
    } catch (error) {
      console.error('Error saving capabilities:', error);
    } finally {
      setSaving(null);
    }
  };

  const updateCapability = (
    userId: string,
    field: keyof StaffCapabilities,
    value: any
  ) => {
    setCapabilities((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {
          id: '',
          user_id: userId,
          languages: ['en'],
          procedures: [],
          time_zones: ['PST'],
          max_active_consultations: 10,
          is_active: true,
          vip_handling: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
        [field]: value,
      },
    }));
  };

  const toggleArrayValue = (
    userId: string,
    field: 'languages' | 'procedures' | 'time_zones',
    value: string
  ) => {
    const current = capabilities[userId]?.[field] || [];
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    updateCapability(userId, field, newValue);
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
          <h1 className="text-3xl font-bold text-gray-900">Staff Capabilities</h1>
          <p className="text-gray-600 mt-1">
            Configure staff skills and availability for intelligent consultation routing
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {staffMembers.map((staff) => {
          const caps = capabilities[staff.id];
          const isEditing = editingStaff === staff.id;
          const workload = workloadStats[staff.id];

          return (
            <div key={staff.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {staff.full_name || staff.email}
                      </h3>
                      <p className="text-sm text-gray-500">{staff.role}</p>
                    </div>
                    {caps?.is_active && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {!isEditing ? (
                      <button
                        onClick={() => setEditingStaff(staff.id)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSaveCapabilities(staff.id)}
                          disabled={saving === staff.id}
                          className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 flex items-center space-x-1 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingStaff(null);
                            loadData();
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {workload && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Workload:</span>
                      <span className="font-medium">
                        {workload.active_count} / {workload.max_capacity} consultations
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          workload.utilization_percentage > 80
                            ? 'bg-red-600'
                            : workload.utilization_percentage > 50
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(workload.utilization_percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <h4 className="font-medium text-gray-900">Languages</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_LANGUAGES.map((lang) => {
                        const isSelected = caps?.languages?.includes(lang.code) || false;
                        return (
                          <button
                            key={lang.code}
                            onClick={() =>
                              isEditing && toggleArrayValue(staff.id, 'languages', lang.code)
                            }
                            disabled={!isEditing}
                            className={`px-3 py-1 rounded-full text-sm ${
                              isSelected
                                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            } ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          >
                            {lang.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Stethoscope className="w-5 h-5 text-gray-500" />
                      <h4 className="font-medium text-gray-900">Procedures</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_PROCEDURES.map((proc) => {
                        const isSelected = caps?.procedures?.includes(proc) || false;
                        return (
                          <button
                            key={proc}
                            onClick={() =>
                              isEditing && toggleArrayValue(staff.id, 'procedures', proc)
                            }
                            disabled={!isEditing}
                            className={`px-3 py-1 rounded-full text-sm ${
                              isSelected
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            } ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          >
                            {proc}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <h4 className="font-medium text-gray-900">Time Zones</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TIMEZONES.map((tz) => {
                        const isSelected = caps?.time_zones?.includes(tz) || false;
                        return (
                          <button
                            key={tz}
                            onClick={() =>
                              isEditing && toggleArrayValue(staff.id, 'time_zones', tz)
                            }
                            disabled={!isEditing}
                            className={`px-3 py-1 rounded-full text-sm ${
                              isSelected
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            } ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          >
                            {tz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-gray-500" />
                      <h4 className="font-medium text-gray-900">Capacity Settings</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Max Active Consultations</label>
                        <input
                          type="number"
                          value={caps?.max_active_consultations || 10}
                          onChange={(e) =>
                            updateCapability(
                              staff.id,
                              'max_active_consultations',
                              parseInt(e.target.value)
                            )
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                          min="1"
                          max="50"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={caps?.is_active || false}
                          onChange={(e) =>
                            updateCapability(staff.id, 'is_active', e.target.checked)
                          }
                          disabled={!isEditing}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <label className="text-sm text-gray-700">Active for assignments</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={caps?.vip_handling || false}
                          onChange={(e) =>
                            updateCapability(staff.id, 'vip_handling', e.target.checked)
                          }
                          disabled={!isEditing}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <label className="text-sm text-gray-700">VIP handling enabled</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
