import {
  ModalCard,
  ModalFormScrollView,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { FormSectionCard } from '@/src/components/form/FormSectionCard';
import { NotesInput } from '@/src/components/NotesInput';
import { DatePickerField } from '@/src/components/DatePickerField';
import { PhotoPickField } from '@/src/components/PhotoPickField';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Text } from '@/src/components/ui/text';
import { FormField, FormFieldRow } from '@/src/screens/library/atlas/FormField';
import { Pill } from '@/src/screens/library/atlas/Pill';
import { useVisibleKilns, useVisiblePieces, useAppStore } from '@/src/store';
import type { Firing, FiringType, Kiln } from '@/src/types/kiln';
import { todayIso } from '@/src/utils/dates';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FIRING_SOURCE_STAGE, KILN_TYPE_LABELS } from '../constants';
import { buildFiringCostBreakdown } from '../firingEstimations';
import { trimOrEmpty } from '../utils/kilnHelpers';
import { formatMoney } from '../utils/kilnUtils';
import { FiringPieceRow } from './FiringPieceRow';

type LogFiringForm = {
  firedDate: string;
  peakTempC: string;
  holdTimeMinutes: string;
  photoUri: string;
  type: FiringType;
  result: 'success' | 'issues';
  resultNotes: string;
};

const EMPTY_FORM: LogFiringForm = {
  firedDate: todayIso(),
  peakTempC: '',
  holdTimeMinutes: '',
  photoUri: '',
  type: 'glaze',
  result: 'success',
  resultNotes: '',
};

const OUTCOME_OPTIONS = [
  { value: 'success' as const, label: 'Success' },
  { value: 'issues' as const, label: 'Issue' },
];

const FIRING_TYPE_OPTIONS: { value: FiringType; label: string }[] = [
  { value: 'glaze', label: 'Glaze' },
  { value: 'bisque', label: 'Bisque' },
];

interface LogFiringModalProps {
  visible: boolean;
  /** Pre-selected kiln; omit when the user should pick from their kiln list. */
  kiln?: Kiln | null;
  onClose: () => void;
  onSaved?: (firing: Firing) => void;
}

export function LogFiringModal({ visible, kiln: kilnProp, onClose, onSaved }: LogFiringModalProps) {
  const sheetHeight = useModalSheetHeight();
  const kilns = useVisibleKilns();
  const pieces = useVisiblePieces();
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);
  const logFiring = useAppStore((s) => s.logFiring);

  const [selectedKilnId, setSelectedKilnId] = React.useState('');
  const [form, setForm] = React.useState<LogFiringForm>(EMPTY_FORM);
  const [selectedPieceIds, setSelectedPieceIds] = React.useState<Set<number>>(new Set());

  const kilnOptions = React.useMemo(
    () => kilns.map((k) => ({ value: k.id, label: `${k.name} (${KILN_TYPE_LABELS[k.type]})` })),
    [kilns],
  );

  const kiln = React.useMemo(
    () => kilns.find((k) => k.id === selectedKilnId) ?? kilnProp ?? null,
    [kilns, selectedKilnId, kilnProp],
  );

  const showKilnPicker = kilns.length > 1;

  React.useEffect(() => {
    if (!visible) return;
    setSelectedKilnId(kilnProp?.id ?? kilns[0]?.id ?? '');
    setForm({
      ...EMPTY_FORM,
      firedDate: todayIso(),
    });
    setSelectedPieceIds(new Set());
  }, [visible, kilnProp?.id, kilns]);

  const set = (key: keyof LogFiringForm) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const readyStage = FIRING_SOURCE_STAGE[form.type] ?? 'glazing';
  const readyPieces = React.useMemo(
    () => pieces.filter((piece) => piece.stage === readyStage),
    [pieces, readyStage],
  );

  const selectedPieces = React.useMemo(
    () => pieces.filter((piece) => selectedPieceIds.has(piece.id)),
    [pieces, selectedPieceIds],
  );

  const costBreakdown = React.useMemo(
    () => buildFiringCostBreakdown({ kiln: kiln ?? undefined, pieces: selectedPieces }),
    [kiln, selectedPieces],
  );

  React.useEffect(() => {
    setSelectedPieceIds((prev) => {
      const next = new Set([...prev].filter((id) => readyPieces.some((piece) => piece.id === id)));
      return next.size === prev.size ? prev : next;
    });
  }, [readyStage, readyPieces]);

  const togglePiece = (pieceId: number) => {
    setSelectedPieceIds((prev) => {
      const next = new Set(prev);
      if (next.has(pieceId)) next.delete(pieceId);
      else next.add(pieceId);
      return next;
    });
  };

  const peakTemp = parseInt(form.peakTempC, 10);
  const holdMinutes = parseInt(form.holdTimeMinutes, 10);
  const notesRequired = form.result === 'issues';
  const notesValid = !notesRequired || trimOrEmpty(form.resultNotes).length > 0;
  const canSave =
    !!kiln
    && peakTemp > 0
    && holdMinutes >= 0
    && !Number.isNaN(holdMinutes)
    && notesValid;

  const handleSave = () => {
    if (!kiln || !canSave) return;

    const firing = logFiring(kiln.id, {
      firedDate: form.firedDate,
      peakTempC: peakTemp,
      holdTimeMinutes: holdMinutes,
      photoUri: trimOrEmpty(form.photoUri) || undefined,
      result: form.result,
      resultNotes: trimOrEmpty(form.resultNotes) || undefined,
      type: form.type,
      pieceIds: Array.from(selectedPieceIds),
    });

    onSaved?.(firing);
    onClose();
  };

  if (!visible) return null;

  const pricingHint =
    kiln?.pricingModel === 'per-volume'
      ? 'Costs use each piece volume when set.'
      : kiln?.pricingModel === 'per-shelf'
        ? 'Costs use shelf pricing from this kiln profile.'
        : 'Costs use the per-kiln rate from this kiln profile.';

  const headerSubtitle = kiln
    ? `${kiln.name} · ${KILN_TYPE_LABELS[kiln.type]} · journal entry`
    : showKilnPicker
      ? 'Pick a kiln · journal entry'
      : 'Journal entry';

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard
        radius={MODAL_SHEET_RADIUS}
        height={sheetHeight}
        maxHeight={sheetHeight}
        withHandle={false}
      >
        <ModalSheetHeader>
          <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Record Past Firing
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {headerSubtitle}
          </Text>
        </ModalSheetHeader>

        <ModalFormScrollView
          className="px-6"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {showKilnPicker ? (
            <FormSectionCard title="Kiln" subtitle="Which kiln ran this load?" topGap>
              <FormField label="Kiln profile" required nested first last>
                <Select
                  value={kilnOptions.find((o) => o.value === selectedKilnId)}
                  onValueChange={(opt) => opt && setSelectedKilnId(opt.value)}
                  options={kilnOptions}
                  placeholder="Select kiln..."
                />
              </FormField>
            </FormSectionCard>
          ) : null}

          <FormSectionCard title="Firing details" subtitle="When it ran and how hot it got." topGap={!showKilnPicker}>
          <FormField label="Date" required first>
            <DatePickerField valueIso={form.firedDate} onChangeIso={set('firedDate')} />
          </FormField>

          <FormFieldRow>
            <FormField label="Peak temp (°C)" required inline>
              <Input
                placeholder="e.g. 1240"
                value={form.peakTempC}
                onChangeText={set('peakTempC')}
                keyboardType="number-pad"
              />
            </FormField>
            <FormField label="Hold (min)" required inline>
              <Input
                placeholder="e.g. 45"
                value={form.holdTimeMinutes}
                onChangeText={set('holdTimeMinutes')}
                keyboardType="number-pad"
              />
            </FormField>
          </FormFieldRow>

          <FormField label="Firing type" required>
            <View className="flex-row flex-wrap gap-2">
              {FIRING_TYPE_OPTIONS.map((option) => (
                <Pill
                  key={option.value}
                  label={option.label}
                  active={form.type === option.value}
                  onPress={() => setForm((current) => ({ ...current, type: option.value }))}
                />
              ))}
            </View>
          </FormField>

          </FormSectionCard>

          <FormSectionCard
            title="Pieces in this firing"
            subtitle={`Optional — ${readyPieces.length} piece${readyPieces.length !== 1 ? 's' : ''} ready for ${form.type}. ${pricingHint}`}
          >
          <FormField label="Select pieces" first last>
            {readyPieces.length === 0 ? (
              <Text className="text-sm text-muted-foreground leading-5">
                No pieces in {readyStage.replace('-', ' ')} stage right now.
              </Text>
            ) : (
              <View className="gap-2">
                {readyPieces.map((piece) => (
                  <FiringPieceRow
                    key={piece.id}
                    piece={piece}
                    kiln={kiln ?? undefined}
                    selected={selectedPieceIds.has(piece.id)}
                    selectable
                    lineCost={
                      costBreakdown.lineItems.find((item) => item.piece.id === piece.id)?.cost ?? null
                    }
                    currencySymbol={currencySymbol}
                    onToggle={() => togglePiece(piece.id)}
                  />
                ))}
              </View>
            )}
          </FormField>

          {selectedPieces.length > 0 ? (
            <View className="rounded-2xl border border-border bg-card/60 overflow-hidden mb-1">
              <View className="flex-row justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
                <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Piece
                </Text>
                <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Est. cost
                </Text>
              </View>
              {costBreakdown.lineItems.map(({ piece, cost, volumeCm3 }, index) => (
                <View
                  key={piece.id}
                  className={`flex-row items-center justify-between px-4 py-3 ${
                    index < costBreakdown.lineItems.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-medium text-foreground">{piece.name}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {piece.clay}
                      {kiln?.pricingModel === 'per-volume' && volumeCm3
                        ? ` · ${volumeCm3} cm³`
                        : ''}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatMoney(currencySymbol, cost)}
                  </Text>
                </View>
              ))}
              <View className="flex-row justify-between px-4 py-3 border-t border-border bg-muted/20">
                <Text className="text-sm font-semibold text-foreground">
                  Total ({selectedPieces.length} {selectedPieces.length === 1 ? 'piece' : 'pieces'})
                </Text>
                <Text className="text-sm font-bold text-foreground">
                  {formatMoney(currencySymbol, costBreakdown.totalCost)}
                </Text>
              </View>
            </View>
          ) : null}

          </FormSectionCard>

          <FormSectionCard title="Photo & outcome" subtitle="How the load came out.">
          <FormField label="Photo" first>
            <PhotoPickField
              variant="slot"
              label="Tap to add firing photo"
              photo={form.photoUri || undefined}
              onPhotoChange={(uri) => setForm((current) => ({ ...current, photoUri: uri ?? '' }))}
              aspect={[4, 3]}
              large
            />
          </FormField>

          <FormField label="Outcome" required>
            <View className="flex-row flex-wrap gap-2">
              {OUTCOME_OPTIONS.map((option) => (
                <Pill
                  key={option.value}
                  label={option.label}
                  active={form.result === option.value}
                  onPress={() => setForm((current) => ({ ...current, result: option.value }))}
                />
              ))}
            </View>
          </FormField>

          </FormSectionCard>

          <NotesInput
            label="Outcome notes"
            hint={notesRequired ? 'Required when reporting an issue.' : 'Optional journal note for this firing.'}
            placeholder={notesRequired ? 'Describe what went wrong…' : 'Optional notes…'}
            value={form.resultNotes}
            onChangeText={set('resultNotes')}
          />
          {notesRequired && !notesValid ? (
            <Text className="text-xs text-muted-foreground -mt-2 mb-4 leading-5">
              Add a short note when reporting an issue.
            </Text>
          ) : null}
        </ModalFormScrollView>

        <ModalSheetFooter>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.82}
            disabled={!canSave}
            className={`rounded-2xl bg-primary py-4 items-center ${canSave ? '' : 'opacity-45'}`}
          >
            <Text className="text-sm font-semibold text-white">Save to journal</Text>
          </TouchableOpacity>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
