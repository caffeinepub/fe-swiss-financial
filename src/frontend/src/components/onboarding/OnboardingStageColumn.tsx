import type { OnboardingCard } from '../../backend';
import OnboardingClientCard from './OnboardingClientCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OnboardingStageColumnProps {
  stageName: string;
  stepNumber: number;
  cards: OnboardingCard[];
}

export default function OnboardingStageColumn({
  stageName,
  stepNumber,
  cards,
}: OnboardingStageColumnProps) {
  return (
    <div className="w-80 flex-shrink-0">
      <Card className="h-full">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">{stageName}</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {cards.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-3">
          {cards.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No clients in this stage
            </p>
          ) : (
            cards.map((card) => (
              <OnboardingClientCard
                key={`${card.clientId}-${card.stepNumber}`}
                card={card}
                currentStepNumber={stepNumber}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
