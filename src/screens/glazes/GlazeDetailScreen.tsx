import { ConfirmSheet } from '@/src/components/AppSheets';
import { ImageLightbox } from '@/src/components/ImageLightbox';
import { Text } from '@/src/components/ui/text';
import { AddGlazeModal } from '@/src/screens/library/atlas/AddGlazeModal';
import { LogTestModal } from '@/src/screens/library/atlas/LogTestModal';
import { buildGlazeTestFromDraft } from '@/src/screens/library/atlas/glazeTestDraft';
import { CommunityProvenanceBanner } from '@/src/screens/glazes/components/CommunityProvenanceBanner';
import { DiscoverProvenanceBanner } from '@/src/screens/glazes/components/DiscoverProvenanceBanner';
import { GlazeBatchScalerCard } from '@/src/screens/glazes/components/GlazeBatchScalerCard';
import { GlazeStatusPill, GlazeStatusPillRow } from '@/src/screens/glazes/components/GlazeStatusPill';
import { ShareGlazeRecipeSheet } from '@/src/screens/glazes/ShareGlazeRecipeSheet';
import {
  formatShortDate,
  glazeCardColor,
  glazeToEditDraft,
} from '@/src/screens/library/atlas/helpers';
import {
  formatDaysSinceMixed,
  resolveGlazeStatus,
} from '@/src/screens/library/atlas/glazeListUtils';
import { scheduleGlazesSync } from '@/src/screens/library/useGlazesSync';
import { GlazeThumbnail } from '@/src/screens/library/atlas/GlazeThumbnail';
import type { GlazeDraft, TestDraft } from '@/src/screens/library/atlas/types';
import { sanitizeCustomCollections, deriveCustomCollectionNames } from '@/src/screens/library/atlas/collections';
import { hasValidRecipeIngredients } from '@/src/screens/library/atlas/GlazeRecipeBuilder';
import { GlazeRecipeSummary } from '@/src/screens/library/atlas/GlazeRecipeSummary';
import { glazeDraftToItem, normalizeGlazeItem } from '@/src/screens/glazes/glazeItemHelpers';
import {
  buildGlazeTestInsight,
} from '@/src/screens/glazes/glazeTestStats';
import { glazeCardColorForItem, resolveGlazePhotoUri, selectPiecesByGlazeId } from '@/src/screens/glazes/glazePieceLink';
import { CompareVersionsModal } from '@/src/screens/glazes/CompareVersionsModal';
import { GlazeStatusOrb } from '@/src/screens/glazes/components/GlazeStatusOrb';
import {
  buildNewVersionDraft,
  computeNextVersionNumber,
  formatGlazeDisplayName,
  formatVersionStatsLine,
  getGlazeRootId,
  getGlazeVersions,
} from '@/src/screens/glazes/glazeVersionUtils';
import { GLAZE_OUTCOME_LABELS } from '@/src/screens/pieces/utils/constants';
import { formatDateShort } from '@/src/utils/dates';
import { useAppStore, useVisiblePieces, useVisibleGlazes, useVisibleGlazeTests } from '@/src/store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronLeft, GitBranchPlus, Pencil, Share2, Sparkles, Star, Trash2, ArrowLeftRight } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GLAZE_ATMOSPHERE_LABELS,
  GLAZE_CLAY_TYPE_LABELS,
  GLAZE_FINISH_LABELS,
  GLAZE_RESULT_LABELS,
  GLAZE_STATUS_LABELS,
  GLAZE_STATUS_OPTIONS,
  type GlazeLibraryItem,
  type GlazeStatus,
  type GlazeTestTile,
} from './types';

function resultTone(result: GlazeTestTile['resultRating']) {
  if (result === 'great') return { bg: 'bg-green-50 border-green-100', text: 'text-green-700' };
  if (result === 'bad') return { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700' };
  return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-3 py-2 border-b border-border/60 last:border-b-0">
      <Text className="w-24 text-xs text-muted-foreground shrink-0">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value}</Text>
    </View>
  );
}

function BatchDetailsCard({ glaze }: { glaze: GlazeLibraryItem }) {
  const rows: Array<{ label: string; value: string }> = [];

  rows.push({ label: 'Finish', value: GLAZE_FINISH_LABELS[glaze.finish] });

  if (glaze.bestClayType) {
    rows.push({ label: 'Works on', value: GLAZE_CLAY_TYPE_LABELS[glaze.bestClayType] });
  }

  if (glaze.bestFiringTempC) {
    rows.push({
      label: 'Firing temp',
      value: `${glaze.bestFiringTempC}°C${glaze.defaultCone ? ` (${glaze.defaultCone})` : ''}`,
    });
  } else if (glaze.defaultCone || glaze.coneRange) {
    rows.push({ label: 'Cone', value: glaze.defaultCone || glaze.coneRange });
  }

  if (glaze.atmosphere) {
    rows.push({ label: 'Atmosphere', value: GLAZE_ATMOSPHERE_LABELS[glaze.atmosphere] });
  }

  if (glaze.supplier) {
    rows.push({ label: 'Supplier', value: glaze.supplier });
  }

  const hasNotes = Boolean(glaze.notes?.trim());

  if (rows.length === 0 && !hasNotes) return null;

  return (
    <View className="mt-5 rounded-2xl border border-border bg-card px-4 py-3">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Batch details
      </Text>
      {rows.map((row) => (
        <DetailRow key={row.label} label={row.label} value={row.value} />
      ))}
      {hasNotes ? (
        <View className="pt-3 mt-1">
          <Text className="text-xs text-muted-foreground mb-1">Notes</Text>
          <Text className="text-sm text-foreground leading-5">{glaze.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function GlazeDetailScreen({ glazeId }: { glazeId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useVisibleGlazes();
  const glazeTests = useVisibleGlazeTests();
  const pieces = useVisiblePieces();
  const clayBodies = useAppStore((s) => s.clayBodies);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const toggleFavoriteGlaze = useAppStore((s) => s.toggleFavoriteGlaze);
  const addGlaze = useAppStore((s) => s.addGlaze);
  const updateGlaze = useAppStore((s) => s.updateGlaze);
  const deleteGlaze = useAppStore((s) => s.deleteGlaze);
  const deleteGlazeTest = useAppStore((s) => s.deleteGlazeTest);
  const addGlazeTest = useAppStore((s) => s.addGlazeTest);
  const registerGlazeCollections = useAppStore((s) => s.registerGlazeCollections);
  const glazeCollectionNames = useAppStore((s) => s.glazeCollectionNames);
  const showToast = useAppStore((s) => s.showToast);

  const [editOpen, setEditOpen] = React.useState(false);
  const [newVersionOpen, setNewVersionOpen] = React.useState(false);
  const [compareOpen, setCompareOpen] = React.useState(false);
  const [logTestOpen, setLogTestOpen] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [confirmDeleteGlaze, setConfirmDeleteGlaze] = React.useState(false);
  const [pendingDeleteTest, setPendingDeleteTest] = React.useState<GlazeTestTile | null>(null);
  const [shareOpen, setShareOpen] = React.useState(false);

  const glaze = glazes.find((g) => g.id === glazeId);

  const collections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );

  const editDraft = React.useMemo(
    () => (glaze ? glazeToEditDraft(glaze) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editOpen],
  );

  const versionFamily = React.useMemo(
    () => (glaze ? getGlazeVersions(glazes, getGlazeRootId(glaze)) : []),
    [glaze, glazes],
  );

  const nextVersionNumber = React.useMemo(
    () => (glaze ? computeNextVersionNumber(glazes, glaze) : 2),
    [glaze, glazes],
  );

  const newVersionDraft = React.useMemo(
    () => (glaze ? buildNewVersionDraft(glaze) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newVersionOpen],
  );

  const displayName = React.useMemo(
    () =>
      glaze
        ? formatGlazeDisplayName(glaze, {
            alwaysShowVersion: versionFamily.length > 1 || (glaze.versionNumber ?? 1) > 1,
          })
        : '',
    [glaze, versionFamily.length],
  );

  const handleEditGlaze = React.useCallback(
    (draft: GlazeDraft) => {
      if (!glaze) return;
      if (!draft.name.trim() || !hasValidRecipeIngredients(draft.recipeIngredients)) {
        showToast('Name and at least one ingredient row are required', 'error');
        return;
      }
      const customCollections = sanitizeCustomCollections(draft.collections);
      registerGlazeCollections(customCollections);
      updateGlaze(
        glazeDraftToItem(
          { ...draft, collections: customCollections },
          { id: glaze.id, existing: glaze },
        ),
      );
      scheduleGlazesSync();
      setEditOpen(false);
      showToast('Glaze updated', 'success');
    },
    [glaze, updateGlaze, registerGlazeCollections, showToast],
  );

  const openNewVersion = React.useCallback(() => {
    setNewVersionOpen(true);
  }, []);

  const handleSaveNewVersion = React.useCallback(
    (draft: GlazeDraft) => {
      if (!glaze) return;
      if (!draft.name.trim() || !hasValidRecipeIngredients(draft.recipeIngredients)) {
        showToast('Name and at least one ingredient row are required', 'error');
        return;
      }
      const customCollections = sanitizeCustomCollections(draft.collections);
      registerGlazeCollections(customCollections);
      const id = `glaze-${Date.now()}`;
      const versionNumber = computeNextVersionNumber(glazes, glaze);
      addGlaze(
        glazeDraftToItem(
          { ...draft, collections: customCollections },
          { id, versionFromParent: { parent: glaze, versionNumber } },
        ),
      );
      scheduleGlazesSync();
      setNewVersionOpen(false);
      showToast(`Version ${versionNumber} saved`, 'success');
      router.replace(`/glaze/${id}` as never);
    },
    [addGlaze, glaze, glazes, registerGlazeCollections, router, showToast],
  );

  const handleStatusChange = React.useCallback(
    (status: GlazeStatus) => {
      if (!glaze) return;
      updateGlaze(normalizeGlazeItem({ ...glaze, status }));
      scheduleGlazesSync();
    },
    [glaze, updateGlaze],
  );

  const tests = React.useMemo(
    () =>
      glazeTests
        .filter((t) => t.glazeId === glazeId)
        .sort((a, b) => new Date(b.firingDate).getTime() - new Date(a.firingDate).getTime()),
    [glazeTests, glazeId],
  );

  const linkedPieces = React.useMemo(
    () =>
      selectPiecesByGlazeId(pieces, glazeId).sort(
        (a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime(),
      ),
    [pieces, glazeId],
  );

  const testStatsLine = React.useMemo(
    () => (glaze ? formatVersionStatsLine(glaze.id, tests, pieces) : ''),
    [glaze, tests, pieces],
  );
  const testInsight = React.useMemo(
    () => buildGlazeTestInsight(tests, linkedPieces),
    [tests, linkedPieces],
  );

  const heroUri =
    glaze?.bucketPhotoUri ??
    tests[0]?.photoUri ??
    glaze?.testTilePhotoUris[0];

  const handleSaveTest = React.useCallback(
    (testDraft: TestDraft) => {
      const selectedGlaze = glazes.find((g) => g.id === testDraft.glazeId);
      if (!selectedGlaze) return;

      addGlazeTest(
        buildGlazeTestFromDraft(testDraft, {
          id: `glaze-test-${Date.now()}`,
          glazeName: selectedGlaze.name,
        }),
      );
      scheduleGlazesSync();
      setLogTestOpen(false);
      showToast('Test tile saved', 'success');
    },
    [addGlazeTest, glazes, showToast],
  );

  if (!glaze) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-lg text-foreground mb-4" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
          Glaze not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="px-4 py-2 rounded-xl bg-primary">
          <Text className="text-sm font-semibold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = resolveGlazeStatus(glaze);
  const mixedLabel = glaze.dateMixed ? formatDateShort(glaze.dateMixed) : null;
  const mixedAgeLabel = formatDaysSinceMixed(glaze);
  const hasRecipe =
    (glaze.recipeIngredients?.length ?? 0) > 0 || Boolean(glaze.ingredientsText?.trim());

  return (
    <View className="flex-1 bg-background">
      <ImageLightbox
        visible={lightboxOpen}
        uri={heroUri}
        onClose={() => setLightboxOpen(false)}
      />

      <ConfirmSheet
        visible={confirmDeleteGlaze}
        title="Delete glaze?"
        body={`"${glaze.name}" and all its test tiles will be removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          deleteGlaze(glaze.id);
          scheduleGlazesSync();
          setConfirmDeleteGlaze(false);
          router.back();
        }}
        onCancel={() => setConfirmDeleteGlaze(false)}
      />
      <ConfirmSheet
        visible={!!pendingDeleteTest}
        title="Remove test tile?"
        body={
          pendingDeleteTest
            ? `Remove the ${formatShortDate(pendingDeleteTest.firingDate)} entry?`
            : ''
        }
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (pendingDeleteTest) {
            deleteGlazeTest(pendingDeleteTest.id);
            scheduleGlazesSync();
          }
          setPendingDeleteTest(null);
        }}
        onCancel={() => setPendingDeleteTest(null)}
      />

      <AddGlazeModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEditGlaze}
        defaultCone={defaultGlazeTemp}
        collections={collections}
        onCreateCollection={(name) => registerGlazeCollections([name])}
        initialDraft={editDraft}
      />

      <LogTestModal
        visible={logTestOpen}
        onClose={() => setLogTestOpen(false)}
        onSave={handleSaveTest}
        glazes={glazes}
        clayBodies={clayBodies}
        defaultGlazeTemp={defaultGlazeTemp}
        preselectedGlazeId={glazeId}
      />

      <AddGlazeModal
        visible={newVersionOpen}
        onClose={() => setNewVersionOpen(false)}
        onSave={handleSaveNewVersion}
        defaultCone={defaultGlazeTemp}
        collections={collections}
        onCreateCollection={(name) => registerGlazeCollections([name])}
        initialDraft={newVersionDraft}
        mode="new-version"
        versionLabel={`v${nextVersionNumber}`}
      />

      <CompareVersionsModal
        visible={compareOpen}
        onClose={() => setCompareOpen(false)}
        versions={versionFamily}
        initialLeftId={versionFamily[0]?.id ?? glazeId}
        initialRightId={glazeId}
        tests={glazeTests}
        pieces={pieces}
      />

      <ShareGlazeRecipeSheet
        glaze={glaze ?? null}
        linkedPieces={linkedPieces}
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View style={{ paddingTop: insets.top }} className="relative">
          <TouchableOpacity
            activeOpacity={heroUri ? 0.92 : 1}
            onPress={() => {
              if (heroUri) setLightboxOpen(true);
            }}
            disabled={!heroUri}
          >
            {heroUri ? (
              <Image source={{ uri: heroUri }} style={{ width: '100%', height: 260 }} contentFit="cover" />
            ) : (
              <View
                style={{ width: '100%', height: 260, backgroundColor: glazeCardColor(glaze.colorFamily) }}
              />
            )}
          </TouchableOpacity>

          <View
            className="absolute inset-x-0 bottom-0 h-28"
            style={{ backgroundColor: 'rgba(0,0,0,0.42)' }}
          />
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="absolute left-4 w-10 h-10 rounded-full bg-black/40 items-center justify-center"
            style={{ top: insets.top + 8 }}
          >
            <ChevronLeft size={22} color="white" />
          </TouchableOpacity>
          <View className="absolute bottom-4 left-5 right-5">
            <Text className="text-2xl text-white" style={{ fontFamily: 'Fraunces_700Bold' }}>
              {displayName}
            </Text>
            <View className="flex-row flex-wrap items-center gap-2 mt-2">
              {glaze.batchId ? (
                <View className="px-2.5 py-1 rounded-full bg-white/15 border border-white/20">
                  <Text className="text-[11px] font-semibold text-white">{glaze.batchId}</Text>
                </View>
              ) : null}
              {mixedLabel ? (
                <Text className="text-xs text-white/85">
                  Mixed {mixedLabel}
                  {mixedAgeLabel ? ` · ${mixedAgeLabel.replace(/^Mixed /, '')}` : ''}
                </Text>
              ) : null}
            </View>
            <Text className="text-sm text-white/80 mt-1.5">
              {glaze.defaultCone || glaze.coneRange} · {GLAZE_FINISH_LABELS[glaze.finish]}
            </Text>
          </View>
        </View>

        <View className="px-6 pt-5">
          <View className="flex-row flex-wrap gap-2">
            <TouchableOpacity
              onPress={() => setEditOpen(true)}
              activeOpacity={0.85}
              className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary"
            >
              <Pencil size={15} color="white" />
              <Text className="text-xs font-semibold text-white">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLogTestOpen(true)}
              activeOpacity={0.85}
              className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-border bg-card"
            >
              <Sparkles size={15} color="hsl(24 20% 40%)" />
              <Text className="text-xs font-semibold text-foreground">Log Test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openNewVersion}
              activeOpacity={0.85}
              className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-border bg-card"
            >
              <GitBranchPlus size={15} color="hsl(24 20% 40%)" />
              <Text className="text-xs font-semibold text-foreground">New Version</Text>
            </TouchableOpacity>
            {versionFamily.length > 1 ? (
              <TouchableOpacity
                onPress={() => setCompareOpen(true)}
                activeOpacity={0.85}
                className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-border bg-card"
              >
                <ArrowLeftRight size={15} color="hsl(24 20% 40%)" />
                <Text className="text-xs font-semibold text-foreground">Compare</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => setShareOpen(true)}
              activeOpacity={0.85}
              className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-border bg-card"
            >
              <Share2 size={15} color="hsl(24 20% 40%)" />
              <Text className="text-xs font-semibold text-foreground">Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                toggleFavoriteGlaze(glaze.id);
                scheduleGlazesSync();
              }}
              activeOpacity={0.85}
              className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-border bg-card"
            >
              <Star
                size={15}
                color={glaze.favorite ? 'hsl(38 80% 50%)' : 'hsl(24 20% 40%)'}
                fill={glaze.favorite ? 'hsl(38 80% 50%)' : 'none'}
              />
              <Text className="text-xs font-semibold text-foreground">
                {glaze.favorite ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfirmDeleteGlaze(true)}
              activeOpacity={0.85}
              className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50"
            >
              <Trash2 size={15} color="hsl(0 55% 48%)" />
              <Text className="text-xs font-semibold text-rose-700">Delete</Text>
            </TouchableOpacity>
          </View>

          <CommunityProvenanceBanner glaze={glaze} />
          <DiscoverProvenanceBanner glaze={glaze} />

          <View className="mt-5">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
              Status
            </Text>
            <GlazeStatusPillRow>
              {GLAZE_STATUS_OPTIONS.map((option) => (
                <GlazeStatusPill
                  key={option}
                  status={option}
                  active={status === option}
                  onPress={() => handleStatusChange(option)}
                />
              ))}
            </GlazeStatusPillRow>
          </View>

          <View className="mt-5 rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <Text className="text-sm font-semibold text-foreground">{testStatsLine}</Text>
            {testInsight ? (
              <Text className="text-xs text-muted-foreground mt-1 leading-5">{testInsight}</Text>
            ) : null}
          </View>

          {hasRecipe ? (
            <View className="mt-5">
              {glaze.recipeIngredients?.length ? (
                <>
                  <GlazeRecipeSummary
                    ingredients={glaze.recipeIngredients}
                    batchSizeG={glaze.batchSize}
                    onEdit={() => setEditOpen(true)}
                  />
                  <GlazeBatchScalerCard
                    ingredients={glaze.recipeIngredients}
                    linkedPieceCount={linkedPieces.length}
                    defaults={{
                      batchScalerPresetId: glaze.batchScalerPresetId,
                      batchScalerGramsPerPiece: glaze.batchScalerGramsPerPiece,
                      batchScalerWastePercent: glaze.batchScalerWastePercent,
                      batchScalerPieceCount: glaze.batchScalerPieceCount,
                    }}
                    onDefaultsChange={(patch) => {
                      updateGlaze({ ...glaze, ...patch });
                    }}
                  />
                </>
              ) : (
                <View className="rounded-2xl border border-border bg-card px-4 py-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Ingredients
                    </Text>
                    <TouchableOpacity onPress={() => setEditOpen(true)} hitSlop={8}>
                      <Text className="text-[11px] font-semibold text-primary">Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-sm text-foreground leading-5">{glaze.ingredientsText}</Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setEditOpen(true)}
              activeOpacity={0.85}
              className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-4 items-center"
            >
              <Text className="text-sm font-semibold text-foreground">Add recipe</Text>
              <Text className="text-xs text-muted-foreground mt-1">Tap to build the batch formula</Text>
            </TouchableOpacity>
          )}

          <BatchDetailsCard glaze={glaze} />

          {glaze.collections.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mt-4">
              {glaze.collections.map((collection) => (
                <View key={collection} className="px-3 py-1 rounded-full bg-muted border border-border">
                  <Text className="text-[11px] font-semibold text-muted-foreground">{collection}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View className="mt-8">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                Version history
              </Text>
              <Text className="text-xs text-muted-foreground">
                {versionFamily.length} version{versionFamily.length === 1 ? '' : 's'}
              </Text>
            </View>
            {versionFamily.length <= 1 ? (
              <View className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-5">
                <Text className="text-sm text-muted-foreground text-center leading-5">
                  This is the first batch. Tap New Version when you remix the recipe.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {versionFamily.map((version) => {
                  const isCurrent = version.id === glaze.id;
                  const versionStats = formatVersionStatsLine(version.id, glazeTests, pieces);
                  const versionPhotoUri =
                    resolveGlazePhotoUri(version)
                    ?? version.finishedPiecePhotoUris[0]
                    ?? glazeTests.find((test) => test.glazeId === version.id)?.photoUri;
                  return (
                    <TouchableOpacity
                      key={version.id}
                      onPress={() => {
                        if (!isCurrent) router.replace(`/glaze/${version.id}` as never);
                      }}
                      activeOpacity={isCurrent ? 1 : 0.85}
                      className={`flex-row gap-3 rounded-2xl border p-3 ${
                        isCurrent ? 'border-primary bg-primary/5' : 'border-border bg-card'
                      }`}
                    >
                      <GlazeThumbnail
                        uri={versionPhotoUri}
                        colorHex={glazeCardColorForItem(version)}
                        size={72}
                        rounded={12}
                      />
                      <View className="flex-1 min-w-0">
                        <View className="flex-row items-center justify-between gap-2">
                          <Text className="text-sm font-semibold text-foreground flex-1" numberOfLines={1}>
                            {formatGlazeDisplayName(version, { alwaysShowVersion: true })}
                          </Text>
                          {isCurrent ? (
                            <View className="px-2 py-0.5 rounded-full bg-primary/15 shrink-0">
                              <Text className="text-[10px] font-bold text-primary uppercase">Current</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="text-[11px] text-muted-foreground mt-1">
                          Mixed {formatDateShort(version.dateMixed ?? version.createdAt)}
                          {version.batchId ? ` · ${version.batchId}` : ''}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <GlazeStatusOrb status={version.status ?? 'experimental'} size="sm" />
                          <Text className="text-[11px] text-muted-foreground">
                            {GLAZE_STATUS_LABELS[version.status ?? 'experimental']}
                          </Text>
                        </View>
                        <Text className="text-xs text-foreground mt-2">{versionStats}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View className="mt-8">
            <Text className="text-lg text-foreground mb-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
              Pieces using this glaze
            </Text>
            {linkedPieces.length === 0 ? (
              <View className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-5">
                <Text className="text-sm text-muted-foreground text-center leading-5">
                  No pieces linked yet. Choose a studio glaze when creating or editing a piece.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {linkedPieces.map((piece) => {
                  const outcomeLabel = piece.glazeOutcome
                    ? GLAZE_OUTCOME_LABELS[piece.glazeOutcome]
                    : null;
                  return (
                    <TouchableOpacity
                      key={piece.id}
                      onPress={() => {
                        router.push({
                          pathname: '/(tabs)/pieces',
                          params: { openJournalPieceId: String(piece.id) },
                        });
                      }}
                      activeOpacity={0.85}
                      className="flex-row gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      {piece.photo ? (
                        <Image
                          source={{ uri: piece.photo }}
                          style={{ width: 72, height: 72, borderRadius: 12 }}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          className="items-center justify-center bg-muted"
                          style={{ width: 72, height: 72, borderRadius: 12 }}
                        >
                          <Text className="text-[10px] text-muted-foreground">No photo</Text>
                        </View>
                      )}
                      <View className="flex-1 min-w-0">
                        {outcomeLabel ? (
                          <View className="self-start px-2 py-0.5 rounded-full border border-border bg-muted mb-1">
                            <Text className="text-[9px] font-bold uppercase text-muted-foreground">
                              {outcomeLabel}
                            </Text>
                          </View>
                        ) : null}
                        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                          {piece.name}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground mt-0.5">
                          {piece.clay}
                          {piece.stage ? ` · ${piece.stage}` : ''}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground mt-0.5">
                          Updated {formatDateShort(piece.updatedAt ?? piece.createdAt)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View className="mt-8 mb-3 flex-row items-center justify-between">
            <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
              Test timeline
            </Text>
            <Text className="text-xs text-muted-foreground">{tests.length} logged</Text>
          </View>

          {tests.length === 0 ? (
            <View className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-8 items-center">
              <Text className="text-sm text-muted-foreground text-center leading-5">
                No test tiles yet. Log your first firing to build a record for this glaze.
              </Text>
              <TouchableOpacity
                onPress={() => setLogTestOpen(true)}
                className="mt-4 px-4 py-2.5 rounded-xl bg-primary"
              >
                <Text className="text-xs font-semibold text-white">Log Test Tile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {tests.map((test) => {
                const tone = resultTone(test.resultRating);
                const photo = test.photoUri ?? glaze.testTilePhotoUris[0];
                return (
                  <View
                    key={test.id}
                    className="flex-row gap-3 rounded-2xl border border-border bg-card p-3"
                  >
                    <GlazeThumbnail
                      uri={photo}
                      colorHex={glazeCardColor(glaze.colorFamily)}
                      size={72}
                      rounded={12}
                    />
                    <View className="flex-1 min-w-0">
                      <View className={`self-start px-2 py-0.5 rounded-full border mb-1 ${tone.bg}`}>
                        <Text className={`text-[9px] font-bold uppercase ${tone.text}`}>
                          {GLAZE_RESULT_LABELS[test.resultRating]}
                        </Text>
                      </View>
                      <Text className="text-xs text-foreground font-medium">
                        {formatShortDate(test.firingDate)} · {test.clayBody}
                      </Text>
                      <Text className="text-[11px] text-muted-foreground mt-0.5">
                        {test.cone}
                        {test.kilnName ? ` · ${test.kilnName}` : ''}
                      </Text>
                      {test.notes ? (
                        <Text className="text-[11px] text-muted-foreground mt-1 leading-4" numberOfLines={2}>
                          {test.notes}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => setPendingDeleteTest(test)}
                      hitSlop={8}
                      className="p-1 self-start"
                    >
                      <Trash2 size={14} color="hsl(24 20% 55%)" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
