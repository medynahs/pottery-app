import {
    DialogCard,
    DialogHeader,
    DialogShell,
    ModalSheetActions,
    SheetButton,
    useDialogMaxHeight,
} from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { USER_TYPE_CONFIG } from '@/src/config/onboardingOptions';
import { BrandColors } from '@/src/constants/theme';
import { useAppStore, type OnboardingUserType } from '@/src/store/appStore';
import { applyPricingUserTypePreset } from '@/src/types/pricing';
import { pricingUserTypeForArchetype } from '@/src/utils/roleBasedUx';
import { Check } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

type PracticeTypePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function PracticeTypePickerSheet({ visible, onClose }: PracticeTypePickerSheetProps) {
  const dialogMaxHeight = useDialogMaxHeight(0.78);
  const listMaxHeight = Math.max(160, dialogMaxHeight - 150);
  const userType = useAppStore((s) => s.onboardingProfile.userType);
  const hasOwnKiln = useAppStore((s) => s.onboardingProfile.hasOwnKiln);
  const setOnboardingProfile = useAppStore((s) => s.setOnboardingProfile);
  const setPracticeMode = useAppStore((s) => s.setPracticeMode);
  const setRole = useAppStore((s) => s.setRole);
  const setEnabledModules = useAppStore((s) => s.setEnabledModules);
  const setPricingSettings = useAppStore((s) => s.setPricingSettings);
  const showToast = useAppStore((s) => s.showToast);
  const [pending, setPending] = React.useState<OnboardingUserType | null>(null);

  React.useEffect(() => {
    if (!visible) {
      setPending(null);
    }
  }, [visible]);

  const applyType = (nextType: OnboardingUserType) => {
    const config = USER_TYPE_CONFIG[nextType];
    let modules = [...config.defaultModules];
    if (hasOwnKiln === false) {
      modules = modules.filter((m) => m !== 'kiln');
    }

    setOnboardingProfile({
      userType: nextType,
      pricingUserType: config.pricingUserType,
      activeModules: modules,
    });
    setPracticeMode(config.practiceMode);
    setRole(config.role);
    setEnabledModules(modules);
    setPricingSettings(applyPricingUserTypePreset(
      useAppStore.getState().pricingSettings,
      pricingUserTypeForArchetype(nextType),
    ));
    showToast(`Practice type set to ${config.label}`, 'success');
    setPending(null);
    onClose();
  };

  const handleSelect = (key: OnboardingUserType) => {
    if (key === userType) {
      onClose();
      return;
    }
    setPending(key);
  };

  const handleClose = () => {
    setPending(null);
    onClose();
  };

  return (
    <DialogShell visible={visible} onClose={handleClose}>
      <DialogCard maxHeight={dialogMaxHeight}>
        <DialogHeader onClose={handleClose}>
          <Text className="text-xl font-serif font-bold text-foreground">
            {pending ? 'Update practice type?' : 'Change practice type'}
          </Text>
          {!pending ? (
            <Text className="text-sm text-muted-foreground mt-1 leading-5">
              Updates your default tabs and pricing presets. You can still customize tabs in App
              Customization.
            </Text>
          ) : null}
        </DialogHeader>

        {pending ? (
          <View className="px-6 pt-2 pb-6 justify-between" style={{ minHeight: 0 }}>
            <Text className="text-sm text-muted-foreground leading-5">
              Switch to &ldquo;{USER_TYPE_CONFIG[pending].label}&rdquo;? Tab defaults and pricing presets will
              update.
            </Text>
            <View className="mt-6">
              <ModalSheetActions>
                <SheetButton label="Update" onPress={() => applyType(pending)} variant="confirm" />
                <SheetButton label="Cancel" onPress={() => setPending(null)} variant="cancel" />
              </ModalSheetActions>
            </View>
          </View>
        ) : (
          <ScrollView
            className="px-6"
            style={{ maxHeight: listMaxHeight }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {(Object.keys(USER_TYPE_CONFIG) as OnboardingUserType[]).map((key) => {
              const config = USER_TYPE_CONFIG[key];
              const selected = userType === key;
              const Icon = config.icon;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleSelect(key)}
                  activeOpacity={0.85}
                  className={`flex-row items-center gap-3 rounded-2xl border p-4 mb-2 ${
                    selected ? 'border-primary bg-primary/5' : 'border-border bg-background'
                  }`}
                >
                  <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
                    <Icon size={18} color={selected ? BrandColors.primary : 'hsl(24 20% 45%)'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{config.label}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={2}>
                      {config.help}
                    </Text>
                  </View>
                  {selected ? <Check size={18} color={BrandColors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </DialogCard>
    </DialogShell>
  );
}
