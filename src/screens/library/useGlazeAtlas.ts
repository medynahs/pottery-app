import { useAnalytics } from '@/src/hooks/useAnalytics';
import { trackFirstGlazeAdded } from '@/src/utils/productAnalytics';
import { glazeDraftToItem } from '@/src/screens/glazes/glazeItemHelpers';
import { useAppStore, useVisibleGlazes, useVisibleGlazeTests } from '@/src/store';
import React from 'react';
import { deriveCustomCollectionNames, sanitizeCustomCollections } from './atlas/collections';
import { hasValidRecipeIngredients } from './atlas/GlazeRecipeBuilder';
import { buildGlazeTestFromDraft } from './atlas/glazeTestDraft';
import type { GlazeDraft, TestDraft } from './atlas/types';
import { scheduleGlazesSync } from './useGlazesSync';

export function useGlazeAtlas() {
  const glazes = useVisibleGlazes();
  const glazeTests = useVisibleGlazeTests();
  const glazeCollectionNames = useAppStore((state) => state.glazeCollectionNames);
  const clayBodies = useAppStore((state) => state.clayBodies);
  const defaultGlazeTemp = useAppStore((state) => state.defaultGlazeTemp);
  const addGlaze = useAppStore((state) => state.addGlaze);
  const addGlazeTest = useAppStore((state) => state.addGlazeTest);
  const registerGlazeCollections = useAppStore((state) => state.registerGlazeCollections);
  const addGlazeCollection = useAppStore((state) => state.addGlazeCollection);
  const showToast = useAppStore((state) => state.showToast);
  const { trackGlazeCreated, trackTestTileLogged } = useAnalytics();

  const collections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );

  const [addOpen, setAddOpen] = React.useState(false);
  const [testOpen, setTestOpen] = React.useState(false);

  const openAddGlaze = React.useCallback(() => {
    setAddOpen(true);
  }, []);

  const openLogTest = React.useCallback(() => {
    if (glazes.length === 0) {
      showToast('Add a glaze first, then log a test tile', 'error');
      openAddGlaze();
      return;
    }
    setTestOpen(true);
  }, [glazes.length, showToast, openAddGlaze]);

  const handleSaveGlaze = React.useCallback((draft: GlazeDraft) => {
    if (!draft.name.trim()) {
      showToast('Glaze name is required', 'error');
      return;
    }
    if (draft.source !== 'store-bought' && !hasValidRecipeIngredients(draft.recipeIngredients)) {
      showToast('Name and at least one ingredient row are required', 'error');
      return;
    }

    const customCollections = sanitizeCustomCollections(draft.collections);
    registerGlazeCollections(customCollections);

    const id = `glaze-${Date.now()}`;
    addGlaze(
      glazeDraftToItem(
        { ...draft, collections: customCollections },
        { id },
      ),
    );
    trackGlazeCreated({
      source: 'atlas',
      hasRecipe: hasValidRecipeIngredients(draft.recipeIngredients),
    });
    trackFirstGlazeAdded({
      has_recipe: hasValidRecipeIngredients(draft.recipeIngredients),
      source: 'atlas',
    });
    scheduleGlazesSync();
    setAddOpen(false);
    showToast('Glaze saved', 'success');
  }, [addGlaze, registerGlazeCollections, showToast, trackGlazeCreated]);

  const handleSaveTest = React.useCallback((testDraft: TestDraft) => {
    const selectedGlaze = glazes.find((g) => g.id === testDraft.glazeId);
    if (!selectedGlaze) return;

    addGlazeTest(
      buildGlazeTestFromDraft(testDraft, {
        id: `glaze-test-${Date.now()}`,
        glazeName: selectedGlaze.name,
      }),
    );
    trackTestTileLogged({
      glazeId: testDraft.glazeId,
      resultRating: testDraft.resultRating,
    });
    scheduleGlazesSync();
    setTestOpen(false);
    showToast('Test tile saved', 'success');
  }, [addGlazeTest, glazes, showToast, trackTestTileLogged]);

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
    addGlazeCollection,
  };
}
