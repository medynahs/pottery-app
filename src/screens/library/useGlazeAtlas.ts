import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { glazeDraftToItem } from '@/src/screens/glazes/glazeItemHelpers';
import { useAppStore } from '@/src/store';
import { canAddGlaze, PremiumFeature } from '@/src/utils/premiumGate';
import React from 'react';
import { deriveCustomCollectionNames, sanitizeCustomCollections } from './atlas/collections';
import { hasValidRecipeIngredients } from './atlas/GlazeRecipeBuilder';
import { buildGlazeTestFromDraft } from './atlas/glazeTestDraft';
import type { GlazeDraft, TestDraft } from './atlas/types';
import { scheduleGlazesSync } from './useGlazesSync';

export function useGlazeAtlas() {
  const glazes = useAppStore((state) => state.glazes);
  const glazeTests = useAppStore((state) => state.glazeTests);
  const glazeCollectionNames = useAppStore((state) => state.glazeCollectionNames);
  const clayBodies = useAppStore((state) => state.clayBodies);
  const defaultGlazeTemp = useAppStore((state) => state.defaultGlazeTemp);
  const addGlaze = useAppStore((state) => state.addGlaze);
  const addGlazeTest = useAppStore((state) => state.addGlazeTest);
  const registerGlazeCollections = useAppStore((state) => state.registerGlazeCollections);
  const addGlazeCollection = useAppStore((state) => state.addGlazeCollection);
  const showToast = useAppStore((state) => state.showToast);
  const { requestAccess, PaywallGate } = usePremiumGate();

  const collections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );

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
    if (!draft.name.trim() || !hasValidRecipeIngredients(draft.recipeIngredients)) {
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
    scheduleGlazesSync();
    setAddOpen(false);
    showToast('Glaze saved', 'success');
  }, [addGlaze, registerGlazeCollections, showToast]);

  const handleSaveTest = React.useCallback((testDraft: TestDraft) => {
    const selectedGlaze = glazes.find((g) => g.id === testDraft.glazeId);
    if (!selectedGlaze) return;

    addGlazeTest(
      buildGlazeTestFromDraft(testDraft, {
        id: `glaze-test-${Date.now()}`,
        glazeName: selectedGlaze.name,
      }),
    );
    scheduleGlazesSync();
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
    addGlazeCollection,
    PaywallGate,
  };
}
