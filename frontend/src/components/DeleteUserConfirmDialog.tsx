import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { useDeleteUser } from '../hooks/useQueries';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface DeleteUserConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  userPrincipal: Principal | null;
  userName: string;
}

export default function DeleteUserConfirmDialog({
  open,
  onClose,
  userPrincipal,
  userName,
}: DeleteUserConfirmDialogProps) {
  const deleteUser = useDeleteUser();

  const handleConfirm = async () => {
    if (!userPrincipal) return;
    try {
      await deleteUser.mutateAsync(userPrincipal);
      toast.success(`User "${userName}" has been deleted.`);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(message);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-foreground">{userName}</span>? This action cannot
            be undone and all associated data will be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteUser.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
