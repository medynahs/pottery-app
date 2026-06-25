import { ConfirmSheet } from '@/src/components/AppSheets';
import { CustomizationSettingsShell } from '@/src/components/settings/CustomizationSettingsShell';
import { Input } from '@/src/components/ui/input';
import { SelectChip, SelectChipGroup } from '@/src/components/ui/SelectChip';
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
import { ChevronDown, ChevronUp, Copy, Plus, RotateCcw, Trash2 } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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

type SectionId = 'studio' | 'costs' | 'bisque' | 'bisque-glaze';

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
  const pricingSettingsState = useAppStore((state) => state.pricingSettings);
  const pricingTemplates = useAppStore((state) => state.pricingTemplates);
  const activePricingTemplateId = useAppStore((state) => state.activePricingTemplateId);
  const pricingSettings = React.useMemo(() => normalizePricingSettings(pricingSettingsState), [pricingSettingsState]);
  const setPricingSettings = useAppStore((state) => state.setPricingSettings);
  const setActivePricingTemplate = useAppStore((state) => state.setActivePricingTemplate);
  const addPricingTemplate = useAppStore((state) => state.addPricingTemplate);
  const updatePricingTemplate = useAppStore((state) => state.updatePricingTemplate);
  const duplicatePricingTemplate = useAppStore((state) => state.duplicatePricingTemplate);
  const deletePricingTemplate = useAppStore((state) => state.deletePricingTemplate);

  const [draft, setDraft] = React.useState<PricingDraft>(() => toDraft(pricingSettings));
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [advancedSection, setAdvancedSection] = React.useState<SectionId | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = React.useState(false);
  const [deleteTemplateOpen, setDeleteTemplateOpen] = React.useState(false);
  const [newTemplateName, setNewTemplateName] = React.useState('');

  const activeTemplateId = activePricingTemplateId
    ?? pricingTemplates.find((template) => template.isDefault)?.id
    ?? pricingTemplates[0]?.id
    ?? null;

  const persistDraftToActiveTemplate = React.useCallback(() => {
    if (!activeTemplateId) return;
    updatePricingTemplate(activeTemplateId, {
      settings: buildSettingsFromDraft(draft, pricingSettings),
    });
  }, [activeTemplateId, draft, pricingSettings, updatePricingTemplate]);

  const handleSelectTemplate = (templateId: string) => {
    if (templateId === activeTemplateId) return;
    persistDraftToActiveTemplate();
    setActivePricingTemplate(templateId);
  };

  const handleSaveAsNewTemplate = () => {
    const settings = buildSettingsFromDraft(draft, pricingSettings);
    const templateId = addPricingTemplate(newTemplateName.trim() || 'New template', settings);
    setActivePricingTemplate(templateId);
    setNewTemplateName('');
  };

  const handleDuplicateTemplate = () => {
    if (!activeTemplateId) return;
    persistDraftToActiveTemplate();
    const nextId = duplicatePricingTemplate(activeTemplateId);
    setActivePricingTemplate(nextId);
  };

  const handleDeleteTemplate = () => {
    if (!activeTemplateId || pricingTemplates.length <= 1) return;
    persistDraftToActiveTemplate();
    deletePricingTemplate(activeTemplateId);
    setDeleteTemplateOpen(false);
  };

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
    const nextSettings = buildSettingsFromDraft(draft, pricingSettings);
    setPricingSettings(nextSettings);
    if (activeTemplateId) {
      updatePricingTemplate(activeTemplateId, { settings: nextSettings });
    }
    router.back();
  };

  const handleResetDraft = () => {
    setResetConfirmOpen(true);
  };

  const toggleAdvancedSection = (section: SectionId) => {
    setAdvancedSection((current) => (current === section ? null : section));
  };

  const sampleMug = confidenceChecks[0];
  const symbol = previewSettings.currencySymbol;

  return (
    <>
      <ConfirmSheet
        visible={deleteTemplateOpen}
        title="Delete pricing template?"
        body="This removes the selected template. Your other templates stay intact."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteTemplate}
        onCancel={() => setDeleteTemplateOpen(false)}
      />
      <ConfirmSheet
        visible={resetConfirmOpen}
        title="Reset Pricing Rules?"
        body="Reset this form to the default pricing profile, cost defaults, and firing formulas?"
        confirmLabel="Reset"
        destructive
        onConfirm={() => { setDraft(toDraft(buildDefaultPricingSettings())); setResetConfirmOpen(false); }}
        onCancel={() => setResetConfirmOpen(false)}
      />
      <CustomizationSettingsShell
        eyebrow="Studio pricing"
        title="Your pricing defaults"
        subtitle="Set these once. When you add a piece, the app estimates cost and suggested price from weight, size, and these numbers."
        onBack={() => router.back()}
        onSave={handleSave}
        saveLabel="Save pricing"
      >
        <View className="bg-card rounded-2xl border border-border px-4 py-4 mb-4 -mt-2">
          <Text className="text-sm font-semibold text-foreground">What this screen does</Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-6">
            1. Pick the profile that matches how you sell.{'\n'}
            2. Enter what you actually pay for clay and time.{'\n'}
            3. Check the sample price below feels right — then save.
          </Text>
        </View>

        <View className="bg-primary/5 rounded-2xl border border-primary/20 px-4 py-4 mb-4">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-primary mb-1">
            Sample estimate
          </Text>
          <Text className="text-xs text-muted-foreground leading-5">
            A small cup ({sampleMug.heightCm} × {sampleMug.widthCm} cm, {sampleMug.weightGrams} g) with your current settings:
          </Text>
          <View className="flex-row items-end justify-between mt-3">
            <View>
              <Text className="text-xs text-muted-foreground">Suggested price</Text>
              <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
                {formatMoney(symbol, sampleMug.snapshot.suggestedPrice)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-muted-foreground">Your cost</Text>
              <Text className="text-sm font-semibold text-foreground">
                {formatMoney(symbol, sampleMug.snapshot.totalCost)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-card rounded-2xl border border-border px-4 py-4 mb-4">
          <Text className="text-sm font-semibold text-foreground">Essentials</Text>
          <Text className="text-xs text-muted-foreground mt-1 mb-4 leading-5">
            Most potters only need these. Everything else is optional.
          </Text>

          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            How do you sell?
          </Text>
          <SelectChipGroup className="mb-4">
            {(['hobby', 'side-business', 'full-time'] as PricingUserType[]).map((option) => (
              <SelectChip
                key={option}
                label={PRICING_USER_TYPE_LABELS[option].replace(' / Cost Recovery', '')}
                selected={draft.pricingUserType === option}
                onPress={() => applyUserType(option)}
                className="flex-1 justify-center"
              />
            ))}
          </SelectChipGroup>

          <View className="flex-row gap-3">
            <CompactField
              label="Currency"
              value={draft.currencySymbol}
              onChangeText={(value) => setDraft((previous) => ({ ...previous, currencySymbol: value }))}
            />
            <CompactField
              label="Clay per 10 kg bag"
              value={draft.clayPricePer10kg}
              onChangeText={(value) => setDraft((previous) => ({ ...previous, clayPricePer10kg: value }))}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-row gap-3 mt-3">
            <CompactField
              label="Your labor rate / hr"
              value={draft.hourlyLaborRate}
              onChangeText={(value) => setDraft((previous) => ({ ...previous, hourlyLaborRate: value }))}
              keyboardType="decimal-pad"
            />
            <CompactField
              label="Hours per piece (avg)"
              value={draft.defaultWorkHours}
              onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultWorkHours: value }))}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-row gap-3 mt-3">
            <CompactField
              label="Profit margin %"
              value={draft.defaultMarkupPct}
              onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultMarkupPct: value }))}
              keyboardType="decimal-pad"
            />
            <CompactField
              label="Tax %"
              value={draft.taxPct}
              onChangeText={(value) => setDraft((previous) => ({ ...previous, taxPct: value }))}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="mt-3">
            <CompactField
              label="Selling fees % (Etsy, markets, etc.)"
              value={draft.sellingFeePct}
              onChangeText={(value) => setDraft((previous) => ({ ...previous, sellingFeePct: value }))}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowAdvanced((value) => !value)}
          activeOpacity={0.8}
          className="bg-card rounded-2xl border border-border px-4 py-4 mb-4 flex-row items-center justify-between"
        >
          <View className="flex-1 pr-3">
            <Text className="text-sm font-semibold text-foreground">Advanced settings</Text>
            <Text className="text-xs text-muted-foreground mt-1 leading-5">
              Firing fee tables, extra material costs, saved pricing setups, and studio tweaks.
            </Text>
          </View>
          {showAdvanced ? (
            <ChevronUp size={18} color="hsl(24 20% 45%)" />
          ) : (
            <ChevronDown size={18} color="hsl(24 20% 45%)" />
          )}
        </TouchableOpacity>

        {showAdvanced ? (
          <>
            <View className="bg-card rounded-2xl border border-border px-4 py-4 mb-4">
              <Text className="text-sm font-semibold text-foreground">Saved pricing setups</Text>
              <Text className="text-xs text-muted-foreground mt-1 mb-3 leading-5">
                Use different setups for market vs wholesale pricing. The selected one is used for new piece estimates.
              </Text>
              <SelectChipGroup>
                {pricingTemplates.map((template) => (
                  <SelectChip
                    key={template.id}
                    label={template.name}
                    selected={template.id === activeTemplateId}
                    onPress={() => handleSelectTemplate(template.id)}
                  />
                ))}
              </SelectChipGroup>
              <View className="flex-row gap-2 mt-3">
                <View className="flex-1">
                  <Input
                    placeholder="Name for new setup"
                    value={newTemplateName}
                    onChangeText={setNewTemplateName}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSaveAsNewTemplate}
                  className="px-3 py-2 rounded-xl border border-border bg-background items-center justify-center"
                  activeOpacity={0.75}
                >
                  <Plus size={16} color="hsl(24 25% 15%)" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDuplicateTemplate}
                  className="px-3 py-2 rounded-xl border border-border bg-background items-center justify-center"
                  activeOpacity={0.75}
                >
                  <Copy size={16} color="hsl(24 25% 15%)" />
                </TouchableOpacity>
                {pricingTemplates.length > 1 ? (
                  <TouchableOpacity
                    onPress={() => setDeleteTemplateOpen(true)}
                    className="px-3 py-2 rounded-xl border border-border bg-background items-center justify-center"
                    activeOpacity={0.75}
                  >
                    <Trash2 size={16} color="hsl(0 55% 45%)" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <SectionCard
              title="Studio tweaks"
              summary={`${draft.studioLabel || 'Studio Default'} · shape factor ${draft.shapeFactor || '1'}`}
              open={advancedSection === 'studio'}
              onToggle={() => toggleAdvancedSection('studio')}
            >
              <View className="pt-4">
                <CompactField
                  label="Studio name (label only)"
                  value={draft.studioLabel}
                  onChangeText={(value) => setDraft((previous) => ({ ...previous, studioLabel: value }))}
                />
                <View className="flex-row gap-3 mt-3">
                  <CompactField
                    label="Shape factor"
                    value={draft.shapeFactor}
                    onChangeText={(value) => setDraft((previous) => ({ ...previous, shapeFactor: value }))}
                    keyboardType="decimal-pad"
                  />
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Default firing
                    </Text>
                    <SelectChipGroup>
                      {([
                        { value: 'bisque', label: 'Bisque' },
                        { value: 'bisque-glaze', label: 'Bisque + Glaze' },
                      ] as const).map((option) => (
                        <SelectChip
                          key={option.value}
                          label={option.label}
                          selected={draft.defaultMode === option.value}
                          onPress={() => setDraft((previous) => ({ ...previous, defaultMode: option.value }))}
                          className="flex-1 justify-center"
                        />
                      ))}
                    </SelectChipGroup>
                  </View>
                </View>
                <Text className="text-[11px] text-muted-foreground mt-3 leading-5">
                  Shape factor adjusts volume estimates for open forms. Use 1 for mugs and bowls, lower for plates and trays.
                </Text>
              </View>
            </SectionCard>

            <SectionCard
              title="Extra material costs"
              summary={`Glaze ${formatMoney(symbol, previewSettings.defaultGlazeCost)} · Overhead ${formatMoney(symbol, previewSettings.recurringOverheadCost)} / piece`}
              open={advancedSection === 'costs'}
              onToggle={() => toggleAdvancedSection('costs')}
            >
              <View className="pt-4">
                <View className="flex-row gap-3">
                  <CompactField
                    label="Admin rate / hr"
                    value={draft.adminHourlyRate}
                    onChangeText={(value) => setDraft((previous) => ({ ...previous, adminHourlyRate: value }))}
                    keyboardType="decimal-pad"
                  />
                  <CompactField
                    label="Admin hours / piece"
                    value={draft.defaultAdminHours}
                    onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultAdminHours: value }))}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-row gap-3 mt-3">
                  <CompactField
                    label="Glaze cost (base)"
                    value={draft.defaultGlazeCost}
                    onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultGlazeCost: value }))}
                    keyboardType="decimal-pad"
                  />
                  <CompactField
                    label="Overhead / piece"
                    value={draft.recurringOverheadCost}
                    onChangeText={(value) => setDraft((previous) => ({ ...previous, recurringOverheadCost: value }))}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-row gap-3 mt-3">
                  <CompactField
                    label="Packaging & extras"
                    value={draft.defaultOtherCost}
                    onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultOtherCost: value }))}
                    keyboardType="decimal-pad"
                  />
                  <CompactField
                    label="Wholesale discount %"
                    value={draft.wholesaleDiscountPct}
                    onChangeText={(value) => setDraft((previous) => ({ ...previous, wholesaleDiscountPct: value }))}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-row gap-3 mt-3">
                  <CompactField
                    label="Clay fallback (no weight)"
                    value={draft.defaultClayCost}
                    onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultClayCost: value }))}
                    keyboardType="decimal-pad"
                  />
                  <CompactField
                    label="Extra kiln energy"
                    value={draft.defaultEnergyCost}
                    onChangeText={(value) => setDraft((previous) => ({ ...previous, defaultEnergyCost: value }))}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </SectionCard>

            <SectionCard
              title="Bisque firing fees"
              summary="What you pay (or charge) for bisque-only firings by piece size"
              open={advancedSection === 'bisque'}
              onToggle={() => toggleAdvancedSection('bisque')}
            >
              <View className="pt-4">
                <Text className="text-xs text-muted-foreground mb-3 leading-5">
                  Match these tiers to your studio&apos;s bisque firing price list. Large pieces can be quote-only (N.O.T.K).
                </Text>
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
                          {tier.quoteOnly ? 'Quote only' : 'Formula'}
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
                    ) : null}
                  </View>
                ))}
              </View>
            </SectionCard>

            <SectionCard
              title="Glaze firing fees"
              summary="Bisque + glaze firing fees by piece size"
              open={advancedSection === 'bisque-glaze'}
              onToggle={() => toggleAdvancedSection('bisque-glaze')}
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
                          {tier.quoteOnly ? 'Quote only' : 'Formula'}
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
                    ) : null}
                  </View>
                ))}
              </View>
            </SectionCard>
          </>
        ) : null}

        <View className="bg-card rounded-2xl border border-border px-4 py-4 mb-4">
          <Text className="text-sm font-semibold text-foreground">More sample prices</Text>
          <Text className="text-xs text-muted-foreground mt-1 mb-3 leading-5">
            Sanity-check that retail and wholesale feel right before you save.
          </Text>
          {confidenceChecks.map((check) => (
            <View key={`${check.label}-${check.mode}`} className="rounded-2xl border border-border bg-background p-3 mb-3 last:mb-0">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{check.label}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {check.heightCm}h × {check.widthCm}w cm · {check.weightGrams} g
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-primary">
                  {formatMoney(symbol, check.snapshot.suggestedPrice)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Cost · Wholesale floor</Text>
                <Text className="text-xs font-medium text-foreground">
                  {formatMoney(symbol, check.snapshot.totalCost)} · {formatMoney(symbol, check.snapshot.wholesalePrice)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleResetDraft}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 mt-2 mb-2 py-3.5 rounded-2xl border border-border bg-card"
        >
          <RotateCcw size={15} color="hsl(0 55% 50%)" />
          <Text className="text-sm font-medium text-destructive">Reset to app defaults</Text>
        </TouchableOpacity>
      </CustomizationSettingsShell>
    </>
  );
}