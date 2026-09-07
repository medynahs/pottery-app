import { Text } from '@/src/components/ui/text';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Droplets, Flame, Leaf, Moon, Sparkle, Sparkles, Wind } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import type { DimensionValue } from 'react-native';
import { Animated, Easing, Pressable, View } from 'react-native';
import type { KilnkinPersonality } from '../../overview/kilnkin/kilnkinCompanion';
import { AVAILABLE_KILNKIN_COMPANIONS } from '../../overview/kilnkin/kilnkinCompanion';

type ElementKey = KilnkinPersonality;

// Rive ships native code, which is unavailable in Expo Go. Lazily require it only
// outside Expo Go so the app still runs there (falling back to the GIF/image art).
// In a development/production build the real Rive animation is used.
const isExpoGo = Constants.appOwnership === 'expo';
let RiveView: React.ComponentType<any> | null = null;
let RiveFit: any = null;
if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const riveModule = require('rive-react-native');
    RiveView = riveModule.default;
    RiveFit = riveModule.Fit;
  } catch {
    RiveView = null;
  }
}

const ELEMENT_THEME: Record<ElementKey, {
  ring: string;
  iconColor: string;
  label: string;
  tagline: string;
  gradient: readonly [string, string, string];
  aura: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}> = {
  fire:  { ring: '#FCDCBE', iconColor: '#C05C14', label: 'Fire',  tagline: 'Bold spark',   gradient: ['#ffe9d2', '#ec9a5b', '#7e3712'], aura: 'rgba(255, 173, 110, 0.45)', Icon: Flame    },
  earth: { ring: '#D4DFC8', iconColor: '#4A7530', label: 'Earth', tagline: 'Steady root',  gradient: ['#e9f1dd', '#a7c486', '#3d5f2c'], aura: 'rgba(150, 191, 110, 0.45)', Icon: Leaf     },
  air:   { ring: '#C8D8EC', iconColor: '#3060A0', label: 'Air',   tagline: 'Light drift',  gradient: ['#e4eefa', '#9bc0e6', '#264f7f'], aura: 'rgba(140, 184, 232, 0.45)', Icon: Wind     },
  water: { ring: '#C0D5E8', iconColor: '#286880', label: 'Water', tagline: 'Calm current', gradient: ['#e2f1f6', '#94c4d6', '#1f5468'], aura: 'rgba(120, 192, 214, 0.45)', Icon: Droplets },
};

const COMPANION_ART: Record<ElementKey, any> = {
  fire:  require('../../../../assets/animations/activeOven.gif'),
  earth: require('../../../../assets/images/clay-pet.png'),
  air:   require('../../../../assets/animations/pet.gif'),
  water: require('../../../../assets/animations/kilnPet.gif'),
};

// Companions backed by a Rive animation instead of a static image.
// `resourceName` is the .riv filename (without extension) bundled via expo-custom-assets.
const COMPANION_RIVE: Partial<Record<ElementKey, string>> = {
  water: 'blackcat',
};

const CompanionArt: React.FC<{ element: ElementKey; width: DimensionValue; height: DimensionValue }> = ({
  element,
  width,
  height,
}) => {
  const riveResource = COMPANION_RIVE[element];
  if (riveResource && RiveView) {
    return (
      <View style={{ width, height }}>
        <RiveView resourceName={riveResource} autoplay fit={RiveFit?.Contain} style={{ flex: 1 }} />
      </View>
    );
  }
  return (
    <Image source={COMPANION_ART[element]} style={{ width, height }} contentFit="contain" />
  );
};

interface KilnkinStepProps {
  draft: any;
  updateDraft: (patch: Partial<any>) => void;
}

export const KilnkinStep: React.FC<KilnkinStepProps> = ({ draft, updateDraft }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = AVAILABLE_KILNKIN_COMPANIONS.findIndex((c) => c.id === draft.kilnkinId);
    return idx >= 0 ? idx : 0;
  });

  const portraitOpacity = useRef(new Animated.Value(1)).current;
  const portraitScale = useRef(new Animated.Value(1)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  // Gentle idle float on the hero portrait
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -8, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatY]);

  // Auto-select first companion if none chosen
  useEffect(() => {
    if (!draft.kilnkinId) {
      updateDraft({ kilnkinId: AVAILABLE_KILNKIN_COMPANIONS[0].id });
    }
  }, [draft.kilnkinId, updateDraft]);

  const handleSelect = (index: number) => {
    if (index === currentIndex) {
      // Re-tap on the active companion: playful bounce
      Animated.sequence([
        Animated.spring(portraitScale, { toValue: 1.06, useNativeDriver: true, speed: 50, bounciness: 12 }),
        Animated.spring(portraitScale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 8 }),
      ]).start();
      return;
    }

    setCurrentIndex(index);
    updateDraft({ kilnkinId: AVAILABLE_KILNKIN_COMPANIONS[index].id });

    portraitScale.setValue(0.92);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(portraitOpacity, { toValue: 0, duration: 110, useNativeDriver: true }),
        Animated.timing(portraitOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]),
      Animated.spring(portraitScale, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
    ]).start();
  };

  const selected = AVAILABLE_KILNKIN_COMPANIONS[currentIndex];
  const theme = ELEMENT_THEME[selected.element as ElementKey];
  const { Icon } = theme;

  const traits: { Icon: React.ComponentType<{ size: number; color: string }>; label: string; value: string }[] = [
    { Icon: Sparkle, label: 'Vibe', value: selected.notificationToneLabel },
    { Icon: theme.Icon, label: 'Loves', value: selected.loves },
    { Icon: Moon, label: 'Naps', value: selected.napSpot },
  ];

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 0 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
        <View style={{ alignSelf: 'flex-start', borderRadius: 999, backgroundColor: 'rgba(125, 76, 39, 0.1)', paddingHorizontal: 11, paddingVertical: 6, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: 'hsl(28 38% 34%)' }}>
            Choose your companion
          </Text>
        </View>
        <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 23, lineHeight: 29, color: 'hsl(24 30% 12%)' }}>
          Pick your Kilnkin
        </Text>
        <Text style={{ fontSize: 13, color: 'hsl(24 15% 46%)', marginTop: 7, lineHeight: 19 }}>
          A studio companion who shapes the tone of your nudges and milestones.
        </Text>
      </View>

      {/* Hero portrait stage */}
      <Animated.View
        style={{
          borderRadius: 24,
          opacity: portraitOpacity,
          marginBottom: 12,
          shadowColor: theme.iconColor,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.24,
          shadowRadius: 18,
          elevation: 7,
        }}
      >
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ height: 226, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }}
        >
          <View style={{ position: 'absolute', right: -50, top: -46, width: 168, height: 168, borderRadius: 84, backgroundColor: 'rgba(255, 255, 255, 0.18)' }} />
          <View style={{ position: 'absolute', left: -60, bottom: -72, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(30, 18, 10, 0.14)' }} />
          <Sparkles size={120} color="rgba(255, 248, 232, 0.22)" style={{ position: 'absolute', top: 20 }} />

          {/* Element + class badges */}
          <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, backgroundColor: 'rgba(255, 252, 246, 0.92)', paddingHorizontal: 10, paddingVertical: 5 }}>
            <Icon size={12} color={theme.iconColor} />
            <Text style={{ fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: theme.iconColor }}>
              {theme.label}
            </Text>
          </View>
          <View style={{ position: 'absolute', top: 12, right: 12, borderRadius: 999, backgroundColor: 'rgba(34, 20, 12, 0.32)', paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ fontSize: 10.5, fontWeight: '700', letterSpacing: 0.6, color: '#fffaf2' }}>
              {currentIndex + 1} / {AVAILABLE_KILNKIN_COMPANIONS.length}
            </Text>
          </View>

          {/* Art in glowing aura */}
          <Animated.View style={{ transform: [{ translateY: floatY }, { scale: portraitScale }], alignItems: 'center' }}>
            <View style={{ width: 116, height: 116, borderRadius: 58, backgroundColor: theme.aura, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255, 252, 246, 0.86)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.7)' }}>
                <CompanionArt element={selected.element as ElementKey} width={72} height={72} />
              </View>
            </View>
          </Animated.View>

          <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, lineHeight: 26, color: '#fffaf2', textAlign: 'center', marginTop: 12 }}>
            {selected.name}
          </Text>
          <Text style={{ fontSize: 11, color: 'rgba(255, 250, 242, 0.9)', marginTop: 3, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' }}>
            {selected.species} · {theme.tagline}
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Trait / bio panel */}
      <Animated.View
        style={{
          opacity: portraitOpacity,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 252, 246, 0.96)',
          borderWidth: 1,
          borderColor: 'rgba(94, 60, 36, 0.12)',
          paddingHorizontal: 13,
          paddingVertical: 5,
          marginBottom: 14,
        }}
      >
        {traits.map((trait, i) => {
          const TIcon = trait.Icon;
          return (
            <View
              key={trait.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 11,
                paddingVertical: 8,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: 'rgba(94, 60, 36, 0.08)',
              }}
            >
              <View style={{ width: 30, height: 30, borderRadius: 11, backgroundColor: theme.ring, alignItems: 'center', justifyContent: 'center' }}>
                <TIcon size={14} color={theme.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10.5, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase', color: 'hsl(28 30% 50%)' }}>
                  {trait.label}
                </Text>
                <Text style={{ fontSize: 12.5, lineHeight: 17, color: 'hsl(24 22% 24%)', marginTop: 1 }}>
                  {trait.value}
                </Text>
              </View>
            </View>
          );
        })}
      </Animated.View>

      {/* Roster, character select tiles */}
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: 'hsl(28 30% 50%)', marginBottom: 8, paddingHorizontal: 4 }}>
        The roster
      </Text>
      <View style={{ flexDirection: 'row', gap: 9 }}>
        {AVAILABLE_KILNKIN_COMPANIONS.map((companion, index) => {
          const cTheme = ELEMENT_THEME[companion.element as ElementKey];
          const isSelected = index === currentIndex;
          return (
            <Pressable
              key={companion.id}
              onPress={() => handleSelect(index)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${companion.name}`}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <View
                style={{
                  width: '100%',
                  aspectRatio: 1,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? cTheme.ring : 'rgba(255, 252, 246, 0.96)',
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? cTheme.iconColor : 'rgba(94, 60, 36, 0.12)',
                  shadowColor: cTheme.iconColor,
                  shadowOffset: { width: 0, height: isSelected ? 6 : 0 },
                  shadowOpacity: isSelected ? 0.22 : 0,
                  shadowRadius: isSelected ? 10 : 0,
                  elevation: isSelected ? 4 : 0,
                }}
              >
                <CompanionArt element={companion.element as ElementKey} width="74%" height="74%" />
                {isSelected ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: cTheme.iconColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#fffaf2',
                    }}
                  >
                    <Check size={11} color="#fffaf2" strokeWidth={3} />
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  marginTop: 6,
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? cTheme.iconColor : 'hsl(24 14% 46%)',
                }}
              >
                {companion.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontSize: 12, textAlign: 'center', color: 'hsl(24 10% 58%)', marginTop: 12, lineHeight: 16 }}>
        Tap a companion to meet them. You can swap anytime in settings.
      </Text>
    </View>
  );
};
