import React from 'react';
import { CheckCircle, AlertTriangle, ListTodo, Clock } from 'lucide-react';
import { TaskResponse, TaskStatus } from '../backend';

interface SummaryStatsCardsProps {
  totalTasks: number;
  completedTasks: number;
  lateTasks: number;
  allTasks: TaskResponse[];
}

function StatCard({
  icon,
  label,
  value,
  colorClass,
  bgClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-full ${bgClass}`}>{icon}</div>
      <div>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function SummaryStatsCards({
  totalTasks,
  completedTasks,
  lateTasks,
  allTasks,
}: SummaryStatsCardsProps) {
  const inProgressTasks = allTasks.filter((t) => {
    const s = typeof t.status === 'string' ? t.status : Object.keys(t.status)[0];
    return s === TaskStatus.yellow || s === TaskStatus.blue;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<ListTodo className="w-6 h-6 text-white" />}
        label="Total Tasks"
        value={totalTasks}
        colorClass="text-brand-green"
        bgClass="bg-brand-green"
      />
      <StatCard
        icon={<CheckCircle className="w-6 h-6 text-white" />}
        label="Completed"
        value={completedTasks}
        colorClass="text-task-green"
        bgClass="bg-task-green"
      />
      <StatCard
        icon={<AlertTriangle className="w-6 h-6 text-white" />}
        label="Overdue"
        value={lateTasks}
        colorClass="text-task-red"
        bgClass="bg-task-red"
      />
      <StatCard
        icon={<Clock className="w-6 h-6 text-white" />}
        label="In Progress"
        value={inProgressTasks}
        colorClass="text-task-yellow"
        bgClass="bg-task-yellow"
      />
    </div>
  );
}
