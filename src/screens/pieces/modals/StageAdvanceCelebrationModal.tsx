import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import type { LucideIcon } from 'lucide-react-native';
import { Flame, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Image, Modal, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export type StageAdvanceCelebration = {
  fromStage: string;
  toStage: string;
  pieceName: string;
  count: number;
  isBatch: boolean;
};

type StageVisual = {
  label: string;
  Icon: LucideIcon;
};

interface StageAdvanceCelebrationModalProps {
  transition: StageAdvanceCelebration | null;
  stageLookup: Record<string, StageVisual>;
  onClose: () => void;
}

const FIRING_STAGE_IDS = new Set(['bisque', 'glaze-fired']);
const FINISHED_STAGE_ID = 'finished';

const STAGE_COPY: Record<string, string> = {
  forming: 'The shape is coming to life.',
  'leather-hard': 'Perfect timing for details.',
  trimming: 'Time to refine and clean the form.',
  drying: 'Now we let it rest and dry.',
  'bone-dry': 'Ready for the heat soon.',
  bisque: 'Kiln cycle started. Heat is on.',
  glazing: 'Surface and color step unlocked.',
  'glaze-fired': 'Glaze firing underway. Looking magical.',
  finished: 'Finished piece unlocked. Beautiful work.',
  cemetery: 'Held with care and remembered.',
};

function getStageCopy(stageId: string) {
  return STAGE_COPY[stageId] ?? 'Stage updated successfully.';
}

export function StageAdvanceCelebrationModal({
  transition,
  stageLookup,
  onClose,
}: StageAdvanceCelebrationModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    if (!transition) return;

    pulse.value = 0;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    const autoCloseMs = FIRING_STAGE_IDS.has(transition.toStage) || transition.toStage === FINISHED_STAGE_ID
      ? 2200
      : 1500;
    const timer = setTimeout(onClose, autoCloseMs);

    return () => clearTimeout(timer);
  }, [transition, onClose, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.06 }],
    opacity: 0.78 + pulse.value * 0.22,
  }));

  if (!transition) return null;

  const toVisual = stageLookup[transition.toStage];
  const fromVisual = stageLookup[transition.fromStage];
  const toLabel = toVisual?.label ?? transition.toStage;
  const fromLabel = fromVisual?.label ?? transition.fromStage;
  const StageIcon = toVisual?.Icon ?? Sparkles;

  const isFiring = FIRING_STAGE_IDS.has(transition.toStage);
  const isFinished = transition.toStage === FINISHED_STAGE_ID;
  const heading = transition.count > 1
    ? `${transition.count} pieces advanced`
    : `${transition.pieceName} advanced`;
  const subtitle = `${fromLabel} → ${toLabel}`;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 items-center justify-center px-7"
        style={{ backgroundColor: 'rgba(0,0,0,0.46)' }}
      >
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss transition celebration"
        />

        <Animated.View
          entering={FadeInDown.duration(260).easing(Easing.out(Easing.cubic))}
          exiting={FadeOutDown.duration(220).easing(Easing.in(Easing.cubic))}
          className="w-full max-w-[360px] rounded-3xl border border-border bg-card px-5 pt-5 pb-6"
        >
          <View className="items-center">
            {(isFiring || isFinished) ? (
              <Animated.View style={pulseStyle} className="w-full h-36 rounded-2xl overflow-hidden">
                <Image
                  source={
                    isFiring
                      ? require('../../../../assets/animations/activeOven.gif')
                      : require('../../../../assets/animations/kilnPet.gif')
                  }
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {isFiring && (
                  <View className="absolute top-2 right-2 bg-background/70 rounded-full p-2">
                    <Flame size={14} color={colors.primary} />
                  </View>
                )}
              </Animated.View>
            ) : (
              <Animated.View
                style={pulseStyle}
                className="w-20 h-20 rounded-full items-center justify-center bg-primary/15"
              >
                <StageIcon size={34} color={colors.primary} />
              </Animated.View>
            )}
          </View>

          <Text className="mt-4 text-center text-lg font-serif font-bold text-foreground">{heading}</Text>
          <Text className="mt-1 text-center text-xs font-semibold uppercase tracking-wide text-primary">
            {subtitle}
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {getStageCopy(transition.toStage)}
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}