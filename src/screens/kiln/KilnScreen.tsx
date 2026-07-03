// src/screens/KilnScreen.tsx
import { ConfirmSheet } from '@/src/components/AppSheets';
import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { EmptyState } from '@/src/components/EmptyState';
import { StudioTabScreen } from '@/src/components/StudioTabScreen';
import { Text } from '@/src/components/ui/text';
import { TAB_SCROLL_BOTTOM_PADDING } from '@/src/constants/tabScreenLayout';
import { BrandColors } from '@/src/constants/theme';
import { parseKilnSectionParam } from '@/src/screens/overview/utils/kilnNavigation';
import { useAppStore, useVisibleFirings } from '@/src/store';
import { countOpenSessionsForKiln, kilnHasOpenSessions } from '@/src/utils/firingSessionLabels';
import { getDefaultKilnSection, type KilnSectionMode } from '@/src/utils/roleBasedUx';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Flame, FlameKindling, Layers, Plus, Thermometer } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { MainTabHeader } from '../../components/MainTabHeader';
import type { Kiln } from '../../types/kiln';
import type { Piece } from '../../types/pieces';
import { AddKilnModal } from './components/AddKilnModal';
import { FiringDetailModal } from './components/FiringDetailModal';
import { FiringEntrySheet } from './components/FiringEntrySheet';
import { FiringSessionCard } from './components/FiringSessionCard';
import { KilnCard } from './components/KilnCard';
import { KilnSwipeCard } from './components/KilnSwipeCard';
import { LogFiringModal } from './components/LogFiringModal';
import { ReadyFilterChip, ReadyPieceRow, ReadySortChip } from './components/ReadyPieces';
import { SectionHeader } from './components/SectionHeader';
import { StartFiringModal } from './components/StartFiringModal';
import { useKilnScreen } from './hooks/useKilnScreen';
import { getLastFiredLabel } from './utils/kilnHelpers';

export default function KilnScreen() {
  const router = useRouter();
  const { section: sectionParam } = useLocalSearchParams<{ section?: string | string[] }>();
  const {
    kilns,
    activeFirings,
    scheduledFirings,
    completedFirings: _completedFirings,
    waitingForBisque,
    waitingForGlaze,
    kilnFiringCounts,
    addKilnOpen, setAddKilnOpen,
    editKiln, setEditKiln,
    startFiringOpen, setStartFiringOpen,
    startFiringDefaultKilnId,
    detailFiring, setDetailFiring,
    handleSaveKiln,
    handleDeleteKiln,
    handleCreateFiring,
  } = useKilnScreen();
  const kilnsById = React.useMemo(() => new Map(kilns.map((kiln) => [kiln.id, kiln] as const)), [kilns]);
  const getKilnName = React.useCallback(
    (kilnId: string) => kilnsById.get(kilnId)?.name ?? 'Unknown Kiln',
    [kilnsById]
  );

  const featuredOpenFiring = activeFirings[0] ?? scheduledFirings[0] ?? null;
  const sessionRows = React.useMemo(() => {
    const featuredId = featuredOpenFiring?.id;
    return [
      ...activeFirings.filter((firing) => firing.id !== featuredId),
      ...scheduledFirings.filter((firing) => firing.id !== featuredId),
    ].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeFirings, featuredOpenFiring?.id, scheduledFirings]);

  const waitingCount = waitingForBisque.length + waitingForGlaze.length;
  const userType = useAppStore((s) => s.onboardingProfile.userType);
  const [sectionMode, setSectionMode] = React.useState<KilnSectionMode>(
    () => parseKilnSectionParam(sectionParam) ?? getDefaultKilnSection(userType),
  );

  React.useEffect(() => {
    const fromParam = parseKilnSectionParam(sectionParam);
    if (fromParam) setSectionMode(fromParam);
  }, [sectionParam]);
  const [firstKilnCeremony, setFirstKilnCeremony] = React.useState(false);
  const seenCeremonies = useAppStore((s) => s.seenCeremonies);
  const markCeremonyAsSeen = useAppStore((s) => s.markCeremonyAsSeen);
  const [readyFilter, setReadyFilter] = React.useState<'bisque' | 'glaze'>('bisque');
  const [readySort, setReadySort] = React.useState<'longest' | 'newest'>('longest');
  const [showAllReadyPieces, setShowAllReadyPieces] = React.useState(false);
  const [showAllSessions, setShowAllSessions] = React.useState(false);
  const [photoPreview, setPhotoPreview] = React.useState<{ uri: string; name: string } | null>(null);
  const [pendingDeleteKiln, setPendingDeleteKiln] = React.useState<Kiln | null>(null);
  const [logFiringOpen, setLogFiringOpen] = React.useState(false);
  const [logFiringKilnId, setLogFiringKilnId] = React.useState<string | undefined>(undefined);
  const [needKilnForLogOpen, setNeedKilnForLogOpen] = React.useState(false);
  const [firingEntryOpen, setFiringEntryOpen] = React.useState(false);
  const firings = useVisibleFirings();
  const visibleSessionRows = showAllSessions ? sessionRows : sessionRows.slice(0, 4);
  const hiddenSessionCount = Math.max(0, sessionRows.length - visibleSessionRows.length);
  const hasOpenSessionContent = featuredOpenFiring !== null || sessionRows.length > 0;
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);

  const getQueueEnteredAt = React.useCallback((piece: Piece, queueStage: 'bone-dry' | 'glazing') => {
    for (let index = piece.timeline.length - 1; index >= 0; index -= 1) {
      const timelineEntry = piece.timeline[index];
      if (timelineEntry.stage === queueStage) {
        return timelineEntry.timestamp;
      }
    }

    return piece.createdAt;
  }, []);

  const getWaitingDays = React.useCallback((enteredAt: string) => {
    const delta = Date.now() - new Date(enteredAt).getTime();
    return Math.max(0, Math.floor(delta / (24 * 60 * 60 * 1000)));
  }, []);

  const filteredReadyPieces = React.useMemo(() => {
    const source = readyFilter === 'bisque' ? waitingForBisque : waitingForGlaze;
    const queueStage = readyFilter === 'bisque' ? 'bone-dry' : 'glazing';

    return [...source].sort((a, b) => {
      const aEnteredAt = new Date(getQueueEnteredAt(a, queueStage)).getTime();
      const bEnteredAt = new Date(getQueueEnteredAt(b, queueStage)).getTime();

      if (readySort === 'longest') {
        return aEnteredAt - bEnteredAt;
      }

      return bEnteredAt - aEnteredAt;
    });
  }, [getQueueEnteredAt, readyFilter, readySort, waitingForBisque, waitingForGlaze]);

  const visibleReadyPieces = showAllReadyPieces ? filteredReadyPieces : filteredReadyPieces.slice(0, 4);
  const hiddenReadyCount = Math.max(0, filteredReadyPieces.length - visibleReadyPieces.length);

  React.useEffect(() => {
    if (readyFilter === 'bisque' && waitingForBisque.length === 0 && waitingForGlaze.length > 0) {
      setReadyFilter('glaze');
    }
    if (readyFilter === 'glaze' && waitingForGlaze.length === 0 && waitingForBisque.length > 0) {
      setReadyFilter('bisque');
    }
  }, [readyFilter, waitingForBisque.length, waitingForGlaze.length]);

  React.useEffect(() => {
    setShowAllReadyPieces(false);
  }, [readyFilter]);

  const handleOpenPieceInPieces = (piece: Piece) => {
    router.push({
      pathname: '/(tabs)/pieces',
      params: { openJournalPieceId: String(piece.id) },
    });
  };

  const confirmDeleteKiln = (kiln: Kiln) => {
    if (kilnHasOpenSessions(kiln.id, firings)) {
      const count = countOpenSessionsForKiln(kiln.id, firings);
      Alert.alert(
        'Complete open firings first',
        `"${kiln.name}" has ${count} open session${count !== 1 ? 's' : ''}. Finish or delete them before removing this kiln.`,
      );
      return;
    }
    setPendingDeleteKiln(kiln);
  };

  const openLogFiring = React.useCallback((kilnId?: string) => {
    setAddKilnOpen(false);
    if (kilns.length === 0) {
      setNeedKilnForLogOpen(true);
      return;
    }
    setLogFiringKilnId(kilnId ?? (kilns.length === 1 ? kilns[0].id : undefined));
    setLogFiringOpen(true);
  }, [kilns, setAddKilnOpen]);

  const logFiringKiln = React.useMemo(
    () => (logFiringKilnId ? kilns.find((k) => k.id === logFiringKilnId) : undefined),
    [kilns, logFiringKilnId],
  );

  return (
    <StudioTabScreen>
      <ConfirmSheet
        visible={needKilnForLogOpen}
        title="Add a kiln profile first"
        body="To log a past firing, add at least one kiln profile so we know which kiln ran the load."
        confirmLabel="Add kiln"
        dismissOnConfirm={() => setNeedKilnForLogOpen(false)}
        onConfirm={() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setAddKilnOpen(true));
          });
        }}
        onCancel={() => setNeedKilnForLogOpen(false)}
      />

      <ConfirmSheet
        visible={!!pendingDeleteKiln}
        title="Delete Kiln?"
        body={pendingDeleteKiln ? `Delete "${pendingDeleteKiln.name}"? All associated firing logs will be removed. Your pieces are not deleted.` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={() => { if (pendingDeleteKiln) handleDeleteKiln(pendingDeleteKiln); setPendingDeleteKiln(null); }}
        onCancel={() => setPendingDeleteKiln(null)}
      />

      <MainTabHeader title='Kiln' description={`${kilns.length} profile${kilns.length !== 1 ? 's' : ''} · ${activeFirings.length + scheduledFirings.length} open sessions`} actionText='Add Firing' pressIcon={<FlameKindling size={16} color="white" />} onPress={() => setFiringEntryOpen(true)} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_BOTTOM_PADDING }}
      >
        <View className="px-6 pt-4">
          <View className="mb-6">
            <View className="flex-row bg-muted rounded-2xl p-1">
              {(['kilns', 'sessions', 'queue'] as const).map((tab) => {
                const labels: Record<typeof tab, string> = {
                  kilns: 'Active Kilns',
                  sessions: 'Sessions',
                  queue: 'Queue',
                };
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setSectionMode(tab)}
                    className={`flex-1 items-center rounded-xl py-2.5 ${sectionMode === tab ? 'bg-card' : ''}`}
                  >
                    <Text className={`text-sm font-semibold ${sectionMode === tab ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {labels[tab]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {sectionMode === 'kilns' ? (
            <View className="mb-4">
              <SectionHeader
                title="Active Kilns"
                icon={<Thermometer size={18} color={BrandColors.primary} />}
                action={
                  <TouchableOpacity
                    onPress={() => setAddKilnOpen(true)}
                    className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card"
                  >
                    <Plus size={14} color={BrandColors.primary} />
                    <Text className="text-xs font-semibold text-primary">Add Kiln</Text>
                  </TouchableOpacity>
                }
              />

              {kilns.length === 0 ? (
                <EmptyState
                  icon={Thermometer}
                  title="No kilns yet"
                  description="Add your kiln to log firings, track peak temps, and see when you last fired."
                  ctaLabel="Add your first kiln"
                  ctaIcon={Plus}
                  onCtaPress={() => setAddKilnOpen(true)}
                />
              ) : (
                kilns.map((kiln) => (
                  <KilnSwipeCard key={kiln.id} onDelete={() => confirmDeleteKiln(kiln)}>
                    <KilnCard
                      kiln={kiln}
                      firingCount={kilnFiringCounts[kiln.id] ?? 0}
                      lastFiredLabel={getLastFiredLabel(kiln, firings)}
                      onPress={() => router.push(`/kiln/${kiln.id}` as never)}
                      onViewHistory={() => router.push({ pathname: '/kiln-history', params: { kilnId: kiln.id } } as never)}
                      onLogFiring={() => openLogFiring(kiln.id)}
                    />
                  </KilnSwipeCard>
                ))
              )}
            </View>

          ) : sectionMode === 'sessions' ? (
            <View className="mb-8">
              <SectionHeader title="Firing Sessions" icon={<Flame size={18} />} />

              {featuredOpenFiring ? (
                <FiringSessionCard
                  firing={featuredOpenFiring}
                  kilnName={getKilnName(featuredOpenFiring.kilnId)}
                  currencySymbol={currencySymbol}
                  variant="hero"
                  onPress={() => setDetailFiring(featuredOpenFiring)}
                />
              ) : null}

              {hasOpenSessionContent ? (
                <>
                  {visibleSessionRows.map((firing) => (
                    <FiringSessionCard
                      key={firing.id}
                      firing={firing}
                      kilnName={getKilnName(firing.kilnId)}
                      currencySymbol={currencySymbol}
                      variant="compact"
                      onPress={() => setDetailFiring(firing)}
                    />
                  ))}
                  {hiddenSessionCount > 0 ? (
                    <TouchableOpacity onPress={() => setShowAllSessions(true)} className="self-start mt-1">
                      <Text className="text-[11px] font-semibold text-primary">
                        Show all {sessionRows.length} session cards
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {showAllSessions && sessionRows.length > 4 ? (
                    <TouchableOpacity onPress={() => setShowAllSessions(false)} className="self-start mt-1">
                      <Text className="text-[11px] font-semibold text-muted-foreground">Show less</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : (
                <EmptyState
                  icon={FlameKindling}
                  title="Nothing in the kiln"
                  description="Schedule a bisque or glaze firing to track progress, timeline, and piece outcomes automatically."
                  ctaLabel="Schedule a Firing"
                  ctaIcon={FlameKindling}
                  onCtaPress={() => setFiringEntryOpen(true)}
                />
              )}
            </View>

          ) : sectionMode === 'queue' ? (
            <View className="mb-8">
              <SectionHeader title="Ready to Fire" icon={<Layers size={18} color="hsl(24 20% 40%)" />} />

              <View className="flex-row gap-2 mb-3">
                <ReadyFilterChip
                  label="Bisque"
                  count={waitingForBisque.length}
                  active={readyFilter === 'bisque'}
                  onPress={() => setReadyFilter('bisque')}
                />
                <ReadyFilterChip
                  label="Glaze"
                  count={waitingForGlaze.length}
                  active={readyFilter === 'glaze'}
                  onPress={() => setReadyFilter('glaze')}
                />
              </View>

              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[10px] text-muted-foreground">Priority sorting</Text>
                <View className="flex-row gap-1.5">
                  <ReadySortChip
                    label="Longest waiting"
                    active={readySort === 'longest'}
                    onPress={() => setReadySort('longest')}
                  />
                  <ReadySortChip
                    label="Newest"
                    active={readySort === 'newest'}
                    onPress={() => setReadySort('newest')}
                  />
                </View>
              </View>

              {filteredReadyPieces.length > 0 ? (
                <View className="gap-2.5">
                  {visibleReadyPieces.map((piece) => {
                    const queueStage = readyFilter === 'bisque' ? 'bone-dry' : 'glazing';
                    const queueEnteredAt = getQueueEnteredAt(piece, queueStage);
                    return (
                      <ReadyPieceRow
                        key={piece.id}
                        piece={piece}
                        waitingDays={getWaitingDays(queueEnteredAt)}
                        onPreviewPhoto={() => {
                          const imageUri = piece.photo ?? piece.imgUrl;
                          if (!imageUri) return;
                          setPhotoPreview({ uri: imageUri, name: piece.name });
                        }}
                        onOpenInPieces={() => handleOpenPieceInPieces(piece)}
                      />
                    );
                  })}
                  {hiddenReadyCount > 0 ? (
                    <TouchableOpacity onPress={() => setShowAllReadyPieces(true)} className="self-start mt-0.5">
                      <Text className="text-[11px] font-semibold text-primary">
                        Show all {filteredReadyPieces.length} ready for {readyFilter}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {showAllReadyPieces && filteredReadyPieces.length > 4 ? (
                    <TouchableOpacity onPress={() => setShowAllReadyPieces(false)} className="self-start mt-0.5">
                      <Text className="text-[11px] font-semibold text-muted-foreground">Show less</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              {waitingCount === 0 ? (
                <EmptyState
                  icon={Layers}
                  title="Queue is empty"
                  description="Move pieces to bone-dry or glazing and they'll line up here, ready to fire."
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Modals */}
      <CeremonyOverlay
        visible={firstKilnCeremony}
        emoji="🔥"
        title="Your first kiln is ready."
        subtitle="The heart of your studio."
        tint="rgba(211, 120, 60, 1)"
        durationMs={3000}
        onDismiss={() => setFirstKilnCeremony(false)}
      />
      <FiringEntrySheet
        visible={firingEntryOpen}
        onClose={() => setFiringEntryOpen(false)}
        onSchedule={() => setStartFiringOpen(true)}
        onRecordPast={() => openLogFiring()}
      />
      <LogFiringModal
        visible={logFiringOpen}
        kiln={logFiringKiln}
        onClose={() => {
          setLogFiringOpen(false);
          setLogFiringKilnId(undefined);
        }}
      />
      <AddKilnModal
        visible={addKilnOpen || !!editKiln}
        onClose={() => { setAddKilnOpen(false); setEditKiln(undefined); }}
        onSave={(kiln) => {
          const isFirst = kilns.length === 0 && !editKiln && !seenCeremonies.includes('first-kiln');
          handleSaveKiln(kiln);
          if (isFirst) {
            markCeremonyAsSeen('first-kiln');
            setFirstKilnCeremony(true);
          }
        }}
        editKiln={editKiln}
      />
      <StartFiringModal
        visible={startFiringOpen}
        onClose={() => setStartFiringOpen(false)}
        onStart={handleCreateFiring}
        defaultKilnId={startFiringDefaultKilnId}
      />
      <FiringDetailModal
        firing={detailFiring}
        visible={detailFiring !== null}
        onClose={() => setDetailFiring(null)}
      />

      <Modal
        visible={photoPreview !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoPreview(null)}
      >
        <View className="flex-1 justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <Pressable
            onPress={() => setPhotoPreview(null)}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
          <View className="mx-5 rounded-2xl overflow-hidden bg-card border border-border">
            {photoPreview ? (
              <Image
                source={{ uri: photoPreview.uri }}
                style={{ width: '100%', height: 320 }}
                resizeMode="cover"
              />
            ) : null}
            <View className="px-4 py-3 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {photoPreview?.name ?? 'Piece photo'}
              </Text>
              <TouchableOpacity
                onPress={() => setPhotoPreview(null)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background"
              >
                <Text className="text-xs font-semibold text-muted-foreground">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </StudioTabScreen>
  );
}
