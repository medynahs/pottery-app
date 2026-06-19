import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Check, FlameKindling, Image as ImageIcon } from 'lucide-react-native';
import React from 'react';
import { Image, TextInput, TouchableOpacity, View } from 'react-native';
import type { Firing, FiringResult, Kiln } from '../../../types/kiln';
import type { GlazeOutcome, Piece } from '../../../types/pieces';
import { GLAZE_OUTCOME_LABELS, GLAZE_OUTCOME_OPTIONS } from '../../pieces/utils/constants';
import {
    FIRING_LOCATION_LABELS,
    FIRING_TYPE_LABELS,
    KILN_TYPE_LABELS,
} from '../constants';
import {
    type AutoFiringStatus,
    getAutoFiringStatus,
    getCalculatedTimeline,
} from '../firingEstimations';
import { formatMoney } from '../utils/kilnUtils';

const AUTO_STATUS_LABEL: Record<AutoFiringStatus, string> = {
  waiting: 'In Queue',
  firing: 'Firing',
  cooling: 'Cooling Down',
  ready: 'Ready for Pickup',
  completed: 'Completed',
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
  currencySymbol: string;
  palette: Palette;
  isCompleted: boolean;
  assignedPiecesCount: number;
  pieceRows: Piece[];
  assignedPieceIdSet: Set<number>;
  showPiecePicker: boolean;
  onPreviewPieceImage: (piece: Piece) => void;
  onOpenPieceJournal: (piece: Piece) => void;
  onTogglePiecePicker: () => void;
  onToggleAssignPiece: (pieceId: number) => void;
  showCompletionForm: boolean;
  selectedResult: FiringResult;
  onSelectResult: (result: FiringResult) => void;
  resultNotes: string;
  onChangeResultNotes: (notes: string) => void;
  onCancelCompletion: () => void;
  onComplete: () => void;
  onMarkPickedUp: () => void;
  isGlazeFiring?: boolean;
  linkedGlazePieceCount?: number;
  selectedGlazeOutcome?: string;
  onSelectGlazeOutcome?: (outcome: string) => void;
}

export function FiringDetailContent({
  liveFiring,
  kiln,
  currencySymbol,
  palette,
  isCompleted,
  assignedPiecesCount,
  pieceRows,
  assignedPieceIdSet,
  showPiecePicker,
  onPreviewPieceImage,
  onOpenPieceJournal,
  onTogglePiecePicker,
  onToggleAssignPiece,
  showCompletionForm,
  selectedResult,
  onSelectResult,
  resultNotes,
  onChangeResultNotes,
  onCancelCompletion,
  onComplete,
  onMarkPickedUp,
  isGlazeFiring = false,
  linkedGlazePieceCount = 0,
  selectedGlazeOutcome = '',
  onSelectGlazeOutcome,
}: FiringDetailContentProps) {
  const autoStatus = getAutoFiringStatus(liveFiring, kiln);
  const timeline = getCalculatedTimeline(liveFiring, kiln);
  const timelineStepIndex =
    autoStatus === 'waiting' ? 0 : autoStatus === 'firing' || autoStatus === 'cooling' ? 1 : 2;

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
            {kiln.name} - {KILN_TYPE_LABELS[kiln.type]}
            {kiln.location ? `  ·  ${kiln.location}` : ''}
          </Text>
          {kiln.notes ? <Text className="text-xs text-muted-foreground italic">"{kiln.notes}"</Text> : null}
        </Card>
      )}

      <Card className="p-4 mb-4 bg-card/60">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Session</Text>
        <Text className="text-sm text-foreground">
          {FIRING_TYPE_LABELS[liveFiring.type]} · {FIRING_LOCATION_LABELS[liveFiring.location ?? 'studio']}
        </Text>
        <Text className="text-xs text-muted-foreground mt-1">Cone {liveFiring.cone}</Text>
        {typeof liveFiring.estimatedTotalCost === 'number' ? (
          <Text className="text-xs text-muted-foreground mt-1">
            Est. cost: {formatMoney(currencySymbol, liveFiring.estimatedTotalCost)}
            {typeof liveFiring.estimatedCostPerPiece === 'number'
              ? ` · ${formatMoney(currencySymbol, liveFiring.estimatedCostPerPiece)} / piece`
              : ''}
          </Text>
        ) : null}
      </Card>

      {!isCompleted ? (
        <Card className="p-4 mb-4 bg-card/60">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</Text>
            <View className="px-2.5 py-1 rounded-full border border-border bg-muted/30">
              <Text className="text-[11px] font-semibold text-foreground">
                {AUTO_STATUS_LABEL[autoStatus]}
              </Text>
            </View>
          </View>

          <View className="rounded-xl border border-border bg-background/40 px-3 py-2">
            {[
              { label: 'Submitted', date: timeline.submittedLabel },
              { label: 'Fires', date: timeline.firesOnLabel },
              { label: 'Ready', date: timeline.readyOnLabel },
            ].map((step, index, arr) => {
              const isDone = index <= timelineStepIndex;
              const isCurrent = index === timelineStepIndex;

              return (
                <View key={step.label} className="flex-row items-start">
                  <View className="items-center mr-3" style={{ width: 18 }}>
                    <View
                      className="w-[14px] h-[14px] rounded-full items-center justify-center"
                      style={{
                        backgroundColor: isDone ? palette.foreground : palette.muted,
                      }}
                    >
                      {isDone ? <Check size={9} color={palette.background} strokeWidth={3} /> : null}
                    </View>
                    {index < arr.length - 1 ? (
                      <View
                        className="w-[2px] mt-1"
                        style={{
                          height: 22,
                          backgroundColor: isDone ? palette.border : palette.muted,
                        }}
                      />
                    ) : null}
                  </View>
                  <View className="flex-1" style={{ paddingBottom: index < arr.length - 1 ? 10 : 2 }}>
                    <Text className="text-[12px] font-semibold" style={{ color: isCurrent ? palette.foreground : palette.mutedForeground }}>
                      {step.label}
                    </Text>
                    <Text className="text-[11px] text-muted-foreground mt-0.5">{step.date}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}

      {!isCompleted && autoStatus === 'ready' && !showCompletionForm ? (
        <Card className="p-4 mb-4" style={{ borderColor: 'hsl(142 60% 65%)', borderWidth: 1.5, backgroundColor: 'hsl(142 45% 97%)' }}>
          <Text className="text-sm font-semibold text-foreground mb-1">Pieces are ready</Text>
          <Text className="text-xs text-muted-foreground mb-3">
            The estimated ready date has passed. Mark this firing as complete when you have collected your pieces.
          </Text>
          <Button onPress={onMarkPickedUp} className="w-full">
            <Text className="font-semibold text-primary-foreground">Mark as Picked Up</Text>
          </Button>
        </Card>
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
            const imageUri = piece.photo ?? piece.imgUrl;

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

                {imageUri ? (
                  <TouchableOpacity
                    onPress={(event) => {
                      event.stopPropagation();
                      onPreviewPieceImage(piece);
                    }}
                    className="w-11 h-11 rounded-xl overflow-hidden"
                  >
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </TouchableOpacity>
                ) : (
                  <View className="w-11 h-11 rounded-xl border border-border bg-muted/30 items-center justify-center">
                    <ImageIcon size={14} color={palette.mutedForeground} />
                  </View>
                )}

                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">{piece.name}</Text>
                  <Text className="text-xs text-muted-foreground">{piece.stage} · {piece.clay}</Text>
                </View>

                {!showPiecePicker ? (
                  <TouchableOpacity
                    onPress={() => onOpenPieceJournal(piece)}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-background"
                  >
                    <Text className="text-[11px] font-semibold text-primary">Journal</Text>
                  </TouchableOpacity>
                ) : null}
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
          {isGlazeFiring && linkedGlazePieceCount > 0 ? (
            <View className="mb-3">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Glaze results for linked pieces
              </Text>
              <Text className="text-xs text-muted-foreground mb-2 leading-5">
                {linkedGlazePieceCount} piece{linkedGlazePieceCount === 1 ? '' : 's'} linked to a studio glaze batch.
                Outcome applies to pieces without one logged yet.
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {GLAZE_OUTCOME_OPTIONS.map((option) => {
                  const active = selectedGlazeOutcome === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => onSelectGlazeOutcome?.(active ? '' : option)}
                      className={`px-3 py-1.5 rounded-full border ${
                        active ? 'bg-foreground border-foreground' : 'bg-card border-border'
                      }`}
                      activeOpacity={0.75}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          active ? 'text-background' : 'text-muted-foreground'
                        }`}
                      >
                        {GLAZE_OUTCOME_LABELS[option]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
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
