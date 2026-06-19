
import { Text } from '@/src/components/ui/text';
import { JournalSpread } from '@/src/types/journal';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';


interface BookTabsProps {
  spreads: JournalSpread[];
  activePage: number;
  onPress: (index: number) => void;
  icons: React.ComponentType<{ size: number; color: string }>[];
}

export function BookTabs({ spreads, activePage, onPress, icons }: BookTabsProps) {
  const scrollRef = React.useRef<ScrollView>(null);
  const tabLayouts = React.useRef<Record<number, { x: number; width: number }>>({});

  React.useEffect(() => {
    const layout = tabLayouts.current[activePage];
    if (layout && scrollRef.current) {
      scrollRef.current.scrollTo({ x: Math.max(0, layout.x - 24), animated: true });
    }
  }, [activePage]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 3, paddingHorizontal: 4, minHeight: 36 }}
    >
      {spreads.map((spread, index) => {
        const active = index === activePage;
        const Icon = icons[index];
        const tabLabel = spread.kind === 'cover' ? 'Cover' : spread.stageLabel;
        return (
          <TouchableOpacity
            key={spread.key}
            onPress={() => onPress(index)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${tabLabel}, page ${index + 1} of ${spreads.length}`}
            accessibilityState={{ selected: active }}
            onLayout={(event) => {
              tabLayouts.current[index] = {
                x: event.nativeEvent.layout.x,
                width: event.nativeEvent.layout.width,
              };
            }}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: active ? 38 : 28,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: spread.accent,
              shadowColor: '#55301E',
              shadowOpacity: active ? 0.18 : 0.06,
              shadowRadius: active ? 7 : 2,
              shadowOffset: { width: 0, height: active ? 4 : 2 },
              marginBottom: 0,
              height: active ? 38 : 28,
            }}
          >
            {Icon && (
              <Icon size={active ? 16 : 13} color="#FFF5E7" />
            )}
            <Text className="text-[9px] font-bold text-white text-center" numberOfLines={1}>
              {spread.tabLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
