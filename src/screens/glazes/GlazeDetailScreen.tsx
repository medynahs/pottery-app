import { ConfirmSheet } from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { LogTestModal } from '@/src/screens/library/atlas/LogTestModal';
import { formatShortDate, glazeCardColor, parseCommaList } from '@/src/screens/library/atlas/helpers';
import { scheduleGlazesSync } from '@/src/screens/library/useGlazesSync';
import { GlazeThumbnail } from '@/src/screens/library/atlas/MediaSlot';
import type { TestDraft } from '@/src/screens/library/atlas/types';
import { useAppStore } from '@/src/store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, Star, Trash2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GLAZE_FINISH_LABELS,
  GLAZE_RESULT_LABELS,
  GLAZE_SOURCE_LABELS,
  type GlazeTestTile,
} from './types';

function resultTone(result: GlazeTestTile['resultRating']) {
  if (result === 'great') return { bg: 'bg-green-50 border-green-100', text: 'text-green-700' };
  if (result === 'bad') return { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700' };
  return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' };
}

export default function GlazeDetailScreen({ glazeId }: { glazeId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((s) => s.glazes);
  const glazeTests = useAppStore((s) => s.glazeTests);
  const clayBodies = useAppStore((s) => s.clayBodies);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const toggleFavoriteGlaze = useAppStore((s) => s.toggleFavoriteGlaze);
  const deleteGlaze = useAppStore((s) => s.deleteGlaze);
  const deleteGlazeTest = useAppStore((s) => s.deleteGlazeTest);
  const addGlazeTest = useAppStore((s) => s.addGlazeTest);
  const showToast = useAppStore((s) => s.showToast);

  const [logTestOpen, setLogTestOpen] = React.useState(false);
  const [confirmDeleteGlaze, setConfirmDeleteGlaze] = React.useState(false);
  const [pendingDeleteTest, setPendingDeleteTest] = React.useState<GlazeTestTile | null>(null);

  const glaze = glazes.find((g) => g.id === glazeId);
  const tests = React.useMemo(
    () =>
      glazeTests
        .filter((t) => t.glazeId === glazeId)
        .sort((a, b) => new Date(b.firingDate).getTime() - new Date(a.firingDate).getTime()),
    [glazeTests, glazeId],
  );

  const heroUri =
    glaze?.bucketPhotoUri ??
    tests[0]?.photoUri ??
    glaze?.testTilePhotoUris[0];

  const handleSaveTest = React.useCallback(
    (testDraft: TestDraft) => {
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

  return (
    <View className="flex-1 bg-background">
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

      <LogTestModal
        visible={logTestOpen}
        onClose={() => setLogTestOpen(false)}
        onSave={handleSaveTest}
        glazes={glazes}
        clayBodies={clayBodies}
        defaultGlazeTemp={defaultGlazeTemp}
        preselectedGlazeId={glazeId}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View style={{ paddingTop: insets.top }} className="relative">
          {heroUri ? (
            <Image source={{ uri: heroUri }} style={{ width: '100%', height: 260 }} contentFit="cover" />
          ) : (
            <View
              style={{ width: '100%', height: 260, backgroundColor: glazeCardColor(glaze.colorFamily) }}
            />
          )}
          <View
            className="absolute inset-x-0 bottom-0 h-24"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
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
              {glaze.name}
            </Text>
            <Text className="text-sm text-white/85 mt-1">
              {glaze.defaultCone || glaze.coneRange} · {GLAZE_FINISH_LABELS[glaze.finish]} ·{' '}
              {GLAZE_SOURCE_LABELS[glaze.source]}
            </Text>
          </View>
        </View>

        <View className="px-6 pt-5">
          <View className="flex-row flex-wrap gap-2">
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
              onPress={() => setLogTestOpen(true)}
              activeOpacity={0.85}
              className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary"
            >
              <Sparkles size={15} color="white" />
              <Text className="text-xs font-semibold text-white">Log Test</Text>
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

          {glaze.notes ? (
            <View className="mt-5 rounded-2xl border border-border bg-card px-4 py-3">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Notes
              </Text>
              <Text className="text-sm text-foreground leading-5">{glaze.notes}</Text>
            </View>
          ) : null}

          {glaze.supplier ? (
            <Text className="text-xs text-muted-foreground mt-4">Supplier: {glaze.supplier}</Text>
          ) : null}

          {glaze.collections.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mt-4">
              {glaze.collections.map((collection) => (
                <View key={collection} className="px-3 py-1 rounded-full bg-muted border border-border">
                  <Text className="text-[11px] font-semibold text-muted-foreground">{collection}</Text>
                </View>
              ))}
            </View>
          ) : null}

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
