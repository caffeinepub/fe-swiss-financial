import { useState, useEffect } from 'react';
import type { OnboardingCard } from '../../backend';
import { useMoveClientToStage } from '../../hooks/useQueries';
import { ONBOARDING_STAGES } from './onboardingStages';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface EditOnboardingCardDialogProps {
  card: OnboardingCard;
  currentStepNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditOnboardingCardDialog({
  card,
  currentStepNumber,
  open,
  onOpenChange,
}: EditOnboardingCardDialogProps) {
  const [selectedStage, setSelectedStage] = useState(currentStepNumber.toString());
  const [status, setStatus] = useState(card.stepStatus);
  const [assignedPerson, setAssignedPerson] = useState(card.assignedPerson);
  const [dueDate, setDueDate] = useState('');

  const moveClientMutation = useMoveClientToStage();

  // Initialize form when dialog opens or card changes
  useEffect(() => {
    if (open) {
      setSelectedStage(currentStepNumber.toString());
      setStatus(card.stepStatus);
      setAssignedPerson(card.assignedPerson);
      
      // Convert bigint timestamp to date input format
      if (card.dueDate) {
        const milliseconds = Number(card.dueDate / BigInt(1_000_000));
        const date = new Date(milliseconds);
        const dateString = date.toISOString().split('T')[0];
        setDueDate(dateString);
      } else {
        setDueDate('');
      }
    }
  }, [open, card, currentStepNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newStepNumber = parseInt(selectedStage, 10);
    
    // Convert date string to bigint timestamp (nanoseconds)
    let dueDateTimestamp: bigint | null = null;
    if (dueDate) {
      const dateObj = new Date(dueDate);
      dueDateTimestamp = BigInt(dateObj.getTime()) * BigInt(1_000_000);
    }

    try {
      await moveClientMutation.mutateAsync({
        clientId: card.clientId,
        stepNumber: BigInt(newStepNumber),
        status,
        assignedPerson,
        dueDate: dueDateTimestamp,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to move client:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move Client</DialogTitle>
          <DialogDescription>
            Update the onboarding stage and details for {card.clientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Onboarding Stage *</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {ONBOARDING_STAGES.map((stage, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Step Status</Label>
              <Input
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g., Pending, In Progress, Completed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedPerson">Assigned Person</Label>
              <Input
                id="assignedPerson"
                value={assignedPerson}
                onChange={(e) => setAssignedPerson(e.target.value)}
                placeholder="Enter name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {moveClientMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to update client stage. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={moveClientMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={moveClientMutation.isPending}>
              {moveClientMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
