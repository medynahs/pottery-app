import { ModalCard, ModalShell } from '@/src/components/AppSheets';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import {
  AVAILABLE_KILNKIN_COMPANIONS,
  type KilnkinCompanion,
  type KilnkinPersonality,
} from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import { Droplets, Flame, Leaf, Wind, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

const ELEMENT_THEME: Record<
  KilnkinPersonality,
  { ring: string; iconColor: string; label: string; Icon: React.ComponentType<{ size: number; color: string }> }
> = {
  fire: { ring: '#FCDCBE', iconColor: '#C05C14', label: 'Fire', Icon: Flame },
  earth: { ring: '#D4DFC8', iconColor: '#4A7530', label: 'Earth', Icon: Leaf },
  air: { ring: '#C8D8EC', iconColor: '#3060A0', label: 'Air', Icon: Wind },
  water: { ring: '#C0D5E8', iconColor: '#286880', label: 'Water', Icon: Droplets },
};

interface KilnkinCompanionPickerSheetProps {
  visible: boolean;
  currentCompanionId: string;
  onClose: () => void;
  onConfirm: (companion: KilnkinCompanion) => void;
}

export function KilnkinCompanionPickerSheet({
  visible,
  currentCompanionId,
  onClose,
  onConfirm,
}: KilnkinCompanionPickerSheetProps) {
  const scrollRef = useRef<ScrollView>(null);
  const initialIndex = Math.max(
    0,
    AVAILABLE_KILNKIN_COMPANIONS.findIndex((c) => c.id === currentCompanionId),
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scaleAnims = useRef(
    AVAILABLE_KILNKIN_COMPANIONS.map(() => new Animated.Value(1)),
  ).current;

  React.useEffect(() => {
    if (!visible) return;
    const idx = Math.max(
      0,
      AVAILABLE_KILNKIN_COMPANIONS.findIndex((c) => c.id === currentCompanionId),
    );
    setCurrentIndex(idx);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: idx * CARD_WIDTH, animated: false });
    });
  }, [visible, currentCompanionId]);

  const handleScrollEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
    const clamped = Math.max(0, Math.min(index, AVAILABLE_KILNKIN_COMPANIONS.length - 1));
    setCurrentIndex(clamped);
  };

  const handlePet = (index: number) => {
    setCurrentIndex(index);
    scrollRef.current?.scrollTo({ x: index * CARD_WIDTH, animated: true });
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 1.06, duration: 90, useNativeDriver: true }),
      Animated.spring(scaleAnims[index], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const selected = AVAILABLE_KILNKIN_COMPANIONS[currentIndex];

  return (
    <ModalShell visible={visible} onClose={onClose} backdropColor="rgba(0,0,0,0.45)">
      <ModalCard>
        <View className="flex-row items-center justify-between px-6 pb-4 border-b border-border">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-serif font-bold text-foreground">Choose your Kilnkin</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              Swipe to browse · tap a card to select
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-9 h-9 rounded-full bg-muted/60 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Close companion picker"
          >
            <X size={18} color="hsl(24 30% 40%)" />
          </TouchableOpacity>
        </View>

        <View className="px-6 pt-5 pb-2">
          <Text className="text-lg font-semibold text-foreground text-center">{selected.name}</Text>
          <Text className="text-xs text-muted-foreground text-center mt-1">
            {ELEMENT_THEME[selected.element].label} · {selected.species}
          </Text>
        </View>

        <View className="px-6">
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            decelerationRate="fast"
          >
            {AVAILABLE_KILNKIN_COMPANIONS.map((companion, index) => {
              const theme = ELEMENT_THEME[companion.element];
              const ThemeIcon = theme.Icon;
              const isSelected = index === currentIndex;
              return (
                <View key={companion.id} style={{ width: CARD_WIDTH }}>
                  <TouchableOpacity onPress={() => handlePet(index)} activeOpacity={0.9}>
                    <Animated.View
                      style={{
                        transform: [{ scale: scaleAnims[index] }],
                        borderRadius: 20,
                        borderWidth: 1.5,
                        borderColor: isSelected ? 'hsl(24 25% 22%)' : 'hsl(24 10% 86%)',
                        backgroundColor: 'hsl(34 20% 99%)',
                        padding: 18,
                      }}
                    >
                      <View className="flex-row items-center gap-2 mb-3">
                        <View
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 10,
                            backgroundColor: theme.ring,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ThemeIcon size={14} color={theme.iconColor} />
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.iconColor }}>
                          {theme.label} · {companion.notificationToneLabel}
                        </Text>
                      </View>
                      <Text className="text-sm text-foreground leading-5">{companion.loves}</Text>
                      <Text className="text-xs text-muted-foreground mt-3">{companion.collects}</Text>
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <View className="flex-row justify-center items-center gap-2 mt-4 mb-2">
            {AVAILABLE_KILNKIN_COMPANIONS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === currentIndex ? 8 : 6,
                  height: i === currentIndex ? 8 : 6,
                  borderRadius: 4,
                  backgroundColor: i === currentIndex ? 'hsl(24 25% 22%)' : 'hsl(24 10% 80%)',
                }}
              />
            ))}
          </View>
        </View>

        <View className="px-6 pt-3 pb-8 border-t border-border mt-2">
          <PrimaryButton
            label={selected.id === currentCompanionId ? 'Keep current companion' : `Switch to ${selected.name}`}
            onPress={() => {
              onConfirm(selected);
              onClose();
            }}
          />
        </View>
      </ModalCard>
    </ModalShell>
  );
}
