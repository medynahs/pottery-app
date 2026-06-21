import { ModalCard, ModalShell, useModalSheetHeight } from '@/src/components/AppSheets';
import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, ScrollText, Sparkles, X } from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Piece } from '../../../types/pieces';

interface CemeterySacrificeModalProps {
  piece: Piece | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (pieceId: number, memorial: { epitaph?: string; causeOfDeath?: string }) => void;
}

function MemorialField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-muted-foreground mb-2">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8F8378"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground"
        style={multiline ? { minHeight: 104 } : undefined}
      />
    </View>
  );
}

export function CemeterySacrificeModal({
  piece,
  visible,
  onClose,
  onConfirm,
}: CemeterySacrificeModalProps) {
  const sheetHeight = useModalSheetHeight(0.92);
  const [epitaph, setEpitaph] = React.useState('');
  const [causeOfDeath, setCauseOfDeath] = React.useState('');
  const [isAnimating, setIsAnimating] = React.useState(false);
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const sigilScale = React.useRef(new Animated.Value(0.8)).current;
  const sigilGlow = React.useRef(new Animated.Value(0)).current;
  const offeringLift = React.useRef(new Animated.Value(0)).current;
  const sparkleSpin = React.useRef(new Animated.Value(0)).current;
  const sacrificeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAnimation = React.useCallback(() => {
    if (sacrificeTimer.current) {
      clearTimeout(sacrificeTimer.current);
      sacrificeTimer.current = null;
    }
    overlayOpacity.setValue(0);
    sigilScale.setValue(0.8);
    sigilGlow.setValue(0);
    offeringLift.setValue(0);
    sparkleSpin.setValue(0);
    setIsAnimating(false);
  }, [offeringLift, overlayOpacity, sigilGlow, sigilScale, sparkleSpin]);

  React.useEffect(() => {
    if (visible && piece) {
      setEpitaph(piece.epitaph ?? '');
      setCauseOfDeath(piece.causeOfDeath ?? '');
      resetAnimation();
    }

    if (!visible) {
      resetAnimation();
    }
  }, [piece, resetAnimation, visible]);

  React.useEffect(() => () => resetAnimation(), [resetAnimation]);

  if (!piece) return null;

  const spin = sparkleSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleClose = () => {
    if (isAnimating) return;
    onClose();
  };

  const handleConfirm = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(sigilScale, {
          toValue: 1.08,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.spring(sigilScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(sigilGlow, {
        toValue: 1,
        duration: 720,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(offeringLift, {
          toValue: -18,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(offeringLift, {
          toValue: -6,
          duration: 260,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(sparkleSpin, {
        toValue: 1,
        duration: 950,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    sacrificeTimer.current = setTimeout(() => {
      onConfirm(piece.id, {
        epitaph: epitaph.trim() || undefined,
        causeOfDeath: causeOfDeath.trim() || undefined,
      });
    }, 1050);
  };

  const pieceImage = piece.photo ?? piece.imgUrl;
  const suggestedCause = piece.status ? `Perhaps: ${piece.status}` : 'Tell the pottery gods what happened.';

  return (
    <ModalShell
      visible={visible}
      onClose={handleClose}
      overlay={
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: overlayOpacity,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(16, 10, 7, 0.74)',
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: sigilScale }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                width: 220,
                height: 220,
                borderRadius: 999,
                backgroundColor: 'rgba(211, 146, 83, 0.26)',
                opacity: sigilGlow,
                transform: [{ scale: sigilGlow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) }],
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                transform: [{ rotate: spin }],
              }}
            >
              <Sparkles size={140} color="rgba(255, 214, 163, 0.75)" />
            </Animated.View>
            <Animated.View style={{ transform: [{ translateY: offeringLift }] }}>
              <View
                style={{
                  width: 156,
                  height: 156,
                  borderRadius: 999,
                  backgroundColor: 'rgba(68, 40, 24, 0.95)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 219, 174, 0.28)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-6xl">🪦</Text>
              </View>
            </Animated.View>
          </Animated.View>
          <Text className="font-serif text-3xl text-white mt-10 mb-2">
            The offering has been accepted.
          </Text>
          <Text className="text-sm text-white/75 text-center px-10 leading-6">
            The pottery gods nod solemnly and add {piece.name} to the sacred cemetery ledger.
          </Text>
        </Animated.View>
      }
    >
      <ModalCard height={sheetHeight} maxHeight={sheetHeight}>
        <View className="bg-background rounded-t-3xl overflow-hidden flex-1">
            <LinearGradient
              colors={['#513325', '#8A5331', '#D1975F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 22 }}
            >
              <View className="flex-row items-start justify-between mb-5">
                <View className="flex-1 pr-4">
                  <Text className="text-[11px] font-bold uppercase tracking-[2px] text-white/70 mb-2">
                    Final Offering
                  </Text>
                  <Text className="font-serif text-[28px] leading-8 text-white">
                    Did the pottery gods demand this piece as sacrifice?
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={isAnimating}
                  activeOpacity={0.75}
                  className="w-9 h-9 rounded-full bg-white/15 items-center justify-center"
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center gap-4">
                <View className="w-20 h-20 rounded-3xl overflow-hidden bg-black/15 items-center justify-center">
                  {pieceImage ? (
                    <Image source={{ uri: pieceImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Text className="text-4xl">🏺</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-serif text-white" numberOfLines={1}>
                    {piece.name}
                  </Text>
                  <Text className="text-sm text-white/78 mt-1">
                    {piece.clay}{piece.status ? ` · ${piece.status}` : ''}
                  </Text>
                  <View className="self-start mt-3 rounded-full px-3 py-1 bg-black/18 flex-row items-center gap-2">
                    <Flame size={12} color="#FFD39B" />
                    <Text className="text-[11px] font-medium text-white/92">
                      One last rite before the cemetery
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <ScrollView
              className="px-6"
              contentContainerStyle={{ paddingTop: 22, paddingBottom: 22 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="rounded-3xl border border-border bg-card px-4 py-4 mb-5">
                <View className="flex-row items-start gap-3">
                  <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center mt-0.5">
                    <Sparkles size={18} color="hsl(39 57% 51%)" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      Make it dramatic.
                    </Text>
                    <Text className="text-sm leading-6 text-muted-foreground">
                      Give the fallen piece an epitaph, record its cause of death, and then let the gods decide whether the kiln smoke carries it onward.
                    </Text>
                  </View>
                </View>
              </View>

              <MemorialField
                label="Epitaph"
                placeholder="Gone too soon, but gloriously glazed."
                value={epitaph}
                onChangeText={setEpitaph}
              />

              <MemorialField
                label="Cause Of Death"
                placeholder="Cracked in the bisque after an overconfident trim session..."
                value={causeOfDeath}
                onChangeText={setCauseOfDeath}
                multiline
              />

              <Text className="text-xs text-muted-foreground mb-5">
                {suggestedCause}
              </Text>

              <View className="rounded-[28px] overflow-hidden border border-border bg-card">
                <LinearGradient
                  colors={['rgba(209,151,95,0.16)', 'rgba(81,51,37,0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 18 }}
                >
                  <View className="flex-row items-center gap-2 mb-3">
                    <ScrollText size={15} color="hsl(24 20% 35%)" />
                    <Text className="text-xs font-bold uppercase tracking-[1.8px] text-muted-foreground">
                      Memorial Plaque Preview
                    </Text>
                  </View>
                  <Text className="font-serif text-xl text-foreground mb-2">
                    {piece.name}
                  </Text>
                  <Text className="font-display italic text-base leading-6 text-foreground/80 mb-3">
                    “{epitaph.trim() || 'Awaiting final words.'}”
                  </Text>
                  <Text className="text-sm text-muted-foreground leading-6">
                    {causeOfDeath.trim() || 'Cause of death still under divine review.'}
                  </Text>
                </LinearGradient>
              </View>
            </ScrollView>

            <View className="px-6 pt-4 pb-10 border-t border-border flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl"
                onPress={handleClose}
                disabled={isAnimating}
              >
                <Text>Mercy</Text>
              </Button>
              <Button
                className="flex-1 rounded-2xl bg-primary"
                onPress={handleConfirm}
                disabled={isAnimating}
              >
                <Text>Yes, offer it up</Text>
              </Button>
            </View>
        </View>
      </ModalCard>
    </ModalShell>
  );
}