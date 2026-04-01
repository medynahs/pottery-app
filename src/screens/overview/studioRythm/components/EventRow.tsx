import { Text } from '@/src/components/ui/text';
import { Repeat2, Trash2 } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { StudioEvent } from '../studioRhythm';
import { EVENT_CATEGORIES } from '../studioRhythm';

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

  return (
    <TouchableOpacity
      onPress={onEdit}
      activeOpacity={0.75}
      className={`flex-row items-center gap-3 py-3 ${!isLast ? 'border-b border-border' : ''}`}
    >
      <View
        className="w-8 h-8 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${cat.color}18` }}
      >
        <Text className="text-sm">{cat.emoji}</Text>
      </View>

      <View className="flex-1">
        <Text className={`text-sm font-medium ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
          {event.name}
        </Text>
        <View className="flex-row items-center gap-2 mt-0.5">
          <Text className="text-xs text-muted-foreground">{dateLabel}</Text>
          {event.isRecurring && (
            <View className="flex-row items-center gap-0.5">
              <Repeat2 size={10} color="hsl(24 10% 60%)" />
              <Text className="text-[10px] text-muted-foreground capitalize">{event.recurrence}</Text>
            </View>
          )}
          {event.prepReminderOffset !== undefined && (
            <View className="rounded-full px-1.5 py-0.5" style={{ backgroundColor: `${cat.color}18` }}>
              <Text className="text-[10px] font-medium" style={{ color: cat.color }}>
                {event.prepReminderOffset === 0 ? 'morning of' : `${event.prepReminderOffset}d before`}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={onRemove}
        className="w-8 h-8 rounded-lg items-center justify-center bg-muted/60"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Trash2 size={13} color="hsl(0 55% 45%)" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
