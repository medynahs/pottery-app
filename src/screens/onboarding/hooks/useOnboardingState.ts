import { USER_TYPE_CONFIG } from '@/src/config/onboardingOptions';
import { AVAILABLE_KILNKIN_COMPANIONS } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import { useAppStore } from '@/src/store/appStore';
import { OnboardingDraft, StepKey } from '@/src/types/user';
import { useRouter } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useOnboardingState() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Zustand selectors
  const onboardingProfile = useAppStore((state) => state.onboardingProfile);
  const kilnkinCompanion = useAppStore((state) => state.kilnkinCompanion);
  const user = useAppStore((state) => state.user);
  const completeGeneralOnboarding = useAppStore((state) => state.completeGeneralOnboarding);
  const setPracticeMode = useAppStore((state) => state.setPracticeMode);
  const setRole = useAppStore((state) => state.setRole);
  const setEnabledModules = useAppStore((state) => state.setEnabledModules);
  const setUser = useAppStore((state) => state.setUser);
  const setKilnkinCompanion = useAppStore((state) => state.setKilnkinCompanion);

  // State
  const [stepIndex, setStepIndex] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [draft, setDraft] = React.useState<OnboardingDraft>(() => ({
    userType: onboardingProfile.userType,
    pricingUserType: onboardingProfile.pricingUserType,
    hasOwnKiln: onboardingProfile.hasOwnKiln,
    studioName: onboardingProfile.studioName ?? user.studioName ?? '',
    kilnCount: onboardingProfile.kilnCount ? String(onboardingProfile.kilnCount) : '',
    kilnName: onboardingProfile.kilnName ?? '',
    kilnType: onboardingProfile.kilnType ?? 'electric',
    kilnNickname: onboardingProfile.kilnNickname ?? '',
    homeStudioNotes: onboardingProfile.homeStudioNotes ?? '',
    toolsChecklist: onboardingProfile.toolsChecklist ?? '',
    kilnkinId: onboardingProfile.kilnkinId ?? kilnkinCompanion.id,
    routinesFrequency: onboardingProfile.routinesFrequency,
    routinesFocus: onboardingProfile.routinesFocus,
    preferredUnits: onboardingProfile.preferredUnits,
    language: onboardingProfile.language,
    notificationsEnabled: onboardingProfile.notificationsEnabled,
    quickTourRequested: onboardingProfile.quickTourRequested,
    activeModules: onboardingProfile.activeModules.length
      ? onboardingProfile.activeModules
      : USER_TYPE_CONFIG[onboardingProfile.userType].defaultModules,
    studioCode: onboardingProfile.studioCode ?? '',
  }));

  const userTypeConfig = USER_TYPE_CONFIG[draft.userType];

  const steps: StepKey[] = ['welcome', 'role', 'kilnkin', 'ready'];

  React.useEffect(() => {
    if (stepIndex >= steps.length) {
      setStepIndex(steps.length - 1);
    }
  }, [stepIndex, steps.length]);

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const updateDraft = React.useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((previous) => ({ ...previous, ...patch }));
  }, []);

  const optionalStep = currentStep === 'kilnkin';

  const handleSkip = React.useCallback(() => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }, [steps.length]);

  const handleBack = React.useCallback(() => {
    if (isSubmitting) return;
    setStepIndex((current) => Math.max(0, current - 1));
  }, [isSubmitting]);

  const handleFinish = React.useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const selectedCompanion = AVAILABLE_KILNKIN_COMPANIONS.find((companion) => companion.id === draft.kilnkinId)
      ?? AVAILABLE_KILNKIN_COMPANIONS[0];

    const configuredModules: AppModule[] = draft.activeModules.length
      ? Array.from(new Set<AppModule>(['overview', ...draft.activeModules]))
      : userTypeConfig.defaultModules;

    setPracticeMode(userTypeConfig.practiceMode);
    setRole(userTypeConfig.role);
    setEnabledModules(configuredModules);
    setKilnkinCompanion(selectedCompanion);

    const userPatch: Parameters<typeof setUser>[0] = {};
    if (draft.studioName.trim()) userPatch.studioName = draft.studioName.trim();
    if (draft.studioCode.trim()) userPatch.linkedStudioCode = draft.studioCode.trim();
    if (Object.keys(userPatch).length > 0) setUser(userPatch);

    completeGeneralOnboarding({
      userType: draft.userType,
      pricingUserType: draft.pricingUserType,
      hasOwnKiln: null,
      studioName: draft.studioName.trim() || undefined,
      kilnCount: undefined,
      kilnName: undefined,
      kilnType: 'electric',
      kilnNickname: undefined,
      homeStudioNotes: undefined,
      toolsChecklist: undefined,
      routinesFrequency: draft.routinesFrequency,
      routinesFocus: draft.routinesFocus,
      preferredUnits: draft.preferredUnits,
      language: 'English',
      notificationsEnabled: draft.notificationsEnabled,
      quickTourRequested: false,
      activeModules: configuredModules,
      kilnkinId: selectedCompanion.id,
      studioCode: draft.studioCode.trim() || undefined,
    });

    router.replace('/overview' as never);
  }, [
    isSubmitting, draft, userTypeConfig, setPracticeMode, setRole, setEnabledModules,
    setKilnkinCompanion, setUser, completeGeneralOnboarding, router
  ]);

  const handleContinue = React.useCallback(() => {
    if (currentStep === 'ready') {
      handleFinish();
      return;
    }
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }, [currentStep, handleFinish, steps.length]);

  return {
    insets,
    stepIndex,
    setStepIndex,
    isSubmitting,
    draft,
    updateDraft,
    optionalStep,
    handleSkip,
    handleBack,
    handleFinish,
    handleContinue,
    steps,
    currentStep,
    progress,
  };
}