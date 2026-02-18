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
  const { data: authStatus, isLoading: authLoading } = useGetAuthorizationStatus();

  // Show loading only while actively fetching
  const isLoading = actorFetching || authLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // If we have auth status, check it
  if (authStatus) {
    if (authStatus.status === AuthorizationStatus.unauthorized) {
      return <AccessDeniedScreen />;
    }
  }

  // If operator is missing or authorized, allow access
  return <>{children}</>;
}
