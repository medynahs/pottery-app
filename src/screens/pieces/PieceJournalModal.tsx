import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import * as ImagePicker from 'expo-image-picker';
import { BookOpen, Camera, X } from 'lucide-react-native';
import React from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { STAGES, STAGE_LABEL, isConditionStatus } from './constants';
import type { Piece } from './types';

type EntryDraft = { notes: string; photo?: string };

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 24) return hours < 1 ? '< 1h' : `${hours}h`;
  const days = Math.floor(ms / 86_400_000);
  if (days < 14) return `${days} day${days !== 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks !== 1 ? 's' : ''}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STAGE_ICON_MAP = Object.fromEntries(STAGES.map(s => [s.id, s.Icon]));

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
        {label}
      </Text>
      <Text className="text-sm text-foreground font-medium">{value}</Text>
    </View>
  );
}

type DetailColors = { card: string; foreground: string; mutedForeground: string };

function PieceDetails({ piece, colors }: { piece: Piece; colors: DetailColors }) {
  const photoUri = piece.photo ?? piece.imgUrl;
  const isCemetery = piece.stage === 'cemetery';
  const rows: { label: string; value: string }[] = ([
    piece.form          ? { label: 'Form', value: piece.form } : null,
    piece.formingMethod ? { label: 'Forming Method', value: piece.formingMethod } : null,
    piece.weight        ? { label: 'Weight', value: piece.weight } : null,
    piece.dimensions    ? { label: 'Dimensions', value: piece.dimensions } : null,
    piece.location      ? { label: 'Location', value: piece.location } : null,
    piece.bisqueTemp    ? { label: 'Bisque Temp', value: piece.bisqueTemp } : null,
    piece.glazeTemp     ? { label: 'Glaze Temp', value: piece.glazeTemp } : null,
    piece.firingType    ? { label: 'Firing Type', value: piece.firingType } : null,
    piece.decorations   ? { label: 'Decorations', value: piece.decorations } : null,
    piece.price         ? { label: 'Price', value: piece.price } : null,
    piece.notes         ? { label: 'Notes', value: piece.notes } : null,
  ].filter(Boolean)) as { label: string; value: string }[];

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 16, marginBottom: 28, overflow: 'hidden' }}>
      {photoUri && (
        <Image source={{ uri: photoUri }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
      )}
      <View style={{ padding: 14 }}>
        {piece.status ? (
          <View style={{
            alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3,
            borderRadius: 99, marginBottom: 12,
            backgroundColor: isConditionStatus(piece.status)
              ? 'hsla(0,55%,45%,0.12)' : 'hsla(100,20%,45%,0.12)',
          }}>
            <Text style={{
              fontSize: 11, fontFamily: 'DMSans_500Medium',
              color: isConditionStatus(piece.status) ? 'hsl(0 55% 45%)' : 'hsl(100 20% 45%)',
            }}>
              {piece.status}
            </Text>
          </View>
        ) : null}
        <DetailRow label="Clay Body" value={piece.clay} />
        {rows.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {rows.map(({ label, value }) => (
              <View key={label} style={{ width: '50%', paddingRight: 8 }}>
                <DetailRow label={label} value={value} />
              </View>
            ))}
          </View>
        )}
        {isCemetery && piece.epitaph ? (
          <View style={{ marginTop: 4 }}>
            <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Epitaph</Text>
            <Text className="font-display italic text-foreground" style={{ fontSize: 14, lineHeight: 20 }}>
              "{piece.epitaph}"
            </Text>
          </View>
        ) : null}
        {isCemetery && piece.causeOfDeath ? (
          <View style={{ marginTop: 10 }}>
            <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Cause of Death</Text>
            <Text className="text-sm text-foreground">{piece.causeOfDeath}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

interface PieceJournalModalProps {
  piece: Piece | null;
  visible: boolean;
  onClose: () => void;
  onUpdateEntry: (
    pieceId: number,
    entryIndex: number,
    patch: { notes?: string; photo?: string }
  ) => void;
}

export function PieceJournalModal({
  piece,
  visible,
  onClose,
  onUpdateEntry,
}: PieceJournalModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [drafts, setDrafts] = React.useState<EntryDraft[]>([]);

  React.useEffect(() => {
    if (visible && piece) {
      setDrafts(piece.timeline.map(e => ({ notes: e.notes ?? '', photo: e.photo })));
    }
  }, [visible, piece?.id]);

  if (!piece) return null;

  const now = Date.now();
  const totalMs = now - new Date(piece.createdAt).getTime();

  const updateNotes = (index: number, notes: string) => {
    setDrafts(prev => {
      const next = [...prev];
      next[index] = { ...next[index], notes };
      return next;
    });
    onUpdateEntry(piece.id, index, { notes });
  };

  const pickPhoto = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setDrafts(prev => {
          const next = [...prev];
          next[index] = { ...next[index], photo: uri };
          return next;
        });
        onUpdateEntry(piece.id, index, { photo: uri });
      }
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 bg-background">
          {/* Header */}
          <View className="flex-row items-center px-6 pb-4 pt-14 border-b border-border">
            <View className="w-9 h-9 rounded-full bg-primary/15 items-center justify-center">
              <BookOpen size={16} color="hsl(15 50% 50%)" />
            </View>
            <View className="flex-1 mx-3">
              <Text className="text-xl font-serif font-bold text-foreground" numberOfLines={1}>
                {piece.name}
              </Text>
              <Text className="text-xs text-muted-foreground font-medium mt-0.5">
                {piece.clay} · {formatDuration(totalMs)} in the making
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1" accessibilityLabel="Close journal">
              <X size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }}
              keyboardShouldPersistTaps="handled"
            >
              <PieceDetails piece={piece} colors={colors} />

              {piece.timeline.map((entry, index) => {
                const Icon = STAGE_ICON_MAP[entry.stage] ?? BookOpen;
                const isLast = index === piece.timeline.length - 1;
                const nextTs = piece.timeline[index + 1]?.timestamp;
                const durationMs = nextTs
                  ? new Date(nextTs).getTime() - new Date(entry.timestamp).getTime()
                  : now - new Date(entry.timestamp).getTime();
                const draft = drafts[index] ?? { notes: '' };

                return (
                  <View key={index} className="flex-row">
                    {/* Timeline rail */}
                    <View className="items-center mr-4" style={{ width: 32 }}>
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center ${
                          isLast ? 'bg-primary/20' : 'bg-muted/70'
                        }`}
                      >
                        <Icon
                          size={14}
                          color={isLast ? 'hsl(15 50% 50%)' : colors.mutedForeground}
                        />
                      </View>
                      {!isLast && (
                        <View
                          className="w-px bg-border flex-1 mt-1"
                          style={{ minHeight: 40 }}
                        />
                      )}
                    </View>

                    {/* Entry body */}
                    <View className={`flex-1 ${!isLast ? 'pb-8' : 'pb-2'}`}>
                      {/* Stage + duration */}
                      <View className="flex-row items-center justify-between mb-0.5">
                        <Text className="text-sm font-body-medium text-foreground">
                          {STAGE_LABEL[entry.stage] ?? entry.stage}
                        </Text>
                        <View
                          className={`px-2 py-0.5 rounded-full ${
                            isLast ? 'bg-primary/10' : 'bg-muted/50'
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              isLast ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            {isLast
                              ? `${formatDuration(durationMs)} ongoing`
                              : formatDuration(durationMs)}
                          </Text>
                        </View>
                      </View>

                      {/* Date */}
                      <Text className="text-[11px] text-muted-foreground mb-3">
                        {formatDate(entry.timestamp)}
                      </Text>

                      {/* Photo */}
                      {draft.photo ? (
                        <TouchableOpacity
                          onPress={() => pickPhoto(index)}
                          activeOpacity={0.85}
                          className="mb-3 rounded-xl overflow-hidden"
                          style={{ height: 160 }}
                        >
                          <Image
                            source={{ uri: draft.photo }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                          <View className="absolute bottom-2 right-2 bg-foreground/70 rounded-full p-1.5">
                            <Camera size={11} color="white" />
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => pickPhoto(index)}
                          activeOpacity={0.7}
                          className="mb-3 flex-row items-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-border"
                        >
                          <Camera size={13} color={colors.mutedForeground} />
                          <Text className="text-xs text-muted-foreground">Add photo</Text>
                        </TouchableOpacity>
                      )}

                      {/* Notes */}
                      <TextInput
                        multiline
                        placeholder="Write a note for this stage…"
                        placeholderTextColor={colors.mutedForeground}
                        value={draft.notes}
                        onChangeText={v => updateNotes(index, v)}
                        style={{
                          fontFamily: 'DMSans_400Regular',
                          fontSize: 12,
                          lineHeight: 18,
                          color: colors.foreground,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: colors.card,
                          minHeight: 44,
                          textAlignVertical: 'top',
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
