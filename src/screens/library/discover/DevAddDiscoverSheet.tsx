import { Text } from '@/src/components/ui/text';
import {
  ModalCard,
  ModalFormScrollView,
  ModalShell,
  ModalSheetHeader,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { glazeCardColor } from '@/src/screens/library/atlas/helpers';
import { resolveGlazePhotoUri } from '@/src/screens/glazes/glazePieceLink';
import { useAppStore } from '@/src/store';
import { Image } from 'expo-image';
import { Check, Plus, Trash2 } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

function GlazePickRow({
  glaze,
  selected,
  onToggle,
}: {
  glaze: GlazeLibraryItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const previewUri = resolveGlazePhotoUri(glaze);
  const colorHex = glazeCardColor(glaze.colorFamily);

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-border"
    >
      <View
        className="w-12 h-12 rounded-xl overflow-hidden border border-border"
        style={{ backgroundColor: colorHex }}
      >
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : null}
      </View>

      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {glaze.name}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
          {glaze.defaultCone || glaze.coneRange || 'Cone ?'} · {glaze.finish}
        </Text>
      </View>

      <View
        className={`w-7 h-7 rounded-full items-center justify-center border ${
          selected ? 'bg-primary border-primary' : 'bg-muted border-border'
        }`}
      >
        {selected ? <Check size={14} color="white" /> : <Plus size={14} color="hsl(24 20% 45%)" />}
      </View>
    </TouchableOpacity>
  );
}

export function DevAddDiscoverSheet({
  visible,
  glazes,
  onClose,
}: {
  visible: boolean;
  glazes: GlazeLibraryItem[];
  onClose: () => void;
}) {
  const sheetHeight = useModalSheetHeight(0.88);
  const devDiscoverGlazeIds = useAppStore((s) => s.devDiscoverGlazeIds);
  const addDevDiscoverGlaze = useAppStore((s) => s.addDevDiscoverGlaze);
  const removeDevDiscoverGlaze = useAppStore((s) => s.removeDevDiscoverGlaze);
  const clearDevDiscoverGlazes = useAppStore((s) => s.clearDevDiscoverGlazes);
  const showToast = useAppStore((s) => s.showToast);

  const sortedGlazes = React.useMemo(
    () => [...glazes].sort((a, b) => a.name.localeCompare(b.name)),
    [glazes],
  );

  const toggleGlaze = (glazeId: string) => {
    if (devDiscoverGlazeIds.includes(glazeId)) {
      removeDevDiscoverGlaze(glazeId);
      return;
    }
    addDevDiscoverGlaze(glazeId);
  };

  const handleClear = () => {
    clearDevDiscoverGlazes();
    showToast('Cleared dev Discover previews', 'success');
  };

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard radius={32} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Add to Discover (dev)
          </Text>
          <Text className="text-xs text-muted-foreground mt-1 leading-5">
            Preview your glazes in Discover before seeding the catalog.
          </Text>
        </ModalSheetHeader>

        <View className="px-6 pb-3 flex-row items-center justify-between">
          <Text className="text-xs text-muted-foreground">
            {devDiscoverGlazeIds.length} in Discover preview
          </Text>
          {devDiscoverGlazeIds.length > 0 ? (
            <TouchableOpacity
              onPress={handleClear}
              activeOpacity={0.85}
              className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-destructive/10"
            >
              <Trash2 size={12} color="hsl(0 65% 48%)" />
              <Text className="text-[11px] font-semibold text-destructive">Clear all</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ModalFormScrollView
          className="flex-1 border-t border-border"
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {sortedGlazes.length === 0 ? (
            <View className="px-6 py-10">
              <Text className="text-sm text-muted-foreground text-center">
                Add glazes to My Glazes first, then pick them here.
              </Text>
            </View>
          ) : (
            sortedGlazes.map((glaze) => (
              <GlazePickRow
                key={glaze.id}
                glaze={glaze}
                selected={devDiscoverGlazeIds.includes(glaze.id)}
                onToggle={() => toggleGlaze(glaze.id)}
              />
            ))
          )}
        </ModalFormScrollView>
      </ModalCard>
    </ModalShell>
  );
}
