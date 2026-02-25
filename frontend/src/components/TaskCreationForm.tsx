import { useState } from 'react';
import { useCreateTask } from '../hooks/useQueries';
import { Department, TaskPriority } from '../backend';
import { Principal } from '@dfinity/principal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
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
  assignedTo: string;
  description: string;
  deadline: string;
  priority: TaskPriority;
}

const INITIAL_FORM: FormState = {
  title: '',
  department: '',
  assignedTo: '',
  description: '',
  deadline: '',
  priority: TaskPriority.medium,
};

export default function TaskCreationForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const createTask = useCreateTask();

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.assignedTo.trim()) newErrors.assignedTo = 'Assigned user principal is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.deadline) newErrors.deadline = 'Deadline is required';
    else if (new Date(form.deadline) <= new Date()) newErrors.deadline = 'Deadline must be in the future';

    // Validate principal
    if (form.assignedTo.trim()) {
      try {
        Principal.fromText(form.assignedTo.trim());
      } catch {
        newErrors.assignedTo = 'Invalid principal ID format';
      }
    }

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
        assignedTo: Principal.fromText(form.assignedTo.trim()),
        description: form.description.trim(),
        deadline: deadlineNs,
        priority: form.priority,
      });

      toast.success('Task created and assigned successfully!');
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(msg.includes('Unauthorized') ? 'You do not have permission to create tasks.' : 'Failed to create task. Please try again.');
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
            <Label htmlFor="assigned-to">Assign To (Principal ID) <span className="text-task-red">*</span></Label>
            <Input
              id="assigned-to"
              placeholder="e.g. aaaaa-aa or user principal ID"
              value={form.assignedTo}
              onChange={(e) => setField('assignedTo', e.target.value)}
              className={`font-mono text-xs ${errors.assignedTo ? 'border-task-red' : ''}`}
            />
            {errors.assignedTo && <p className="text-xs text-task-red">{errors.assignedTo}</p>}
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
