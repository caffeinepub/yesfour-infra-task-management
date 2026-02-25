import React from 'react';
import { TaskStatus, ApprovalStatus } from '../backend';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  [TaskStatus.red]: {
    label: 'Overdue',
    className: 'bg-task-red text-white',
  },
  [TaskStatus.yellow]: {
    label: 'In Progress',
    className: 'bg-task-yellow text-white',
  },
  [TaskStatus.blue]: {
    label: 'Pending Review',
    className: 'bg-task-blue text-white',
  },
  [TaskStatus.green]: {
    label: 'Completed',
    className: 'bg-task-green text-white',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: String(status), className: 'bg-gray-400 text-white' };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

const approvalStatusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  [ApprovalStatus.pending]: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-700 border border-gray-300',
  },
  [ApprovalStatus.pendingReview]: {
    label: 'Pending Review',
    className: 'bg-blue-100 text-blue-700 border border-blue-300',
  },
  [ApprovalStatus.approved]: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700 border border-green-300',
  },
  [ApprovalStatus.rejected]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 border border-red-300',
  },
};

export function ApprovalStatusBadge({ status, className = '' }: ApprovalStatusBadgeProps) {
  const config = approvalStatusConfig[status] ?? { label: String(status), className: 'bg-gray-100 text-gray-700' };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

export function ProofUploadedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-task-blue text-white ${className}`}
    >
      Proof Uploaded
    </span>
  );
}
