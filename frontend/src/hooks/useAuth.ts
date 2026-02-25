import { useInternetIdentity } from './useInternetIdentity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, UserRole } from '../backend';

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

export function useAuth() {
  const { identity, login, clear, loginStatus, isInitializing, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isAdmin = userProfile?.role === UserRole.admin;
  const isManager = userProfile?.role === UserRole.manager;
  const isEmployee = userProfile?.role === UserRole.employee;

  const logout = async () => {
    await clear();
    queryClient.clear();
  };

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return {
    identity,
    isAuthenticated,
    isAdmin,
    isManager,
    isEmployee,
    userProfile,
    profileLoading,
    isFetched,
    showProfileSetup,
    login,
    logout,
    loginStatus,
    isInitializing,
    isLoggingIn,
  };
}
