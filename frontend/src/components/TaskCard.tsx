import { Task, TaskPriority, ApprovalStatus } from '../backend';
import StatusBadge from './StatusBadge';
import { useCountdown } from '../hooks/useCountdown';
import { Clock, AlertTriangle, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface TaskCardProps {
  task: Task;
  actions?: ReactNode;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  [TaskPriority.high]: { label: 'High', className: 'text-task-red bg-task-red-bg border-task-red/20' },
  [TaskPriority.medium]: { label: 'Medium', className: 'text-task-yellow bg-task-yellow-bg border-task-yellow/20' },
  [TaskPriority.low]: { label: 'Low', className: 'text-task-green bg-task-green-bg border-task-green/20' },
};

const APPROVAL_CONFIG: Record<ApprovalStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  [ApprovalStatus.pending]: { label: 'Pending Review', icon: Clock, className: 'text-muted-foreground' },
  [ApprovalStatus.approved]: { label: 'Approved', icon: CheckCircle, className: 'text-task-green' },
  [ApprovalStatus.rejected]: { label: 'Rejected', icon: XCircle, className: 'text-task-red' },
};

const DEPT_LABELS: Record<string, string> = {
  construction: 'Construction',
  marketing: 'Marketing',
  travelDesk: 'Travel Desk',
  accounts: 'Accounts',
  apartments: 'Apartments',
};

function CountdownDisplay({ deadline }: { deadline: bigint }) {
  const { formatted, isExpired, isUrgent } = useCountdown(deadline);
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${
      isExpired ? 'text-task-red' : isUrgent ? 'text-task-yellow' : 'text-muted-foreground'
    }`}>
      {isExpired ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {formatted}
    </span>
  );
}

export default function TaskCard({ task, actions }: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const approvalConfig = APPROVAL_CONFIG[task.approvalStatus];
  const ApprovalIcon = approvalConfig.icon;
  const deadlineDate = new Date(Number(task.deadline) / 1_000_000);

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{task.title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{DEPT_LABELS[task.department] ?? task.department}</span>
            </div>
          </div>
          <StatusBadge status={task.status} size="sm" />
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${priorityConfig.className}`}>
            {priorityConfig.label} Priority
          </span>
          <span className={`flex items-center gap-1 text-xs ${approvalConfig.className}`}>
            <ApprovalIcon className="w-3 h-3" />
            {approvalConfig.label}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              Due: {deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <CountdownDisplay deadline={task.deadline} />
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {task.rejectionReason && (
          <div className="mt-2 p-2 bg-task-red-bg rounded text-xs text-task-red border border-task-red/20">
            <span className="font-semibold">Rejection reason: </span>{task.rejectionReason}
          </div>
        )}

        {task.performancePoints !== BigInt(0) && task.status === 'green' && (
          <div className={`mt-2 text-xs font-medium ${Number(task.performancePoints) > 0 ? 'text-task-green' : 'text-task-red'}`}>
            Points: {Number(task.performancePoints) > 0 ? '+' : ''}{Number(task.performancePoints)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
