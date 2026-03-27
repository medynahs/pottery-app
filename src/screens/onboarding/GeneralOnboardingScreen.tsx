import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { headingByStep, subheadingByStep, USER_TYPE_CONFIG } from '@/src/config/onboardingOptions';
import { formatLabel } from '@/src/utils/helpers';
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from 'react-native';
import { useOnboardingState } from './hooks/useOnboardingState';
import { HomeSetupStep } from './steps/HomeSetupStep';
import { KilnkinStep } from './steps/KilnkinStep';
import { KilnStep } from './steps/KilnStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { PricingStep } from './steps/PricingStep';
import { ReadyStep } from './steps/ReadyStep';
import { RoleStep } from './steps/RoleStep';
import { RoutinesStep } from './steps/RoutinesStep';
import { StudioPreviewStep } from './steps/StudioPreviewStep';
import { WelcomeStep } from './steps/WelcomeStep';

export default function GeneralOnboardingScreen() {

  const {
    insets,
    isSubmitting,
    draft,
    updateDraft,
    toggleModule,
    optionalStep,
    handleSkip,
    handleBack,
    handleContinue,
    steps,
    currentStep,
    progress,
    stepIndex,
  } = useOnboardingState();

  const renderCurrentStep = () => {
    if (currentStep === 'welcome') return <WelcomeStep draft={draft} updateDraft={updateDraft} formatLabel={formatLabel} />;
    if (currentStep === 'role') return <RoleStep draft={draft} updateDraft={updateDraft} USER_TYPE_CONFIG={USER_TYPE_CONFIG} />;
    if (currentStep === 'pricing') return <PricingStep draft={draft} updateDraft={updateDraft} />;
    if (currentStep === 'kiln') return <KilnStep draft={draft} updateDraft={updateDraft} formatLabel={formatLabel} />;
    if (currentStep === 'kilnkin') return <KilnkinStep draft={draft} updateDraft={updateDraft} formatLabel={formatLabel} />;
    if (currentStep === 'home-setup') return <HomeSetupStep draft={draft} updateDraft={updateDraft} />;
    if (currentStep === 'routines') return <RoutinesStep draft={draft} updateDraft={updateDraft} />;
    if (currentStep === 'preferences') return <PreferencesStep draft={draft} updateDraft={updateDraft} toggleModule={toggleModule} />;
    if (currentStep === 'studio-preview') return <StudioPreviewStep draft={draft} updateDraft={updateDraft} />;
    return <ReadyStep draft={draft} updateDraft={updateDraft} />;
  };

  const primaryLabel = currentStep === 'ready'
    ? (isSubmitting ? 'Entering...' : 'Enter Studio')
    : currentStep === 'welcome'
      ? 'Let’s Begin'
      : 'Continue';

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View className="pt-5 pb-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-primary">Onboarding</Text>
              <Text className="text-[11px] font-semibold text-muted-foreground">Step {stepIndex + 1} / {steps.length}</Text>
            </View>

            <View className="h-2 rounded-full bg-muted mt-3 overflow-hidden">
              <View className="h-2 rounded-full bg-foreground" style={{ width: `${progress}%` }} />
            </View>

            <Text className="text-3xl text-foreground mt-4" style={{ fontFamily: 'Fraunces_700Bold', lineHeight: 38 }}>
              {headingByStep[currentStep]}
            </Text>
            <Text className="text-sm text-muted-foreground mt-2 leading-6">
              {subheadingByStep[currentStep]}
            </Text>
          </View>

          {renderCurrentStep()}
        </ScrollView>

        <View className="px-6 pt-3 pb-6 border-t border-border bg-background" style={{ paddingBottom: insets.bottom + 12 }}>
          <View className="flex-row items-center justify-between mb-3">
            <Pressable
              onPress={handleBack}
              disabled={stepIndex === 0 || isSubmitting}
              className={`px-3 py-2 rounded-full border flex-row items-center gap-1 ${stepIndex === 0 ? 'border-border bg-card/60' : 'border-border bg-card'}`}
            >
              <ChevronLeft size={14} color="hsl(24 20% 45%)" />
              <Text className="text-xs text-muted-foreground">Back</Text>
            </Pressable>

            {optionalStep && !isSubmitting ? (
              <Pressable onPress={handleSkip} className="px-3 py-2 rounded-full">
                <Text className="text-xs font-medium text-muted-foreground">Skip for now</Text>
              </Pressable>
            ) : <View />}
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 items-center justify-center flex-row gap-2 ${isSubmitting ? 'bg-muted' : 'bg-foreground'}`}
          >
            {currentStep === 'ready' ? (
              <CheckCircle2 size={16} color="hsl(34 35% 92%)" />
            ) : (
              <ChevronRight size={16} color="hsl(34 35% 92%)" />
            )}
            <Text className="text-sm font-semibold text-background">{primaryLabel}</Text>
          </Pressable>

          <View className="mt-3 flex-row items-center justify-center gap-2">
            <Bell size={12} color="hsl(24 20% 45%)" />
            <Text className="text-[11px] text-muted-foreground">
              Calm defaults now, advanced setup later.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
