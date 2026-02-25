import React, { useState } from 'react';
import { TaskResponse, Department, TaskStatus, TaskPriority, ApprovalStatus } from '../backend';
import TaskCard from './TaskCard';
import TaskApprovalActions from './TaskApprovalActions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface GlobalTaskListProps {
  tasks: TaskResponse[];
  isAdminView?: boolean;
  showApprovalActions?: boolean;
}

const departmentOptions = [
  { value: 'all', label: 'All Departments' },
  { value: 'construction', label: 'Construction' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'travelDesk', label: 'Travel Desk' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'apartments', label: 'Apartments' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'red', label: 'Overdue' },
  { value: 'yellow', label: 'In Progress' },
  { value: 'blue', label: 'Under Review' },
  { value: 'green', label: 'Completed' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function GlobalTaskList({
  tasks,
  isAdminView = false,
  showApprovalActions = false,
}: GlobalTaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = tasks.filter((task) => {
    const dept = task.department as unknown as Record<string, null>;
    const deptKey = Object.keys(dept)[0] || '';

    const status = task.status as unknown as Record<string, null>;
    const statusKey = Object.keys(status)[0] || '';

    const priority = task.priority as unknown as Record<string, null>;
    const priorityKey = Object.keys(priority)[0] || '';

    const matchesDept = departmentFilter === 'all' || deptKey === departmentFilter;
    const matchesStatus = statusFilter === 'all' || statusKey === statusFilter;
    const matchesPriority = priorityFilter === 'all' || priorityKey === priorityFilter;
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departmentOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{filtered.length}</span> of{' '}
        <span className="font-medium text-gray-700">{tasks.length}</span> tasks
      </p>

      {/* Task Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No tasks match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => {
            const taskStatus = task.status as unknown as Record<string, null>;
            const statusKey = Object.keys(taskStatus)[0] || '';
            const isBlue = statusKey === 'blue';

            return (
              <TaskCard
                key={Number(task.taskId)}
                task={task}
                isAdminView={isAdminView}
                actionSlot={
                  showApprovalActions && isBlue ? (
                    <TaskApprovalActions task={task} />
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
