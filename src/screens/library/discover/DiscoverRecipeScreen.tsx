import { Text } from '@/src/components/ui/text';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import {
  deriveCustomCollectionNames,
  sanitizeCustomCollections,
} from '@/src/screens/library/atlas/collections';
import { scheduleGlazesSync } from '@/src/screens/library/useGlazesSync';
import { GLAZE_FINISH_LABELS } from '@/src/screens/glazes/types';
import type { GlazeFinish } from '@/src/screens/glazes/types';
import { useAppStore } from '@/src/store';
import { canAddGlaze, PremiumFeature } from '@/src/utils/premiumGate';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeIngredients } from './RecipeIngredients';
import { getDiscoverRecipe, isDiscoverRecipeSaved } from './recipeLookup';
import { RECIPE_SUCCESS_RATES } from './recipes';
import { SaveCollectionSheet } from './SaveCollectionSheet';

export default function DiscoverRecipeScreen({ recipeId }: { recipeId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((s) => s.glazes);
  const glazeCollectionNames = useAppStore((s) => s.glazeCollectionNames);
  const addGlaze = useAppStore((s) => s.addGlaze);
  const registerGlazeCollections = useAppStore((s) => s.registerGlazeCollections);
  const showToast = useAppStore((s) => s.showToast);
  const { requestAccess, PaywallGate } = usePremiumGate();

  const [saveSheetOpen, setSaveSheetOpen] = React.useState(false);

  const recipe = getDiscoverRecipe(recipeId);
  const saved = recipe ? isDiscoverRecipeSaved(recipe.id, glazes.map((g) => g.id)) : false;
  const successRate = recipe ? RECIPE_SUCCESS_RATES[recipe.id] ?? 75 : 0;
  const collections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );

  const handleSavePress = () => {
    if (!recipe || saved) return;
    if (!canAddGlaze(glazes.length)) {
      requestAccess(PremiumFeature.FullGlazeAtlas);
      return;
    }
    setSaveSheetOpen(true);
  };

  const handleSaveToCollections = (selectedCollections: string[]) => {
    if (!recipe || saved) return;

    const customCollections = sanitizeCustomCollections(selectedCollections);
    registerGlazeCollections(customCollections);

    addGlaze({
      id: `discover-${recipe.id}-${Date.now()}`,
      name: recipe.name,
      finish: recipe.finish as GlazeFinish,
      colorFamily: recipe.colorFamily,
      coneRange: recipe.coneLabel,
      defaultCone: recipe.coneLabel,
      source: 'custom',
      notes: recipe.description,
      collections: customCollections,
      tags: [],
      recipeIngredients: recipe.ingredients.map((ing, i) => ({
        id: `ing-${i}`,
        material: ing.material,
        percentage: String(ing.percentage),
      })),
      favorite: false,
      production: false,
      bucketPhotoUri: recipe.previewUri,
      testTilePhotoUris: recipe.previewUri ? [recipe.previewUri] : [],
      finishedPiecePhotoUris: [],
      accidentPhotoUris: [],
      clayBodiesUsed: [],
      kilnTypesUsed: [],
      conesTested: [],
      createdAt: new Date().toISOString(),
    });
    scheduleGlazesSync();
    setSaveSheetOpen(false);
    showToast(`${recipe.name} saved to My Glazes`, 'success');
  };

  if (!recipe) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-lg text-foreground mb-4" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
          Recipe not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="px-4 py-2 rounded-xl bg-primary">
          <Text className="text-sm font-semibold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const finishLabel = GLAZE_FINISH_LABELS[recipe.finish as GlazeFinish] ?? recipe.finish;

  return (
    <View className="flex-1 bg-background">
      <SaveCollectionSheet
        recipe={saveSheetOpen ? recipe : null}
        collections={collections}
        onClose={() => setSaveSheetOpen(false)}
        onSave={handleSaveToCollections}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View className="relative">
          {recipe.previewUri ? (
            <Image
              source={{ uri: recipe.previewUri }}
              style={{ width: '100%', height: 320 }}
              contentFit="cover"
            />
          ) : (
            <View style={{ width: '100%', height: 320, backgroundColor: recipe.colorHex }} />
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="absolute w-10 h-10 rounded-full bg-black/45 items-center justify-center"
            style={{ top: insets.top + 8, left: 16 }}
          >
            <ChevronLeft size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-6 pt-5">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Starter recipe
          </Text>
          <Text className="text-3xl text-foreground mt-1" style={{ fontFamily: 'Fraunces_700Bold' }}>
            {recipe.name}
          </Text>

          <View className="flex-row flex-wrap gap-2 mt-3">
            <View className="px-3 py-1 rounded-full bg-muted">
              <Text className="text-xs font-semibold text-foreground">{recipe.coneLabel}</Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-muted">
              <Text className="text-xs font-semibold text-foreground">{finishLabel}</Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-muted">
              <Text className="text-xs font-semibold text-muted-foreground">{successRate}% studio success</Text>
            </View>
          </View>

          <Text className="text-sm text-muted-foreground mt-4 leading-6">{recipe.description}</Text>
          <Text className="text-xs text-muted-foreground mt-2">By {recipe.author}</Text>

          <View className="mt-6">
            <RecipeIngredients
              ingredients={recipe.ingredients}
              estimatedCostPer100g={recipe.estimatedCostPer100g}
            />
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute left-0 right-0 px-6 pt-3 border-t border-border bg-background"
        style={{ bottom: 0, paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={handleSavePress}
          activeOpacity={saved ? 1 : 0.85}
          disabled={saved}
          className={`flex-row items-center justify-center gap-2 rounded-2xl py-4 ${saved ? 'bg-muted' : 'bg-primary'}`}
        >
          {saved ? <Check size={18} color="hsl(24 20% 40%)" /> : null}
          <Text className={`text-sm font-semibold ${saved ? 'text-muted-foreground' : 'text-white'}`}>
            {saved ? 'Saved to My Glazes' : 'Save to My Glazes'}
          </Text>
        </TouchableOpacity>
      </View>

      {PaywallGate}
    </View>
  );
}
