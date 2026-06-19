import {
  ModalCard,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { glazeCardColorForItem, resolveGlazePhotoUri } from '@/src/screens/glazes/glazePieceLink';
import { formatGlazeDisplayName } from '@/src/screens/glazes/glazeVersionUtils';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { glazeSearchHaystack } from '@/src/screens/library/atlas/glazeListUtils';
import { GlazeThumbnail } from '@/src/screens/library/atlas/MediaSlot';
import { useAppStore } from '@/src/store';
import { ChevronDown, Search, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, TouchableOpacity, View } from 'react-native';

type GlazePickerFieldProps = {
  value: string;
  onChange: (glazeId: string) => void;
};

function GlazePickerRow({
  glaze,
  active,
  onPress,
}: {
  glaze: GlazeLibraryItem;
  active: boolean;
  onPress: () => void;
}) {
  const photoUri = resolveGlazePhotoUri(glaze);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-row items-center gap-3 px-3 py-2.5 rounded-2xl border ${
        active ? 'border-primary bg-primary/5' : 'border-border bg-card'
      }`}
    >
      <GlazeThumbnail
        uri={photoUri}
        colorHex={glazeCardColorForItem(glaze)}
        size={44}
        rounded={10}
      />
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {formatGlazeDisplayName(glaze)}
        </Text>
        <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={1}>
          {[glaze.batchId, glaze.defaultCone || glaze.coneRange].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function GlazePickerField({ value, onChange }: GlazePickerFieldProps) {
  const glazes = useAppStore((s) => s.glazes);
  const sheetHeight = useModalSheetHeight();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const selectedGlaze = React.useMemo(
    () => glazes.find((glaze) => glaze.id === value),
    [glazes, value],
  );

  const filteredGlazes = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return glazes;
    return glazes.filter((glaze) => glazeSearchHaystack(glaze).includes(normalized));
  }, [glazes, query]);

  const openSheet = React.useCallback(() => {
    setQuery('');
    setSheetOpen(true);
  }, []);

  const handleSelect = React.useCallback(
    (glazeId: string) => {
      onChange(glazeId);
      setSheetOpen(false);
    },
    [onChange],
  );

  const handleClear = React.useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <>
      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel="Select studio glaze"
        className="rounded-2xl border border-border bg-card px-3 py-3"
      >
        {selectedGlaze ? (
          <View className="flex-row items-center gap-3">
            <GlazeThumbnail
              uri={resolveGlazePhotoUri(selectedGlaze)}
              colorHex={glazeCardColorForItem(selectedGlaze)}
              size={52}
              rounded={12}
            />
            <View className="flex-1 min-w-0">
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {formatGlazeDisplayName(selectedGlaze)}
              </Text>
              <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={1}>
                {[selectedGlaze.batchId, selectedGlaze.defaultCone || selectedGlaze.coneRange]
                  .filter(Boolean)
                  .join(' · ') || 'Studio glaze batch'}
              </Text>
            </View>
            <ChevronDown size={18} color="hsl(24 20% 55%)" />
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">Choose a glaze from your atlas</Text>
            <ChevronDown size={18} color="hsl(24 20% 55%)" />
          </View>
        )}
      </Pressable>

      {selectedGlaze ? (
        <TouchableOpacity onPress={handleClear} activeOpacity={0.75} className="self-start mt-2">
          <Text className="text-xs font-semibold text-primary">Clear glaze link</Text>
        </TouchableOpacity>
      ) : null}

      <ModalShell visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
          <ModalSheetHeader>
            <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              Select Glaze
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Link this piece to a batch in your glaze atlas.
            </Text>
          </ModalSheetHeader>

          <View className="px-6 pt-5 pb-2">
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Search size={16} color="hsl(24 20% 40%)" />
              </View>
              {query.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setQuery('')}
                  hitSlop={8}
                  activeOpacity={0.7}
                  className="absolute right-4 z-10"
                >
                  <X size={16} color="hsl(24 20% 40%)" />
                </TouchableOpacity>
              ) : null}
              <Input
                value={query}
                onChangeText={setQuery}
                placeholder="Search glazes…"
                className={`pl-11 rounded-2xl bg-card border-border ${query.length > 0 ? 'pr-11' : ''}`}
              />
            </View>
          </View>

          <ScrollView
            className="px-6"
            style={{ flex: 1, minHeight: 0 }}
            contentContainerStyle={{ paddingBottom: 24, gap: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredGlazes.length === 0 ? (
              <View className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 items-center">
                <Text className="text-sm text-muted-foreground text-center leading-5">
                  {glazes.length === 0
                    ? 'No glazes in your atlas yet. Add one from the Glaze tab first.'
                    : 'No glazes match your search.'}
                </Text>
              </View>
            ) : (
              filteredGlazes.map((glaze) => (
                <GlazePickerRow
                  key={glaze.id}
                  glaze={glaze}
                  active={value === glaze.id}
                  onPress={() => handleSelect(glaze.id)}
                />
              ))
            )}
          </ScrollView>
        </ModalCard>
      </ModalShell>
    </>
  );
}
