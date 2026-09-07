import { Text } from '@/src/components/ui/text';
import { AVAILABLE_KILNKIN_COMPANIONS, type KilnkinCompanion } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import {
    buildKilnkinNotificationMessage,
    countKilnkinNotificationVariants,
    type KilnkinVoiceEventKind,
} from '@/src/screens/overview/kilnkin/kilnkinVoice';
import {
    formatNotificationDebugLabel,
    NOTIFICATION_DEBUG_EVENTS,
} from '@/src/services/notificationDebug';
import { previewKilnkinNotification } from '@/src/services/notifications';
import { useAppStore } from '@/src/store';
import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className={`px-3 py-2 rounded-xl border ${
        selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`text-xs font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function NotificationDebugPanel() {
  const showToast = useAppStore((s) => s.showToast);
  const activeCompanion = useAppStore((s) => s.kilnkinCompanion);

  const [companion, setCompanion] = useState<KilnkinCompanion>(activeCompanion);
  const [eventKind, setEventKind] = useState<KilnkinVoiceEventKind>('kiln-finished');
  const [variantIndex, setVariantIndex] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setCompanion(activeCompanion);
  }, [activeCompanion]);

  const event = NOTIFICATION_DEBUG_EVENTS.find((item) => item.kind === eventKind) ?? NOTIFICATION_DEBUG_EVENTS[0];
  const variantCount = countKilnkinNotificationVariants(companion, eventKind);

  const previewLine = useMemo(
    () => buildKilnkinNotificationMessage(companion, eventKind, event.payload, variantIndex),
    [companion, eventKind, event.payload, variantIndex],
  );

  const shuffleVariant = () => {
    setVariantIndex((current) => (current + 1) % variantCount);
  };

  const selectEvent = (kind: KilnkinVoiceEventKind) => {
    setEventKind(kind);
    setVariantIndex(0);
  };

  const selectCompanion = (next: KilnkinCompanion) => {
    setCompanion(next);
    setVariantIndex(0);
  };

  const sendPreview = async () => {
    setSending(true);
    try {
      const scheduled = await previewKilnkinNotification(companion, eventKind, event.payload, variantIndex);
      if (!scheduled) {
        showToast('Allow notifications in Settings to send a preview', 'error');
        return;
      }
      showToast(`${formatNotificationDebugLabel(companion, eventKind)} queued`, 'success');
    } catch {
      showToast('Could not schedule preview notification', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!__DEV__) return null;

  return (
    <View className="mx-6 mb-4 rounded-2xl border border-dashed border-primary/40 bg-card px-4 py-4">
      <Text className="text-sm font-semibold text-foreground">Notification Debug</Text>
      <Text className="text-xs text-muted-foreground mt-1 mb-3 leading-4">
        Pick a Kilnkin and event, shuffle lines, then send a 2-second preview notification.
      </Text>

      <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        Kilnkin
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {AVAILABLE_KILNKIN_COMPANIONS.map((item) => (
          <Chip
            key={item.id}
            label={item.name}
            selected={companion.id === item.id}
            onPress={() => selectCompanion(item)}
          />
        ))}
      </View>

      <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        Event
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {NOTIFICATION_DEBUG_EVENTS.map((item) => (
          <Chip
            key={item.kind}
            label={item.label}
            selected={eventKind === item.kind}
            onPress={() => selectEvent(item.kind)}
          />
        ))}
      </View>

      <View className="rounded-xl border border-border bg-background px-3 py-3 mb-3">
        <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          {formatNotificationDebugLabel(companion, eventKind)}
        </Text>
        <Text className="text-sm text-foreground leading-5">&ldquo;{previewLine}&rdquo;</Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Chip
          label={`Shuffle line (${variantIndex + 1}/${variantCount})`}
          selected={false}
          onPress={shuffleVariant}
          disabled={sending || variantCount <= 1}
        />
        <Chip
          label={sending ? 'Sending…' : 'Send notification'}
          selected
          onPress={() => void sendPreview()}
          disabled={sending}
        />
      </View>
    </View>
  );
}
