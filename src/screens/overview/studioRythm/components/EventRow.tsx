import { Text } from '@/src/components/ui/text';
import { Repeat2, Trash2 } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { StudioEvent } from '../studioRhythm';
import { EVENT_CATEGORIES } from '../studioRhythm';
import { EVENT_CATEGORY_ICONS } from '../studioRhythmIcons';
import { RhythmIconBadge } from './RhythmIconBadge';

interface EventRowProps {
  event: StudioEvent;
  dateLabel: string;
  isLast: boolean;
  onEdit: () => void;
  onRemove: () => void;
  muted?: boolean;
}

export function EventRow({ event, dateLabel, isLast, onEdit, onRemove, muted = false }: EventRowProps) {
  const cat = EVENT_CATEGORIES.find((c) => c.id === event.categoryId)!;
  const Icon = EVENT_CATEGORY_ICONS[event.categoryId];

  return (
    <View className={`flex-row items-center gap-3 py-3.5 ${!isLast ? 'border-b border-border' : ''}`}>
      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.75}
        className="flex-row items-center gap-3 flex-1"
      >
        <RhythmIconBadge
          Icon={Icon}
          color={cat.color}
          backgroundColor={`${cat.color}14`}
          size="md"
          borderColor={`${cat.color}55`}
        />

        <View className="flex-1">
          <Text className={`text-sm font-semibold ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
            {event.name}
          </Text>
          <View className="flex-row items-center flex-wrap gap-2 mt-1">
            <Text className="text-xs font-medium text-muted-foreground">{dateLabel}</Text>
            <View className="rounded-full px-2 py-0.5 bg-muted/60">
              <Text className="text-[10px] font-semibold text-foreground">{cat.label}</Text>
            </View>
            {event.isRecurring && (
              <View className="flex-row items-center gap-0.5 rounded-full px-2 py-0.5 bg-muted/60">
                <Repeat2 size={10} color="hsl(24 20% 45%)" />
                <Text className="text-[10px] font-semibold text-foreground capitalize">{event.recurrence}</Text>
              </View>
            )}
            {event.prepReminderOffset !== undefined && (
              <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${cat.color}18` }}>
                <Text className="text-[10px] font-semibold" style={{ color: cat.color }}>
                  {event.prepReminderOffset === 0 ? 'Morning of' : `${event.prepReminderOffset}d before`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRemove}
        className="w-9 h-9 rounded-xl items-center justify-center bg-red-50 border border-red-100"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Trash2 size={14} color="hsl(0 55% 45%)" />
      </TouchableOpacity>
    </View>
  );
}
