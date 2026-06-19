import { Text } from '@/src/components/ui/text';
import { SETUP_QUEST_META } from '@/src/screens/overview/constants/setupQuestMeta';
import type { SetupQuest } from '@/src/screens/overview/setupQuests/generateSetupQuests';
import { LinearGradient } from 'expo-linear-gradient';
import type { Href } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Animated, Image, TouchableOpacity, View } from 'react-native';

type SetupModeSectionProps = {
  heroReveal: Animated.Value;
  userName: string;
  setupQuests: SetupQuest[];
  kilnkinName: string;
  onQuestPress: (route: Href) => void;
  onKilnkinPress: () => void;
  onPat: () => void;
};

export function SetupModeSection({
  heroReveal,
  userName,
  setupQuests,
  kilnkinName,
  onQuestPress,
  onKilnkinPress,
  onPat,
}: SetupModeSectionProps) {
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
            A few quick steps to shape the app around how you actually work.
          </Text>
          <View className="flex-row items-center gap-2.5 mt-4">
            <View className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0, 0, 0, 0.20)' }}>
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: '#F2C25E',
                  width: `${Math.max(8, Math.round((1 - setupQuests.length / 10) * 100))}%`,
                }}
              />
            </View>
            <Text className="text-[11px] font-bold" style={{ color: '#FFEFD0' }}>
              {setupQuests.length} left
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
              Tap a step when you&apos;re ready — no rush.
            </Text>
          </View>
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: 'hsl(24 50% 30%)' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFF3DF' }}>{setupQuests.length}</Text>
          </View>
        </View>

        {setupQuests.map((quest, idx) => {
          const meta = SETUP_QUEST_META[quest.key];
          const Icon = meta.Icon;
          return (
            <TouchableOpacity
              key={quest.key}
              onPress={() => onQuestPress(quest.route as Href)}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 px-4 py-3.5"
              style={{ borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: 'hsl(34 28% 91%)' }}
              accessibilityRole="button"
            >
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center"
                style={{ backgroundColor: meta.iconBg, borderWidth: 1, borderColor: 'rgba(60, 40, 20, 0.10)' }}
              >
                <Icon size={18} color={meta.iconColor} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">{quest.title}</Text>
                <Text className="text-[11px] text-muted-foreground mt-0.5 leading-4" numberOfLines={2}>{quest.text}</Text>
              </View>
              <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: 'hsl(34 38% 92%)' }}>
                <ChevronRight size={15} color="hsl(24 45% 38%)" />
              </View>
            </TouchableOpacity>
          );
        })}
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
              Hi — I&apos;m {kilnkinName}. I&apos;ll be right here while you get settled in.
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
