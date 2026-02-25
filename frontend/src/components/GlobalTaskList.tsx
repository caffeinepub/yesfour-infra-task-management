import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TaskCard from './TaskCard';
import { TaskResponse, TaskStatus, Department } from '../backend';

interface GlobalTaskListProps {
  tasks: TaskResponse[];
  isAdminView?: boolean;
  currentUserPrincipal?: string;
  submittedByName?: string;
  submittedByEmail?: string;
}

const departmentOptions = [
  { value: 'all', label: 'All Departments' },
  { value: Department.construction, label: 'Construction' },
  { value: Department.marketing, label: 'Marketing' },
  { value: Department.travelDesk, label: 'Travel Desk' },
  { value: Department.accounts, label: 'Accounts' },
  { value: Department.apartments, label: 'Apartments' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: TaskStatus.red, label: 'Overdue' },
  { value: TaskStatus.yellow, label: 'In Progress' },
  { value: TaskStatus.blue, label: 'Pending Review' },
  { value: TaskStatus.green, label: 'Completed' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

function getEnumKey(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return Object.keys(val)[0];
  return String(val);
}

export default function GlobalTaskList({
  tasks,
  isAdminView = false,
  currentUserPrincipal,
  submittedByName,
  submittedByEmail,
}: GlobalTaskListProps) {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(search.toLowerCase());
      const deptKey = getEnumKey(task.department);
      const statusKey = getEnumKey(task.status);
      const priorityKey = getEnumKey(task.priority);

      const deptMatch = departmentFilter === 'all' || deptKey === departmentFilter;
      const statusMatch = statusFilter === 'all' || statusKey === statusFilter;
      const priorityMatch = priorityFilter === 'all' || priorityKey === priorityFilter;

      return titleMatch && deptMatch && statusMatch && priorityMatch;
    });
  }, [tasks, search, departmentFilter, statusFilter, priorityFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Filter className="w-4 h-4" />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Department" />
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
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
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
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
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

      {/* Task Count */}
      <p className="text-sm text-gray-500">
        {filtered.length} task{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Task Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={Number(task.taskId)}
              task={task}
              isAdminView={isAdminView}
              currentUserPrincipal={currentUserPrincipal}
              submittedByName={submittedByName}
              submittedByEmail={submittedByEmail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
