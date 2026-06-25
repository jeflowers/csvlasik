import React from 'react';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'pending';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  pending: 'bg-gray-50 text-gray-600 border-gray-200',
};

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  pending: 'bg-gray-400',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
      {children}
    </span>
  );
};

export default StatusBadge;
