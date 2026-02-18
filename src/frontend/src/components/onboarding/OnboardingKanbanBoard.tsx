import type { OnboardingStage } from '../../backend';
import { ONBOARDING_STAGES, getStageNameByNumber } from './onboardingStages';
import OnboardingStageColumn from './OnboardingStageColumn';

interface OnboardingKanbanBoardProps {
  pipeline: OnboardingStage[];
}

export default function OnboardingKanbanBoard({ pipeline }: OnboardingKanbanBoardProps) {
  // Normalize backend data into exactly 6 ordered columns
  const normalizedColumns = ONBOARDING_STAGES.map((stageName, index) => {
    const stepNumber = index + 1;
    
    // Find all cards that belong to this stage (by stepNumber)
    const cards = pipeline.flatMap((stage) =>
      stage.cards.filter((card) => Number(card.stepNumber) === stepNumber)
    );

    return {
      stageName,
      stepNumber,
      cards,
    };
  });

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {normalizedColumns.map((column) => (
        <OnboardingStageColumn
          key={column.stepNumber}
          stageName={column.stageName}
          stepNumber={column.stepNumber}
          cards={column.cards}
        />
      ))}
    </div>
  );
}
