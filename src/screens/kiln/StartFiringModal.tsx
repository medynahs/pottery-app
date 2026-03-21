// src/screens/kiln/StartFiringModal.tsx
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Select } from '@/src/components/ui/select';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import { Check, X } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  CONE_OPTIONS,
  CORE_FIRING_TYPE_OPTIONS,
  FIRING_SOURCE_STAGE,
  KILN_TYPE_LABELS,
} from './constants';
import { estimateFiringCost, estimateReadyDateIso, formatReadyDate } from './firingEstimations';
import type { Firing, FiringType } from './types';

interface StartFiringModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (firing: Firing) => void;
  /** Pre-select kiln id */
  defaultKilnId?: string;
}

const EMPTY_FORM = {
  name: '',
  type: 'bisque' as FiringType,
  location: 'studio' as const,
  submissionDate: new Date().toISOString().slice(0, 10),
  kilnId: '',
  cone: '04',
  clayBodiesUsed: '',
  glazeNotes: '',
  notes: '',
};

export function StartFiringModal({ visible, onClose, onStart, defaultKilnId }: StartFiringModalProps) {
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const kilns = useAppStore((s) => s.kilns);
  const pieces = useAppStore((s) => s.pieces);
  const firings = useAppStore((s) => s.firings);
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);

  const [form, setForm] = React.useState(EMPTY_FORM);
  const [selectedPieceIds, setSelectedPieceIds] = React.useState<Set<number>>(new Set());
  const [step, setStep] = React.useState<'setup' | 'confirm'>('setup');


  const kilnOptions = React.useMemo(
    () => kilns.map((k) => ({ value: k.id, label: `${k.name} (${KILN_TYPE_LABELS[k.type]})` })),
    [kilns]
  );

  const assignablePieces = React.useMemo(
    () => pieces.filter((p) => p.stage !== 'cemetery'),
    [pieces]
  );

  React.useEffect(() => {
    if (visible) {
      setForm({
        ...EMPTY_FORM,
        submissionDate: new Date().toISOString().slice(0, 10),
        kilnId: defaultKilnId ?? kilns[0]?.id ?? '',
      });
      setSelectedPieceIds(new Set());
      setStep('setup');
    }
  }, [visible, defaultKilnId, kilns]);

  const set = (key: keyof typeof EMPTY_FORM) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const togglePiece = (id: number) => {
    setSelectedPieceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStart = () => {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    const selectedPieces = assignablePieces.filter((piece) => selectedPieceIds.has(piece.id));
    const selectedKilnForEstimate = kilns.find((kiln) => kiln.id === form.kilnId);
    const expectedReadyAt = estimateReadyDateIso({
      type: form.type,
      location: form.location,
      submissionDate: form.submissionDate,
      kiln: selectedKilnForEstimate,
    });
    const { totalCost, costPerPiece } = estimateFiringCost({
      kiln: selectedKilnForEstimate,
      pieces: selectedPieces,
    });

    const firing: Firing = {
      id: `firing-${Date.now()}`,
      kilnId: form.kilnId,
      name: form.name.trim(),
      type: form.type,
      location: form.location,
      cone: form.cone,
      state: 'scheduled',
      submissionDate: form.submissionDate,
      expectedReadyAt,
      estimatedTotalCost: totalCost ?? undefined,
      estimatedCostPerPiece: costPerPiece ?? undefined,
      pieceIds: Array.from(selectedPieceIds),
      clayBodiesUsed: form.clayBodiesUsed
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      glazeNotes: form.glazeNotes.trim() || undefined,
      notes: form.notes.trim(),
      createdAt: now,
    };
    onStart(firing);
    onClose();
  };

  const hasKilnSelection = kilns.length > 0 && form.kilnId.trim().length > 0;
  const canContinueToReview = form.name.trim().length > 0 && selectedPieceIds.size > 0 && hasKilnSelection;
  const canStart = canContinueToReview;
  const selectedKiln = kilns.find((k) => k.id === form.kilnId);
  const selectedPieces = React.useMemo(
    () => assignablePieces.filter((piece) => selectedPieceIds.has(piece.id)),
    [assignablePieces, selectedPieceIds]
  );

  const readyStage = FIRING_SOURCE_STAGE[form.type] ?? FIRING_SOURCE_STAGE.bisque;
  const assignedPieceIds = React.useMemo(() => {
    const next = new Set<number>();
    firings
      .filter((firing) => firing.state !== 'completed')
      .forEach((firing) => firing.pieceIds.forEach((pieceId) => next.add(pieceId)));
    return next;
  }, [firings]);

  const readyPieceCount = React.useMemo(
    () => pieces.filter((piece) => piece.stage === readyStage && !assignedPieceIds.has(piece.id)).length,
    [pieces, readyStage, assignedPieceIds]
  );

  const readyAssignablePieceIds = React.useMemo(
    () =>
      new Set(
        assignablePieces
          .filter((p) => p.stage === readyStage && !assignedPieceIds.has(p.id))
          .map((p) => p.id)
      ),
    [assignablePieces, readyStage, assignedPieceIds]
  );

  const allReadySelected =
    readyAssignablePieceIds.size > 0 &&
    [...readyAssignablePieceIds].every((id) => selectedPieceIds.has(id));

  const handleSelectAllReady = () => {
    setSelectedPieceIds((prev) => {
      const next = new Set(prev);
      if (allReadySelected) {
        readyAssignablePieceIds.forEach((id) => next.delete(id));
      } else {
        readyAssignablePieceIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const sortedAssignablePieces = React.useMemo(() => {
    return [...assignablePieces].sort((a, b) => {
      const aAssigned = assignedPieceIds.has(a.id);
      const bAssigned = assignedPieceIds.has(b.id);

      if (aAssigned !== bAssigned) {
        return aAssigned ? 1 : -1;
      }

      const aReady = a.stage === readyStage;
      const bReady = b.stage === readyStage;

      if (aReady !== bReady) {
        return aReady ? -1 : 1;
      }

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [assignablePieces, assignedPieceIds, readyStage]);

  const expectedReadyAt = React.useMemo(
    () =>
      estimateReadyDateIso({
        type: form.type,
        location: form.location,
        submissionDate: form.submissionDate,
        kiln: selectedKiln,
      }),
    [form.location, form.submissionDate, form.type, selectedKiln]
  );

  const costEstimate = React.useMemo(
    () => estimateFiringCost({ kiln: selectedKiln, pieces: selectedPieces }),
    [selectedKiln, selectedPieces]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: height * 0.92 }}>
            <View className="w-9 h-1 bg-muted rounded-full self-center mt-4 mb-2" />

            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-border">
              <Text className="text-2xl font-serif font-bold text-foreground">Start Firing</Text>
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <ScrollView
              className="px-6 pt-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {step === 'setup' ? 'Step 1 of 2 · Setup' : 'Step 2 of 2 · Review & Confirm'}
              </Text>

              {step === 'setup' ? (
                <>
                  {/* Firing Name */}
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Firing Name *
                  </Text>
                  <Input
                    placeholder="e.g. Bisque Firing #12"
                    value={form.name}
                    onChangeText={set('name')}
                    className="mb-4"
                  />

                  {/* Type + Cone row */}
                  <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Type
                      </Text>
                      <Select
                        value={CORE_FIRING_TYPE_OPTIONS.find((o) => o.value === form.type)}
                        onValueChange={(opt) =>
                          opt && setForm((f) => ({ ...f, type: opt.value as FiringType }))
                        }
                        options={CORE_FIRING_TYPE_OPTIONS}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Cone
                      </Text>
                      <Select
                        value={CONE_OPTIONS.find((o) => o.value === form.cone)}
                        onValueChange={(opt) => opt && setForm((f) => ({ ...f, cone: opt.value }))}
                        options={CONE_OPTIONS}
                      />
                    </View>
                  </View>

                  {/* Pieces */}
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Assign Pieces ({selectedPieceIds.size})
                    </Text>
                    {readyAssignablePieceIds.size > 0 ? (
                      <TouchableOpacity onPress={handleSelectAllReady}>
                        <Text className="text-[11px] font-semibold" style={{ color: colors.primary }}>
                          {allReadySelected ? 'Clear ready' : `Select all ready (${readyAssignablePieceIds.size})`}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text className="text-[11px] text-muted-foreground">None ready yet</Text>
                    )}
                  </View>

                  <View className="border border-border rounded-2xl overflow-hidden mb-4">
                    {sortedAssignablePieces.length === 0 ? (
                      <View className="p-4">
                        <Text className="text-sm text-muted-foreground">No pieces available.</Text>
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
                          const isAlreadyAssigned = assignedPieceIds.has(p.id);
                          const isDisabled = isAlreadyAssigned && !selected;
                          const isReadyForThisFiring = p.stage === readyStage;

                          return (
                            <TouchableOpacity
                              key={p.id}
                              disabled={isDisabled}
                              onPress={() => !isDisabled && togglePiece(p.id)}
                              className={`flex-row items-center gap-3 px-4 py-3 ${idx < sortedAssignablePieces.length - 1 ? 'border-b border-border' : ''
                                } ${selected ? 'bg-primary/5' : isReadyForThisFiring ? 'bg-emerald-50/40' : ''} ${isDisabled ? 'opacity-45' : ''}`}
                            >
                              <View
                                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selected ? 'bg-primary border-primary' : 'border-muted-foreground'
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
                                <Text className="text-xs text-muted-foreground">
                                  {p.stage} · {p.clay}
                                </Text>
                                {isAlreadyAssigned ? (
                                  <Text className="text-[10px] text-muted-foreground mt-0.5">
                                    Already assigned to another open firing
                                  </Text>
                                ) : null}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>

                  {/* Kiln */}
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Kiln
                  </Text>
                  {kilns.length === 0 ? (
                    <Text className="text-sm text-muted-foreground mb-4">
                      No kilns added yet. Add a kiln first.
                    </Text>
                  ) : (
                    <Select
                      value={kilnOptions.find((o) => o.value === form.kilnId)}
                      onValueChange={(opt) => opt && setForm((f) => ({ ...f, kilnId: opt.value }))}
                      options={kilnOptions}
                      className="mb-4"
                    />
                  )}

                  {selectedKiln && (
                    <Text className="text-xs text-muted-foreground mb-4 -mt-2">
                      {selectedKiln.location ? `📍 ${selectedKiln.location}` : ''}{selectedKiln.coneRange ? `  ·  ${selectedKiln.coneRange}` : ''}
                    </Text>
                  )}

                  {form.type === 'glaze' && (
                    <>
                      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Glaze Notes
                      </Text>
                      <Input
                        value={form.glazeNotes}
                        onChangeText={set('glazeNotes')}
                        placeholder="e.g. Satin White + Tenmoku rim"
                        className="mb-4"
                      />
                    </>
                  )}

                  {/* Notes */}
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Notes
                  </Text>
                  <TextInput
                    multiline
                    numberOfLines={3}
                    placeholder="Temperature schedule, special instructions..."
                    value={form.notes}
                    onChangeText={set('notes')}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      padding: 12,
                      color: colors.foreground,
                      backgroundColor: colors.background,
                      textAlignVertical: 'top',
                      minHeight: 80,
                      fontSize: 14,
                      marginBottom: 24,
                    }}
                    placeholderTextColor={colors.mutedForeground}
                  />
                </>
              ) : (
                <>
                  {/* Invoice card */}
                  <View className="rounded-2xl border border-border bg-card/60 overflow-hidden mb-4">
                    {/* Invoice header */}
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
                        {new Date(form.submissionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>

                    {/* Firing details */}
                    <View className="px-4 py-3 gap-1.5 border-b border-border">
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-muted-foreground">Type</Text>
                        <Text className="text-sm text-foreground font-medium capitalize">{form.type} · Cone {form.cone}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-muted-foreground">Location</Text>
                        <Text className="text-sm text-foreground font-medium capitalize">{form.location}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-muted-foreground">Kiln</Text>
                        <Text className="text-sm text-foreground font-medium">
                          {selectedKiln?.name ?? '—'}{selectedKiln?.location ? ` · ${selectedKiln.location}` : ''}
                        </Text>
                      </View>
                      {selectedKiln?.coneRange ? (
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-muted-foreground">Kiln range</Text>
                          <Text className="text-sm text-foreground font-medium">{selectedKiln.coneRange}</Text>
                        </View>
                      ) : null}
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-muted-foreground">Expected ready</Text>
                        <Text className="text-sm text-foreground font-medium">{formatReadyDate(expectedReadyAt)}</Text>
                      </View>
                      {form.glazeNotes.trim() ? (
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-muted-foreground">Glaze notes</Text>
                          <Text className="text-sm text-foreground font-medium flex-1 text-right ml-4">{form.glazeNotes.trim()}</Text>
                        </View>
                      ) : null}
                      {form.notes.trim() ? (
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-muted-foreground">Notes</Text>
                          <Text className="text-sm text-foreground font-medium flex-1 text-right ml-4">{form.notes.trim()}</Text>
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
                          className={`flex-row items-center gap-3 px-4 py-3 ${idx < selectedPieces.length - 1 ? 'border-b border-border' : ''}`}
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
                              ? '—'
                              : `${currencySymbol}${costEstimate.costPerPiece.toFixed(2)}`}
                          </Text>
                        </View>
                      ))
                    )}

                    {/* Totals */}
                    <View className="px-4 py-3 border-t border-border gap-1.5 bg-muted/20">
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-muted-foreground">Subtotal ({selectedPieces.length} {selectedPieces.length === 1 ? 'piece' : 'pieces'})</Text>
                        <Text className="text-sm text-foreground font-medium">
                          {costEstimate.totalCost === null ? '—' : `${currencySymbol}${costEstimate.totalCost.toFixed(2)}`}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-base font-bold text-foreground">Total</Text>
                        <Text className="text-base font-bold text-foreground">
                          {costEstimate.totalCost === null ? '—' : `${currencySymbol}${costEstimate.totalCost.toFixed(2)}`}
                        </Text>
                      </View>
                    </View>
                  </View>

                </>
              )}
            </ScrollView>

            <View className="px-6 pb-8 pt-3 border-t border-border">
              {step === 'setup' ? (
                <>
                  <Button onPress={() => setStep('confirm')} disabled={!canContinueToReview} className="w-full">
                    <Text className="font-semibold">Review & Confirm</Text>
                  </Button>
                  {!canContinueToReview ? (
                    <Text className="text-xs text-muted-foreground mt-2 text-center">
                      Add a firing name, pick at least one piece, and select a kiln to continue.
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <View className="flex-row gap-3">
                    <Button variant="outline" onPress={() => setStep('setup')} className="flex-1">
                      <Text className="font-semibold">Back to Setup</Text>
                    </Button>
                    <Button onPress={handleStart} disabled={!canStart} className="flex-1">
                      <Text className="font-semibold">Schedule Firing</Text>
                    </Button>
                  </View>

                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
