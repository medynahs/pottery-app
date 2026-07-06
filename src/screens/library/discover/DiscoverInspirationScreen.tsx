import { FixedOverlayBackButton } from '@/src/components/FixedOverlayBackButton';
import { Text } from '@/src/components/ui/text';
import { AddGlazeModal } from '@/src/screens/library/atlas/AddGlazeModal';
import { deriveCustomCollectionNames, sanitizeCustomCollections } from '@/src/screens/library/atlas/collections';
import { hasValidRecipeIngredients } from '@/src/screens/library/atlas/GlazeRecipeBuilder';
import type { GlazeDraft } from '@/src/screens/library/atlas/types';
import { glazeDraftToItem } from '@/src/screens/glazes/glazeItemHelpers';
import { scheduleGlazesSync } from '@/src/screens/library/useGlazesSync';
import { useAppStore, useVisibleGlazes } from '@/src/store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ComboProductStrip, ownedProductKeysForCombo } from './ComboProductStrip';
import { discoverProductToGlazeDraft } from './discoverProductDraft';
import { getDiscoverInspiration } from './recipeLookup';
import { useDiscoverCatalog } from './useDiscoverCatalog';
import type { DiscoverProductRef } from './types';

export default function DiscoverInspirationScreen({ inspirationId }: { inspirationId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useVisibleGlazes();
  const glazeCollectionNames = useAppStore((s) => s.glazeCollectionNames);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const addGlaze = useAppStore((s) => s.addGlaze);
  const registerGlazeCollections = useAppStore((s) => s.registerGlazeCollections);
  const showToast = useAppStore((s) => s.showToast);

  const catalogQuery = useDiscoverCatalog({ glazes });
  const inspiration = getDiscoverInspiration(inspirationId, catalogQuery.data);
  const ownedProductKeys = inspiration ? ownedProductKeysForCombo(inspiration, glazes) : new Set<string>();
  const ownedCount = ownedProductKeys.size;
  const productCount = inspiration?.products?.length ?? 0;
  const missingCount = productCount - ownedCount;

  const collections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );

  const [addOpen, setAddOpen] = React.useState(false);
  const [productDraft, setProductDraft] = React.useState<GlazeDraft | undefined>(undefined);

  const handleAddProduct = (product: DiscoverProductRef) => {
    if (!inspiration) return;
    setProductDraft(discoverProductToGlazeDraft(product, inspiration, defaultGlazeTemp));
    setAddOpen(true);
  };

  const handleSaveProduct = (draft: GlazeDraft) => {
    if (!draft.name.trim()) {
      showToast('Glaze name is required', 'error');
      return;
    }
    if (draft.source !== 'store-bought' && !hasValidRecipeIngredients(draft.recipeIngredients)) {
      showToast('At least one ingredient row is required for custom mixes', 'error');
      return;
    }

    const customCollections = sanitizeCustomCollections(draft.collections);
    registerGlazeCollections(customCollections);
    addGlaze(
      glazeDraftToItem({ ...draft, collections: customCollections }, { id: `glaze-${Date.now()}` }),
    );
    scheduleGlazesSync();
    setAddOpen(false);
    setProductDraft(undefined);
    showToast(`${draft.name} added to My Glazes`, 'success');
  };

  if (!inspiration) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-lg text-foreground mb-4" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
          Combo not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="px-4 py-2 rounded-xl bg-primary">
          <Text className="text-sm font-semibold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AddGlazeModal
        visible={addOpen}
        onClose={() => {
          setAddOpen(false);
          setProductDraft(undefined);
        }}
        onSave={handleSaveProduct}
        defaultCone={defaultGlazeTemp}
        collections={collections}
        onCreateCollection={(name) => registerGlazeCollections([name])}
        initialDraft={productDraft}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="relative">
          {inspiration.previewUri ? (
            <Image
              source={{ uri: inspiration.previewUri }}
              style={{ width: '100%', height: 320 }}
              contentFit="cover"
            />
          ) : (
            <View style={{ width: '100%', height: 320, backgroundColor: inspiration.colorHex }} />
          )}
        </View>

        <View className="px-6 pt-5">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Glaze combo
          </Text>
          <Text className="text-3xl text-foreground mt-1" style={{ fontFamily: 'Fraunces_700Bold' }}>
            {inspiration.title}
          </Text>

          <View className="flex-row flex-wrap gap-2 mt-3">
            <View className="px-3 py-1 rounded-full bg-muted">
              <Text className="text-xs font-semibold text-foreground">{inspiration.coneLabel}</Text>
            </View>
            {productCount > 0 && ownedCount > 0 ? (
              <View className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <Text className="text-xs font-semibold text-emerald-800">
                  {ownedCount} of {productCount} in My Glazes
                </Text>
              </View>
            ) : null}
          </View>

          <Text className="text-sm text-muted-foreground mt-4 leading-6">{inspiration.description}</Text>

          <View className="mt-4 rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <Text className="text-sm text-foreground leading-6">
              Combos are layering ideas — add each jar below to My Glazes separately, then log a test tile when you try the stack.
            </Text>
          </View>

          <ComboProductStrip
            inspiration={inspiration}
            ownedProductKeys={ownedProductKeys}
            onAddProduct={handleAddProduct}
          />

          <View className="mt-6 rounded-2xl border border-border bg-card px-4 py-4">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              How to apply
            </Text>
            <Text className="text-sm text-foreground leading-6">{inspiration.applicationNotes}</Text>
          </View>

          {missingCount > 0 ? (
            <Text className="text-xs text-muted-foreground mt-5 leading-5">
              Tap Add on each product you do not own yet — we prefill name and brand from this combo.
            </Text>
          ) : (
            <Text className="text-xs text-muted-foreground mt-5 leading-5">
              You have every product in My Glazes. Log a test tile to record how this stack fires for you.
            </Text>
          )}
        </View>
      </ScrollView>

      <FixedOverlayBackButton onPress={() => router.back()} />
    </View>
  );
}

