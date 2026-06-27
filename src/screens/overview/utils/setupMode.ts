import type { SetupProgress } from '@/src/store/appStore';

export type StudioMaturitySignals = {
  pieceCount: number;
  glazeCount: number;
  kilnCount: number;
  firingCount: number;
  rhythmConfigured: boolean;
  pricingOnboardingCompleted: boolean;
};

/** True when the user already has real studio data — not a fresh empty account. */
export function hasEstablishedStudio(signals: StudioMaturitySignals): boolean {
  return (
    signals.pieceCount > 0
    || signals.glazeCount > 0
    || signals.kilnCount > 0
    || signals.firingCount > 0
    || signals.rhythmConfigured
    || signals.pricingOnboardingCompleted
  );
}

export function isSetupProgressComplete(progress: SetupProgress | undefined): boolean {
  if (!progress) return false;
  return Object.values(progress).every(Boolean);
}
