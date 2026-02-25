import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useGetTasksForCaller } from '../hooks/useQueries';
import { TaskStatus } from '../backend';
import TaskCreationForm from '../components/TaskCreationForm';
import DepartmentProductivityPanel from '../components/DepartmentProductivityPanel';
import GlobalTaskList from '../components/GlobalTaskList';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, ClipboardCheck, BarChart3 } from 'lucide-react';

export default function ManagerDashboard() {
  const { isAuthenticated, userProfile, showProfileSetup, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const { data: tasks, isLoading } = useGetTasksForCaller();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    if (showProfileSetup) {
      navigate({ to: '/profile-setup' });
    }
  }, [isAuthenticated, showProfileSetup, navigate]);

  // Filter tasks by manager's department if they are a manager (not admin)
  const departmentTasks = tasks ?? [];
  const pendingApprovalTasks = departmentTasks.filter((t) => t.status === TaskStatus.blue);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {userProfile?.name && <span className="font-semibold text-foreground">{userProfile.name}</span>}
          {userProfile?.department && <span> · {userProfile.department}</span>}
          {isAdmin && <span className="ml-2 text-xs bg-task-red-bg text-task-red px-2 py-0.5 rounded-full font-medium">Admin</span>}
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="create" className="flex items-center gap-1.5 text-xs">
            <PlusCircle className="w-3.5 h-3.5" />
            Create Task
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-1.5 text-xs">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Review Tasks
            {pendingApprovalTasks.length > 0 && (
              <span className="ml-1 bg-task-blue text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {pendingApprovalTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex items-center gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" />
            Productivity
          </TabsTrigger>
        </TabsList>

        {/* Create Task Tab */}
        <TabsContent value="create" className="space-y-0">
          <TaskCreationForm />
        </TabsContent>

        {/* Review Tasks Tab */}
        <TabsContent value="review" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">Tasks Awaiting Review</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Tasks with uploaded proof are shown below. Approve or reject each submission.
            </p>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
              </div>
            ) : (
              <GlobalTaskList tasks={departmentTasks} showApprovalActions={true} />
            )}
          </div>
        </TabsContent>

        {/* Productivity Tab */}
        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <DepartmentProductivityPanel tasks={departmentTasks} />
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-base font-semibold text-foreground mb-3">All Department Tasks</h2>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
                </div>
              ) : (
                <GlobalTaskList tasks={departmentTasks} showApprovalActions={false} />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
