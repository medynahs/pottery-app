import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { GLAZE_TEMPS } from '@/src/screens/pieces/utils/constants';
import { useAppStore } from '@/src/store/appStore';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  Droplets,
  ImagePlus,
  Plus,
  Search,
  Sparkles,
  Star,
  X
} from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GLAZE_APPLICATION_METHOD_LABELS,
  GLAZE_APPLICATION_METHOD_OPTIONS,
  GLAZE_DEFECT_LABELS,
  GLAZE_DEFECT_OPTIONS,
  GLAZE_FINISH_LABELS,
  GLAZE_FINISH_OPTIONS,
  GLAZE_KILN_TYPE_LABELS,
  GLAZE_KILN_TYPE_OPTIONS,
  GLAZE_RESULT_LABELS,
  GLAZE_RESULT_OPTIONS,
  GLAZE_SOURCE_LABELS,
  GLAZE_SOURCE_OPTIONS,
  GLAZE_THICKNESS_LABELS,
  GLAZE_THICKNESS_OPTIONS,
  type GlazeDefect,
  type GlazeFinish,
  type GlazeLibraryItem,
  type GlazeResultRating,
  type GlazeTestTile,
} from './types';

type SortKey = 'recent' | 'name' | 'tests';
type ViewMode = 'grid' | 'list';
type AddMode = 'quick' | 'advanced';

type GlazeDraft = {
  name: string;
  finish: GlazeFinish;
  colorFamily: string;
  coneRange: string;
  defaultCone: string;
  source: GlazeLibraryItem['source'];
  notes: string;
  applicationNotes: string;
  supplier: string;
  batchSize: string;
  recipeNotes: string;
  tags: string;
  collections: string;
  favorite: boolean;
  production: boolean;
  bucketPhotoUri?: string;
  firstTilePhotoUri?: string;
  firstPiecePhotoUri?: string;
};

type TestDraft = {
  glazeId: string;
  clayBody: string;
  cone: string;
  kilnName: string;
  kilnType: GlazeTestTile['kilnType'];
  applicationMethod: GlazeTestTile['applicationMethod'];
  thickness: GlazeTestTile['thickness'];
  layeredWith: string;
  shelfPosition: string;
  firingDate: string;
  photoUri?: string;
  notes: string;
  resultRating: GlazeResultRating;
  defects: GlazeDefect[];
};

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

function createEmptyGlazeDraft(defaultCone: string | null): GlazeDraft {
  return {
    name: '',
    finish: 'glossy',
    colorFamily: '',
    coneRange: defaultCone ? defaultCone : 'Cone 6',
    defaultCone: defaultCone ?? 'Cone 6',
    source: 'store-bought',
    notes: '',
    applicationNotes: '',
    supplier: '',
    batchSize: '',
    recipeNotes: '',
    tags: '',
    collections: '',
    favorite: false,
    production: false,
  };
}

function createEmptyTestDraft(glazeId: string, defaultCone: string | null): TestDraft {
  return {
    glazeId,
    clayBody: '',
    cone: defaultCone ?? 'Cone 6',
    kilnName: '',
    kilnType: 'electric',
    applicationMethod: 'dip',
    thickness: 'medium',
    layeredWith: '',
    shelfPosition: '',
    firingDate: new Date().toISOString().slice(0, 10),
    notes: '',
    resultRating: 'interesting',
    defects: [],
  };
}

function parseCommaList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
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
    return {
      container: 'bg-green-50 border-green-100',
      label: 'text-green-700',
    };
  }

  if (result === 'bad') {
    return {
      container: 'bg-rose-50 border-rose-100',
      label: 'text-rose-700',
    };
  }

  return {
    container: 'bg-amber-50 border-amber-100',
    label: 'text-amber-700',
  };
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

function MediaSlot({
  label,
  uri,
  onPress,
}: {
  label: string;
  uri?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      className="flex-1 rounded-2xl border border-border overflow-hidden bg-card"
      style={{ minHeight: 112 }}
    >
      <View className="flex-1 items-center justify-center px-3 py-4" style={{ backgroundColor: uri ? 'rgba(234,223,206,0.85)' : 'rgba(249,245,238,0.92)' }}>
        <ImagePlus size={20} color="hsl(24 20% 40%)" />
        <Text className="text-xs text-muted-foreground mt-2 text-center">{uri ? `${label} ready` : label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function GlazeLibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((state) => state.glazes);
  const glazeTests = useAppStore((state) => state.glazeTests);
  const clayBodies = useAppStore((state) => state.clayBodies);
  const defaultGlazeTemp = useAppStore((state) => state.defaultGlazeTemp);
  const addGlaze = useAppStore((state) => state.addGlaze);
  const updateGlaze = useAppStore((state) => state.updateGlaze);
  const toggleFavoriteGlaze = useAppStore((state) => state.toggleFavoriteGlaze);
  const addGlazeTest = useAppStore((state) => state.addGlazeTest);
  const deleteGlazeTest = useAppStore((state) => state.deleteGlazeTest);

  const [search, setSearch] = React.useState('');
  const [finishFilter, setFinishFilter] = React.useState<'all' | GlazeFinish>('all');
  const [favoriteOnly, setFavoriteOnly] = React.useState(false);
  const [productionOnly, setProductionOnly] = React.useState(false);
  const [sortKey, setSortKey] = React.useState<SortKey>('recent');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showAdvancedControls, setShowAdvancedControls] = React.useState(false);
  const [showRecentWall, setShowRecentWall] = React.useState(true);
  const [addMode, setAddMode] = React.useState<AddMode>('quick');
  const [addOpen, setAddOpen] = React.useState(false);
  const [testOpen, setTestOpen] = React.useState(false);
  const [selectedGlazeId, setSelectedGlazeId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<GlazeDraft>(() => createEmptyGlazeDraft(defaultGlazeTemp));
  const [testDraft, setTestDraft] = React.useState<TestDraft>(() => createEmptyTestDraft(glazes[0]?.id ?? '', defaultGlazeTemp));

  React.useEffect(() => {
    if (!testDraft.glazeId && glazes[0]?.id) {
      setTestDraft(createEmptyTestDraft(glazes[0].id, defaultGlazeTemp));
    }
  }, [defaultGlazeTemp, glazes, testDraft.glazeId]);

  React.useEffect(() => {
    if (selectedGlazeId && !glazes.some((glaze) => glaze.id === selectedGlazeId)) {
      setSelectedGlazeId(null);
    }
  }, [glazes, selectedGlazeId]);

  const statsByGlaze = React.useMemo(() => buildStats(glazes, glazeTests), [glazes, glazeTests]);

  const filteredGlazes = React.useMemo(() => {
    const result = glazes.filter((glaze) => {
      const matchesSearch = search.trim() === ''
        || glaze.name.toLowerCase().includes(search.toLowerCase())
        || glaze.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
        || glaze.collections.some((collection) => collection.toLowerCase().includes(search.toLowerCase()));
      const matchesFinish = finishFilter === 'all' || glaze.finish === finishFilter;
      const matchesFavorite = !favoriteOnly || glaze.favorite;
      const matchesProduction = !productionOnly || glaze.production;
      return matchesSearch && matchesFinish && matchesFavorite && matchesProduction;
    });

    switch (sortKey) {
      case 'name':
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case 'tests':
        return result.sort((a, b) => (statsByGlaze[b.id]?.tests ?? 0) - (statsByGlaze[a.id]?.tests ?? 0));
      case 'recent':
      default:
        return result.sort((a, b) => new Date(b.lastTestedAt ?? b.createdAt).getTime() - new Date(a.lastTestedAt ?? a.createdAt).getTime());
    }
  }, [favoriteOnly, finishFilter, glazes, productionOnly, search, sortKey, statsByGlaze]);

  const recentTests = React.useMemo(
    () => [...glazeTests].sort((a, b) => new Date(b.firingDate).getTime() - new Date(a.firingDate).getTime()).slice(0, 8),
    [glazeTests],
  );

  const selectedGlaze = React.useMemo(
    () => glazes.find((glaze) => glaze.id === selectedGlazeId),
    [glazes, selectedGlazeId],
  );

  const selectedGlazeTests = React.useMemo(
    () => glazeTests
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

  const pickImage = React.useCallback(async (onPick: (uri: string) => void) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        onPick(result.assets[0].uri);
      }
    } catch {}
  }, []);

  const resetAddDraft = React.useCallback(() => {
    setDraft(createEmptyGlazeDraft(defaultGlazeTemp));
    setAddMode('quick');
  }, [defaultGlazeTemp]);

  const resetTestDraft = React.useCallback(() => {
    setTestDraft(createEmptyTestDraft(glazes[0]?.id ?? '', defaultGlazeTemp));
  }, [defaultGlazeTemp, glazes]);

  const handleSaveGlaze = () => {
    if (!draft.name.trim()) return;
    const id = `glaze-${Date.now()}`;
    addGlaze({
      id,
      name: draft.name.trim(),
      finish: draft.finish,
      colorFamily: draft.colorFamily.trim() || 'Unsorted Surface',
      coneRange: draft.coneRange.trim() || draft.defaultCone,
      defaultCone: draft.defaultCone,
      source: draft.source,
      notes: draft.notes.trim() || undefined,
      applicationNotes: draft.applicationNotes.trim() || undefined,
      supplier: draft.supplier.trim() || undefined,
      batchSize: draft.batchSize.trim() || undefined,
      recipeNotes: draft.recipeNotes.trim() || undefined,
      recipeIngredients: [],
      tags: parseCommaList(draft.tags),
      collections: parseCommaList(draft.collections),
      favorite: draft.favorite,
      production: draft.production,
      bucketPhotoUri: draft.bucketPhotoUri,
      testTilePhotoUris: draft.firstTilePhotoUri ? [draft.firstTilePhotoUri] : [],
      finishedPiecePhotoUris: draft.firstPiecePhotoUri ? [draft.firstPiecePhotoUri] : [],
      accidentPhotoUris: [],
      clayBodiesUsed: [],
      kilnTypesUsed: [],
      conesTested: [],
      createdAt: new Date().toISOString(),
      lastTestedAt: undefined,
    });
    setAddOpen(false);
    resetAddDraft();
  };

  const handleSaveTest = () => {
    const selectedGlaze = glazes.find((glaze) => glaze.id === testDraft.glazeId);
    if (!selectedGlaze || !testDraft.clayBody.trim() || !testDraft.cone.trim()) return;

    const firingDate = testDraft.firingDate.length === 10
      ? `${testDraft.firingDate}T12:00:00.000Z`
      : testDraft.firingDate;

    addGlazeTest({
      id: `glaze-test-${Date.now()}`,
      glazeId: selectedGlaze.id,
      glazeNameSnapshot: selectedGlaze.name,
      clayBody: testDraft.clayBody.trim(),
      cone: testDraft.cone.trim(),
      kilnName: testDraft.kilnName.trim() || undefined,
      kilnType: testDraft.kilnType,
      applicationMethod: testDraft.applicationMethod,
      thickness: testDraft.thickness,
      layeredWith: parseCommaList(testDraft.layeredWith),
      shelfPosition: testDraft.shelfPosition.trim() || undefined,
      firingDate,
      photoUri: testDraft.photoUri,
      notes: testDraft.notes.trim() || undefined,
      resultRating: testDraft.resultRating,
      defects: testDraft.defects,
    });

    setTestOpen(false);
    resetTestDraft();
  };

  const openTestDraftForGlaze = React.useCallback((glaze: GlazeLibraryItem) => {
    setSelectedGlazeId(null);
    setTestDraft(createEmptyTestDraft(glaze.id, glaze.defaultCone || defaultGlazeTemp));
    setTestOpen(true);
  }, [defaultGlazeTemp]);

  const handleRemoveTest = React.useCallback((test: GlazeTestTile) => {
    Alert.alert(
      'Remove test tile?',
      `This will remove the ${formatShortDate(test.firingDate)} entry for ${test.glazeNameSnapshot}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteGlazeTest(test.id),
        },
      ],
    );
  }, [deleteGlazeTest]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-3 border-b border-border bg-background">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 pr-3">
            <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-primary mb-2">Glaze Intelligence</Text>
            <Text className="text-3xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold', lineHeight: 38 }}>
              My Glazes
            </Text>
            <Text className="text-sm text-muted-foreground mt-2 leading-6">
              Keep one simple rhythm: add glaze, log tile, learn pattern.
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="bg-muted px-4 py-2 rounded-full" activeOpacity={0.78}>
            <Text className="text-sm font-medium text-foreground">Done</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity onPress={() => setAddOpen(true)} activeOpacity={0.82} className="flex-1 rounded-2xl bg-foreground px-4 py-3 flex-row items-center justify-center gap-2">
            <Plus size={16} color="hsl(34 35% 92%)" />
            <Text className="text-sm font-semibold text-background">Add Glaze</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (glazes.length > 0 ? setTestOpen(true) : setAddOpen(true))} activeOpacity={0.82} className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 flex-row items-center justify-center gap-2">
            <Sparkles size={16} color="hsl(15 50% 50%)" />
            <Text className="text-sm font-semibold text-foreground">Log Test Tile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-5">
          <View className="rounded-[28px] border border-amber-200 bg-amber-50 px-4 py-4">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-amber-700 mb-2">Start Here</Text>
            <View className="gap-2">
              <Text className="text-sm text-amber-800 leading-6">1) Add a glaze to your shelf.</Text>
              <Text className="text-sm text-amber-800 leading-6">2) Log one test tile with clay + cone + result.</Text>
              <Text className="text-sm text-amber-800 leading-6">3) Open profile to spot your pattern.</Text>
            </View>
          </View>

          <View className="mt-5 rounded-3xl border border-border bg-card px-4 py-4">
            <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
              <Search size={16} color="hsl(24 20% 40%)" />
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search glaze names, tags, or collections"
                className="flex-1 border-0 bg-transparent px-0"
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
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
              <Pill label="Favorites" active={favoriteOnly} onPress={() => setFavoriteOnly((current) => !current)} />
              <Pill label="Production" active={productionOnly} onPress={() => setProductionOnly((current) => !current)} />
              <Pill
                label={showAdvancedControls ? 'Hide controls' : 'More controls'}
                active={showAdvancedControls}
                onPress={() => setShowAdvancedControls((current) => !current)}
              />
            </View>

            {showAdvancedControls ? (
              <>
                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4">Sort by</Text>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  <Pill label="Recent" active={sortKey === 'recent'} onPress={() => setSortKey('recent')} />
                  <Pill label="A-Z" active={sortKey === 'name'} onPress={() => setSortKey('name')} />
                  <Pill label="Most Tested" active={sortKey === 'tests'} onPress={() => setSortKey('tests')} />
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4">View</Text>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  <Pill label="Grid" active={viewMode === 'grid'} onPress={() => setViewMode('grid')} />
                  <Pill label="List" active={viewMode === 'list'} onPress={() => setViewMode('list')} />
                </View>
              </>
            ) : null}
          </View>

          <View className="mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Recent Test Wall</Text>
                <Text className="text-xs text-muted-foreground mt-1">Your latest glaze behavior snapshots</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowRecentWall((current) => !current)}
                activeOpacity={0.82}
                className="px-3 py-1.5 rounded-full bg-muted"
              >
                <Text className="text-xs font-semibold text-foreground">{showRecentWall ? 'Hide' : `${recentTests.length} tiles`}</Text>
              </TouchableOpacity>
            </View>

            {showRecentWall ? recentTests.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {recentTests.map((test) => {
                  const surfaceColor = glazeColor(glazes.find((item) => item.id === test.glazeId)?.colorFamily ?? test.glazeNameSnapshot);
                  return (
                    <TouchableOpacity key={test.id} onPress={() => setSelectedGlazeId(test.glazeId)} activeOpacity={0.86} className="w-40 rounded-[26px] border border-border bg-card overflow-hidden">
                      <View style={{ height: 116, backgroundColor: surfaceColor }} className="items-center justify-center px-3">
                        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-foreground/70">
                          {test.resultRating === 'great' ? 'Success' : test.resultRating === 'interesting' ? 'Interesting' : 'Retry'}
                        </Text>
                        <Text className="text-sm text-foreground text-center mt-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                          {test.glazeNameSnapshot}
                        </Text>
                      </View>
                      <View className="px-3 py-3">
                        <Text className="text-xs font-medium text-foreground">{test.clayBody}</Text>
                        <Text className="text-[11px] text-muted-foreground mt-1">{test.cone} · {GLAZE_THICKNESS_LABELS[test.thickness]}</Text>
                        <Text className="text-[11px] text-muted-foreground mt-1">{formatShortDate(test.firingDate)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View className="rounded-3xl border border-dashed border-border bg-card px-5 py-8 items-center">
                <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>No test tiles yet</Text>
                <Text className="text-sm text-muted-foreground mt-2 text-center leading-6">
                  Start with one quick tile log and the app can begin remembering how glazes behave in your studio.
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-7 mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Glaze Library</Text>
              <Text className="text-xs text-muted-foreground mt-1">Profiles, counts, and early studio observations</Text>
            </View>
            <Text className="text-xs font-semibold text-primary">{filteredGlazes.length} glazes</Text>
          </View>

          {filteredGlazes.length === 0 ? (
            <View className="rounded-[28px] border border-dashed border-border bg-card px-6 py-10 items-center mb-4">
              <Droplets size={28} color="hsl(24 20% 45%)" />
              <Text className="text-lg text-foreground mt-3" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Your glaze shelf is still empty</Text>
              <Text className="text-sm text-muted-foreground text-center mt-2 leading-6">
                Add your first glaze in quick mode, then log the first tile. The archive gets smarter once a glaze has history.
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
                      <View style={{ backgroundColor: glazeColor(glaze.colorFamily), minHeight: viewMode === 'grid' ? 138 : 124 }} className="px-4 py-4 justify-between">
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="px-3 py-1 rounded-full bg-white/75 self-start">
                            <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground">
                              {GLAZE_FINISH_LABELS[glaze.finish]}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => toggleFavoriteGlaze(glaze.id)} activeOpacity={0.78} className="w-8 h-8 rounded-full bg-white/70 items-center justify-center">
                            <Star size={14} color={glaze.favorite ? 'hsl(38 80% 50%)' : 'hsl(24 20% 45%)'} fill={glaze.favorite ? 'hsl(38 80% 50%)' : 'none'} />
                          </TouchableOpacity>
                        </View>

                        <View>
                          <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{glaze.name}</Text>
                          <Text className="text-xs text-foreground/70 mt-1">{glaze.colorFamily} · {glaze.coneRange}</Text>
                        </View>
                      </View>

                      <View className="px-4 py-4">
                        <View className="flex-row flex-wrap gap-2 mb-3">
                          <View className="px-2.5 py-1 rounded-full bg-muted/70">
                            <Text className="text-[11px] font-medium text-muted-foreground">{stats?.tests ?? 0} tests</Text>
                          </View>
                          {glaze.production ? (
                            <View className="px-2.5 py-1 rounded-full bg-green-50 border border-green-100">
                              <Text className="text-[11px] font-medium text-green-700">Production</Text>
                            </View>
                          ) : null}
                          <View className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                            <Text className="text-[11px] font-medium text-blue-700">{GLAZE_SOURCE_LABELS[glaze.source]}</Text>
                          </View>
                        </View>

                        <Text className="text-xs text-muted-foreground">{lastTestLabel}</Text>
                        <Text className="text-xs text-foreground mt-2 leading-5">{glazeObservation(stats)}</Text>

                        {glaze.tags.length > 0 ? (
                          <View className="flex-row flex-wrap gap-2 mt-3">
                            {glaze.tags.slice(0, 3).map((tag) => (
                              <Text key={tag} className="text-[11px] text-primary font-medium">#{tag}</Text>
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

      <Modal visible={Boolean(selectedGlaze)} animationType="slide" transparent onRequestClose={() => setSelectedGlazeId(null)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.46)' }}>
          <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={() => setSelectedGlazeId(null)} />
          {selectedGlaze ? (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View className="bg-background rounded-t-[32px]" style={{ maxHeight: 780 }}>
                <View className="w-10 h-1 bg-muted rounded-full self-center mt-4 mb-3" />
                <View className="px-6 pb-4 border-b border-border flex-row items-start justify-between gap-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-primary mb-2">Glaze Profile</Text>
                    <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>{selectedGlaze.name}</Text>
                    <Text className="text-sm text-muted-foreground mt-1">{selectedGlaze.colorFamily} · {selectedGlaze.coneRange}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedGlazeId(null)} className="w-9 h-9 rounded-full bg-muted items-center justify-center">
                    <X size={16} color="hsl(24 20% 40%)" />
                  </TouchableOpacity>
                </View>

                <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
                  <View className="mt-5 rounded-[30px] overflow-hidden border border-border bg-card">
                    <View style={{ backgroundColor: glazeColor(selectedGlaze.colorFamily), minHeight: 156 }} className="px-5 py-5 justify-between">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-row flex-wrap gap-2 flex-1">
                          <View className="px-3 py-1 rounded-full bg-white/75">
                            <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground">{GLAZE_FINISH_LABELS[selectedGlaze.finish]}</Text>
                          </View>
                          <View className="px-3 py-1 rounded-full bg-white/75">
                            <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground">{GLAZE_SOURCE_LABELS[selectedGlaze.source]}</Text>
                          </View>
                          {selectedGlaze.production ? (
                            <View className="px-3 py-1 rounded-full bg-green-50 border border-green-100">
                              <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-green-700">Production</Text>
                            </View>
                          ) : null}
                        </View>
                        <TouchableOpacity onPress={() => toggleFavoriteGlaze(selectedGlaze.id)} activeOpacity={0.78} className="w-9 h-9 rounded-full bg-white/75 items-center justify-center">
                          <Star size={16} color={selectedGlaze.favorite ? 'hsl(38 80% 50%)' : 'hsl(24 20% 45%)'} fill={selectedGlaze.favorite ? 'hsl(38 80% 50%)' : 'none'} />
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row gap-3">
                        <View className="flex-1 rounded-2xl bg-white/72 px-4 py-3">
                          <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground/70">Tests</Text>
                          <Text className="text-2xl text-foreground mt-1" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{selectedGlazeTests.length}</Text>
                        </View>
                        <View className="flex-1 rounded-2xl bg-white/72 px-4 py-3">
                          <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-foreground/70">Success Rate</Text>
                          <Text className="text-2xl text-foreground mt-1" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{selectedGlazeSummary.successRate}%</Text>
                        </View>
                      </View>
                    </View>

                    <View className="px-5 py-5">
                      <Text className="text-sm text-foreground leading-6">{glazeObservation(statsByGlaze[selectedGlaze.id])}</Text>
                      {selectedGlaze.notes ? (
                        <Text className="text-sm text-muted-foreground leading-6 mt-3">{selectedGlaze.notes}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View className="mt-5 rounded-[28px] border border-amber-200 bg-amber-50 px-4 py-4">
                    <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-amber-700 mb-2">Studio Signals</Text>
                    <View className="gap-2">
                      {selectedGlazeSignals.map((signal) => (
                        <Text key={signal} className="text-sm text-amber-900 leading-6">{signal}</Text>
                      ))}
                    </View>
                  </View>

                  <View className="mt-5">
                    <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Studio Fit</Text>
                    <View className="flex-row flex-wrap justify-between mt-3">
                      <View className="w-[48%] rounded-[24px] border border-border bg-card px-4 py-4 mb-3">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">Best clay</Text>
                        <Text className="text-base text-foreground mt-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{selectedGlazeSummary.favoriteClayBody ?? 'Still learning'}</Text>
                      </View>
                      <View className="w-[48%] rounded-[24px] border border-border bg-card px-4 py-4 mb-3">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">Best method</Text>
                        <Text className="text-base text-foreground mt-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                          {selectedGlazeSummary.favoriteMethod ? GLAZE_APPLICATION_METHOD_LABELS[selectedGlazeSummary.favoriteMethod as GlazeTestTile['applicationMethod']] : 'Still learning'}
                        </Text>
                      </View>
                      <View className="w-[48%] rounded-[24px] border border-border bg-card px-4 py-4">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">Sweet cone</Text>
                        <Text className="text-base text-foreground mt-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{selectedGlazeSummary.favoriteCone ?? 'Still learning'}</Text>
                      </View>
                      <View className="w-[48%] rounded-[24px] border border-border bg-card px-4 py-4">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">Watch for</Text>
                        <Text className="text-base text-foreground mt-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                          {selectedGlazeSummary.topDefect ? GLAZE_DEFECT_LABELS[selectedGlazeSummary.topDefect] : 'No defect pattern yet'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="mt-2 rounded-[28px] border border-border bg-card px-4 py-4">
                    <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted-foreground mb-2">Context Snapshot</Text>
                    <Text className="text-sm text-foreground leading-6">Kiln used most: {selectedGlazeSummary.favoriteKiln ?? 'Still learning'}</Text>
                    <Text className="text-sm text-foreground leading-6 mt-1">Interesting results: {selectedGlazeSummary.interestingCount}</Text>
                    <Text className="text-sm text-foreground leading-6 mt-1">Layered tests: {selectedGlazeSummary.layeredCount}</Text>
                    {selectedGlaze.applicationNotes ? (
                      <Text className="text-sm text-muted-foreground leading-6 mt-3">Application note: {selectedGlaze.applicationNotes}</Text>
                    ) : null}
                  </View>

                  <View className="mt-6 flex-row gap-3">
                    <TouchableOpacity onPress={() => openTestDraftForGlaze(selectedGlaze)} activeOpacity={0.82} className="flex-1 rounded-2xl bg-foreground px-4 py-3 items-center justify-center">
                      <Text className="text-sm font-semibold text-background">Log Test Tile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => updateGlaze({ ...selectedGlaze, production: !selectedGlaze.production })}
                      activeOpacity={0.82}
                      className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 items-center justify-center"
                    >
                      <Text className="text-sm font-semibold text-foreground">{selectedGlaze.production ? 'Remove Production' : 'Mark Production'}</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="mt-7 mb-3 flex-row items-center justify-between">
                    <View>
                      <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Test Timeline</Text>
                      <Text className="text-xs text-muted-foreground mt-1">Every firing teaches this glaze who it is in your studio.</Text>
                    </View>
                    <Text className="text-xs font-semibold text-primary">{selectedGlazeTests.length} entries</Text>
                  </View>

                  {selectedGlazeTests.length > 0 ? selectedGlazeTests.map((test) => {
                    const resultTone = resultPillClasses(test.resultRating);
                    return (
                      <View key={test.id} className="rounded-[28px] border border-border bg-card px-4 py-4 mb-3">
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1 pr-2">
                            <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{formatShortDate(test.firingDate)}</Text>
                            <Text className="text-sm text-muted-foreground mt-1">{test.clayBody} · {test.cone}</Text>
                          </View>
                          <View className={`px-3 py-1 rounded-full border ${resultTone.container}`}>
                            <Text className={`text-[11px] font-semibold uppercase tracking-[1.2px] ${resultTone.label}`}>{GLAZE_RESULT_LABELS[test.resultRating]}</Text>
                          </View>
                        </View>

                        <Text className="text-sm text-foreground mt-3">{GLAZE_APPLICATION_METHOD_LABELS[test.applicationMethod]} · {GLAZE_THICKNESS_LABELS[test.thickness]} · {test.kilnName || (test.kilnType ? GLAZE_KILN_TYPE_LABELS[test.kilnType] : 'Unknown kiln')}</Text>

                        {test.layeredWith.length > 0 ? (
                          <Text className="text-sm text-muted-foreground mt-2">Layered with: {test.layeredWith.join(', ')}</Text>
                        ) : null}

                        {test.defects.length > 0 ? (
                          <View className="flex-row flex-wrap gap-2 mt-3">
                            {test.defects.map((defect) => (
                              <View key={defect} className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100">
                                <Text className="text-[11px] font-medium text-rose-700">{GLAZE_DEFECT_LABELS[defect]}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}

                        {test.notes ? (
                          <Text className="text-sm text-foreground leading-6 mt-3">{test.notes}</Text>
                        ) : null}

                        <TouchableOpacity onPress={() => handleRemoveTest(test)} activeOpacity={0.8} className="mt-4 rounded-2xl border border-border bg-background px-4 py-3 items-center justify-center">
                          <Text className="text-sm font-medium text-foreground">Remove this test entry</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }) : (
                    <View className="rounded-[28px] border border-dashed border-border bg-card px-6 py-10 items-center mb-4">
                      <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>No timeline yet</Text>
                      <Text className="text-sm text-muted-foreground text-center mt-2 leading-6">
                        Log the next tile from this glaze profile so its timeline starts building in one place.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          ) : null}
        </View>
      </Modal>

      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={() => { setAddOpen(false); resetAddDraft(); }}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.46)' }}>
          <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={() => { setAddOpen(false); resetAddDraft(); }} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="bg-background rounded-t-[32px]" style={{ maxHeight: 760 }}>
              <View className="w-10 h-1 bg-muted rounded-full self-center mt-4 mb-3" />
              <View className="px-6 pb-4 border-b border-border flex-row items-start justify-between gap-3">
                <View className="flex-1 pr-3">
                  <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>Add Glaze</Text>
                  <Text className="text-sm text-muted-foreground mt-1">Quick add keeps the barrier low. Advanced mode captures the living profile.</Text>
                </View>
                <TouchableOpacity onPress={() => { setAddOpen(false); resetAddDraft(); }} className="w-9 h-9 rounded-full bg-muted items-center justify-center">
                  <X size={16} color="hsl(24 20% 40%)" />
                </TouchableOpacity>
              </View>

              <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 28 }}>
                <View className="flex-row gap-2 mt-5">
                  <Pill label="Quick" active={addMode === 'quick'} onPress={() => setAddMode('quick')} />
                  <Pill label="Advanced" active={addMode === 'advanced'} onPress={() => setAddMode('advanced')} />
                </View>

                <View className="mt-5">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Glaze name</Text>
                  <Input value={draft.name} onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))} placeholder="e.g. Quiet Satin Blue" />
                </View>

                <View className="flex-row gap-3 mt-4">
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Default cone</Text>
                    <Input value={draft.defaultCone} onChangeText={(value) => setDraft((current) => ({ ...current, defaultCone: value }))} placeholder="Cone 6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Cone range</Text>
                    <Input value={draft.coneRange} onChangeText={(value) => setDraft((current) => ({ ...current, coneRange: value }))} placeholder="Cone 5-6" />
                  </View>
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Finish</Text>
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_FINISH_OPTIONS.map((option) => (
                    <Pill key={option} label={GLAZE_FINISH_LABELS[option]} active={draft.finish === option} onPress={() => setDraft((current) => ({ ...current, finish: option }))} />
                  ))}
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Source</Text>
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_SOURCE_OPTIONS.map((option) => (
                    <Pill key={option} label={GLAZE_SOURCE_LABELS[option]} active={draft.source === option} onPress={() => setDraft((current) => ({ ...current, source: option }))} />
                  ))}
                </View>

                <View className="mt-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Quick notes</Text>
                  <Input
                    value={draft.notes}
                    onChangeText={(value) => setDraft((current) => ({ ...current, notes: value }))}
                    placeholder="How this glaze usually behaves"
                    multiline
                    numberOfLines={3}
                    className="min-h-[90px]"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>

                {addMode === 'advanced' ? (
                  <>
                    <View className="flex-row gap-3 mt-4">
                      <View className="flex-1">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Color family</Text>
                        <Input value={draft.colorFamily} onChangeText={(value) => setDraft((current) => ({ ...current, colorFamily: value }))} placeholder="Blue Grey" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Supplier</Text>
                        <Input value={draft.supplier} onChangeText={(value) => setDraft((current) => ({ ...current, supplier: value }))} placeholder="Amaco, Mayco, Studio" />
                      </View>
                    </View>

                    <View className="flex-row gap-3 mt-4">
                      <View className="flex-1">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Batch size</Text>
                        <Input value={draft.batchSize} onChangeText={(value) => setDraft((current) => ({ ...current, batchSize: value }))} placeholder="5000 g batch" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Tags</Text>
                        <Input value={draft.tags} onChangeText={(value) => setDraft((current) => ({ ...current, tags: value }))} placeholder="matte, blue, cone 6" />
                      </View>
                    </View>

                    <View className="mt-4">
                      <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Collections</Text>
                      <Input value={draft.collections} onChangeText={(value) => setDraft((current) => ({ ...current, collections: value }))} placeholder="Favorites, Winter Glazes" />
                    </View>

                    <View className="mt-4">
                      <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Application notes</Text>
                      <Input value={draft.applicationNotes} onChangeText={(value) => setDraft((current) => ({ ...current, applicationNotes: value }))} placeholder="Brush thin, dip medium, watch the rim" multiline numberOfLines={3} className="min-h-[90px]" style={{ textAlignVertical: 'top' }} />
                    </View>

                    <View className="mt-4">
                      <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Recipe notes</Text>
                      <Input value={draft.recipeNotes} onChangeText={(value) => setDraft((current) => ({ ...current, recipeNotes: value }))} placeholder="Batch notes, sieve notes, weirdness" multiline numberOfLines={3} className="min-h-[90px]" style={{ textAlignVertical: 'top' }} />
                    </View>

                    <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Starter media</Text>
                    <View className="flex-row gap-3">
                      <MediaSlot label="Bucket photo" uri={draft.bucketPhotoUri} onPress={() => pickImage((uri) => setDraft((current) => ({ ...current, bucketPhotoUri: uri })))} />
                      <MediaSlot label="Test tile" uri={draft.firstTilePhotoUri} onPress={() => pickImage((uri) => setDraft((current) => ({ ...current, firstTilePhotoUri: uri })))} />
                      <MediaSlot label="Finished piece" uri={draft.firstPiecePhotoUri} onPress={() => pickImage((uri) => setDraft((current) => ({ ...current, firstPiecePhotoUri: uri })))} />
                    </View>

                    <View className="flex-row gap-2 mt-4">
                      <Pill label="Favorite" active={draft.favorite} onPress={() => setDraft((current) => ({ ...current, favorite: !current.favorite }))} />
                      <Pill label="Production" active={draft.production} onPress={() => setDraft((current) => ({ ...current, production: !current.production }))} />
                    </View>
                  </>
                ) : null}
              </ScrollView>

              <View className="px-6 pt-4 pb-10 border-t border-border">
                <TouchableOpacity onPress={handleSaveGlaze} activeOpacity={0.82} className="rounded-2xl bg-foreground py-4 items-center justify-center">
                  <Text className="text-sm font-semibold text-background">Save Glaze</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={testOpen} animationType="slide" transparent onRequestClose={() => { setTestOpen(false); resetTestDraft(); }}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.46)' }}>
          <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={() => { setTestOpen(false); resetTestDraft(); }} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="bg-background rounded-t-[32px]" style={{ maxHeight: 760 }}>
              <View className="w-10 h-1 bg-muted rounded-full self-center mt-4 mb-3" />
              <View className="px-6 pb-4 border-b border-border flex-row items-start justify-between gap-3">
                <View className="flex-1 pr-3">
                  <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>Log Test Tile</Text>
                  <Text className="text-sm text-muted-foreground mt-1">Keep it fast: glaze, clay, cone, method, thickness, result, photo if you have it.</Text>
                </View>
                <TouchableOpacity onPress={() => { setTestOpen(false); resetTestDraft(); }} className="w-9 h-9 rounded-full bg-muted items-center justify-center">
                  <X size={16} color="hsl(24 20% 40%)" />
                </TouchableOpacity>
              </View>

              <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 28 }}>
                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-5 mb-2">Glaze</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {glazes.map((glaze) => (
                    <Pill key={glaze.id} label={glaze.name} active={testDraft.glazeId === glaze.id} onPress={() => setTestDraft((current) => ({ ...current, glazeId: glaze.id, cone: glaze.defaultCone || current.cone }))} />
                  ))}
                </ScrollView>

                <View className="flex-row gap-3 mt-4">
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Clay body</Text>
                    <Input value={testDraft.clayBody} onChangeText={(value) => setTestDraft((current) => ({ ...current, clayBody: value }))} placeholder={clayBodies[0]?.name ?? 'Stoneware'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Cone</Text>
                    <Input value={testDraft.cone} onChangeText={(value) => setTestDraft((current) => ({ ...current, cone: value }))} placeholder={defaultGlazeTemp ?? GLAZE_TEMPS[0]} />
                  </View>
                </View>

                <View className="flex-row gap-3 mt-4">
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Kiln</Text>
                    <Input value={testDraft.kilnName} onChangeText={(value) => setTestDraft((current) => ({ ...current, kilnName: value }))} placeholder="North Skutt" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Shelf position</Text>
                    <Input value={testDraft.shelfPosition} onChangeText={(value) => setTestDraft((current) => ({ ...current, shelfPosition: value }))} placeholder="Top shelf" />
                  </View>
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Kiln type</Text>
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_KILN_TYPE_OPTIONS.map((option) => (
                    <Pill key={option} label={GLAZE_KILN_TYPE_LABELS[option]} active={testDraft.kilnType === option} onPress={() => setTestDraft((current) => ({ ...current, kilnType: option }))} />
                  ))}
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Application method</Text>
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_APPLICATION_METHOD_OPTIONS.map((option) => (
                    <Pill key={option} label={GLAZE_APPLICATION_METHOD_LABELS[option]} active={testDraft.applicationMethod === option} onPress={() => setTestDraft((current) => ({ ...current, applicationMethod: option }))} />
                  ))}
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Thickness</Text>
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_THICKNESS_OPTIONS.map((option) => (
                    <Pill key={option} label={GLAZE_THICKNESS_LABELS[option]} active={testDraft.thickness === option} onPress={() => setTestDraft((current) => ({ ...current, thickness: option }))} />
                  ))}
                </View>

                <View className="mt-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Layered with</Text>
                  <Input value={testDraft.layeredWith} onChangeText={(value) => setTestDraft((current) => ({ ...current, layeredWith: value }))} placeholder="Top glaze, bottom glaze, liner" />
                </View>

                <View className="mt-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Firing date</Text>
                  <Input value={testDraft.firingDate} onChangeText={(value) => setTestDraft((current) => ({ ...current, firingDate: value }))} placeholder="2026-03-18" />
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Result feeling</Text>
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_RESULT_OPTIONS.map((option) => (
                    <Pill key={option} label={GLAZE_RESULT_LABELS[option]} active={testDraft.resultRating === option} onPress={() => setTestDraft((current) => ({ ...current, resultRating: option }))} />
                  ))}
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Defects</Text>
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_DEFECT_OPTIONS.map((option) => {
                    const active = testDraft.defects.includes(option);
                    return (
                      <Pill
                        key={option}
                        label={GLAZE_DEFECT_LABELS[option]}
                        active={active}
                        onPress={() => setTestDraft((current) => ({
                          ...current,
                          defects: active ? current.defects.filter((item) => item !== option) : [...current.defects, option],
                        }))}
                      />
                    );
                  })}
                </View>

                <View className="mt-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Notes</Text>
                  <Input value={testDraft.notes} onChangeText={(value) => setTestDraft((current) => ({ ...current, notes: value }))} placeholder="Surface, color, texture, lesson learned" multiline numberOfLines={3} className="min-h-[90px]" style={{ textAlignVertical: 'top' }} />
                </View>

                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Photo</Text>
                <MediaSlot label="Tap to add tile photo" uri={testDraft.photoUri} onPress={() => pickImage((uri) => setTestDraft((current) => ({ ...current, photoUri: uri })))} />
              </ScrollView>

              <View className="px-6 pt-4 pb-10 border-t border-border">
                <TouchableOpacity onPress={handleSaveTest} activeOpacity={0.82} className="rounded-2xl bg-foreground py-4 items-center justify-center">
                  <Text className="text-sm font-semibold text-background">Save Test Tile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}