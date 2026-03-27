import { USER_TYPE_CONFIG } from '@/src/config/onboardingOptions';
import { AVAILABLE_KILNKIN_COMPANIONS } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import { AppModule, useAppStore } from '@/src/store/appStore';
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
  const kilns = useAppStore((state) => state.kilns);
  const completeGeneralOnboarding = useAppStore((state) => state.completeGeneralOnboarding);
  const setPracticeMode = useAppStore((state) => state.setPracticeMode);
  const setRole = useAppStore((state) => state.setRole);
  const setEnabledModules = useAppStore((state) => state.setEnabledModules);
  const setUser = useAppStore((state) => state.setUser);
  const setStudioRhythmConfig = useAppStore((state) => state.setStudioRhythmConfig);
  const setKilnkinCompanion = useAppStore((state) => state.setKilnkinCompanion);
  const addKiln = useAppStore((state) => state.addKiln);
  const completePricingOnboarding = useAppStore((state) => state.completePricingOnboarding);

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
  }));

  const userTypeConfig = USER_TYPE_CONFIG[draft.userType];

  const steps = React.useMemo(() => {
    const sequence: StepKey[] = ['welcome', 'role', 'pricing', 'kiln', 'kilnkin'];
    if (userTypeConfig.includeHomeSetup) {
      sequence.push('home-setup');
    }
    sequence.push('routines', 'preferences', 'studio-preview', 'ready');
    return sequence;
  }, [userTypeConfig.includeHomeSetup]);

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

  const toggleModule = React.useCallback((moduleId: AppModule) => {
    setDraft((previous) => {
      const exists = previous.activeModules.includes(moduleId);
      const next = exists
        ? previous.activeModules.filter((module) => module !== moduleId)
        : [...previous.activeModules, moduleId];
      return {
        ...previous,
        activeModules: next.includes('overview') ? next : ['overview', ...next],
      };
    });
  }, []);

  const optionalStep = ['kiln', 'kilnkin', 'home-setup', 'routines', 'preferences'].includes(currentStep);

  const handleSkip = React.useCallback(() => {
    if (currentStep === 'kiln') {
      updateDraft({ hasOwnKiln: null, kilnName: '', kilnNickname: '', kilnCount: '' });
    }
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }, [currentStep, steps.length, updateDraft]);

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
    setStudioRhythmConfig({
      wheelPractice: draft.routinesFocus === 'wheel' || draft.routinesFocus === 'hand-building',
      reclaimFocus: draft.routinesFocus === 'reclaim',
    });
    setKilnkinCompanion(selectedCompanion);

    if (draft.studioName.trim()) {
      setUser({ studioName: draft.studioName.trim() });
    }

    if (draft.hasOwnKiln && draft.kilnName.trim()) {
      const normalizedName = draft.kilnName.trim().toLowerCase();
      const exists = kilns.some((kiln) => kiln.name.trim().toLowerCase() === normalizedName);
      if (!exists) {
        addKiln({
          id: `kiln-${Date.now()}`,
          name: draft.kilnName.trim(),
          type: draft.kilnType,
          coneRange: 'Cone 6',
          shelves: Math.max(1, Number.parseInt(draft.kilnCount || '1', 10) || 1),
          size: 'Medium kiln',
          location: draft.studioName.trim() || 'Studio',
          notes: draft.kilnNickname.trim() ? `Nickname: ${draft.kilnNickname.trim()}` : '',
          createdAt: new Date().toISOString(),
        });
      }
    }

    completePricingOnboarding(draft.pricingUserType);
    completeGeneralOnboarding({
      userType: draft.userType,
      pricingUserType: draft.pricingUserType,
      hasOwnKiln: draft.hasOwnKiln,
      studioName: draft.studioName.trim() || undefined,
      kilnCount: draft.kilnCount ? Math.max(1, Number.parseInt(draft.kilnCount, 10) || 1) : undefined,
      kilnName: draft.kilnName.trim() || undefined,
      kilnType: draft.kilnType,
      kilnNickname: draft.kilnNickname.trim() || undefined,
      homeStudioNotes: draft.homeStudioNotes.trim() || undefined,
      toolsChecklist: draft.toolsChecklist.trim() || undefined,
      routinesFrequency: draft.routinesFrequency,
      routinesFocus: draft.routinesFocus,
      preferredUnits: draft.preferredUnits,
      language: draft.language.trim() || 'English',
      notificationsEnabled: draft.notificationsEnabled,
      quickTourRequested: draft.quickTourRequested,
      activeModules: configuredModules,
      kilnkinId: selectedCompanion.id,
    });

    router.replace('/overview' as never);
  }, [
    isSubmitting, draft, userTypeConfig, setPracticeMode, setRole, setEnabledModules,
    setStudioRhythmConfig, setKilnkinCompanion, setUser, kilns, addKiln,
    completePricingOnboarding, completeGeneralOnboarding, router
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
    toggleModule,
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