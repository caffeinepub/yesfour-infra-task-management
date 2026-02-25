import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Department, TaskPriority, UserProfile, Task, UserStats, UserRole, AccountStatus } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// ── User Profiles ─────────────────────────────────────────────────────────────

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function useGetTasksForCaller() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasksForCaller'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksForCaller();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

export function useGetTasksForUser(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasksForUser', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getTasksForUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
    refetchInterval: 60_000,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      department: Department;
      assignedTo: Principal;
      description: string;
      deadline: bigint;
      priority: TaskPriority;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(
        params.title,
        params.department,
        params.assignedTo,
        params.description,
        params.deadline,
        params.priority
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForUser'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

export function useUploadProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { taskId: bigint; file: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadProofFile(params.taskId, params.file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForUser'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

export function useApproveTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForUser'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRejectTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { taskId: bigint; reason: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectTask(params.taskId, params.reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForUser'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────

export function useAdminDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery<{
    totalTasks: bigint;
    completedTasks: bigint;
    lateTasks: bigint;
    leaderboard: Array<[Principal, bigint]>;
  }>({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminDashboard();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

// ── Admin User Management ─────────────────────────────────────────────────────

export function useGetAllUsersStats() {
  const { actor, isFetching } = useActor();

  return useQuery<UserStats[]>({
    queryKey: ['allUsersStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllUsersStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: Principal; newRole: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserRole(params.user, params.newRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersStats'] });
    },
  });
}

export function useToggleUserAccountStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: Principal; status: AccountStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleUserAccountStatus(params.user, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersStats'] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersStats'] });
    },
  });
}
