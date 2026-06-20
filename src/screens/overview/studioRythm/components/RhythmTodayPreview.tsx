import { Text } from '@/src/components/ui/text';
import { CalendarDays, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { STAGE_CONFIG, type StageKey } from '../studioRhythm';
import { STAGE_RHYTHM_ICONS } from '../studioRhythmIcons';
import type { TodayRhythmPreview } from '../rhythmUtils';
import { RHYTHM_BROWN } from '../rhythmTheme';
import { RhythmIconBadge } from './RhythmIconBadge';

interface RhythmTodayPreviewProps {
  preview: TodayRhythmPreview;
  onOpenSchedule: () => void;
}

export function RhythmTodayPreview({ preview, onOpenSchedule }: RhythmTodayPreviewProps) {
  return (
    <View
      className="mx-6 mb-5 rounded-2xl border px-4 py-4"
      style={{
        backgroundColor: RHYTHM_BROWN.surface,
        borderColor: RHYTHM_BROWN.surfaceBorder,
        shadowColor: RHYTHM_BROWN.cardShadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 0.9,
              color: RHYTHM_BROWN.inkSoft,
              textTransform: 'uppercase',
            }}
          >
            Today · {preview.dayName}
          </Text>
          <Text className="text-base font-bold mt-1" style={{ color: RHYTHM_BROWN.ink }}>
            {preview.isRestDay ? 'Rest or open studio day' : 'Your focus today'}
          </Text>
        </View>
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: RHYTHM_BROWN.iconBg }}
        >
          <CalendarDays size={18} color={RHYTHM_BROWN.iconColor} />
        </View>
      </View>

      {preview.isRestDay ? (
        <Text className="text-sm leading-5" style={{ color: RHYTHM_BROWN.inkMuted }}>
          No fixed stage days today. Check events below or enjoy the breathing room.
        </Text>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {preview.stages.map((stage) => {
            const cfg = STAGE_CONFIG[stage.key as StageKey];
            const Icon = STAGE_RHYTHM_ICONS[stage.key as StageKey];
            return (
              <View
                key={stage.key}
                className="flex-row items-center gap-2 rounded-full px-3 py-1.5 border"
                style={{ backgroundColor: cfg.bg, borderColor: `${cfg.text}44` }}
              >
                <Icon size={12} color={cfg.text} />
                <Text className="text-xs font-semibold" style={{ color: cfg.text }}>
                  {stage.label}
                </Text>
              </View>
            );
          })}
          {preview.events.map((event) => (
            <View
              key={event.id}
              className="flex-row items-center rounded-full px-3 py-1.5 border"
              style={{ backgroundColor: RHYTHM_BROWN.iconBg, borderColor: RHYTHM_BROWN.surfaceBorder }}
            >
              <Text className="text-xs font-semibold" style={{ color: RHYTHM_BROWN.ink }}>
                {event.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={onOpenSchedule}
        activeOpacity={0.75}
        className="flex-row items-center justify-between mt-4 pt-3 border-t"
        style={{ borderTopColor: 'hsl(34 30% 90%)' }}
      >
        <Text className="text-xs font-semibold" style={{ color: RHYTHM_BROWN.accent }}>
          View full week
        </Text>
        <ChevronRight size={14} color={RHYTHM_BROWN.accent} />
      </TouchableOpacity>
    </View>
  );
}
