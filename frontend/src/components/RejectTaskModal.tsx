import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RejectTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (comment: string) => void;
  isLoading?: boolean;
}

export default function RejectTaskModal({
  open,
  onOpenChange,
  onReject,
  isLoading = false,
}: RejectTaskModalProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!comment.trim()) {
      setError('A review comment is required when marking a task as incomplete.');
      return;
    }
    setError('');
    onReject(comment.trim());
    setComment('');
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setComment('');
      setError('');
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Task as Incomplete</DialogTitle>
          <DialogDescription>
            Please provide a review comment explaining why this task is incomplete. The employee will see this comment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="review-comment">
            Review Comment <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="review-comment"
            placeholder="Explain what needs to be corrected or resubmitted…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading || !comment.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Submitting…
              </span>
            ) : (
              'Mark Incomplete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
