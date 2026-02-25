import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SummaryStatsCards from '../components/SummaryStatsCards';
import LeaderboardTable from '../components/LeaderboardTable';
import GlobalTaskList from '../components/GlobalTaskList';
import UsersListPage from './UsersListPage';
import { useGetAdminDashboard, useGetAllTasks } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';

export default function AdminDashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboard();
  const { data: allTasks, isLoading: tasksLoading } = useGetAllTasks();

  const leaderboard: Array<[Principal, bigint]> =
    dashboardData?.leaderboard.map(([p, pts]) => [p as Principal, pts]) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all tasks and team performance</p>
      </div>

      {/* Summary Stats */}
      {dashboardLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading stats...</span>
        </div>
      ) : dashboardData ? (
        <SummaryStatsCards
          totalTasks={Number(dashboardData.totalTasks)}
          completedTasks={Number(dashboardData.completedTasks)}
          lateTasks={Number(dashboardData.lateTasks)}
        />
      ) : null}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Team Leaderboard</h2>
            <LeaderboardTable leaderboard={leaderboard} />
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <LeaderboardTable leaderboard={leaderboard} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          {tasksLoading ? (
            <div className="flex items-center gap-2 text-gray-400 py-8">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading tasks...</span>
            </div>
          ) : (
            <GlobalTaskList
              tasks={allTasks ?? []}
              isAdminView={true}
              showApprovalActions={false}
            />
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersListPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
