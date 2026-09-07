import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { USER_TYPE_CONFIG } from '@/src/config/onboardingOptions';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
  View,
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

const STEP_LABEL: Record<string, string> = {
  welcome: 'Studio',
  role: 'Profile',
  kilnkin: 'Companion',
};

function StepPill({ active, reached, label }: { active: boolean; reached: boolean; label: string }) {
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 340,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [active, anim]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Animated.View
        style={{
          height: 7,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: [7, 25] }),
          borderRadius: 4,
          backgroundColor: reached ? 'hsl(25 36% 24%)' : 'rgba(94, 60, 36, 0.18)',
        }}
      />
      <Animated.View
        style={{
          overflow: 'hidden',
          marginLeft: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }),
          maxWidth: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 110] }),
          opacity: anim,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: 'hsl(25 36% 24%)' }}
        >
          {label}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function GeneralOnboardingScreen() {
  const {
    insets,
    isSubmitting,
    draft,
    updateDraft,
    handleBack,
    handleContinue,
    canContinue,
    steps,
    currentStep,
    stepIndex,
    celebrationVisible,
    celebrationCompanionName,
    celebrationCompanionElement,
  } = useOnboardingState();

  // Ceremony animation values
  const ceremonyOpacity  = useRef(new Animated.Value(0)).current;
  const medallionScale   = useRef(new Animated.Value(0.3)).current;
  const medallionY       = useRef(new Animated.Value(28)).current;
  const glowOpacity      = useRef(new Animated.Value(0)).current;
  const glowScale        = useRef(new Animated.Value(0.4)).current;
  const sparkleRotate    = useRef(new Animated.Value(0)).current;
  const textOpacity      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!celebrationVisible) return;

    ceremonyOpacity.setValue(0);
    medallionScale.setValue(0.3);
    medallionY.setValue(28);
    glowOpacity.setValue(0);
    glowScale.setValue(0.4);
    sparkleRotate.setValue(0);
    textOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(ceremonyOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(medallionScale, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      Animated.timing(medallionY, { toValue: 0, duration: 440, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1, duration: 820, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),
      Animated.timing(sparkleRotate, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(380),
        Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, [
    celebrationVisible,
    ceremonyOpacity,
    glowOpacity,
    glowScale,
    medallionScale,
    medallionY,
    sparkleRotate,
    textOpacity,
  ]);

  // Per-step entrance transition (fade + slide up)
  const scrollRef = useRef<ScrollView>(null);
  const stepAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    stepAnim.setValue(0);
    Animated.timing(stepAnim, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [stepIndex, stepAnim]);

  // Primary button press feedback
  const btnScale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () =>
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  const handlePressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  const renderCurrentStep = () => {
    if (currentStep === 'welcome') return <WelcomeStep draft={draft} updateDraft={updateDraft} />;
    if (currentStep === 'role')    return <RoleStep draft={draft} updateDraft={updateDraft} USER_TYPE_CONFIG={USER_TYPE_CONFIG} />;
    if (currentStep === 'kilnkin') return <KilnkinStep draft={draft} updateDraft={updateDraft} />;
    return null;
  };

  const primaryLabel = currentStep === 'kilnkin'
    ? (isSubmitting ? 'Entering…' : 'Enter Studio')
    : currentStep === 'welcome'
      ? "Let's Begin"
      : 'Continue';

  return (
    <View className="flex-1" style={{ paddingTop: insets.top, backgroundColor: '#fff7ea' }}>
      <LinearGradient
        colors={['#fffaf2', '#f3dfc4', '#fff8ed']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">

        <View style={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: 4 }}>
          <View
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderRadius: 999,
              backgroundColor: 'rgba(255, 252, 246, 0.78)',
              borderWidth: 1,
              borderColor: 'rgba(94, 60, 36, 0.1)',
              paddingHorizontal: 12,
              paddingVertical: 9,
            }}
          >
            {steps.map((step, i) => (
              <StepPill
                key={step}
                active={i === stepIndex}
                reached={i <= stepIndex}
                label={STEP_LABEL[step]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: stepAnim,
              transform: [
                { translateY: stepAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              ],
            }}
          >
            {renderCurrentStep()}
          </Animated.View>
        </ScrollView>

        {/* Bottom navigation */}
        <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: insets.bottom + 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {stepIndex > 0 && (
              <Pressable
                onPress={handleBack}
                disabled={isSubmitting}
                style={{
                  height: 52,
                  paddingHorizontal: 18,
                  borderRadius: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  borderWidth: 1.5,
                  borderColor: 'rgba(94, 60, 36, 0.18)',
                  backgroundColor: 'rgba(255, 252, 246, 0.82)',
                }}
              >
                <ChevronLeft size={17} color="hsl(25 30% 32%)" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'hsl(25 30% 32%)' }}>Back</Text>
              </Pressable>
            )}

            <Animated.View style={{ flex: 1, transform: [{ scale: btnScale }] }}>
              <Pressable
                onPress={handleContinue}
                onPressIn={canContinue ? handlePressIn : undefined}
                onPressOut={canContinue ? handlePressOut : undefined}
                disabled={isSubmitting || !canContinue}
                style={{
                  height: 52,
                  borderRadius: 18,
                  overflow: 'hidden',
                  shadowColor: '#3f2412',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: isSubmitting || !canContinue ? 0 : 0.2,
                  shadowRadius: 14,
                  elevation: isSubmitting || !canContinue ? 0 : 4,
                  opacity: canContinue ? 1 : 0.45,
                }}
              >
                <LinearGradient
                  colors={isSubmitting || !canContinue ? ['#c9b9a3', '#b9aa95'] : ['#3f2415', '#6f4226']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
                >
                  <Text className="text-sm font-semibold text-background">
                    {primaryLabel}
                  </Text>
                  {currentStep === 'kilnkin'
                    ? <CheckCircle2 size={16} color="hsl(34 35% 92%)" />
                    : <ChevronRight size={16} color="hsl(34 35% 92%)" />
                  }
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
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
                transform: [{
                  scale: glowScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.08] }),
                }],
              }}
            />
            {/* Sparkles orbit */}
            <Animated.View
              style={{
                position: 'absolute',
                transform: [{
                  rotate: sparkleRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }),
                }],
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
                transform: [{ scale: medallionScale }, { translateY: medallionY }],
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
