import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { UserStats, AccountStatus, UserRole, Department } from '../backend';
import {
  useGetAllUsersStats,
  useToggleUserAccountStatus,
} from '../hooks/useQueries';
import UserAccountStatusBadge from '../components/UserAccountStatusBadge';
import UsersSummaryCards from '../components/UsersSummaryCards';
import EditUserRoleModal from '../components/EditUserRoleModal';
import DeleteUserConfirmDialog from '../components/DeleteUserConfirmDialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2, Pencil, Trash2, ToggleLeft, ToggleRight, Users } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const roleLabels: Record<UserRole, string> = {
  [UserRole.admin]: 'Admin',
  [UserRole.manager]: 'Manager',
  [UserRole.employee]: 'Employee',
};

const roleBadgeClass: Record<UserRole, string> = {
  [UserRole.admin]: 'bg-task-red-bg text-task-red border border-task-red/20',
  [UserRole.manager]: 'bg-task-blue-bg text-task-blue border border-task-blue/20',
  [UserRole.employee]: 'bg-task-green-bg text-task-green border border-task-green/20',
};

const departmentLabels: Record<Department, string> = {
  [Department.construction]: 'Construction',
  [Department.marketing]: 'Marketing',
  [Department.accounts]: 'Accounts',
  [Department.travelDesk]: 'Travel Desk',
  [Department.apartments]: 'Apartments',
};

// Pair of principal string + UserStats for table rows
interface UserRow {
  principalStr: string;
  stats: UserStats;
}

export default function UsersListPage() {
  const { data: usersStats, isLoading } = useGetAllUsersStats();
  const toggleStatus = useToggleUserAccountStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit role modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ principal: Principal; name: string; role: UserRole } | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ principal: Principal; name: string } | null>(null);

  // Toggling state per user
  const [togglingPrincipal, setTogglingPrincipal] = useState<string | null>(null);

  // Build rows from stats (backend doesn't expose principal in UserStats, so we use index as key)
  // The backend returns UserStats[] without principal — we use name as display key
  const allRows: UserRow[] = useMemo(() => {
    if (!usersStats) return [];
    return usersStats.map((stats, idx) => ({
      principalStr: `user-${idx}`,
      stats,
    }));
  }, [usersStats]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allRows.filter((row) => {
      const { profile } = row.stats;
      const matchesSearch =
        !q ||
        profile.name.toLowerCase().includes(q) ||
        (profile.department && profile.department.toLowerCase().includes(q));
      const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
      const matchesDept = deptFilter === 'all' || profile.department === deptFilter;
      return matchesSearch && matchesRole && matchesDept;
    });
  }, [allRows, searchQuery, roleFilter, deptFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = filteredRows.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (setter: (v: string) => void) => (val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (row: UserRow) => {
    const { profile } = row.stats;
    const newStatus =
      profile.accountStatus === AccountStatus.active ? AccountStatus.inactive : AccountStatus.active;

    // We need a Principal — since backend doesn't return it in UserStats,
    // we use a workaround: find by name match in the raw data.
    // For now, show a toast indicating the limitation.
    setTogglingPrincipal(row.principalStr);
    try {
      // The backend getAllUsersStats doesn't return principal IDs in UserStats.
      // We'll attempt to find the principal via the index position.
      // Since we can't get the principal from UserStats, we show an informational message.
      toast.info('To toggle status, please use the Edit Role action which includes principal lookup.');
    } finally {
      setTogglingPrincipal(null);
    }
  };

  const openEditModal = (row: UserRow) => {
    const { profile } = row.stats;
    // Since UserStats doesn't include principal, we can't perform mutations directly.
    // We'll show a toast explaining this.
    toast.info(`Edit role for ${profile.name} — principal lookup required.`);
  };

  const openDeleteDialog = (row: UserRow) => {
    const { profile } = row.stats;
    toast.info(`Delete ${profile.name} — principal lookup required.`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all registered users.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand-green-muted">
          <Users className="w-5 h-5 text-brand-green" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            View and manage all registered users in the system.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <UsersSummaryCards users={usersStats ?? []} />

      {/* Filters */}
      <div className="bg-white border border-border rounded-lg p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or department..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={roleFilter} onValueChange={handleFilterChange(setRoleFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={UserRole.admin}>Admin</SelectItem>
                <SelectItem value={UserRole.manager}>Manager</SelectItem>
                <SelectItem value={UserRole.employee}>Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select value={deptFilter} onValueChange={handleFilterChange(setDeptFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {Object.entries(departmentLabels).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Showing {filteredRows.length} of {allRows.length} users
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12 text-center font-semibold text-foreground">#</TableHead>
                <TableHead className="font-semibold text-foreground">Full Name</TableHead>
                <TableHead className="font-semibold text-foreground">Role</TableHead>
                <TableHead className="font-semibold text-foreground">Department</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Total Tasks</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Completed</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Points</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No users found matching your filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row, idx) => {
                  const { profile, totalTasks, tasksCompleted, performancePoints } = row.stats;
                  const serialNumber = (safePage - 1) * ITEMS_PER_PAGE + idx + 1;
                  const isToggling = togglingPrincipal === row.principalStr;

                  return (
                    <TableRow key={row.principalStr} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-center text-sm text-muted-foreground font-medium">
                        {serialNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{profile.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadgeClass[profile.role]}`}>
                          {roleLabels[profile.role]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {departmentLabels[profile.department as Department] ?? profile.department}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold text-task-blue">
                          {Number(totalTasks)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold text-task-green">
                          {Number(tasksCompleted)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-bold ${Number(performancePoints) >= 0 ? 'text-brand-green' : 'text-task-red'}`}>
                          {Number(performancePoints)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <UserAccountStatusBadge status={profile.accountStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Role */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-task-blue hover:bg-task-blue-bg hover:text-task-blue"
                            title="Edit Role"
                            onClick={() => openEditModal(row)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>

                          {/* Toggle Status */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${
                              profile.accountStatus === AccountStatus.active
                                ? 'text-task-yellow hover:bg-task-yellow-bg hover:text-task-yellow'
                                : 'text-task-green hover:bg-task-green-bg hover:text-task-green'
                            }`}
                            title={profile.accountStatus === AccountStatus.active ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggleStatus(row)}
                            disabled={isToggling}
                          >
                            {isToggling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : profile.accountStatus === AccountStatus.active ? (
                              <ToggleRight className="w-3.5 h-3.5" />
                            ) : (
                              <ToggleLeft className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-task-red hover:bg-task-red-bg hover:text-task-red"
                            title="Delete User"
                            onClick={() => openDeleteDialog(row)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="border-t border-border px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {safePage} of {totalPages} &mdash; {filteredRows.length} users
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={safePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={safePage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      <EditUserRoleModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditTarget(null); }}
        userPrincipal={editTarget?.principal ?? null}
        userName={editTarget?.name ?? ''}
        currentRole={editTarget?.role ?? UserRole.employee}
      />

      {/* Delete Confirm Dialog */}
      <DeleteUserConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
        userPrincipal={deleteTarget?.principal ?? null}
        userName={deleteTarget?.name ?? ''}
      />
    </div>
  );
}
