import { TaskResponse, TaskStatus } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface DepartmentProductivityPanelProps {
  tasks: TaskResponse[];
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.red]: 'Overdue',
  [TaskStatus.yellow]: 'In Progress',
  [TaskStatus.blue]: 'Under Review',
  [TaskStatus.green]: 'Completed',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.red]: 'bg-task-red',
  [TaskStatus.yellow]: 'bg-task-yellow',
  [TaskStatus.blue]: 'bg-task-blue',
  [TaskStatus.green]: 'bg-task-green',
};

export default function DepartmentProductivityPanel({ tasks }: DepartmentProductivityPanelProps) {
  const statusCounts = tasks.reduce(
    (acc, task) => {
      const statusObj = task.status as unknown as Record<string, null>;
      const key = Object.keys(statusObj)[0] as TaskStatus;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<TaskStatus, number>,
  );

  const totalPoints = tasks.reduce((sum, task) => sum + Number(task.performancePoints), 0);
  const completionRate =
    tasks.length > 0
      ? Math.round(((statusCounts[TaskStatus.green] || 0) / tasks.length) * 100)
      : 0;

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="w-5 h-5 text-brand-green" />
          Department Productivity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status breakdown */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.values(TaskStatus) as TaskStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLORS[status]}`} />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{STATUS_LABELS[status]}</p>
                <p className="text-sm font-bold text-foreground">{statusCounts[status] || 0}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-green">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </div>
          <div className="text-center">
            <p
              className={`text-2xl font-bold ${totalPoints >= 0 ? 'text-task-green' : 'text-task-red'}`}
            >
              {totalPoints >= 0 ? '+' : ''}
              {totalPoints}
            </p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
        </div>

        <div className="text-center pt-1 border-t border-border">
          <p className="text-lg font-bold text-foreground">{tasks.length}</p>
          <p className="text-xs text-muted-foreground">Total Tasks</p>
        </div>
      </CardContent>
    </Card>
  );
}
