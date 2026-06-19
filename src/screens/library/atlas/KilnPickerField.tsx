import {
  ModalCard,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { KILN_TYPE_LABELS } from '@/src/screens/kiln/constants';
import type { Kiln } from '@/src/types/kiln';
import { useAppStore } from '@/src/store';
import { ChevronDown, FlameKindling } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, TouchableOpacity, View } from 'react-native';

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
  const kilns = useAppStore((s) => s.kilns);
  const sheetHeight = useModalSheetHeight();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const selectedKiln = React.useMemo(
    () => kilns.find((kiln) => kiln.name === value),
    [kilns, value],
  );

  const openSheet = React.useCallback(() => {
    setSheetOpen(true);
  }, []);

  const handleSelect = React.useCallback(
    (kiln: Kiln) => {
      onChange(kiln.name, kiln);
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
        accessibilityLabel="Select kiln"
        className="rounded-2xl border border-border bg-card px-3 py-3"
      >
        {selectedKiln ? (
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
        ) : (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">
              {kilns.length > 0 ? 'Choose a kiln (optional)' : 'No kilns yet — add one in the Kiln tab'}
            </Text>
            {kilns.length > 0 ? (
              <ChevronDown size={18} color="hsl(24 20% 55%)" />
            ) : null}
          </View>
        )}
      </Pressable>

      {selectedKiln ? (
        <TouchableOpacity onPress={handleClear} activeOpacity={0.75} className="self-start mt-2">
          <Text className="text-xs font-semibold text-primary">Clear kiln</Text>
        </TouchableOpacity>
      ) : null}

      <ModalShell visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
          <ModalSheetHeader>
            <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              Select Kiln
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Optional — link this test to one of your studio kilns.
            </Text>
          </ModalSheetHeader>

          <ScrollView
            className="px-6"
            style={{ flex: 1, minHeight: 0 }}
            contentContainerStyle={{ paddingBottom: 24, gap: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {kilns.length === 0 ? (
              <View className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 items-center">
                <Text className="text-sm text-muted-foreground text-center leading-5">
                  Add a kiln from the Kiln tab first, or leave this blank.
                </Text>
              </View>
            ) : (
              kilns.map((kiln) => (
                <KilnRow
                  key={kiln.id}
                  kiln={kiln}
                  active={value === kiln.name}
                  onPress={() => handleSelect(kiln)}
                />
              ))
            )}
          </ScrollView>
        </ModalCard>
      </ModalShell>
    </>
  );
}
