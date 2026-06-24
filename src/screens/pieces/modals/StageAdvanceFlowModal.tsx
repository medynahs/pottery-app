import { ModalCard, ModalFormScrollView, ModalSheetFooter, ModalSheetHeader, ModalShell } from '@/src/components/AppSheets';
import { FormField } from '@/src/components/form/FormField';
import { FormSectionCard } from '@/src/components/form/FormSectionCard';
import { NotesInput } from '@/src/components/NotesInput';
import { PhotoPickField } from '@/src/components/PhotoPickField';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { canUploadBytesToCloud, getCloudStorageSnapshot } from '@/src/utils/cloudStorage';
import { PremiumFeature } from '@/src/utils/premiumGate';
import type { LucideIcon } from 'lucide-react-native';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { OptionPills } from '../components/OptionPills';
import { BISQUE_TEMPS, GLAZE_OUTCOME_LABELS, GLAZE_OUTCOME_OPTIONS, GLAZE_TEMPS, PIECE_DISPOSITION_STATUSES } from '../utils/constants';
import { FINISHED_STAGE_ID } from '../utils/stageFlow';

export type StageAdvanceRequest = {
  pieceIds: number[];
  fromStage: string;
  toStage: string;
  pieceName: string;
  count: number;
  isBatch: boolean;
};

export type StageAdvanceCapture = {
  notes?: string;
  photo?: string;
  bisqueTemp?: string;
  glazeTemp?: string;
  status?: string;
  glazeOutcome?: string;
  soldPrice?: number;
};

type StageVisual = {
  label: string;
  Icon: LucideIcon;
};

interface StageAdvanceFlowModalProps {
  request: StageAdvanceRequest | null;
  /** Total photos already on the piece (cover + journal). Used for free-tier photo gate. */
  piecePhotoCount?: number;
  /** Linked studio glaze names when advancing past glaze firing. */
  linkedGlazeNames?: string[];
  stageLookup: Record<string, StageVisual>;
  defaultBisqueTemp?: string | null;
  defaultGlazeTemp?: string | null;
  onConfirm: (capture: StageAdvanceCapture) => void;
  onSkip: () => void;
  onClose: () => void;
}

const STAGE_PROMPTS: Record<string, string> = {
  forming: 'Capture an early photo or jot down your setup.',
  'leather-hard': 'Great time to note moisture and timing details.',
  trimming: 'Log the foot, walls, or balancing notes.',
  drying: 'Add drying setup details to avoid cracks.',
  'bone-dry': 'Final prep before heat. Add any reminders.',
  bisque: 'Optional: save firing cone and quick kiln notes.',
  glazing: 'Capture glaze choices or application notes.',
  'glaze-fired': 'Log how the glaze fired, this feeds your glaze atlas stats.',
  finished: 'Celebrate and optionally set disposition now.',
};

function getPrompt(stageId: string) {
  return STAGE_PROMPTS[stageId] ?? 'Add optional notes and a photo, or skip to move fast.';
}

export function StageAdvanceFlowModal({
  request,
  piecePhotoCount = 0,
  linkedGlazeNames = [],
  stageLookup,
  defaultBisqueTemp,
  defaultGlazeTemp,
  onConfirm,
  onSkip,
  onClose,
}: StageAdvanceFlowModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { requestAccess, PaywallGate } = usePremiumGate();

  const [photo, setPhoto] = React.useState<string | undefined>(undefined);
  const [notes, setNotes] = React.useState('');
  const [bisqueTemp, setBisqueTemp] = React.useState('');
  const [glazeTemp, setGlazeTemp] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [soldPriceDraft, setSoldPriceDraft] = React.useState('');
  const [glazeOutcome, setGlazeOutcome] = React.useState('');

  React.useEffect(() => {
    if (!request) {
      setPhoto(undefined);
      setNotes('');
      setBisqueTemp('');
      setGlazeTemp('');
      setStatus('');
      setSoldPriceDraft('');
      setGlazeOutcome('');
      return;
    }

    setPhoto(undefined);
    setNotes('');
    setBisqueTemp(request.toStage === 'bisque' ? (defaultBisqueTemp ?? '') : '');
    setGlazeTemp(request.toStage === 'glaze-fired' ? (defaultGlazeTemp ?? '') : '');
    setStatus('');
    setGlazeOutcome('');
  }, [request, defaultBisqueTemp, defaultGlazeTemp]);

  const handleConfirm = React.useCallback(() => {
    const capture: StageAdvanceCapture = {
      notes: notes.trim() || undefined,
      photo,
      bisqueTemp: request?.toStage === 'bisque' ? (bisqueTemp || undefined) : undefined,
      glazeTemp: request?.toStage === 'glaze-fired' ? (glazeTemp || undefined) : undefined,
      status: request?.toStage === FINISHED_STAGE_ID ? (status || undefined) : undefined,
      glazeOutcome:
        request?.toStage === 'glaze-fired' || request?.toStage === FINISHED_STAGE_ID
          ? (glazeOutcome || undefined)
          : undefined,
      soldPrice:
        request?.toStage === FINISHED_STAGE_ID && status.toLowerCase() === 'sold' && soldPriceDraft.trim()
          ? Number(soldPriceDraft)
          : undefined,
    };
    onConfirm(capture);
  }, [notes, photo, bisqueTemp, glazeTemp, status, soldPriceDraft, glazeOutcome, request, onConfirm]);

  if (!request) return null;

  const toVisual = stageLookup[request.toStage];
  const fromVisual = stageLookup[request.fromStage];
  const toLabel = toVisual?.label ?? request.toStage;
  const fromLabel = fromVisual?.label ?? request.fromStage;
  const StageIcon = toVisual?.Icon ?? Sparkles;
  const isFinished = request.toStage === FINISHED_STAGE_ID;
  const showGlazeOutcome = request.toStage === 'glaze-fired' || isFinished;
  const hasLinkedGlaze = linkedGlazeNames.length > 0;
  const linkedGlazeLabel = linkedGlazeNames.join(', ');

  return (
    <>
      {PaywallGate}
      <ModalShell visible onClose={onClose} backdropColor="rgba(0,0,0,0.45)">
      <ModalCard withHandle={false}>
            <ModalSheetHeader>
              <Text className="text-xl font-serif font-bold text-foreground">Advance Stage</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {fromLabel} → {toLabel}
              </Text>
            </ModalSheetHeader>

            <ModalFormScrollView className="px-6" contentContainerStyle={{ paddingBottom: 20 }}>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <StageIcon size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {request.count > 1 ? `${request.count} pieces` : request.pieceName}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {hasLinkedGlaze && showGlazeOutcome
                      ? `How did ${linkedGlazeLabel} perform?`
                      : getPrompt(request.toStage)}
                  </Text>
                </View>
              </View>

              {isFinished && (
                  <View className="mt-4 rounded-2xl overflow-hidden border border-border">
                    <Image
                      source={require('../../../../assets/images/pottery-studio.png')}
                      className="w-full h-28"
                      resizeMode="cover"
                    />
                  </View>
              )}

              <FormSectionCard title="Stage update" subtitle="Photo and firing details for this advance." topGap>
              <FormField label="Photo (optional)" nested first>
                <PhotoPickField
                  photo={photo}
                  onPhotoChange={setPhoto}
                  aspect={[4, 3]}
                  iconColor={colors.mutedForeground}
                  onBeforePick={() => {
                    if (!photo && !canUploadBytesToCloud() && getCloudStorageSnapshot().atLimit) {
                      requestAccess(PremiumFeature.CloudStorage);
                      return false;
                    }
                  }}
                />
              </FormField>

              {request.toStage === 'bisque' && (
                <FormField label="Bisque cone" nested>
                  <OptionPills options={BISQUE_TEMPS} value={bisqueTemp} onChange={setBisqueTemp} />
                </FormField>
              )}

              {request.toStage === 'glaze-fired' && (
                <FormField label="Glaze cone" nested>
                  <OptionPills options={GLAZE_TEMPS} value={glazeTemp} onChange={setGlazeTemp} />
                </FormField>
              )}

              {showGlazeOutcome && (
                <FormField
                  label={`Glaze outcome${hasLinkedGlaze ? '' : ' (optional)'}`}
                  hint={hasLinkedGlaze ? `Linked to ${linkedGlazeLabel}. This rolls up in your glaze batch stats.` : undefined}
                  nested
                >
                  <OptionPills
                    options={GLAZE_OUTCOME_OPTIONS.map((option) => GLAZE_OUTCOME_LABELS[option])}
                    value={glazeOutcome ? GLAZE_OUTCOME_LABELS[glazeOutcome as keyof typeof GLAZE_OUTCOME_LABELS] ?? '' : ''}
                    onChange={(label) => {
                      const match = GLAZE_OUTCOME_OPTIONS.find(
                        (option) => GLAZE_OUTCOME_LABELS[option] === label,
                      );
                      setGlazeOutcome(match ?? '');
                    }}
                  />
                </FormField>
              )}

              {isFinished && (
                <FormField label="Disposition" nested>
                  <OptionPills options={PIECE_DISPOSITION_STATUSES} value={status} onChange={setStatus} />
                  {status.toLowerCase() === 'sold' ? (
                    <View className="mt-3">
                      <FormField label="Sale price" nested>
                        <Input
                          value={soldPriceDraft}
                          onChangeText={setSoldPriceDraft}
                          placeholder="Amount you sold it for"
                          keyboardType="decimal-pad"
                        />
                      </FormField>
                    </View>
                  ) : null}
                </FormField>
              )}
              </FormSectionCard>

              <NotesInput
                label="Notes"
                hint="Optional quick note for this stage."
                placeholder="Quick note for this stage..."
                value={notes}
                onChangeText={setNotes}
                minHeight={88}
              />
            </ModalFormScrollView>

            <ModalSheetFooter>
              <Button onPress={handleConfirm} className="w-full">
                <Text className="text-primary-foreground font-semibold">Save & Advance</Text>
              </Button>
              <TouchableOpacity onPress={onSkip} activeOpacity={0.7} className="py-3.5 items-center">
                <Text className="text-sm font-semibold text-muted-foreground">Skip</Text>
              </TouchableOpacity>
            </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
    </>
  );
}
