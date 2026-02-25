import { useState } from 'react';
import { useRejectTask } from '../hooks/useQueries';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RejectTaskModalProps {
  taskId: bigint;
  taskTitle: string;
  open: boolean;
  onClose: () => void;
}

export default function RejectTaskModal({ taskId, taskTitle, open, onClose }: RejectTaskModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const rejectTask = useRejectTask();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setError('');
    try {
      await rejectTask.mutateAsync({ taskId, reason: reason.trim() });
      toast.success('Task rejected. Employee has been notified.');
      setReason('');
      onClose();
    } catch (err) {
      toast.error('Failed to reject task. Please try again.');
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-task-red">
            <XCircle className="w-5 h-5" />
            Reject Task
          </DialogTitle>
          <DialogDescription>
            Rejecting: <span className="font-semibold text-foreground">{taskTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="rejection-reason">Reason for Rejection <span className="text-task-red">*</span></Label>
            <Textarea
              id="rejection-reason"
              placeholder="Explain why this task is being rejected..."
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
              rows={4}
              className={error ? 'border-task-red' : ''}
            />
            {error && <p className="text-xs text-task-red">{error}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={rejectTask.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rejectTask.isPending}
            className="bg-task-red hover:bg-task-red/90 text-white"
          >
            {rejectTask.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              'Reject Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
