import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useGetAllUsersStats, useToggleUserAccountStatus } from '../hooks/useQueries';
import { UserRole, AccountStatus } from '../backend';
import UserAccountStatusBadge from '../components/UserAccountStatusBadge';
import UsersSummaryCards from '../components/UsersSummaryCards';
import EditUserRoleModal from '../components/EditUserRoleModal';
import DeleteUserConfirmDialog from '../components/DeleteUserConfirmDialog';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

function getRoleKey(role: unknown): string {
  if (typeof role === 'string') return role;
  if (typeof role === 'object' && role !== null) return Object.keys(role)[0];
  return String(role);
}

function getStatusKey(status: unknown): string {
  if (typeof status === 'string') return status;
  if (typeof status === 'object' && status !== null) return Object.keys(status)[0];
  return String(status);
}

export default function UsersListPage() {
  const { data: usersStats = [], isLoading } = useGetAllUsersStats();
  const toggleStatus = useToggleUserAccountStatus();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserPrincipal, setSelectedUserPrincipal] = useState<Principal | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole>(UserRole.employee);

  const departments = useMemo(() => {
    const depts = new Set(usersStats.map((u) => u.profile.department));
    return Array.from(depts).sort();
  }, [usersStats]);

  const filtered = useMemo(() => {
    return usersStats.filter((u) => {
      const nameMatch = u.profile.name.toLowerCase().includes(search.toLowerCase()) ||
        u.profile.email.toLowerCase().includes(search.toLowerCase());
      const roleKey = getRoleKey(u.profile.role);
      const roleMatch = roleFilter === 'all' || roleKey === roleFilter;
      const deptMatch = deptFilter === 'all' || u.profile.department === deptFilter;
      return nameMatch && roleMatch && deptMatch;
    });
  }, [usersStats, search, roleFilter, deptFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleToggleStatus = async (principalStr: string, currentStatus: unknown) => {
    const statusKey = getStatusKey(currentStatus);
    const newStatus = statusKey === AccountStatus.active ? AccountStatus.inactive : AccountStatus.active;
    try {
      await toggleStatus.mutateAsync({ user: principalStr, status: newStatus });
      toast.success('Account status updated.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      toast.error(`Failed to update status: ${message}`);
    }
  };

  const openEditModal = (principalStr: string, name: string, role: UserRole) => {
    setSelectedUserPrincipal(Principal.fromText(principalStr));
    setSelectedUserName(name);
    setSelectedUserRole(role);
    setEditModalOpen(true);
  };

  const openDeleteDialog = (principalStr: string, name: string) => {
    setSelectedUserPrincipal(Principal.fromText(principalStr));
    setSelectedUserName(name);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UsersSummaryCards usersStats={usersStats} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value={UserRole.admin}>Admin</SelectItem>
            <SelectItem value={UserRole.manager}>Manager</SelectItem>
            <SelectItem value={UserRole.employee}>Employee</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((userStat, idx) => {
                const roleKey = getRoleKey(userStat.profile.role) as UserRole;
                const statusKey = getStatusKey(userStat.profile.accountStatus);
                const principalStr = `user-${idx}`;

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{userStat.profile.name}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{userStat.profile.email}</TableCell>
                    <TableCell className="text-gray-500 capitalize">{userStat.profile.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant={roleKey === UserRole.admin ? 'default' : roleKey === UserRole.manager ? 'secondary' : 'outline'}
                        className="capitalize"
                      >
                        {roleKey}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UserAccountStatusBadge status={userStat.profile.accountStatus} />
                    </TableCell>
                    <TableCell className={`font-medium ${Number(userStat.performancePoints) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {Number(userStat.performancePoints) >= 0 ? '+' : ''}{Number(userStat.performancePoints)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={statusKey === AccountStatus.active ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleStatus(principalStr, userStat.profile.accountStatus)}
                          disabled={toggleStatus.isPending}
                        >
                          {statusKey === AccountStatus.active
                            ? <ToggleRight className="w-4 h-4 text-green-600" />
                            : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Role"
                          onClick={() => openEditModal(principalStr, userStat.profile.name, roleKey)}
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete User"
                          onClick={() => openDeleteDialog(principalStr, userStat.profile.name)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUserPrincipal && (
        <>
          <EditUserRoleModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            userPrincipal={selectedUserPrincipal}
            currentRole={selectedUserRole}
            userName={selectedUserName}
          />
          <DeleteUserConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            userPrincipal={selectedUserPrincipal}
            userName={selectedUserName}
          />
        </>
      )}
    </div>
  );
}
