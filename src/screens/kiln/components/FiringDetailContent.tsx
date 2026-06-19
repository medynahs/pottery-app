import { Button } from '@/src/components/ui/button';

import { Text } from '@/src/components/ui/text';

import { BrandColors } from '@/src/constants/theme';

import { Check, Clock3, FlameKindling, Receipt, Thermometer } from 'lucide-react-native';

import React from 'react';

import { Image, Pressable, TextInput, TouchableOpacity, View } from 'react-native';

import type { Firing, FiringResult, FiringStatusOverride, Kiln } from '../../../types/kiln';

import type { Piece } from '../../../types/pieces';

import { GLAZE_OUTCOME_LABELS, GLAZE_OUTCOME_OPTIONS } from '../../pieces/utils/constants';

import { Pill } from '../../library/atlas/Pill';

import {

  FIRING_LOCATION_LABELS,

  FIRING_TYPE_LABELS,

  KILN_TYPE_LABELS,

} from '../constants';

import type { FiringCostLineItem } from '../firingEstimations';

import {

  type AutoFiringStatus,

  getAutoFiringStatus,

  getCalculatedTimeline,

} from '../firingEstimations';

import { formatHoldTime, getKilnMaxTempLabel } from '../utils/kilnHelpers';

import { KILN_UI } from '../utils/kilnTheme';

import { formatMoney } from '../utils/kilnUtils';

import { FiringOutcomeBadge } from './FiringOutcomeBadge';
import { FiringPieceRow } from './FiringPieceRow';
import { SessionStatusPanel } from './SessionStatusPanel';



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

  costLineItems: FiringCostLineItem[];

  receiptSurvivedByPieceId: Map<number, boolean | undefined>;

  showPiecePicker: boolean;

  onPreviewFiringPhoto?: () => void;

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

  onSetStatusOverride: (override: FiringStatusOverride) => void;

  onClearStatusOverride: () => void;

  isGlazeFiring?: boolean;

  linkedGlazePieceCount?: number;

  selectedGlazeOutcome?: string;

  onSelectGlazeOutcome?: (outcome: string) => void;

  glazeReadyPieces?: Piece[];

  onAssignAllGlazeReady?: () => void;

  onShareToCommunity?: () => void;

}



const RESULT_OPTIONS: { value: FiringResult; label: string }[] = [

  { value: 'success', label: 'Success' },

  { value: 'issues', label: 'Issue' },

  { value: 'failure', label: 'Failure' },

];



function SectionLabel({ children }: { children: string }) {

  return (

    <Text

      className="text-[11px] font-semibold uppercase tracking-wider mb-2"

      style={{ color: KILN_UI.brownMuted }}

    >

      {children}

    </Text>

  );

}



function MetricChip({

  icon: Icon,

  label,

  value,

}: {

  icon: React.ComponentType<{ size?: number; color?: string }>;

  label: string;

  value: string;

}) {

  return (

    <View

      className="flex-1 rounded-2xl border px-3 py-2.5"

      style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.brownSoft }}

    >

      <View className="flex-row items-center gap-1 mb-1">

        <Icon size={11} color={KILN_UI.brownMuted} />

        <Text className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">

          {label}

        </Text>

      </View>

      <Text className="text-sm font-bold text-foreground">{value}</Text>

    </View>

  );

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

  costLineItems,

  receiptSurvivedByPieceId,

  showPiecePicker,

  onPreviewFiringPhoto,

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

  onSetStatusOverride,

  onClearStatusOverride,

  isGlazeFiring = false,

  linkedGlazePieceCount = 0,

  selectedGlazeOutcome = '',

  onSelectGlazeOutcome,

  glazeReadyPieces = [],

  onAssignAllGlazeReady,

  onShareToCommunity,

}: FiringDetailContentProps) {

  const autoStatus = getAutoFiringStatus(liveFiring, kiln);

  const timeline = getCalculatedTimeline(liveFiring, kiln);

  const timelineStepIndex =

    autoStatus === 'waiting' ? 0 : autoStatus === 'firing' || autoStatus === 'cooling' ? 1 : 2;

  const holdLabel = formatHoldTime(liveFiring.holdTimeMinutes);

  const isLogEntry = liveFiring.logSource === 'manual' || liveFiring.peakTempC != null;

  const costByPieceId = React.useMemo(() => {

    const map = new Map<number, number | null>();

    for (const item of costLineItems) {

      map.set(item.piece.id, item.cost);

    }

    return map;

  }, [costLineItems]);

  const notesRequired = selectedResult === 'issues' || selectedResult === 'failure';

  const isActiveSession = !isCompleted && liveFiring.logSource !== 'manual';

  const hasMetrics =

    liveFiring.peakTempC != null

    || holdLabel != null

    || typeof liveFiring.estimatedTotalCost === 'number';



  return (

    <>

      {liveFiring.photoUri ? (

        <Pressable

          onPress={onPreviewFiringPhoto}

          className="rounded-2xl overflow-hidden mb-4 border"

          style={{ borderColor: KILN_UI.brownSoftBorder }}

        >

          <Image

            source={{ uri: liveFiring.photoUri }}

            style={{ width: '100%', height: 180 }}

            resizeMode="cover"

          />

        </Pressable>

      ) : isLogEntry ? (

        <View

          className="rounded-2xl mb-4 border items-center justify-center py-6"

          style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.brownSoft }}

        >

          <FlameKindling size={24} color={BrandColors.primary} />

          <Text className="text-xs text-muted-foreground mt-2">

            Logged firing

          </Text>

        </View>

      ) : null}



      <View className="flex-row flex-wrap items-center gap-2 mb-4">

        {liveFiring.result ? <FiringOutcomeBadge result={liveFiring.result} /> : null}

        {!isCompleted && !liveFiring.result ? (

          <View

            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"

            style={{ borderColor: KILN_UI.warmBorder, backgroundColor: KILN_UI.warmBg }}

          >

            <Clock3 size={12} color={KILN_UI.brownMuted} />

            <Text className="text-xs font-semibold text-foreground">

              {AUTO_STATUS_LABEL[autoStatus]}

            </Text>

          </View>

        ) : null}

        <Text className="text-xs text-muted-foreground">

          {FIRING_TYPE_LABELS[liveFiring.type]}

          {liveFiring.cone ? ` · Cone ${liveFiring.cone}` : ''}

        </Text>

      </View>



      {hasMetrics ? (

        <View className="flex-row gap-2 mb-4">

          {liveFiring.peakTempC != null ? (

            <MetricChip icon={Thermometer} label="Peak" value={`${liveFiring.peakTempC}°C`} />

          ) : null}

          {holdLabel ? (

            <MetricChip icon={Clock3} label="Hold" value={holdLabel.replace('Hold: ', '')} />

          ) : null}

          {typeof liveFiring.estimatedTotalCost === 'number' ? (

            <MetricChip

              icon={Receipt}

              label="Est. cost"

              value={formatMoney(currencySymbol, liveFiring.estimatedTotalCost)}

            />

          ) : null}

        </View>

      ) : null}



      {kiln ? (

        <View

          className="rounded-2xl border px-4 py-3 mb-4 flex-row items-center gap-3"

          style={{ borderColor: KILN_UI.warmBorder, backgroundColor: KILN_UI.warmBg }}

        >

          {kiln.imageUri ? (

            <Image

              source={{ uri: kiln.imageUri }}

              style={{ width: 44, height: 44, borderRadius: 12 }}

              resizeMode="cover"

            />

          ) : (

            <View

              className="w-11 h-11 rounded-xl items-center justify-center"

              style={{ backgroundColor: KILN_UI.brownSoft }}

            >

              <Thermometer size={18} color={BrandColors.primary} />

            </View>

          )}

          <View className="flex-1">

            <Text className="text-sm font-semibold text-foreground">{kiln.name}</Text>

            <Text className="text-xs text-muted-foreground mt-0.5">

              {KILN_TYPE_LABELS[kiln.type]} · {getKilnMaxTempLabel(kiln)}

            </Text>

          </View>

        </View>

      ) : null}



      {!isCompleted ? (

        <View className="mb-4">

          <SectionLabel>Session timeline</SectionLabel>

          <View

            className="rounded-2xl border px-3 py-3"

            style={{ borderColor: KILN_UI.warmBorder, backgroundColor: KILN_UI.warmBg }}

          >

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

                      style={{ backgroundColor: isDone ? KILN_UI.brown : palette.muted }}

                    >

                      {isDone ? <Check size={9} color={KILN_UI.cream} strokeWidth={3} /> : null}

                    </View>

                    {index < arr.length - 1 ? (

                      <View

                        className="w-[2px] mt-1"

                        style={{

                          height: 22,

                          backgroundColor: isDone ? KILN_UI.brownSoftBorder : palette.muted,

                        }}

                      />

                    ) : null}

                  </View>

                  <View className="flex-1" style={{ paddingBottom: index < arr.length - 1 ? 10 : 2 }}>

                    <Text

                      className="text-[12px] font-semibold"

                      style={{ color: isCurrent ? KILN_UI.brown : palette.mutedForeground }}

                    >

                      {step.label}

                    </Text>

                    <Text className="text-[11px] text-muted-foreground mt-0.5">{step.date}</Text>

                  </View>

                </View>

              );

            })}

          </View>

          <Text className="text-[11px] text-muted-foreground mt-2">

            {FIRING_LOCATION_LABELS[liveFiring.location ?? 'studio']}

            {typeof liveFiring.estimatedCostPerPiece === 'number'

              ? ` · ${formatMoney(currencySymbol, liveFiring.estimatedCostPerPiece)} / piece`

              : ''}

          </Text>

        </View>

      ) : null}



      {isActiveSession ? (
        <SessionStatusPanel
          firing={liveFiring}
          kiln={kiln}
          showCompletionForm={showCompletionForm}
          onSetStatusOverride={onSetStatusOverride}
          onClearStatusOverride={onClearStatusOverride}
          onMarkPickedUp={onMarkPickedUp}
        />
      ) : null}

      {isCompleted && liveFiring.resultNotes ? (

        <View className="mb-4">

          <SectionLabel>Outcome notes</SectionLabel>

          <View

            className="rounded-2xl border px-4 py-3"

            style={{ borderColor: KILN_UI.warmBorder, backgroundColor: KILN_UI.warmBg }}

          >

            <Text className="text-sm text-foreground leading-5">{liveFiring.resultNotes}</Text>

          </View>

        </View>

      ) : null}



      {liveFiring.notes ? (

        <View className="mb-4">

          <SectionLabel>Session notes</SectionLabel>

          <Text className="text-sm text-foreground leading-5">{liveFiring.notes}</Text>

        </View>

      ) : null}



      {isCompleted && onShareToCommunity ? (

        <Button onPress={onShareToCommunity} variant="outline" className="w-full mb-4">

          <Text className="font-semibold text-primary">Share firing to community</Text>

        </Button>

      ) : null}



      <View className="flex-row justify-between items-center mb-2">

        <SectionLabel>{`Pieces (${assignedPiecesCount})`}</SectionLabel>

        <TouchableOpacity onPress={onTogglePiecePicker} hitSlop={8}>

          <Text className="text-xs font-semibold" style={{ color: KILN_UI.brown }}>

            {showPiecePicker ? 'Done' : isCompleted ? 'Edit pieces' : 'Add / remove'}

          </Text>

        </TouchableOpacity>

      </View>



      {isGlazeFiring && showPiecePicker && glazeReadyPieces.length > 0 ? (

        <View

          className="rounded-2xl border p-4 mb-3"

          style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.brownSoft }}

        >

          <Text className="text-sm font-semibold text-foreground mb-1">Glaze-ready pieces</Text>

          <Text className="text-xs text-muted-foreground mb-3 leading-5">

            Tap a name to add it, or assign all at once.

          </Text>

          <View className="flex-row flex-wrap gap-2 mb-3">

            {glazeReadyPieces.map((piece) => (

              <TouchableOpacity

                key={piece.id}

                onPress={() => onToggleAssignPiece(piece.id)}

                activeOpacity={0.75}

                className="px-3 py-1.5 rounded-full border"

                style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.cream }}

              >

                <Text className="text-xs font-semibold" style={{ color: KILN_UI.brown }} numberOfLines={1}>

                  {piece.name}

                </Text>

              </TouchableOpacity>

            ))}

          </View>

          {onAssignAllGlazeReady ? (

            <Button onPress={onAssignAllGlazeReady} variant="outline" className="w-full">

              <Text className="font-semibold text-primary">Assign all glaze-ready</Text>

            </Button>

          ) : null}

        </View>

      ) : null}



      {pieceRows.length === 0 ? (

        <Text className="text-sm text-muted-foreground mb-4 leading-5">

          No pieces linked yet. Tap Edit pieces to assign work from your studio.

        </Text>

      ) : (

        <View className="gap-2 mb-4">

          {pieceRows.map((piece) => {

            const isAssigned = assignedPieceIdSet.has(piece.id);

            return (

              <FiringPieceRow

                key={piece.id}

                piece={piece}

                kiln={kiln}

                selected={isAssigned}

                selectable={showPiecePicker}

                lineCost={isAssigned ? costByPieceId.get(piece.id) ?? null : null}

                currencySymbol={currencySymbol}

                survived={receiptSurvivedByPieceId.get(piece.id)}

                onToggle={() => onToggleAssignPiece(piece.id)}

                onPreviewImage={

                  piece.photo ?? piece.imgUrl

                    ? () => onPreviewPieceImage(piece)

                    : undefined

                }

                onOpenJournal={

                  showPiecePicker ? undefined : () => onOpenPieceJournal(piece)

                }

              />

            );

          })}

        </View>

      )}



      {assignedPiecesCount > 0 && costLineItems.length > 0 ? (

        <View className="mb-4">

          <SectionLabel>Cost breakdown</SectionLabel>

          <View

            className="rounded-2xl border overflow-hidden"

            style={{ borderColor: KILN_UI.warmBorder }}

          >

            <View

              className="flex-row justify-between px-4 py-2.5 border-b"

              style={{ backgroundColor: KILN_UI.brownSoft, borderColor: KILN_UI.warmBorder }}

            >

              <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">

                Piece

              </Text>

              <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">

                Firing fee

              </Text>

            </View>

            {costLineItems.map(({ piece, cost, volumeCm3 }, index) => (

              <View

                key={piece.id}

                className={`flex-row items-center justify-between px-4 py-3 ${

                  index < costLineItems.length - 1 ? 'border-b border-border' : ''

                }`}

              >

                <View className="flex-1 pr-3">

                  <Text className="text-sm font-medium text-foreground">{piece.name}</Text>

                  <Text className="text-xs text-muted-foreground">

                    {piece.clay}

                    {kiln?.pricingModel === 'per-volume' && volumeCm3 ? ` · ${volumeCm3} cm³` : ''}

                  </Text>

                </View>

                <Text className="text-sm font-semibold text-foreground">

                  {cost != null ? formatMoney(currencySymbol, cost) : '—'}

                </Text>

              </View>

            ))}

            {typeof liveFiring.estimatedTotalCost === 'number' ? (

              <View

                className="flex-row justify-between px-4 py-3 border-t"

                style={{ backgroundColor: KILN_UI.brownSoft, borderColor: KILN_UI.warmBorder }}

              >

                <Text className="text-sm font-semibold text-foreground">

                  Total ({assignedPiecesCount} {assignedPiecesCount === 1 ? 'piece' : 'pieces'})

                </Text>

                <Text className="text-sm font-bold" style={{ color: KILN_UI.brown }}>

                  {formatMoney(currencySymbol, liveFiring.estimatedTotalCost)}

                </Text>

              </View>

            ) : null}

          </View>

        </View>

      ) : null}



      {showCompletionForm ? (

        <View

          className="rounded-2xl border p-4 mb-4"

          style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.warmCard }}

        >

          <Text

            className="text-base text-foreground mb-3"

            style={{ fontFamily: 'Fraunces_700Bold' }}

          >

            Complete firing

          </Text>



          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">

            Outcome

          </Text>

          <View className="flex-row flex-wrap gap-2 mb-4">

            {RESULT_OPTIONS.map((option) => (

              <Pill

                key={option.value}

                label={option.label}

                active={selectedResult === option.value}

                onPress={() => onSelectResult(option.value)}

              />

            ))}

          </View>



          {isGlazeFiring && linkedGlazePieceCount > 0 ? (

            <View className="mb-4">

              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">

                Glaze results for linked pieces

              </Text>

              <View className="flex-row flex-wrap gap-2">

                {GLAZE_OUTCOME_OPTIONS.map((option) => {

                  const active = selectedGlazeOutcome === option;

                  return (

                    <Pill

                      key={option}

                      label={GLAZE_OUTCOME_LABELS[option]}

                      active={active}

                      onPress={() => onSelectGlazeOutcome?.(active ? '' : option)}

                    />

                  );

                })}

              </View>

            </View>

          ) : null}



          <TextInput

            multiline

            numberOfLines={3}

            placeholder={

              notesRequired ? 'Describe what went wrong…' : 'Optional notes on this firing…'

            }

            value={resultNotes}

            onChangeText={onChangeResultNotes}

            style={{

              borderWidth: 1,

              borderColor: KILN_UI.warmBorder,

              borderRadius: 14,

              padding: 12,

              color: palette.foreground,

              backgroundColor: KILN_UI.cream,

              textAlignVertical: 'top',

              minHeight: 88,

              fontSize: 14,

              marginBottom: 14,

            }}

            placeholderTextColor={palette.mutedForeground}

          />



          <View className="flex-row gap-2">

            <Button variant="outline" className="flex-1" onPress={onCancelCompletion}>

              <Text className="text-sm">Cancel</Text>

            </Button>

            <Button

              className="flex-1"

              onPress={onComplete}

              disabled={notesRequired && resultNotes.trim().length === 0}

            >

              <Text className="text-sm font-semibold text-primary-foreground">Complete</Text>

            </Button>

          </View>

        </View>

      ) : null}



      <View style={{ height: 24 }} />

    </>

  );

}


