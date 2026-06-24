// src/screens/community/components/SubmitPieceSheet.tsx
import {
  ModalCard,
  ModalSheetActions,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  SheetButton,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { PhotoPickField } from '@/src/components/PhotoPickField';
import React, { useEffect, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

export type SubmitPiecePayload = {
  note: string;
  photoUri: string;
};

type Props = {
  visible: boolean;
  contextName: string;
  contextSubtitle: string;
  accentColor: string;
  submitting?: boolean;
  onSubmit: (payload: SubmitPiecePayload) => void;
  onClose: () => void;
};

export function SubmitPieceSheet({
  visible,
  contextName,
  contextSubtitle,
  accentColor,
  submitting = false,
  onSubmit,
  onClose,
}: Props) {
  const sheetHeight = useModalSheetHeight(0.88);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) {
      setPhotoUri(null);
      setNote('');
    }
  }, [visible]);

  if (!visible) return null;

  const canSubmit = Boolean(photoUri) && note.trim().length > 0 && !submitting;

  const handleSubmit = () => {
    if (!canSubmit || !photoUri) return;
    onSubmit({ note: note.trim(), photoUri });
  };

  const handleClose = () => {
    if (submitting) return;
    setPhotoUri(null);
    setNote('');
    onClose();
  };

  return (
    <ModalShell visible onClose={handleClose}>
      <ModalCard variant="pottery" height={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: accentColor,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            {contextSubtitle}
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#1a1008',
              fontFamily: 'serif',
              lineHeight: 26,
            }}
          >
            Submit your piece
          </Text>
          <Text style={{ fontSize: 13, color: '#8a7058', lineHeight: 20, marginTop: 6 }}>
            {contextName}, add a photo and a short note on your process.
          </Text>
        </ModalSheetHeader>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
        >
          <PhotoPickField
            photo={photoUri}
            onPhotoChange={(uri) => setPhotoUri(uri ?? null)}
            aspect={[4, 3]}
            quality={0.85}
            iconColor={accentColor}
            disabled={submitting}
          />

          <View style={{ marginTop: 16 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: '#8a7058',
                letterSpacing: 0.6,
                marginBottom: 8,
              }}
            >
              PROCESS NOTE
            </Text>
            <TextInput
              placeholder="What was your intention? What went right or wrong? Share some insight..."
              placeholderTextColor="#C9B48C"
              multiline
              value={note}
              onChangeText={setNote}
              maxLength={400}
              editable={!submitting}
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
                opacity: submitting ? 0.7 : 1,
              }}
            />
            <Text style={{ fontSize: 11, color: '#C9B48C', textAlign: 'right', marginTop: 4 }}>
              {note.length}/400
            </Text>
          </View>
        </ScrollView>

        <ModalSheetFooter>
          <ModalSheetActions>
            <SheetButton
              label={submitting ? 'Submitting…' : 'Submit Piece'}
              onPress={handleSubmit}
              variant="confirm"
              disabled={!canSubmit}
            />
            <SheetButton label="Cancel" onPress={handleClose} variant="cancel" disabled={submitting} />
          </ModalSheetActions>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
