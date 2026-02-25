import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApproveTask, useRejectTask } from '../hooks/useQueries';
import RejectTaskModal from './RejectTaskModal';
import { toast } from 'sonner';

interface TaskApprovalActionsProps {
  taskId: bigint;
}

export default function TaskApprovalActions({ taskId }: TaskApprovalActionsProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  const handleApprove = async () => {
    try {
      await approveTask.mutateAsync(taskId);
      toast.success('Task approved successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      toast.error(`Approval failed: ${message}`);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectTask.mutateAsync({ taskId, reason });
      toast.success('Task rejected.');
      setRejectModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rejection failed';
      toast.error(`Rejection failed: ${message}`);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-task-green hover:bg-task-green/90 text-white"
          onClick={handleApprove}
          disabled={approveTask.isPending}
        >
          {approveTask.isPending ? (
            <span className="flex items-center gap-1">
              <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
              Approving…
            </span>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </>
          )}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setRejectModalOpen(true)}
          disabled={rejectTask.isPending}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>

      <RejectTaskModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        onReject={handleReject}
        isLoading={rejectTask.isPending}
      />
    </>
  );
}
