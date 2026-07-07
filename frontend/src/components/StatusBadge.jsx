import React from 'react';
import { cn } from '../utils/cn';

const StatusBadge = ({ status, className }) => {
  const statusConfig = {
    paid: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    overdue: 'bg-danger/10 text-danger border-danger/20',
    draft: 'bg-text/10 text-text border-text/20',
    active: 'bg-success/10 text-success border-success/20',
    inactive: 'bg-text/10 text-text border-text/20',
  };

  const normalizedStatus = status?.toLowerCase() || 'draft';
  const config = statusConfig[normalizedStatus] || statusConfig.draft;

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config,
      className
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
