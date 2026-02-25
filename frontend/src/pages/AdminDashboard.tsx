import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import SummaryStatsCards from '../components/SummaryStatsCards';
import LeaderboardTable from '../components/LeaderboardTable';
import GlobalTaskList from '../components/GlobalTaskList';
import { useGetAdminDashboard, useGetAllTasks } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import UsersListPage from './UsersListPage';

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { data: dashboard, isLoading: dashboardLoading } = useGetAdminDashboard();
  const { data: allTasks = [], isLoading: tasksLoading } = useGetAllTasks();

  const currentUserPrincipal = identity?.getPrincipal().toString();

  if (dashboardLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalTasks = Number(dashboard?.totalTasks ?? 0);
  const completedTasks = Number(dashboard?.completedTasks ?? 0);
  const lateTasks = Number(dashboard?.lateTasks ?? 0);
  const leaderboard = dashboard?.leaderboard ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all tasks and team performance</p>
      </div>

      <SummaryStatsCards
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        lateTasks={lateTasks}
        allTasks={allTasks}
      />

      <Tabs defaultValue="tasks">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <GlobalTaskList
              tasks={allTasks}
              isAdminView={true}
              currentUserPrincipal={currentUserPrincipal}
            />
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardTable leaderboard={leaderboard} />
        </TabsContent>

        <TabsContent value="users">
          <UsersListPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
