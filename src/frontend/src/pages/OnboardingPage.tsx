import { AlertCircle } from 'lucide-react';
import { useGetOnboardingPipeline } from '../hooks/useQueries';
import OnboardingKanbanBoard from '../components/onboarding/OnboardingKanbanBoard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function OnboardingPage() {
  const { data: pipeline, isLoading, error } = useGetOnboardingPipeline();

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border bg-background px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Onboarding Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track clients through the onboarding process
        </p>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading && (
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-80 flex-shrink-0 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load onboarding pipeline. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && pipeline && (
          <OnboardingKanbanBoard pipeline={pipeline} />
        )}

        {!isLoading && !error && pipeline && pipeline.length === 0 && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">No clients in the onboarding pipeline</p>
          </div>
        )}
      </div>
    </div>
  );
}
