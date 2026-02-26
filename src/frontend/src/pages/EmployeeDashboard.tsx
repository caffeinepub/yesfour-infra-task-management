import React, { useMemo } from 'react';
import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetTasksForCaller } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import TaskCard from '../components/TaskCard';
import { TaskStatus, ApprovalStatus } from '../backend';

function StatCard({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-card p-4 flex items-center gap-4">
      <div className={`p-3 rounded-full ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const { identity } = useInternetIdentity();
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksForCaller();
  const { data: userProfile } = useGetCallerUserProfile();

  const currentUserPrincipal = identity?.getPrincipal().toString();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => {
      const s = typeof t.status === 'string' ? t.status : Object.keys(t.status)[0];
      return s === TaskStatus.green;
    }).length;
    const overdue = tasks.filter((t) => {
      const s = typeof t.status === 'string' ? t.status : Object.keys(t.status)[0];
      return s === TaskStatus.red;
    }).length;
    const pendingReview = tasks.filter((t) => {
      const a = typeof t.approvalStatus === 'string' ? t.approvalStatus : Object.keys(t.approvalStatus)[0];
      return a === ApprovalStatus.pendingReview;
    }).length;
    return { total, completed, overdue, pendingReview };
  }, [tasks]);

  if (tasksLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Tasks
          {userProfile?.name && (
            <span className="text-gray-500 font-normal text-lg ml-2">— {userProfile.name}</span>
          )}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage your assigned tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5 text-white" />}
          label="Total Tasks"
          value={stats.total}
          colorClass="bg-brand-green"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-white" />}
          label="Completed"
          value={stats.completed}
          colorClass="bg-task-green"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-white" />}
          label="Overdue"
          value={stats.overdue}
          colorClass="bg-task-red"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-white" />}
          label="Pending Review"
          value={stats.pendingReview}
          colorClass="bg-task-blue"
        />
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No tasks assigned yet</p>
          <p className="text-sm">Your tasks will appear here once assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={Number(task.taskId)}
              task={task}
              isAdminView={false}
              currentUserPrincipal={currentUserPrincipal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
