import { CUSTOMIZABLE_MODULE_OPTIONS } from '@/src/config/appModules';
import { SectionLabel } from '@/src/components/SectionLabel';
import { SettingsGroup } from '@/src/components/SettingsGroup';
import { SettingsRow } from '@/src/components/SettingsRow';
import { ToggleRow } from '@/src/components/ToggleRow';
import { Text } from '@/src/components/ui/text';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { useAppStore, useNormalizedEnabledModules } from '@/src/store/appStore';
import { PRICING_USER_TYPE_LABELS } from '@/src/types/pricing';
import { useRouter } from 'expo-router';
import { STAGE_LABEL } from '@/src/screens/pieces/utils/constants';
import {
  Box,
  Calculator,
  Database,
  Flame,
  Hammer,
  Layers,
  Lightbulb,
  Zap
} from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppCustomizationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { enabledStages } = useStageConfig();
  const markSetupProgress = useAppStore((s) => s.markSetupProgress);
  const defaultNewPieceStage = useAppStore((s) => s.defaultNewPieceStage);
  const setDefaultNewPieceStage = useAppStore((s) => s.setDefaultNewPieceStage);
  const clayBodies = useAppStore((s) => s.clayBodies);
  const [stagePickerOpen, setStagePickerOpen] = React.useState(false);

  React.useEffect(() => {
    markSetupProgress('modulesReviewed');
  }, [markSetupProgress]);
  const formingMethods = useAppStore((s) => s.formingMethods);
  const pieceFormOptions = useAppStore((s) => s.pieceFormOptions);
  const defaultBisqueTemp = useAppStore((s) => s.defaultBisqueTemp);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const pricingSettings = useAppStore((s) => s.pricingSettings);
  const pricingOnboardingCompleted = useAppStore((s) => s.pricingOnboardingCompleted);
  const enabledModules = useNormalizedEnabledModules();
  const toggleModule = useAppStore((s) => s.toggleModule);

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
          <SettingsRow
            icon={Lightbulb}
            iconColor="hsl(213 80% 55%)"
            iconBg="bg-blue-50"
            label="Default New Piece Stage"
            value={STAGE_LABEL[defaultNewPieceStage] ?? 'Idea'}
            onPress={() => setStagePickerOpen(true)}
          />
          <SettingsRow icon={Layers} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Stage Customization" value={`${enabledStages.length} stages`} onPress={() => router.push('/stage-customization')} />
          <SettingsRow icon={Database} iconColor="hsl(24 30% 45%)" iconBg="bg-stone-100" label="Clay Bodies" value={`${clayBodies.length} saved`} onPress={() => router.push('/clay-bodies')} />
          <SettingsRow icon={Hammer} iconColor="hsl(24 40% 45%)" iconBg="bg-stone-100" label="Forming Methods" value={`${formingMethods.length} methods`} onPress={() => router.push('/forming-methods')} />
          <SettingsRow icon={Box} iconColor="hsl(24 40% 45%)" iconBg="bg-stone-100" label="Piece Forms" value={`${pieceFormOptions.length} forms`} onPress={() => router.push('/piece-forms')} />
          <SettingsRow icon={Flame} iconColor="hsl(39 57% 51%)" iconBg="bg-primary/10" label="Bisque Cone" value={defaultBisqueTemp ?? 'None'} onPress={() => router.push('/bisque-cone')} />
          <SettingsRow icon={Zap} iconColor="hsl(38 80% 50%)" iconBg="bg-amber-50" label="Glaze Cone" value={defaultGlazeTemp ?? 'None'} onPress={() => router.push('/glaze-cone')} />
          <SettingsRow icon={Calculator} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Pricing Setup" value={pricingOnboardingCompleted ? PRICING_USER_TYPE_LABELS[pricingSettings.pricingUserType] : 'Required'} onPress={() => router.push('/pricing-onboarding' as never)} />
          <SettingsRow icon={Calculator} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Pricing Rules" value={pricingSettings.studioLabel} onPress={() => router.push('/pricing-rules' as never)} isLast />
        </SettingsGroup>

        <SectionLabel title="Active Modules" />
        <SettingsGroup>
          {CUSTOMIZABLE_MODULE_OPTIONS.map((mod, i) => (
            <ToggleRow
              key={mod.id}
              icon={mod.icon}
              iconColor={mod.iconColor}
              iconBg={mod.iconBg}
              label={mod.label}
              value={enabledModules.includes(mod.id)}
              onToggle={() => toggleModule(mod.id)}
              isLast={i === CUSTOMIZABLE_MODULE_OPTIONS.length - 1}
            />
          ))}
        </SettingsGroup>

        <View className="mb-10" />
      </ScrollView>

      <Modal visible={stagePickerOpen} transparent animationType="fade" onRequestClose={() => setStagePickerOpen(false)}>
        <Pressable className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={() => setStagePickerOpen(false)}>
          <Pressable className="bg-card rounded-t-3xl px-5 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
            <Text className="text-base font-semibold text-foreground mb-1">Default stage for new pieces</Text>
            <Text className="text-xs text-muted-foreground mb-4">New pieces start here unless you change it when adding.</Text>
            {enabledStages.filter((s) => s.id !== 'cemetery').map((stage, index, list) => (
              <TouchableOpacity
                key={stage.id}
                onPress={() => {
                  setDefaultNewPieceStage(stage.id);
                  setStagePickerOpen(false);
                }}
                className={`flex-row items-center justify-between px-3 py-3 rounded-xl${index < list.length - 1 ? ' mb-1' : ''}${defaultNewPieceStage === stage.id ? ' bg-primary/10' : ''}`}
              >
                <Text className="text-sm font-medium text-foreground">{stage.label}</Text>
                {defaultNewPieceStage === stage.id ? (
                  <Text className="text-xs font-semibold text-primary">Selected</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
