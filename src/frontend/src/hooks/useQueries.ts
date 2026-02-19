import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ClientProfile, DashboardStats, UserProfile, OnboardingStage, OverviewFieldUpdate, ActivityLogEntry, AuthorizationResult, AdminEntry, AdminRole } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
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

// Authorization Queries
export function useGetAuthorizationStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<AuthorizationResult>({
    queryKey: ['authorizationStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isAuthorized();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetMyAdminEntry(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<AdminEntry | null>({
    queryKey: ['myAdminEntry'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerAdminEntry();
    },
    enabled: options?.enabled !== undefined ? options.enabled && !!actor && !isFetching : !!actor && !isFetching,
  });
}

export function useGetAdminEntries() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useQuery<AdminEntry[]>({
    queryKey: ['adminEntries'],
    queryFn: async () => {
      if (!actor) return [];
      // Use getAdminList() which has bootstrap logic to auto-register first caller as Operator
      const entries = await actor.getAdminList();
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
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClient(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<ClientProfile>({
    queryKey: ['client', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getClient(id);
    },
    enabled: !!actor && !isFetching && id > 0n,
  });
}

export function useCreateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ClientProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createClient(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, profile }: { id: bigint; profile: ClientProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClient(id, profile);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useDeleteClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteClient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// Onboarding Pipeline Queries
export function useGetOnboardingPipeline() {
  const { actor, isFetching } = useActor();

  return useQuery<OnboardingStage[]>({
    queryKey: ['onboardingPipeline'],
    queryFn: async () => {
      if (!actor) return [];
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
      queryClient.invalidateQueries({ queryKey: ['clients'] });
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
      queryClient.invalidateQueries({ queryKey: ['client', variables.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Activity Log Queries
export function useGetClientActivityLog(clientId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['activityLog', clientId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClientActivityLog(clientId);
    },
    enabled: !!actor && !isFetching && clientId > 0n,
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
      queryClient.invalidateQueries({ queryKey: ['activityLog', variables.clientId.toString()] });
    },
  });
}
