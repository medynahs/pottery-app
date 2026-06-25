import {
  ModalCard,
  ModalFormScrollView,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { FormField } from '@/src/components/form/FormField';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import React from 'react';
import { View } from 'react-native';
import type { Piece } from '@/src/types/pieces';
import {
  calculatePiecePricingSnapshot,
  getActivePricingSettings,
  normalizePricingSettings,
  parseNumericInput,
} from '@/src/types/pricing';

function formatInputNumber(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return '';
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return `${rounded}`.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

interface PiecePricingAdjustSheetProps {
  visible: boolean;
  piece: Piece;
  onClose: () => void;
  onSave: (piece: Piece) => void;
}

export function PiecePricingAdjustSheet({
  visible,
  piece,
  onClose,
  onSave,
}: PiecePricingAdjustSheetProps) {
  const sheetHeight = useModalSheetHeight();
  const pricingSettingsState = useAppStore((state) => state.pricingSettings);
  const pricingTemplates = useAppStore((state) => state.pricingTemplates);
  const pricingSettings = React.useMemo(
    () => getActivePricingSettings(pricingTemplates, normalizePricingSettings(pricingSettingsState)),
    [pricingSettingsState, pricingTemplates],
  );

  const [workHours, setWorkHours] = React.useState('');
  const [adminHours, setAdminHours] = React.useState('');
  const [costClayOverride, setCostClayOverride] = React.useState('');
  const [costGlazeOverride, setCostGlazeOverride] = React.useState('');
  const [costEnergyOverride, setCostEnergyOverride] = React.useState('');
  const [costOther, setCostOther] = React.useState('');
  const [markupPct, setMarkupPct] = React.useState('');

  React.useEffect(() => {
    if (!visible) return;
    setWorkHours(formatInputNumber(piece.workHours ?? (piece.workMinutes != null ? piece.workMinutes / 60 : undefined)));
    setAdminHours(formatInputNumber(piece.adminHours ?? (piece.adminMinutes != null ? piece.adminMinutes / 60 : undefined)));
    setCostClayOverride(formatInputNumber(piece.costClayOverride));
    setCostGlazeOverride(formatInputNumber(piece.costGlazeOverride));
    setCostEnergyOverride(formatInputNumber(piece.costEnergyOverride));
    setCostOther(formatInputNumber(piece.costOther));
    setMarkupPct(piece.markupPct != null ? String(piece.markupPct) : '');
  }, [piece, visible]);

  const handleSave = () => {
    const parsedWorkHours = parseNumericInput(workHours) ?? pricingSettings.defaultWorkHours;
    const parsedAdminHours = parseNumericInput(adminHours) ?? pricingSettings.defaultAdminHours;
    const parsedMarkupPct = parseNumericInput(markupPct) ?? pricingSettings.defaultMarkupPct;
    const snapshot = calculatePiecePricingSnapshot({
      heightCm: piece.heightCm ?? null,
      widthCm: piece.widthCm ?? null,
      weightGrams: piece.weightGrams ?? null,
      mode: piece.firingFeeMode ?? pricingSettings.defaultMode,
      settings: pricingSettings,
      clayCostOverride: parseNumericInput(costClayOverride),
      glazeCostOverride: parseNumericInput(costGlazeOverride),
      energyCostOverride: parseNumericInput(costEnergyOverride),
      otherCost: parseNumericInput(costOther),
      markupPct: parsedMarkupPct,
      workHours: parsedWorkHours,
      adminHours: parsedAdminHours,
    });

    onSave({
      ...piece,
      workHours: parsedWorkHours,
      adminHours: parsedAdminHours,
      workMinutes: Math.round(parsedWorkHours * 60),
      adminMinutes: Math.round(parsedAdminHours * 60),
      costClayOverride: parseNumericInput(costClayOverride) ?? undefined,
      costGlazeOverride: parseNumericInput(costGlazeOverride) ?? undefined,
      costEnergyOverride: parseNumericInput(costEnergyOverride) ?? undefined,
      costOther: snapshot.otherCost,
      markupPct: parsedMarkupPct,
      costClay: snapshot.clayCost,
      costGlaze: snapshot.glazeCost,
      costEnergy: snapshot.energyCost,
      materialCost: snapshot.materialCost,
      laborCost: snapshot.laborCost,
      adminCost: snapshot.adminCost,
      overheadCost: snapshot.overheadCost,
      sellingFeeAmount: snapshot.sellingFeeAmount,
      taxAmount: snapshot.taxAmount,
      profitAmount: snapshot.profitAmount,
      totalCost: snapshot.totalCost,
      suggestedPrice: snapshot.suggestedPrice,
      wholesalePrice: snapshot.wholesalePrice,
      retailPriceTarget: piece.retailPriceTarget ?? snapshot.suggestedPrice,
      wholesalePriceTarget: piece.wholesalePriceTarget ?? snapshot.wholesalePrice,
    });
    onClose();
  };

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text className="text-2xl font-serif font-bold text-foreground">Adjust for this piece</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Override labor, materials, and profit for {piece.name}.
          </Text>
        </ModalSheetHeader>

        <ModalFormScrollView className="px-6" contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FormField label="Making hours" nested inline>
                <Input
                  placeholder={String(pricingSettings.defaultWorkHours)}
                  value={workHours}
                  onChangeText={setWorkHours}
                  keyboardType="decimal-pad"
                />
              </FormField>
            </View>
            <View className="flex-1">
              <FormField label="Admin hours" nested inline>
                <Input
                  placeholder={String(pricingSettings.defaultAdminHours)}
                  value={adminHours}
                  onChangeText={setAdminHours}
                  keyboardType="decimal-pad"
                />
              </FormField>
            </View>
          </View>

          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">
              <FormField label="Clay override" nested inline>
                <Input
                  placeholder="Auto from weight"
                  value={costClayOverride}
                  onChangeText={setCostClayOverride}
                  keyboardType="decimal-pad"
                />
              </FormField>
            </View>
            <View className="flex-1">
              <FormField label="Glaze override" nested inline>
                <Input
                  placeholder="Auto from size"
                  value={costGlazeOverride}
                  onChangeText={setCostGlazeOverride}
                  keyboardType="decimal-pad"
                />
              </FormField>
            </View>
          </View>

          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">
              <FormField label="Extra kiln energy" nested inline>
                <Input
                  placeholder="Optional"
                  value={costEnergyOverride}
                  onChangeText={setCostEnergyOverride}
                  keyboardType="decimal-pad"
                />
              </FormField>
            </View>
            <View className="flex-1">
              <FormField label="Other extras" nested inline>
                <Input
                  placeholder="Packaging, labels..."
                  value={costOther}
                  onChangeText={setCostOther}
                  keyboardType="decimal-pad"
                />
              </FormField>
            </View>
          </View>

          <View className="mt-3">
            <FormField label="Profit buffer %" nested>
              <Input
                placeholder={String(pricingSettings.defaultMarkupPct)}
                value={markupPct}
                onChangeText={setMarkupPct}
                keyboardType="decimal-pad"
              />
            </FormField>
          </View>
        </ModalFormScrollView>

        <ModalSheetFooter>
          <Button onPress={handleSave} className="w-full">
            <Text className="text-primary-foreground font-semibold">Save adjustments</Text>
          </Button>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
