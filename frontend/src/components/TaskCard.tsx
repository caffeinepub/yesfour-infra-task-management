import React, { useState } from 'react';
import { TaskResponse, ApprovalStatus } from '../backend';
import { StatusBadge, ApprovalStatusBadge, ProofUploadedBadge } from './StatusBadge';
import { useCountdown } from '../hooks/useCountdown';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import ProofReviewPanel from './ProofReviewPanel';

interface TaskCardProps {
  task: TaskResponse;
  actionSlot?: React.ReactNode;
  currentUserPrincipal?: string;
  isAdminView?: boolean;
}

const priorityConfig = {
  high: { label: 'High', className: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low: { label: 'Low', className: 'bg-green-100 text-green-700 border-green-200' },
};

const departmentLabels: Record<string, string> = {
  construction: 'Construction',
  marketing: 'Marketing',
  travelDesk: 'Travel Desk',
  accounts: 'Accounts',
  apartments: 'Apartments',
};

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
}

export default function TaskCard({
  task,
  actionSlot,
  currentUserPrincipal,
  isAdminView = false,
}: TaskCardProps) {
  const { formatted: countdown, isExpired, isUrgent } = useCountdown(task.deadline);
  const [expanded, setExpanded] = useState(false);

  const priority = task.priority as unknown as { low?: null; medium?: null; high?: null };
  const priorityKey = 'low' in priority ? 'low' : 'medium' in priority ? 'medium' : 'high';
  const priorityStyle = priorityConfig[priorityKey];

  const department = task.department as unknown as Record<string, null>;
  const departmentKey = Object.keys(department)[0] || '';
  const departmentLabel = departmentLabels[departmentKey] || departmentKey;

  const approvalStatus = task.approvalStatus as unknown as {
    pending?: null;
    approved?: null;
    rejected?: null;
    pendingReview?: null;
  };
  const approvalKey = Object.keys(approvalStatus)[0] as ApprovalStatus | undefined;

  const hasProof = !!task.proofFile;
  const isPendingReview = approvalKey === ApprovalStatus.pendingReview;
  const isApproved = approvalKey === ApprovalStatus.approved;
  const isRejected = approvalKey === ApprovalStatus.rejected;

  // Determine if the current user is the assignee
  const isAssignee =
    !!currentUserPrincipal && task.assignedTo?.toString() === currentUserPrincipal;

  const taskStatus = task.status as unknown as Record<string, null>;
  const statusKey = Object.keys(taskStatus)[0] as import('../backend').TaskStatus;

  return (
    <Card className="border border-gray-200 shadow-card hover:shadow-card-hover transition-shadow">
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {task.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{departmentLabel}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center rounded border text-xs px-2 py-0.5 font-medium ${priorityStyle.className}`}
            >
              {priorityStyle.label}
            </span>
            <StatusBadge status={statusKey} size="sm" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

        {/* Approval / Proof Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {/* Show "Pending Review" badge to the assignee employee */}
          {isPendingReview && !isAdminView && isAssignee && (
            <ApprovalStatusBadge approvalStatus={ApprovalStatus.pendingReview} size="sm" />
          )}

          {/* Admin-only badges */}
          {isAdminView && hasProof && <ProofUploadedBadge size="sm" />}
          {isAdminView && isApproved && (
            <ApprovalStatusBadge approvalStatus={ApprovalStatus.approved} size="sm" />
          )}
          {isAdminView && isRejected && (
            <ApprovalStatusBadge approvalStatus={ApprovalStatus.rejected} size="sm" />
          )}
          {isAdminView && isPendingReview && (
            <ApprovalStatusBadge approvalStatus={ApprovalStatus.pendingReview} size="sm" />
          )}
        </div>

        {/* Rejection Reason (visible to assignee) */}
        {isRejected && task.rejectionReason && isAssignee && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 text-xs text-red-700">
            <span className="font-medium">Rejection reason:</span> {task.rejectionReason}
          </div>
        )}

        {/* Deadline & Points Row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            {isExpired ? (
              <AlertTriangle className="w-3.5 h-3.5 text-task-red" />
            ) : (
              <Clock
                className={`w-3.5 h-3.5 ${isUrgent ? 'text-task-yellow' : 'text-gray-400'}`}
              />
            )}
            <span
              className={
                isExpired
                  ? 'text-task-red font-medium'
                  : isUrgent
                    ? 'text-task-yellow font-medium'
                    : ''
              }
            >
              {countdown}
            </span>
          </div>
          {Number(task.performancePoints) !== 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-task-yellow" />
              <span
                className={
                  Number(task.performancePoints) > 0
                    ? 'text-task-green font-medium'
                    : 'text-task-red font-medium'
                }
              >
                {Number(task.performancePoints) > 0 ? '+' : ''}
                {Number(task.performancePoints)} pts
              </span>
            </div>
          )}
        </div>

        {/* Employee's own proof confirmation */}
        {!isAdminView && isAssignee && hasProof && (
          <div className="bg-green-50 border border-green-200 rounded p-2 mb-3 text-xs text-green-700">
            <span className="font-medium">✓ Proof uploaded</span>
            {task.submissionTimestamp && (
              <span className="text-gray-500 ml-1">
                — {formatTimestamp(task.submissionTimestamp)}
              </span>
            )}
          </div>
        )}

        {/* Admin: Submitted By info */}
        {isAdminView && hasProof && task.proofSubmittedBy && (
          <div className="text-xs text-gray-500 mb-2">
            <span className="font-medium text-gray-600">Submitted by:</span>{' '}
            {task.proofSubmittedBy}
            {task.proofSubmittedByEmail && ` (${task.proofSubmittedByEmail})`}
            {task.submissionTimestamp && (
              <span className="ml-1 text-gray-400">
                · {formatTimestamp(task.submissionTimestamp)}
              </span>
            )}
          </div>
        )}

        {/* Action Slot */}
        {actionSlot && <div className="mt-2">{actionSlot}</div>}

        {/* Admin: Expand/Collapse Proof Review Panel */}
        {isAdminView && (hasProof || isPendingReview || isApproved || isRejected) && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {expanded ? 'Hide Review Panel' : 'Show Review Panel'}
            </button>
            {expanded && <ProofReviewPanel task={task} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
