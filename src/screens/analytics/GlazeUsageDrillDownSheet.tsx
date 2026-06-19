import { Text } from '@/src/components/ui/text';
import {
  buildGlazeFamilyDrillDown,
  type GlazeFamilyDrillDown,
} from '@/src/screens/glazes/glazeUsageAnalytics';
import { GLAZE_RESULT_LABELS, type GlazeLibraryItem, type GlazeTestTile } from '@/src/screens/glazes/types';
import type { Piece } from '@/src/types/pieces';
import type { AnalyticsPeriodId } from '@/src/utils/analyticsPeriods';
import { useRouter } from 'expo-router';
import { ChevronRight, X } from 'lucide-react-native';
import React from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type GlazeUsageDrillDownSheetProps = {
  familyKey: string | null;
  pieces: Piece[];
  glazeTests: GlazeTestTile[];
  glazes: GlazeLibraryItem[];
  periodId: AnalyticsPeriodId;
  onClose: () => void;
};

export function GlazeUsageDrillDownSheet({
  familyKey,
  pieces,
  glazeTests,
  glazes,
  periodId,
  onClose,
}: GlazeUsageDrillDownSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const visible = familyKey !== null;

  const detail: GlazeFamilyDrillDown | null = React.useMemo(() => {
    if (!familyKey) return null;
    return buildGlazeFamilyDrillDown(familyKey, pieces, glazeTests, glazes, periodId);
  }, [familyKey, pieces, glazeTests, glazes, periodId]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.46)' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: '#FDFAF5',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '82%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#E8D9BE',
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 19, color: '#3A2810' }}>
                {detail?.label ?? 'Glaze usage'}
              </Text>
              {detail ? (
                <Text style={{ fontSize: 12, color: '#A68555', marginTop: 3 }}>
                  {detail.pieceCount} piece{detail.pieceCount === 1 ? '' : 's'} · {detail.testCount} test
                  {detail.testCount === 1 ? '' : 's'}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <X size={20} color="#A68555" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
          >
            {detail && detail.pieces.length > 0 ? (
              <>
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Linked pieces
                </Text>
                <View className="gap-2 mb-5">
                  {detail.pieces.map((row) => (
                    <TouchableOpacity
                      key={row.pieceId}
                      onPress={() => {
                        onClose();
                        router.push(`/(tabs)/pieces?openJournalPieceId=${row.pieceId}` as never);
                      }}
                      activeOpacity={0.82}
                      className="flex-row items-center rounded-xl border border-border bg-card px-3 py-3"
                    >
                      <View className="flex-1 min-w-0">
                        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                          {row.name}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground mt-0.5">
                          {row.stageLabel} · {row.dateLabel}
                        </Text>
                      </View>
                      <ChevronRight size={16} color="hsl(24 20% 55%)" />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}

            {detail && detail.tests.length > 0 ? (
              <>
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Test tiles
                </Text>
                <View className="gap-2">
                  {detail.tests.map((row) => (
                    <TouchableOpacity
                      key={row.testId}
                      onPress={() => {
                        onClose();
                        router.push(`/glaze/${row.glazeId}` as never);
                      }}
                      activeOpacity={0.82}
                      className="flex-row items-center rounded-xl border border-border bg-card px-3 py-3"
                    >
                      <View className="flex-1 min-w-0">
                        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                          {row.glazeVersionLabel}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground mt-0.5">
                          {GLAZE_RESULT_LABELS[row.resultRating]} · {row.dateLabel}
                        </Text>
                      </View>
                      <ChevronRight size={16} color="hsl(24 20% 55%)" />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}

            {detail && detail.pieces.length === 0 && detail.tests.length === 0 ? (
              <Text className="text-sm text-muted-foreground text-center py-8">
                No activity in this period for this glaze family.
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
