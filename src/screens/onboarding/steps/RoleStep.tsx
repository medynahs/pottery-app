import { Input } from '@/src/components/ui/input.ios';
import type { AppModule, OnboardingUserType, PracticeMode, UserRole } from '@/src/store/appStore';
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

// Short single-line descriptions for compact cards
const SHORT_DESC: Record<OnboardingUserType, string> = {
  'home-potter':              'Personal practice · home kiln & piece tracking',
  'studio-potter':            'Shared studio · piece flow & firing context',
  'studio-owner-technician':  'Kiln management · member ops & scheduling',
  'business-owner':           'Production tracking · pricing & sales tools',
  'not-sure':                 'Everything enabled · refine your setup later',
};

// Roles that collect a studio/brand name
const STUDIO_NAME_ROLES: OnboardingUserType[] = ['studio-owner-technician', 'home-potter', 'business-owner'];
const STUDIO_NAME_META: Partial<Record<OnboardingUserType, { label: string; placeholder: string }>> = {
  'studio-owner-technician': { label: 'Studio name',                  placeholder: 'e.g. The Kiln Room' },
  'home-potter':             { label: 'Home studio name (optional)',   placeholder: 'e.g. The Clay Nook' },
  'business-owner':          { label: 'Brand or studio name (optional)', placeholder: 'e.g. Ember Ceramics' },
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

  const studioNameMeta = STUDIO_NAME_META[draft.userType as OnboardingUserType];

  return (
    <View style={{ paddingBottom: 8 }}>
      {/* Heading */}
      <View style={{ paddingHorizontal: 24, paddingTop: 22, paddingBottom: 20 }}>
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold',
            fontSize: 28,
            lineHeight: 36,
            color: 'hsl(24 30% 12%)',
          }}
        >
          Your pottery practice
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: 'hsl(24 15% 50%)',
            marginTop: 8,
            lineHeight: 22,
          }}
        >
          This personalises your defaults. You can change it anytime in settings.
        </Text>
      </View>

      {/* Role cards */}
      <View style={{ paddingHorizontal: 24, gap: 8 }}>
        {(Object.entries(USER_TYPE_CONFIG) as Array<[OnboardingUserType, UserTypeConfig]>).map(([key, option]) => {
          const Icon = option.icon;
          const active = draft.userType === key;
          return (
            <Animated.View key={key} style={{ transform: [{ scale: scaleAnims[key] }] }}>
              <Pressable
                onPress={() => handleSelect(key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderColor: active ? 'hsl(24 25% 22%)' : 'hsl(24 10% 86%)',
                  backgroundColor: active ? 'hsl(34 30% 96%)' : 'hsl(34 20% 99%)',
                  padding: 14,
                }}
              >
                {/* Icon */}
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? 'hsl(24 30% 18%)' : 'hsl(24 10% 91%)',
                  }}
                >
                  <Icon
                    size={17}
                    color={active ? 'hsl(34 35% 90%)' : 'hsl(24 20% 42%)'}
                  />
                </View>

                {/* Label + description */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Fraunces_600SemiBold',
                      fontSize: 14,
                      color: 'hsl(24 30% 12%)',
                      lineHeight: 19,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: 'hsl(24 12% 52%)',
                      marginTop: 2,
                      lineHeight: 17,
                    }}
                    numberOfLines={1}
                  >
                    {SHORT_DESC[key]}
                  </Text>
                </View>

                {/* Radio dot */}
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: active ? 'hsl(24 25% 22%)' : 'hsl(24 10% 78%)',
                    backgroundColor: active ? 'hsl(24 25% 22%)' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {active && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'white',
                      }}
                    />
                  )}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Studio / brand name — only for roles that own a space */}
      {STUDIO_NAME_ROLES.includes(draft.userType) && studioNameMeta && (
        <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: 'hsl(24 10% 86%)',
              backgroundColor: 'hsl(34 20% 99%)',
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: 'hsl(24 15% 50%)',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              {studioNameMeta.label}
            </Text>
            <Input
              value={draft.studioName}
              onChangeText={(value: string) => updateDraft({ studioName: value })}
              placeholder={studioNameMeta.placeholder}
            />
            <Text
              style={{
                fontSize: 11,
                color: 'hsl(24 10% 60%)',
                marginTop: 6,
              }}
            >
              Shown on your overview. You can change it anytime.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};
