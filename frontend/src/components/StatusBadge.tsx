import { TaskStatus } from '../backend';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  [TaskStatus.red]: { label: 'Overdue', className: 'status-red' },
  [TaskStatus.yellow]: { label: 'In Progress', className: 'status-yellow' },
  [TaskStatus.blue]: { label: 'Proof Uploaded', className: 'status-blue' },
  [TaskStatus.green]: { label: 'Completed', className: 'status-green' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'status-yellow' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5" />
      {config.label}
    </span>
  );
}
