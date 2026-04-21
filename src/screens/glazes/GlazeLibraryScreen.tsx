import { ConfirmSheet, ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Droplets,
  Search,
  Star,
  X,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GLAZE_APPLICATION_METHOD_LABELS,
  GLAZE_DEFECT_LABELS,
  GLAZE_FINISH_LABELS,
  GLAZE_FINISH_OPTIONS,
  GLAZE_KILN_TYPE_LABELS,
  GLAZE_RESULT_LABELS,
  GLAZE_SOURCE_LABELS,
  GLAZE_THICKNESS_LABELS,
  type GlazeDefect,
  type GlazeFinish,
  type GlazeLibraryItem,
  type GlazeResultRating,
  type GlazeTestTile,
} from './types';

type SortKey = 'recent' | 'name' | 'tests';
type ViewMode = 'grid' | 'list';

function formatRelativeDate(value?: string) {
  if (!value) return 'Never tested';
  const target = new Date(value).getTime();
  const now = Date.now();
  const diffDays = Math.max(0, Math.floor((now - target) / 86_400_000));
  if (diffDays === 0) return 'Tested today';
  if (diffDays === 1) return 'Tested yesterday';
  if (diffDays < 7) return `Tested ${diffDays} days ago`;
  if (diffDays < 30) return `Tested ${Math.floor(diffDays / 7)} weeks ago`;
  return `Tested ${Math.floor(diffDays / 30)} months ago`;
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function glazeColor(colorFamily: string) {
  const normalized = colorFamily.trim().toLowerCase();
  if (normalized.includes('blue')) return '#9EC5D6';
  if (normalized.includes('green') || normalized.includes('mint')) return '#AFC9A1';
  if (normalized.includes('honey') || normalized.includes('brown') || normalized.includes('amber')) return '#D8B17B';
  if (normalized.includes('red') || normalized.includes('iron')) return '#C27A67';
  if (normalized.includes('white') || normalized.includes('cream')) return '#E8DFC9';
  return '#C7B8A3';
}

function buildStats(glazes: GlazeLibraryItem[], glazeTests: GlazeTestTile[]) {
  return glazes.reduce<Record<string, {
    tests: number;
    great: number;
    interesting: number;
    topClay?: string;
    topMethod?: string;
    running: number;
  }>>((accumulator, glaze) => {
    const tests = glazeTests.filter((test) => test.glazeId === glaze.id);
    const clayCounts = new Map<string, number>();
    const methodCounts = new Map<string, number>();
    let great = 0;
    let interesting = 0;
    let running = 0;

    tests.forEach((test) => {
      clayCounts.set(test.clayBody, (clayCounts.get(test.clayBody) ?? 0) + 1);
      methodCounts.set(test.applicationMethod, (methodCounts.get(test.applicationMethod) ?? 0) + 1);
      if (test.resultRating === 'great') great += 1;
      if (test.resultRating === 'interesting') interesting += 1;
      if (test.defects.includes('running')) running += 1;
    });

    const topClay = Array.from(clayCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topMethod = Array.from(methodCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

    accumulator[glaze.id] = {
      tests: tests.length,
      great,
      interesting,
      topClay,
      topMethod,
      running,
    };
    return accumulator;
  }, {});
}

function glazeObservation(stats?: { tests: number; great: number; topClay?: string; topMethod?: string; running: number }) {
  if (!stats || stats.tests === 0) return 'No test history yet. Start with one tile.';
  if (stats.running >= 2) return 'Observation: this one tends to run in your tests.';
  if (stats.great >= 2 && stats.topClay) return `Observation: strongest so far on ${stats.topClay}.`;
  if (stats.topMethod && stats.tests >= 2) return `Observation: you usually get results by ${stats.topMethod}.`;
  return 'Observation: still learning this glaze in your studio.';
}

function findTopValue(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function findTopDefect(tests: GlazeTestTile[]) {
  const defects = tests.flatMap((test) => test.defects);
  return findTopValue(defects) as GlazeDefect | undefined;
}

function summarizeGlazeTests(tests: GlazeTestTile[]) {
  const greatCount = tests.filter((test) => test.resultRating === 'great').length;
  const interestingCount = tests.filter((test) => test.resultRating === 'interesting').length;
  const layeredCount = tests.filter((test) => test.layeredWith.length > 0).length;

  return {
    greatCount,
    interestingCount,
    layeredCount,
    successRate: tests.length > 0 ? Math.round((greatCount / tests.length) * 100) : 0,
    favoriteClayBody: findTopValue(tests.map((test) => test.clayBody)),
    favoriteMethod: findTopValue(tests.map((test) => test.applicationMethod)),
    favoriteCone: findTopValue(tests.map((test) => test.cone)),
    favoriteKiln: findTopValue(tests.map((test) => test.kilnName || (test.kilnType ? GLAZE_KILN_TYPE_LABELS[test.kilnType] : 'Unknown kiln'))),
    topDefect: findTopDefect(tests),
  };
}

function buildGlazeSignals(tests: GlazeTestTile[]) {
  const summary = summarizeGlazeTests(tests);
  const signals: string[] = [];

  if (summary.greatCount >= 2 && summary.favoriteClayBody) {
    signals.push(`Strongest so far on ${summary.favoriteClayBody}.`);
  }
  if (summary.favoriteMethod && tests.length >= 2) {
    signals.push(`Your best results usually come from ${GLAZE_APPLICATION_METHOD_LABELS[summary.favoriteMethod as GlazeTestTile['applicationMethod']].toLowerCase()} application.`);
  }
  if (summary.topDefect) {
    signals.push(`Main studio risk: ${GLAZE_DEFECT_LABELS[summary.topDefect].toLowerCase()}.`);
  }
  if (summary.layeredCount > 0) {
    signals.push(`Layering shows up in ${summary.layeredCount} of ${tests.length} tests.`);
  }
  if (signals.length === 0 && summary.favoriteCone) {
    signals.push(`Most of your testing with this glaze lands at ${summary.favoriteCone}.`);
  }
  if (signals.length === 0) {
    signals.push('No stable pattern yet. Keep logging clay, cone, method, and thickness.');
  }

  return signals.slice(0, 3);
}

function resultPillClasses(result: GlazeResultRating) {
  if (result === 'great') {
    return { container: 'bg-green-50 border-green-100', label: 'text-green-700' };
  }
  if (result === 'bad') {
    return { container: 'bg-rose-50 border-rose-100', label: 'text-rose-700' };
  }
  return { container: 'bg-amber-50 border-amber-100', label: 'text-amber-700' };
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      className={`px-3 py-2 rounded-full border ${active ? 'bg-foreground border-foreground' : 'bg-card border-border'}`}
    >
      <Text className={`text-xs font-medium ${active ? 'text-background' : 'text-muted-foreground'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function GlazeLibraryScreen({ collectionFilter }: { collectionFilter?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((state) => state.glazes);
  const glazeTests = useAppStore((state) => state.glazeTests);
  const updateGlaze = useAppStore((state) => state.updateGlaze);
  const toggleFavoriteGlaze = useAppStore((state) => state.toggleFavoriteGlaze);
  const deleteGlazeTest = useAppStore((state) => state.deleteGlazeTest);

  const [search, setSearch] = React.useState('');
  const [finishFilter, setFinishFilter] = React.useState<'all' | GlazeFinish>('all');
  const [favoriteOnly, setFavoriteOnly] = React.useState(false);
  const [productionOnly, setProductionOnly] = React.useState(false);
  const [sortKey, setSortKey] = React.useState<SortKey>('recent');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showAdvancedControls, setShowAdvancedControls] = React.useState(false);
  const [selectedGlazeId, setSelectedGlazeId] = React.useState<string | null>(null);
  const [pendingRemoveTest, setPendingRemoveTest] = React.useState<GlazeTestTile | null>(null);

  React.useEffect(() => {
    if (selectedGlazeId && !glazes.some((glaze) => glaze.id === selectedGlazeId)) {
      setSelectedGlazeId(null);
    }
  }, [glazes, selectedGlazeId]);

  const statsByGlaze = React.useMemo(() => buildStats(glazes, glazeTests), [glazes, glazeTests]);

  const filteredGlazes = React.useMemo(() => {
    const result = glazes.filter((glaze) => {
      const matchesCollection = !collectionFilter || glaze.collections.includes(collectionFilter);
      const matchesSearch =
        search.trim() === '' ||
        glaze.name.toLowerCase().includes(search.toLowerCase()) ||
        glaze.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())) ||
        glaze.collections.some((c) => c.toLowerCase().includes(search.toLowerCase()));
      const matchesFinish = finishFilter === 'all' || glaze.finish === finishFilter;
      const matchesFavorite = !favoriteOnly || glaze.favorite;
      const matchesProduction = !productionOnly || glaze.production;
      return matchesCollection && matchesSearch && matchesFinish && matchesFavorite && matchesProduction;
    });

    switch (sortKey) {
      case 'name':
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case 'tests':
        return result.sort((a, b) => (statsByGlaze[b.id]?.tests ?? 0) - (statsByGlaze[a.id]?.tests ?? 0));
      case 'recent':
      default:
        return result.sort(
          (a, b) =>
            new Date(b.lastTestedAt ?? b.createdAt).getTime() -
            new Date(a.lastTestedAt ?? a.createdAt).getTime(),
        );
    }
  }, [favoriteOnly, finishFilter, glazes, productionOnly, search, sortKey, statsByGlaze, collectionFilter]);

  const selectedGlaze = React.useMemo(
    () => glazes.find((glaze) => glaze.id === selectedGlazeId),
    [glazes, selectedGlazeId],
  );

  const selectedGlazeTests = React.useMemo(
    () =>
      glazeTests
        .filter((test) => test.glazeId === selectedGlazeId)
        .sort((a, b) => new Date(b.firingDate).getTime() - new Date(a.firingDate).getTime()),
    [glazeTests, selectedGlazeId],
  );

  const selectedGlazeSummary = React.useMemo(
    () => summarizeGlazeTests(selectedGlazeTests),
    [selectedGlazeTests],
  );

  const selectedGlazeSignals = React.useMemo(
    () => buildGlazeSignals(selectedGlazeTests),
    [selectedGlazeTests],
  );

  const handleRemoveTest = React.useCallback((test: GlazeTestTile) => {
    setPendingRemoveTest(test);
  }, []);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ConfirmSheet
        visible={!!pendingRemoveTest}
        title="Remove test tile?"
        body={
          pendingRemoveTest
            ? `This will remove the ${formatShortDate(pendingRemoveTest.firingDate)} entry for ${pendingRemoveTest.glazeNameSnapshot}.`
            : ''
        }
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (pendingRemoveTest) deleteGlazeTest(pendingRemoveTest.id);
          setPendingRemoveTest(null);
        }}
        onCancel={() => setPendingRemoveTest(null)}
      />

      {/* Header */}
      <View className="px-6 pt-4 pb-3 border-b border-border bg-background">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            className="w-9 h-9 rounded-full bg-muted items-center justify-center"
          >
            <ChevronLeft size={20} color="hsl(24 20% 35%)" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-primary">Glaze Atlas</Text>
            <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold', lineHeight: 32 }}>
              {collectionFilter ?? 'All Glazes'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-5">
          {/* Search + filters */}
          <View className="rounded-3xl border border-border bg-card px-4 py-4">
            <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
              <Search size={16} color="hsl(24 20% 40%)" />
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search glaze names, tags…"
                className="flex-1 border-0 bg-transparent px-0"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingTop: 12 }}
            >
              <Pill label="All" active={finishFilter === 'all'} onPress={() => setFinishFilter('all')} />
              {GLAZE_FINISH_OPTIONS.map((option) => (
                <Pill
                  key={option}
                  label={GLAZE_FINISH_LABELS[option]}
                  active={finishFilter === option}
                  onPress={() => setFinishFilter(option)}
                />
              ))}
            </ScrollView>

            <View className="flex-row flex-wrap gap-2 mt-3">
              <Pill label="Favorites" active={favoriteOnly} onPress={() => setFavoriteOnly((v) => !v)} />
              <Pill label="Production" active={productionOnly} onPress={() => setProductionOnly((v) => !v)} />
              <Pill
                label={showAdvancedControls ? 'Hide controls' : 'More controls'}
                active={showAdvancedControls}
                onPress={() => setShowAdvancedControls((v) => !v)}
              />
            </View>

            {showAdvancedControls ? (
              <>
                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4">
                  Sort by
                </Text>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  <Pill label="Recent" active={sortKey === 'recent'} onPress={() => setSortKey('recent')} />
                  <Pill label="A-Z" active={sortKey === 'name'} onPress={() => setSortKey('name')} />
                  <Pill label="Most Tested" active={sortKey === 'tests'} onPress={() => setSortKey('tests')} />
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4">
                  View
                </Text>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  <Pill label="Grid" active={viewMode === 'grid'} onPress={() => setViewMode('grid')} />
                  <Pill label="List" active={viewMode === 'list'} onPress={() => setViewMode('list')} />
                </View>
              </>
            ) : null}
          </View>

          {/* Glaze count header */}
          <View className="mt-7 mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                Glazes
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Profiles, counts, and studio observations
              </Text>
            </View>
            <Text className="text-xs font-semibold text-primary">{filteredGlazes.length} glazes</Text>
          </View>

          {filteredGlazes.length === 0 ? (
            <View className="rounded-[28px] border border-dashed border-border bg-card px-6 py-10 items-center mb-4">
              <Droplets size={28} color="hsl(24 20% 45%)" />
              <Text className="text-lg text-foreground mt-3" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                No glazes here yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-2 leading-6">
                Add your first glaze from the Atlas main screen, then log the first tile.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filteredGlazes.map((glaze) => {
                const stats = statsByGlaze[glaze.id];
                const lastTestLabel = formatRelativeDate(glaze.lastTestedAt);
                const widthStyle = { width: viewMode === 'grid' ? '48%' : '100%' } as const;

                return (
                  <View key={glaze.id} style={widthStyle} className="mb-4">
                    <View className="rounded-[28px] border border-border bg-card overflow-hidden">
                      <View
                        style={{
                          backgroundColor: glazeColor(glaze.colorFamily),
                          minHeight: viewMode === 'grid' ? 138 : 124,
                        }}
                        className="px-4 py-4 justify-between"
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="px-3 py-1 rounded-full bg-white/75 self-start">
                            <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground">
                              {GLAZE_FINISH_LABELS[glaze.finish]}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => toggleFavoriteGlaze(glaze.id)}
                            activeOpacity={0.78}
                            className="w-8 h-8 rounded-full bg-white/70 items-center justify-center"
                          >
                            <Star
                              size={14}
                              color={glaze.favorite ? 'hsl(38 80% 50%)' : 'hsl(24 20% 45%)'}
                              fill={glaze.favorite ? 'hsl(38 80% 50%)' : 'none'}
                            />
                          </TouchableOpacity>
                        </View>

                        <View>
                          <Text
                            className="text-lg text-foreground"
                            style={{ fontFamily: 'Fraunces_600SemiBold' }}
                          >
                            {glaze.name}
                          </Text>
                          <Text className="text-xs text-foreground/70 mt-1">
                            {glaze.colorFamily} · {glaze.coneRange}
                          </Text>
                        </View>
                      </View>

                      <View className="px-4 py-4">
                        <View className="flex-row flex-wrap gap-2 mb-3">
                          <View className="px-2.5 py-1 rounded-full bg-muted/70">
                            <Text className="text-[11px] font-medium text-muted-foreground">
                              {stats?.tests ?? 0} tests
                            </Text>
                          </View>
                          {glaze.production ? (
                            <View className="px-2.5 py-1 rounded-full bg-green-50 border border-green-100">
                              <Text className="text-[11px] font-medium text-green-700">Production</Text>
                            </View>
                          ) : null}
                          <View className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                            <Text className="text-[11px] font-medium text-blue-700">
                              {GLAZE_SOURCE_LABELS[glaze.source]}
                            </Text>
                          </View>
                        </View>

                        {/* Inline success-rate bar — V2: replace with chart library visualization */}
                        {(stats?.tests ?? 0) > 0
                          ? (() => {
                              const total = stats!.tests;
                              const great = stats!.great;
                              const interesting = stats!.interesting;
                              const bad = total - great - interesting;
                              return (
                                <View className="mb-3">
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      height: 5,
                                      borderRadius: 4,
                                      overflow: 'hidden',
                                      gap: 1,
                                    }}
                                  >
                                    {great > 0 && (
                                      <View style={{ flex: great, backgroundColor: 'hsl(100 40% 52%)' }} />
                                    )}
                                    {interesting > 0 && (
                                      <View
                                        style={{ flex: interesting, backgroundColor: 'hsl(38 80% 60%)' }}
                                      />
                                    )}
                                    {bad > 0 && (
                                      <View style={{ flex: bad, backgroundColor: 'hsl(0 50% 70%)' }} />
                                    )}
                                  </View>
                                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                    {great > 0 && (
                                      <Text
                                        style={{
                                          fontSize: 9,
                                          color: 'hsl(100 35% 42%)',
                                          fontWeight: '600',
                                        }}
                                      >
                                        ✓ {great} great
                                      </Text>
                                    )}
                                    {interesting > 0 && (
                                      <Text
                                        style={{
                                          fontSize: 9,
                                          color: 'hsl(38 70% 44%)',
                                          fontWeight: '600',
                                        }}
                                      >
                                        ~ {interesting} interesting
                                      </Text>
                                    )}
                                    {bad > 0 && (
                                      <Text
                                        style={{
                                          fontSize: 9,
                                          color: 'hsl(0 45% 50%)',
                                          fontWeight: '600',
                                        }}
                                      >
                                        ✕ {bad} retry
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              );
                            })()
                          : null}

                        <Text className="text-xs text-muted-foreground">{lastTestLabel}</Text>
                        <Text className="text-xs text-foreground mt-2 leading-5">
                          {glazeObservation(stats)}
                        </Text>

                        {glaze.tags.length > 0 ? (
                          <View className="flex-row flex-wrap gap-2 mt-3">
                            {glaze.tags.slice(0, 3).map((tag) => (
                              <Text key={tag} className="text-[11px] text-primary font-medium">
                                #{tag}
                              </Text>
                            ))}
                          </View>
                        ) : null}

                        <TouchableOpacity
                          onPress={() => setSelectedGlazeId(glaze.id)}
                          activeOpacity={0.8}
                          className="mt-4 rounded-2xl bg-foreground px-4 py-3 items-center justify-center"
                        >
                          <Text className="text-sm font-medium text-background">Open glaze profile</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Glaze profile bottom sheet */}
      <ModalShell
        visible={Boolean(selectedGlaze)}
        onClose={() => setSelectedGlazeId(null)}
        backdropColor="rgba(0,0,0,0.46)"
      >
          {selectedGlaze ? (
            <ModalCard radius={32} maxHeight={780}>
                <View className="px-6 pb-4 border-b border-border flex-row items-start justify-between gap-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-primary mb-2">
                      Glaze Profile
                    </Text>
                    <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
                      {selectedGlaze.name}
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                      {selectedGlaze.colorFamily} · {selectedGlaze.coneRange}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedGlazeId(null)}
                    className="w-9 h-9 rounded-full bg-muted items-center justify-center"
                  >
                    <X size={16} color="hsl(24 20% 40%)" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  className="px-6"
                  contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
                  showsVerticalScrollIndicator={false}
                >
                  <View className="mt-5 rounded-[30px] overflow-hidden border border-border bg-card">
                    <View
                      style={{
                        backgroundColor: glazeColor(selectedGlaze.colorFamily),
                        minHeight: 156,
                      }}
                      className="px-5 py-5 justify-between"
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-row flex-wrap gap-2 flex-1">
                          <View className="px-3 py-1 rounded-full bg-white/75">
                            <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground">
                              {GLAZE_FINISH_LABELS[selectedGlaze.finish]}
                            </Text>
                          </View>
                          <View className="px-3 py-1 rounded-full bg-white/75">
                            <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground">
                              {GLAZE_SOURCE_LABELS[selectedGlaze.source]}
                            </Text>
                          </View>
                          {selectedGlaze.production ? (
                            <View className="px-3 py-1 rounded-full bg-green-50 border border-green-100">
                              <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-green-700">
                                Production
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <TouchableOpacity
                          onPress={() => toggleFavoriteGlaze(selectedGlaze.id)}
                          activeOpacity={0.78}
                          className="w-9 h-9 rounded-full bg-white/75 items-center justify-center"
                        >
                          <Star
                            size={16}
                            color={selectedGlaze.favorite ? 'hsl(38 80% 50%)' : 'hsl(24 20% 45%)'}
                            fill={selectedGlaze.favorite ? 'hsl(38 80% 50%)' : 'none'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row gap-3">
                        <View className="flex-1 rounded-2xl bg-white/72 px-4 py-3">
                          <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground/70">
                            Tests
                          </Text>
                          <Text
                            className="text-2xl text-foreground mt-1"
                            style={{ fontFamily: 'Fraunces_600SemiBold' }}
                          >
                            {selectedGlazeTests.length}
                          </Text>
                        </View>
                        <View className="flex-1 rounded-2xl bg-white/72 px-4 py-3">
                          <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground/70">
                            Success Rate
                          </Text>
                          <Text
                            className="text-2xl text-foreground mt-1"
                            style={{ fontFamily: 'Fraunces_600SemiBold' }}
                          >
                            {selectedGlazeSummary.successRate}%
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="px-5 py-5">
                      <Text className="text-sm text-foreground leading-6">
                        {glazeObservation(statsByGlaze[selectedGlaze.id])}
                      </Text>
                      {selectedGlaze.notes ? (
                        <Text className="text-sm text-muted-foreground leading-6 mt-3">
                          {selectedGlaze.notes}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View className="mt-5 rounded-[28px] border border-amber-200 bg-amber-50 px-4 py-4">
                    <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-amber-700 mb-2">
                      Studio Signals
                    </Text>
                    <View className="gap-2">
                      {selectedGlazeSignals.map((signal) => (
                        <Text key={signal} className="text-sm text-amber-900 leading-6">
                          {signal}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View className="mt-5">
                    <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                      Studio Fit
                    </Text>
                    <View className="flex-row flex-wrap justify-between mt-3">
                      <View className="w-[48%] rounded-[24px] border border-border bg-card px-4 py-4 mb-3">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                          Best clay
                        </Text>
                        <Text
                          className="text-base text-foreground mt-2"
                          style={{ fontFamily: 'Fraunces_600SemiBold' }}
                        >
                          {selectedGlazeSummary.favoriteClayBody ?? 'Still learning'}
                        </Text>
                      </View>
                      <View className="w-[48%] rounded-[24px] border border-border bg-card px-4 py-4 mb-3">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                          Best method
                        </Text>
                        <Text
                          className="text-base text-foreground mt-2"
                          style={{ fontFamily: 'Fraunces_600SemiBold' }}
                        >
                          {selectedGlazeSummary.favoriteMethod
                            ? GLAZE_APPLICATION_METHOD_LABELS[
                                selectedGlazeSummary.favoriteMethod as GlazeTestTile['applicationMethod']
                              ]
                            : 'Still learning'}
                        </Text>
                      </View>
                      <View className="w-[48%] rounded-[24px] border border-border bg-card px-4 py-4">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                          Sweet cone
                        </Text>
                        <Text
                          className="text-base text-foreground mt-2"
                          style={{ fontFamily: 'Fraunces_600SemiBold' }}
                        >
                          {selectedGlazeSummary.favoriteCone ?? 'Still learning'}
                        </Text>
                      </View>
                      <View className="w-[48%] rounded-[24px] border border-border bg-card px-4 py-4">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                          Watch for
                        </Text>
                        <Text
                          className="text-base text-foreground mt-2"
                          style={{ fontFamily: 'Fraunces_600SemiBold' }}
                        >
                          {selectedGlazeSummary.topDefect
                            ? GLAZE_DEFECT_LABELS[selectedGlazeSummary.topDefect]
                            : 'No defect pattern yet'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="mt-2 rounded-[28px] border border-border bg-card px-4 py-4">
                    <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted-foreground mb-2">
                      Context Snapshot
                    </Text>
                    <Text className="text-sm text-foreground leading-6">
                      Kiln used most: {selectedGlazeSummary.favoriteKiln ?? 'Still learning'}
                    </Text>
                    <Text className="text-sm text-foreground leading-6 mt-1">
                      Interesting results: {selectedGlazeSummary.interestingCount}
                    </Text>
                    <Text className="text-sm text-foreground leading-6 mt-1">
                      Layered tests: {selectedGlazeSummary.layeredCount}
                    </Text>
                    {selectedGlaze.applicationNotes ? (
                      <Text className="text-sm text-muted-foreground leading-6 mt-3">
                        Application note: {selectedGlaze.applicationNotes}
                      </Text>
                    ) : null}
                  </View>

                  <View className="mt-5 flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => updateGlaze({ ...selectedGlaze, production: !selectedGlaze.production })}
                      activeOpacity={0.82}
                      className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 items-center justify-center"
                    >
                      <Text className="text-sm font-semibold text-foreground">
                        {selectedGlaze.production ? 'Remove Production' : 'Mark Production'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="mt-7 mb-3 flex-row items-center justify-between">
                    <View>
                      <Text
                        className="text-xl text-foreground"
                        style={{ fontFamily: 'Fraunces_600SemiBold' }}
                      >
                        Test Timeline
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1">
                        Every firing teaches this glaze who it is in your studio.
                      </Text>
                    </View>
                    <Text className="text-xs font-semibold text-primary">
                      {selectedGlazeTests.length} entries
                    </Text>
                  </View>

                  {selectedGlazeTests.length > 0 ? (
                    selectedGlazeTests.map((test) => {
                      const resultTone = resultPillClasses(test.resultRating);
                      return (
                        <View
                          key={test.id}
                          className="rounded-[28px] border border-border bg-card px-4 py-4 mb-3"
                        >
                          <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1 pr-2">
                              <Text
                                className="text-base text-foreground"
                                style={{ fontFamily: 'Fraunces_600SemiBold' }}
                              >
                                {formatShortDate(test.firingDate)}
                              </Text>
                              <Text className="text-sm text-muted-foreground mt-1">
                                {test.clayBody} · {test.cone}
                              </Text>
                            </View>
                            <View className={`px-3 py-1 rounded-full border ${resultTone.container}`}>
                              <Text
                                className={`text-[11px] font-semibold uppercase tracking-[1.2px] ${resultTone.label}`}
                              >
                                {GLAZE_RESULT_LABELS[test.resultRating]}
                              </Text>
                            </View>
                          </View>

                          <Text className="text-sm text-foreground mt-3">
                            {GLAZE_APPLICATION_METHOD_LABELS[test.applicationMethod]} ·{' '}
                            {GLAZE_THICKNESS_LABELS[test.thickness]} ·{' '}
                            {test.kilnName ||
                              (test.kilnType
                                ? GLAZE_KILN_TYPE_LABELS[test.kilnType]
                                : 'Unknown kiln')}
                          </Text>

                          {test.layeredWith.length > 0 ? (
                            <Text className="text-sm text-muted-foreground mt-2">
                              Layered with: {test.layeredWith.join(', ')}
                            </Text>
                          ) : null}

                          {test.defects.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2 mt-3">
                              {test.defects.map((defect) => (
                                <View
                                  key={defect}
                                  className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100"
                                >
                                  <Text className="text-[11px] font-medium text-rose-700">
                                    {GLAZE_DEFECT_LABELS[defect]}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ) : null}

                          {test.notes ? (
                            <Text className="text-sm text-foreground leading-6 mt-3">{test.notes}</Text>
                          ) : null}

                          <TouchableOpacity
                            onPress={() => handleRemoveTest(test)}
                            activeOpacity={0.8}
                            className="mt-4 rounded-2xl border border-border bg-background px-4 py-3 items-center justify-center"
                          >
                            <Text className="text-sm font-medium text-foreground">
                              Remove this test entry
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  ) : (
                    <View className="rounded-[28px] border border-dashed border-border bg-card px-6 py-10 items-center mb-4">
                      <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                        No timeline yet
                      </Text>
                      <Text className="text-sm text-muted-foreground text-center mt-2 leading-6">
                        Log a test tile from the Atlas main screen and it will appear here.
                      </Text>
                    </View>
                  )}
                </ScrollView>
            </ModalCard>
          ) : null}
        </ModalShell>
    </View>
  );
}
