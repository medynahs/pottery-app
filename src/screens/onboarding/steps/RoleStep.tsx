import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import type { AppModule, OnboardingUserType, PracticeMode, UserRole } from '@/src/store/appStore';
import React from 'react';
import { View } from 'react-native';

// Types for props
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

export const RoleStep: React.FC<RoleStepProps> = ({ draft, updateDraft, USER_TYPE_CONFIG }) => {
  return (
    <View className="gap-3 mt-3">
      {(Object.entries(USER_TYPE_CONFIG) as Array<[OnboardingUserType, UserTypeConfig]>).map(([key, option]) => {
        const Icon = option.icon;
        const active = draft.userType === key;
        return (
          <Pressable
            key={key}
            onPress={() => {
              const nextModules = USER_TYPE_CONFIG[key].defaultModules;
              updateDraft({
                userType: key,
                pricingUserType: USER_TYPE_CONFIG[key].pricingUserType,
                activeModules: nextModules,
              });
            }}
            className={`rounded-3xl border p-4 ${active ? 'border-foreground bg-card' : 'border-border bg-card/80'}`}
          >
            <View className="flex-row items-start gap-3">
              <View className={`w-11 h-11 rounded-2xl items-center justify-center ${active ? 'bg-foreground' : 'bg-muted'}`}> 
                <Icon size={18} color={active ? 'hsl(34 35% 92%)' : 'hsl(24 20% 40%)'} />
              </View>
              <View className="flex-1">
                <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{option.label}</Text>
                <Text className="text-xs text-muted-foreground mt-1 leading-5">{option.description}</Text>
                <Text className="text-[11px] text-primary mt-2">{option.help}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
