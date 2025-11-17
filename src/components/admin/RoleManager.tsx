import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Lock,
  CheckCircle,
  XCircle,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  granted_at: string;
  expires_at: string | null;
  user?: {
    email: string;
    name: string;
  };
  role?: {
    name: string;
    level: number;
  };
}

const RoleManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments' | 'permissions'>('roles');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole.id);
    }
  }, [selectedRole]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [rolesResult, permissionsResult, userRolesResult, usersResult] = await Promise.all([
        supabase.from('roles').select('*').order('level', { ascending: false }),
        supabase.from('permissions').select('*').order('resource', { ascending: true }),
        supabase.from('user_roles').select(`
          *,
          user:users(email, name),
          role:roles(name, level)
        `).order('granted_at', { ascending: false }),
        supabase.from('users').select('id, email, name, is_active').eq('is_active', true).order('name')
      ]);

      if (rolesResult.data) setRoles(rolesResult.data);
      if (permissionsResult.data) setPermissions(permissionsResult.data);
      if (userRolesResult.data) setUserRoles(userRolesResult.data as any);
      if (usersResult.data) setAllUsers(usersResult.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const { data } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId);

      if (data) {
        setRolePermissions(data.map(rp => rp.permission_id));
      }
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
    }
  };

  const handleTogglePermission = async (permissionId: string) => {
    if (!selectedRole) return;

    const hasPermission = rolePermissions.includes(permissionId);

    try {
      if (hasPermission) {
        await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', selectedRole.id)
          .eq('permission_id', permissionId);
      } else {
        await supabase
          .from('role_permissions')
          .insert({ role_id: selectedRole.id, permission_id: permissionId });
      }

      fetchRolePermissions(selectedRole.id);
    } catch (error) {
      console.error('Failed to toggle permission:', error);
    }
  };

  const handleRevokeUserRole = async (userRoleId: string) => {
    if (!confirm('Are you sure you want to revoke this role assignment?')) return;

    try {
      await supabase.from('user_roles').delete().eq('id', userRoleId);
      fetchData();
    } catch (error) {
      console.error('Failed to revoke user role:', error);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) {
      alert('Please select both a user and a role');
      return;
    }

    try {
      const assignment: any = {
        user_id: selectedUserId,
        role_id: selectedRoleId,
        granted_at: new Date().toISOString()
      };

      if (expiresAt) {
        assignment.expires_at = new Date(expiresAt).toISOString();
      }

      const { error } = await supabase.from('user_roles').insert(assignment);

      if (error) throw error;

      setShowAssignModal(false);
      setSelectedUserId('');
      setSelectedRoleId('');
      setExpiresAt('');
      fetchData();
    } catch (error: any) {
      console.error('Failed to assign role:', error);
      alert(`Failed to assign role: ${error.message}`);
    }
  };

  const getRoleLevelBadge = (level: number) => {
    if (level >= 100) return 'bg-red-100 text-red-800 border-red-200';
    if (level >= 80) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (level >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (level >= 40) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const groupPermissionsByResource = () => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach(perm => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Role & Permission Management</h1>
        <p className="text-gray-600">Manage system roles, permissions, and user assignments</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            User Assignments ({userRoles.length})
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            All Permissions ({permissions.length})
          </button>
        </nav>
      </div>

      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4">System Roles</h3>
              <div className="space-y-2">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedRole?.id === role.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{role.name}</span>
                      <span className={`px-2 py-1 text-xs rounded border ${getRoleLevelBadge(role.level)}`}>
                        Level {role.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedRole.name}</h3>
                    <span className={`px-3 py-1 text-sm rounded border ${getRoleLevelBadge(selectedRole.level)}`}>
                      Level {selectedRole.level}
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedRole.description}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Assigned Permissions</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {rolePermissions.length} of {permissions.length} permissions assigned
                  </p>
                </div>

                <div className="space-y-6">
                  {Object.entries(groupPermissionsByResource()).map(([resource, perms]) => (
                    <div key={resource} className="border-b border-gray-200 pb-4 last:border-0">
                      <h5 className="font-medium text-gray-900 mb-3 capitalize">{resource}</h5>
                      <div className="space-y-2">
                        {perms.map(perm => {
                          const isAssigned = rolePermissions.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className="flex items-start p-2 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => handleTogglePermission(perm.id)}
                                className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {perm.action}
                                  </span>
                                  <span className="text-xs text-gray-500">({perm.name})</span>
                                </div>
                                <p className="text-sm text-gray-600">{perm.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role</h3>
                <p className="text-gray-600">Choose a role from the list to view and manage its permissions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">User Role Assignments</h3>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Role
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Granted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userRoles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No user role assignments found
                    </td>
                  </tr>
                ) : (
                  userRoles.map((ur) => {
                    const isExpired = ur.expires_at && new Date(ur.expires_at) < new Date();
                    return (
                      <tr key={ur.id} className={isExpired ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ur.user?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">{ur.user?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded border ${
                            ur.role ? getRoleLevelBadge(ur.role.level) : 'bg-gray-100 text-gray-800'
                          }`}>
                            {ur.role?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(ur.granted_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {ur.expires_at ? (
                            <div className={`flex items-center ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                              {isExpired ? <XCircle className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                              {new Date(ur.expires_at).toLocaleDateString()}
                              {isExpired && ' (Expired)'}
                            </div>
                          ) : (
                            <span className="text-gray-500">Never</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRevokeUserRole(ur.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Revoke Role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {Object.entries(groupPermissionsByResource()).map(([resource, perms]) => (
              <div key={resource} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-gray-400" />
                  {resource}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {perms.map(perm => (
                    <div key={perm.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{perm.action}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {perm.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{perm.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Role to User</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">-- Select a user --</option>
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">-- Select a role --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} (Level {role.level}) - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for permanent assignment
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUserId('');
                  setSelectedRoleId('');
                  setExpiresAt('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                disabled={!selectedUserId || !selectedRoleId}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
