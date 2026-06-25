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
import { SelectChip, SelectChipGroup } from '@/src/components/ui/SelectChip';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import { calcFiredSize, calcGreenSize, parseNumericInput } from '@/src/types/pricing';
import React from 'react';
import { View } from 'react-native';

type ShrinkageMode = 'green-to-fired' | 'fired-to-green';

interface ShrinkageCalculatorSheetProps {
  visible: boolean;
  onClose: () => void;
  clayBodyName?: string;
  defaultShrinkagePct?: number;
}

export function ShrinkageCalculatorSheet({
  visible,
  onClose,
  clayBodyName,
  defaultShrinkagePct = 12,
}: ShrinkageCalculatorSheetProps) {
  const sheetHeight = useModalSheetHeight();
  const clayBodies = useAppStore((state) => state.clayBodies);
  const matchedClay = clayBodies.find((clay) => clay.name === clayBodyName);
  const initialShrinkage = matchedClay?.shrinkagePct ?? defaultShrinkagePct;

  const [mode, setMode] = React.useState<ShrinkageMode>('green-to-fired');
  const [sizeCm, setSizeCm] = React.useState('');
  const [shrinkagePct, setShrinkagePct] = React.useState(String(initialShrinkage));

  React.useEffect(() => {
    if (!visible) return;
    setMode('green-to-fired');
    setSizeCm('');
    setShrinkagePct(String(matchedClay?.shrinkagePct ?? defaultShrinkagePct));
  }, [defaultShrinkagePct, matchedClay?.shrinkagePct, visible]);

  const inputSize = parseNumericInput(sizeCm) ?? 0;
  const shrinkage = parseNumericInput(shrinkagePct) ?? initialShrinkage;
  const resultSize = mode === 'green-to-fired'
    ? calcFiredSize(inputSize, shrinkage)
    : calcGreenSize(inputSize, shrinkage);

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text className="text-2xl font-serif font-bold text-foreground">Shrinkage calculator</Text>
          <Text className="text-sm text-muted-foreground mt-1 leading-5">
            Plan finished size from greenware measurements{clayBodyName ? ` for ${clayBodyName}` : ''}.
          </Text>
        </ModalSheetHeader>

        <ModalFormScrollView className="px-6" contentContainerStyle={{ paddingBottom: 120 }}>
          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Direction
          </Text>
          <SelectChipGroup className="mb-4">
            <SelectChip
              label="Green → Fired"
              selected={mode === 'green-to-fired'}
              onPress={() => setMode('green-to-fired')}
            />
            <SelectChip
              label="Fired → Green"
              selected={mode === 'fired-to-green'}
              onPress={() => setMode('fired-to-green')}
            />
          </SelectChipGroup>

          <FormField
            label={mode === 'green-to-fired' ? 'Green size (cm)' : 'Target fired size (cm)'}
            nested
          >
            <Input
              placeholder="e.g. 12"
              value={sizeCm}
              onChangeText={setSizeCm}
              keyboardType="decimal-pad"
            />
          </FormField>

          <View className="mt-3">
            <FormField label="Shrinkage %" nested>
              <Input
                placeholder="e.g. 12"
                value={shrinkagePct}
                onChangeText={setShrinkagePct}
                keyboardType="decimal-pad"
              />
            </FormField>
          </View>

          <View className="mt-5 rounded-2xl border border-border bg-card px-4 py-4">
            <Text className="text-xs text-muted-foreground">
              {mode === 'green-to-fired' ? 'Estimated fired size' : 'Throw/build this green size'}
            </Text>
            <Text className="text-2xl font-serif font-bold text-foreground mt-1">
              {inputSize > 0 ? `${resultSize} cm` : '—'}
            </Text>
            {matchedClay?.shrinkagePct != null ? (
              <Text className="text-[11px] text-muted-foreground mt-2">
                Using {matchedClay.name} default of {matchedClay.shrinkagePct}% shrinkage.
              </Text>
            ) : null}
          </View>
        </ModalFormScrollView>

        <ModalSheetFooter>
          <Button onPress={onClose} className="w-full">
            <Text className="text-primary-foreground font-semibold">Done</Text>
          </Button>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
