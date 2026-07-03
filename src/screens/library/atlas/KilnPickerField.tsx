import { DropdownField } from '@/src/components/DropdownField';
import { Text } from '@/src/components/ui/text';
import { KILN_TYPE_LABELS } from '@/src/screens/kiln/constants';
import type { Kiln } from '@/src/types/kiln';
import { useVisibleKilns } from '@/src/store';
import { ChevronDown, FlameKindling } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type KilnPickerFieldProps = {
  value: string;
  onChange: (kilnName: string, kiln?: Kiln) => void;
};

function KilnRow({
  kiln,
  active,
  onPress,
}: {
  kiln: Kiln;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-row items-center gap-3 px-3 py-2.5 rounded-2xl border ${
        active ? 'border-primary bg-primary/5' : 'border-border bg-card'
      }`}
    >
      <View className="w-10 h-10 rounded-xl bg-muted/60 items-center justify-center">
        <FlameKindling size={18} color="hsl(24 20% 45%)" />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {kiln.name}
        </Text>
        <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={1}>
          {KILN_TYPE_LABELS[kiln.type]}
          {kiln.location ? ` · ${kiln.location}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function KilnPickerField({ value, onChange }: KilnPickerFieldProps) {
  const kilns = useVisibleKilns();

  const selectedKiln = React.useMemo(
    () => kilns.find((kiln) => kiln.name === value),
    [kilns, value],
  );

  const options = React.useMemo(
    () =>
      kilns.map((kiln) => ({
        value: kiln.name,
        label: kiln.name,
        description: [KILN_TYPE_LABELS[kiln.type], kiln.location].filter(Boolean).join(' · '),
      })),
    [kilns],
  );

  return (
    <DropdownField
      value={value}
      onValueChange={(kilnName) => {
        const kiln = kilns.find((item) => item.name === kilnName);
        onChange(kilnName, kiln);
      }}
      options={options}
      variant="card"
      placeholder={
        kilns.length > 0 ? 'Choose a kiln (optional)' : 'No kilns yet — add one in the Kiln tab'
      }
      title="Select Kiln"
      subtitle="Optional: link this test to one of your studio kilns."
      clearable
      clearLabel="Clear kiln"
      emptyMessage="Add a kiln from the Kiln tab first, or leave this blank."
      dialogMaxHeightRatio={0.55}
      accessibilityLabel="Select kiln"
      disabled={kilns.length === 0}
      renderValue={() =>
        selectedKiln ? (
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-muted/60 items-center justify-center">
              <FlameKindling size={18} color="hsl(24 20% 45%)" />
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {selectedKiln.name}
              </Text>
              <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={1}>
                {KILN_TYPE_LABELS[selectedKiln.type]}
              </Text>
            </View>
            <ChevronDown size={18} color="hsl(24 20% 55%)" />
          </View>
        ) : undefined
      }
      renderOption={(option, active, onSelect) => {
        const kiln = kilns.find((item) => item.name === option.value);
        if (!kiln) return null;
        return <KilnRow kiln={kiln} active={active} onPress={onSelect} />;
      }}
    />
  );
}
