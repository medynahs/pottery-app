import { Text } from '@/src/components/ui/text';
import { apiAddReaction, apiRemoveReaction } from '@/src/services/community';
import type { LucideIcon } from 'lucide-react-native';
import { Flame, RotateCw, Sparkles, Target } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { COMMUNITY_THEME } from '../communityTheme';

type ReactionKey = 'fired' | 'glazed' | 'centered' | 'thrown';

type ReactionDef = {
  key: ReactionKey;
  Icon: LucideIcon;
  label: string;
  activeColor: string;
};

const REACTIONS: ReactionDef[] = [
  { key: 'fired', Icon: Flame, label: 'Kiln it!', activeColor: 'hsl(39 57% 51%)' },
  { key: 'glazed', Icon: Sparkles, label: 'Glaze-mazing!', activeColor: 'hsl(213 75% 52%)' },
  { key: 'centered', Icon: Target, label: 'Well Centered!', activeColor: 'hsl(145 50% 42%)' },
  { key: 'thrown', Icon: RotateCw, label: 'Spin the Wheel!', activeColor: 'hsl(270 55% 52%)' },
];

const IDLE_COLOR = 'hsl(24 20% 55%)';
const PHRASE_HOLD_MS = 1700;

type Props = {
  postId: string;
  sessionToken: string;
  initialCount: number;
  initialHasReacted: boolean;
};

function ReactionIcon({
  Icon,
  activeColor,
  isActive,
  disabled,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  activeColor: string;
  isActive: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const iconColor = isActive ? activeColor : IDLE_COLOR;

  const handlePress = () => {
    if (disabled) return;
    onPress();
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.28, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.6}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          size={22}
          color={iconColor}
          fill={isActive ? iconColor : 'transparent'}
          strokeWidth={isActive ? 2.25 : 1.75}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export function PostReactionBar({
  postId,
  sessionToken,
  initialCount,
  initialHasReacted,
}: Props) {
  const [activeKey, setActiveKey] = useState<ReactionKey | null>(
    initialHasReacted ? 'fired' : null,
  );
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [phrase, setPhrase] = useState<{ label: string; color: string } | null>(null);
  const phraseOpacity = useRef(new Animated.Value(0)).current;
  const phraseAnim = useRef<Animated.CompositeAnimation | null>(null);

  const showPhrase = (label: string, color: string) => {
    phraseAnim.current?.stop();
    setPhrase({ label, color });
    phraseOpacity.setValue(0);

    phraseAnim.current = Animated.sequence([
      Animated.timing(phraseOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.delay(PHRASE_HOLD_MS),
      Animated.timing(phraseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);

    phraseAnim.current.start(({ finished }) => {
      if (finished) setPhrase(null);
    });
  };

  const handleReaction = async (key: ReactionKey, label: string, activeColor: string) => {
    if (busy) return;
    showPhrase(label, activeColor);
    setBusy(true);

    const isSame = activeKey === key;
    const wasReacted = activeKey !== null;
    const prevKey = activeKey;
    const prevCount = count;

    setActiveKey(isSame ? null : key);
    setCount((c) => {
      if (isSame) return Math.max(0, c - 1);
      if (!wasReacted) return c + 1;
      return c;
    });

    try {
      if (isSame) {
        await apiRemoveReaction(sessionToken, postId);
      } else if (!wasReacted) {
        await apiAddReaction(sessionToken, postId);
      }
    } catch {
      setActiveKey(prevKey);
      setCount(prevCount);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="pt-3 mt-1" style={{ overflow: 'visible' }}>
      <View style={{ minHeight: phrase ? 20 : 0, marginBottom: phrase ? 6 : 0, overflow: 'visible' }}>
        {phrase ? (
          <Animated.View
            pointerEvents="none"
            style={{ opacity: phraseOpacity, alignItems: 'flex-start' }}
          >
            <Text
              className="text-[13px] font-bold"
              style={{ color: phrase.color }}
            >
              {phrase.label}
            </Text>
          </Animated.View>
        ) : null}
      </View>

      <View className="flex-row items-center gap-5">
        {REACTIONS.map(({ key, Icon, label, activeColor }) => (
          <ReactionIcon
            key={key}
            Icon={Icon}
            label={label}
            activeColor={activeColor}
            isActive={activeKey === key}
            disabled={busy}
            onPress={() => { void handleReaction(key, label, activeColor); }}
          />
        ))}

        {count > 0 ? (
          <Text className="text-xs font-medium" style={{ color: COMMUNITY_THEME.inkMuted }}>
            {count}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
