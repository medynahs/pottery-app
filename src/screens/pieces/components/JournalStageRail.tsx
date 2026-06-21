import { Text } from '@/src/components/ui/text';
import { JournalSpread } from '@/src/types/journal';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { JournalTheme } from '../utils/journalTheme';

interface JournalStageRailProps {
  spreads: JournalSpread[];
  activePage: number;
  onPress: (index: number) => void;
  icons: React.ComponentType<{ size: number; color: string }>[];
  embedded?: boolean;
  placement?: 'top' | 'bottom';
}

export function JournalStageRail({
  spreads,
  activePage,
  onPress,
  icons,
  embedded,
  placement = 'bottom',
}: JournalStageRailProps) {
  const scrollRef = React.useRef<ScrollView>(null);
  const tabLayouts = React.useRef<Record<number, { x: number; width: number }>>({});

  React.useEffect(() => {
    const layout = tabLayouts.current[activePage];
    if (layout && scrollRef.current) {
      scrollRef.current.scrollTo({ x: Math.max(0, layout.x - 48), animated: true });
    }
  }, [activePage]);

  const isTop = embedded && placement === 'top';

  return (
    <View
      style={
        embedded
          ? {
              paddingTop: isTop ? 6 : 0,
              paddingBottom: isTop ? 0 : 2,
              marginBottom: isTop ? -1 : 0,
              zIndex: isTop ? 2 : 0,
            }
          : {
              borderTopWidth: 1,
              borderTopColor: JournalTheme.headerIconBg,
              paddingTop: 6,
              paddingBottom: 2,
            }
      }
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: embedded ? 3 : 8,
          paddingHorizontal: embedded ? 6 : 8,
          minHeight: embedded ? (isTop ? 40 : 44) : 48,
        }}
      >
        {spreads.map((spread, index) => {
          const active = index === activePage;
          const Icon = icons[index];
          const label = spread.kind === 'cover' ? 'Cover' : spread.stageLabel;

          if (embedded) {
            return (
              <TouchableOpacity
                key={spread.key}
                onPress={() => onPress(index)}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel={`${label}, page ${index + 1} of ${spreads.length}`}
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
                  minWidth: active ? 52 : 40,
                  maxWidth: 96,
                  paddingHorizontal: active ? 8 : 6,
                  paddingTop: isTop ? (active ? 6 : 5) : active ? 8 : 6,
                  paddingBottom: isTop ? (active ? 7 : 5) : 4,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  backgroundColor: active
                    ? spread.accent
                    : isTop
                      ? 'rgba(255, 244, 228, 0.1)'
                      : 'rgba(255, 244, 228, 0.14)',
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: active
                    ? spread.accent
                    : isTop
                      ? 'rgba(255, 244, 228, 0.18)'
                      : 'rgba(255, 244, 228, 0.2)',
                  height: isTop ? (active ? 40 : 32) : active ? 42 : 34,
                  ...(active && isTop ? { zIndex: 3 } : null),
                }}
              >
                {Icon ? (
                  <Icon size={active ? 13 : 11} color={active ? '#FFF5E7' : JournalTheme.headerText} />
                ) : null}
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: '700',
                    color: active ? '#FFF5E7' : 'rgba(244, 223, 192, 0.85)',
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={spread.key}
              onPress={() => onPress(index)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={`${label}, page ${index + 1} of ${spreads.length}`}
              accessibilityState={{ selected: active }}
              onLayout={(event) => {
                tabLayouts.current[index] = {
                  x: event.nativeEvent.layout.x,
                  width: event.nativeEvent.layout.width,
                };
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: active ? 14 : 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? spread.accent : 'rgba(255, 244, 228, 0.1)',
                borderWidth: 1,
                borderColor: active ? spread.accent : 'rgba(255, 244, 228, 0.18)',
                minWidth: active ? 88 : 72,
                maxWidth: 140,
              }}
            >
              {Icon ? (
                <Icon size={14} color={active ? '#FFF5E7' : JournalTheme.headerText} />
              ) : null}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: active ? '700' : '600',
                  color: active ? '#FFF5E7' : JournalTheme.headerText,
                  flexShrink: 1,
                }}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
