import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { UserProfile, TaskResponse, Department, TaskPriority, UserRole, AccountStatus } from '../backend';
import { ExternalBlob } from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────

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

export function useGetUserProfile(principalStr: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return null;
      return actor.getUserProfile(Principal.fromText(principalStr));
    },
    enabled: !!actor && !isFetching && !!principalStr,
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

// ── Tasks ─────────────────────────────────────────────────────────────────

export function useGetTasksForCaller() {
  const { actor, isFetching } = useActor();

  return useQuery<TaskResponse[]>({
    queryKey: ['tasksForCaller'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksForCaller();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<TaskResponse[]>({
    queryKey: ['allTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
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

export function useUploadProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: bigint;
      file: ExternalBlob;
      submittedByName: string;
      submittedByEmail: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadProofFile(
        params.taskId,
        params.file,
        params.submittedByName,
        params.submittedByEmail,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasksForCaller'] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
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

// ── Admin Dashboard ───────────────────────────────────────────────────────

export function useGetAdminDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminDashboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsersStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allUsersStats'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsersStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveUsers() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['activeUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Admin User Management ─────────────────────────────────────────────────

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: string; newRole: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserRole(Principal.fromText(params.user), params.newRole);
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
      return actor.toggleUserAccountStatus(Principal.fromText(params.user), params.status);
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
    mutationFn: async (user: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUser(Principal.fromText(user));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersStats'] });
    },
  });
}

// Re-export identity hook for convenience
export { useInternetIdentity };
