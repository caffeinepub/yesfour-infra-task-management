import { useState, useRef, useEffect } from 'react';
import { useCreateTask, useGetActiveUsers } from '../hooks/useQueries';
import { Department, TaskPriority, UserSummary } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, ChevronDown, Check, Search } from 'lucide-react';
import { toast } from 'sonner';

const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: Department.construction, label: 'Construction' },
  { value: Department.marketing, label: 'Marketing' },
  { value: Department.travelDesk, label: 'Travel Desk' },
  { value: Department.accounts, label: 'Accounts' },
  { value: Department.apartments, label: 'Apartments' },
];

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: TaskPriority.high, label: 'High', color: 'text-task-red' },
  { value: TaskPriority.medium, label: 'Medium', color: 'text-task-yellow' },
  { value: TaskPriority.low, label: 'Low', color: 'text-task-green' },
];

interface FormState {
  title: string;
  department: Department | '';
  assigneeEmail: string;
  description: string;
  deadline: string;
  priority: TaskPriority;
}

const INITIAL_FORM: FormState = {
  title: '',
  department: '',
  assigneeEmail: '',
  description: '',
  deadline: '',
  priority: TaskPriority.medium,
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface UserComboboxProps {
  users: UserSummary[];
  isLoading: boolean;
  value: string;
  onChange: (email: string) => void;
  error?: string;
}

function UserCombobox({ users, isLoading, value, onChange, error }: UserComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find the selected user to display their label
  const selectedUser = users.find((u) => u.email === value);
  const displayValue = selectedUser ? `${selectedUser.name} (${selectedUser.email})` : '';

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (user: UserSummary) => {
    onChange(user.email);
    setOpen(false);
    setSearch('');
  };

  const handleTriggerClick = () => {
    setOpen((prev) => !prev);
    if (!open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`flex h-9 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-brand-green ${
          error ? 'border-task-red' : 'border-border hover:border-brand-green'
        }`}
      >
        <span className={`truncate ${displayValue ? 'text-foreground' : 'text-muted-foreground'}`}>
          {isLoading
            ? 'Loading users...'
            : displayValue || 'Enter employee login email (e.g. employee@yesfour.com)'}
        </span>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-xs px-1"
              aria-label="Clear selection"
            >
              ✕
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-white shadow-lg">
          {/* Search input */}
          <div className="flex items-center border-b border-border px-3 py-2 gap-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or department..."
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {isLoading ? (
              <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading active users...
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {search ? 'No users match your search.' : 'No active users found.'}
              </li>
            ) : (
              filtered.map((user) => (
                <li
                  key={user.principal.toString()}
                  onClick={() => handleSelect(user)}
                  className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-brand-green/10 hover:text-brand-green transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{user.name} ({user.email})</span>
                    <span className="text-xs text-muted-foreground truncate">{user.department}</span>
                  </div>
                  {value === user.email && (
                    <Check className="w-4 h-4 text-brand-green shrink-0 ml-2" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function TaskCreationForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const createTask = useCreateTask();
  const { data: activeUsers = [], isLoading: usersLoading } = useGetActiveUsers();

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.assigneeEmail.trim()) {
      newErrors.assigneeEmail = 'Assignee email is required';
    } else if (!isValidEmail(form.assigneeEmail.trim())) {
      newErrors.assigneeEmail = 'Please enter a valid email address';
    }
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.deadline) newErrors.deadline = 'Deadline is required';
    else if (new Date(form.deadline) <= new Date()) newErrors.deadline = 'Deadline must be in the future';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const deadlineMs = new Date(form.deadline).getTime();
      const deadlineNs = BigInt(deadlineMs) * BigInt(1_000_000);

      await createTask.mutateAsync({
        title: form.title.trim(),
        department: form.department as Department,
        assigneeEmail: form.assigneeEmail.trim(),
        description: form.description.trim(),
        deadline: deadlineNs,
        priority: form.priority,
      });

      toast.success('Task created and assigned successfully!');
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create task';
      if (msg.includes('does not exist')) {
        setErrors((prev) => ({ ...prev, assigneeEmail: 'User with this email does not exist.' }));
      } else if (msg.includes('not active')) {
        setErrors((prev) => ({ ...prev, assigneeEmail: 'This user account is not active.' }));
      } else if (msg.includes('Unauthorized')) {
        toast.error('You do not have permission to create tasks.');
      } else {
        toast.error('Failed to create task. Please try again.');
      }
    }
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <PlusCircle className="w-5 h-5 text-brand-green" />
          Create New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Task Title <span className="text-task-red">*</span></Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className={errors.title ? 'border-task-red' : ''}
              />
              {errors.title && <p className="text-xs text-task-red">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Department <span className="text-task-red">*</span></Label>
              <Select value={form.department} onValueChange={(v) => setField('department', v as Department)}>
                <SelectTrigger className={errors.department ? 'border-task-red' : ''}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-xs text-task-red">{errors.department}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assigned-to">
              Assign To (Login Email ID) <span className="text-task-red">*</span>
            </Label>
            <UserCombobox
              users={activeUsers}
              isLoading={usersLoading}
              value={form.assigneeEmail}
              onChange={(email) => setField('assigneeEmail', email)}
              error={errors.assigneeEmail}
            />
            {errors.assigneeEmail && (
              <p className="text-xs text-task-red">{errors.assigneeEmail}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description <span className="text-task-red">*</span></Label>
            <Textarea
              id="description"
              placeholder="Describe the task requirements..."
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              className={errors.description ? 'border-task-red' : ''}
            />
            {errors.description && <p className="text-xs text-task-red">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline <span className="text-task-red">*</span></Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setField('deadline', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className={errors.deadline ? 'border-task-red' : ''}
              />
              {errors.deadline && <p className="text-xs text-task-red">{errors.deadline}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <RadioGroup
                value={form.priority}
                onValueChange={(v) => setField('priority', v as TaskPriority)}
                className="flex gap-4 pt-1"
              >
                {PRIORITIES.map((p) => (
                  <div key={p.value} className="flex items-center gap-1.5">
                    <RadioGroupItem value={p.value} id={`priority-${p.value}`} />
                    <Label htmlFor={`priority-${p.value}`} className={`text-sm cursor-pointer ${p.color}`}>
                      {p.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createTask.isPending}
            className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold"
          >
            {createTask.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Task...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create & Assign Task
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
