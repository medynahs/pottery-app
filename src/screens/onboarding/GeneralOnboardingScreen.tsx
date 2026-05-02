import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { USER_TYPE_CONFIG } from '@/src/config/onboardingOptions';
import { Image } from 'expo-image';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useOnboardingState } from './hooks/useOnboardingState';
import { KilnkinStep } from './steps/KilnkinStep';
import { RoleStep } from './steps/RoleStep';
import { WelcomeStep } from './steps/WelcomeStep';

const PET_SOURCE: Record<string, any> = {
  fire:  require('../../../assets/animations/activeOven.gif'),
  earth: require('../../../assets/images/clay-pet.png'),
  air:   require('../../../assets/animations/pet.gif'),
  water: require('../../../assets/animations/kilnPet.gif'),
};

export default function GeneralOnboardingScreen() {

  const {
    insets,
    isSubmitting,
    draft,
    updateDraft,
    handleBack,
    handleContinue,
    steps,
    currentStep,
    progress,
    stepIndex,
    celebrationVisible,
    celebrationCompanionName,
    celebrationCompanionElement,
  } = useOnboardingState();

  // Ceremony animation values
  const ceremonyOpacity   = useRef(new Animated.Value(0)).current;
  const medallionScale    = useRef(new Animated.Value(0.3)).current;
  const medallionY        = useRef(new Animated.Value(28)).current;
  const glowOpacity       = useRef(new Animated.Value(0)).current;
  const glowScale         = useRef(new Animated.Value(0.4)).current;
  const sparkleRotate     = useRef(new Animated.Value(0)).current;
  const textOpacity       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (celebrationVisible) {
      // Reset
      ceremonyOpacity.setValue(0);
      medallionScale.setValue(0.3);
      medallionY.setValue(28);
      glowOpacity.setValue(0);
      glowScale.setValue(0.4);
      sparkleRotate.setValue(0);
      textOpacity.setValue(0);

      Animated.parallel([
        // Backdrop
        Animated.timing(ceremonyOpacity, {
          toValue: 1, duration: 280, useNativeDriver: true,
        }),
        // Companion spring in + lift
        Animated.spring(medallionScale, {
          toValue: 1, friction: 6, tension: 90, useNativeDriver: true,
        }),
        Animated.timing(medallionY, {
          toValue: 0, duration: 440,
          easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
        // Glow bloom
        Animated.sequence([
          Animated.delay(120),
          Animated.parallel([
            Animated.timing(glowOpacity, {
              toValue: 1, duration: 520, useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 1, duration: 820,
              easing: Easing.out(Easing.quad), useNativeDriver: true,
            }),
          ]),
        ]),
        // Sparkles orbit
        Animated.timing(sparkleRotate, {
          toValue: 1, duration: 1200,
          easing: Easing.inOut(Easing.quad), useNativeDriver: true,
        }),
        // Text reveal
        Animated.sequence([
          Animated.delay(380),
          Animated.timing(textOpacity, {
            toValue: 1, duration: 300, useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [celebrationVisible]);

  const renderCurrentStep = () => {
    if (currentStep === 'welcome') return <WelcomeStep draft={draft} updateDraft={updateDraft} />;
    if (currentStep === 'role') return <RoleStep draft={draft} updateDraft={updateDraft} USER_TYPE_CONFIG={USER_TYPE_CONFIG} />;
    if (currentStep === 'kilnkin') return <KilnkinStep draft={draft} updateDraft={updateDraft} />;
    return null;
  };

  const primaryLabel = currentStep === 'kilnkin'
    ? (isSubmitting ? 'Entering...' : 'Enter Studio')
    : currentStep === 'welcome'
      ? 'Let\'s Begin'
      : 'Continue';

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        {/* Compact progress header */}
        <View className="flex-row items-center gap-3 px-6 pt-4 pb-3">
          <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-primary">
            {stepIndex + 1} / {steps.length}
          </Text>
          <View className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <View className="h-1.5 rounded-full bg-foreground" style={{ width: `${progress}%` }} />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentStep()}
        </ScrollView>

        <View className="px-6 pt-3 border-t border-border bg-background" style={{ paddingBottom: insets.bottom + 12 }}>
          <View className="flex-row items-center justify-between mb-3">
            {stepIndex > 0 ? (
              <Pressable
                onPress={handleBack}
                disabled={isSubmitting}
                className="px-3 py-2 rounded-full border flex-row items-center gap-1 border-border bg-card"
              >
                <ChevronLeft size={14} color="hsl(24 20% 45%)" />
                <Text className="text-xs text-muted-foreground">Back</Text>
              </Pressable>
            ) : <View />}
            <View />
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 items-center justify-center flex-row gap-2 ${isSubmitting ? 'bg-muted' : 'bg-foreground'}`}
          >
            {currentStep === 'kilnkin' ? (
              <CheckCircle2 size={16} color="hsl(34 35% 92%)" />
            ) : (
              <ChevronRight size={16} color="hsl(34 35% 92%)" />
            )}
            <Text className="text-sm font-semibold text-background">{primaryLabel}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Entry ceremony overlay */}
      {celebrationVisible && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: ceremonyOpacity,
              backgroundColor: 'rgba(22, 12, 6, 0.93)',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
          pointerEvents="none"
        >
          {/* Glow + sparkles orbit + medallion — all anchored to the same center */}
          <Animated.View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer glow ring */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 290,
                height: 290,
                borderRadius: 145,
                backgroundColor: 'rgba(211, 146, 83, 0.22)',
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              }}
            />
            {/* Inner glow ring */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 190,
                height: 190,
                borderRadius: 95,
                backgroundColor: 'rgba(240, 190, 120, 0.18)',
                opacity: glowOpacity,
                transform: [
                  {
                    scale: glowScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.08],
                    }),
                  },
                ],
              }}
            />
            {/* Sparkles orbit */}
            <Animated.View
              style={{
                position: 'absolute',
                transform: [
                  {
                    rotate: sparkleRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              }}
            >
              <Sparkles size={176} color="rgba(255, 214, 163, 0.52)" />
            </Animated.View>
            {/* Companion medallion */}
            <Animated.View
              style={{
                width: 144,
                height: 144,
                borderRadius: 72,
                overflow: 'hidden',
                backgroundColor: 'rgba(60, 35, 18, 0.96)',
                borderWidth: 1.5,
                borderColor: 'rgba(255, 219, 174, 0.32)',
                transform: [
                  { scale: medallionScale },
                  { translateY: medallionY },
                ],
              }}
            >
              {celebrationCompanionElement && PET_SOURCE[celebrationCompanionElement] ? (
                <Image
                  source={PET_SOURCE[celebrationCompanionElement]}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 52 }}>🏺</Text>
                </View>
              )}
            </Animated.View>
          </Animated.View>

          {/* Text */}
          <Animated.View
            style={{
              opacity: textOpacity,
              alignItems: 'center',
              marginTop: 32,
              paddingHorizontal: 36,
            }}
          >
            <Text
              style={{
                fontFamily: 'Fraunces_700Bold',
                fontSize: 28,
                color: '#f0dcc0',
                textAlign: 'center',
                lineHeight: 34,
              }}
            >
              {celebrationCompanionName} is with you
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#c8a57a',
                marginTop: 10,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Your studio is ready
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

