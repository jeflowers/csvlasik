import React from 'react';
import { roleColor } from '../../../utils/roleColor';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const color = roleColor(role);
  const label = role.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${className}`}>
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span style={{ color }}>{label}</span>
    </span>
  );
};

export default RoleBadge;
