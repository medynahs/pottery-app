import { ConfirmSheet } from '@/src/components/AppSheets';
import { EmptyState } from '@/src/components/EmptyState';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import { countOpenSessionsForKiln, kilnHasOpenSessions } from '@/src/utils/firingSessionLabels';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, FlameKindling, Pencil, Plus, Thermometer, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddKilnModal } from './components/AddKilnModal';
import { FiringDetailModal } from './components/FiringDetailModal';
import { FiringEntrySheet } from './components/FiringEntrySheet';
import { FiringSessionCard } from './components/FiringSessionCard';
import {
  KilnEmergencyNotesCard,
  KilnMaintenanceSection,
} from './components/KilnMaintenanceSection';
import { LogFiringButton } from './components/LogFiringButton';
import { LogFiringModal } from './components/LogFiringModal';
import { SectionHeader } from './components/SectionHeader';
import { StartFiringModal } from './components/StartFiringModal';
import { KilnProfileHeader } from './components/KilnProfileHeader';
import { KilnSubScreenHeader } from './components/KilnSubScreenHeader';
import { KILN_TYPE_LABELS } from './constants';
import { useCreateFiringMutation } from './hooks/useFiringsSync';
import { useDeleteKilnMutation, useUpsertKilnMutation } from './hooks/useKilnsSync';
import type { Firing, Kiln } from '@/src/types/kiln';
import { getKilnMaxTempLabel, getKilnPerformanceStats, getLastFiredLabel } from './utils/kilnHelpers';

function resolveKilnIdParam(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0];
  return param;
}

export default function KilnDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { kilnId: kilnIdParam } = useLocalSearchParams<{ kilnId?: string | string[] }>();
  const resolvedKilnId = resolveKilnIdParam(kilnIdParam);

  const kilns = useAppStore((s) => s.kilns);
  const firings = useAppStore((s) => s.firings);
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);
  const addFiring = useAppStore((s) => s.addFiring);
  const updateKiln = useAppStore((s) => s.updateKiln);
  const deleteKiln = useAppStore((s) => s.deleteKiln);
  const addKilnMaintenanceLog = useAppStore((s) => s.addKilnMaintenanceLog);
  const removeKilnMaintenanceLog = useAppStore((s) => s.removeKilnMaintenanceLog);
  const upsertKilnMutation = useUpsertKilnMutation();
  const deleteKilnMutation = useDeleteKilnMutation();
  const createFiringMutation = useCreateFiringMutation();

  const kiln = React.useMemo(
    () =>
      resolvedKilnId
        ? kilns.find((k) => k.id === resolvedKilnId || k.backendId === resolvedKilnId)
        : undefined,
    [kilns, resolvedKilnId],
  );

  const kilnFirings = React.useMemo(
    () => (kiln ? firings.filter((f) => f.kilnId === kiln.id) : []),
    [firings, kiln],
  );

  const openFirings = React.useMemo(
    () =>
      kilnFirings
        .filter((f) => f.state !== 'completed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [kilnFirings],
  );

  const performance = React.useMemo(
    () => (kiln ? getKilnPerformanceStats(kiln.id, firings) : null),
    [firings, kiln],
  );

  const [editOpen, setEditOpen] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [firingEntryOpen, setFiringEntryOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [detailFiring, setDetailFiring] = React.useState<Firing | null>(null);

  const handleSaveKiln = React.useCallback(
    (nextKiln: Kiln) => {
      const existing = kilns.find((k) => k.id === nextKiln.id);
      if (existing) {
        updateKiln(nextKiln);
      }
      upsertKilnMutation.mutate(nextKiln);
    },
    [kilns, updateKiln, upsertKilnMutation],
  );

  const handleDeleteKiln = React.useCallback(
    (target: Kiln) => {
      deleteKiln(target.id);
      deleteKilnMutation.mutate(target);
    },
    [deleteKiln, deleteKilnMutation],
  );

  const handleCreateFiring = React.useCallback(
    (firing: Firing) => {
      addFiring(firing);
      createFiringMutation.mutate(firing);
    },
    [addFiring, createFiringMutation],
  );

  if (!kiln) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <EmptyState
          icon={Thermometer}
          title="Kiln not found"
          description="This kiln may have been removed or the link is out of date."
          ctaLabel="Go back"
          onCtaPress={() => router.back()}
        />
      </View>
    );
  }

  const kilnFiringCount = kilnFirings.length;
  const lastFired = getLastFiredLabel(kiln, firings);
  const openCount = countOpenSessionsForKiln(kiln.id, firings);

  const tryDelete = () => {
    if (kilnHasOpenSessions(kiln.id, firings)) {
      Alert.alert(
        'Complete open firings first',
        `This kiln has ${openCount} open firing session${openCount !== 1 ? 's' : ''}. Finish or delete them before removing the kiln.`,
      );
      return;
    }
    setDeleteOpen(true);
  };

  return (
    <View className="flex-1 bg-background">
      <KilnSubScreenHeader
        title={kiln.name}
        subtitle={`${KILN_TYPE_LABELS[kiln.type]} · ${getKilnMaxTempLabel(kiln)}`}
        onBack={() => router.back()}
        headerRight={
          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              onPress={() => setEditOpen(true)}
              className="p-2"
              hitSlop={8}
              accessibilityLabel="Edit kiln"
            >
              <Pencil size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={tryDelete}
              className="p-2"
              hitSlop={8}
              accessibilityLabel="Delete kiln"
            >
              <Trash2 size={18} color="hsl(0 55% 45%)" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 32 }}
      >
          <Card className="p-5 mb-5">
            <KilnProfileHeader
              kiln={kiln}
              lastFiredLabel={lastFired}
              firingCount={kilnFiringCount}
              imageHeight={140}
            />

            <View className="flex-row gap-2 mt-5">
              <Button
                onPress={() => setFiringEntryOpen(true)}
                className="flex-1 flex-row gap-2 rounded-xl"
              >
                <Plus size={15} color={Colors.light.primaryForeground} />
                <Text className="text-sm font-semibold text-primary-foreground">Add firing</Text>
              </Button>
              <LogFiringButton variant="outline" onPress={() => setLogOpen(true)} />
            </View>

            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/kiln-history', params: { kilnId: kiln.id } } as never)
              }
              className="mt-2 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary"
            >
              <Clock size={14} color={Colors.light.primaryForeground} />
              <Text className="text-sm font-semibold text-primary-foreground">
                History ({kilnFiringCount})
              </Text>
            </TouchableOpacity>
          </Card>

          {kiln.emergencyNotes?.trim() ? (
            <KilnEmergencyNotesCard notes={kiln.emergencyNotes} />
          ) : null}

          {openFirings.length > 0 ? (
            <View className="mb-5">
              <SectionHeader title="Open sessions" icon={<FlameKindling size={18} color={colors.primary} />} />
              {openFirings.map((firing, index) => (
                <FiringSessionCard
                  key={firing.id}
                  firing={firing}
                  kilnName={kiln.name}
                  currencySymbol={currencySymbol}
                  variant={index === 0 ? 'hero' : 'compact'}
                  onPress={() => setDetailFiring(firing)}
                />
              ))}
            </View>
          ) : null}

          {performance && performance.totalFirings > 0 ? (
            <View className="flex-row flex-wrap gap-2.5 mb-5">
              <Card className="flex-1 min-w-[72px] p-3 items-center">
                <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Firings
                </Text>
                <Text className="text-xl font-serif font-bold text-foreground">
                  {performance.totalFirings}
                </Text>
              </Card>
              <Card className="flex-1 min-w-[72px] p-3 items-center">
                <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Success
                </Text>
                <Text className="text-xl font-serif font-bold text-foreground">
                  {performance.successPct != null ? `${performance.successPct}%` : '-'}
                </Text>
              </Card>
              <Card className="flex-1 min-w-[72px] p-3 items-center">
                <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Avg temp
                </Text>
                <Text className="text-xl font-serif font-bold text-foreground">
                  {performance.avgPeakTempC != null ? `${performance.avgPeakTempC}°` : '-'}
                </Text>
              </Card>
              <Card className="flex-1 min-w-[72px] p-3 items-center">
                <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Avg hold
                </Text>
                <Text className="text-xl font-serif font-bold text-foreground">
                  {performance.avgHoldMinutes != null ? `${performance.avgHoldMinutes}m` : '-'}
                </Text>
              </Card>
            </View>
          ) : null}

          <KilnMaintenanceSection
            kiln={kiln}
            onAddLog={(payload) => addKilnMaintenanceLog(kiln.id, payload)}
            onRemoveLog={(logId) => removeKilnMaintenanceLog(kiln.id, logId)}
          />
      </ScrollView>

      <FiringEntrySheet
        visible={firingEntryOpen}
        onClose={() => setFiringEntryOpen(false)}
        onSchedule={() => setScheduleOpen(true)}
        onRecordPast={() => setLogOpen(true)}
      />

      <ConfirmSheet
        visible={deleteOpen}
        title="Delete kiln?"
        body={`Delete "${kiln.name}"? All associated firing logs will be removed. Your pieces are not deleted.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          handleDeleteKiln(kiln);
          setDeleteOpen(false);
          router.back();
        }}
        onCancel={() => setDeleteOpen(false)}
      />

      <FiringDetailModal
        firing={detailFiring}
        visible={detailFiring !== null}
        onClose={() => setDetailFiring(null)}
      />

      <AddKilnModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveKiln}
        editKiln={kiln}
      />
      <LogFiringModal visible={logOpen} kiln={kiln} onClose={() => setLogOpen(false)} />
      <StartFiringModal
        visible={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onStart={handleCreateFiring}
        defaultKilnId={kiln.id}
      />
    </View>
  );
}
