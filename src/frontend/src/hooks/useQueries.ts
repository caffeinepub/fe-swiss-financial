import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ClientProfile, DashboardStats, UserProfile, OnboardingStage, OverviewFieldUpdate, ActivityLogEntry, AuthorizationResult, AdminEntry, AdminRole } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
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

// Authorization Queries
export function useGetAuthorizationStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<AuthorizationResult>({
    queryKey: ['authorizationStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isAuthorized();
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

export function useGetMyAdminEntry() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<AdminEntry | null>({
    queryKey: ['myAdminEntry'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerAdminEntry();
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

export function useGetAdminEntries() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useQuery<AdminEntry[]>({
    queryKey: ['adminEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const entries = await actor.getAdminEntries();
      // After fetching admin entries, invalidate myAdminEntry to ensure it's up to date
      queryClient.invalidateQueries({ queryKey: ['myAdminEntry'] });
      return entries;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, name, role }: { principal: Principal; name: string; role: AdminRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAdmin(principal, name, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEntries'] });
      queryClient.invalidateQueries({ queryKey: ['myAdminEntry'] });
    },
  });
}

export function useRemoveAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEntries'] });
      queryClient.invalidateQueries({ queryKey: ['myAdminEntry'] });
    },
  });
}

// Dashboard Queries
export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();

  return useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// Client Queries
export function useGetAllClients() {
  const { actor, isFetching } = useActor();

  return useQuery<ClientProfile[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClient(id: number) {
  const { actor, isFetching } = useActor();

  return useQuery<ClientProfile>({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getClient(BigInt(id));
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useCreateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Omit<ClientProfile, 'id'>) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createClient(profile as ClientProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['onboardingPipeline'] });
    },
  });
}

// Overview Field Updates
export function useUpdateClientOverviewFields() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: bigint; updates: OverviewFieldUpdate }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClientOverviewFields(id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', Number(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Activity Log
export function useGetClientActivityLog(clientId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['clientActivityLog', clientId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getClientActivityLog(clientId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAppendActivityLogEntries() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, entries }: { clientId: bigint; entries: ActivityLogEntry[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.appendActivityLogEntries(clientId, entries);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clientActivityLog', variables.clientId.toString()] });
    },
  });
}

// Onboarding Pipeline Queries
export function useGetOnboardingPipeline() {
  const { actor, isFetching } = useActor();

  return useQuery<OnboardingStage[]>({
    queryKey: ['onboardingPipeline'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOnboardingPipeline();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMoveClientToStage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      stepNumber,
      status,
      assignedPerson,
      dueDate,
    }: {
      clientId: bigint;
      stepNumber: bigint;
      status: string;
      assignedPerson: string;
      dueDate: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.moveClientToStage(clientId, stepNumber, status, assignedPerson, dueDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingPipeline'] });
    },
  });
}
