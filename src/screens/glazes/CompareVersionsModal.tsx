import {
  ModalCard,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import {
  compareGlazeIngredients,
  computeVersionSuccessRate,
  formatGlazeDisplayName,
  formatVersionStatsLine,
} from '@/src/screens/glazes/glazeVersionUtils';
import {
  GLAZE_STATUS_EMOJI,
  GLAZE_STATUS_LABELS,
  type GlazeLibraryItem,
  type GlazeTestTile,
} from '@/src/screens/glazes/types';
import { Pill } from '@/src/screens/library/atlas/Pill';
import type { Piece } from '@/src/types/pieces';
import { formatDateShort } from '@/src/utils/dates';
import { ArrowLeftRight } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

type CompareVersionsModalProps = {
  visible: boolean;
  onClose: () => void;
  versions: GlazeLibraryItem[];
  initialLeftId: string;
  initialRightId?: string;
  tests: GlazeTestTile[];
  pieces: Piece[];
};

function CompareColumn({
  title,
  glaze,
  successRate,
  statsLine,
}: {
  title: string;
  glaze: GlazeLibraryItem;
  successRate: number | null;
  statsLine: string;
}) {
  return (
    <View className="flex-1 min-w-0">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </Text>
      <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
        {formatGlazeDisplayName(glaze, { alwaysShowVersion: true })}
      </Text>
      <Text className="text-[11px] text-muted-foreground mt-1">
        Mixed {formatDateShort(glaze.dateMixed ?? glaze.createdAt)}
      </Text>
      <View className="self-start mt-2 px-2 py-0.5 rounded-full bg-muted border border-border">
        <Text className="text-[10px] font-semibold text-foreground">
          {GLAZE_STATUS_EMOJI[glaze.status ?? 'experimental']}{' '}
          {GLAZE_STATUS_LABELS[glaze.status ?? 'experimental']}
        </Text>
      </View>
      <Text className="text-xs text-foreground mt-3 leading-5">{statsLine}</Text>
      {successRate != null ? (
        <Text className="text-xs font-semibold text-primary mt-1">{successRate}% success rate</Text>
      ) : (
        <Text className="text-xs text-muted-foreground mt-1">No firing data yet</Text>
      )}
    </View>
  );
}

export function CompareVersionsModal({
  visible,
  onClose,
  versions,
  initialLeftId,
  initialRightId,
  tests,
  pieces,
}: CompareVersionsModalProps) {
  const sheetHeight = useModalSheetHeight();
  const [leftId, setLeftId] = React.useState(initialLeftId);
  const [rightId, setRightId] = React.useState(
    initialRightId ?? versions[Math.max(0, versions.length - 2)]?.id ?? initialLeftId,
  );

  React.useEffect(() => {
    if (!visible) return;
    setLeftId(initialLeftId);
    setRightId(initialRightId ?? versions[Math.max(0, versions.length - 2)]?.id ?? initialLeftId);
  }, [visible, initialLeftId, initialRightId, versions]);

  const leftGlaze = versions.find((version) => version.id === leftId) ?? versions[0];
  const rightGlaze = versions.find((version) => version.id === rightId) ?? versions[versions.length - 1];

  if (!leftGlaze || !rightGlaze) return null;

  const ingredientRows = compareGlazeIngredients(
    leftGlaze.recipeIngredients ?? [],
    rightGlaze.recipeIngredients ?? [],
  );
  const leftRate = computeVersionSuccessRate(leftGlaze.id, tests, pieces);
  const rightRate = computeVersionSuccessRate(rightGlaze.id, tests, pieces);
  const rateDiff =
    leftRate != null && rightRate != null ? rightRate - leftRate : null;
  const changedCount = ingredientRows.filter((row) => row.changed).length;

  const handleSwap = () => {
    setLeftId(rightId);
    setRightId(leftId);
  };

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Compare Versions
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Side-by-side recipe and firing outcomes.
          </Text>
        </ModalSheetHeader>

        <ScrollView
          className="px-6"
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap gap-2 mb-4">
            {versions.map((version) => (
              <Pill
                key={`left-${version.id}`}
                label={`v${version.versionNumber ?? 1}`}
                active={leftId === version.id}
                onPress={() => setLeftId(version.id)}
              />
            ))}
          </View>
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Left column
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-5">
            {versions.map((version) => (
              <Pill
                key={`right-${version.id}`}
                label={`v${version.versionNumber ?? 1}`}
                active={rightId === version.id}
                onPress={() => setRightId(version.id)}
              />
            ))}
          </View>
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Right column
          </Text>

          <View className="flex-row gap-3 mb-5">
            <CompareColumn
              title="Version A"
              glaze={leftGlaze}
              successRate={leftRate}
              statsLine={formatVersionStatsLine(leftGlaze.id, tests, pieces)}
            />
            <TouchableOpacity
              onPress={handleSwap}
              activeOpacity={0.78}
              className="self-center w-10 h-10 rounded-full border border-border bg-muted items-center justify-center"
              accessibilityLabel="Swap versions"
            >
              <ArrowLeftRight size={16} color="hsl(24 20% 40%)" />
            </TouchableOpacity>
            <CompareColumn
              title="Version B"
              glaze={rightGlaze}
              successRate={rightRate}
              statsLine={formatVersionStatsLine(rightGlaze.id, tests, pieces)}
            />
          </View>

          {(leftGlaze.batchSize || rightGlaze.batchSize) ? (
            <View className="rounded-2xl border border-border bg-card px-4 py-3 mb-5">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Batch size
              </Text>
              <View className="flex-row gap-3">
                <Text className="flex-1 text-sm text-foreground">
                  A: {leftGlaze.batchSize?.trim() || '—'}
                </Text>
                <Text className="flex-1 text-sm text-foreground">
                  B: {rightGlaze.batchSize?.trim() || '—'}
                </Text>
              </View>
            </View>
          ) : null}

          {changedCount > 0 ? (
            <View className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 mb-5">
              <Text className="text-sm text-foreground">
                {changedCount} ingredient{changedCount === 1 ? '' : 's'} differ between versions.
              </Text>
            </View>
          ) : null}

          {rateDiff != null && rateDiff !== 0 ? (
            <View className="rounded-2xl border border-border bg-muted/30 px-4 py-3 mb-5">
              <Text className="text-sm text-foreground">
                {rateDiff > 0
                  ? `Version B performs ${rateDiff} points better in the studio.`
                  : `Version A performs ${Math.abs(rateDiff)} points better in the studio.`}
              </Text>
            </View>
          ) : null}

          <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Ingredients
          </Text>
          <View className="rounded-2xl border border-border bg-card px-4 py-3">
            <View className="flex-row pb-2 border-b border-border/60 mb-1">
              <Text className="flex-1 text-[10px] font-semibold text-muted-foreground">Material</Text>
              <Text className="w-12 text-[10px] font-semibold text-muted-foreground text-right">A</Text>
              <Text className="w-12 text-[10px] font-semibold text-muted-foreground text-right">B</Text>
            </View>
            {ingredientRows.length === 0 ? (
              <Text className="text-sm text-muted-foreground py-2">No structured recipe to compare.</Text>
            ) : (
              ingredientRows.map((row) => (
                <View
                  key={row.material}
                  className={`flex-row items-center py-1.5 border-b border-border/60 last:border-b-0 ${
                    row.changed ? 'bg-amber-50/80 -mx-1 px-1 rounded-lg' : ''
                  }`}
                >
                  <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                    {row.material}
                  </Text>
                  <Text className="w-12 text-sm text-foreground text-right">
                    {row.leftPct ? `${row.leftPct}%` : '—'}
                  </Text>
                  <Text className="w-12 text-sm text-foreground text-right">
                    {row.rightPct ? `${row.rightPct}%` : '—'}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <ModalSheetFooter>
          <TouchableOpacity onPress={onClose} activeOpacity={0.75} className="py-1 items-center">
            <Text className="text-sm font-semibold text-muted-foreground">Close</Text>
          </TouchableOpacity>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
