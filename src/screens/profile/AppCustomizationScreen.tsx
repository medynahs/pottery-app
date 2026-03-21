import { Text } from '@/src/components/ui/text';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { PRICING_USER_TYPE_LABELS } from '@/src/screens/pieces/pricing';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import {
    Bell,
    Box,
    Calculator,
    ChevronDown,
    Clock,
    Database,
    Flame,
    Hammer,
    Layers,
    Moon,
    Palette,
    Trophy,
    Zap,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SectionLabel, SettingsGroup, SettingsRow, ToggleRow } from './shared';

export type CustomizationNotifState = {
  kilnFinished: boolean;
  pieceDrying: boolean;
  achievement: boolean;
  weeklySummary: boolean;
};

export default function AppCustomizationScreen() {
  const router = useRouter();
  const { enabledStages } = useStageConfig();
  const clayBodies = useAppStore((s) => s.clayBodies);
  const formingMethods = useAppStore((s) => s.formingMethods);
  const pieceFormOptions = useAppStore((s) => s.pieceFormOptions);
  const defaultBisqueTemp = useAppStore((s) => s.defaultBisqueTemp);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const pricingSettings = useAppStore((s) => s.pricingSettings);
  const pricingOnboardingCompleted = useAppStore((s) => s.pricingOnboardingCompleted);
  const backendUsers = useAppStore((s) => s.backendUsers);
  const backendUsersStatus = useAppStore((s) => s.backendUsersStatus);
  const backendUsersError = useAppStore((s) => s.backendUsersError);
  const loadBackendUsers = useAppStore((s) => s.loadBackendUsers);

  const [notifs, setNotifs] = React.useState<CustomizationNotifState>({
    kilnFinished: true,
    pieceDrying: true,
    achievement: true,
    weeklySummary: false,
  });

  const toggleNotif = (key: keyof CustomizationNotifState) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const backendStatusLabel =
    backendUsersStatus === 'loading'
      ? 'Syncing…'
      : backendUsersStatus === 'success'
        ? 'Connected'
        : backendUsersStatus === 'error'
          ? 'Error'
          : 'Idle';

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-muted/60 mr-3"
        >
          <ChevronDown size={20} color="hsl(24 30% 40%)" style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">App Customization</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">Studio setup, defaults, and app behavior</Text>
        </View>
      </View>

      <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
        <SectionLabel title="Studio" />
        <SettingsGroup>
          <SettingsRow icon={Layers} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Stage Customization" value={`${enabledStages.length} stages`} onPress={() => router.push('/stage-customization')} />
          <SettingsRow icon={Database} iconColor="hsl(24 30% 45%)" iconBg="bg-stone-100" label="Clay Bodies" value={`${clayBodies.length} saved`} onPress={() => router.push('/clay-bodies')} />
          <SettingsRow icon={Hammer} iconColor="hsl(24 40% 45%)" iconBg="bg-stone-100" label="Forming Methods" value={`${formingMethods.length} methods`} onPress={() => router.push('/forming-methods')} />
          <SettingsRow icon={Box} iconColor="hsl(24 40% 45%)" iconBg="bg-stone-100" label="Piece Forms" value={`${pieceFormOptions.length} forms`} onPress={() => router.push('/piece-forms')} />
          <SettingsRow icon={Flame} iconColor="hsl(25 90% 55%)" iconBg="bg-orange-50" label="Bisque Cone" value={defaultBisqueTemp ?? 'None'} onPress={() => router.push('/bisque-cone')} />
          <SettingsRow icon={Zap} iconColor="hsl(38 80% 50%)" iconBg="bg-amber-50" label="Glaze Cone" value={defaultGlazeTemp ?? 'None'} onPress={() => router.push('/glaze-cone')} />
          <SettingsRow icon={Calculator} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Pricing Setup" value={pricingOnboardingCompleted ? PRICING_USER_TYPE_LABELS[pricingSettings.pricingUserType] : 'Required'} onPress={() => router.push('/pricing-onboarding' as never)} />
          <SettingsRow icon={Calculator} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Pricing Rules" value={pricingSettings.studioLabel} onPress={() => router.push('/pricing-rules' as never)} isLast />
        </SettingsGroup>

        <SectionLabel title="Preferences" />
        <SettingsGroup>
          <SettingsRow icon={Moon} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Theme" value="Light" />
          <SettingsRow icon={Palette} iconColor="hsl(15 50% 50%)" iconBg="bg-red-50" label="Accent Color" value="Terracotta" isLast />
        </SettingsGroup>

        <SectionLabel title="Notifications" />
        <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-4">
          <ToggleRow icon={Flame} iconColor="hsl(25 90% 55%)" iconBg="bg-orange-50" label="Kiln Finished" value={notifs.kilnFinished} onToggle={() => toggleNotif('kilnFinished')} />
          <ToggleRow icon={Clock} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Drying Alert" value={notifs.pieceDrying} onToggle={() => toggleNotif('pieceDrying')} />
          <ToggleRow icon={Trophy} iconColor="hsl(100 40% 45%)" iconBg="bg-green-50" label="Achievements" value={notifs.achievement} onToggle={() => toggleNotif('achievement')} />
          <ToggleRow icon={Bell} iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Weekly Summary" value={notifs.weeklySummary} onToggle={() => toggleNotif('weeklySummary')} isLast />
        </View>

        <SectionLabel title="Backend" />
        <SettingsGroup>
          <SettingsRow
            icon={Database}
            iconColor="hsl(24 30% 45%)"
            iconBg="bg-stone-100"
            label="Users Endpoint"
            value={`${backendUsers.length} users`}
          />
          <SettingsRow
            icon={Zap}
            iconColor="hsl(38 80% 50%)"
            iconBg="bg-amber-50"
            label="Sync Users Now"
            value={backendStatusLabel}
            onPress={() => {
              void loadBackendUsers();
            }}
            isLast
          />
        </SettingsGroup>

        <View className="mx-6 bg-card rounded-2xl border border-border px-4 py-3 mb-6">
          {backendUsersError ? (
            <Text className="text-xs text-destructive">{backendUsersError}</Text>
          ) : backendUsers.length === 0 ? (
            <Text className="text-xs text-muted-foreground">No backend users loaded yet.</Text>
          ) : (
            backendUsers.map((backendUser, index) => (
              <View
                key={backendUser.id}
                className={`py-2 ${index < backendUsers.length - 1 ? 'border-b border-border' : ''}`}
              >
                <Text className="text-sm font-medium text-foreground">{backendUser.name}</Text>
                <Text className="text-xs text-muted-foreground">{backendUser.role}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
