import React from 'react';
import { Clock, AlertTriangle, CheckCircle, FileText, User } from 'lucide-react';
import { TaskResponse, TaskStatus, ApprovalStatus } from '../backend';
import { StatusBadge, ApprovalStatusBadge } from './StatusBadge';
import { useCountdown } from '../hooks/useCountdown';
import ProofUploadButton from './ProofUploadButton';
import ProofReviewPanel from './ProofReviewPanel';

interface TaskCardProps {
  task: TaskResponse;
  isAdminView?: boolean;
  currentUserPrincipal?: string;
  submittedByName?: string;
  submittedByEmail?: string;
}

function TaskStatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case TaskStatus.red:
      return <AlertTriangle className="w-4 h-4 text-task-red" />;
    case TaskStatus.yellow:
      return <Clock className="w-4 h-4 text-task-yellow" />;
    case TaskStatus.blue:
      return <FileText className="w-4 h-4 text-task-blue" />;
    case TaskStatus.green:
      return <CheckCircle className="w-4 h-4 text-task-green" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

const statusBorderMap: Record<TaskStatus, string> = {
  [TaskStatus.red]: 'border-l-task-red',
  [TaskStatus.yellow]: 'border-l-task-yellow',
  [TaskStatus.blue]: 'border-l-task-blue',
  [TaskStatus.green]: 'border-l-task-green',
};

export default function TaskCard({
  task,
  isAdminView = false,
  currentUserPrincipal,
  submittedByName,
  submittedByEmail,
}: TaskCardProps) {
  const { formatted: countdown, isExpired, isUrgent } = useCountdown(task.deadline);

  const isAssignee = currentUserPrincipal
    ? task.assignedTo.toString() === currentUserPrincipal
    : false;

  const statusKey = typeof task.status === 'string' ? task.status : Object.keys(task.status)[0];
  const approvalKey = typeof task.approvalStatus === 'string' ? task.approvalStatus : Object.keys(task.approvalStatus)[0];

  // Employee can upload proof when:
  // - They are the assignee
  // - Task is yellow (In Progress) OR was rejected (back to yellow after rejection)
  // - Not already pending review or approved
  const canUploadProof =
    isAssignee &&
    !isAdminView &&
    (statusKey === TaskStatus.yellow) &&
    approvalKey !== ApprovalStatus.pendingReview &&
    approvalKey !== ApprovalStatus.approved;

  // Show proof review panel when:
  // - Admin view: task has a proof file and is pending review
  // - Employee view: task is in blue/pending review state (they can see their own proof)
  const showProofReviewForAdmin =
    isAdminView &&
    !!task.proofFile &&
    approvalKey === ApprovalStatus.pendingReview;

  const showProofForEmployee =
    isAssignee &&
    !isAdminView &&
    !!task.proofFile &&
    (statusKey === TaskStatus.blue || approvalKey === ApprovalStatus.pendingReview);

  // Show rejection info (review comment from admin)
  const showRejectionComment =
    isAssignee &&
    !isAdminView &&
    approvalKey === ApprovalStatus.rejected &&
    task.reviewComment;

  const showLegacyRejectionReason =
    (isAdminView || isAssignee) &&
    approvalKey === ApprovalStatus.rejected &&
    task.rejectionReason &&
    !task.reviewComment;

  const borderClass = statusBorderMap[task.status] ?? 'border-l-gray-300';

  const priorityColors: Record<string, string> = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-green-600 bg-green-50',
  };

  const priorityKey = typeof task.priority === 'string' ? task.priority : Object.keys(task.priority)[0];
  const priorityClass = priorityColors[priorityKey] ?? 'text-gray-600 bg-gray-50';

  const departmentLabel = typeof task.department === 'string'
    ? task.department
    : Object.keys(task.department)[0];

  return (
    <div className={`bg-white rounded-lg shadow-card border-l-4 ${borderClass} p-4 flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <TaskStatusIcon status={task.status} />
          <h3 className="font-semibold text-gray-900 text-sm truncate">{task.title}</h3>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priorityClass}`}>
            {priorityKey}
          </span>
          <StatusBadge status={task.status} />
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{departmentLabel}</span>
        {task.status !== TaskStatus.green && (
          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : isUrgent ? 'text-yellow-600' : ''}`}>
            <Clock className="w-3 h-3" />
            {isExpired ? 'Expired' : countdown}
          </span>
        )}
        {task.status === TaskStatus.green && task.completionTime != null && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )}
      </div>

      {/* Approval Status Badge (when not pending) */}
      {approvalKey !== ApprovalStatus.pending && (
        <div className="flex items-center gap-2">
          <ApprovalStatusBadge status={task.approvalStatus} />
          {task.performancePoints !== BigInt(0) && (
            <span className={`text-xs font-medium ${Number(task.performancePoints) > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {Number(task.performancePoints) > 0 ? '+' : ''}{Number(task.performancePoints)} pts
            </span>
          )}
        </div>
      )}

      {/* Admin review comment shown to employee after rejection */}
      {showRejectionComment && (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          <span className="font-semibold">Admin comment: </span>
          {task.reviewComment}
        </div>
      )}

      {/* Legacy rejection reason */}
      {showLegacyRejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          <span className="font-semibold">Rejection reason: </span>
          {task.rejectionReason}
        </div>
      )}

      {/* Assignee info for admin view */}
      {isAdminView && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <User className="w-3 h-3" />
          <span className="font-mono truncate">{task.assignedTo.toString().slice(0, 20)}…</span>
        </div>
      )}

      {/* Proof Upload + Mark Complete (employee only, yellow/in-progress status) */}
      {canUploadProof && (
        <ProofUploadButton
          taskId={task.taskId}
          hasExistingProof={!!task.proofFile}
        />
      )}

      {/* Employee's own proof view (blue/pending review) */}
      {showProofForEmployee && (
        <ProofReviewPanel
          task={task}
          isAdminView={false}
        />
      )}

      {/* Admin Proof Review Panel */}
      {showProofReviewForAdmin && (
        <ProofReviewPanel
          task={task}
          isAdminView={true}
        />
      )}
    </div>
  );
}
