import { Text } from '@/src/components/ui/text';
import type { AppModule, OnboardingUserType, PracticeMode, UserRole } from '@/src/store/appStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Check, Flame, Home } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Animated, Pressable, TextInput, View } from 'react-native';

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
    accent: '#C45C2A',
    tint: '#ffe8d6',
  },
  'business-owner': {
    eyebrow: 'Selling Work',
    promise: 'Bring pricing, production, and repeatable studio systems to the front.',
    modules: 'Pieces · Glaze Atlas · Community',
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

const KILN_OPTIONS = [
  {
    value: true as const,
    label: 'I own a kiln',
    hint: 'Home or private kiln you control',
    Icon: Flame,
    accent: '#c45c2a',
    tint: '#ffe8d6',
  },
  {
    value: false as const,
    label: 'Studio or service',
    hint: 'Shared studio kiln or outside firing',
    Icon: Building2,
    accent: '#526b43',
    tint: '#eef5e9',
  },
];

export const RoleStep: React.FC<RoleStepProps> = ({ draft, updateDraft, USER_TYPE_CONFIG }) => {
  const scaleAnims = useRef(
    Object.fromEntries(
      Object.keys(USER_TYPE_CONFIG).map((key) => [key, new Animated.Value(1)])
    )
  ).current;

  const kilnUnset = draft.hasOwnKiln === null || draft.hasOwnKiln === undefined;

  const handleSelect = (key: OnboardingUserType) => {
    Animated.sequence([
      Animated.spring(scaleAnims[key], { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }),
      Animated.spring(scaleAnims[key], { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
    ]).start();

    const baseModules = USER_TYPE_CONFIG[key].defaultModules;
    const modules = draft.hasOwnKiln === false
      ? baseModules.filter((m) => m !== 'kiln')
      : draft.hasOwnKiln === true
        ? Array.from(new Set<AppModule>([...baseModules, 'kiln'] as AppModule[]))
        : baseModules;

    updateDraft({
      userType: key,
      pricingUserType: USER_TYPE_CONFIG[key].pricingUserType,
      activeModules: modules,
      studioCode: key === 'studio-potter' ? draft.studioCode : '',
    });
  };

  function applyKilnAccess(hasKiln: boolean) {
    const userType = draft.userType as OnboardingUserType;
    const base = USER_TYPE_CONFIG[userType].defaultModules;
    const modules = hasKiln
      ? Array.from(new Set<AppModule>([...base, 'kiln']))
      : base.filter((m: AppModule) => m !== 'kiln');
    updateDraft({ hasOwnKiln: hasKiln, activeModules: modules });
  }

  const studioConnectCard = (
    <View
      style={{
        marginTop: 6,
        marginLeft: 6,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(82, 107, 67, 0.28)',
        borderLeftWidth: 3,
        borderLeftColor: '#526b43',
        backgroundColor: 'rgba(238, 245, 233, 0.85)',
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Home size={16} color="#526b43" />
        <Text style={{ fontSize: 13, fontWeight: '700', color: 'hsl(24 30% 12%)' }}>
          Connect to your studio
        </Text>
      </View>
      <Text style={{ fontSize: 12, color: 'hsl(24 14% 42%)', lineHeight: 17, marginBottom: 10 }}>
        Optional. If your shared studio uses Pottery Nook, ask the owner for their studio ID. If your studio does not use the app yet, no problem, you can skip and connect later in Community.
      </Text>
      <TextInput
        value={draft.studioCode ?? ''}
        onChangeText={(studioCode) => updateDraft({ studioCode })}
        placeholder="Studio ID (optional)"
        placeholderTextColor="hsl(24 14% 55%)"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: 'rgba(82, 107, 67, 0.25)',
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
          color: 'hsl(24 30% 20%)',
          backgroundColor: '#fffdf8',
        }}
      />
      <Text style={{ fontSize: 11, color: 'hsl(24 14% 48%)', marginTop: 8, lineHeight: 15 }}>
        We&apos;ll send a join request when you finish setup (if you&apos;re signed in). The owner approves before you&apos;re linked.
      </Text>
    </View>
  );

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 0 }}>
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

      {/* Kiln question first, visible without scrolling past all role cards */}
      <LinearGradient
        colors={kilnUnset ? ['#fff4e8', '#ffe8cf'] : ['#fff8ed', '#fff1df']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginTop: 16,
          borderRadius: 22,
          borderWidth: kilnUnset ? 1.5 : 1,
          borderColor: kilnUnset ? 'hsl(39 57% 51%)' : 'rgba(94, 60, 36, 0.14)',
          padding: 14,
          shadowColor: '#8d552f',
          shadowOffset: { width: 0, height: kilnUnset ? 6 : 2 },
          shadowOpacity: kilnUnset ? 0.14 : 0.06,
          shadowRadius: kilnUnset ? 12 : 6,
          elevation: kilnUnset ? 3 : 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'hsl(39 57% 51%)',
            }}
          >
            <Flame size={20} color="#fff8ed" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: 'hsl(24 30% 12%)' }}>
              About your kiln
            </Text>
            <Text style={{ fontSize: 12, color: 'hsl(24 14% 42%)', marginTop: 2, lineHeight: 17 }}>
              We use this to show the Kiln tab and firing tools.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {KILN_OPTIONS.map((opt) => {
            const selected = draft.hasOwnKiln === opt.value;
            const OptIcon = opt.Icon;
            return (
              <Pressable
                key={opt.label}
                onPress={() => applyKilnAccess(opt.value)}
                style={{ flex: 1 }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <LinearGradient
                  colors={selected ? [opt.tint, '#fffdf8'] : ['#fffdf8', '#fff9ef']}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    borderWidth: 1.5,
                    borderColor: selected ? opt.accent : 'rgba(94, 60, 36, 0.14)',
                    alignItems: 'center',
                    minHeight: 88,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 11,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? opt.accent : opt.tint,
                      marginBottom: 8,
                    }}
                  >
                    <OptIcon size={16} color={selected ? '#fff8ed' : opt.accent} />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: selected ? 'hsl(24 30% 12%)' : 'hsl(24 14% 44%)',
                      textAlign: 'center',
                      lineHeight: 16,
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10.5,
                      color: 'hsl(24 14% 48%)',
                      textAlign: 'center',
                      marginTop: 4,
                      lineHeight: 14,
                    }}
                  >
                    {opt.hint}
                  </Text>
                  {selected ? (
                    <View
                      style={{
                        marginTop: 8,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: opt.accent,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={11} color="#fff8ed" strokeWidth={3} />
                    </View>
                  ) : null}
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {kilnUnset ? (
          <Text style={{ fontSize: 11, color: 'hsl(39 45% 38%)', marginTop: 10, textAlign: 'center', fontWeight: '600' }}>
            Pick one to continue
          </Text>
        ) : null}
      </LinearGradient>

      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'hsl(28 38% 34%)',
          marginTop: 18,
          marginBottom: 10,
        }}
      >
        Your practice
      </Text>

      <View style={{ gap: 9 }}>
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
              {key === 'studio-potter' && active ? studioConnectCard : null}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};
