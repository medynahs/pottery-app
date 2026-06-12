import { ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { checkPremium, PremiumFeature } from '@/src/utils/premiumGate';
import type { LucideIcon } from 'lucide-react-native';
import { ImagePlus, Sparkles, X } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { OptionPills } from '../components/OptionPills';
import { BISQUE_TEMPS, GLAZE_TEMPS, PIECE_DISPOSITION_STATUSES } from '../utils/constants';
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
};

type StageVisual = {
  label: string;
  Icon: LucideIcon;
};

interface StageAdvanceFlowModalProps {
  request: StageAdvanceRequest | null;
  /** Total photos already on the piece (cover + journal). Used for free-tier photo gate. */
  piecePhotoCount?: number;
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
  'glaze-fired': 'Optional: save glaze cone and kiln result notes.',
  finished: 'Celebrate and optionally set disposition now.',
};

function getPrompt(stageId: string) {
  return STAGE_PROMPTS[stageId] ?? 'Add optional notes and a photo, or skip to move fast.';
}

export function StageAdvanceFlowModal({
  request,
  piecePhotoCount = 0,
  stageLookup,
  defaultBisqueTemp,
  defaultGlazeTemp,
  onConfirm,
  onSkip,
  onClose,
}: StageAdvanceFlowModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { openPickSheet } = usePhotoPicker({ aspect: [4, 3] });
  const { requestAccess, PaywallGate } = usePremiumGate();

  const [photo, setPhoto] = React.useState<string | undefined>(undefined);
  const [notes, setNotes] = React.useState('');
  const [bisqueTemp, setBisqueTemp] = React.useState('');
  const [glazeTemp, setGlazeTemp] = React.useState('');
  const [status, setStatus] = React.useState('');

  React.useEffect(() => {
    if (!request) {
      setPhoto(undefined);
      setNotes('');
      setBisqueTemp('');
      setGlazeTemp('');
      setStatus('');
      return;
    }

    setPhoto(undefined);
    setNotes('');
    setBisqueTemp(request.toStage === 'bisque' ? (defaultBisqueTemp ?? '') : '');
    setGlazeTemp(request.toStage === 'glaze-fired' ? (defaultGlazeTemp ?? '') : '');
    setStatus('');
  }, [request, defaultBisqueTemp, defaultGlazeTemp]);

  const pickPhoto = React.useCallback(() => {
    if (!photo && piecePhotoCount >= 1 && !checkPremium(PremiumFeature.UnlimitedPhotos)) {
      requestAccess(PremiumFeature.UnlimitedPhotos);
      return;
    }
    openPickSheet((uri) => setPhoto(uri));
  }, [openPickSheet, piecePhotoCount, photo, requestAccess]);

  const handleConfirm = React.useCallback(() => {
    const capture: StageAdvanceCapture = {
      notes: notes.trim() || undefined,
      photo,
      bisqueTemp: request?.toStage === 'bisque' ? (bisqueTemp || undefined) : undefined,
      glazeTemp: request?.toStage === 'glaze-fired' ? (glazeTemp || undefined) : undefined,
      status: request?.toStage === FINISHED_STAGE_ID ? (status || undefined) : undefined,
    };
    onConfirm(capture);
  }, [notes, photo, bisqueTemp, glazeTemp, status, request, onConfirm]);

  if (!request) return null;

  const toVisual = stageLookup[request.toStage];
  const fromVisual = stageLookup[request.fromStage];
  const toLabel = toVisual?.label ?? request.toStage;
  const fromLabel = fromVisual?.label ?? request.fromStage;
  const StageIcon = toVisual?.Icon ?? Sparkles;
  const isFinished = request.toStage === FINISHED_STAGE_ID;

  return (
    <>
      {PaywallGate}
      <ModalShell visible onClose={onClose} backdropColor="rgba(0,0,0,0.45)">
      <ModalCard>

            <View className="flex-row items-center justify-between px-6 pb-4 border-b border-border">
              <View className="flex-1 pr-3">
                <Text className="text-xl font-serif font-bold text-foreground">Advance Stage</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {fromLabel} → {toLabel}
                </Text>
              </View>
              <Pressable onPress={onClose} className="p-1" accessibilityRole="button" accessibilityLabel="Close stage advance modal">
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <ScrollView className="px-6" contentContainerStyle={{ paddingTop: 18, paddingBottom: 20 }}>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <StageIcon size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {request.count > 1 ? `${request.count} pieces` : request.pieceName}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">{getPrompt(request.toStage)}</Text>
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

              <View className="mt-5">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Photo (Optional)</Text>
                <Pressable onPress={pickPhoto} className="w-full h-32 rounded-2xl bg-muted/60 border border-dashed border-border items-center justify-center gap-2">
                  {photo ? (
                    <Image source={{ uri: photo }} className="w-full h-full rounded-2xl" resizeMode="cover" />
                  ) : (
                    <>
                      <ImagePlus size={24} color={colors.mutedForeground} />
                      <Text className="text-sm text-muted-foreground">Tap to add stage photo</Text>
                    </>
                  )}
                </Pressable>
                {photo ? (
                  <TouchableOpacity onPress={() => setPhoto(undefined)} activeOpacity={0.7} className="self-start mt-2">
                    <Text className="text-xs font-semibold text-primary">Remove photo</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View className="mt-5">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes (Optional)</Text>
                <Input
                  placeholder="Quick note for this stage..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  className="min-h-[82px]"
                  style={{ textAlignVertical: 'top' }}
                />
              </View>

              {request.toStage === 'bisque' && (
                <View className="mt-5">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Bisque Cone</Text>
                  <OptionPills options={BISQUE_TEMPS} value={bisqueTemp} onChange={setBisqueTemp} />
                </View>
              )}

              {request.toStage === 'glaze-fired' && (
                <View className="mt-5">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Glaze Cone</Text>
                  <OptionPills options={GLAZE_TEMPS} value={glazeTemp} onChange={setGlazeTemp} />
                </View>
              )}

              {isFinished && (
                <View className="mt-5">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Disposition</Text>
                  <OptionPills options={PIECE_DISPOSITION_STATUSES} value={status} onChange={setStatus} />
                </View>
              )}
            </ScrollView>

            <View className="px-6 pt-3 pb-10 border-t border-border">
              <Button onPress={handleConfirm} className="w-full">
                <Text className="text-primary-foreground font-semibold">Save & Advance</Text>
              </Button>
              <TouchableOpacity onPress={onSkip} activeOpacity={0.7} className="py-3.5 items-center">
                <Text className="text-sm font-semibold text-muted-foreground">Skip</Text>
              </TouchableOpacity>
            </View>
      </ModalCard>
    </ModalShell>
    </>
  );
}
