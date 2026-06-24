// src/screens/kiln/components/StartFiringModalContent.tsx
import { FormField, FormFieldRow } from '@/src/components/form/FormField';
import { FormSectionCard } from '@/src/components/form/FormSectionCard';
import { NotesInput } from '@/src/components/NotesInput';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Text } from '@/src/components/ui/text';
import { Check } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import type { FiringType, Kiln } from '../../../types/kiln';
import type { Piece } from '../../../types/pieces';
import {
  CONE_OPTIONS,
  CORE_FIRING_TYPE_OPTIONS
} from '../constants';
import { formatReadyDate } from '../firingEstimations';

export type StartFiringModalStep = 'setup' | 'safety' | 'confirm';

export type StartFiringFormValues = {
  name: string;
  type: FiringType;
  location: 'studio';
  submissionDate: string;
  kilnId: string;
  cone: string;
  clayBodiesUsed: string;
  glazeNotes: string;
  notes: string;
};

export const EMPTY_START_FIRING_FORM: StartFiringFormValues = {
  name: '',
  type: 'bisque',
  location: 'studio',
  submissionDate: new Date().toISOString().slice(0, 10),
  kilnId: '',
  cone: '04',
  clayBodiesUsed: '',
  glazeNotes: '',
  notes: '',
};

export type StartFiringPalette = {
  primary: string;
  border: string;
  foreground: string;
  background: string;
  mutedForeground: string;
};

export type KilnOption = { value: string; label: string };

// ─── Props ───────────────────────────────────────────────────────────────────

export interface StartFiringModalContentProps {
  step: 'setup' | 'confirm';
  form: StartFiringFormValues;
  setForm: React.Dispatch<React.SetStateAction<StartFiringFormValues>>;
  selectedPieceIds: Set<number>;
  togglePiece: (id: number) => void;
  kilnOptions: KilnOption[];
  kilns: Kiln[];
  selectedKiln: Kiln | undefined;
  sortedAssignablePieces: Piece[];
  readyAssignablePieceIds: Set<number>;
  allReadySelected: boolean;
  handleSelectAllReady: () => void;
  readyQueueEmptyMessage: string;
  selectedPieces: Piece[];
  costEstimate: { totalCost: number | null; costPerPiece: number | null };
  expectedReadyAt: string | null;
  currencySymbol: string;
  palette: StartFiringPalette;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StartFiringModalContent({
  step,
  form,
  setForm,
  selectedPieceIds,
  togglePiece,
  kilnOptions,
  kilns,
  selectedKiln,
  sortedAssignablePieces,
  readyAssignablePieceIds,
  allReadySelected,
  handleSelectAllReady,
  readyQueueEmptyMessage,
  selectedPieces,
  costEstimate,
  expectedReadyAt,
  currencySymbol,
  palette,
}: StartFiringModalContentProps) {
  const set = (key: keyof StartFiringFormValues) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <>
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {step === 'setup' ? 'Step 1 of 3 · Setup' : 'Step 3 of 3 · Review & Confirm'}
      </Text>

      {step === 'setup' ? (
        <>
          <FormSectionCard title="Firing details" subtitle="Name, type, and target cone." topGap>
            <FormField label="Firing name" required nested first>
              <Input
                placeholder="e.g. Bisque Firing #12"
                value={form.name}
                onChangeText={set('name')}
              />
            </FormField>

            <FormFieldRow nested last>
              <FormField label="Type" nested inline>
                <Select
                  value={CORE_FIRING_TYPE_OPTIONS.find((o) => o.value === form.type)}
                  onValueChange={(opt) =>
                    opt && setForm((f) => ({ ...f, type: opt.value as FiringType }))
                  }
                  options={CORE_FIRING_TYPE_OPTIONS}
                />
              </FormField>
              <FormField label="Cone" nested inline>
                <Select
                  value={CONE_OPTIONS.find((o) => o.value === form.cone)}
                  onValueChange={(opt) => opt && setForm((f) => ({ ...f, cone: opt.value }))}
                  options={CONE_OPTIONS}
                />
              </FormField>
            </FormFieldRow>
          </FormSectionCard>

          <FormSectionCard
            title={`Ready to fire (${selectedPieceIds.size})`}
            subtitle="Pieces at the right stage for this firing type."
          >
            {readyAssignablePieceIds.size > 0 ? (
              <TouchableOpacity onPress={handleSelectAllReady} className="mb-3 self-end">
                <Text className="text-[11px] font-semibold" style={{ color: palette.primary }}>
                  {allReadySelected
                    ? 'Clear all'
                    : `Select all (${readyAssignablePieceIds.size})`}
                </Text>
              </TouchableOpacity>
            ) : null}

            <View className="border border-border rounded-2xl overflow-hidden">
            {sortedAssignablePieces.length === 0 ? (
              <View className="p-4">
                <Text className="text-sm text-muted-foreground leading-5">
                  {readyQueueEmptyMessage}
                </Text>
              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: 260 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {sortedAssignablePieces.map((p, idx) => {
                  const selected = selectedPieceIds.has(p.id);

                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => togglePiece(p.id)}
                      className={`flex-row items-center gap-3 px-4 py-3 ${
                        idx < sortedAssignablePieces.length - 1 ? 'border-b border-border' : ''
                      } ${selected ? 'bg-primary/5' : ''}`}
                    >
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                          selected ? 'bg-primary border-primary' : 'border-muted-foreground'
                        }`}
                      >
                        {selected && <Check size={11} color="white" />}
                      </View>
                      {p.photo || p.imgUrl ? (
                        <Image
                          source={{ uri: p.imgUrl || p.photo }}
                          style={{ width: 32, height: 32, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-8 h-8 rounded-lg items-center justify-center bg-muted">
                          <Text className="text-[10px] font-semibold text-muted-foreground">
                            {p.name.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">{p.name}</Text>
                        <Text className="text-xs text-muted-foreground">{p.clay}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
          </FormSectionCard>

          <FormSectionCard title="Kiln" subtitle="Where this firing will run.">
            {kilns.length === 0 ? (
              <Text className="text-sm text-muted-foreground">
                No kilns added yet. Add a kiln first.
              </Text>
            ) : (
              <FormField label="Kiln" nested first last>
                <Select
                  value={kilnOptions.find((o) => o.value === form.kilnId)}
                  onValueChange={(opt) => opt && setForm((f) => ({ ...f, kilnId: opt.value }))}
                  options={kilnOptions}
                />
                {selectedKiln ? (
                  <Text className="text-xs text-muted-foreground mt-2">
                    {selectedKiln.location ? `📍 ${selectedKiln.location}` : ''}
                    {selectedKiln.coneRange ? `  ·  ${selectedKiln.coneRange}` : ''}
                  </Text>
                ) : null}
              </FormField>
            )}
          </FormSectionCard>

          {form.type === 'glaze' ? (
            <NotesInput
              label="Glaze notes"
              hint="Layers and combinations for this load."
              placeholder="e.g. Satin White + Tenmoku rim"
              value={form.glazeNotes}
              onChangeText={set('glazeNotes')}
              minHeight={88}
            />
          ) : null}

          <NotesInput
            label="Notes"
            hint="Temperature schedule or special instructions."
            placeholder="Temperature schedule, special instructions..."
            value={form.notes}
            onChangeText={set('notes')}
            minHeight={88}
            containerStyle={{ marginBottom: 8 }}
          />
        </>
      ) : (
        <>
          {/* Invoice card */}
          <View className="rounded-2xl border border-border bg-card/60 overflow-hidden mb-4">
            {/* Header */}
            <View className="px-4 pt-4 pb-3 border-b border-border">
              <View className="flex-row justify-between items-start">
                <Text className="text-lg font-bold text-foreground flex-1 mr-2" numberOfLines={2}>
                  {form.name || 'Untitled Firing'}
                </Text>
                <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                  Invoice
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {new Date(form.submissionDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {/* Firing details */}
            <View className="px-4 py-3 gap-1.5 border-b border-border">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Type</Text>
                <Text className="text-sm text-foreground font-medium capitalize">
                  {form.type} · Cone {form.cone}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Location</Text>
                <Text className="text-sm text-foreground font-medium capitalize">
                  {form.location}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Kiln</Text>
                <Text className="text-sm text-foreground font-medium">
                  {selectedKiln?.name ?? '-'}
                  {selectedKiln?.location ? ` · ${selectedKiln.location}` : ''}
                </Text>
              </View>
              {selectedKiln?.coneRange ? (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Kiln range</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {selectedKiln.coneRange}
                  </Text>
                </View>
              ) : null}
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Expected ready</Text>
                <Text className="text-sm text-foreground font-medium">
                  {formatReadyDate(expectedReadyAt ?? undefined)}
                </Text>
              </View>
              {form.glazeNotes.trim() ? (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Glaze notes</Text>
                  <Text className="text-sm text-foreground font-medium flex-1 text-right ml-4">
                    {form.glazeNotes.trim()}
                  </Text>
                </View>
              ) : null}
              {form.notes.trim() ? (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Notes</Text>
                  <Text className="text-sm text-foreground font-medium flex-1 text-right ml-4">
                    {form.notes.trim()}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Line items header */}
            <View className="flex-row justify-between px-4 py-2 bg-muted/40 border-b border-border">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Piece
              </Text>
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Est. Cost
              </Text>
            </View>

            {/* Line items */}
            {selectedPieces.length === 0 ? (
              <View className="px-4 py-3">
                <Text className="text-sm text-muted-foreground">No pieces selected.</Text>
              </View>
            ) : (
              selectedPieces.map((piece, idx) => (
                <View
                  key={piece.id}
                  className={`flex-row items-center gap-3 px-4 py-3 ${
                    idx < selectedPieces.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  {piece.photo || piece.imgUrl ? (
                    <Image
                      source={{ uri: piece.imgUrl || piece.photo }}
                      style={{ width: 32, height: 32, borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-8 h-8 rounded-lg items-center justify-center bg-muted">
                      <Text className="text-xs font-semibold text-muted-foreground">
                        {piece.name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">{piece.name}</Text>
                    <Text className="text-xs text-muted-foreground">{piece.clay}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {costEstimate.costPerPiece === null
                      ? '-'
                      : `${currencySymbol}${costEstimate.costPerPiece.toFixed(2)}`}
                  </Text>
                </View>
              ))
            )}

            {/* Totals */}
            <View className="px-4 py-3 border-t border-border gap-1.5 bg-muted/20">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  Subtotal ({selectedPieces.length}{' '}
                  {selectedPieces.length === 1 ? 'piece' : 'pieces'})
                </Text>
                <Text className="text-sm text-foreground font-medium">
                  {costEstimate.totalCost === null
                    ? '-'
                    : `${currencySymbol}${costEstimate.totalCost.toFixed(2)}`}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-base font-bold text-foreground">Total</Text>
                <Text className="text-base font-bold text-foreground">
                  {costEstimate.totalCost === null
                    ? '-'
                    : `${currencySymbol}${costEstimate.totalCost.toFixed(2)}`}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </>
  );
}
