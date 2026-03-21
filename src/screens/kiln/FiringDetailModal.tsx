// src/screens/kiln/FiringDetailModal.tsx
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import { Check, ChevronRight, FlameKindling, PackageCheck, Trash2, X } from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { formatMoney } from './components/kilnUtils';
import {
    FIRING_LOCATION_LABELS,
    FIRING_STATE_LABELS,
    FIRING_STATE_ORDER,
    FIRING_TYPE_LABELS,
    KILN_TYPE_LABELS,
    nextFiringState,
} from './constants';
import { formatReadyDate, getExpectedReadyAt } from './firingEstimations';
import type { Firing, FiringResult, FiringState } from './types';

const STATE_COLORS: Record<FiringState, string> = {
  scheduled: 'hsl(220 80% 56%)',
  loading: 'hsl(39 80% 50%)',
  firing: 'hsl(15 80% 52%)',
  cooling: 'hsl(195 70% 45%)',
  unloading: 'hsl(142 60% 40%)',
  completed: 'hsl(142 60% 40%)',
};

interface FiringDetailModalProps {
  firing: Firing | null;
  visible: boolean;
  onClose: () => void;
}

function StateTimeline({ current }: { current: FiringState }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <View className="flex-row items-center gap-0 mb-6">
      {FIRING_STATE_ORDER.map((s, i) => {
        const isPast = FIRING_STATE_ORDER.indexOf(current) >= i;
        const isCurrent = s === current;
        return (
          <React.Fragment key={s}>
            <View className="items-center" style={{ flex: i < FIRING_STATE_ORDER.length - 1 ? 0 : undefined }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: isPast ? STATE_COLORS[s] : colors.muted,
                  borderWidth: isCurrent ? 2 : 0,
                  borderColor: isCurrent ? STATE_COLORS[s] : 'transparent',
                  transform: [{ scale: isCurrent ? 1.4 : 1 }],
                }}
              />
            </View>
            {i < FIRING_STATE_ORDER.length - 1 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor:
                    FIRING_STATE_ORDER.indexOf(current) > i ? STATE_COLORS[FIRING_STATE_ORDER[i]] : colors.muted,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export function FiringDetailModal({ firing, visible, onClose }: FiringDetailModalProps) {
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const kilns = useAppStore((s) => s.kilns);
  const pieces = useAppStore((s) => s.pieces);
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);
  const updateFiringState = useAppStore((s) => s.updateFiringState);
  const assignPiecesToFiring = useAppStore((s) => s.assignPiecesToFiring);
  const completeFiring = useAppStore((s) => s.completeFiring);
  const deleteFiring = useAppStore((s) => s.deleteFiring);
  const updateFiring = useAppStore((s) => s.updateFiring);

  // Live firing data (react to store updates)
  const liveFiring = useAppStore((s) => s.firings.find((f) => f.id === firing?.id));

  const [resultNotes, setResultNotes] = React.useState('');
  const [selectedResult, setSelectedResult] = React.useState<FiringResult>('success');
  const [showCompletionForm, setShowCompletionForm] = React.useState(false);
  const [showPiecePicker, setShowPiecePicker] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setResultNotes('');
      setSelectedResult('success');
      setShowCompletionForm(false);
      setShowPiecePicker(false);
    }
  }, [visible]);

  if (!firing || !liveFiring) return null;

  const kiln = kilns.find((k) => k.id === liveFiring.kilnId);
  const assignedPieces = pieces.filter((p) => liveFiring.pieceIds.includes(p.id));
  const unassignedPieces = pieces.filter(
    (p) => !liveFiring.pieceIds.includes(p.id) && p.stage !== 'cemetery'
  );
  const next = nextFiringState(liveFiring.state);
  const stateColor = STATE_COLORS[liveFiring.state];
  const isCompleted = liveFiring.state === 'completed';
  const expectedReadyAt = getExpectedReadyAt(liveFiring, kiln);
  const formattedExpectedReady = formatReadyDate(expectedReadyAt);

  const handleAdvanceState = () => {
    if (!next) return;
    if (next === 'completed') {
      setShowCompletionForm(true);
      return;
    }
    updateFiringState(liveFiring.id, next);
  };

  const handleComplete = () => {
    completeFiring(liveFiring.id, selectedResult, resultNotes);
    setShowCompletionForm(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Firing',
      `Delete "${liveFiring.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteFiring(liveFiring.id);
            onClose();
          },
        },
      ]
    );
  };

  const toggleAssignPiece = (pieceId: number) => {
    if (liveFiring.pieceIds.includes(pieceId)) {
      updateFiring({ ...liveFiring, pieceIds: liveFiring.pieceIds.filter((id) => id !== pieceId) });
    } else {
      assignPiecesToFiring(liveFiring.id, [pieceId]);
    }
  };

  const RESULT_OPTIONS: { value: FiringResult; label: string; color: string }[] = [
    { value: 'success', label: '✓ Success', color: 'hsl(142 60% 40%)' },
    { value: 'issues', label: '⚡ Issues', color: 'hsl(39 80% 50%)' },
    { value: 'failure', label: '✕ Failure', color: 'hsl(0 70% 50%)' },
  ];

  const handleStatusOverride = (override: 'fired' | 'ready' | 'picked-up') => {
    const now = new Date().toISOString();

    if (override === 'fired') {
      updateFiring({
        ...liveFiring,
        state: 'firing',
        startedAt: liveFiring.startedAt ?? now,
        statusOverride: 'fired',
      });
      return;
    }

    if (override === 'ready') {
      updateFiring({
        ...liveFiring,
        state: 'unloading',
        statusOverride: 'ready',
      });
      return;
    }

    updateFiring({
      ...liveFiring,
      state: 'completed',
      completedAt: now,
      statusOverride: 'picked-up',
      result: liveFiring.result ?? 'success',
      resultNotes: liveFiring.resultNotes ?? 'Marked as picked up',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />
        <View className="bg-background rounded-t-3xl" style={{ maxHeight: height * 0.95 }}>
          <View className="w-9 h-1 bg-muted rounded-full self-center mt-4 mb-2" />

          {/* Header */}
          <View className="flex-row justify-between items-start px-6 pb-4 border-b border-border">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-serif font-bold text-foreground" numberOfLines={1}>
                {liveFiring.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${stateColor}22` }}
                >
                  <Text className="text-xs font-semibold" style={{ color: stateColor }}>
                    {FIRING_STATE_LABELS[liveFiring.state]}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  {FIRING_TYPE_LABELS[liveFiring.type]} · Cone {liveFiring.cone}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2 items-center">
              {!isCompleted && (
                <TouchableOpacity onPress={handleDelete} className="p-2">
                  <Trash2 size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="px-6 pt-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Kiln info */}
            {kiln && (
              <Card className="p-4 mb-4 bg-card/60">
                {kiln.imageUri ? (
                  <Image
                    source={{ uri: kiln.imageUri }}
                    style={{ width: '100%', height: 150, borderRadius: 14, marginBottom: 10 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-20 rounded-xl mb-3 border border-border bg-muted/30 items-center justify-center">
                    <FlameKindling size={16} color={colors.mutedForeground} />
                    <Text className="text-[11px] text-muted-foreground mt-1">No kiln photo</Text>
                  </View>
                )}
                <Text className="text-xs font-semibold text-muted-foreground mb-1">
                  {kiln.name} — {KILN_TYPE_LABELS[kiln.type]}
                  {kiln.location ? `  ·  ${kiln.location}` : ''}
                </Text>
                {kiln.notes ? (
                  <Text className="text-xs text-muted-foreground italic">"{kiln.notes}"</Text>
                ) : null}
              </Card>
            )}

            <Card className="p-4 mb-4 bg-card/60">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Session Snapshot
              </Text>
              <Text className="text-sm text-foreground">
                {FIRING_TYPE_LABELS[liveFiring.type]} · {FIRING_LOCATION_LABELS[liveFiring.location ?? 'studio']}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Submitted: {liveFiring.submissionDate ?? liveFiring.createdAt.slice(0, 10)}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Expected ready: {formattedExpectedReady}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Est. cost:{' '}
                {formatMoney(currencySymbol, liveFiring.estimatedTotalCost)}
                {typeof liveFiring.estimatedCostPerPiece === 'number'
                  ? ` · ${formatMoney(currencySymbol, liveFiring.estimatedCostPerPiece)} / piece`
                  : ''}
              </Text>
            </Card>

            {!isCompleted ? (
              <Card className="p-4 mb-4 border-primary/30">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Status Override
                </Text>
                <View className="flex-row gap-2">
                  <Button variant="outline" className="flex-1" onPress={() => handleStatusOverride('fired')}>
                    <Text className="text-xs">Mark Fired</Text>
                  </Button>
                  <Button variant="outline" className="flex-1" onPress={() => handleStatusOverride('ready')}>
                    <Text className="text-xs">Mark Ready</Text>
                  </Button>
                  <Button variant="outline" className="flex-1" onPress={() => handleStatusOverride('picked-up')}>
                    <Text className="text-xs">Picked Up</Text>
                  </Button>
                </View>
              </Card>
            ) : null}

            {/* State timeline */}
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Progress
            </Text>
            <StateTimeline current={liveFiring.state} />
            <View className="flex-row justify-between mb-6">
              {FIRING_STATE_ORDER.map((s) => {
                const isCurrent = s === liveFiring.state;
                return (
                  <Text
                    key={s}
                    className="text-center"
                    style={{
                      fontSize: 8,
                      color: isCurrent ? stateColor : colors.mutedForeground,
                      fontWeight: isCurrent ? '700' : '400',
                      flex: 1,
                    }}
                  >
                    {FIRING_STATE_LABELS[s].split(' ')[0]}
                  </Text>
                );
              })}
            </View>

            {/* Completion result if done */}
            {isCompleted && liveFiring.result && (
              <Card className="p-4 mb-4 bg-card/60">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Result
                </Text>
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color:
                      liveFiring.result === 'success'
                        ? 'hsl(142 60% 40%)'
                        : liveFiring.result === 'issues'
                        ? 'hsl(39 80% 50%)'
                        : 'hsl(0 70% 50%)',
                  }}
                >
                  {liveFiring.result === 'success'
                    ? '✓ Success'
                    : liveFiring.result === 'issues'
                    ? '⚡ Issues Reported'
                    : '✕ Failure'}
                </Text>
                {liveFiring.resultNotes ? (
                  <Text className="text-sm text-muted-foreground mt-1">{liveFiring.resultNotes}</Text>
                ) : null}
              </Card>
            )}

            {/* Notes */}
            {liveFiring.notes ? (
              <Card className="p-4 mb-4 bg-card/60">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Notes
                </Text>
                <Text className="text-sm text-foreground">{liveFiring.notes}</Text>
              </Card>
            ) : null}

            {/* Pieces */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pieces ({assignedPieces.length})
              </Text>
              {!isCompleted && (
                <TouchableOpacity onPress={() => setShowPiecePicker((v) => !v)}>
                  <Text className="text-xs font-semibold text-primary">
                    {showPiecePicker ? 'Done' : '+ Add / Remove'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {(showPiecePicker ? [...assignedPieces, ...unassignedPieces] : assignedPieces).length === 0 ? (
              <Text className="text-sm text-muted-foreground mb-4">No pieces assigned yet.</Text>
            ) : (
              <Card className="overflow-hidden mb-4">
                {(showPiecePicker ? [...assignedPieces, ...unassignedPieces] : assignedPieces).map(
                  (p, idx, arr) => {
                    const isAssigned = liveFiring.pieceIds.includes(p.id);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={showPiecePicker ? () => toggleAssignPiece(p.id) : undefined}
                        activeOpacity={showPiecePicker ? 0.7 : 1}
                        className={`flex-row items-center gap-3 px-4 py-3 ${
                          idx < arr.length - 1 ? 'border-b border-border' : ''
                        } ${isAssigned && showPiecePicker ? 'bg-primary/5' : ''}`}
                      >
                        {showPiecePicker && (
                          <View
                            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                              isAssigned ? 'bg-primary border-primary' : 'border-muted-foreground'
                            }`}
                          >
                            {isAssigned && <Check size={11} color="white" />}
                          </View>
                        )}
                        <PackageCheck size={14} color={colors.mutedForeground} />
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-foreground">{p.name}</Text>
                          <Text className="text-xs text-muted-foreground">
                            {p.stage} · {p.clay}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }
                )}
              </Card>
            )}

            {/* Completion form */}
            {showCompletionForm && (
              <Card className="p-4 mb-4 border-primary/30">
                <Text className="text-sm font-semibold text-foreground mb-3">
                  Mark as Completed
                </Text>
                <View className="flex-row gap-2 mb-3">
                  {RESULT_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setSelectedResult(opt.value)}
                      className="flex-1 py-2 rounded-xl border items-center"
                      style={{
                        borderColor: selectedResult === opt.value ? opt.color : colors.border,
                        backgroundColor: selectedResult === opt.value ? `${opt.color}18` : 'transparent',
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: selectedResult === opt.value ? opt.color : colors.mutedForeground }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  multiline
                  numberOfLines={3}
                  placeholder="Notes on this firing (optional)..."
                  value={resultNotes}
                  onChangeText={setResultNotes}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    padding: 10,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    textAlignVertical: 'top',
                    minHeight: 72,
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                  placeholderTextColor={colors.mutedForeground}
                />
                <View className="flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onPress={() => setShowCompletionForm(false)}
                  >
                    <Text className="text-sm">Cancel</Text>
                  </Button>
                  <Button className="flex-1" onPress={handleComplete}>
                    <Text className="text-sm font-semibold text-primary-foreground">Complete</Text>
                  </Button>
                </View>
              </Card>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Footer action */}
          {!isCompleted && !showCompletionForm && next && (
            <View className="px-6 pb-8 pt-3 border-t border-border">
              <Button onPress={handleAdvanceState} className="w-full">
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold text-primary-foreground">
                    Advance to {FIRING_STATE_LABELS[next]}
                  </Text>
                  <ChevronRight size={16} color="white" />
                </View>
              </Button>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
