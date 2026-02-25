import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useAdminDashboard } from '../hooks/useQueries';
import { useGetTasksForCaller } from '../hooks/useQueries';
import SummaryStatsCards from '../components/SummaryStatsCards';
import LeaderboardTable from '../components/LeaderboardTable';
import GlobalTaskList from '../components/GlobalTaskList';
import UsersListPage from './UsersListPage';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Trophy, ClipboardList, Users } from 'lucide-react';
import { Principal } from '@dfinity/principal';

export default function AdminDashboard() {
  const { isAuthenticated, showProfileSetup, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading: dashboardLoading } = useAdminDashboard();
  const { data: tasks, isLoading: tasksLoading } = useGetTasksForCaller();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    if (showProfileSetup) {
      navigate({ to: '/profile-setup' });
    }
    if (isAuthenticated && !isAdmin) {
      navigate({ to: '/employee' });
    }
  }, [isAuthenticated, showProfileSetup, isAdmin, navigate]);

  const leaderboard: Array<[Principal, bigint]> = dashboardData?.leaderboard.map(
    ([p, pts]) => [p as Principal, pts]
  ) ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of all tasks, performance metrics, and employee leaderboard.
        </p>
      </div>

      {/* Summary Stats */}
      {dashboardLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <SummaryStatsCards
          totalTasks={Number(dashboardData?.totalTasks ?? 0)}
          completedTasks={Number(dashboardData?.completedTasks ?? 0)}
          lateTasks={Number(dashboardData?.lateTasks ?? 0)}
        />
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1.5 text-xs">
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1.5 text-xs">
            <ClipboardList className="w-3.5 h-3.5" />
            All Tasks
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-base font-semibold text-foreground mb-3">Top Performers</h2>
              {dashboardLoading ? (
                <Skeleton className="h-64 rounded-lg" />
              ) : (
                <LeaderboardTable leaderboard={leaderboard.slice(0, 5)} />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground mb-3">Recent Tasks</h2>
              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
                </div>
              ) : (
                <GlobalTaskList tasks={(tasks ?? []).slice(0, 6)} showApprovalActions={false} />
              )}
            </div>
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          {dashboardLoading ? (
            <Skeleton className="h-96 rounded-lg" />
          ) : (
            <LeaderboardTable leaderboard={leaderboard} />
          )}
        </TabsContent>

        {/* All Tasks Tab */}
        <TabsContent value="tasks">
          {tasksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
            </div>
          ) : (
            <GlobalTaskList tasks={tasks ?? []} showApprovalActions={true} />
          )}
        </TabsContent>

        {/* Users Tab — Admin only */}
        <TabsContent value="users">
          <UsersListPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
