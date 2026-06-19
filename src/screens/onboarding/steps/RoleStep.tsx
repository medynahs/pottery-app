import type { AppModule, OnboardingUserType, PracticeMode, UserRole } from '@/src/store/appStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

interface UserTypeConfig {
  label: string;
  description: string;
  help: string;
  practiceMode: PracticeMode;
  role: UserRole;
  defaultModules: AppModule[];
  pricingUserType: string;
  includeHomeSetup: boolean;
  icon: React.ComponentType<{ size: number; color: string }>;
}

interface RoleStepProps {
  draft: any;
  updateDraft: (patch: Partial<any>) => void;
  USER_TYPE_CONFIG: Record<OnboardingUserType, UserTypeConfig>;
}

const ROLE_DETAILS: Record<OnboardingUserType, { eyebrow: string; promise: string; modules: string; accent: string; tint: string }> = {
  'home-potter': {
    eyebrow: 'Home Studio',
    promise: 'Shape a personal workspace for your pieces, clay bodies, and kiln notes.',
    modules: 'Pieces · Kiln · Glaze Atlas',
    accent: '#8d552f',
    tint: '#fff1df',
  },
  'studio-potter': {
    eyebrow: 'Shared Studio',
    promise: 'Keep your own piece flow clear while working around communal firings.',
    modules: 'Pieces · Glaze Atlas · Community',
    accent: '#526b43',
    tint: '#eef5e9',
  },
  'studio-owner-technician': {
    eyebrow: 'Studio Ops',
    promise: 'Prioritise kiln schedules, member flow, and the practical rhythm of the room.',
    modules: 'Kiln · Pieces · Community',
    accent: '#9a471f',
    tint: '#ffe9dc',
  },
  'business-owner': {
    eyebrow: 'Selling Work',
    promise: 'Bring pricing, production, and repeatable studio systems to the front.',
    modules: 'Pricing · Pieces · Analytics',
    accent: '#7253a3',
    tint: '#f1ecff',
  },
  'not-sure': {
    eyebrow: 'Explore',
    promise: 'Start broad, then refine your studio once the app learns how you work.',
    modules: 'Everything enabled',
    accent: '#53606b',
    tint: '#edf2f6',
  },
};

export const RoleStep: React.FC<RoleStepProps> = ({ draft, updateDraft, USER_TYPE_CONFIG }) => {
  const scaleAnims = useRef(
    Object.fromEntries(
      Object.keys(USER_TYPE_CONFIG).map((key) => [key, new Animated.Value(1)])
    )
  ).current;

  const handleSelect = (key: OnboardingUserType) => {
    Animated.sequence([
      Animated.spring(scaleAnims[key], { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }),
      Animated.spring(scaleAnims[key], { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 10 }),
    ]).start();

    updateDraft({
      userType: key,
      pricingUserType: USER_TYPE_CONFIG[key].pricingUserType,
      activeModules: USER_TYPE_CONFIG[key].defaultModules,
      studioCode: '',
    });
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 }}>
     
        <View style={{ alignSelf: 'flex-start', borderRadius: 999, backgroundColor: 'rgba(125, 76, 39, 0.1)', paddingHorizontal: 11, paddingVertical: 6, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: 'hsl(28 38% 34%)' }}>
            Studio profile
          </Text>
        </View>
        <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 23, lineHeight: 29, color: 'hsl(24 30% 12%)' }}>
          How should Pottery Nook shape itself?
        </Text>
        <Text style={{ fontSize: 13, color: 'hsl(24 15% 46%)', marginTop: 7, lineHeight: 19 }}>
          Pick the closest fit. This tunes your first tabs, checklist, and pricing defaults.
        </Text>

      <View style={{ gap: 9, marginTop: 14 }}>
        {(Object.entries(USER_TYPE_CONFIG) as [OnboardingUserType, UserTypeConfig][]).map(([key, option]) => {
          const Icon = option.icon;
          const active = draft.userType === key;
          const detail = ROLE_DETAILS[key];
          return (
            <Animated.View key={key} style={{ transform: [{ scale: scaleAnims[key] }] }}>
              <Pressable onPress={() => handleSelect(key)} accessibilityRole="button">
                <LinearGradient
                  colors={active ? ['#fff8ed', detail.tint] : ['#fffdf8', '#fff9ef']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 20,
                    borderWidth: active ? 1.5 : 1,
                    borderColor: active ? detail.accent : 'rgba(94, 60, 36, 0.12)',
                    padding: 13,
                    shadowColor: active ? detail.accent : '#2f1c12',
                    shadowOffset: { width: 0, height: active ? 9 : 3 },
                    shadowOpacity: active ? 0.16 : 0.05,
                    shadowRadius: active ? 14 : 8,
                    elevation: active ? 4 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 15,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: active ? detail.accent : detail.tint,
                      }}
                    >
                      <Icon size={18} color={active ? '#fff8ed' : detail.accent} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase', color: detail.accent }}>
                          {detail.eyebrow}
                        </Text>
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            borderWidth: 1,
                            borderColor: active ? detail.accent : 'rgba(94, 60, 36, 0.18)',
                            backgroundColor: active ? detail.accent : 'rgba(255, 255, 255, 0.65)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {active ? <Check size={12} color="#fff8ed" strokeWidth={3} /> : null}
                        </View>
                      </View>
                      <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: 'hsl(24 30% 12%)', lineHeight: 20, marginTop: 3 }}>
                        {option.label}
                      </Text>
                      <Text style={{ fontSize: 12.5, color: 'hsl(24 14% 42%)', marginTop: 5, lineHeight: 18 }}>
                        {detail.promise}
                      </Text>
                      <View style={{ alignSelf: 'flex-start', borderRadius: 999, backgroundColor: 'rgba(255, 255, 255, 0.72)', paddingHorizontal: 9, paddingVertical: 5, marginTop: 9 }}>
                        <Text style={{ fontSize: 11.5, fontWeight: '600', color: detail.accent }}>
                          {detail.modules}
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};
