import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Building,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Vendor {
  id: string;
  vendor_name: string;
  vendor_type: string;
  service_description: string;
  phi_access_level: string;
  contact_name: string;
  contact_email: string;
  risk_level: string;
  is_active: boolean;
  created_at: string;
}

interface BAA {
  id: string;
  vendor_id: string;
  baa_status: string;
  contract_start_date: string;
  contract_end_date: string;
  auto_renewal: boolean;
  signed_by_vendor: boolean;
  signed_by_organization: boolean;
  next_review_date: string;
}

interface VendorWithBAA extends Vendor {
  baa: BAA | null;
}

const BAAManager: React.FC = () => {
  const [vendors, setVendors] = useState<VendorWithBAA[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<VendorWithBAA[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorWithBAA | null>(null);
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeBAAs: 0,
    expiringSoon: 0,
    pendingBAAs: 0,
    highRisk: 0
  });

  useEffect(() => {
    fetchVendorsAndBAAs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vendors, searchTerm, filterStatus]);

  const fetchVendorsAndBAAs = async () => {
    try {
      setLoading(true);

      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('vendor_name');

      if (vendorsError) throw vendorsError;

      const { data: baasData, error: baasError } = await supabase
        .from('business_associate_agreements')
        .select('*');

      if (baasError) throw baasError;

      const vendorsWithBAAs: VendorWithBAA[] = (vendorsData || []).map(vendor => ({
        ...vendor,
        baa: (baasData || []).find(baa => baa.vendor_id === vendor.id) || null
      }));

      setVendors(vendorsWithBAAs);
      calculateStats(vendorsWithBAAs);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (vendorsList: VendorWithBAA[]) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const stats = {
      totalVendors: vendorsList.length,
      activeBAAs: vendorsList.filter(v => v.baa?.baa_status === 'executed').length,
      expiringSoon: vendorsList.filter(v => {
        if (!v.baa?.contract_end_date) return false;
        const endDate = new Date(v.baa.contract_end_date);
        return endDate <= thirtyDaysFromNow && endDate >= now;
      }).length,
      pendingBAAs: vendorsList.filter(v => v.baa?.baa_status === 'pending').length,
      highRisk: vendorsList.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length
    };

    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...vendors];

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.service_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'no_baa') {
        filtered = filtered.filter(v => !v.baa || v.baa.baa_status === 'not_required');
      } else {
        filtered = filtered.filter(v => v.baa?.baa_status === filterStatus);
      }
    }

    setFilteredVendors(filtered);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'executed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'not_required': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPHIAccessColor = (level: string) => {
    switch (level) {
      case 'administrative': return 'bg-purple-100 text-purple-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'none': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor? This will also delete associated BAAs and assessments.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;
      await fetchVendorsAndBAAs();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendors and BAAs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Associate Agreements</h1>
          <p className="text-gray-600">Manage vendors and HIPAA BAA compliance</p>
        </div>
        <button
          onClick={() => setShowAddVendor(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Vendor
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active BAAs</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeBAAs}</p>
            </div>
            <FileCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending BAAs</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingBAAs}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="executed">Executed</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="not_required">Not Required</option>
            <option value="no_baa">No BAA</option>
          </select>
        </div>
      </div>

      {/* Vendors List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PHI Access</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BAA Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract End</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No vendors found. Add your first vendor to track BAA compliance.
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vendor.vendor_name}</div>
                      <div className="text-sm text-gray-500">{vendor.contact_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {vendor.vendor_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPHIAccessColor(vendor.phi_access_level)}`}>
                      {vendor.phi_access_level.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(vendor.risk_level)}`}>
                      {vendor.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {vendor.baa ? (
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vendor.baa.baa_status)}`}>
                        {vendor.baa.baa_status.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        No BAA
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {vendor.baa?.contract_end_date || '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingVendor(vendor)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Vendor Modal would go here */}
      {(showAddVendor || editingVendor) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
              <p className="text-gray-600 mb-4">
                Vendor management form would be implemented here with all fields from the schema.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowAddVendor(false);
                    setEditingVendor(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BAAManager;
