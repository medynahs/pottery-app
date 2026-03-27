import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import {
  applyPricingUserTypePreset,
  buildDefaultPricingSettings,
  calculatePiecePricingSnapshot,
  normalizePricingSettings,
  parseNumericInput,
  PRICING_USER_TYPE_LABELS,
  type PricingFiringMode,
  type PricingSettings,
  type PricingTier,
  type PricingUserType,
} from '@/src/types/pricing';
import { useRouter } from 'expo-router';
import { Calculator, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TierDraft = {
  minVolumeCm3: string;
  maxVolumeCm3: string;
  ratePerCm3: string;
  baseFee: string;
  quoteOnly: boolean;
};

type PricingDraft = {
  studioLabel: string;
  currencySymbol: string;
  pricingUserType: PricingUserType;
  defaultMode: PricingFiringMode;
  shapeFactor: string;
  clayPricePer10kg: string;
  defaultClayCost: string;
  defaultGlazeCost: string;
  defaultEnergyCost: string;
  defaultOtherCost: string;
  defaultWorkHours: string;
  defaultAdminHours: string;
  hourlyLaborRate: string;
  adminHourlyRate: string;
  recurringOverheadCost: string;
  sellingFeePct: string;
  taxPct: string;
  defaultMarkupPct: string;
  wholesaleDiscountPct: string;
  bisqueTiers: TierDraft[];
  bisqueGlazeTiers: TierDraft[];
};

type SectionId = 'studio' | 'pricing-model' | 'costs' | 'bisque' | 'bisque-glaze' | 'checks';

const CONFIDENCE_CHECKS: Array<{
  label: string;
  heightCm: number;
  widthCm: number;
  weightGrams: number;
  mode: PricingFiringMode;
}> = [
  { label: 'Small cup', heightCm: 10, widthCm: 8, weightGrams: 320, mode: 'bisque' },
  { label: 'Serving bowl', heightCm: 12, widthCm: 18, weightGrams: 780, mode: 'bisque-glaze' },
  { label: 'Large vessel', heightCm: 20, widthCm: 20, weightGrams: 1400, mode: 'bisque-glaze' },
];

function toTierDraft(tier: PricingTier): TierDraft {
  return {
    minVolumeCm3: String(tier.minVolumeCm3),
    maxVolumeCm3: tier.maxVolumeCm3 == null ? '' : String(tier.maxVolumeCm3),
    ratePerCm3: String(tier.ratePerCm3),
    baseFee: String(tier.baseFee),
    quoteOnly: !!tier.quoteOnly,
  };
}

function toDraft(settings: PricingSettings): PricingDraft {
  return {
    studioLabel: settings.studioLabel,
    currencySymbol: settings.currencySymbol,
    pricingUserType: settings.pricingUserType,
    defaultMode: settings.defaultMode,
    shapeFactor: String(settings.shapeFactor),
    clayPricePer10kg: String(settings.clayPricePer10kg),
    defaultClayCost: String(settings.defaultClayCost),
    defaultGlazeCost: String(settings.defaultGlazeCost),
    defaultEnergyCost: String(settings.defaultEnergyCost),
    defaultOtherCost: String(settings.defaultOtherCost),
    defaultWorkHours: String(settings.defaultWorkHours),
    defaultAdminHours: String(settings.defaultAdminHours),
    hourlyLaborRate: String(settings.hourlyLaborRate),
    adminHourlyRate: String(settings.adminHourlyRate),
    recurringOverheadCost: String(settings.recurringOverheadCost),
    sellingFeePct: String(settings.sellingFeePct),
    taxPct: String(settings.taxPct),
    defaultMarkupPct: String(settings.defaultMarkupPct),
    wholesaleDiscountPct: String(settings.wholesaleDiscountPct),
    bisqueTiers: settings.bisqueTiers.map(toTierDraft),
    bisqueGlazeTiers: settings.bisqueGlazeTiers.map(toTierDraft),
  };
}

function parseWithFallback(value: string, fallback: number, min = 0): number {
  const parsed = parseNumericInput(value);
  if (parsed == null) return fallback;
  return Math.max(min, parsed);
}

function fromTierDraft(draft: TierDraft, fallback: PricingTier): PricingTier {
  const minVolumeCm3 = parseWithFallback(draft.minVolumeCm3, fallback.minVolumeCm3, 0);
  const maxParsed = parseNumericInput(draft.maxVolumeCm3);
  const maxVolumeCm3 = draft.maxVolumeCm3.trim() === ''
    ? null
    : Math.max(minVolumeCm3, maxParsed ?? (fallback.maxVolumeCm3 ?? minVolumeCm3));

  return {
    minVolumeCm3,
    maxVolumeCm3,
    ratePerCm3: parseWithFallback(draft.ratePerCm3, fallback.ratePerCm3, 0),
    baseFee: parseWithFallback(draft.baseFee, fallback.baseFee, 0),
    quoteOnly: draft.quoteOnly,
  };
}

function buildSettingsFromDraft(draft: PricingDraft, fallback: PricingSettings): PricingSettings {
  return {
    ...fallback,
    studioLabel: draft.studioLabel.trim() || fallback.studioLabel,
    currencySymbol: draft.currencySymbol.trim() || fallback.currencySymbol,
    pricingUserType: draft.pricingUserType,
    defaultMode: draft.defaultMode,
    shapeFactor: parseWithFallback(draft.shapeFactor, fallback.shapeFactor, 0.05),
    clayPricePer10kg: parseWithFallback(draft.clayPricePer10kg, fallback.clayPricePer10kg, 0),
    defaultClayCost: parseWithFallback(draft.defaultClayCost, fallback.defaultClayCost, 0),
    defaultGlazeCost: parseWithFallback(draft.defaultGlazeCost, fallback.defaultGlazeCost, 0),
    defaultEnergyCost: parseWithFallback(draft.defaultEnergyCost, fallback.defaultEnergyCost, 0),
    defaultOtherCost: parseWithFallback(draft.defaultOtherCost, fallback.defaultOtherCost, 0),
    defaultWorkHours: parseWithFallback(draft.defaultWorkHours, fallback.defaultWorkHours, 0),
    defaultAdminHours: parseWithFallback(draft.defaultAdminHours, fallback.defaultAdminHours, 0),
    hourlyLaborRate: parseWithFallback(draft.hourlyLaborRate, fallback.hourlyLaborRate, 0),
    adminHourlyRate: parseWithFallback(draft.adminHourlyRate, fallback.adminHourlyRate, 0),
    recurringOverheadCost: parseWithFallback(draft.recurringOverheadCost, fallback.recurringOverheadCost, 0),
    sellingFeePct: parseWithFallback(draft.sellingFeePct, fallback.sellingFeePct, 0),
    taxPct: parseWithFallback(draft.taxPct, fallback.taxPct, 0),
    defaultMarkupPct: parseWithFallback(draft.defaultMarkupPct, fallback.defaultMarkupPct, 0),
    wholesaleDiscountPct: parseWithFallback(draft.wholesaleDiscountPct, fallback.wholesaleDiscountPct, 0),
    bisqueTiers: draft.bisqueTiers.map((tier, index) => fromTierDraft(tier, fallback.bisqueTiers[index])),
    bisqueGlazeTiers: draft.bisqueGlazeTiers.map((tier, index) => fromTierDraft(tier, fallback.bisqueGlazeTiers[index])),
  };
}

function formatMoney(symbol: string, value: number) {
  return `${symbol}${value.toFixed(2)}`;
}

function formatTierRange(tier: TierDraft) {
  if (!tier.maxVolumeCm3.trim()) return `${tier.minVolumeCm3 || '0'}+ cm³`;
  return `${tier.minVolumeCm3 || '0'}-${tier.maxVolumeCm3} cm³`;
}

function SectionCard({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-card rounded-2xl border border-border mb-4 overflow-hidden">
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8} className="px-4 py-4 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-foreground">{title}</Text>
          <Text className="text-xs text-muted-foreground mt-1" numberOfLines={2}>{summary}</Text>
        </View>
        {open ? <ChevronUp size={18} color="hsl(24 20% 45%)" /> : <ChevronDown size={18} color="hsl(24 20% 45%)" />}
      </TouchableOpacity>
      {open ? <View className="px-4 pb-4 border-t border-border">{children}</View> : null}
    </View>
  );
}

function CompactField({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'decimal-pad';
}) {
  return (
    <View className="flex-1">
      <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</Text>
      <Input value={value} onChangeText={onChangeText} keyboardType={keyboardType} />
    </View>
  );
}

export default function PricingRulesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pricingSettingsState = useAppStore((state) => state.pricingSettings);
  const pricingSettings = React.useMemo(() => normalizePricingSettings(pricingSettingsState), [pricingSettingsState]);
  const setPricingSettings = useAppStore((state) => state.setPricingSettings);

  const [draft, setDraft] = React.useState<PricingDraft>(() => toDraft(pricingSettings));
  const [openSection, setOpenSection] = React.useState<SectionId>('studio');

  React.useEffect(() => {
    setDraft(toDraft(pricingSettings));
  }, [pricingSettings]);

  const previewSettings = React.useMemo(
    () => buildSettingsFromDraft(draft, pricingSettings),
    [draft, pricingSettings],
  );

  const confidenceChecks = React.useMemo(
    () => CONFIDENCE_CHECKS.map((check) => ({
      ...check,
      snapshot: calculatePiecePricingSnapshot({
        heightCm: check.heightCm,
        widthCm: check.widthCm,
        weightGrams: check.weightGrams,
        mode: check.mode,
        settings: previewSettings,
        clayCostOverride: null,
        glazeCostOverride: null,
        energyCostOverride: null,
        otherCost: previewSettings.defaultOtherCost,
        markupPct: previewSettings.defaultMarkupPct,
        workHours: previewSettings.defaultWorkHours,
        adminHours: previewSettings.defaultAdminHours,
      }),
    })),
    [previewSettings],
  );

  const applyUserType = (userType: PricingUserType) => {
    setDraft(toDraft(applyPricingUserTypePreset(buildSettingsFromDraft(draft, pricingSettings), userType)));
  };

  const updateTier = (mode: PricingFiringMode, index: number, patch: Partial<TierDraft>) => {
    setDraft((previous) => {
      const key = mode === 'bisque' ? 'bisqueTiers' : 'bisqueGlazeTiers';
      return {
        ...previous,
        [key]: previous[key].map((tier, tierIndex) => (
          tierIndex === index ? { ...tier, ...patch } : tier
        )),
      };
    });
  };

  const handleSave = () => {
    setPricingSettings(buildSettingsFromDraft(draft, pricingSettings));
    router.back();
  };

  const handleResetDraft = () => {
    Alert.alert(
      'Reset Pricing Rules',
      'Reset this form to the default pricing profile, cost defaults, and firing formulas?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => setDraft(toDraft(buildDefaultPricingSettings())),
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View className="pr-4 flex-1">
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Pricing Rules
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            Build prices from firing, hours, clay, glaze, overhead, fees, and tax.
          </Text>
        </View>
        <TouchableOpacity onPress={handleSave} className="bg-muted px-4 py-2 rounded-full">
          <Text className="text-sm font-medium text-foreground">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 mt-4" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-4 flex-row items-start gap-3">
          <Calculator size={16} color="hsl(38 80% 50%)" className="mt-0.5" />
          <Text className="text-xs text-amber-700 flex-1 leading-relaxed">
            Price from real costs, not gut feel. Clay can estimate from weight and your clay bag cost. Glaze scales from piece size unless you override it on a piece.
          </Text>
        </View>

        <SectionCard
          title="Studio Defaults"
          summary={`${draft.studioLabel || 'Studio Default'} · ${draft.currencySymbol || '€'} · shape factor ${draft.shapeFactor || '1'}`}
          open={openSection === 'studio'}
          onToggle={() => setOpenSection(openSection === 'studio' ? 'checks' : 'studio')}
        >
          <View className="pt-4">
            <CompactField
              label="Studio label"
              value={draft.studioLabel}
              onChangeText={(value) => setDraft((previous) => ({ ...previous, studioLabel: value }))}
            />
            <View className="flex-row gap-3 mt-3">
              <CompactField
                label="Currency"
                value={draft.currencySymbol}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, currencySymbol: value }))}
              />
              <CompactField
                label="Shape factor"
                value={draft.shapeFactor}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, shapeFactor: value }))}
                keyboardType="decimal-pad"
              />
            </View>
            <Text className="text-[11px] text-muted-foreground mt-3">
              Shape factor scales the cylinder estimate. Use 1 for a straight volume estimate, lower for open forms.
            </Text>

            <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-2">Default firing mode</Text>
            <View className="flex-row gap-2">
              {([
                { value: 'bisque', label: 'Bisque' },
                { value: 'bisque-glaze', label: 'Bisque + Glaze' },
              ] as const).map((option) => {
                const selected = draft.defaultMode === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setDraft((previous) => ({ ...previous, defaultMode: option.value }))}
                    className={`flex-1 px-3 py-2 rounded-full border items-center ${
                      selected ? 'bg-foreground border-foreground' : 'bg-card border-border'
                    }`}
                    activeOpacity={0.75}
                  >
                    <Text className={`text-xs font-medium ${selected ? 'text-background' : 'text-muted-foreground'}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </SectionCard>

        <SectionCard
          title="Pricing Profile"
          summary={`${PRICING_USER_TYPE_LABELS[draft.pricingUserType]} · Labor ${formatMoney(previewSettings.currencySymbol, previewSettings.hourlyLaborRate)}/hr · Admin ${formatMoney(previewSettings.currencySymbol, previewSettings.adminHourlyRate)}/hr`}
          open={openSection === 'pricing-model'}
          onToggle={() => setOpenSection(openSection === 'pricing-model' ? 'checks' : 'pricing-model')}
        >
          <View className="pt-4">
            <Text className="text-[11px] text-muted-foreground mb-3">
              Pick the closest business stage, then tune the numbers. The goal is sustainable pricing whether you are recovering hobby costs or building a full-time studio.
            </Text>
            <View className="flex-row gap-2 mb-4">
              {(['hobby', 'side-business', 'full-time'] as PricingUserType[]).map((option) => {
                const selected = draft.pricingUserType === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => applyUserType(option)}
                    className={`flex-1 px-3 py-2 rounded-2xl border ${
                      selected ? 'bg-foreground border-foreground' : 'bg-card border-border'
                    }`}
                    activeOpacity={0.75}
                  >
                    <Text className={`text-[11px] font-semibold text-center ${selected ? 'text-background' : 'text-muted-foreground'}`}>
                      {PRICING_USER_TYPE_LABELS[option]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="flex-row gap-3">
              <CompactField
                label="Labor / hr"
                value={draft.hourlyLaborRate}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, hourlyLaborRate: value }))}
                keyboardType="decimal-pad"
              />
              <CompactField
                label="Admin / hr"
                value={draft.adminHourlyRate}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, adminHourlyRate: value }))}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-row gap-3 mt-3">
              <CompactField
                label="Making hrs"
                value={draft.defaultWorkHours}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultWorkHours: value }))}
                keyboardType="decimal-pad"
              />
              <CompactField
                label="Admin hrs"
                value={draft.defaultAdminHours}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultAdminHours: value }))}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-row gap-3 mt-3">
              <CompactField
                label="Fees %"
                value={draft.sellingFeePct}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, sellingFeePct: value }))}
                keyboardType="decimal-pad"
              />
              <CompactField
                label="Tax %"
                value={draft.taxPct}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, taxPct: value }))}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-row gap-3 mt-3">
              <CompactField
                label="Profit %"
                value={draft.defaultMarkupPct}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultMarkupPct: value }))}
                keyboardType="decimal-pad"
              />
              <CompactField
                label="Wholesale % off"
                value={draft.wholesaleDiscountPct}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, wholesaleDiscountPct: value }))}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </SectionCard>

        <SectionCard
          title="Cost Defaults"
          summary={`Clay ${formatMoney(previewSettings.currencySymbol, previewSettings.clayPricePer10kg)}/10kg · Glaze ${formatMoney(previewSettings.currencySymbol, previewSettings.defaultGlazeCost)} base · Overhead ${formatMoney(previewSettings.currencySymbol, previewSettings.recurringOverheadCost)}`}
          open={openSection === 'costs'}
          onToggle={() => setOpenSection(openSection === 'costs' ? 'checks' : 'costs')}
        >
          <View className="pt-4">
            <View className="flex-row gap-3">
              <CompactField
                label="Clay / 10kg"
                value={draft.clayPricePer10kg}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, clayPricePer10kg: value }))}
                keyboardType="decimal-pad"
              />
              <CompactField
                label="Clay fallback"
                value={draft.defaultClayCost}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultClayCost: value }))}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-row gap-3 mt-3">
              <CompactField
                label="Glaze base"
                value={draft.defaultGlazeCost}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultGlazeCost: value }))}
                keyboardType="decimal-pad"
              />
              <CompactField
                label="Extra kiln energy"
                value={draft.defaultEnergyCost}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultEnergyCost: value }))}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-row gap-3 mt-3">
              <CompactField
                label="Other extras"
                value={draft.defaultOtherCost}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultOtherCost: value }))}
                keyboardType="decimal-pad"
              />
              <CompactField
                label="Overhead / piece"
                value={draft.recurringOverheadCost}
                onChangeText={(value) => setDraft((previous) => ({ ...previous, recurringOverheadCost: value }))}
                keyboardType="decimal-pad"
              />
            </View>
            <Text className="text-[11px] text-muted-foreground mt-3">
              Clay estimates use the piece weight and your 10 kg bag cost. Clay fallback is only used when weight is missing. Keep extra kiln energy at 0 if your firing formula already covers it.
            </Text>
          </View>
        </SectionCard>

        <SectionCard
          title="Bisque Formula"
          summary={`${draft.bisqueTiers.length} tiers · ${draft.bisqueTiers.map((tier) => formatTierRange(tier)).join(' · ')}`}
          open={openSection === 'bisque'}
          onToggle={() => setOpenSection(openSection === 'bisque' ? 'checks' : 'bisque')}
        >
          <View className="pt-4">
            {draft.bisqueTiers.map((tier, index) => (
              <View key={`bisque-${index}`} className="rounded-2xl border border-border bg-background p-3 mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-sm font-semibold text-foreground">Tier {index + 1}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">{formatTierRange(tier)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => updateTier('bisque', index, { quoteOnly: !tier.quoteOnly })}
                    className={`px-3 py-1.5 rounded-full border ${tier.quoteOnly ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'}`}
                    activeOpacity={0.75}
                  >
                    <Text className={`text-[11px] font-semibold ${tier.quoteOnly ? 'text-primary' : 'text-muted-foreground'}`}>
                      {tier.quoteOnly ? 'N.O.T.K' : 'Formula'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row gap-3">
                  <CompactField
                    label="Min cm³"
                    value={tier.minVolumeCm3}
                    onChangeText={(value) => updateTier('bisque', index, { minVolumeCm3: value })}
                    keyboardType="decimal-pad"
                  />
                  <CompactField
                    label="Max cm³"
                    value={tier.maxVolumeCm3}
                    onChangeText={(value) => updateTier('bisque', index, { maxVolumeCm3: value })}
                    keyboardType="decimal-pad"
                  />
                </View>
                {!tier.quoteOnly ? (
                  <View className="flex-row gap-3 mt-3">
                    <CompactField
                      label="Rate / cm³"
                      value={tier.ratePerCm3}
                      onChangeText={(value) => updateTier('bisque', index, { ratePerCm3: value })}
                      keyboardType="decimal-pad"
                    />
                    <CompactField
                      label="Base fee"
                      value={tier.baseFee}
                      onChangeText={(value) => updateTier('bisque', index, { baseFee: value })}
                      keyboardType="decimal-pad"
                    />
                  </View>
                ) : (
                  <Text className="text-xs text-muted-foreground mt-3">Quote-only tier. Rate and base fee are ignored.</Text>
                )}
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard
          title="Bisque + Glaze Formula"
          summary={`${draft.bisqueGlazeTiers.length} tiers · ${draft.bisqueGlazeTiers.map((tier) => formatTierRange(tier)).join(' · ')}`}
          open={openSection === 'bisque-glaze'}
          onToggle={() => setOpenSection(openSection === 'bisque-glaze' ? 'checks' : 'bisque-glaze')}
        >
          <View className="pt-4">
            {draft.bisqueGlazeTiers.map((tier, index) => (
              <View key={`bisque-glaze-${index}`} className="rounded-2xl border border-border bg-background p-3 mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-sm font-semibold text-foreground">Tier {index + 1}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">{formatTierRange(tier)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => updateTier('bisque-glaze', index, { quoteOnly: !tier.quoteOnly })}
                    className={`px-3 py-1.5 rounded-full border ${tier.quoteOnly ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'}`}
                    activeOpacity={0.75}
                  >
                    <Text className={`text-[11px] font-semibold ${tier.quoteOnly ? 'text-primary' : 'text-muted-foreground'}`}>
                      {tier.quoteOnly ? 'N.O.T.K' : 'Formula'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row gap-3">
                  <CompactField
                    label="Min cm³"
                    value={tier.minVolumeCm3}
                    onChangeText={(value) => updateTier('bisque-glaze', index, { minVolumeCm3: value })}
                    keyboardType="decimal-pad"
                  />
                  <CompactField
                    label="Max cm³"
                    value={tier.maxVolumeCm3}
                    onChangeText={(value) => updateTier('bisque-glaze', index, { maxVolumeCm3: value })}
                    keyboardType="decimal-pad"
                  />
                </View>
                {!tier.quoteOnly ? (
                  <View className="flex-row gap-3 mt-3">
                    <CompactField
                      label="Rate / cm³"
                      value={tier.ratePerCm3}
                      onChangeText={(value) => updateTier('bisque-glaze', index, { ratePerCm3: value })}
                      keyboardType="decimal-pad"
                    />
                    <CompactField
                      label="Base fee"
                      value={tier.baseFee}
                      onChangeText={(value) => updateTier('bisque-glaze', index, { baseFee: value })}
                      keyboardType="decimal-pad"
                    />
                  </View>
                ) : (
                  <Text className="text-xs text-muted-foreground mt-3">Quote-only tier. Rate and base fee are ignored.</Text>
                )}
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard
          title="Confidence Check"
          summary="Three sample pieces to sanity-check firing, clay, true cost, retail, and wholesale"
          open={openSection === 'checks'}
          onToggle={() => setOpenSection(openSection === 'checks' ? 'studio' : 'checks')}
        >
          <View className="pt-4">
            <Text className="text-xs text-muted-foreground mb-3">
              These previews use your live defaults for clay, glaze, labor hours, overhead, fees, and tax.
            </Text>
            {confidenceChecks.map((check) => (
              <View key={`${check.label}-${check.mode}`} className="rounded-2xl border border-border bg-background p-3 mb-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{check.label}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {check.heightCm}h × {check.widthCm}w cm · {check.weightGrams} g · {check.mode === 'bisque' ? 'Bisque' : 'Bisque + Glaze'}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-primary">
                    {check.snapshot.quoteRequired
                      ? 'N.O.T.K'
                      : formatMoney(previewSettings.currencySymbol, check.snapshot.firingFee ?? 0)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-3">
                  <Text className="text-xs text-muted-foreground">Clay estimate</Text>
                  <Text className="text-xs font-medium text-foreground">
                    {formatMoney(previewSettings.currencySymbol, check.snapshot.clayCost)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs text-muted-foreground">True cost</Text>
                  <Text className="text-xs font-medium text-foreground">
                    {formatMoney(previewSettings.currencySymbol, check.snapshot.totalCost)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs text-muted-foreground">Suggested retail</Text>
                  <Text className="text-xs font-medium text-primary">
                    {formatMoney(previewSettings.currencySymbol, check.snapshot.suggestedPrice)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs text-muted-foreground">Wholesale floor</Text>
                  <Text className="text-xs font-medium text-foreground">
                    {formatMoney(previewSettings.currencySymbol, check.snapshot.wholesalePrice)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </SectionCard>

        <TouchableOpacity
          onPress={handleResetDraft}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 mt-2 py-3.5 rounded-2xl border border-border bg-card"
        >
          <RotateCcw size={15} color="hsl(0 55% 50%)" />
          <Text className="text-sm font-medium text-destructive">Reset Pricing Defaults</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}