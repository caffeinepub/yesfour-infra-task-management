import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile } from './useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from '../backend';

function getRoleKey(role: unknown): string {
  if (typeof role === 'string') return role;
  if (typeof role === 'object' && role !== null) return Object.keys(role)[0];
  return '';
}

export function useAuth() {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const roleKey = userProfile ? getRoleKey(userProfile.role) : '';
  const isAdmin = roleKey === UserRole.admin;
  const isManager = roleKey === UserRole.manager;
  const isEmployee = roleKey === UserRole.employee;

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const logout = async () => {
    await clear();
    queryClient.clear();
  };

  return {
    identity,
    isAuthenticated,
    isLoggingIn,
    userProfile,
    profileLoading,
    profileFetched,
    isAdmin,
    isManager,
    isEmployee,
    showProfileSetup,
    logout,
  };
}
