import { FixedOverlayBackButton } from '@/src/components/FixedOverlayBackButton';
import { Text } from '@/src/components/ui/text';
import {
  deriveCustomCollectionNames,
  sanitizeCustomCollections,
} from '@/src/screens/library/atlas/collections';
import { scheduleGlazesSync } from '@/src/screens/library/useGlazesSync';
import { GLAZE_FINISH_LABELS } from '@/src/screens/glazes/types';
import type { GlazeFinish } from '@/src/screens/glazes/types';
import { useAppStore } from '@/src/store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeIngredients } from './RecipeIngredients';
import { getDiscoverRecipe, isDiscoverRecipeSaved } from './recipeLookup';
import { discoverGlazeToLibraryItem } from './saveDiscoverGlaze';
import { SaveCollectionSheet } from './SaveCollectionSheet';

export default function DiscoverRecipeScreen({ recipeId }: { recipeId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((s) => s.glazes);
  const user = useAppStore((s) => s.user);
  const glazeCollectionNames = useAppStore((s) => s.glazeCollectionNames);
  const addGlaze = useAppStore((s) => s.addGlaze);
  const registerGlazeCollections = useAppStore((s) => s.registerGlazeCollections);
  const showToast = useAppStore((s) => s.showToast);

  const [saveSheetOpen, setSaveSheetOpen] = React.useState(false);

  const recipe = getDiscoverRecipe(
    recipeId,
    glazes,
    user.name?.trim() || 'My Studio',
  );
  const isDevPreview = Boolean(recipe?.devSourceGlazeId);
  const saved = recipe && !isDevPreview ? isDiscoverRecipeSaved(recipe.id, glazes) : false;
  const collections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );

  const handleSavePress = () => {
    if (!recipe || saved || isDevPreview) return;
    setSaveSheetOpen(true);
  };

  const handleDevOpenGlaze = () => {
    if (!recipe?.devSourceGlazeId) return;
    router.push(`/glaze/${encodeURIComponent(recipe.devSourceGlazeId)}` as never);
  };

  const handleSaveToCollections = (selectedCollections: string[]) => {
    if (!recipe || saved) return;

    const customCollections = sanitizeCustomCollections(selectedCollections);
    registerGlazeCollections(customCollections);
    addGlaze(discoverGlazeToLibraryItem(recipe, customCollections));
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
        </View>

        <View className="px-6 pt-5">
          {isDevPreview ? (
            <View className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Dev preview
              </Text>
              <Text className="text-sm text-muted-foreground mt-1 leading-5">
                This recipe is pulled from My Glazes for local Discover seeding preview.
              </Text>
            </View>
          ) : (
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Starter recipe
            </Text>
          )}
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

      <FixedOverlayBackButton onPress={() => router.back()} />

      <View
        className="absolute left-0 right-0 px-6 pt-3 border-t border-border bg-background"
        style={{ bottom: 0, paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={isDevPreview ? handleDevOpenGlaze : handleSavePress}
          activeOpacity={saved && !isDevPreview ? 1 : 0.85}
          disabled={saved && !isDevPreview}
          className={`flex-row items-center justify-center gap-2 rounded-2xl py-4 ${
            saved && !isDevPreview ? 'bg-muted' : 'bg-primary'
          }`}
        >
          {saved && !isDevPreview ? <Check size={18} color="hsl(24 20% 40%)" /> : null}
          <Text className={`text-sm font-semibold ${saved && !isDevPreview ? 'text-muted-foreground' : 'text-white'}`}>
            {isDevPreview
              ? 'Open in My Glazes'
              : saved
                ? 'Saved to My Glazes'
                : 'Save to My Glazes'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
