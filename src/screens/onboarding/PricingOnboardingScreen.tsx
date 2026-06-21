import { CustomizationSettingsShell } from '@/src/components/settings/CustomizationSettingsShell';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import {
  buildDefaultPricingSettings,
  PRICING_USER_TYPE_LABELS,
  type PricingUserType,
} from '@/src/types/pricing';
import { useRouter } from 'expo-router';
import { BriefcaseBusiness, Home, Shapes } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
const OPTION_META: Record<PricingUserType, { icon: typeof Home; eyebrow: string; blurb: string }> = {
  hobby: {
    icon: Home,
    eyebrow: 'Recover materials and time',
    blurb: 'Best if you want the app to cover clay, firing, and some labor without pricing like a full business yet.',
  },
  'side-business': {
    icon: Shapes,
    eyebrow: 'Balanced studio pricing',
    blurb: 'A strong middle ground for makers selling regularly at markets, online, or through small shop drops.',
  },
  'full-time': {
    icon: BriefcaseBusiness,
    eyebrow: 'Sustainable studio income',
    blurb: 'Use this when your pricing needs to carry your wages, admin time, taxes, fees, and a real studio overhead load.',
  },
};

export default function PricingOnboardingScreen() {
  const router = useRouter();
  const pricingSettings = useAppStore((state) => state.pricingSettings);
  const pricingOnboardingCompleted = useAppStore((state) => state.pricingOnboardingCompleted);
  const completePricingOnboarding = useAppStore((state) => state.completePricingOnboarding);
  const [selected, setSelected] = React.useState<PricingUserType>(pricingSettings.pricingUserType ?? 'side-business');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const previewSettings = React.useMemo(() => buildDefaultPricingSettings(selected), [selected]);

  const handleContinue = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const wasAlreadyCompleted = pricingOnboardingCompleted;
    completePricingOnboarding(selected);

    if (wasAlreadyCompleted || router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/overview' as never);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/overview' as never);
    }
  };

  return (
    <CustomizationSettingsShell
      eyebrow="Pricing setup"
      title="Pick the pricing profile that matches how you make and sell."
      subtitle="This only sets your starting defaults. You can fine-tune firing, clay, glaze, labor, fees, and tax later in Pricing Rules."
      onBack={handleBack}
      onSave={handleContinue}
      saveLabel={isSubmitting ? 'Saving…' : 'Save pricing profile'}
      isSaving={isSubmitting}
    >
      {(['hobby', 'side-business', 'full-time'] as PricingUserType[]).map((option) => {
        const meta = OPTION_META[option];
        const Icon = meta.icon;
        const preview = buildDefaultPricingSettings(option);
        const active = selected === option;

        return (
          <TouchableOpacity
            key={option}
            activeOpacity={0.82}
            onPress={() => setSelected(option)}
            className={`rounded-[28px] border p-5 mb-4 ${active ? 'border-foreground bg-card' : 'border-border bg-card/70'}`}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-row items-start gap-3 flex-1 pr-3">
                <View className={`w-11 h-11 rounded-2xl items-center justify-center ${active ? 'bg-foreground' : 'bg-muted'}`}>
                  <Icon size={18} color={active ? 'hsl(34 35% 92%)' : 'hsl(24 20% 40%)'} />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-primary mb-1">{meta.eyebrow}</Text>
                  <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                    {PRICING_USER_TYPE_LABELS[option]}
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-2 leading-6">{meta.blurb}</Text>
                </View>
              </View>
              <View className={`w-6 h-6 rounded-full border items-center justify-center ${active ? 'border-foreground bg-foreground' : 'border-border bg-background'}`}>
                {active ? <View className="w-2.5 h-2.5 rounded-full bg-background" /> : null}
              </View>
            </View>

            <View className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">Making hours</Text>
                <Text className="text-xs font-medium text-foreground">{preview.defaultWorkHours.toFixed(2)} hr</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Labor rate</Text>
                <Text className="text-xs font-medium text-foreground">{preview.currencySymbol}{preview.hourlyLaborRate.toFixed(2)}/hr</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Clay cost</Text>
                <Text className="text-xs font-medium text-foreground">{preview.currencySymbol}{preview.clayPricePer10kg.toFixed(2)} per 10 kg</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Fees + tax</Text>
                <Text className="text-xs font-medium text-foreground">{preview.sellingFeePct}% + {preview.taxPct}%</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <View className="rounded-2xl border border-border bg-card px-4 py-4 mb-2">
        <Text className="text-sm font-medium text-foreground">Current starter defaults</Text>
        <Text className="text-xs text-muted-foreground mt-1 leading-5">
          {previewSettings.currencySymbol}{previewSettings.clayPricePer10kg.toFixed(2)} per 10 kg clay, {previewSettings.currencySymbol}{previewSettings.defaultGlazeCost.toFixed(2)} glaze base, {previewSettings.defaultWorkHours.toFixed(2)} making hr, {previewSettings.defaultAdminHours.toFixed(2)} admin hr.
        </Text>
      </View>
    </CustomizationSettingsShell>
  );
}
