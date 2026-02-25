import { useState } from 'react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { UserRole } from '../backend';
import { useUpdateUserRole } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface EditUserRoleModalProps {
  open: boolean;
  onClose: () => void;
  userPrincipal: Principal | null;
  userName: string;
  currentRole: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  [UserRole.admin]: 'Admin',
  [UserRole.manager]: 'Manager',
  [UserRole.employee]: 'Employee',
};

export default function EditUserRoleModal({
  open,
  onClose,
  userPrincipal,
  userName,
  currentRole,
}: EditUserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const updateRole = useUpdateUserRole();

  const handleSave = async () => {
    if (!userPrincipal) return;
    try {
      await updateRole.mutateAsync({ user: userPrincipal, newRole: selectedRole });
      toast.success(`Role updated to ${roleLabels[selectedRole]} for ${userName}`);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update role';
      toast.error(message);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for <span className="font-semibold text-foreground">{userName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <Label htmlFor="role-select" className="text-sm font-medium">
            Select New Role
          </Label>
          <Select
            value={selectedRole}
            onValueChange={(val) => setSelectedRole(val as UserRole)}
          >
            <SelectTrigger id="role-select" className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRole.admin}>Admin</SelectItem>
              <SelectItem value={UserRole.manager}>Manager</SelectItem>
              <SelectItem value={UserRole.employee}>Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={updateRole.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateRole.isPending || selectedRole === currentRole}
            className="bg-brand-green hover:bg-brand-green-dark text-white"
          >
            {updateRole.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
