import React, { useState } from 'react';
import { Eye, Download, CheckCircle, XCircle, FileText, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskResponse, ApprovalStatus, FinalStatus } from '../backend';
import { useAdminReviewTask } from '../hooks/useQueries';
import RejectTaskModal from './RejectTaskModal';
import { toast } from 'sonner';

interface ProofReviewPanelProps {
  task: TaskResponse;
  isAdminView?: boolean;
}

function formatTimestamp(ns?: bigint): string {
  if (ns == null) return 'Unknown';
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleString();
}

export default function ProofReviewPanel({ task, isAdminView = false }: ProofReviewPanelProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const adminReviewTask = useAdminReviewTask();

  const proofFile = task.proofFile;
  const proofSubmittedBy = task.proofSubmittedBy;
  // Use submittedAt (new field) with fallback to submissionTimestamp (legacy)
  const submittedAt = task.submittedAt ?? task.submissionTimestamp;

  if (!proofFile) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-600">
        Proof file not available.
      </div>
    );
  }

  const directUrl = proofFile.getDirectURL();
  const isImage = directUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) != null;

  const handleApprove = async () => {
    try {
      await adminReviewTask.mutateAsync({
        taskId: task.taskId,
        decision: FinalStatus.approved,
        reviewComment: null,
      });
      toast.success('Task approved successfully! Performance points awarded.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      toast.error(`Approval failed: ${message}`);
    }
  };

  const handleRejectWithComment = async (comment: string) => {
    try {
      await adminReviewTask.mutateAsync({
        taskId: task.taskId,
        decision: FinalStatus.rejected,
        reviewComment: comment,
      });
      toast.success('Task marked as incomplete. Employee will be notified.');
      setRejectModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rejection failed';
      toast.error(`Rejection failed: ${message}`);
    }
  };

  const isPending = adminReviewTask.isPending;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
        <FileText className="w-4 h-4" />
        Proof Submitted
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-600 space-y-1">
        {proofSubmittedBy && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="font-medium">Employee: </span>
            <span>{proofSubmittedBy}</span>
            {task.proofSubmittedByEmail && (
              <span className="text-gray-400">({task.proofSubmittedByEmail})</span>
            )}
          </div>
        )}
        {submittedAt != null && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="font-medium">Submitted: </span>
            <span>{formatTimestamp(submittedAt)}</span>
          </div>
        )}
        {task.reviewedAt != null && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="font-medium">Reviewed: </span>
            <span>{formatTimestamp(task.reviewedAt)}</span>
          </div>
        )}
      </div>

      {/* File Preview */}
      <div className="rounded overflow-hidden border border-blue-200 bg-white">
        {isImage ? (
          <img
            src={directUrl}
            alt="Proof"
            className="w-full max-h-40 object-contain"
          />
        ) : (
          <div className="flex items-center justify-center gap-2 p-4 text-gray-500">
            <FileText className="w-6 h-6" />
            <span className="text-xs">PDF Document</span>
          </div>
        )}
      </div>

      {/* View / Download Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => window.open(directUrl, '_blank')}
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          asChild
        >
          <a href={directUrl} download>
            <Download className="w-3 h-3 mr-1" />
            Download
          </a>
        </Button>

        {/* Approve / Mark Incomplete — Admin only, pending review tasks */}
        {isAdminView && task.approvalStatus === ApprovalStatus.pendingReview && (
          <>
            <Button
              size="sm"
              className="text-xs bg-task-green hover:bg-task-green/90 text-white ml-auto"
              onClick={handleApprove}
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
                  Approving…
                </span>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approve
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => setRejectModalOpen(true)}
              disabled={isPending}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Mark Incomplete
            </Button>
          </>
        )}
      </div>

      {/* Review Comment (shown after rejection) */}
      {task.reviewComment && (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          <span className="font-semibold">Review comment: </span>
          {task.reviewComment}
        </div>
      )}

      <RejectTaskModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        onReject={handleRejectWithComment}
        isLoading={isPending}
      />
    </div>
  );
}
