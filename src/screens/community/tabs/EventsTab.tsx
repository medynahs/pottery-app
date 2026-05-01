// src/screens/community/tabs/EventsTab.tsx
import { Spinner } from '@/src/components/ui/spinner';
import { Text } from '@/src/components/ui/text';
import { apiListEvents, type BackendEvent } from '@/src/services/events';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

function EventCard({ event, highlight }: { event: BackendEvent; highlight: boolean }) {
  const start = new Date(event.start_date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const end = new Date(event.end_date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  if (highlight) {
    return (
      <View
        className="rounded-3xl border border-pink-200 p-5 overflow-hidden"
        style={{ backgroundColor: 'hsl(340 30% 97%)' }}
      >
        <View className="px-2.5 py-0.5 rounded-full bg-pink-100 self-start mb-2">
          <Text className="text-xs font-bold" style={{ color: 'hsl(340 75% 50%)' }}>
            Live Event
          </Text>
        </View>
        <Text className="text-xl font-serif font-bold text-foreground">{event.name}</Text>
        <Text className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {event.description}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-3">
          <Calendar size={12} color="hsl(340 75% 50%)" />
          <Text className="text-xs text-muted-foreground">
            {start} – {end}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <Text className="text-sm font-semibold text-foreground">{event.name}</Text>
      <Text className="text-xs text-muted-foreground mt-1 leading-relaxed">
        {event.description}
      </Text>
      <View className="flex-row items-center gap-1.5 mt-2">
        <Calendar size={11} color="hsl(15 50% 50%)" />
        <Text className="text-xs text-muted-foreground">
          {start} – {end}
        </Text>
      </View>
    </View>
  );
}

export function EventsTab() {
  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: apiListEvents,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <View className="items-center py-10">
        <Spinner />
      </View>
    );
  }

  if (isError || !events?.length) {
    return (
      <View className="items-center py-10">
        <Text className="text-sm text-muted-foreground">No events right now — check back soon.</Text>
      </View>
    );
  }

  return (
    <>
      {events.map((event, index) => (
        <EventCard key={event.id} event={event} highlight={index === 0} />
      ))}
    </>
  );
}

