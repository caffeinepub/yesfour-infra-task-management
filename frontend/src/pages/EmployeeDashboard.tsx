import React from 'react';
import { useGetTasksForCaller } from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';
import TaskCard from '../components/TaskCard';
import ProofUploadButton from '../components/ProofUploadButton';
import { TaskStatus } from '../backend';
import { Loader2, CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';

export default function EmployeeDashboard() {
  const { userProfile, identity } = useAuth();
  const { data: tasks, isLoading } = useGetTasksForCaller();

  const currentUserPrincipal = identity?.getPrincipal().toString();

  const totalTasks = tasks?.length ?? 0;
  const completedTasks =
    tasks?.filter((t) => {
      const s = t.status as unknown as Record<string, null>;
      return Object.keys(s)[0] === 'green';
    }).length ?? 0;
  const overdueTasks =
    tasks?.filter((t) => {
      const s = t.status as unknown as Record<string, null>;
      return Object.keys(s)[0] === 'red';
    }).length ?? 0;
  const inProgressTasks =
    tasks?.filter((t) => {
      const s = t.status as unknown as Record<string, null>;
      const key = Object.keys(s)[0];
      return key === 'yellow' || key === 'blue';
    }).length ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {userProfile?.name ?? 'Employee'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {userProfile?.department} · {userProfile?.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<ListTodo className="w-5 h-5 text-brand-green" />}
          label="Total Tasks"
          value={totalTasks}
          color="green"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-task-green" />}
          label="Completed"
          value={completedTasks}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-task-red" />}
          label="Overdue"
          value={overdueTasks}
          color="red"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-task-yellow" />}
          label="In Progress"
          value={inProgressTasks}
          color="yellow"
        />
      </div>

      {/* Performance Points */}
      {userProfile && Number(userProfile.performancePoints) !== 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-sm font-medium text-green-800">Performance Points</p>
            <p className="text-xl font-bold text-brand-green">
              {Number(userProfile.performancePoints) > 0 ? '+' : ''}
              {Number(userProfile.performancePoints)} pts
            </p>
          </div>
        </div>
      )}

      {/* Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Tasks</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400 py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading your tasks...</span>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tasks.map((task) => {
              const statusObj = task.status as unknown as Record<string, null>;
              const statusKey = Object.keys(statusObj)[0] || '';
              const canUpload = statusKey === 'yellow' || statusKey === 'red';

              return (
                <TaskCard
                  key={Number(task.taskId)}
                  task={task}
                  currentUserPrincipal={currentUserPrincipal}
                  isAdminView={false}
                  actionSlot={
                    canUpload ? (
                      <ProofUploadButton
                        taskId={task.taskId}
                        submittedByName={userProfile?.name ?? ''}
                        submittedByEmail={userProfile?.email ?? ''}
                      />
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'green' | 'red' | 'yellow';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClass = {
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  }[color];

  return (
    <div className={`rounded-lg border p-4 ${colorClass}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
