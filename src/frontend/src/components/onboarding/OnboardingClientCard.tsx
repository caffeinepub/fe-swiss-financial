import { useState } from 'react';
import type { OnboardingCard } from '../../backend';
import { formatDateOrPlaceholder } from '../../utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, MoveRight } from 'lucide-react';
import EditOnboardingCardDialog from './EditOnboardingCardDialog';

interface OnboardingClientCardProps {
  card: OnboardingCard;
  currentStepNumber: number;
}

export default function OnboardingClientCard({ card, currentStepNumber }: OnboardingClientCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('completed') || lowerStatus.includes('done')) {
      return 'default';
    }
    if (lowerStatus.includes('pending') || lowerStatus.includes('waiting')) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="mb-3">
            <h4 className="font-medium text-foreground">{card.clientName}</h4>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant={getStatusVariant(card.stepStatus)} className="text-xs">
                {card.stepStatus}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{card.assignedPerson || 'Unassigned'}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formatDateOrPlaceholder(card.dueDate)}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <MoveRight className="mr-2 h-3.5 w-3.5" />
            Move / Edit
          </Button>
        </CardContent>
      </Card>

      <EditOnboardingCardDialog
        card={card}
        currentStepNumber={currentStepNumber}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
