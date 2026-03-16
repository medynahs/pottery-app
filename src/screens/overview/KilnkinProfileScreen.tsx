import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { getKilnkinVoiceLine } from '@/src/screens/overview/kilnkinCompanion';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { BellRing, Heart, MoonStar, PawPrint, Soup, Sparkles, Star } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function getKilnkinMood(hasKilnReady: boolean, hasReclaimOverflow: boolean, personalityLabel: string) {
  if (hasKilnReady) return `${personalityLabel} and watching the kiln glow`;
  if (hasReclaimOverflow) return `${personalityLabel} and nosing around the reclaim bucket`;
  return `${personalityLabel} and keeping the studio company`;
}

function formatBornDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function KilnkinProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pieces = useAppStore((state) => state.pieces);
  const companion = useAppStore((state) => state.kilnkinCompanion);

  const kilnReady = pieces.some((piece) => ['bone-dry', 'glaze-fired'].includes(piece.stage));
  const reclaimOverflow = pieces.filter((piece) => piece.stage === 'trimming').length >= 3;

  const personalityLabel = useMemo(() => {
    switch (companion.personality) {
      case 'playful':
        return 'Bouncy';
      case 'steady':
        return 'Grounded';
      case 'gentle':
      default:
        return 'Tender';
    }
  }, [companion.personality]);

  const mood = useMemo(
    () => getKilnkinMood(kilnReady, reclaimOverflow, personalityLabel),
    [kilnReady, personalityLabel, reclaimOverflow]
  );

  const notificationPreviews = useMemo(
    () => [
      getKilnkinVoiceLine(companion, 'your trimming window looks just right today.'),
      getKilnkinVoiceLine(companion, 'a firing check might be worth a peek this afternoon.'),
      getKilnkinVoiceLine(companion, 'tomorrow has a planned studio event waiting for you.'),
    ],
    [companion]
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            {companion.name}
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">Your kilnkin companion and notification voice</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-muted px-4 py-2 rounded-full">
          <Text className="text-sm font-medium text-foreground">Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 mt-4" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <Card className="rounded-3xl border-border bg-card p-5 mb-4 items-center">
          <View className="w-28 h-28 rounded-full bg-amber-50 border border-amber-100 items-center justify-center mb-3 overflow-hidden">
            <Image source={require('../../../assets/images/clay-pet.png')} style={{ width: 84, height: 84 }} resizeMode="contain" />
          </View>
          <Text className="text-2xl font-serif font-bold text-foreground">{companion.name}</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {companion.species} · Born {formatBornDate(companion.bornOn)}
          </Text>
          <View className="mt-3 rounded-full border border-border bg-background px-3 py-1.5">
            <Text className="text-xs text-foreground">Chosen during onboarding</Text>
          </View>
          <View className="mt-3 rounded-full border border-border bg-background px-3 py-1.5">
            <Text className="text-xs text-foreground">{mood}</Text>
          </View>
        </Card>

        <View className="flex-row flex-wrap gap-3 mb-4">
          <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
            <View className="flex-row items-center gap-2 mb-2">
              <Heart size={16} color="hsl(0 75% 62%)" />
              <Text className="text-sm font-medium text-foreground">Loves</Text>
            </View>
            <Text className="text-xs text-muted-foreground">{companion.loves}.</Text>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
            <View className="flex-row items-center gap-2 mb-2">
              <MoonStar size={16} color="hsl(220 40% 48%)" />
              <Text className="text-sm font-medium text-foreground">Nap Spot</Text>
            </View>
            <Text className="text-xs text-muted-foreground">{companion.napSpot}.</Text>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
            <View className="flex-row items-center gap-2 mb-2">
              <Soup size={16} color="hsl(35 70% 46%)" />
              <Text className="text-sm font-medium text-foreground">Favorite Snack</Text>
            </View>
            <Text className="text-xs text-muted-foreground">{companion.favoriteSnack}.</Text>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
            <View className="flex-row items-center gap-2 mb-2">
              <PawPrint size={16} color="hsl(24 35% 40%)" />
              <Text className="text-sm font-medium text-foreground">Collects</Text>
            </View>
            <Text className="text-xs text-muted-foreground">{companion.collects}.</Text>
          </Card>
        </View>

        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Sparkles size={16} color="hsl(270 55% 52%)" />
            <Text className="text-base font-serif font-bold text-foreground">Little Facts</Text>
          </View>
          <Text className="text-sm text-muted-foreground mb-2">{companion.name} only appears when the studio starts to feel lived in.</Text>
          <Text className="text-sm text-muted-foreground mb-2">Their personality shapes how reminders and nudges sound across the app.</Text>
          <Text className="text-sm text-muted-foreground">They secretly believe every finished piece deserves a story.</Text>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <BellRing size={16} color="hsl(30 72% 44%)" />
            <Text className="text-base font-serif font-bold text-foreground">Notification Voice</Text>
          </View>
          <Text className="text-sm text-muted-foreground mb-3">
            {companion.name} speaks in a {companion.notificationToneLabel.toLowerCase()} tone.
          </Text>
          {notificationPreviews.map((preview) => (
            <View key={preview} className="rounded-2xl bg-background border border-border px-3 py-2 mb-2 last:mb-0">
              <Text className="text-xs text-foreground leading-5">{preview}</Text>
            </View>
          ))}
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Star size={16} color="hsl(44 70% 48%)" />
            <Text className="text-base font-serif font-bold text-foreground">Today</Text>
          </View>
          <Text className="text-sm text-muted-foreground mb-3">
            {companion.name} notices the small shifts in your studio and turns them into calm daily nudges.
          </Text>
          <Button variant="outline" size="sm" className="self-start rounded-xl px-4" onPress={() => router.push('/overview-missions')}>
            <Text className="text-sm">See Today Missions</Text>
          </Button>
        </Card>
      </ScrollView>
    </View>
  );
}
