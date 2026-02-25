import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface SummaryStatsCardsProps {
  totalTasks: number;
  completedTasks: number;
  lateTasks: number;
}

export default function SummaryStatsCards({ totalTasks, completedTasks, lateTasks }: SummaryStatsCardsProps) {
  const inProgressTasks = totalTasks - completedTasks - lateTasks;

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: ClipboardList,
      color: 'text-task-blue',
      bg: 'bg-task-blue-bg',
      border: 'border-task-blue/20',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-task-green',
      bg: 'bg-task-green-bg',
      border: 'border-task-green/20',
    },
    {
      label: 'Overdue',
      value: lateTasks,
      icon: AlertTriangle,
      color: 'text-task-red',
      bg: 'bg-task-red-bg',
      border: 'border-task-red/20',
    },
    {
      label: 'In Progress',
      value: Math.max(0, inProgressTasks),
      icon: TrendingUp,
      color: 'text-task-yellow',
      bg: 'bg-task-yellow-bg',
      border: 'border-task-yellow/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`shadow-card border ${stat.border}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
