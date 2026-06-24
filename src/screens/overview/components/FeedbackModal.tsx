import { InfoSheet, ModalCard, ModalFormScrollView, ModalShell, useModalSheetHeight } from '@/src/components/AppSheets';
import { NotesInput } from '@/src/components/NotesInput';
import { FormSectionCard } from '@/src/components/form/FormSectionCard';
import { Text } from '@/src/components/ui/text';
import { Check, MessageSquarePlus, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  TouchableOpacity,
  View
} from 'react-native';

const FEEDBACK_EMAIL = process.env.EXPO_PUBLIC_FEEDBACK_EMAIL ?? 'support@pottery-life.app';

type FeedbackKind = 'bug' | 'feature' | 'general' | 'support';

const KINDS: { key: FeedbackKind; emoji: string; label: string; subject: string }[] = [
  { key: 'bug', emoji: '🐛', label: 'Bug Report', subject: 'Bug Report, Pottery Nook' },
  { key: 'feature', emoji: '✨', label: 'Feature Idea', subject: 'Feature Idea, Pottery Nook' },
  { key: 'general', emoji: '💬', label: 'Just a note', subject: 'Feedback, Pottery Nook' },
  { key: 'support', emoji: '🙋', label: 'Need Help', subject: 'Support Request, Pottery Nook' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function FeedbackModal({ visible, onClose }: Props) {
  const sheetHeight = useModalSheetHeight();
  const [kind, setKind] = useState<FeedbackKind>('general');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [infoSheet, setInfoSheet] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    if (visible) {
      setKind('general');
      setMessage('');
      setSent(false);
    }
  }, [visible]);

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed) return;
    const selected = KINDS.find((k) => k.key === kind)!;
    const body = `Dear Pottery Nook team,\n\n${trimmed}\n\nWith love from the studio 🏺`;
    const mailto = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(selected.subject)}&body=${encodeURIComponent(body)}`;
    try {
      const ok = await Linking.canOpenURL(mailto);
      if (!ok) {
        setInfoSheet({ title: 'No mail app', body: 'Could not open a mail app on this device.' });
        return;
      }
      await Linking.openURL(mailto);
      setSent(true);
    } catch {
      setInfoSheet({ title: 'Oops', body: 'Something went wrong. Try again in a moment.' });
    }
  }

  return (
    <>
      <InfoSheet
        visible={!!infoSheet}
        title={infoSheet?.title ?? ''}
        body={infoSheet?.body ?? ''}
        onDismiss={() => setInfoSheet(null)}
      />
      <ModalShell visible={visible} onClose={onClose}>
        {/* Letter card */}
        <ModalCard variant="pottery" height={sheetHeight} maxHeight={sheetHeight}>

          {/* Envelope flap strip */}
          <View
            className="mx-5 rounded-xl px-4 py-3 mb-1"
            style={{ backgroundColor: '#FDF3DC', borderWidth: 1, borderColor: '#E8D9BE' }}
          >
            <View className="flex-row items-center gap-2">
              <MessageSquarePlus size={15} color="hsl(39 57% 51%)" />
              <Text className="text-sm font-serif font-bold" style={{ color: '#6B4E2A' }}>
                Write to Pottery Nook team
              </Text>
            </View>
            <Text className="text-[11px] mt-1 leading-4" style={{ color: '#A68555' }}>
              Share a bug, a wish, or just say hello. We read every letter 🏺
            </Text>
          </View>

          <ModalFormScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 }}
          >
            <FormSectionCard title="What kind of note is this?" topGap>
              <View className="flex-row flex-wrap gap-2">
                {KINDS.map(({ key, emoji, label }) => {
                  const active = kind === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setKind(key)}
                      activeOpacity={0.75}
                      className="items-center rounded-2xl py-2.5 px-1"
                      style={{
                        width: '48%',
                        backgroundColor: active ? '#FDF3DC' : '#F5ECD8',
                        borderWidth: 1.5,
                        borderColor: active ? '#C9963A' : '#E0CBA8',
                      }}
                    >
                      <Text style={{ fontSize: 18, marginBottom: 2 }}>{emoji}</Text>
                      <Text
                        className="text-[10px] font-semibold text-center"
                        style={{ color: active ? '#6B4E2A' : '#A68555' }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FormSectionCard>

            <FormSectionCard title="Your message">
              <View
                className="rounded-2xl overflow-hidden"
                style={{ borderWidth: 1, borderColor: '#E0CBA8', backgroundColor: '#FFFEF9' }}
              >
                {/* "Dear Pottery Life team," salutation */}
                <View
                  className="px-4 pt-3 pb-2 flex-row items-center gap-1.5"
                  style={{ borderBottomWidth: 1, borderColor: '#EFE0C4' }}
                >
                  <Text className="text-xs font-medium italic" style={{ color: '#A68555' }}>
                    Dear Pottery Nook team,
                  </Text>
                </View>

                <NotesInput
                  variant="plain"
                  value={message}
                  onChangeText={setMessage}
                  placeholder="I wanted to share something with you…"
                  placeholderTextColor="#C9B48C"
                  minHeight={120}
                  className="border-0 bg-transparent rounded-none"
                  style={{
                    paddingHorizontal: 16,
                    fontSize: 13,
                    lineHeight: 22,
                    color: '#4A3010',
                    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                  }}
                />

                {/* Closing line */}
                <View
                  className="px-4 py-2.5 flex-row items-center justify-end gap-1.5"
                  style={{ borderTopWidth: 1, borderColor: '#EFE0C4' }}
                >
                  <Text className="text-[11px] italic" style={{ color: '#A68555' }}>
                    With love from the studio 🏺
                  </Text>
                </View>
              </View>
            </FormSectionCard>

            <View className="mt-5 gap-3">
              {sent ? (
                /* Confirmation state */
                <View
                  className="rounded-2xl py-3.5 items-center justify-center flex-row gap-2"
                  style={{ backgroundColor: '#EEF7EC', borderWidth: 1, borderColor: '#C5E0BE' }}
                >
                  <Check size={15} color="hsl(100 35% 42%)" />
                  <Text className="text-sm font-semibold" style={{ color: 'hsl(100 35% 36%)' }}>
                    Letter sealed. Thank you!
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleSend}
                  activeOpacity={0.8}
                  disabled={!message.trim()}
                  className="rounded-2xl py-3.5 items-center justify-center flex-row gap-2"
                  style={{
                    backgroundColor: message.trim() ? '#C9963A' : '#E0CBA8',
                    opacity: message.trim() ? 1 : 0.7,
                  }}
                >
                  <Sparkles size={15} color="white" />
                  <Text className="text-sm font-semibold text-white">Send Letter</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.75}
                className="rounded-2xl py-3 items-center"
                style={{ backgroundColor: '#F0E5D0' }}
              >
                <Text className="text-sm font-medium" style={{ color: '#A68555' }}>
                  {sent ? 'Close' : 'Not now'}
                </Text>
              </TouchableOpacity>
            </View>
          </ModalFormScrollView>
        </ModalCard>
      </ModalShell>
    </>
  );
}
