import { SectionLabel } from '@/src/components/SectionLabel';
import { SettingsGroup } from '@/src/components/SettingsGroup';
import { SettingsRow } from '@/src/components/SettingsRow';
import { ToggleRow } from '@/src/components/ToggleRow';
import { Text } from '@/src/components/ui/text';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { useAppStore } from '@/src/store/appStore';
import { PRICING_USER_TYPE_LABELS } from '@/src/types/pricing';
import { useRouter } from 'expo-router';
import {
  Bell,
  Box,
  Calculator,
  Clock,
  Database,
  Flame,
  Hammer,
  Layers,
  Moon,
  Palette,
  Trophy,
  Zap
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type CustomizationNotifState = {
  kilnFinished: boolean;
  pieceDrying: boolean;
  achievement: boolean;
  weeklySummary: boolean;
};

export default function AppCustomizationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>

      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            App Customization
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">Studio setup, defaults, and app behavior</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-muted px-4 py-2 rounded-full">
          <Text className="text-sm font-medium text-foreground">Done</Text>
        </TouchableOpacity>
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
        <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-10">
          <ToggleRow icon={Flame} iconColor="hsl(25 90% 55%)" iconBg="bg-orange-50" label="Kiln Finished" value={notifs.kilnFinished} onToggle={() => toggleNotif('kilnFinished')} />
          <ToggleRow icon={Clock} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Drying Alert" value={notifs.pieceDrying} onToggle={() => toggleNotif('pieceDrying')} />
          <ToggleRow icon={Trophy} iconColor="hsl(100 40% 45%)" iconBg="bg-green-50" label="Achievements" value={notifs.achievement} onToggle={() => toggleNotif('achievement')} />
          <ToggleRow icon={Bell} iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Weekly Summary" value={notifs.weeklySummary} onToggle={() => toggleNotif('weeklySummary')} isLast />
        </View>
      </ScrollView>
    </View>
  );
}
