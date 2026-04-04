import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
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
} from '@/src/screens/glazes/types';
import { GLAZE_TEMPS } from '@/src/screens/pieces/utils/constants';
import { useAppStore } from '@/src/store';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  Droplets,
  FolderPlus,
  ImagePlus,
  Plus,
  Sparkles
} from 'lucide-react-native';
import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLOR_FAMILY_HEX: Record<string, string> = {
  blue: '#7BA7CC',
  navy: '#3D5A80',
  teal: '#5BA4A4',
  green: '#7BAF7B',
  sage: '#9AB89A',
  olive: '#8B9B5A',
  yellow: '#D4B84A',
  amber: '#D4874A',
  orange: '#D4704A',
  red: '#C45C5C',
  pink: '#D4849A',
  purple: '#9B7BC4',
  lavender: '#B49BC4',
  brown: '#9B7B5A',
  tan: '#C4A87A',
  beige: '#D4C4A0',
  cream: '#E8D9B8',
  white: '#EFEBE0',
  black: '#4A3A2A',
  grey: '#9B9B9B',
  gray: '#9B9B9B',
};

const CARD_TINTS = [
  { bg: '#FDF6EB', border: '#E8D5B0' },
  { bg: '#EDF4F0', border: '#C5DDD0' },
  { bg: '#EEF1F8', border: '#C8D5E8' },
  { bg: '#F5EFF8', border: '#DAC8E8' },
  { bg: '#F8F0EC', border: '#E8CFC0' },
  { bg: '#F0F5EC', border: '#C8DCC0' },
];

// ─── Draft types ─────────────────────────────────────────────────────────────

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
  collections: string[];
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGlazeColor(colorFamily: string): string {
  return COLOR_FAMILY_HEX[colorFamily?.toLowerCase()] ?? '#C4B48C';
}

function glazeCardColor(colorFamily: string) {
  const n = colorFamily.trim().toLowerCase();
  if (n.includes('blue')) return '#9EC5D6';
  if (n.includes('green') || n.includes('mint')) return '#AFC9A1';
  if (n.includes('honey') || n.includes('brown') || n.includes('amber')) return '#D8B17B';
  if (n.includes('red') || n.includes('iron')) return '#C27A67';
  if (n.includes('white') || n.includes('cream')) return '#E8DFC9';
  return '#C7B8A3';
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function parseCommaList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function createEmptyGlazeDraft(defaultCone: string | null, defaultCollections: string[]): GlazeDraft {
  return {
    name: '',
    finish: 'glossy',
    colorFamily: '',
    coneRange: defaultCone ?? 'Cone 6',
    defaultCone: defaultCone ?? 'Cone 6',
    source: 'store-bought',
    notes: '',
    applicationNotes: '',
    supplier: '',
    batchSize: '',
    recipeNotes: '',
    tags: '',
    collections: defaultCollections.length > 0 ? [defaultCollections[0]] : ['My Glazes'],
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: active ? '#3A2810' : '#E8D9BE',
        backgroundColor: active ? '#3A2810' : '#FFFBF4',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: active ? '#FFFBF4' : '#7A6040',
        }}
      >
        {label}
      </Text>
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
      style={{
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8D9BE',
        overflow: 'hidden',
        minHeight: 100,
        backgroundColor: uri ? 'rgba(234,223,206,0.85)' : 'rgba(249,245,238,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
      }}
    >
      <ImagePlus size={18} color="#A68555" />
      <Text style={{ fontSize: 10, color: '#A68555', marginTop: 6, textAlign: 'center' }}>
        {uri ? `${label} ready` : label}
      </Text>
    </TouchableOpacity>
  );
}

function CollectionChip({
  name,
  selected,
  onPress,
}: {
  name: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: selected ? '#C9963A' : '#E8D9BE',
        backgroundColor: selected ? '#FFF3DC' : '#FFFBF4',
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: selected ? '#8B5E1A' : '#A68555' }}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

function CollectionCard({
  name,
  glazeColors,
  count,
  onPress,
}: {
  name: string;
  glazeColors: string[];
  count: number;
  tint: { bg: string; border: string };
  onPress: () => void;
}) {
  const swatches = glazeColors.slice(0, 6);
  const bandColors = swatches.length > 0 ? swatches : ['#D4C4A0', '#C4B48C', '#B4A47C'];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        flex: 1,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#D9C9A8',
        backgroundColor: '#FFFBF2',
        overflow: 'hidden',
        shadowColor: '#8B6A2A',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {/* Swatch band */}
      <View style={{ flexDirection: 'row', height: 52 }}>
        {bandColors.map((color, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: color,
              borderRightWidth: i < bandColors.length - 1 ? 1 : 0,
              borderColor: 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </View>
      <View style={{ height: 1, backgroundColor: '#D9C9A8' }} />
      <View style={{ paddingHorizontal: 12, paddingTop: 9, paddingBottom: 10, backgroundColor: '#FFFBF2' }}>
        <Text
          style={{
            fontSize: 8.5,
            letterSpacing: 1.4,
            color: '#C4A87A',
            textTransform: 'uppercase',
            marginBottom: 3,
          }}
        >
          Collection
        </Text>
        <Text
          style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 13.5, color: '#3A2810', lineHeight: 18 }}
          numberOfLines={2}
        >
          {name}
        </Text>
        <View
          style={{
            marginTop: 7,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#F0E5D0',
            borderRadius: 8,
            paddingHorizontal: 7,
            paddingVertical: 2.5,
          }}
        >
          <Droplets size={9} color="#A68555" />
          <Text style={{ fontSize: 10, color: '#A68555', fontWeight: '600' }}>
            {count} {count === 1 ? 'glaze' : 'glazes'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function LibraryGlazesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((state) => state.glazes);
  const glazeTests = useAppStore((state) => state.glazeTests);
  const clayBodies = useAppStore((state) => state.clayBodies);
  const defaultGlazeTemp = useAppStore((state) => state.defaultGlazeTemp);
  const addGlaze = useAppStore((state) => state.addGlaze);
  const addGlazeTest = useAppStore((state) => state.addGlazeTest);

  // ── Collections derived state ──
  const collections = React.useMemo(() => {
    const set = new Set<string>();
    glazes.forEach((g) => g.collections.forEach((c) => set.add(c)));
    return Array.from(set)
      .filter(Boolean)
      .sort((a, b) => {
        if (a === 'My Glazes') return -1;
        if (b === 'My Glazes') return 1;
        return a.localeCompare(b);
      });
  }, [glazes]);

  const glazesByCollection = React.useMemo(() => {
    const map: Record<string, typeof glazes> = {};
    collections.forEach((c) => {
      map[c] = [];
    });
    glazes.forEach((g) => {
      if (g.collections.length === 0) {
        map['Unsorted'] = map['Unsorted'] || [];
        map['Unsorted'].push(g);
      } else {
        g.collections.forEach((c) => {
          if (map[c]) map[c].push(g);
        });
      }
    });
    return map;
  }, [glazes, collections]);

  const allCollectionKeys = React.useMemo(() => {
    const keys = [...collections];
    if ((glazesByCollection['Unsorted']?.length ?? 0) > 0) keys.push('Unsorted');
    return keys;
  }, [collections, glazesByCollection]);

  const collectionRows = React.useMemo(() => {
    const rows: string[][] = [];
    for (let i = 0; i < allCollectionKeys.length; i += 2) {
      rows.push(allCollectionKeys.slice(i, i + 2));
    }
    return rows;
  }, [allCollectionKeys]);

  // ── Recent tests ──
  const recentTests = React.useMemo(
    () =>
      [...glazeTests]
        .sort((a, b) => new Date(b.firingDate).getTime() - new Date(a.firingDate).getTime())
        .slice(0, 8),
    [glazeTests],
  );

  // ── New collection input ──
  const [newFolder, setNewFolder] = React.useState('');
  const [showAddFolder, setShowAddFolder] = React.useState(false);

  const handleAddFolder = () => {
    if (!newFolder.trim() || collections.includes(newFolder.trim())) return;
    setNewFolder('');
    setShowAddFolder(false);
  };

  // ── Add Glaze modal ──
  const [addOpen, setAddOpen] = React.useState(false);
  const [addMode, setAddMode] = React.useState<AddMode>('quick');
  const [draft, setDraft] = React.useState<GlazeDraft>(() =>
    createEmptyGlazeDraft(defaultGlazeTemp, collections),
  );

  const resetAddDraft = React.useCallback(() => {
    setDraft(createEmptyGlazeDraft(defaultGlazeTemp, collections));
    setAddMode('quick');
  }, [defaultGlazeTemp, collections]);

  const pickImage = React.useCallback(async (onPick: (uri: string) => void) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) onPick(result.assets[0].uri);
    } catch {}
  }, []);

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
      collections: draft.collections,
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

  // ── Log Test Tile modal ──
  const [testOpen, setTestOpen] = React.useState(false);
  const [testDraft, setTestDraft] = React.useState<TestDraft>(() =>
    createEmptyTestDraft(glazes[0]?.id ?? '', defaultGlazeTemp),
  );

  React.useEffect(() => {
    if (!testDraft.glazeId && glazes[0]?.id) {
      setTestDraft(createEmptyTestDraft(glazes[0].id, defaultGlazeTemp));
    }
  }, [defaultGlazeTemp, glazes, testDraft.glazeId]);

  const resetTestDraft = React.useCallback(() => {
    setTestDraft(createEmptyTestDraft(glazes[0]?.id ?? '', defaultGlazeTemp));
  }, [defaultGlazeTemp, glazes]);

  const handleSaveTest = () => {
    const selectedGlaze = glazes.find((g) => g.id === testDraft.glazeId);
    if (!selectedGlaze || !testDraft.clayBody.trim() || !testDraft.cone.trim()) return;

    const firingDate =
      testDraft.firingDate.length === 10
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF6EF' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats strip */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
          }}
        >
          {[
            { label: 'Glazes', value: glazes.length },
            { label: 'Tests', value: glazeTests.length },
            { label: 'Collections', value: allCollectionKeys.length },
          ].map(({ label, value }, i, arr) => (
            <React.Fragment key={label}>
              <View>
                <Text
                  style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: '#3A2810' }}
                >
                  {value}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#A68555',
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                  }}
                >
                  {label}
                </Text>
              </View>
              {i < arr.length - 1 && (
                <View style={{ width: 1, height: 30, backgroundColor: '#D9C9A8' }} />
              )}
            </React.Fragment>
          ))}
        </View>

        <View
          style={{
            marginHorizontal: 24,
            marginTop: 20,
            marginBottom: 20,
            height: 1,
            backgroundColor: '#E8D9BE',
          }}
        />

        {/* Recent Test Wall */}
        {recentTests.length > 0 && (
          <>
            <View
              style={{
                marginHorizontal: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: 'Fraunces_600SemiBold',
                    fontSize: 16,
                    color: '#3A2810',
                  }}
                >
                  Recent Test Wall
                </Text>
                <Text style={{ fontSize: 10, color: '#A68555', marginTop: 2 }}>
                  Latest glaze behavior snapshots
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            >
              {recentTests.map((test) => {
                const colorFamily =
                  glazes.find((g) => g.id === test.glazeId)?.colorFamily ??
                  test.glazeNameSnapshot;
                const surfaceColor = glazeCardColor(colorFamily);
                return (
                  <View
                    key={test.id}
                    style={{
                      width: 148,
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: '#E8D9BE',
                      backgroundColor: '#FFFBF4',
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: 108,
                        backgroundColor: surfaceColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: '700',
                          letterSpacing: 1.4,
                          textTransform: 'uppercase',
                          color: 'rgba(58,40,16,0.7)',
                        }}
                      >
                        {test.resultRating === 'great'
                          ? 'Success'
                          : test.resultRating === 'interesting'
                            ? 'Interesting'
                            : 'Retry'}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Fraunces_600SemiBold',
                          fontSize: 13,
                          color: '#3A2810',
                          textAlign: 'center',
                          marginTop: 6,
                        }}
                        numberOfLines={2}
                      >
                        {test.glazeNameSnapshot}
                      </Text>
                    </View>
                    <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#3A2810' }}>
                        {test.clayBody}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#A68555', marginTop: 2 }}>
                        {test.cone} · {GLAZE_THICKNESS_LABELS[test.thickness]}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#A68555', marginTop: 1 }}>
                        {formatShortDate(test.firingDate)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View
              style={{
                marginHorizontal: 24,
                marginTop: 24,
                marginBottom: 20,
                height: 1,
                backgroundColor: '#E8D9BE',
              }}
            />
          </>
        )}

        {/* Collections header */}
        <View
          style={{
            marginHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <Text
            style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#3A2810' }}
          >
            Collections
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddFolder((v) => !v)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E8D9BE',
              backgroundColor: '#FFFBF4',
            }}
          >
            <FolderPlus size={13} color="#A68555" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#A68555' }}>New</Text>
          </TouchableOpacity>
        </View>

        {/* New folder input */}
        {showAddFolder && (
          <View
            style={{
              marginHorizontal: 24,
              marginBottom: 14,
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flex: 1,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#E8D9BE',
                backgroundColor: '#FFFBF4',
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={newFolder}
                onChangeText={setNewFolder}
                placeholder="Collection name…"
                placeholderTextColor="#C4B48C"
                style={{ fontSize: 13, color: '#3A2810', padding: 0 }}
                maxLength={32}
                returnKeyType="done"
                onSubmitEditing={handleAddFolder}
                autoFocus
              />
            </View>
            <TouchableOpacity
              onPress={handleAddFolder}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 14,
                backgroundColor: '#C9963A',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>Create</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Collection specimen cards grid */}
        {allCollectionKeys.length === 0 ? (
          <View
            style={{
              marginHorizontal: 24,
              borderRadius: 20,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#E8D9BE',
              padding: 28,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 30, marginBottom: 8 }}>🏺</Text>
            <Text
              style={{
                fontFamily: 'Fraunces_600SemiBold',
                fontSize: 14,
                color: '#3A2810',
                marginBottom: 4,
              }}
            >
              No collections yet
            </Text>
            <Text
              style={{ fontSize: 12, color: '#A68555', textAlign: 'center', lineHeight: 18 }}
            >
              Add your first glaze and it will appear here as a collection.
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 24, gap: 10 }}>
            {collectionRows.map((row, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: 'row', gap: 10 }}>
                {row.map((collectionName, colIdx) => {
                  const collGlazes = glazesByCollection[collectionName] ?? [];
                  const colors = collGlazes
                    .map((g) => getGlazeColor(g.colorFamily))
                    .filter((c, i, arr) => arr.indexOf(c) === i);
                  const tint = CARD_TINTS[(rowIdx * 2 + colIdx) % CARD_TINTS.length];
                  return (
                    <CollectionCard
                      key={collectionName}
                      name={collectionName}
                      glazeColors={colors}
                      count={collGlazes.length}
                      tint={tint}
                      onPress={() =>
                        router.push(
                          `/glaze-library?collection=${encodeURIComponent(collectionName)}` as never,
                        )
                      }
                    />
                  );
                })}
                {row.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FABs */}
      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom + 16,
          right: 24,
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => (glazes.length > 0 ? setTestOpen(true) : setAddOpen(true))}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            backgroundColor: '#FFFBF4',
            borderWidth: 1,
            borderColor: '#D9C9A8',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 12,
            shadowColor: '#8B6A2A',
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Sparkles size={15} color="#A68555" />
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#7A6040' }}>Log Tile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAddOpen(true)}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#C9963A',
            borderRadius: 20,
            paddingHorizontal: 20,
            paddingVertical: 14,
            shadowColor: '#8B6A2A',
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        >
          <Plus size={16} color="white" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>Add Glaze</Text>
        </TouchableOpacity>
      </View>

      {/* ── Add Glaze Modal ── */}
      <Modal
        visible={addOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setAddOpen(false);
          resetAddDraft();
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.46)' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={() => {
              setAddOpen(false);
              resetAddDraft();
            }}
          />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View
              style={{
                backgroundColor: '#FDFAF5',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                maxHeight: 780,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#D9C9A8',
                  borderRadius: 2,
                  alignSelf: 'center',
                  marginTop: 16,
                  marginBottom: 12,
                }}
              />
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E8D9BE',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, color: '#3A2810' }}
                  >
                    Add Glaze
                  </Text>
                  <Text style={{ fontSize: 13, color: '#A68555', marginTop: 4 }}>
                    Quick add keeps the barrier low. Advanced mode captures the full profile.
                  </Text>
                </View>
              </View>

              <ScrollView
                style={{ paddingHorizontal: 24 }}
                contentContainerStyle={{ paddingBottom: 28 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Mode toggle */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 4 }}>
                  <Pill label="Quick" active={addMode === 'quick'} onPress={() => setAddMode('quick')} />
                  <Pill
                    label="Advanced"
                    active={addMode === 'advanced'}
                    onPress={() => setAddMode('advanced')}
                  />
                </View>

                {/* Glaze name */}
                <View style={{ marginTop: 16 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: '#A68555',
                      marginBottom: 6,
                    }}
                  >
                    Glaze name
                  </Text>
                  <Input
                    value={draft.name}
                    onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
                    placeholder="e.g. Quiet Satin Blue"
                  />
                </View>

                {/* Cone row */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        color: '#A68555',
                        marginBottom: 6,
                      }}
                    >
                      Default cone
                    </Text>
                    <Input
                      value={draft.defaultCone}
                      onChangeText={(v) => setDraft((d) => ({ ...d, defaultCone: v }))}
                      placeholder="Cone 6"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        color: '#A68555',
                        marginBottom: 6,
                      }}
                    >
                      Cone range
                    </Text>
                    <Input
                      value={draft.coneRange}
                      onChangeText={(v) => setDraft((d) => ({ ...d, coneRange: v }))}
                      placeholder="Cone 5-6"
                    />
                  </View>
                </View>

                {/* Finish */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 14,
                    marginBottom: 8,
                  }}
                >
                  Finish
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GLAZE_FINISH_OPTIONS.map((option) => (
                    <Pill
                      key={option}
                      label={GLAZE_FINISH_LABELS[option]}
                      active={draft.finish === option}
                      onPress={() => setDraft((d) => ({ ...d, finish: option }))}
                    />
                  ))}
                </View>

                {/* Source */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 14,
                    marginBottom: 8,
                  }}
                >
                  Source
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GLAZE_SOURCE_OPTIONS.map((option) => (
                    <Pill
                      key={option}
                      label={GLAZE_SOURCE_LABELS[option]}
                      active={draft.source === option}
                      onPress={() => setDraft((d) => ({ ...d, source: option }))}
                    />
                  ))}
                </View>

                {/* Save to collection */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 14,
                    marginBottom: 8,
                  }}
                >
                  Save to collection
                </Text>
                {collections.length === 0 ? (
                  <Text style={{ fontSize: 12, color: '#A68555' }}>
                    No collections yet — glaze will be saved to "My Glazes".
                  </Text>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {collections.map((col) => (
                      <CollectionChip
                        key={col}
                        name={col}
                        selected={draft.collections.includes(col)}
                        onPress={() =>
                          setDraft((d) => ({
                            ...d,
                            collections: d.collections.includes(col)
                              ? d.collections.filter((c) => c !== col)
                              : [...d.collections, col],
                          }))
                        }
                      />
                    ))}
                  </View>
                )}

                {/* Notes */}
                <View style={{ marginTop: 14 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: '#A68555',
                      marginBottom: 6,
                    }}
                  >
                    Quick notes
                  </Text>
                  <Input
                    value={draft.notes}
                    onChangeText={(v) => setDraft((d) => ({ ...d, notes: v }))}
                    placeholder="How this glaze usually behaves"
                    multiline
                    numberOfLines={3}
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                  />
                </View>

                {/* Advanced fields */}
                {addMode === 'advanced' ? (
                  <>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            color: '#A68555',
                            marginBottom: 6,
                          }}
                        >
                          Color family
                        </Text>
                        <Input
                          value={draft.colorFamily}
                          onChangeText={(v) => setDraft((d) => ({ ...d, colorFamily: v }))}
                          placeholder="Blue Grey"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            color: '#A68555',
                            marginBottom: 6,
                          }}
                        >
                          Supplier
                        </Text>
                        <Input
                          value={draft.supplier}
                          onChangeText={(v) => setDraft((d) => ({ ...d, supplier: v }))}
                          placeholder="Amaco, Mayco, Studio"
                        />
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            color: '#A68555',
                            marginBottom: 6,
                          }}
                        >
                          Batch size
                        </Text>
                        <Input
                          value={draft.batchSize}
                          onChangeText={(v) => setDraft((d) => ({ ...d, batchSize: v }))}
                          placeholder="5000 g batch"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            color: '#A68555',
                            marginBottom: 6,
                          }}
                        >
                          Tags
                        </Text>
                        <Input
                          value={draft.tags}
                          onChangeText={(v) => setDraft((d) => ({ ...d, tags: v }))}
                          placeholder="matte, blue, cone 6"
                        />
                      </View>
                    </View>

                    <View style={{ marginTop: 14 }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: 1.5,
                          color: '#A68555',
                          marginBottom: 6,
                        }}
                      >
                        Application notes
                      </Text>
                      <Input
                        value={draft.applicationNotes}
                        onChangeText={(v) => setDraft((d) => ({ ...d, applicationNotes: v }))}
                        placeholder="Brush thin, dip medium, watch the rim"
                        multiline
                        numberOfLines={3}
                        style={{ minHeight: 80, textAlignVertical: 'top' }}
                      />
                    </View>

                    <View style={{ marginTop: 14 }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: 1.5,
                          color: '#A68555',
                          marginBottom: 6,
                        }}
                      >
                        Recipe notes
                      </Text>
                      <Input
                        value={draft.recipeNotes}
                        onChangeText={(v) => setDraft((d) => ({ ...d, recipeNotes: v }))}
                        placeholder="Batch notes, sieve notes, weirdness"
                        multiline
                        numberOfLines={3}
                        style={{ minHeight: 80, textAlignVertical: 'top' }}
                      />
                    </View>

                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        color: '#A68555',
                        marginTop: 14,
                        marginBottom: 8,
                      }}
                    >
                      Starter media
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <MediaSlot
                        label="Bucket photo"
                        uri={draft.bucketPhotoUri}
                        onPress={() =>
                          pickImage((uri) => setDraft((d) => ({ ...d, bucketPhotoUri: uri })))
                        }
                      />
                      <MediaSlot
                        label="Test tile"
                        uri={draft.firstTilePhotoUri}
                        onPress={() =>
                          pickImage((uri) => setDraft((d) => ({ ...d, firstTilePhotoUri: uri })))
                        }
                      />
                      <MediaSlot
                        label="Finished piece"
                        uri={draft.firstPiecePhotoUri}
                        onPress={() =>
                          pickImage((uri) => setDraft((d) => ({ ...d, firstPiecePhotoUri: uri })))
                        }
                      />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                      <Pill
                        label="Favorite"
                        active={draft.favorite}
                        onPress={() => setDraft((d) => ({ ...d, favorite: !d.favorite }))}
                      />
                      <Pill
                        label="Production"
                        active={draft.production}
                        onPress={() => setDraft((d) => ({ ...d, production: !d.production }))}
                      />
                    </View>
                  </>
                ) : null}
              </ScrollView>

              <View
                style={{
                  paddingHorizontal: 24,
                  paddingTop: 16,
                  paddingBottom: 32,
                  borderTopWidth: 1,
                  borderTopColor: '#E8D9BE',
                }}
              >
                <TouchableOpacity
                  onPress={handleSaveGlaze}
                  activeOpacity={0.82}
                  style={{
                    borderRadius: 18,
                    backgroundColor: '#C9963A',
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>Save Glaze</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── Log Test Tile Modal ── */}
      <Modal
        visible={testOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setTestOpen(false);
          resetTestDraft();
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.46)' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={() => {
              setTestOpen(false);
              resetTestDraft();
            }}
          />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View
              style={{
                backgroundColor: '#FDFAF5',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                maxHeight: 760,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#D9C9A8',
                  borderRadius: 2,
                  alignSelf: 'center',
                  marginTop: 16,
                  marginBottom: 12,
                }}
              />
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E8D9BE',
                }}
              >
                <Text
                  style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, color: '#3A2810' }}
                >
                  Log Test Tile
                </Text>
                <Text style={{ fontSize: 13, color: '#A68555', marginTop: 4 }}>
                  Keep it fast: glaze, clay, cone, method, thickness, result.
                </Text>
              </View>

              <ScrollView
                style={{ paddingHorizontal: 24 }}
                contentContainerStyle={{ paddingBottom: 28 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Glaze selector */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                >
                  Glaze
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {glazes.map((glaze) => (
                    <Pill
                      key={glaze.id}
                      label={glaze.name}
                      active={testDraft.glazeId === glaze.id}
                      onPress={() =>
                        setTestDraft((d) => ({
                          ...d,
                          glazeId: glaze.id,
                          cone: glaze.defaultCone || d.cone,
                        }))
                      }
                    />
                  ))}
                </ScrollView>

                {/* Clay + cone */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        color: '#A68555',
                        marginBottom: 6,
                      }}
                    >
                      Clay body
                    </Text>
                    <Input
                      value={testDraft.clayBody}
                      onChangeText={(v) => setTestDraft((d) => ({ ...d, clayBody: v }))}
                      placeholder={clayBodies[0]?.name ?? 'Stoneware'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        color: '#A68555',
                        marginBottom: 6,
                      }}
                    >
                      Cone
                    </Text>
                    <Input
                      value={testDraft.cone}
                      onChangeText={(v) => setTestDraft((d) => ({ ...d, cone: v }))}
                      placeholder={defaultGlazeTemp ?? GLAZE_TEMPS[0]}
                    />
                  </View>
                </View>

                {/* Kiln + shelf */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        color: '#A68555',
                        marginBottom: 6,
                      }}
                    >
                      Kiln
                    </Text>
                    <Input
                      value={testDraft.kilnName}
                      onChangeText={(v) => setTestDraft((d) => ({ ...d, kilnName: v }))}
                      placeholder="North Skutt"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        color: '#A68555',
                        marginBottom: 6,
                      }}
                    >
                      Shelf position
                    </Text>
                    <Input
                      value={testDraft.shelfPosition}
                      onChangeText={(v) => setTestDraft((d) => ({ ...d, shelfPosition: v }))}
                      placeholder="Top shelf"
                    />
                  </View>
                </View>

                {/* Kiln type */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 14,
                    marginBottom: 8,
                  }}
                >
                  Kiln type
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GLAZE_KILN_TYPE_OPTIONS.map((option) => (
                    <Pill
                      key={option}
                      label={GLAZE_KILN_TYPE_LABELS[option]}
                      active={testDraft.kilnType === option}
                      onPress={() => setTestDraft((d) => ({ ...d, kilnType: option }))}
                    />
                  ))}
                </View>

                {/* Application method */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 14,
                    marginBottom: 8,
                  }}
                >
                  Application method
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GLAZE_APPLICATION_METHOD_OPTIONS.map((option) => (
                    <Pill
                      key={option}
                      label={GLAZE_APPLICATION_METHOD_LABELS[option]}
                      active={testDraft.applicationMethod === option}
                      onPress={() => setTestDraft((d) => ({ ...d, applicationMethod: option }))}
                    />
                  ))}
                </View>

                {/* Thickness */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 14,
                    marginBottom: 8,
                  }}
                >
                  Thickness
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GLAZE_THICKNESS_OPTIONS.map((option) => (
                    <Pill
                      key={option}
                      label={GLAZE_THICKNESS_LABELS[option]}
                      active={testDraft.thickness === option}
                      onPress={() => setTestDraft((d) => ({ ...d, thickness: option }))}
                    />
                  ))}
                </View>

                {/* Layered with */}
                <View style={{ marginTop: 14 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: '#A68555',
                      marginBottom: 6,
                    }}
                  >
                    Layered with
                  </Text>
                  <Input
                    value={testDraft.layeredWith}
                    onChangeText={(v) => setTestDraft((d) => ({ ...d, layeredWith: v }))}
                    placeholder="Top glaze, bottom glaze, liner"
                  />
                </View>

                {/* Firing date */}
                <View style={{ marginTop: 14 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: '#A68555',
                      marginBottom: 6,
                    }}
                  >
                    Firing date
                  </Text>
                  <Input
                    value={testDraft.firingDate}
                    onChangeText={(v) => setTestDraft((d) => ({ ...d, firingDate: v }))}
                    placeholder="2026-03-18"
                  />
                </View>

                {/* Result feeling */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 14,
                    marginBottom: 8,
                  }}
                >
                  Result feeling
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GLAZE_RESULT_OPTIONS.map((option) => (
                    <Pill
                      key={option}
                      label={GLAZE_RESULT_LABELS[option]}
                      active={testDraft.resultRating === option}
                      onPress={() => setTestDraft((d) => ({ ...d, resultRating: option }))}
                    />
                  ))}
                </View>

                {/* Defects */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 14,
                    marginBottom: 8,
                  }}
                >
                  Defects
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GLAZE_DEFECT_OPTIONS.map((option) => {
                    const active = testDraft.defects.includes(option);
                    return (
                      <Pill
                        key={option}
                        label={GLAZE_DEFECT_LABELS[option]}
                        active={active}
                        onPress={() =>
                          setTestDraft((d) => ({
                            ...d,
                            defects: active
                              ? d.defects.filter((item) => item !== option)
                              : [...d.defects, option],
                          }))
                        }
                      />
                    );
                  })}
                </View>

                {/* Notes */}
                <View style={{ marginTop: 14 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: '#A68555',
                      marginBottom: 6,
                    }}
                  >
                    Notes
                  </Text>
                  <Input
                    value={testDraft.notes}
                    onChangeText={(v) => setTestDraft((d) => ({ ...d, notes: v }))}
                    placeholder="Surface, color, texture, lesson learned"
                    multiline
                    numberOfLines={3}
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                  />
                </View>

                {/* Photo */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginTop: 14,
                    marginBottom: 8,
                  }}
                >
                  Photo
                </Text>
                <MediaSlot
                  label="Tap to add tile photo"
                  uri={testDraft.photoUri}
                  onPress={() =>
                    pickImage((uri) => setTestDraft((d) => ({ ...d, photoUri: uri })))
                  }
                />
              </ScrollView>

              <View
                style={{
                  paddingHorizontal: 24,
                  paddingTop: 16,
                  paddingBottom: 32,
                  borderTopWidth: 1,
                  borderTopColor: '#E8D9BE',
                }}
              >
                <TouchableOpacity
                  onPress={handleSaveTest}
                  activeOpacity={0.82}
                  style={{
                    borderRadius: 18,
                    backgroundColor: '#C9963A',
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>
                    Save Test Tile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

export default LibraryGlazesScreen;
