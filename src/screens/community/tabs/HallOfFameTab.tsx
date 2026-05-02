// src/screens/community/tabs/HallOfFameTab.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
    apiGetHallOfFame,
    type BackendHallOfFameEntry,
} from '@/src/services/community';
import { useAppStore } from '@/src/store';
import { Crown, Star, Trophy } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

// ─── Medal config ──────────────────────────────────────────────────────────────

const MEDALS = [
  { color: '#D97706', bg: '#FFFBEB', border: '#F59E0B' }, // gold
  { color: '#6B7280', bg: '#F9FAFB', border: '#9CA3AF' }, // silver
  { color: '#92400E', bg: '#FEF3C7', border: '#B45309' }, // bronze
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EntrySkeleton() {
  return (
    <View className="flex-row items-center gap-3 py-3 px-4 border-b border-border/40">
      <View className="w-6 h-6 rounded bg-muted" />
      <View className="w-9 h-9 rounded-full bg-muted" />
      <View className="flex-1 gap-1.5">
        <View className="h-3 w-24 rounded bg-muted" />
        <View className="h-2.5 w-36 rounded bg-muted" />
      </View>
      <View className="w-8 h-5 rounded-full bg-muted" />
    </View>
  );
}

// ─── Podium entry (top 3) ─────────────────────────────────────────────────────

const PODIUM_HEIGHTS = [96, 68, 50]; // 1st, 2nd, 3rd
const AVATAR_SIZES  = [64, 48, 44];

function PodiumEntry({
  entry,
  rank,
}: {
  entry: BackendHallOfFameEntry;
  rank: number;
}) {
  const idx     = rank - 1;
  const medal   = MEDALS[idx];
  const isFirst = rank === 1;
  const avatarSize = AVATAR_SIZES[idx] ?? 44;
  const podiumH    = PODIUM_HEIGHTS[idx] ?? 44;

  return (
    <View className="flex-1 items-center">
      {/* Crown above 1st */}
      {isFirst ? (
        <Crown size={20} color={medal.border} style={{ marginBottom: 4 }} />
      ) : (
        <View style={{ height: 24 }} />
      )}

      {/* Avatar */}
      <View
        className="rounded-full items-center justify-center"
        style={{
          width: avatarSize,
          height: avatarSize,
          backgroundColor: medal.bg,
          borderWidth: 2.5,
          borderColor: medal.border,
        }}
      >
        <Text
          className="font-black"
          style={{ fontSize: isFirst ? 20 : 14, color: medal.color }}
        >
          {getInitials(entry.name)}
        </Text>
      </View>

      {/* Name */}
      <Text
        className="font-semibold text-center mt-2 leading-tight text-foreground"
        style={{ fontSize: isFirst ? 13 : 11, maxWidth: 90 }}
        numberOfLines={2}
      >
        {entry.name}
      </Text>

      {/* Win pill */}
      <View
        className="rounded-full px-2 py-0.5 mt-1"
        style={{ backgroundColor: `${medal.border}30` }}
      >
        <Text className="text-xs font-bold" style={{ color: medal.color }}>
          {entry.challenge_wins}W
        </Text>
      </View>

      {/* Podium base */}
      <View
        className="w-full rounded-t-xl items-center justify-center mt-3"
        style={{ height: podiumH, backgroundColor: `${medal.border}28` }}
      >
        <Text
          className="font-black"
          style={{ fontSize: isFirst ? 30 : 22, color: `${medal.border}99` }}
        >
          {rank}
        </Text>
      </View>
    </View>
  );
}

// ─── Runner-up row (4th+) ─────────────────────────────────────────────────────

function RankRow({ entry, rank }: { entry: BackendHallOfFameEntry; rank: number }) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <Text className="text-sm font-bold text-muted-foreground w-5 text-right">
        {rank}
      </Text>

      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: 'hsl(25 30% 90%)' }}
      >
        <Text className="text-xs font-bold" style={{ color: 'hsl(25 40% 45%)' }}>
          {getInitials(entry.name)}
        </Text>
      </View>

      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{entry.name}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          {entry.piece_count} pieces · {Math.round(entry.survival_rate)}% survival
        </Text>
      </View>

      <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: '#FEF3C7' }}>
        <Text className="text-xs font-bold" style={{ color: '#92400E' }}>
          {entry.challenge_wins}W
        </Text>
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HallOfFameTab() {
  const sessionToken = useAppStore((s) => s.sessionToken)!;

  const [entries, setEntries] = useState<BackendHallOfFameEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGetHallOfFame(sessionToken);
      setEntries(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Hall of Fame');
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => { load(); }, [load]);

  const top3 = entries.slice(0, 3);
  const rest  = entries.slice(3);

  // Classic podium order: 2nd left, 1st centre, 3rd right
  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : [...top3];
  const podiumRanks = top3.length >= 3 ? [2, 1, 3] : top3.map((_, i) => i + 1);

  return (
    <>
      {/* ── Hero banner ── */}
      <View
        className="rounded-3xl p-5 overflow-hidden"
        style={{ backgroundColor: '#FFFBEB' }}
      >
        {/* Decorative stars */}
        <View className="absolute right-5 top-5 flex-row items-center gap-1.5">
          <Star size={8}  color="#F59E0B" fill="#F59E0B" />
          <Star size={14} color="#F59E0B" fill="#F59E0B" />
          <Star size={10} color="#F59E0B" fill="#F59E0B" />
        </View>

        <View className="flex-row items-center gap-2 mb-2">
          <Trophy size={17} color="#D97706" />
          <Text className="text-xs font-bold tracking-widest uppercase" style={{ color: '#D97706' }}>
            All-Time Rankings
          </Text>
        </View>
        <Text className="text-2xl font-bold text-foreground">Hall of Fame</Text>
        <Text className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Top potters ranked by challenge victories, updated daily.
        </Text>
      </View>

      {/* ── Loading ── */}
      {isLoading && (
        <Card className="py-2 px-0 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => <EntrySkeleton key={i} />)}
        </Card>
      )}

      {/* ── Error ── */}
      {!isLoading && error && (
        <Card className="p-5 items-center gap-3">
          <Text className="text-sm text-muted-foreground text-center">{error}</Text>
          <TouchableOpacity
            onPress={load}
            className="px-5 py-2 rounded-xl bg-primary"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* ── Empty ── */}
      {!isLoading && !error && entries.length === 0 && (
        <Card className="p-6 items-center gap-2">
          <Trophy size={32} color="#D97706" />
          <Text className="text-sm font-semibold text-foreground text-center mt-1">
            No entries yet
          </Text>
          <Text className="text-xs text-muted-foreground text-center leading-relaxed">
            Complete a challenge to appear in the Hall of Fame.
          </Text>
        </Card>
      )}

      {/* ── Podium (top 3) ── */}
      {!isLoading && !error && top3.length > 0 && (
        <View>
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Top Potters
          </Text>
          <View
            className="rounded-3xl overflow-hidden px-3 pt-3"
            style={{ backgroundColor: '#FEF9EC' }}
          >
            <View className="flex-row items-end gap-1">
              {podiumOrder.map((entry, i) =>
                entry ? (
                  <PodiumEntry key={entry.id} entry={entry} rank={podiumRanks[i]} />
                ) : null,
              )}
            </View>
          </View>
        </View>
      )}

      {/* ── Runners up (4th+) ── */}
      {!isLoading && !error && rest.length > 0 && (
        <View>
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Runners Up
          </Text>
          <Card className="px-4 py-0">
            {rest.map((entry, i) => (
              <RankRow key={entry.id} entry={entry} rank={i + 4} />
            ))}
          </Card>
        </View>
      )}
    </>
  );
}

