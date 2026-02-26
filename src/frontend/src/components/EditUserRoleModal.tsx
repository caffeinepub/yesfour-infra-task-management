import React, { useState } from 'react';
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
import { UserRole } from '../backend';
import { useUpdateUserRole } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

interface EditUserRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPrincipal: Principal;
  currentRole: UserRole;
  userName: string;
}

export default function EditUserRoleModal({
  open,
  onOpenChange,
  userPrincipal,
  currentRole,
  userName,
}: EditUserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const updateUserRole = useUpdateUserRole();

  const handleSave = async () => {
    try {
      await updateUserRole.mutateAsync({
        user: userPrincipal.toString(),
        newRole: selectedRole,
      });
      toast.success(`Role updated for ${userName}`);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      toast.error(`Failed to update role: ${message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>Role</Label>
          <Select
            value={selectedRole}
            onValueChange={(val) => setSelectedRole(val as UserRole)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRole.admin}>Admin</SelectItem>
              <SelectItem value={UserRole.manager}>Manager</SelectItem>
              <SelectItem value={UserRole.employee}>Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateUserRole.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateUserRole.isPending}>
            {updateUserRole.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
