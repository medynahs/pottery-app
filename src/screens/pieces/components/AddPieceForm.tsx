import { ModalFormScrollView } from '@/src/components/AppSheets';
import { CollapsibleFormSection, FormSectionCard } from '@/src/components/form/FormSectionCard';
import { FormField, FormFieldRow } from '@/src/components/form/FormField';
import { PhotoPickField } from '@/src/components/PhotoPickField';
import { Input } from '@/src/components/ui/input';
import { SelectChip, SelectChipGroup } from '@/src/components/ui/SelectChip';
import { Text } from '@/src/components/ui/text';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { useAppStore } from '@/src/store/appStore';
import { Pill } from '@/src/screens/library/atlas/Pill';
import { meetsDetailLevel, type PieceDetailLevel } from '@/src/utils/roleBasedUx';
import { Minus, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import type { PieceForm } from '../../../types/pieces';
import {
  calculatePiecePricingSnapshot,
  parseNumericInput,
  PRICING_USER_TYPE_LABELS,
  type PricingFiringMode,
  type PricingSettings,
  weightFormToGrams,
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
  detailLevel: PieceDetailLevel;
  pricingSettings: PricingSettings;
  isEditing?: boolean;
  fillHeight?: boolean;
}

export function AddPieceForm({
  form,
  set,
  colors,
  detailLevel,
  pricingSettings,
  isEditing,
  fillHeight,
}: AddPieceFormProps) {
  const router = useRouter();
  const { enabledStages } = useStageConfig();
  const clayBodies = useAppStore((s) => s.clayBodies);
  const formingMethods = useAppStore((s) => s.formingMethods);
  const pieceFormOptions = useAppStore((s) => s.pieceFormOptions);
  const [showListingDetails, setShowListingDetails] = React.useState(
    () => Boolean(form.status?.trim()),
  );

  const isCemetery = form.stage === 'cemetery';
  const isFinished = form.stage === 'finished';
  const showStatusFields = !isCemetery && (isFinished || isEditing) && meetsDetailLevel(detailLevel, 'full');
  const showGlazeOutcome =
    Boolean(form.glazeId)
    && ['glazing', 'glaze-fired', 'finished'].includes(form.stage);

  const firingFeeMode: PricingFiringMode = form.firingFeeMode === 'bisque' ? 'bisque' : 'bisque-glaze';
  const pricingSnapshot = React.useMemo(() => {
    return calculatePiecePricingSnapshot({
      heightCm: parseNumericInput(form.heightCm),
      widthCm: parseNumericInput(form.widthCm),
      weightGrams: weightFormToGrams(form.weightValue, form.weightUnit),
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
  }, [form, firingFeeMode, pricingSettings]);

  const formatMoney = React.useCallback((value: number) => {
    return `${pricingSettings.currencySymbol}${value.toFixed(2)}`;
  }, [pricingSettings.currencySymbol]);

  const showStandard = meetsDetailLevel(detailLevel, 'standard');
  const showFull = meetsDetailLevel(detailLevel, 'full');

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

      <FormSectionCard title="Basics" subtitle="Name and clay body." topGap>
        <FormField label="Piece name" required nested first>
          <Input
            placeholder="e.g. Speckled Mug"
            value={form.name}
            onChangeText={(v) => set('name', v)}
          />
        </FormField>

        {!isCemetery && !isEditing && showStandard && (
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

        {showStandard && (
          <FormField label="Current stage" nested>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="flex-row gap-2"
            >
              {enabledStages.map((stage) => {
                const StageIcon = resolveStageIcon(stage);
                return (
                  <SelectChip
                    key={stage.id}
                    label={stage.label}
                    icon={StageIcon}
                    selected={form.stage === stage.id}
                    onPress={() => set('stage', stage.id)}
                  />
                );
              })}
            </ScrollView>
          </FormField>
        )}

        <FormField label="Clay body" required nested last={!showStandard}>
          {clayBodies.length > 0 ? (
            <SelectChipGroup>
              {clayBodies.map((cb) => (
                <SelectChip
                  key={cb.id}
                  label={cb.name}
                  selected={form.clay === cb.name}
                  allowDeselect={false}
                  onPress={() => set('clay', cb.name)}
                />
              ))}
            </SelectChipGroup>
          ) : (
            <Input
              placeholder="e.g. B-Mix, Porcelain, Stoneware"
              value={form.clay}
              onChangeText={(v) => set('clay', v)}
            />
          )}
        </FormField>

        {showStandard && !isCemetery && (
          <FormField label="Location" nested last>
            <Input
              placeholder="e.g. Studio shelf B, Home"
              value={form.location}
              onChangeText={(v) => set('location', v)}
            />
          </FormField>
        )}
      </FormSectionCard>

      {showFull && !isCemetery && (
        <FormSectionCard title="Workshop details" subtitle="Forming method and form — optional.">
          <FormField label="Forming method" nested first>
            {formingMethods.length > 0 ? (
              <SelectChipGroup>
                {formingMethods.map((fm) => (
                  <SelectChip
                    key={fm.id}
                    label={fm.name}
                    selected={form.formingMethod === fm.name}
                    allowDeselect
                    onPress={() => set('formingMethod', form.formingMethod === fm.name ? '' : fm.name)}
                  />
                ))}
              </SelectChipGroup>
            ) : (
              <Input
                placeholder="e.g. Wheel Thrown, Slab Built"
                value={form.formingMethod}
                onChangeText={(v) => set('formingMethod', v)}
              />
            )}
          </FormField>

          <FormField label="Form" nested last>
            {pieceFormOptions.length > 0 ? (
              <SelectChipGroup>
                {pieceFormOptions.map((opt) => (
                  <SelectChip
                    key={opt.id}
                    label={opt.name}
                    selected={form.form === opt.name}
                    allowDeselect
                    onPress={() => set('form', form.form === opt.name ? '' : opt.name)}
                  />
                ))}
              </SelectChipGroup>
            ) : (
              <Input
                placeholder="e.g. Mug, Bowl, Vase"
                value={form.form}
                onChangeText={(v) => set('form', v)}
              />
            )}
          </FormField>
        </FormSectionCard>
      )}

      {isCemetery && (
        <FormSectionCard title="Memorial" subtitle="How this piece is remembered in the cemetery.">
          <FormField label="Epitaph" nested first>
            <Input
              placeholder="e.g. Cracked but not forgotten 🕯️"
              value={form.epitaph}
              onChangeText={(v) => set('epitaph', v)}
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

      {showStandard && !isCemetery && (
        <FormSectionCard title="Size" subtitle="Weight and dimensions for pricing estimates.">
          <FormFieldRow nested first>
            <FormField label="Weight" nested inline>
              <View className="flex-row gap-2">
                <Input
                  className="flex-1"
                  placeholder="e.g. 450"
                  value={form.weightValue}
                  onChangeText={(v) => set('weightValue', v)}
                  keyboardType="decimal-pad"
                />
                <SelectChipGroup className="flex-shrink-0">
                  {(['g', 'kg'] as const).map((unit) => (
                    <SelectChip
                      key={unit}
                      label={unit}
                      selected={form.weightUnit === unit}
                      onPress={() => set('weightUnit', unit)}
                      className="px-2.5"
                    />
                  ))}
                </SelectChipGroup>
              </View>
            </FormField>
          </FormFieldRow>
          <FormFieldRow nested last>
            <FormField label="Height (cm)" nested inline>
              <Input
                placeholder="e.g. 12"
                value={form.heightCm}
                onChangeText={(v) => set('heightCm', v)}
                keyboardType="decimal-pad"
              />
            </FormField>
            <FormField label="Width (cm)" nested inline>
              <Input
                placeholder="e.g. 8"
                value={form.widthCm}
                onChangeText={(v) => set('widthCm', v)}
                keyboardType="decimal-pad"
              />
            </FormField>
          </FormFieldRow>
        </FormSectionCard>
      )}

      {showFull && !isCemetery && (
        <FormSectionCard title="Price estimate" subtitle="Based on size and your studio pricing rules.">
          <Text className="text-[11px] text-muted-foreground leading-5">
            {pricingSettings.studioLabel} uses {PRICING_USER_TYPE_LABELS[pricingSettings.pricingUserType].toLowerCase()} defaults for labor, fees, and tax.
          </Text>

          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-2">
            Firing type
          </Text>
          <SelectChipGroup>
            {([
              { value: 'bisque', label: 'Bisque' },
              { value: 'bisque-glaze', label: 'Bisque + Glaze' },
            ] as const).map((option) => (
              <SelectChip
                key={option.value}
                label={option.label}
                selected={firingFeeMode === option.value}
                onPress={() => set('firingFeeMode', option.value)}
                className="flex-1 justify-center"
              />
            ))}
          </SelectChipGroup>

          <View className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-muted-foreground">Suggested retail</Text>
              <Text className="text-sm font-semibold text-primary">
                {formatMoney(pricingSnapshot.suggestedPrice)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-xs text-muted-foreground">Wholesale floor</Text>
              <Text className="text-xs font-semibold text-foreground">
                {formatMoney(pricingSnapshot.wholesalePrice)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-xs text-muted-foreground">Total cost</Text>
              <Text className="text-xs font-medium text-foreground">
                {formatMoney(pricingSnapshot.totalCost)}
              </Text>
            </View>
          </View>

          <FormField label="Your asking price" nested>
            <Input
              placeholder={pricingSnapshot.suggestedPrice > 0 ? formatMoney(pricingSnapshot.suggestedPrice) : `e.g. ${pricingSettings.currencySymbol}45.00`}
              value={form.retailPriceTarget}
              onChangeText={(v) => set('retailPriceTarget', v)}
              keyboardType="decimal-pad"
            />
          </FormField>

          <TouchableOpacity
            onPress={() => router.push('/pricing-rules')}
            className="mt-1"
            activeOpacity={0.75}
          >
            <Text className="text-xs font-semibold text-primary">Studio pricing rules →</Text>
          </TouchableOpacity>
        </FormSectionCard>
      )}

      {showFull && !isCemetery && (
        <FormSectionCard title="Glaze" subtitle="Link a studio glaze and record firing outcome.">
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
        </FormSectionCard>
      )}

      {showFull && !isCemetery && (
        <NotesInput
          label="Decorations"
          hint="Glazes, techniques, and surface treatments."
          placeholder="Glazes, techniques, surface treatments..."
          value={form.decorations}
          onChangeText={(v) => set('decorations', v)}
          minHeight={88}
        />
      )}

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
              onChange={(v) => set('status', v)}
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
              onChange={(v) => set('status', v)}
            />
          </FormField>
        </CollapsibleFormSection>
      ) : null}

      {showFull && !isCemetery && isFinished && (
        <FormSectionCard title="Selling targets" subtitle="Retail or wholesale price when listing this piece." last>
          <FormField label="Selling mode" nested first>
            <SelectChipGroup className="mb-3">
              {([
                { value: 'retail', label: 'Retail' },
                { value: 'wholesale', label: 'Wholesale' },
              ] as const).map((option) => (
                <SelectChip
                  key={option.value}
                  label={option.label}
                  selected={form.salePriceMode === option.value}
                  onPress={() => set('salePriceMode', option.value)}
                  className="flex-1 justify-center"
                />
              ))}
            </SelectChipGroup>
            <View className="rounded-2xl border border-border bg-card p-4">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Retail Target</Text>
                  <Input
                    placeholder={pricingSnapshot.suggestedPrice > 0 ? formatMoney(pricingSnapshot.suggestedPrice) : `e.g. ${pricingSettings.currencySymbol}45.00`}
                    value={form.retailPriceTarget}
                    onChangeText={(v) => set('retailPriceTarget', v)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Wholesale Target</Text>
                  <Input
                    placeholder={pricingSnapshot.wholesalePrice > 0 ? formatMoney(pricingSnapshot.wholesalePrice) : `e.g. ${pricingSettings.currencySymbol}28.00`}
                    value={form.wholesalePriceTarget}
                    onChangeText={(v) => set('wholesalePriceTarget', v)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
            <Text className="text-xs text-muted-foreground mt-2">
              Active mode is {form.salePriceMode}. Leave either field blank to use the suggested retail or wholesale floor.
            </Text>
          </FormField>
        </FormSectionCard>
      )}
    </ModalFormScrollView>
  );
}
