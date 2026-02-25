import React from 'react';
import { AccountStatus } from '../backend';

interface UserAccountStatusBadgeProps {
  status: AccountStatus | unknown;
  className?: string;
}

function getStatusKey(status: unknown): string {
  if (typeof status === 'string') return status;
  if (typeof status === 'object' && status !== null) return Object.keys(status)[0];
  return String(status);
}

export default function UserAccountStatusBadge({ status, className = '' }: UserAccountStatusBadgeProps) {
  const key = getStatusKey(status);
  const isActive = key === AccountStatus.active;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isActive
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-gray-100 text-gray-500 border border-gray-300'
      } ${className}`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
