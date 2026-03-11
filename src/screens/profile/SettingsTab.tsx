import { Text } from '@/src/components/ui/text';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import {
  Bell, Clock, Database, Flame, Globe, HelpCircle,
  Layers, Lock, LogOut, Mail, Moon, Palette,
  Shield, Skull, Sparkles, Thermometer, Trophy, Zap,
} from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { SectionLabel, SettingsGroup, SettingsRow, ToggleRow } from './shared';

export type NotifState = {
  kilnFinished:  boolean;
  pieceDrying:   boolean;
  bisqueReady:   boolean;
  achievement:   boolean;
  weeklySummary: boolean;
};

export function SettingsTab({
  notifs,
  toggle,
}: {
  notifs: NotifState;
  toggle: (key: keyof NotifState) => void;
}) {
  const router = useRouter();
  const { enabledStages } = useStageConfig();
  const clayBodies = useAppStore((s) => s.clayBodies);

  return (
    <>
      <SectionLabel title="Studio" />
      <SettingsGroup>
        <SettingsRow icon={Layers}      iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="Stage Customization" value={`${enabledStages.length} stages`} onPress={() => router.push('/stage-customization')} />
        <SettingsRow icon={Database}    iconColor="hsl(24 30% 45%)"  iconBg="bg-stone-100" label="Clay Bodies"         value={`${clayBodies.length} saved`} onPress={() => router.push('/clay-bodies')} />
        <SettingsRow icon={Sparkles}    iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Glazes"              value="11 saved" />
        <SettingsRow icon={Thermometer} iconColor="hsl(0 55% 45%)"   iconBg="bg-red-50"    label="Kilns"               value="2 kilns" />
        <SettingsRow icon={Flame}       iconColor="hsl(25 90% 55%)"  iconBg="bg-orange-50" label="Bisque Cone"         value="Cone 06" />
        <SettingsRow icon={Zap}         iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Glaze Cone"          value="Cone 6" isLast />
      </SettingsGroup>

      <SectionLabel title="Preferences" />
      <SettingsGroup>
        <SettingsRow icon={Database} iconColor="hsl(24 30% 45%)" iconBg="bg-stone-100" label="Default Clay Body" value="Stoneware" />
        <SettingsRow icon={Moon}     iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"  label="Theme"             value="Light" />
        <SettingsRow icon={Palette}  iconColor="hsl(15 50% 50%)"  iconBg="bg-red-50"   label="Accent Color"      value="Terracotta" isLast />
      </SettingsGroup>

      <SectionLabel title="Notifications" />
      <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-4">
        <ToggleRow icon={Flame}  iconColor="hsl(25 90% 55%)"  iconBg="bg-orange-50" label="Kiln Finished"  value={notifs.kilnFinished}  onToggle={() => toggle('kilnFinished')} />
        <ToggleRow icon={Clock}  iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="Drying Alert"   value={notifs.pieceDrying}   onToggle={() => toggle('pieceDrying')} />
        <ToggleRow icon={Trophy} iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"  label="Achievements"   value={notifs.achievement}   onToggle={() => toggle('achievement')} />
        <ToggleRow icon={Bell}   iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Weekly Summary" value={notifs.weeklySummary} onToggle={() => toggle('weeklySummary')} isLast />
      </View>

      <SectionLabel title="Account" />
      <SettingsGroup>
        <SettingsRow icon={Mail}   iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"  label="Change Email" />
        <SettingsRow icon={Lock}   iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Change Password" />
        <SettingsRow icon={Globe}  iconColor="hsl(24 30% 45%)"  iconBg="bg-stone-100" label="Language"         value="English" />
        <SettingsRow icon={Shield} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="Privacy Settings" isLast />
      </SettingsGroup>

      <SectionLabel title="Support" />
      <SettingsGroup>
        <SettingsRow icon={HelpCircle} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"  label="FAQ" />
        <SettingsRow icon={Mail}       iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50" label="Contact Support" isLast />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow icon={LogOut} iconColor="hsl(0 55% 45%)" iconBg="bg-red-50" label="Sign Out"       danger />
        <SettingsRow icon={Skull}  iconColor="hsl(0 55% 45%)" iconBg="bg-red-50" label="Delete Account" danger isLast />
      </SettingsGroup>

      <View className="px-6 mb-6">
        <Text className="text-xs text-muted-foreground text-center">
          Pottery Life v1.0.0 · Made with ♥ for potters
        </Text>
      </View>
    </>
  );
}
