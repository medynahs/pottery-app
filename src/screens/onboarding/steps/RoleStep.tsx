import { Input } from '@/src/components/ui/input.ios';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import type { AppModule, OnboardingUserType, PracticeMode, UserRole } from '@/src/store/appStore';
import { Building2 } from 'lucide-react-native';
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

const STUDIO_ROLES: OnboardingUserType[] = ['studio-potter', 'hybrid-potter', 'studio-owner-technician'];

export const RoleStep: React.FC<RoleStepProps> = ({ draft, updateDraft, USER_TYPE_CONFIG }) => {
  return (
    <View className="gap-3 mt-3">
      {(Object.entries(USER_TYPE_CONFIG) as Array<[OnboardingUserType, UserTypeConfig]>).map(([key, option]) => {
        const Icon = option.icon;
        const active = draft.userType === key;
        return (
          <React.Fragment key={key}>
            <Pressable
              onPress={() => {
                const nextModules = USER_TYPE_CONFIG[key].defaultModules;
                updateDraft({
                  userType: key,
                  pricingUserType: USER_TYPE_CONFIG[key].pricingUserType,
                  activeModules: nextModules,
                  studioCode: STUDIO_ROLES.includes(key) ? draft.studioCode : '',
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

            {key === 'not-sure' && active && (
              <View className="rounded-3xl border border-dashed border-border bg-muted/40 px-4 py-3 -mt-1">
                <Text className="text-xs text-muted-foreground leading-5">
                  You'll get all modules enabled with balanced defaults. You can change your role and tweak everything from your profile settings at any time.
                </Text>
              </View>
            )}

            {key === 'studio-potter' && active && (
              <View className="rounded-3xl border border-blue-200 bg-blue-50/60 px-4 pt-4 pb-5 -mt-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Building2 size={13} color="hsl(213 70% 45%)" />
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'hsl(213 70% 45%)' }}>
                    Does your studio use PotteryNook?
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground mb-3 leading-5">
                  Enter your studio's code to link up — your owner will see your pieces ready for firing.
                </Text>
                <Input
                  value={draft.studioCode}
                  onChangeText={(value: string) => updateDraft({ studioCode: value.toUpperCase() })}
                  placeholder="e.g. CLAY-4821"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <Text className="text-[11px] text-muted-foreground mt-2">Leave blank if your studio isn't on PotteryNook yet.</Text>
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};
