import { ReactNode } from 'react';
import { useActor } from '../hooks/useActor';
import { Loader2 } from 'lucide-react';

interface AuthorizationGateProps {
  children: ReactNode;
}

export default function AuthorizationGate({ children }: AuthorizationGateProps) {
  const { actor, isFetching: actorFetching } = useActor();

  // Show loading only while actively fetching actor
  if (actorFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // Once actor is ready, allow all authenticated users to access the app
  return <>{children}</>;
}
