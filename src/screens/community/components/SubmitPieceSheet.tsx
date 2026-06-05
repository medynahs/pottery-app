// src/screens/community/components/SubmitPieceSheet.tsx
import { ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Props = {
  visible: boolean;
  contextName: string;     // "The Humble Bowl" | "Underwater Forms Festival"
  contextSubtitle: string; // "March Challenge" | "Beginner Track"
  accentColor: string;
  onSubmit: (payload?: { note: string; hasPhoto: boolean }) => void;
  onClose: () => void;
};

export function SubmitPieceSheet({
  visible,
  contextName,
  contextSubtitle,
  accentColor,
  onSubmit,
  onClose,
}: Props) {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!visible) return null;

  const canSubmit = hasPhoto && note.trim().length > 0;

  const handleSubmit = () => setSubmitted(true);

  const handleDone = () => {
    const payload = {
      note: note.trim(),
      hasPhoto,
    };
    setSubmitted(false);
    setHasPhoto(false);
    setNote('');
    onSubmit(payload);
  };

  const handleClose = () => {
    if (submitted) return;
    setHasPhoto(false);
    setNote('');
    onClose();
  };

  return (
    <ModalShell visible onClose={handleClose}>
      <ModalCard variant="pottery" maxHeight="92%">

            {submitted ? (
              /* ── Success state ── */
              <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 52 }}>
                <Text style={{ fontSize: 72, marginBottom: 16 }}>🎉</Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#1a1008', fontFamily: 'serif', textAlign: 'center', lineHeight: 28 }}>
                  Piece submitted!
                </Text>
                <Text style={{ fontSize: 14, color: '#8a7058', marginTop: 10, lineHeight: 22, textAlign: 'center' }}>
                  Your entry for{' '}
                  <Text style={{ fontWeight: '700', color: '#3a2a1a' }}>{contextName}</Text>
                  {' '}is in. The community will vote once submissions close — good luck! 🤞
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleDone}
                  style={{
                    marginTop: 32,
                    borderRadius: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 56,
                    backgroundColor: accentColor,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── Form ── */
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {/* Header */}
                <View style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 16 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: accentColor, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>
                    {contextSubtitle}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1008', fontFamily: 'serif', lineHeight: 26 }}>
                    Submit your piece
                  </Text>
                  <Text style={{ fontSize: 13, color: '#8a7058', lineHeight: 20, marginTop: 4 }}>
                    {contextName} — add a photo and a short note on your process.
                  </Text>
                </View>

                {/* Photo area */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setHasPhoto(h => !h)}
                  style={{
                    marginHorizontal: 24,
                    height: 200,
                    borderRadius: 20,
                    borderWidth: hasPhoto ? 1.5 : 2,
                    borderStyle: hasPhoto ? 'solid' : 'dashed',
                    borderColor: hasPhoto ? accentColor : '#C9B48C',
                    backgroundColor: hasPhoto ? 'hsl(100 25% 94%)' : '#FAF5E9',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {hasPhoto ? (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 80 }}>🏺</Text>
                      <Text style={{ fontSize: 12, color: accentColor, fontWeight: '600', marginTop: 6 }}>
                        Photo added · tap to change
                      </Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#F0E8D8', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={24} color="#C9B48C" />
                      </View>
                      <Text style={{ fontSize: 13, color: '#8a7058', fontWeight: '600' }}>Tap to add a photo</Text>
                      <Text style={{ fontSize: 11, color: '#b8a288', textAlign: 'center', lineHeight: 16 }}>
                        Show your finished piece clearly
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Process note */}
                <View style={{ marginHorizontal: 24, marginTop: 16 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#8a7058', letterSpacing: 0.6, marginBottom: 8 }}>
                    PROCESS NOTE
                  </Text>
                  <TextInput
                    placeholder="What was your intention? What went right or wrong? Share some insight..."
                    placeholderTextColor="#C9B48C"
                    multiline
                    value={note}
                    onChangeText={setNote}
                    maxLength={400}
                    style={{
                      borderWidth: 1.5,
                      borderColor: note.length > 0 ? accentColor : '#E8D9BE',
                      borderRadius: 16,
                      padding: 14,
                      fontSize: 14,
                      color: '#3a2a1a',
                      backgroundColor: '#FAF5E9',
                      minHeight: 110,
                      textAlignVertical: 'top',
                      lineHeight: 22,
                    }}
                  />
                  <Text style={{ fontSize: 11, color: '#C9B48C', textAlign: 'right', marginTop: 4 }}>
                    {note.length}/400
                  </Text>
                </View>

                {/* Actions */}
                <View style={{ paddingHorizontal: 24, paddingTop: 8, gap: 10 }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 14,
                      alignItems: 'center',
                      backgroundColor: accentColor,
                      opacity: canSubmit ? 1 : 0.45,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Submit Piece</Text>
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
              </ScrollView>
            )}
      </ModalCard>
    </ModalShell>
  );
}
