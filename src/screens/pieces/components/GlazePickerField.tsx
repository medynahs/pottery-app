import { DropdownField } from '@/src/components/DropdownField';
import { Text } from '@/src/components/ui/text';
import { glazeCardColorForItem, resolveGlazePhotoUri } from '@/src/screens/glazes/glazePieceLink';
import { formatGlazeDisplayName } from '@/src/screens/glazes/glazeVersionUtils';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { glazeSearchHaystack } from '@/src/screens/library/atlas/glazeListUtils';
import { GlazeThumbnail } from '@/src/screens/library/atlas/GlazeThumbnail';
import { useAppStore } from '@/src/store';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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

  const selectedGlaze = React.useMemo(
    () => glazes.find((glaze) => glaze.id === value),
    [glazes, value],
  );

  const options = React.useMemo(
    () =>
      glazes.map((glaze) => ({
        value: glaze.id,
        label: formatGlazeDisplayName(glaze),
        description: [glaze.batchId, glaze.defaultCone || glaze.coneRange].filter(Boolean).join(' · '),
        searchText: glazeSearchHaystack(glaze),
      })),
    [glazes],
  );

  return (
    <DropdownField
      value={value}
      onValueChange={onChange}
      options={options}
      variant="card"
      placeholder="Choose a glaze from your atlas"
      title="Select Glaze"
      subtitle="Link this piece to a batch in your glaze atlas."
      searchable
      searchPlaceholder="Search glazes…"
      clearable
      clearLabel="Clear glaze link"
      emptyMessage={
        glazes.length === 0
          ? 'No glazes in your atlas yet. Add one from the Glaze tab first.'
          : 'No glazes match your search.'
      }
      accessibilityLabel="Select studio glaze"
      disabled={glazes.length === 0}
      renderValue={() =>
        selectedGlaze ? (
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
        ) : undefined
      }
      renderOption={(option, active, onSelect) => {
        const glaze = glazes.find((item) => item.id === option.value);
        if (!glaze) return null;
        return <GlazePickerRow glaze={glaze} active={active} onPress={onSelect} />;
      }}
    />
  );
}
