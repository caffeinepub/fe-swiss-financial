import { ReactNode } from 'react';
import { useGetAuthorizationStatus } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Loader2 } from 'lucide-react';
import { AuthorizationStatus } from '../backend';

interface AuthorizationGateProps {
  children: ReactNode;
}

export default function AuthorizationGate({ children }: AuthorizationGateProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: authStatus, isLoading: authLoading, isFetched } = useGetAuthorizationStatus();

  // Show loading while actor or authorization is being fetched
  if (actorFetching || authLoading || !isFetched) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // If no actor or no auth status, show loading
  if (!actor || !authStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authorization status
  if (authStatus.status === AuthorizationStatus.unauthorized) {
    return <AccessDeniedScreen />;
  }

  // If operator is missing, allow access (first-time setup scenario)
  // The user will be able to create the operator entry
  return <>{children}</>;
}
