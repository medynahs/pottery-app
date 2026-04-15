import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Plus, Sparkles } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddGlazeModal } from './atlas/AddGlazeModal';
import { CollectionsGrid } from './atlas/CollectionsGrid';
import { LogTestModal } from './atlas/LogTestModal';
import { RecentTestWall } from './atlas/RecentTestWall';
import { StatsStrip } from './atlas/StatsStrip';
import { parseCommaList } from './atlas/helpers';
import type { GlazeDraft, TestDraft } from './atlas/types';

function LibraryGlazesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const glazes = useAppStore((state) => state.glazes);
  const glazeTests = useAppStore((state) => state.glazeTests);
  const clayBodies = useAppStore((state) => state.clayBodies);
  const defaultGlazeTemp = useAppStore((state) => state.defaultGlazeTemp);
  const addGlaze = useAppStore((state) => state.addGlaze);
  const addGlazeTest = useAppStore((state) => state.addGlazeTest);

  // ── Collections ──
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
    collections.forEach((c) => { map[c] = []; });
    glazes.forEach((g) => {
      if (g.collections.length === 0) {
        map['Unsorted'] = map['Unsorted'] || [];
        map['Unsorted'].push(g);
      } else {
        g.collections.forEach((c) => { if (map[c]) map[c].push(g); });
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

  // ── New folder state ──
  const [newFolder, setNewFolder] = React.useState('');
  const [showAddFolder, setShowAddFolder] = React.useState(false);

  const handleAddFolder = () => {
    if (!newFolder.trim() || collections.includes(newFolder.trim())) return;
    setNewFolder('');
    setShowAddFolder(false);
  };

  // ── Modal state ──
  const [addOpen, setAddOpen] = React.useState(false);
  const [testOpen, setTestOpen] = React.useState(false);

  // ── Save glaze ──
  const handleSaveGlaze = (draft: GlazeDraft) => {
    addGlaze({
      id: `glaze-${Date.now()}`,
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
  };

  // ── Save test ──
  const handleSaveTest = (testDraft: TestDraft) => {
    const selectedGlaze = glazes.find((g) => g.id === testDraft.glazeId);
    if (!selectedGlaze) return;

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
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF6EF' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <StatsStrip
          glazeCount={glazes.length}
          testCount={glazeTests.length}
          collectionCount={allCollectionKeys.length}
        />

        <View
          style={{
            marginHorizontal: 24,
            marginTop: 20,
            marginBottom: 20,
            height: 1,
            backgroundColor: '#E8D9BE',
          }}
        />

        {recentTests.length > 0 && (
          <RecentTestWall recentTests={recentTests} glazes={glazes} />
        )}

        <CollectionsGrid
          allCollectionKeys={allCollectionKeys}
          collectionRows={collectionRows}
          glazesByCollection={glazesByCollection}
          showAddFolder={showAddFolder}
          setShowAddFolder={setShowAddFolder}
          newFolder={newFolder}
          setNewFolder={setNewFolder}
          onAddFolder={handleAddFolder}
          onPressCollection={(name) =>
            router.push(`/glaze-library?collection=${encodeURIComponent(name)}` as never)
          }
        />
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

      <AddGlazeModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleSaveGlaze}
        defaultCone={defaultGlazeTemp}
        collections={collections}
      />

      <LogTestModal
        visible={testOpen}
        onClose={() => setTestOpen(false)}
        onSave={handleSaveTest}
        glazes={glazes}
        clayBodies={clayBodies}
        defaultGlazeTemp={defaultGlazeTemp}
      />
    </View>
  );
}

export default LibraryGlazesScreen;
