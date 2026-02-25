import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import TaskCreationForm from '../components/TaskCreationForm';
import GlobalTaskList from '../components/GlobalTaskList';
import DepartmentProductivityPanel from '../components/DepartmentProductivityPanel';
import { useGetAllTasks } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { TaskStatus } from '../backend';

function getStatusKey(status: unknown): string {
  if (typeof status === 'string') return status;
  if (typeof status === 'object' && status !== null) return Object.keys(status)[0];
  return String(status);
}

export default function ManagerDashboard() {
  const { identity } = useInternetIdentity();
  const { data: allTasks = [], isLoading } = useGetAllTasks();
  const currentUserPrincipal = identity?.getPrincipal().toString();

  const blueTasks = allTasks.filter(
    (t) => getStatusKey(t.status) === TaskStatus.blue,
  );

  if (isLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Create tasks, review submissions, and track team productivity</p>
      </div>

      <Tabs defaultValue="create">
        <TabsList className="mb-4">
          <TabsTrigger value="create">Create Task</TabsTrigger>
          <TabsTrigger value="review">
            Review Submissions
            {blueTasks.length > 0 && (
              <span className="ml-2 bg-task-blue text-white text-xs rounded-full px-1.5 py-0.5">
                {blueTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <TaskCreationForm />
        </TabsContent>

        <TabsContent value="review">
          {blueTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">No pending submissions</p>
              <p className="text-sm">Tasks submitted for review will appear here</p>
            </div>
          ) : (
            <GlobalTaskList
              tasks={blueTasks}
              isAdminView={true}
              currentUserPrincipal={currentUserPrincipal}
            />
          )}
        </TabsContent>

        <TabsContent value="productivity">
          <DepartmentProductivityPanel tasks={allTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
