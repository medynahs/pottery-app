import { Droplets, Flame, Leaf, Wind } from 'lucide-react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { KilnkinPersonality } from '../../overview/kilnkin/kilnkinCompanion';
import { AVAILABLE_KILNKIN_COMPANIONS } from '../../overview/kilnkin/kilnkinCompanion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

type ElementKey = KilnkinPersonality;

const ELEMENT_THEME: Record<ElementKey, {
  portraitBg: string;
  ring: string;
  iconColor: string;
  label: string;
  cardBorder: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}> = {
  fire:  { portraitBg: '#FEF0E6', ring: '#FCDCBE', iconColor: '#C05C14', label: 'Fire',  cardBorder: '#FAD4B0', Icon: Flame    },
  earth: { portraitBg: '#ECF0E6', ring: '#D4DFC8', iconColor: '#4A7530', label: 'Earth', cardBorder: '#C8D9B8', Icon: Leaf     },
  air:   { portraitBg: '#E8F0F8', ring: '#C8D8EC', iconColor: '#3060A0', label: 'Air',   cardBorder: '#BACED8', Icon: Wind     },
  water: { portraitBg: '#E4EEF5', ring: '#C0D5E8', iconColor: '#286880', label: 'Water', cardBorder: '#B0CCD8', Icon: Droplets },
};

interface KilnkinStepProps {
  draft: any;
  updateDraft: (patch: Partial<any>) => void;
}

export const KilnkinStep: React.FC<KilnkinStepProps> = ({ draft, updateDraft }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = AVAILABLE_KILNKIN_COMPANIONS.findIndex((c) => c.id === draft.kilnkinId);
    return idx >= 0 ? idx : 0;
  });

  const portraitOpacity = useRef(new Animated.Value(1)).current;
  const prevId = useRef(draft.kilnkinId);

  const scaleAnims = useRef(
    AVAILABLE_KILNKIN_COMPANIONS.map(() => new Animated.Value(1))
  ).current;

  // Cross-fade portrait when companion changes
  useEffect(() => {
    if (prevId.current !== draft.kilnkinId) {
      prevId.current = draft.kilnkinId;
      Animated.sequence([
        Animated.timing(portraitOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(portraitOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [draft.kilnkinId]);

  // Auto-select first companion if none chosen
  useEffect(() => {
    if (!draft.kilnkinId) {
      updateDraft({ kilnkinId: AVAILABLE_KILNKIN_COMPANIONS[0].id });
    }
  }, []);

  // Scroll to pre-selected companion on mount
  useLayoutEffect(() => {
    if (currentIndex > 0) {
      scrollRef.current?.scrollTo({ x: currentIndex * CARD_WIDTH, animated: false });
    }
  }, []);

  const handlePet = (index: number) => {
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 1.09, useNativeDriver: true, speed: 50, bounciness: 10 }),
      Animated.spring(scaleAnims[index], { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 6  }),
    ]).start();
  };

  const handleScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    const clamped = Math.max(0, Math.min(index, AVAILABLE_KILNKIN_COMPANIONS.length - 1));
    if (clamped !== currentIndex) {
      setCurrentIndex(clamped);
      updateDraft({ kilnkinId: AVAILABLE_KILNKIN_COMPANIONS[clamped].id });
    }
  };

  const selectedCompanion = AVAILABLE_KILNKIN_COMPANIONS[currentIndex];
  const theme = ELEMENT_THEME[selectedCompanion.element as ElementKey];
  const { Icon } = theme;

  return (
    <View style={{ paddingBottom: 8 }}>
      {/* Heading */}
      <View style={{ paddingHorizontal: 24, paddingTop: 22, paddingBottom: 18 }}>
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold',
            fontSize: 28,
            lineHeight: 36,
            color: 'hsl(24 30% 12%)',
          }}
        >
          Choose your Kilnkin
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: 'hsl(24 15% 50%)',
            marginTop: 8,
            lineHeight: 22,
          }}
        >
          Your elemental studio companion. Swipe to meet all four.
        </Text>
      </View>

      {/* Companion portrait — animates between companions */}
      <Animated.View
        style={{
          marginHorizontal: 24,
          borderRadius: 28,
          backgroundColor: theme.portraitBg,
          height: 192,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: portraitOpacity,
          marginBottom: 18,
        }}
      >
        {/* Element icon ring */}
        <View
          style={{
            width: 92,
            height: 92,
            borderRadius: 46,
            backgroundColor: theme.ring,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <Icon size={42} color={theme.iconColor} />
        </View>

        {/* Companion identity */}
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold',
            fontSize: 22,
            color: 'hsl(24 30% 10%)',
          }}
        >
          {selectedCompanion.name}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: theme.iconColor,
            marginTop: 3,
            fontWeight: '500',
          }}
        >
          {selectedCompanion.species} · {theme.label}
        </Text>
      </Animated.View>

      {/* Horizontal swipe cards */}
      <View style={{ paddingHorizontal: 24 }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          decelerationRate="fast"
        >
          {AVAILABLE_KILNKIN_COMPANIONS.map((companion, index) => {
            const cTheme = ELEMENT_THEME[companion.element as ElementKey];
            const CIcon = cTheme.Icon;
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
                    {/* Element chip */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <View
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 9,
                          backgroundColor: cTheme.ring,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CIcon size={13} color={cTheme.iconColor} />
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: cTheme.iconColor,
                          textTransform: 'capitalize',
                        }}
                      >
                        {cTheme.label} · {companion.species}
                      </Text>
                    </View>

                    {/* Companion personality */}
                    <Text
                      style={{
                        fontSize: 13,
                        color: 'hsl(24 20% 28%)',
                        lineHeight: 20,
                      }}
                    >
                      {companion.loves}
                    </Text>

                    {/* Notification tone */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 12,
                        paddingTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: 'hsl(24 10% 91%)',
                      }}
                    >
                      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: cTheme.iconColor }} />
                      <Text style={{ fontSize: 11, color: cTheme.iconColor, fontWeight: '500' }}>
                        {companion.notificationToneLabel}
                      </Text>
                    </View>

                    {/* Tap to pet hint */}
                    {isSelected && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: 'hsl(24 10% 60%)',
                          marginTop: 8,
                          textAlign: 'right',
                        }}
                      >
                        Tap to bounce ✦
                      </Text>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Dot indicators */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 7,
            marginTop: 14,
          }}
        >
          {AVAILABLE_KILNKIN_COMPANIONS.map((_, i) => (
            <View
              key={i}
              style={{
                height: 5,
                width: i === currentIndex ? 20 : 5,
                borderRadius: 2.5,
                backgroundColor: i === currentIndex
                  ? 'hsl(24 25% 22%)'
                  : 'hsl(24 10% 80%)',
              }}
            />
          ))}
        </View>

        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: 'hsl(24 10% 58%)',
            marginTop: 10,
          }}
        >
          You can swap companions anytime in settings
        </Text>
      </View>
    </View>
  );
};
