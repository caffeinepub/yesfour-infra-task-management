import React, { useState } from 'react';
import { TaskResponse } from '../backend';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { useApproveTask } from '../hooks/useQueries';
import { toast } from 'sonner';
import RejectTaskModal from './RejectTaskModal';

interface TaskApprovalActionsProps {
  task: TaskResponse;
}

export default function TaskApprovalActions({ task }: TaskApprovalActionsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const approveTask = useApproveTask();

  const handleApprove = async () => {
    try {
      await approveTask.mutateAsync(task.taskId);
      toast.success('Task approved!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve task.');
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={approveTask.isPending}
          className="gap-1.5 bg-brand-green hover:bg-brand-green-dark text-white flex-1"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {approveTask.isPending ? 'Approving...' : 'Approve'}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowRejectModal(true)}
          className="gap-1.5 flex-1"
        >
          <XCircle className="w-3.5 h-3.5" />
          Reject
        </Button>
      </div>

      <RejectTaskModal
        taskId={task.taskId}
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
      />
    </>
  );
}
