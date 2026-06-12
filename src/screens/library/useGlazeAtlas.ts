import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useAppStore } from '@/src/store';
import { canAddGlaze, PremiumFeature } from '@/src/utils/premiumGate';
import React from 'react';
import { DEFAULT_GLAZE_COLLECTIONS, normalizeGlazeCollections } from './atlas/collections';
import { parseCommaList } from './atlas/helpers';
import type { GlazeDraft, TestDraft } from './atlas/types';

export function useGlazeAtlas() {
  const glazes = useAppStore((state) => state.glazes);
  const glazeTests = useAppStore((state) => state.glazeTests);
  const clayBodies = useAppStore((state) => state.clayBodies);
  const defaultGlazeTemp = useAppStore((state) => state.defaultGlazeTemp);
  const addGlaze = useAppStore((state) => state.addGlaze);
  const addGlazeTest = useAppStore((state) => state.addGlazeTest);
  const showToast = useAppStore((state) => state.showToast);
  const { requestAccess, PaywallGate } = usePremiumGate();

  const collections = React.useMemo(() => [...DEFAULT_GLAZE_COLLECTIONS], []);

  const [addOpen, setAddOpen] = React.useState(false);
  const [testOpen, setTestOpen] = React.useState(false);

  const openAddGlaze = React.useCallback(() => {
    if (!canAddGlaze(glazes.length)) {
      requestAccess(PremiumFeature.FullGlazeAtlas);
      return;
    }
    setAddOpen(true);
  }, [glazes.length, requestAccess]);

  const openLogTest = React.useCallback(() => {
    if (glazes.length === 0) {
      showToast('Add a glaze first, then log a test tile', 'error');
      openAddGlaze();
      return;
    }
    setTestOpen(true);
  }, [glazes.length, showToast, openAddGlaze]);

  const handleSaveGlaze = React.useCallback((draft: GlazeDraft) => {
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
      collections: normalizeGlazeCollections(),
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
    showToast('Glaze saved', 'success');
  }, [addGlaze, showToast]);

  const handleSaveTest = React.useCallback((testDraft: TestDraft) => {
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
    showToast('Test tile saved', 'success');
  }, [addGlazeTest, glazes, showToast]);

  return {
    glazes,
    glazeTests,
    clayBodies,
    defaultGlazeTemp,
    collections,
    addOpen,
    setAddOpen,
    testOpen,
    setTestOpen,
    openAddGlaze,
    openLogTest,
    handleSaveGlaze,
    handleSaveTest,
    PaywallGate,
  };
}
