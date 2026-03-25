import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Check, FlameKindling, PackageCheck } from 'lucide-react-native';
import React from 'react';
import { Image, TextInput, TouchableOpacity, View } from 'react-native';
import type { Piece } from '../../pieces/types';
import {
    FIRING_LOCATION_LABELS,
    FIRING_STATE_LABELS,
    FIRING_STATE_ORDER,
    FIRING_TYPE_LABELS,
    KILN_TYPE_LABELS,
} from '../constants';
import type { Firing, FiringResult, FiringState, Kiln } from '../types';
import { formatMoney } from './kilnUtils';

const STATE_COLORS: Record<FiringState, string> = {
  scheduled: 'hsl(220 80% 56%)',
  loading: 'hsl(39 80% 50%)',
  firing: 'hsl(15 80% 52%)',
  cooling: 'hsl(195 70% 45%)',
  unloading: 'hsl(142 60% 40%)',
  completed: 'hsl(142 60% 40%)',
};

type Palette = {
  muted: string;
  mutedForeground: string;
  border: string;
  foreground: string;
  background: string;
};

interface FiringDetailContentProps {
  liveFiring: Firing;
  kiln?: Kiln;
  formattedExpectedReady: string;
  currencySymbol: string;
  palette: Palette;
  isCompleted: boolean;
  assignedPiecesCount: number;
  pieceRows: Piece[];
  assignedPieceIdSet: Set<number>;
  showPiecePicker: boolean;
  onTogglePiecePicker: () => void;
  onToggleAssignPiece: (pieceId: number) => void;
  showCompletionForm: boolean;
  selectedResult: FiringResult;
  onSelectResult: (result: FiringResult) => void;
  resultNotes: string;
  onChangeResultNotes: (notes: string) => void;
  onCancelCompletion: () => void;
  onComplete: () => void;
  onStatusOverride: (override: 'fired' | 'ready' | 'picked-up') => void;
}

function StateTimeline({ current, muted }: { current: FiringState; muted: string }) {
  return (
    <View className="flex-row items-center gap-0 mb-6">
      {FIRING_STATE_ORDER.map((state, index) => {
        const isPast = FIRING_STATE_ORDER.indexOf(current) >= index;
        const isCurrent = state === current;

        return (
          <React.Fragment key={state}>
            <View className="items-center" style={{ flex: index < FIRING_STATE_ORDER.length - 1 ? 0 : undefined }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: isPast ? STATE_COLORS[state] : muted,
                  borderWidth: isCurrent ? 2 : 0,
                  borderColor: isCurrent ? STATE_COLORS[state] : 'transparent',
                  transform: [{ scale: isCurrent ? 1.4 : 1 }],
                }}
              />
            </View>
            {index < FIRING_STATE_ORDER.length - 1 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor:
                    FIRING_STATE_ORDER.indexOf(current) > index ? STATE_COLORS[FIRING_STATE_ORDER[index]] : muted,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export function FiringDetailContent({
  liveFiring,
  kiln,
  formattedExpectedReady,
  currencySymbol,
  palette,
  isCompleted,
  assignedPiecesCount,
  pieceRows,
  assignedPieceIdSet,
  showPiecePicker,
  onTogglePiecePicker,
  onToggleAssignPiece,
  showCompletionForm,
  selectedResult,
  onSelectResult,
  resultNotes,
  onChangeResultNotes,
  onCancelCompletion,
  onComplete,
  onStatusOverride,
}: FiringDetailContentProps) {
  const stateColor = STATE_COLORS[liveFiring.state];

  const resultOptions: { value: FiringResult; label: string; color: string }[] = [
    { value: 'success', label: '✓ Success', color: 'hsl(142 60% 40%)' },
    { value: 'issues', label: '⚡ Issues', color: 'hsl(39 80% 50%)' },
    { value: 'failure', label: '✕ Failure', color: 'hsl(0 70% 50%)' },
  ];

  return (
    <>
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
              <FlameKindling size={16} color={palette.mutedForeground} />
              <Text className="text-[11px] text-muted-foreground mt-1">No kiln photo</Text>
            </View>
          )}
          <Text className="text-xs font-semibold text-muted-foreground mb-1">
            {kiln.name} — {KILN_TYPE_LABELS[kiln.type]}
            {kiln.location ? `  ·  ${kiln.location}` : ''}
          </Text>
          {kiln.notes ? <Text className="text-xs text-muted-foreground italic">{`“${kiln.notes}”`}</Text> : null}
        </Card>
      )}

      <Card className="p-4 mb-4 bg-card/60">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Session Snapshot</Text>
        <Text className="text-sm text-foreground">
          {FIRING_TYPE_LABELS[liveFiring.type]} · {FIRING_LOCATION_LABELS[liveFiring.location ?? 'studio']}
        </Text>
        <Text className="text-xs text-muted-foreground mt-1">
          Submitted: {liveFiring.submissionDate ?? liveFiring.createdAt.slice(0, 10)}
        </Text>
        <Text className="text-xs text-muted-foreground mt-1">Expected ready: {formattedExpectedReady}</Text>
        <Text className="text-xs text-muted-foreground mt-1">
          Est. cost: {formatMoney(currencySymbol, liveFiring.estimatedTotalCost)}
          {typeof liveFiring.estimatedCostPerPiece === 'number'
            ? ` · ${formatMoney(currencySymbol, liveFiring.estimatedCostPerPiece)} / piece`
            : ''}
        </Text>
      </Card>

      {!isCompleted ? (
        <Card className="p-4 mb-4 border-primary/30">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status Override</Text>
          <View className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onPress={() => onStatusOverride('fired')}>
              <Text className="text-xs">Mark Fired</Text>
            </Button>
            <Button variant="outline" className="flex-1" onPress={() => onStatusOverride('ready')}>
              <Text className="text-xs">Mark Ready</Text>
            </Button>
            <Button variant="outline" className="flex-1" onPress={() => onStatusOverride('picked-up')}>
              <Text className="text-xs">Picked Up</Text>
            </Button>
          </View>
        </Card>
      ) : null}

      {!isCompleted ? (
        <>
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Progress</Text>
          <StateTimeline current={liveFiring.state} muted={palette.muted} />
          <View className="flex-row justify-between mb-6">
            {FIRING_STATE_ORDER.map((state) => {
              const isCurrent = state === liveFiring.state;

              return (
                <Text
                  key={state}
                  className="text-center"
                  style={{
                    fontSize: 8,
                    color: isCurrent ? stateColor : palette.mutedForeground,
                    fontWeight: isCurrent ? '700' : '400',
                    flex: 1,
                  }}
                >
                  {FIRING_STATE_LABELS[state].split(' ')[0]}
                </Text>
              );
            })}
          </View>
        </>
      ) : null}

      {isCompleted && liveFiring.result ? (
        <Card className="p-4 mb-4 bg-card/60">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Result</Text>
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
          {liveFiring.resultNotes ? <Text className="text-sm text-muted-foreground mt-1">{liveFiring.resultNotes}</Text> : null}
        </Card>
      ) : null}

      {liveFiring.notes ? (
        <Card className="p-4 mb-4 bg-card/60">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</Text>
          <Text className="text-sm text-foreground">{liveFiring.notes}</Text>
        </Card>
      ) : null}

      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pieces ({assignedPiecesCount})
        </Text>
        {!isCompleted ? (
          <TouchableOpacity onPress={onTogglePiecePicker}>
            <Text className="text-xs font-semibold text-primary">{showPiecePicker ? 'Done' : '+ Add / Remove'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {pieceRows.length === 0 ? (
        <Text className="text-sm text-muted-foreground mb-4">No pieces assigned yet.</Text>
      ) : (
        <Card className="overflow-hidden mb-4">
          {pieceRows.map((piece, index, arr) => {
            const isAssigned = assignedPieceIdSet.has(piece.id);

            return (
              <TouchableOpacity
                key={piece.id}
                onPress={showPiecePicker ? () => onToggleAssignPiece(piece.id) : undefined}
                activeOpacity={showPiecePicker ? 0.7 : 1}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  index < arr.length - 1 ? 'border-b border-border' : ''
                } ${isAssigned && showPiecePicker ? 'bg-primary/5' : ''}`}
              >
                {showPiecePicker ? (
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      isAssigned ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`}
                  >
                    {isAssigned ? <Check size={11} color="white" /> : null}
                  </View>
                ) : null}
                <PackageCheck size={14} color={palette.mutedForeground} />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">{piece.name}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {piece.stage} · {piece.clay}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>
      )}

      {showCompletionForm ? (
        <Card className="p-4 mb-4 border-primary/30">
          <Text className="text-sm font-semibold text-foreground mb-3">Mark as Completed</Text>
          <View className="flex-row gap-2 mb-3">
            {resultOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => onSelectResult(option.value)}
                className="flex-1 py-2 rounded-xl border items-center"
                style={{
                  borderColor: selectedResult === option.value ? option.color : palette.border,
                  backgroundColor: selectedResult === option.value ? `${option.color}18` : 'transparent',
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: selectedResult === option.value ? option.color : palette.mutedForeground }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            multiline
            numberOfLines={3}
            placeholder="Notes on this firing (optional)..."
            value={resultNotes}
            onChangeText={onChangeResultNotes}
            style={{
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: 10,
              padding: 10,
              color: palette.foreground,
              backgroundColor: palette.background,
              textAlignVertical: 'top',
              minHeight: 72,
              fontSize: 13,
              marginBottom: 12,
            }}
            placeholderTextColor={palette.mutedForeground}
          />
          <View className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onPress={onCancelCompletion}>
              <Text className="text-sm">Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={onComplete}>
              <Text className="text-sm font-semibold text-primary-foreground">Complete</Text>
            </Button>
          </View>
        </Card>
      ) : null}

      <View style={{ height: 24 }} />
    </>
  );
}
