import { Text } from '@/src/components/ui/text';
import { SETUP_QUEST_META } from '@/src/screens/overview/constants/setupQuestMeta';
import type { SetupQuest, SetupQuestKey } from '@/src/screens/overview/setupQuests/setupQuestCatalog';
import { getSetupQuestByKey } from '@/src/screens/overview/setupQuests/setupQuestCatalog';
import { LinearGradient } from 'expo-linear-gradient';
import type { Href } from 'expo-router';
import { Check, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, TouchableOpacity, View } from 'react-native';

type SetupModeSectionProps = {
  heroReveal: Animated.Value;
  userName: string;
  setupQuests: SetupQuest[];
  initialSetupQuestCount: number | null;
  kilnkinName: string;
  onQuestPress: (route: Href) => void;
  onKilnkinPress: () => void;
  onPat: () => void;
};

type RowItem =
  | { kind: 'pending'; quest: SetupQuest; isFirst: boolean }
  | { kind: 'completing'; quest: SetupQuest };

function SetupQuestRow({
  item,
  showTopBorder,
  onPress,
  onDismissed,
}: {
  item: RowItem;
  showTopBorder: boolean;
  onPress?: () => void;
  onDismissed: (key: SetupQuestKey) => void;
}) {
  const { quest } = item;
  const completing = item.kind === 'completing';
  const isFirst = item.kind === 'pending' && item.isFirst;
  const meta = SETUP_QUEST_META[quest.key];
  const Icon = meta.Icon;

  const opacity = useRef(new Animated.Value(completing ? 1 : 1)).current;
  const slideY = useRef(new Animated.Value(completing ? 0 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!completing) return;

    const animation = Animated.sequence([
      Animated.delay(520),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: -10,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished) onDismissed(quest.key);
    });

    return () => animation.stop();
  }, [completing, onDismissed, opacity, quest.key, scale, slideY]);

  const content = (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY: slideY }, { scale }],
      }}
      className="flex-row items-center gap-3 px-4 py-3.5"
    >
      <View
        className="w-6 h-6 rounded-md items-center justify-center border-2"
        style={{
          borderColor: completing ? 'hsl(130 45% 38%)' : isFirst ? 'hsl(39 57% 51%)' : 'hsl(34 28% 78%)',
          backgroundColor: completing ? 'hsl(130 45% 38%)' : isFirst ? 'hsl(39 57% 51%)' : 'transparent',
        }}
      >
        {completing ? (
          <Check size={13} color="#fff" strokeWidth={3} />
        ) : isFirst ? (
          <View className="w-2 h-2 rounded-full bg-white" />
        ) : null}
      </View>

      <View
        className="w-10 h-10 rounded-2xl items-center justify-center"
        style={{
          backgroundColor: completing ? 'hsl(130 35% 92%)' : meta.iconBg,
          borderWidth: 1,
          borderColor: 'rgba(60, 40, 20, 0.10)',
          opacity: completing ? 0.65 : 1,
        }}
      >
        <Icon size={18} color={completing ? 'hsl(130 40% 36%)' : meta.iconColor} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text
            className={`text-sm font-semibold ${completing ? 'text-muted-foreground' : 'text-foreground'}`}
            style={completing ? { textDecorationLine: 'line-through' } : undefined}
          >
            {quest.title}
          </Text>
          {!completing && isFirst ? (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: 'hsl(39 57% 51%)' }}>
              <Text className="text-[9px] font-bold text-white uppercase">Next</Text>
            </View>
          ) : null}
          {completing ? (
            <Text className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'hsl(130 40% 36%)' }}>
              Done
            </Text>
          ) : null}
        </View>
        <Text
          className="text-[11px] mt-0.5 leading-4"
          style={{
            color: completing ? 'hsl(32 20% 62%)' : undefined,
            textDecorationLine: completing ? 'line-through' : 'none',
          }}
          numberOfLines={2}
        >
          {quest.text}
        </Text>
      </View>

      {!completing ? (
        <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: 'hsl(34 38% 92%)' }}>
          <ChevronRight size={15} color="hsl(24 45% 38%)" />
        </View>
      ) : null}
    </Animated.View>
  );

  if (completing) {
    return (
      <View
        style={{
          borderTopWidth: showTopBorder ? 1 : 0,
          borderTopColor: 'hsl(34 28% 91%)',
          backgroundColor: 'hsl(130 35% 96%)',
        }}
      >
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        borderTopWidth: showTopBorder ? 1 : 0,
        borderTopColor: 'hsl(34 28% 91%)',
        backgroundColor: isFirst ? 'hsl(44 70% 96%)' : 'transparent',
        borderLeftWidth: isFirst ? 3 : 0,
        borderLeftColor: isFirst ? 'hsl(39 57% 51%)' : 'transparent',
      }}
      accessibilityRole="button"
    >
      {content}
    </TouchableOpacity>
  );
}

export function SetupModeSection({
  heroReveal,
  userName,
  setupQuests,
  initialSetupQuestCount,
  kilnkinName,
  onQuestPress,
  onKilnkinPress,
  onPat,
}: SetupModeSectionProps) {
  const prevPendingKeysRef = useRef<SetupQuestKey[]>([]);
  const [completingKeys, setCompletingKeys] = useState<SetupQuestKey[]>([]);

  useLayoutEffect(() => {
    const currentKeys = setupQuests.map((q) => q.key);
    const prevKeys = prevPendingKeysRef.current;

    if (prevKeys.length > 0) {
      const justCompleted = prevKeys.filter((key) => !currentKeys.includes(key));
      if (justCompleted.length > 0) {
        setCompletingKeys((prev) => {
          const next = [...prev];
          for (const key of justCompleted) {
            if (!next.includes(key)) next.push(key);
          }
          return next;
        });
      }
    }

    prevPendingKeysRef.current = currentKeys;
  }, [setupQuests]);

  const handleDismissed = (key: SetupQuestKey) => {
    setCompletingKeys((prev) => prev.filter((k) => k !== key));
  };

  const completingQuests = completingKeys.map(getSetupQuestByKey);
  const pendingRows: RowItem[] = setupQuests.map((quest, idx) => ({
    kind: 'pending',
    quest,
    isFirst: idx === 0,
  }));
  const completingRows: RowItem[] = completingQuests.map((quest) => ({
    kind: 'completing',
    quest,
  }));
  const displayRows = [...completingRows, ...pendingRows];

  const total = initialSetupQuestCount ?? setupQuests.length + completingKeys.length;
  const completed = Math.max(0, total - setupQuests.length);
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remainingCount = setupQuests.length;

  return (
    <Animated.View
      style={{
        opacity: heroReveal,
        transform: [{
          translateY: heroReveal.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
          }),
        }],
      }}
    >
      <LinearGradient
        colors={['#B86A3C', '#7A4022']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 28,
          marginBottom: 16,
          overflow: 'hidden',
          shadowColor: '#3a2310',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.24,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        <View className="px-5 pt-5 pb-5">
          <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255, 244, 224, 0.85)', textTransform: 'uppercase' }}>
            Your Studio
          </Text>
          <Text className="font-serif text-[22px] leading-8 mt-2" style={{ color: '#FFF7EC' }}>
            {userName ? `Welcome, ${userName.split(' ')[0]}` : 'Welcome to your studio'}
          </Text>
          <Text className="text-[13px] leading-5 mt-2" style={{ color: 'rgba(255, 244, 224, 0.80)' }}>
            Finish the checklist below to unlock your full studio view.
          </Text>
          <View className="flex-row items-center gap-2.5 mt-4">
            <View className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0, 0, 0, 0.20)' }}>
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: '#F2C25E',
                  width: `${Math.max(8, progressPct)}%`,
                }}
              />
            </View>
            <Text className="text-[11px] font-bold" style={{ color: '#FFEFD0' }}>
              {completed}/{total}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View
        className="rounded-[24px] mb-4 overflow-hidden"
        style={{ backgroundColor: 'hsl(40 50% 99%)', borderWidth: 1, borderColor: 'hsl(34 34% 84%)', shadowColor: '#3f2a12', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 }}
      >
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: 'hsl(34 30% 90%)' }}>
          <View className="flex-1 pr-3">
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.9, color: 'hsl(24 55% 32%)', textTransform: 'uppercase' }}>
              Setup checklist
            </Text>
            <Text style={{ fontSize: 11, color: 'hsl(32 28% 44%)', marginTop: 3 }}>
              Tap a row, then save your preferences to check it off.
            </Text>
          </View>
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: 'hsl(24 50% 30%)' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFF3DF' }}>{remainingCount}</Text>
          </View>
        </View>

        {displayRows.length === 0 ? (
          <View className="px-4 py-8 items-center">
            <View className="w-10 h-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: 'hsl(130 35% 90%)' }}>
              <Check size={20} color="hsl(130 40% 36%)" strokeWidth={3} />
            </View>
            <Text className="text-sm font-semibold text-foreground">All set!</Text>
            <Text className="text-xs text-muted-foreground mt-1 text-center">Your studio view is ready.</Text>
          </View>
        ) : (
          displayRows.map((item, index) => (
            <SetupQuestRow
              key={`${item.kind}-${item.quest.key}`}
              item={item}
              showTopBorder={index > 0}
              onPress={item.kind === 'pending' ? () => onQuestPress(item.quest.route as Href) : undefined}
              onDismissed={handleDismissed}
            />
          ))
        )}
      </View>

      <View className="rounded-[24px] px-4 py-3.5 mb-2" style={{ backgroundColor: 'hsl(40 50% 99%)', borderWidth: 1, borderColor: 'hsl(34 34% 86%)' }}>
        <View className="flex-row items-start gap-3">
          <TouchableOpacity
            onPress={onKilnkinPress}
            onLongPress={onPat}
            delayLongPress={400}
            activeOpacity={0.85}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'hsl(35 45% 86%)',
            }}
          >
            <Image
              source={require('../../../../assets/images/clay-pet.png')}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-[10px] uppercase" style={{ letterSpacing: 0.8, color: 'hsl(32 35% 46%)' }}>Kilnkin note</Text>
            <Text className="text-[12px] mt-1 leading-5 text-foreground">
              Hi, I&apos;m {kilnkinName}. I&apos;ll be right here while you get settled in.
            </Text>
            <TouchableOpacity
              onPress={onKilnkinPress}
              activeOpacity={0.8}
              className="self-start mt-2 rounded-full px-2.5 py-1"
              style={{ backgroundColor: 'hsl(35 54% 87%)' }}
            >
              <Text className="text-[11px] font-medium" style={{ color: 'hsl(33 45% 30%)' }}>Visit {kilnkinName}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
