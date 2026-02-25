import { AccountStatus } from '../backend';

interface UserAccountStatusBadgeProps {
  status: AccountStatus;
}

export default function UserAccountStatusBadge({ status }: UserAccountStatusBadgeProps) {
  const isActive = status === AccountStatus.active;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isActive
          ? 'bg-task-green-bg text-task-green border border-task-green/20'
          : 'bg-muted text-muted-foreground border border-border'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-task-green' : 'bg-muted-foreground'}`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
