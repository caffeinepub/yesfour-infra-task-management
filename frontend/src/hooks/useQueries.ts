import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  UserProfile,
  TaskResponse,
  UserStats,
  UserSummary,
  Department,
  TaskPriority,
  UserRole,
  AccountStatus,
  ApprovalStatus,
  ExternalBlob,
  FinalStatus,
} from '../backend';
import { Principal } from '@dfinity/principal';

// ── User Profile Hooks ────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principalStr?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return null;
      const principal = Principal.fromText(principalStr);
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principalStr,
    retry: false,
  });
}

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

// ── Task Hooks ────────────────────────────────────────────────────────────────

export function useGetTasksForCaller() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TaskResponse[]>({
    queryKey: ['tasksForCaller'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksForCaller();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllTasks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TaskResponse[]>({
    queryKey: ['allTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTasksForUser(principalStr?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TaskResponse[]>({
    queryKey: ['tasksForUser', principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return [];
      const principal = Principal.fromText(principalStr);
      return actor.getTasksForUser(principal);
    },
    enabled: !!actor && !actorFetching && !!principalStr,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      department: Department;
      assigneeEmail: string;
      description: string;
      deadline: bigint;
      priority: TaskPriority;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(
        params.title,
        params.department,
        params.assigneeEmail,
        params.description,
        params.deadline,
        params.priority,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

/**
 * Upload proof for a task.
 * Only the assigned employee can call this.
 * The backend's uploadProof method accepts (taskId, file) only.
 */
export function useUploadProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: bigint;
      file: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadProof(params.taskId, params.file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

/**
 * Mark a task as complete (employee's final confirmation after proof upload).
 * Only the assigned employee can call this.
 * The task must already have a proofFile uploaded.
 */
export function useMarkComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markComplete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

/**
 * Admin review of a task: approve or reject.
 * Only admins can call this.
 * Rejection requires a non-empty reviewComment.
 */
export function useAdminReviewTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: bigint;
      decision: FinalStatus;
      reviewComment: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminReviewTask(params.taskId, params.decision, params.reviewComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
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
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
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
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

// ── Admin Dashboard Hooks ─────────────────────────────────────────────────────

export function useGetAdminDashboard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    totalTasks: bigint;
    completedTasks: bigint;
    leaderboard: Array<[Principal, bigint]>;
    lateTasks: bigint;
  }>({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminDashboard();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllUsersStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserStats[]>({
    queryKey: ['allUsersStats'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsersStats();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetActiveUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserSummary[]>({
    queryKey: ['activeUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Admin User Management Hooks ───────────────────────────────────────────────

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipalStr: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipalStr);
      return actor.deleteUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersStats'] });
      queryClient.invalidateQueries({ queryKey: ['activeUsers'] });
    },
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: string; newRole: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(params.user);
      return actor.updateUserRole(principal, params.newRole);
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
    mutationFn: async (params: { user: string; status: AccountStatus }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(params.user);
      return actor.toggleUserAccountStatus(principal, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersStats'] });
      queryClient.invalidateQueries({ queryKey: ['activeUsers'] });
    },
  });
}

// Re-export types for convenience
export type { TaskResponse, UserProfile, UserStats, UserSummary, ApprovalStatus };
