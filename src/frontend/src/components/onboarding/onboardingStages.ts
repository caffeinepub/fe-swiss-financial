export const ONBOARDING_STAGES = [
  'Initial Contact',
  'ID Collection',
  'KYC Screening',
  'Risk Assessment',
  'Compliance Review',
  'Account Activation',
] as const;

export type OnboardingStageName = typeof ONBOARDING_STAGES[number];

export function getStageIndex(stageName: string): number {
  const index = ONBOARDING_STAGES.findIndex(
    (stage) => stage.toLowerCase() === stageName.toLowerCase()
  );
  return index >= 0 ? index : 0;
}

export function getStageNameByNumber(stepNumber: number): OnboardingStageName {
  const index = stepNumber - 1;
  if (index >= 0 && index < ONBOARDING_STAGES.length) {
    return ONBOARDING_STAGES[index];
  }
  return ONBOARDING_STAGES[0];
}
