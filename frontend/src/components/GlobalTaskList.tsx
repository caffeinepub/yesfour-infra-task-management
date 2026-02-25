import { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, Department } from '../backend';
import TaskCard from './TaskCard';
import TaskApprovalActions from './TaskApprovalActions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface GlobalTaskListProps {
  tasks: Task[];
  showApprovalActions?: boolean;
}

const DEPT_OPTIONS: { value: Department | 'all'; label: string }[] = [
  { value: 'all', label: 'All Departments' },
  { value: Department.construction, label: 'Construction' },
  { value: Department.marketing, label: 'Marketing' },
  { value: Department.travelDesk, label: 'Travel Desk' },
  { value: Department.accounts, label: 'Accounts' },
  { value: Department.apartments, label: 'Apartments' },
];

const STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: TaskStatus.yellow, label: 'In Progress' },
  { value: TaskStatus.blue, label: 'Proof Uploaded' },
  { value: TaskStatus.green, label: 'Completed' },
  { value: TaskStatus.red, label: 'Overdue' },
];

const PRIORITY_OPTIONS: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: TaskPriority.high, label: 'High' },
  { value: TaskPriority.medium, label: 'Medium' },
  { value: TaskPriority.low, label: 'Low' },
];

export default function GlobalTaskList({ tasks, showApprovalActions = false }: GlobalTaskListProps) {
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (deptFilter !== 'all' && task.department !== deptFilter) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, deptFilter, statusFilter, priorityFilter]);

  const hasFilters = deptFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all';

  const clearFilters = () => {
    setDeptFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-muted/30 rounded-lg border border-border">
        <Filter className="w-4 h-4 text-muted-foreground mt-auto mb-2" />
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Department</Label>
          <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v as Department | 'all')}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Priority</Label>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-muted-foreground">
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground self-end mb-1.5">
          {filteredTasks.length} of {tasks.length} tasks
        </span>
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No tasks match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.taskId.toString()}
              task={task}
              actions={showApprovalActions ? <TaskApprovalActions task={task} /> : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
