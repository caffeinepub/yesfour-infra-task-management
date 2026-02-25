import { useState } from 'react';
import { Task, TaskStatus } from '../backend';
import { useApproveTask } from '../hooks/useQueries';
import RejectTaskModal from './RejectTaskModal';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TaskApprovalActionsProps {
  task: Task;
}

export default function TaskApprovalActions({ task }: TaskApprovalActionsProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const approveTask = useApproveTask();

  if (task.status !== TaskStatus.blue) return null;

  const handleApprove = async () => {
    try {
      await approveTask.mutateAsync(task.taskId);
      toast.success('Task approved! Performance points awarded.');
    } catch (err) {
      toast.error('Failed to approve task. Please try again.');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={approveTask.isPending}
          className="bg-task-green hover:bg-task-green/90 text-white text-xs"
        >
          {approveTask.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Approve
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRejectModalOpen(true)}
          disabled={approveTask.isPending}
          className="border-task-red text-task-red hover:bg-task-red-bg text-xs"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Reject
        </Button>
      </div>

      <RejectTaskModal
        taskId={task.taskId}
        taskTitle={task.title}
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
      />
    </>
  );
}
