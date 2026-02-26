import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Department, TaskPriority } from '../backend';
import { useCreateTask, useGetActiveUsers } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function TaskCreationForm() {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [assigneeDisplay, setAssigneeDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [comboOpen, setComboOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const createTask = useCreateTask();
  const { data: activeUsers = [] } = useGetActiveUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !department || !assigneeEmail || !description.trim() || !deadline || !priority) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const deadlineMs = new Date(deadline).getTime();
    if (isNaN(deadlineMs)) {
      setFormError('Invalid deadline date.');
      return;
    }

    const deadlineNs = BigInt(deadlineMs) * BigInt(1_000_000);

    try {
      await createTask.mutateAsync({
        title: title.trim(),
        department: department as Department,
        assigneeEmail,
        description: description.trim(),
        deadline: deadlineNs,
        priority: priority as TaskPriority,
      });
      toast.success('Task created successfully!');
      setTitle('');
      setDepartment('');
      setAssigneeEmail('');
      setAssigneeDisplay('');
      setDescription('');
      setDeadline('');
      setPriority('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Task creation failed';
      setFormError(message);
      toast.error(`Failed to create task: ${message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-card p-6 space-y-5 max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>

      {formError && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          disabled={createTask.isPending}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Department *</Label>
          <Select
            value={department}
            onValueChange={(v) => setDepartment(v as Department)}
            disabled={createTask.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Department.construction}>Construction</SelectItem>
              <SelectItem value={Department.marketing}>Marketing</SelectItem>
              <SelectItem value={Department.travelDesk}>Travel Desk</SelectItem>
              <SelectItem value={Department.accounts}>Accounts</SelectItem>
              <SelectItem value={Department.apartments}>Apartments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Priority *</Label>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as TaskPriority)}
            disabled={createTask.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TaskPriority.high}>High</SelectItem>
              <SelectItem value={TaskPriority.medium}>Medium</SelectItem>
              <SelectItem value={TaskPriority.low}>Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Assign To *</Label>
        <Popover open={comboOpen} onOpenChange={setComboOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={comboOpen}
              className="w-full justify-between font-normal"
              disabled={createTask.isPending}
              type="button"
            >
              {assigneeDisplay || 'Select employee…'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search employee…" />
              <CommandList>
                <CommandEmpty>No employee found.</CommandEmpty>
                <CommandGroup>
                  {activeUsers.map((user) => (
                    <CommandItem
                      key={user.email}
                      value={`${user.name} ${user.email}`}
                      onSelect={() => {
                        setAssigneeEmail(user.email);
                        setAssigneeDisplay(`${user.name} (${user.email})`);
                        setComboOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          assigneeEmail === user.email ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {user.name} ({user.email})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deadline">Deadline *</Label>
        <Input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          disabled={createTask.isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task…"
          rows={4}
          disabled={createTask.isPending}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
        disabled={createTask.isPending}
      >
        {createTask.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating…
          </>
        ) : (
          'Create Task'
        )}
      </Button>
    </form>
  );
}
