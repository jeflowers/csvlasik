/**
 * @file RoleGuard.tsx
 * @description Permission wrapper component for role-based access control
 * @author Development
 * @filepath atelierlasik/src/components/admin/RoleGuard.tsx
 * @category Component
 * @pattern Guard Pattern
 * @version 1.0.0
 * @last_updated 2025-10-10
 *
 * @dependencies
 * - react: ^18.3.1
 *
 * @security
 * - Enforces role-based access control
 * - Prevents unauthorized component rendering
 * - Provides fallback UI for insufficient permissions
 */

import React from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Shield } from 'lucide-react';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'editor' | 'viewer')[];
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

/**
 * Guard component that restricts access based on user role
 *
 * @example
 * ```tsx
 * // Only admins can see this
 * <RoleGuard allowedRoles={['admin']}>
 *   <DeleteButton />
 * </RoleGuard>
 *
 * // Admins and editors can see this
 * <RoleGuard allowedRoles={['admin', 'editor']}>
 *   <EditForm />
 * </RoleGuard>
 *
 * // Custom fallback
 * <RoleGuard
 *   allowedRoles={['admin']}
 *   fallback={<div>Admin access required</div>}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  showMessage = true,
}: RoleGuardProps): React.ReactElement | null {
  const { user, loading, hasRole } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user || !hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showMessage) {
      return null;
    }

    return (
      <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Access Denied</h3>
          <p className="text-sm text-red-700">
            You don't have permission to view this content.
          </p>
          <p className="text-xs text-red-600 mt-2">
            Required roles: {allowedRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RoleGuard;
