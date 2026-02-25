import React from 'react';
import { TaskStatus, ApprovalStatus } from '../backend';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

interface ApprovalStatusBadgeProps {
  approvalStatus: ApprovalStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  [TaskStatus.red]: {
    label: 'Overdue',
    className: 'bg-task-red text-white',
  },
  [TaskStatus.yellow]: {
    label: 'In Progress',
    className: 'bg-task-yellow text-gray-900',
  },
  [TaskStatus.blue]: {
    label: 'Under Review',
    className: 'bg-task-blue text-white',
  },
  [TaskStatus.green]: {
    label: 'Completed',
    className: 'bg-task-green text-white',
  },
};

const approvalStatusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  [ApprovalStatus.pendingReview]: {
    label: 'Pending Review',
    className: 'bg-blue-100 text-blue-800 border border-blue-300',
  },
  [ApprovalStatus.approved]: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 border border-green-300',
  },
  [ApprovalStatus.rejected]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border border-red-300',
  },
  [ApprovalStatus.pending]: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-700 border border-gray-300',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}

export function ApprovalStatusBadge({ approvalStatus, size = 'md' }: ApprovalStatusBadgeProps) {
  const config = approvalStatusConfig[approvalStatus];
  if (!config) return null;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}

export function ProofUploadedBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} bg-blue-100 text-blue-800 border border-blue-300`}>
      Proof Uploaded
    </span>
  );
}

export default StatusBadge;
