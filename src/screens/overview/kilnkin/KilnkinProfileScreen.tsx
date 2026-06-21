import { Text } from '@/src/components/ui/text';
import { getKilnkinProfilePreviews } from '@/src/screens/overview/kilnkin/kilnkinVoice';
import { useVisiblePieces, useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { BellRing, FlaskConical, MoonStar, PawPrint, Scroll, Soup } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Palette ────────────────────────────────────────────────────────────────
const BG = '#1c1208';
const PANEL = '#2e1e0f';
const BORDER = '#6b3f1a';
const BORDER_LIGHT = '#8a5230';
const TEXT_CREAM = '#f0dcc0';
const TEXT_MUTED = '#9a7055';
const TEXT_GOLD = '#d4a055';
const ACCENT = '#c8763a';

type ProfileTab = 'bond' | 'traits' | 'voice';

function getKilnkinMood(hasKilnReady: boolean, hasReclaimOverflow: boolean, personalityLabel: string) {
  if (hasKilnReady) return `${personalityLabel} · watching the kiln glow`;
  if (hasReclaimOverflow) return `${personalityLabel} · nosing the reclaim bucket`;
  return `${personalityLabel} · keeping the studio company`;
}

function formatBornDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TraitCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={{ flex: 1, minWidth: '46%', backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 12, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {icon}
        <Text style={{ color: TEXT_GOLD, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      </View>
      <Text style={{ color: TEXT_CREAM, fontSize: 12, lineHeight: 18 }}>{value}</Text>
    </View>
  );
}

export default function KilnkinProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pieces = useVisiblePieces();
  const companion = useAppStore((state) => state.kilnkinCompanion);

  const [activeTab, setActiveTab] = useState<ProfileTab>('bond');

  const kilnReady = pieces.some((piece) => ['bone-dry', 'glaze-fired'].includes(piece.stage));
  const reclaimOverflow = pieces.filter((piece) => piece.stage === 'trimming').length >= 3;

  const personalityLabel = useMemo(() => {
    switch (companion.personality) {
      case 'fire': return 'Fiery';
      case 'air': return 'Breezy';
      case 'water': return 'Calm';
      case 'earth': default: return 'Grounded';
    }
  }, [companion.personality]);

  const mood = useMemo(
    () => getKilnkinMood(kilnReady, reclaimOverflow, personalityLabel),
    [kilnReady, personalityLabel, reclaimOverflow],
  );

  const notificationPreviews = useMemo(
    () => getKilnkinProfilePreviews(companion),
    [companion],
  );

  const bondedOn = formatBornDate(companion.bornOn);
  const daysActive = Math.max(1, Math.round((Date.now() - new Date(companion.bornOn).getTime()) / 86400000));

  const TABS: { key: ProfileTab; label: string }[] = [
    { key: 'bond', label: 'Bond Cert.' },
    { key: 'traits', label: 'Traits' },
    { key: 'voice', label: 'Voice' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
      {/* ── Header ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ color: TEXT_CREAM, fontSize: 16, fontWeight: '700', letterSpacing: 0.4 }}>Kilnkin Profile</Text>
        <Pressable onPress={() => router.back()} style={{ backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER_LIGHT, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 }}>
          <Text style={{ color: TEXT_CREAM, fontSize: 13, fontWeight: '600' }}>Done</Text>
        </Pressable>
      </View>

      {/* ── Portrait panel ── */}
      <View style={{ marginHorizontal: 20, marginTop: 4, borderWidth: 1, borderColor: BORDER, borderRadius: 20, overflow: 'hidden', height: 280 }}>
        <Image source={require('../../../../assets/animations/pet.gif')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        {/* Mood overlay */}
        <View style={{ position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(28,18,8,0.72)', borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
          <Text style={{ color: TEXT_GOLD, fontSize: 12 }}>{mood}</Text>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 12, backgroundColor: PANEL, borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' }}>
        {TABS.map((tab, i) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: activeTab === tab.key ? '#3d2410' : 'transparent',
              borderRightWidth: i < TABS.length - 1 ? 1 : 0,
              borderRightColor: BORDER,
            }}
          >
            <Text style={{ color: activeTab === tab.key ? TEXT_GOLD : TEXT_MUTED, fontSize: 12, fontWeight: activeTab === tab.key ? '700' : '400' }}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Tab content ── */}
      <ScrollView style={{ flex: 1, marginHorizontal: 20, marginTop: 10 }} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>

        {activeTab === 'bond' && (
          <View>
            {/* Certificate card */}
            <View style={{ backgroundColor: '#241508', borderWidth: 1.5, borderColor: BORDER_LIGHT, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 12 }}>
              {/* Decorative top rule */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, width: '100%' }}>
                <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
                <Scroll size={14} color={TEXT_GOLD} />
                <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
              </View>

              <Text style={{ color: TEXT_MUTED, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 4 }}>Certificate of Bond</Text>
              <Text style={{ color: TEXT_GOLD, fontSize: 18, fontWeight: '700', letterSpacing: 0.4, marginBottom: 2 }}>{companion.name}</Text>
              <Text style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 18 }}>{companion.species}</Text>

              <View style={{ width: '100%', gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: BORDER }}>
                  <Text style={{ color: TEXT_MUTED, fontSize: 12 }}>Bonded on</Text>
                  <Text style={{ color: TEXT_CREAM, fontSize: 12, fontWeight: '600' }}>{bondedOn}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: BORDER }}>
                  <Text style={{ color: TEXT_MUTED, fontSize: 12 }}>Days together</Text>
                  <Text style={{ color: TEXT_CREAM, fontSize: 12, fontWeight: '600' }}>{daysActive}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: BORDER }}>
                  <Text style={{ color: TEXT_MUTED, fontSize: 12 }}>Personality</Text>
                  <Text style={{ color: TEXT_CREAM, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>{companion.personality}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: TEXT_MUTED, fontSize: 12 }}>Chosen by</Text>
                  <Text style={{ color: TEXT_CREAM, fontSize: 12, fontWeight: '600' }}>You</Text>
                </View>
              </View>

              {/* Decorative bottom rule */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, width: '100%' }}>
                <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: BORDER_LIGHT }} />
                <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
              </View>
            </View>

            {/* Lore note */}
            <View style={{ backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 14 }}>
              <Text style={{ color: TEXT_MUTED, fontSize: 12, lineHeight: 20, marginBottom: 6 }}>
                {companion.name} only appears when the studio starts to feel lived in.
              </Text>
              <Text style={{ color: TEXT_MUTED, fontSize: 12, lineHeight: 20 }}>
                They secretly believe every finished piece deserves a story.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'traits' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <TraitCard icon={<FlaskConical size={13} color={ACCENT} />} label="Loves" value={companion.loves} />
            <TraitCard icon={<MoonStar size={13} color="#7a8fc8" />} label="Nap Spot" value={companion.napSpot} />
            <TraitCard icon={<Soup size={13} color="#c8943a" />} label="Snack" value={companion.favoriteSnack} />
            <TraitCard icon={<PawPrint size={13} color={TEXT_MUTED} />} label="Collects" value={companion.collects} />
          </View>
        )}

        {activeTab === 'voice' && (
          <View>
            <View style={{ backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 14, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <BellRing size={14} color={ACCENT} />
                <Text style={{ color: TEXT_GOLD, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>Notification Tone</Text>
              </View>
              <Text style={{ color: TEXT_CREAM, fontSize: 12, lineHeight: 20 }}>
                {companion.name} speaks in a{' '}
                <Text style={{ color: TEXT_GOLD }}>{companion.notificationToneLabel.toLowerCase()}</Text> tone.
              </Text>
            </View>
            {notificationPreviews.map((preview, index) => (
              <View key={`${companion.id}-${index}`} style={{ backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 }}>
                <Text style={{ color: TEXT_CREAM, fontSize: 12, lineHeight: 20 }}>"{preview}"</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}
