import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRejectTask } from '../hooks/useQueries';
import { toast } from 'sonner';

interface RejectTaskModalProps {
  taskId: bigint;
  open: boolean;
  onClose: () => void;
}

export default function RejectTaskModal({ taskId, open, onClose }: RejectTaskModalProps) {
  const [reason, setReason] = useState('');
  const rejectTask = useRejectTask();

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    try {
      await rejectTask.mutateAsync({ taskId, reason: reason.trim() });
      toast.success('Task rejected.');
      setReason('');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject task.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="reason">Rejection Reason *</Label>
          <Textarea
            id="reason"
            placeholder="Enter the reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
          {!reason.trim() && reason.length > 0 && (
            <p className="text-xs text-red-500">Reason cannot be empty.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={rejectTask.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || rejectTask.isPending}
          >
            {rejectTask.isPending ? 'Rejecting...' : 'Reject Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
