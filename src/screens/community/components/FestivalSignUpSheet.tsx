// src/screens/community/components/FestivalSignUpSheet.tsx
import {
  ModalCard,
  ModalFormScrollView,
  ModalSheetActions,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  SheetButton,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { ArrowLeft, CheckSquare, Square } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { Festival, FestivalTrack } from '../types';

type Step = 'track' | 'rules';

type Props = {
  visible: boolean;
  festival: Festival;
  /** Null when the challenge has no tracks — join without track_id. */
  onConfirm: (trackId: string | null) => void;
  onClose: () => void;
  submitting?: boolean;
};

function TrackOption({
  track,
  festival,
  selected,
  onSelect,
}: {
  track: FestivalTrack;
  festival: Festival;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onSelect}
      style={{
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: selected ? festival.accentColor : '#E8D9BE',
        backgroundColor: selected ? 'hsl(100 25% 94%)' : '#FAF5E9',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: selected ? festival.accentColor : '#C9B48C',
          backgroundColor: selected ? festival.accentColor : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
          flexShrink: 0,
        }}
      >
        {selected ? (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: selected ? '#1a1008' : '#3a2a1a' }}>
          {track.title}
        </Text>
        <Text style={{ fontSize: 12, color: '#8a7058', marginTop: 2, lineHeight: 18 }}>
          {track.summary}
        </Text>
        <Text style={{ fontSize: 11, color: festival.accentColor, fontWeight: '600', marginTop: 4 }}>
          {track.participants} potters joined
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function FestivalSignUpSheet({ visible, festival, onConfirm, onClose, submitting = false }: Props) {
  const sheetHeight = useModalSheetHeight(0.88);
  const hasTrackStep = festival.tracks.length > 1;
  const totalSteps = hasTrackStep ? 2 : 1;
  const [step, setStep] = useState<Step>(hasTrackStep ? 'track' : 'rules');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(
    festival.tracks.length === 1 ? festival.tracks[0].id : null,
  );
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const resetForm = () => {
    setStep(hasTrackStep ? 'track' : 'rules');
    setSelectedTrack(festival.tracks.length === 1 ? festival.tracks[0].id : null);
    setRulesAccepted(false);
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
      return;
    }
    setStep(hasTrackStep ? 'track' : 'rules');
    setSelectedTrack(festival.tracks.length === 1 ? festival.tracks[0].id : null);
    setRulesAccepted(false);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps -- init once per open

  if (!visible) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = () => {
    if (submitting || !rulesAccepted) return;
    if (hasTrackStep && !selectedTrack) return;
    onConfirm(selectedTrack);
  };

  return (
    <ModalShell visible onClose={handleClose}>
      <ModalCard variant="pottery" height={sheetHeight} withHandle={false}>
        {step === 'track' ? (
          <>
            <ModalSheetHeader>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 28 }}>{festival.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: festival.accentColor,
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                    }}
                  >
                    Step 1 of {totalSteps}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#1a1008',
                      fontFamily: 'serif',
                      lineHeight: 24,
                    }}
                  >
                    Choose your track
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: '#8a7058', lineHeight: 20, marginTop: 8 }}>
                Your track sets the judging criteria applied to your submission. You can switch before submitting.
              </Text>
            </ModalSheetHeader>

            <ModalFormScrollView
              style={{ flex: 1, minHeight: 0 }}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
            >
              {festival.tracks.map((track) => (
                <TrackOption
                  key={track.id}
                  track={track}
                  festival={festival}
                  selected={selectedTrack === track.id}
                  onSelect={() => setSelectedTrack(track.id)}
                />
              ))}
            </ModalFormScrollView>

            <ModalSheetFooter>
              <ModalSheetActions>
                <SheetButton
                  label="Next: Review Rules"
                  onPress={() => setStep('rules')}
                  variant="confirm"
                  disabled={!selectedTrack}
                />
                <SheetButton label="Cancel" onPress={handleClose} variant="cancel" />
              </ModalSheetActions>
            </ModalSheetFooter>
          </>
        ) : (
          <>
            <ModalSheetHeader>
              {hasTrackStep ? (
                <TouchableOpacity
                  onPress={() => setStep('track')}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    alignSelf: 'flex-start',
                  }}
                >
                  <ArrowLeft size={14} color={festival.accentColor} />
                  <Text style={{ fontSize: 13, color: festival.accentColor, fontWeight: '600' }}>Back</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 28 }}>{festival.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: festival.accentColor,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                      }}
                    >
                      Before you join
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: '#1a1008',
                        fontFamily: 'serif',
                        lineHeight: 24,
                      }}
                    >
                      {festival.name}
                    </Text>
                  </View>
                </View>
              )}
            </ModalSheetHeader>

            <ModalFormScrollView
              style={{ flex: 1, minHeight: 0 }}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 4,
                paddingBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: festival.accentColor,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Step {hasTrackStep ? 2 : 1} of {totalSteps}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#1a1008',
                  fontFamily: 'serif',
                  lineHeight: 24,
                }}
              >
                Festival rules
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#8a7058',
                  lineHeight: 20,
                  marginTop: 6,
                  marginBottom: 24,
                }}
              >
                Please read through the rules before joining.
              </Text>

              {festival.rules.map((rule, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'flex-start',
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      marginTop: 7,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: festival.accentColor,
                      flexShrink: 0,
                    }}
                  />
                  <Text style={{ fontSize: 13, color: '#5a4030', lineHeight: 21, flex: 1 }}>{rule}</Text>
                </View>
              ))}

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setRulesAccepted((a) => !a)}
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: rulesAccepted ? festival.accentColor : '#E8D9BE',
                  backgroundColor: rulesAccepted ? 'hsl(100 25% 94%)' : '#FAF5E9',
                }}
              >
                {rulesAccepted ? (
                  <CheckSquare size={20} color={festival.accentColor} />
                ) : (
                  <Square size={20} color="#C9B48C" />
                )}
                <Text style={{ fontSize: 13, color: '#3a2a1a', fontWeight: '600', flex: 1 }}>
                  I&apos;ve read and accept the festival rules
                </Text>
              </TouchableOpacity>
            </ModalFormScrollView>

            <ModalSheetFooter>
              <ModalSheetActions>
                <SheetButton
                  label={submitting ? 'Joining…' : 'Join Festival'}
                  onPress={handleConfirm}
                  variant="confirm"
                  disabled={!rulesAccepted || submitting}
                />
                <SheetButton label="Cancel" onPress={handleClose} variant="cancel" disabled={submitting} />
              </ModalSheetActions>
            </ModalSheetFooter>
          </>
        )}
      </ModalCard>
    </ModalShell>
  );
}
