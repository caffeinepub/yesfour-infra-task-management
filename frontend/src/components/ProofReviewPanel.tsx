import React, { useState } from 'react';
import { TaskResponse, ApprovalStatus } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, Download, FileText, User, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useApproveTask, useRejectTask } from '../hooks/useQueries';
import RejectTaskModal from './RejectTaskModal';
import ProofPreviewModal from './ProofPreviewModal';

interface ProofReviewPanelProps {
  task: TaskResponse;
}

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

export default function ProofReviewPanel({ task }: ProofReviewPanelProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  const hasProof = !!task.proofFile;
  const isPendingReview = task.approvalStatus === ApprovalStatus.pendingReview;
  const isApproved = task.approvalStatus === ApprovalStatus.approved;
  const isRejected = task.approvalStatus === ApprovalStatus.rejected;

  if (!hasProof && !isPendingReview && !isApproved && !isRejected) {
    return null;
  }

  const handleApprove = async () => {
    try {
      await approveTask.mutateAsync(task.taskId);
      toast.success('Task approved successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve task');
    }
  };

  const handleDownload = () => {
    if (!task.proofFile) return;
    const url = task.proofFile.getDirectURL();
    const a = document.createElement('a');
    a.href = url;
    a.download = `proof-task-${task.taskId}.file`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <Card className="border border-blue-200 bg-blue-50/40 mt-3">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Proof Review Section
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {/* Employee Info */}
          {task.proofSubmittedBy && (
            <div className="flex items-start gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-gray-700">{task.proofSubmittedBy}</span>
                {task.proofSubmittedByEmail && (
                  <span className="text-gray-500 ml-1">({task.proofSubmittedByEmail})</span>
                )}
              </div>
            </div>
          )}

          {/* Submission Time */}
          {task.submissionTimestamp && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Submitted: {formatTimestamp(task.submissionTimestamp)}</span>
            </div>
          )}

          {/* File Preview Thumbnail */}
          {task.proofFile && (
            <div className="border rounded-lg overflow-hidden bg-white">
              <ProofFileThumbnail proofFile={task.proofFile} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {task.proofFile && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  className="gap-1.5 text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Proof
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-1.5 text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </>
            )}

            {isPendingReview && (
              <>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={approveTask.isPending}
                  className="gap-1.5 bg-brand-green hover:bg-brand-green-dark text-white"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {approveTask.isPending ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowRejectModal(true)}
                  className="gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </Button>
              </>
            )}

            {isApproved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" />
                Approved
              </span>
            )}

            {isRejected && (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-700 font-medium">
                <XCircle className="w-4 h-4" />
                Rejected
                {task.rejectionReason && (
                  <span className="text-gray-500 font-normal">— {task.rejectionReason}</span>
                )}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {task.proofFile && showPreview && (
        <ProofPreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          proofFile={task.proofFile}
          submittedBy={task.proofSubmittedBy}
          submittedByEmail={task.proofSubmittedByEmail}
          submissionTimestamp={task.submissionTimestamp}
          taskTitle={task.title}
        />
      )}

      {showRejectModal && (
        <RejectTaskModal
          taskId={task.taskId}
          open={showRejectModal}
          onClose={() => setShowRejectModal(false)}
        />
      )}
    </>
  );
}

// Small thumbnail component
function ProofFileThumbnail({ proofFile }: { proofFile: NonNullable<TaskResponse['proofFile']> }) {
  const [imgError, setImgError] = useState(false);
  const url = proofFile.getDirectURL();
  const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);

  if (isImage && !imgError) {
    return (
      <img
        src={url}
        alt="Proof thumbnail"
        className="w-full max-h-32 object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 text-gray-500">
      <FileText className="w-8 h-8 text-gray-300" />
      <span className="text-sm">Document / PDF file</span>
    </div>
  );
}
