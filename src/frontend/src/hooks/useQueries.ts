import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ClientProfile, DashboardStats, UserProfile, OnboardingStage } from '../backend';

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
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });
}
