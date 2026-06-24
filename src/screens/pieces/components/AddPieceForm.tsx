import { ModalFormScrollView } from '@/src/components/AppSheets';
import { CollapsibleFormSection, FormSectionCard } from '@/src/components/form/FormSectionCard';
import { FormField, FormFieldRow } from '@/src/components/form/FormField';
import { PhotoPickField } from '@/src/components/PhotoPickField';
import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { useAppStore } from '@/src/store/appStore';
import { Pill } from '@/src/screens/library/atlas/Pill';
import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import type { PieceForm } from '../../../types/pieces';
import {
  calculatePiecePricingSnapshot,
  normalizePricingSettings,
  parseNumericInput,
  parseWeightToGrams,
  PRICING_USER_TYPE_LABELS,
  type PricingFiringMode,
} from '../../../types/pricing';
import {
  PIECE_CONDITION_STATUSES,
  PIECE_DISPOSITION_STATUSES,
  GLAZE_OUTCOME_LABELS,
  GLAZE_OUTCOME_OPTIONS,
  isConditionStatus,
} from '../utils/constants';
import { resolveStageIcon } from '../utils/stageIconUtils';
import { NotesInput } from '@/src/components/NotesInput';
import { GlazePickerField } from './GlazePickerField';
import { OptionPills } from './OptionPills';

interface AddPieceFormProps {
  form: PieceForm;
  set: <K extends keyof PieceForm>(key: K, value: PieceForm[K]) => void;
  colors: { background: string; mutedForeground: string };
  isEditing?: boolean;
  /** When true, ScrollView fills remaining sheet height (use inside tall ModalCard). */
  fillHeight?: boolean;
}

export function AddPieceForm({ form, set, colors, isEditing, fillHeight }: AddPieceFormProps) {
  const { enabledStages } = useStageConfig();
  const clayBodies = useAppStore((s) => s.clayBodies);
  const formingMethods = useAppStore((s) => s.formingMethods);
  const pieceFormOptions = useAppStore((s) => s.pieceFormOptions);
  const pricingSettingsState = useAppStore((s) => s.pricingSettings);
  const pricingSettings = React.useMemo(() => normalizePricingSettings(pricingSettingsState), [pricingSettingsState]);
  const [showWorkshopDetails, setShowWorkshopDetails] = React.useState(
    () => Boolean(form.location?.trim() || form.formingMethod?.trim() || form.form?.trim()),
  );
  const [showPricingSection, setShowPricingSection] = React.useState(false);
  const [showListingDetails, setShowListingDetails] = React.useState(
    () => Boolean(form.status?.trim()),
  );
  const isCemetery = form.stage === 'cemetery';
  const isFinished = form.stage === 'finished';
  const showStatusFields = !isCemetery && (isFinished || isEditing);
  const showGlazeOutcome =
    Boolean(form.glazeId)
    && ['glazing', 'glaze-fired', 'finished'].includes(form.stage);

  const firingFeeMode: PricingFiringMode = form.firingFeeMode === 'bisque' ? 'bisque' : 'bisque-glaze';
  const pricingSnapshot = React.useMemo(() => {
    return calculatePiecePricingSnapshot({
      heightCm: parseNumericInput(form.heightCm),
      widthCm: parseNumericInput(form.widthCm),
      weightGrams: parseWeightToGrams(form.weight),
      mode: firingFeeMode,
      settings: pricingSettings,
      clayCostOverride: parseNumericInput(form.costClayOverride),
      glazeCostOverride: parseNumericInput(form.costGlazeOverride),
      energyCostOverride: parseNumericInput(form.costEnergyOverride),
      otherCost: parseNumericInput(form.costOther),
      markupPct: parseNumericInput(form.markupPct) ?? pricingSettings.defaultMarkupPct,
      workHours: parseNumericInput(form.workHours) ?? pricingSettings.defaultWorkHours,
      adminHours: parseNumericInput(form.adminHours) ?? pricingSettings.defaultAdminHours,
    });
  }, [
    form.heightCm,
    form.widthCm,
    form.weight,
    form.firingFeeMode,
    form.workHours,
    form.adminHours,
    form.costClayOverride,
    form.costGlazeOverride,
    form.costEnergyOverride,
    form.costOther,
    form.markupPct,
    pricingSettings,
  ]);

  const formatMoney = React.useCallback((value: number) => {
    return `${pricingSettings.currencySymbol}${value.toFixed(2)}`;
  }, [pricingSettings.currencySymbol]);

  return (
    <ModalFormScrollView
      className="px-6"
      style={fillHeight ? { flex: 1, minHeight: 0 } : undefined}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <FormField label="Photo" sectionStart first>
        <PhotoPickField
          photo={form.photo}
          onPhotoChange={(uri) => set('photo', uri)}
          aspect={[1, 1]}
          iconColor={colors.mutedForeground}
        />
      </FormField>

      {/* Piece Name + core details */}
      <FormSectionCard title="Basics" subtitle="Name, stage, and clay body." topGap>
      <FormField label="Piece name" required nested first>
        <Input
          placeholder="e.g. Speckled Mug"
          value={form.name}
          onChangeText={v => set('name', v)}
        />
      </FormField>

      {/* Quantity */}
      {!isCemetery && !isEditing && (
      <FormField label="Quantity" nested>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => set('quantity', Math.max(1, (form.quantity ?? 1) - 1))}
              className="w-10 h-10 rounded-xl bg-muted/60 items-center justify-center"
            >
              <Minus size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground w-8 text-center">
              {form.quantity ?? 1}
            </Text>
            <TouchableOpacity
              onPress={() => set('quantity', Math.min(20, (form.quantity ?? 1) + 1))}
              className="w-10 h-10 rounded-xl bg-muted/60 items-center justify-center"
            >
              <Plus size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            {(form.quantity ?? 1) > 1 && (
              <Text className="text-xs text-muted-foreground flex-1" numberOfLines={1}>
                {form.name.trim()
                  ? `"${form.name.trim()} 1" – "${form.name.trim()} ${form.quantity}"`
                  : `${form.quantity} pieces`}
              </Text>
            )}
          </View>
      </FormField>
      )}

      {/* Current Stage */}
      <FormField label="Current stage" nested>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-2"
        >
          {enabledStages.map(s => {
            const StageIcon = resolveStageIcon(s);
            const isActive = form.stage === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => set('stage', s.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                  isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                }`}
              >
                <StageIcon size={13} color={isActive ? colors.background : colors.mutedForeground} />
                <Text
                  className={`text-xs font-medium ${
                    isActive ? 'text-background' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </FormField>

      {/* Clay Body */}
      <FormField label="Clay body" required nested last>
        {clayBodies.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {clayBodies.map((cb) => {
              const isActive = form.clay === cb.name;
              return (
                <Pressable
                  key={cb.id}
                  onPress={() => set('clay', isActive ? '' : cb.name)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  className={`px-3 py-1.5 rounded-full border ${
                    isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isActive ? 'text-background' : 'text-muted-foreground'
                    }`}
                  >
                    {cb.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Input
            placeholder="e.g. B-Mix, Porcelain, Stoneware"
            value={form.clay}
            onChangeText={v => set('clay', v)}
          />
        )}
      </FormField>
      </FormSectionCard>

      {!isCemetery ? (
      <CollapsibleFormSection
        title="Workshop details"
        subtitle="Location, forming method, and form — optional."
        open={showWorkshopDetails}
        onOpenChange={setShowWorkshopDetails}
      >
      <FormField label="Location" nested first>
        <Input
          placeholder="e.g. Studio shelf B, Home"
          value={form.location}
          onChangeText={v => set('location', v)}
        />
      </FormField>

      <FormField label="Forming method" nested>
        {formingMethods.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {formingMethods.map((fm) => {
              const isActive = form.formingMethod === fm.name;
              return (
                <Pressable
                  key={fm.id}
                  onPress={() => set('formingMethod', isActive ? '' : fm.name)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  className={`px-3 py-1.5 rounded-full border ${
                    isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isActive ? 'text-background' : 'text-muted-foreground'
                    }`}
                  >
                    {fm.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Input
            placeholder="e.g. Wheel Thrown, Slab Built"
            value={form.formingMethod}
            onChangeText={v => set('formingMethod', v)}
          />
        )}
      </FormField>

      <FormField label="Form" nested last>
        {pieceFormOptions.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {pieceFormOptions.map((opt) => {
              const isActive = form.form === opt.name;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => set('form', isActive ? '' : opt.name)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  className={`px-3 py-1.5 rounded-full border ${
                    isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isActive ? 'text-background' : 'text-muted-foreground'
                    }`}
                  >
                    {opt.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Input
            placeholder="e.g. Mug, Bowl, Vase"
            value={form.form}
            onChangeText={v => set('form', v)}
          />
        )}
      </FormField>
      </CollapsibleFormSection>
      ) : null}

      {/* Cemetery fields */}
      {isCemetery && (
        <FormSectionCard title="Memorial" subtitle="How this piece is remembered in the cemetery.">
          <FormField label="Epitaph" nested first>
            <Input
              placeholder="e.g. Cracked but not forgotten 🕯️"
              value={form.epitaph}
              onChangeText={v => set('epitaph', v)}
            />
          </FormField>
          <NotesInput
            label="Cause of Death"
            placeholder="e.g. Thermal shock, too ambitious a handle..."
            value={form.causeOfDeath}
            onChangeText={(v) => set('causeOfDeath', v)}
            minHeight={88}
            containerStyle={{ marginTop: 16, marginBottom: 0 }}
          />
        </FormSectionCard>
      )}

      {/* Weight + Dimensions */}
      {!isCemetery && (
      <FormSectionCard title="Size" subtitle="Weight and dimensions for pricing estimates.">
      <FormFieldRow nested first>
        <FormField label="Weight" nested inline>
          <Input
            placeholder="e.g. 450 g or 0.45 kg"
            value={form.weight}
            onChangeText={v => set('weight', v)}
          />
        </FormField>
        <FormField label="Dimensions" nested inline>
          <Input
            placeholder="e.g. 12 × 8 cm"
            value={form.dimensions}
            onChangeText={v => set('dimensions', v)}
          />
        </FormField>
      </FormFieldRow>
      </FormSectionCard>
      )}

      {/* Pricing Calculator */}
      {!isCemetery && (
        <CollapsibleFormSection
          title="Pricing calculator"
          subtitle="Estimate costs and suggested retail from size and studio rules."
          open={showPricingSection}
          onOpenChange={setShowPricingSection}
        >
        <View>
            <Text className="text-[11px] text-muted-foreground">
                Height and width estimate firing and glaze size. Weight estimates clay from your 10 kg clay cost. {pricingSettings.studioLabel} is set to {PRICING_USER_TYPE_LABELS[pricingSettings.pricingUserType].toLowerCase()} with labor, admin, fees, and tax included.
            </Text>

            <View className="flex-row gap-3 mt-3">
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Height (cm)</Text>
                <Input
                  placeholder="e.g. 12"
                  value={form.heightCm}
                  onChangeText={v => set('heightCm', v)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Width (cm)</Text>
                <Input
                  placeholder="e.g. 8"
                  value={form.widthCm}
                  onChangeText={v => set('widthCm', v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-2">Firing Type</Text>
            <View className="flex-row gap-2">
              {([
                { value: 'bisque', label: 'Bisque' },
                { value: 'bisque-glaze', label: 'Bisque + Glaze' },
              ] as const).map((option) => {
                const isActive = firingFeeMode === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => set('firingFeeMode', option.value)}
                    className={`flex-1 px-3 py-2 rounded-full border items-center ${
                      isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                    }`}
                    activeOpacity={0.75}
                  >
                    <Text className={`text-xs font-medium ${isActive ? 'text-background' : 'text-muted-foreground'}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">Estimated Volume</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {pricingSnapshot.volumeCm3 ? `${pricingSnapshot.volumeCm3} cm³` : '-'}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Firing Fee</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {pricingSnapshot.quoteRequired
                    ? 'N.O.T.K'
                    : pricingSnapshot.firingFee != null
                      ? formatMoney(pricingSnapshot.firingFee)
                      : '-'}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Clay Estimate</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {formatMoney(pricingSnapshot.clayCost)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Total Cost</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {formatMoney(pricingSnapshot.totalCost)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Suggested Retail</Text>
                <Text className="text-xs font-semibold text-primary">
                  {formatMoney(pricingSnapshot.suggestedPrice)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Wholesale Floor</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {formatMoney(pricingSnapshot.wholesalePrice)}
                </Text>
              </View>
            </View>

            <View className="h-px bg-border my-5" />
            <Text className="text-[13px] font-semibold text-foreground mb-1">
              Time, materials & overrides
            </Text>
            <Text className="text-xs text-muted-foreground mb-4 leading-5">
              Labor rates, clay price, overhead, and fees come from Profile → Pricing Rules.
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Making Hours</Text>
                <Input
                  placeholder={String(pricingSettings.defaultWorkHours)}
                  value={form.workHours}
                  onChangeText={v => set('workHours', v)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Admin Hours</Text>
                <Input
                  placeholder={String(pricingSettings.defaultAdminHours)}
                  value={form.adminHours}
                  onChangeText={v => set('adminHours', v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">Auto clay from weight</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.clayCost)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Auto glaze from size</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.glazeCost)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Extra kiln energy</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.energyCost)}</Text>
              </View>
            </View>
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Clay Override</Text>
                <Input
                  placeholder="Leave blank for auto"
                  value={form.costClayOverride}
                  onChangeText={v => set('costClayOverride', v)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Glaze Override</Text>
                <Input
                  placeholder="Leave blank for auto"
                  value={form.costGlazeOverride}
                  onChangeText={v => set('costGlazeOverride', v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View className="mt-3 flex-row gap-3">
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Extra Kiln Energy</Text>
                <Input
                  placeholder="Optional"
                  value={form.costEnergyOverride}
                  onChangeText={v => set('costEnergyOverride', v)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Other Extras</Text>
                <Input
                  placeholder="Packaging, labels, etc."
                  value={form.costOther}
                  onChangeText={v => set('costOther', v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View className="mt-3">
              <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Profit Buffer %</Text>
              <Input
                placeholder="e.g. 100"
                value={form.markupPct}
                onChangeText={v => set('markupPct', v)}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">Clay</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.clayCost)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Glaze</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.glazeCost)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Extra kiln energy</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.energyCost)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Other extras</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.otherCost)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Firing</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.firingFee ?? 0)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Making labor</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.laborCost)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Admin labor</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.adminCost)}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Overhead</Text>
                <Text className="text-xs font-medium text-foreground">{formatMoney(pricingSnapshot.overheadCost)}</Text>
              </View>
            </View>
        </View>
        </CollapsibleFormSection>
      )}

      {/* Studio glaze link */}
      {!isCemetery && (
      <FormSectionCard title="Glaze" subtitle="Link a studio glaze and record firing outcome.">
      <View>
        <GlazePickerField
          value={form.glazeId}
          onChange={(glazeId) => {
            if (!glazeId) {
              set('glazeId', '');
              set('glazeOutcome', '');
              return;
            }
            set('glazeId', glazeId);
          }}
        />
        {showGlazeOutcome ? (
          <FormField label="Firing outcome" nested>
            <View className="flex-row flex-wrap gap-2">
              {GLAZE_OUTCOME_OPTIONS.map((option) => (
                <Pill
                  key={option}
                  label={GLAZE_OUTCOME_LABELS[option]}
                  active={form.glazeOutcome === option}
                  onPress={() => set('glazeOutcome', form.glazeOutcome === option ? '' : option)}
                />
              ))}
            </View>
          </FormField>
        ) : null}
      </View>
      </FormSectionCard>
      )}

      {/* Decorations */}
      {!isCemetery && (
      <NotesInput
        label="Decorations"
        hint="Glazes, techniques, and surface treatments."
        placeholder="Glazes, techniques, surface treatments..."
        value={form.decorations}
        onChangeText={(v) => set('decorations', v)}
        minHeight={88}
      />
      )}

      {/* Notes */}
      {!isCemetery && (
      <NotesInput
        label="Notes"
        hint="Anything else worth remembering about this piece."
        placeholder="Any additional notes..."
        value={form.notes}
        onChangeText={(v) => set('notes', v)}
        minHeight={88}
      />
      )}

      {/* Status */}
      {showStatusFields ? (
      <CollapsibleFormSection
        title="Listing & condition"
        subtitle="Sold, available, gifted, and condition issues."
        open={showListingDetails}
        onOpenChange={setShowListingDetails}
      >
      <FormField
        label="Listing & outcome"
        hint="Sold, available, gifted, and other dispositions."
        nested
        first
      >
        <OptionPills
          options={PIECE_DISPOSITION_STATUSES}
          value={isConditionStatus(form.status) ? '' : form.status}
          onChange={v => set('status', v)}
        />
      </FormField>
      <FormField
        label="Condition issues"
        hint="Cracked or warped pieces."
        nested
        last
      >
        <OptionPills
          options={PIECE_CONDITION_STATUSES}
          value={isConditionStatus(form.status) ? form.status : ''}
          onChange={v => set('status', v)}
        />
      </FormField>
      </CollapsibleFormSection>
      ) : null}

      {/* Price */}
      {!isCemetery && isFinished && (
      <FormSectionCard title="Selling targets" subtitle="Retail or wholesale price when listing this piece." last>
      <FormField label="Selling mode" nested first>
        <View className="flex-row gap-2 mb-3">
          {([
            { value: 'retail', label: 'Retail' },
            { value: 'wholesale', label: 'Wholesale' },
          ] as const).map((option) => {
            const isActive = form.salePriceMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => set('salePriceMode', option.value)}
                className={`flex-1 px-3 py-2 rounded-full border items-center ${
                  isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                }`}
                activeOpacity={0.75}
              >
                <Text className={`text-xs font-medium ${isActive ? 'text-background' : 'text-muted-foreground'}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="rounded-2xl border border-border bg-card p-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Retail Target</Text>
              <Input
                placeholder={pricingSnapshot.suggestedPrice > 0 ? formatMoney(pricingSnapshot.suggestedPrice) : `e.g. ${pricingSettings.currencySymbol}45.00`}
                value={form.retailPriceTarget}
                onChangeText={v => set('retailPriceTarget', v)}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Wholesale Target</Text>
              <Input
                placeholder={pricingSnapshot.wholesalePrice > 0 ? formatMoney(pricingSnapshot.wholesalePrice) : `e.g. ${pricingSettings.currencySymbol}28.00`}
                value={form.wholesalePriceTarget}
                onChangeText={v => set('wholesalePriceTarget', v)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>
        <Text className="text-xs text-muted-foreground mt-2">
          Active mode is {form.salePriceMode}. Leave either field blank to use the calculator's suggested retail or wholesale floor.
        </Text>
      </FormField>
      </FormSectionCard>
      )}
    </ModalFormScrollView>
  );
}
