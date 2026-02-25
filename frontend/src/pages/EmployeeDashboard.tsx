import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useGetTasksForCaller } from '../hooks/useQueries';
import { TaskStatus } from '../backend';
import TaskCard from '../components/TaskCard';
import ProofUploadButton from '../components/ProofUploadButton';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function EmployeeDashboard() {
  const { isAuthenticated, userProfile, profileLoading, isFetched, showProfileSetup } = useAuth();
  const navigate = useNavigate();
  const { data: tasks, isLoading, error } = useGetTasksForCaller();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    if (showProfileSetup) {
      navigate({ to: '/profile-setup' });
    }
  }, [isAuthenticated, showProfileSetup, navigate]);

  const taskCounts = {
    total: tasks?.length ?? 0,
    completed: tasks?.filter((t) => t.status === TaskStatus.green).length ?? 0,
    overdue: tasks?.filter((t) => t.status === TaskStatus.red).length ?? 0,
    pending: tasks?.filter((t) => t.status === TaskStatus.yellow || t.status === TaskStatus.blue).length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Tasks
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, <span className="font-semibold text-foreground">{userProfile?.name ?? '...'}</span>
            {userProfile?.department && <span> · {userProfile.department}</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Performance Points</p>
          <p className={`text-2xl font-bold ${Number(userProfile?.performancePoints ?? 0) >= 0 ? 'text-task-green' : 'text-task-red'}`}>
            {Number(userProfile?.performancePoints ?? 0) >= 0 ? '+' : ''}{Number(userProfile?.performancePoints ?? 0)}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: taskCounts.total, icon: ClipboardList, color: 'text-task-blue', bg: 'bg-task-blue-bg' },
          { label: 'Completed', value: taskCounts.completed, icon: CheckCircle, color: 'text-task-green', bg: 'bg-task-green-bg' },
          { label: 'In Progress', value: taskCounts.pending, icon: Clock, color: 'text-task-yellow', bg: 'bg-task-yellow-bg' },
          { label: 'Overdue', value: taskCounts.overdue, icon: AlertTriangle, color: 'text-task-red', bg: 'bg-task-red-bg' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`flex items-center gap-3 p-3 rounded-lg border border-border ${stat.bg}`}>
              <Icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
              <div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task List */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Assigned Tasks</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-task-red">
            <p className="text-sm">Failed to load tasks. Please refresh the page.</p>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No tasks assigned yet</p>
            <p className="text-xs mt-1">Your manager will assign tasks to you soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.taskId.toString()}
                task={task}
                actions={
                  (task.status === TaskStatus.yellow || task.status === TaskStatus.red) ? (
                    <ProofUploadButton taskId={task.taskId} />
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
