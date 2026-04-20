// src/screens/community/components/FestivalSignUpSheet.tsx
import { Text } from '@/src/components/ui/text';
import { ArrowLeft, CheckSquare, Square } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import type { Festival, FestivalTrack } from '../types';

type Step = 'track' | 'rules';

type Props = {
  visible: boolean;
  festival: Festival;
  onConfirm: (trackId: string) => void;
  onClose: () => void;
};

export function FestivalSignUpSheet({ visible, festival, onConfirm, onClose }: Props) {
  const [step, setStep] = useState<Step>('track');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  if (!visible) return null;

  const handleClose = () => {
    setStep('track');
    setSelectedTrack(null);
    setRulesAccepted(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedTrack || !rulesAccepted) return;
    const trackId = selectedTrack;
    setStep('track');
    setSelectedTrack(null);
    setRulesAccepted(false);
    onConfirm(trackId);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={handleClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(22,14,10,0.52)' }}>
        <Pressable style={{ position: 'absolute', inset: 0 }} onPress={handleClose} />
        <View
          style={{
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: '#FFFBF2',
            borderTopWidth: 1,
            borderColor: '#E8D9BE',
            paddingBottom: 40,
            maxHeight: '88%',
          }}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#C9B48C' }} />
          </View>

          {/* â”€â”€ STEP 1: Track picker â”€â”€ */}
          {step === 'track' && (
            <>
              {/* Header */}
              <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Text style={{ fontSize: 28 }}>{festival.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: festival.accentColor, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      Step 1 of 2
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1008', fontFamily: 'serif', lineHeight: 24 }}>
                      Choose your track
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#8a7058', lineHeight: 20, marginTop: 4 }}>
                  Your track sets the judging criteria applied to your submission. You can switch before submitting.
                </Text>
              </View>

              {/* Track picker */}
              <View style={{ paddingHorizontal: 24, gap: 10 }}>
                {festival.tracks.map((track: FestivalTrack) => {
                  const isSelected = selectedTrack === track.id;
                  return (
                    <TouchableOpacity
                      key={track.id}
                      activeOpacity={0.75}
                      onPress={() => setSelectedTrack(track.id)}
                      style={{
                        borderRadius: 16,
                        borderWidth: 1.5,
                        borderColor: isSelected ? festival.accentColor : '#E8D9BE',
                        backgroundColor: isSelected ? 'hsl(100 25% 94%)' : '#FAF5E9',
                        padding: 14,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: 2,
                          borderColor: isSelected ? festival.accentColor : '#C9B48C',
                          backgroundColor: isSelected ? festival.accentColor : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? '#1a1008' : '#3a2a1a' }}>
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
                })}
              </View>

              {/* Actions */}
              <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setStep('rules')}
                  disabled={!selectedTrack}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: 'center',
                    backgroundColor: festival.accentColor,
                    opacity: selectedTrack ? 1 : 0.45,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Next: Review Rules </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleClose}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 13,
                    alignItems: 'center',
                    backgroundColor: '#F5EDD8',
                    borderWidth: 1,
                    borderColor: '#E8D9BE',
                  }}
                >
                  <Text style={{ color: 'hsl(24 30% 35%)', fontWeight: '600', fontSize: 15 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* â”€â”€ STEP 2: Rules review â”€â”€ */}
          {step === 'rules' && (
            <>
              {/* Header with back */}
              <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => setStep('track')}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, alignSelf: 'flex-start' }}
                >
                  <ArrowLeft size={14} color={festival.accentColor} />
                  <Text style={{ fontSize: 13, color: festival.accentColor, fontWeight: '600' }}>Back</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 11, fontWeight: '700', color: festival.accentColor, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>
                  Step 2 of 2
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1008', fontFamily: 'serif', lineHeight: 24 }}>
                  Festival rules
                </Text>
                <Text style={{ fontSize: 13, color: '#8a7058', lineHeight: 20, marginTop: 4 }}>
                  Please read through the rules before joining.
                </Text>
              </View>

              {/* Rules list */}
              <ScrollView
                style={{ paddingHorizontal: 24, maxHeight: 240 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
              >
                {festival.rules.map((rule, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                    <View
                      style={{
                        marginTop: 6,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: festival.accentColor,
                        flexShrink: 0,
                      }}
                    />
                    <Text style={{ fontSize: 13, color: '#5a4030', lineHeight: 20, flex: 1 }}>{rule}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Accept checkbox */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setRulesAccepted(a => !a)}
                style={{
                  marginHorizontal: 24,
                  marginTop: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 14,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: rulesAccepted ? festival.accentColor : '#E8D9BE',
                  backgroundColor: rulesAccepted ? 'hsl(100 25% 94%)' : '#FAF5E9',
                }}
              >
                {rulesAccepted
                  ? <CheckSquare size={20} color={festival.accentColor} />
                  : <Square size={20} color="#C9B48C" />
                }
                <Text style={{ fontSize: 13, color: '#3a2a1a', fontWeight: '600', flex: 1 }}>
                  I've read and accept the festival rules
                </Text>
              </TouchableOpacity>

              {/* Actions */}
              <View style={{ paddingHorizontal: 24, paddingTop: 14, gap: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleConfirm}
                  disabled={!rulesAccepted}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: 'center',
                    backgroundColor: festival.accentColor,
                    opacity: rulesAccepted ? 1 : 0.45,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Join Festival</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleClose}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 13,
                    alignItems: 'center',
                    backgroundColor: '#F5EDD8',
                    borderWidth: 1,
                    borderColor: '#E8D9BE',
                  }}
                >
                  <Text style={{ color: 'hsl(24 30% 35%)', fontWeight: '600', fontSize: 15 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
