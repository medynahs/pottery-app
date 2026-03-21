// src/screens/KilnScreen.tsx
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useRouter } from 'expo-router';
import { Flame, FlameKindling, Layers, Plus, Thermometer, Zap } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { AddKilnModal } from './kiln/AddKilnModal';
import { ActiveFiringCard } from './kiln/components/ActiveFiringCard';
import { FiringHistoryRow, ScheduledFiringRow } from './kiln/components/FiringRows';
import { KilnCard } from './kiln/components/KilnCard';
import { SectionHeader } from './kiln/components/SectionHeader';
import { FiringDetailModal } from './kiln/FiringDetailModal';
import { formatReadyDate, getAutoFiringStatus, getExpectedReadyAt } from './kiln/firingEstimations';
import { useKilnScreen } from './kiln/hooks/useKilnScreen';
import { StartFiringModal } from './kiln/StartFiringModal';
import type { Kiln } from './kiln/types';
import type { Piece } from './pieces/types';

function ReadyFilterChip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl border ${active ? 'bg-card border-primary' : 'bg-background border-border'}`}
    >
      <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </Text>
      <View className={`px-1.5 py-0.5 rounded-full ${active ? 'bg-primary/15' : 'bg-muted'}`}>
        <Text className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ReadySortChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-2.5 py-1 rounded-lg border ${active ? 'bg-card border-primary' : 'bg-background border-border'}`}
    >
      <Text className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ReadyPieceRow({
  piece,
  waitingDays,
  onPreviewPhoto,
  onOpenInPieces,
}: {
  piece: Piece;
  waitingDays: number;
  onPreviewPhoto: () => void;
  onOpenInPieces: () => void;
}) {
  const imageUri = piece.photo ?? piece.imgUrl;
  const primaryDetail = piece.location ?? 'No location';

  return (
    <View className="rounded-xl border border-border bg-background px-2.5 py-2">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onPreviewPhoto}
          disabled={!imageUri}
          activeOpacity={0.8}
          className="w-12 h-12 rounded-lg overflow-hidden bg-muted/40 items-center justify-center mr-2.5"
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Layers size={14} color="hsl(24 12% 48%)" />
          )}
        </TouchableOpacity>

        <View className="flex-1 pr-2">
          <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
            {piece.name}
          </Text>
          <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
            {piece.clay} · {primaryDetail}
          </Text>
          <Text className="text-[10px] text-primary mt-0.5" numberOfLines={1}>
            Waiting {waitingDays} day{waitingDays !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onOpenInPieces}
          className="px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
        >
          <Text className="text-[11px] font-semibold text-primary">View Piece</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function KilnScreen() {
  const router = useRouter();
  const {
    kilns,
    activeFirings,
    scheduledFirings,
    completedFirings,
    waitingForBisque,
    waitingForGlaze,
    assignedPieces,
    kilnFiringCounts,
    addKilnOpen, setAddKilnOpen,
    editKiln, setEditKiln,
    startFiringOpen, setStartFiringOpen,
    startFiringDefaultKilnId,
    detailFiring, setDetailFiring,
    handleSaveKiln,
    handleStartFiringFromKiln,
    handleDeleteKiln,
    addFiring,
  } = useKilnScreen();

  const getKilnName = (kilnId: string) =>
    kilns.find((k) => k.id === kilnId)?.name ?? 'Unknown Kiln';
  const getKilnById = (kilnId: string) => kilns.find((k) => k.id === kilnId);

  const featuredActiveFiring = activeFirings[0] ?? null;
  const sessionRows = React.useMemo(() => {
    const featuredId = featuredActiveFiring?.id;
    return [...activeFirings.filter((firing) => firing.id !== featuredId), ...scheduledFirings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeFirings, featuredActiveFiring?.id, scheduledFirings]);

  const waitingCount = waitingForBisque.length + waitingForGlaze.length;
  const [sectionMode, setSectionMode] = React.useState<'operations' | 'kilns' | 'history'>('operations');
  const [readyFilter, setReadyFilter] = React.useState<'bisque' | 'glaze'>('bisque');
  const [readySort, setReadySort] = React.useState<'longest' | 'newest'>('longest');
  const [showAllReadyPieces, setShowAllReadyPieces] = React.useState(false);
  const [photoPreview, setPhotoPreview] = React.useState<{ uri: string; name: string } | null>(null);
  const [historyKilnId, setHistoryKilnId] = React.useState<string>('all');
  const visibleSessionRows = sessionRows.slice(0, 2);
  const hasOpenSessionContent = featuredActiveFiring !== null || sessionRows.length > 0;

  const getQueueEnteredAt = React.useCallback((piece: Piece, queueStage: 'bone-dry' | 'glazing') => {
    const timelineEntry = [...piece.timeline]
      .reverse()
      .find((entry) => entry.stage === queueStage);
    return timelineEntry?.timestamp ?? piece.createdAt;
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

  const historyGroups = React.useMemo(() => {
    const source =
      historyKilnId === 'all'
        ? completedFirings
        : completedFirings.filter((firing) => firing.kilnId === historyKilnId);

    if (historyKilnId !== 'all') {
      return [
        {
          kilnId: historyKilnId,
          kilnName: getKilnName(historyKilnId),
          firings: source,
        },
      ];
    }

    const groups = new Map<string, typeof completedFirings>();
    source.forEach((firing) => {
      const existing = groups.get(firing.kilnId) ?? [];
      existing.push(firing);
      groups.set(firing.kilnId, existing);
    });

    return Array.from(groups.entries())
      .map(([kilnId, firings]) => ({
        kilnId,
        kilnName: getKilnName(kilnId),
        firings,
      }))
      .sort(
        (a, b) =>
          new Date(b.firings[0]?.completedAt ?? b.firings[0]?.createdAt ?? 0).getTime() -
          new Date(a.firings[0]?.completedAt ?? a.firings[0]?.createdAt ?? 0).getTime()
      );
  }, [completedFirings, historyKilnId, kilns]);

  React.useEffect(() => {
    if (historyKilnId !== 'all' && !kilns.some((kiln) => kiln.id === historyKilnId)) {
      setHistoryKilnId('all');
    }
  }, [historyKilnId, kilns]);

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
    Alert.alert(
      'Delete Kiln',
      `Delete "${kiln.name}"? All associated firings will also be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteKiln(kiln) },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-4 bg-background border-b border-border">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <Image
              source={require('../../assets/animations/kilnPet.gif')}
              style={{ width: 42, height: 42 }}
              resizeMode="contain"
            />
            <View>
              <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>Kiln</Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {kilns.length} profile{kilns.length !== 1 ? 's' : ''} ·{' '}
                {activeFirings.length + scheduledFirings.length} open sessions
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setStartFiringOpen(true)}
            className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary"
          >
            <FlameKindling size={16} color="white" />
            <Text className="text-sm font-semibold text-white">Fire</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-10">
          <View className="mb-6">
            <View className="flex-row bg-muted rounded-2xl p-1">
              <TouchableOpacity
                onPress={() => setSectionMode('operations')}
                className={`flex-1 items-center rounded-xl py-2.5 ${sectionMode === 'operations' ? 'bg-card' : ''}`}
              >
                <Text className={`text-sm font-semibold ${sectionMode === 'operations' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSectionMode('kilns')}
                className={`flex-1 items-center rounded-xl py-2.5 ${sectionMode === 'kilns' ? 'bg-card' : ''}`}
              >
                <Text className={`text-sm font-semibold ${sectionMode === 'kilns' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Kilns
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSectionMode('history')}
                className={`flex-1 items-center rounded-xl py-2.5 ${sectionMode === 'history' ? 'bg-card' : ''}`}
              >
                <Text className={`text-sm font-semibold ${sectionMode === 'history' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  History
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {sectionMode === 'operations' ? (
            <>
              <View className="mb-8">
                <SectionHeader title="Firing Sessions" icon={<Flame size={18} color="hsl(15 80% 52%)" />} />

                {featuredActiveFiring ? (
                  <ActiveFiringCard firing={featuredActiveFiring} onPress={() => setDetailFiring(featuredActiveFiring)} />
                ) : null}

                {hasOpenSessionContent ? (
                  <>
                    {visibleSessionRows.map((firing) => {
                      const status = getAutoFiringStatus(firing, getKilnById(firing.kilnId));
                      const expectedReady = getExpectedReadyAt(firing, getKilnById(firing.kilnId));
                      const statusLabel =
                        status === 'waiting'
                          ? 'Waiting'
                          : status === 'firing'
                            ? 'Firing'
                            : status === 'cooling'
                              ? 'Cooling'
                              : status === 'ready'
                                ? 'Ready'
                                : 'Completed';

                      return (
                        <ScheduledFiringRow
                          key={firing.id}
                          firing={firing}
                          kilnName={getKilnName(firing.kilnId)}
                          statusLabel={statusLabel}
                          expectedReadyLabel={formatReadyDate(expectedReady)}
                          onPress={() => setDetailFiring(firing)}
                        />
                      );
                    })}
                    {sessionRows.length > 2 ? (
                      <Text className="text-[11px] text-muted-foreground mt-1.5">
                        Showing latest 2 sessions. Switch to History for full timeline.
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <Card className="p-5 items-center">
                    <Text className="text-sm font-semibold text-foreground">No active firing sessions</Text>
                    <Text className="text-xs text-muted-foreground mt-1 text-center">
                      Create a bisque or glaze session to start automatic timeline tracking.
                    </Text>
                    <TouchableOpacity
                      onPress={() => setStartFiringOpen(true)}
                      className="mt-3 self-start px-3 py-2 rounded-xl bg-primary"
                    >
                      <Text className="text-xs font-semibold text-primary-foreground">Create Firing Session</Text>
                    </TouchableOpacity>
                  </Card>
                )}
              </View>

              <View className="mb-8">
                <SectionHeader title="Ready to Fire" icon={<Layers size={18} color="hsl(24 20% 40%)" />} />
                <Card className="p-4">
                  <Text className="text-sm text-foreground">
                    You have <Text className="font-semibold">{waitingCount}</Text> piece{waitingCount !== 1 ? 's' : ''} waiting.
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    Assigned right now: {assignedPieces.length}
                  </Text>

                  <View className="flex-row gap-2 mt-3 mb-2">
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
                    <View className="gap-2.5 mt-1">
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
                  ) : (
                    <Text className="text-[11px] text-muted-foreground mt-3">
                      {readyFilter === 'bisque'
                        ? 'No pieces currently in bone-dry queue.'
                        : 'No pieces currently in glazing queue.'}
                    </Text>
                  )}

                  {waitingForBisque.length === 0 && waitingForGlaze.length === 0 ? (
                    <Text className="text-xs text-muted-foreground mt-3">
                      No pieces currently ready for bisque or glaze firing.
                    </Text>
                  ) : null}


                </Card>
              </View>
            </>
          ) : sectionMode === 'kilns' ? (
            <View className="mb-4">
              <SectionHeader
                title="Studio / Kiln Profiles"
                icon={<Thermometer size={18} color="hsl(15 50% 50%)" />}
                action={
                  <TouchableOpacity
                    onPress={() => setAddKilnOpen(true)}
                    className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card"
                  >
                    <Plus size={14} color="hsl(15 50% 50%)" />
                    <Text className="text-xs font-semibold text-primary">Add Kiln</Text>
                  </TouchableOpacity>
                }
              />

              {kilns.length === 0 ? (
                <Card className="p-6 items-center">
                  <FlameKindling size={32} color="hsl(24 20% 60%)" />
                  <Text className="text-sm font-semibold text-foreground mt-3 mb-1">No kilns yet</Text>
                  <Text className="text-xs text-muted-foreground text-center mb-4">
                    Add your kiln to start tracking firings, piece history, and quirks.
                  </Text>
                  <Button onPress={() => setAddKilnOpen(true)} variant="outline" className="w-full">
                    <Text className="text-sm font-semibold">Add Your First Kiln</Text>
                  </Button>
                </Card>
              ) : (
                <>
                  {kilns.map((kiln) => (
                    <KilnCard
                      key={kiln.id}
                      kiln={kiln}
                      firingCount={kilnFiringCounts[kiln.id] ?? 0}
                      onEdit={() => {
                        setEditKiln(kiln);
                        setAddKilnOpen(true);
                      }}
                      onDelete={() => confirmDeleteKiln(kiln)}
                      onStartFiring={() => handleStartFiringFromKiln(kiln.id)}
                    />
                  ))}
                </>
              )}
            </View>
          ) : completedFirings.length > 0 ? (
            <View className="mb-4">
              <SectionHeader title="Firing History" icon={<Zap size={18} color="hsl(142 60% 40%)" />} />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setHistoryKilnId('all')}
                    className={`px-3 py-1.5 rounded-xl border ${historyKilnId === 'all' ? 'bg-card border-primary' : 'bg-background border-border'}`}
                  >
                    <Text className={`text-xs font-semibold ${historyKilnId === 'all' ? 'text-primary' : 'text-muted-foreground'}`}>
                      All Kilns
                    </Text>
                  </TouchableOpacity>
                  {kilns.map((kiln) => {
                    const isActive = historyKilnId === kiln.id;
                    return (
                      <TouchableOpacity
                        key={kiln.id}
                        onPress={() => setHistoryKilnId(kiln.id)}
                        className={`px-3 py-1.5 rounded-xl border ${isActive ? 'bg-card border-primary' : 'bg-background border-border'}`}
                      >
                        <Text className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                          {kiln.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {historyGroups.filter((group) => group.firings.length > 0).length > 0 ? (
                historyGroups
                  .filter((group) => group.firings.length > 0)
                  .map((group) => (
                    <View key={group.kilnId} className="mb-2">
                      {historyKilnId === 'all' ? (
                        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-1">
                          {group.kilnName}
                        </Text>
                      ) : null}
                      {group.firings.map((firing) => (
                        <FiringHistoryRow
                          key={firing.id}
                          firing={firing}
                          kilnName={group.kilnName}
                          onPress={() => setDetailFiring(firing)}
                        />
                      ))}
                    </View>
                  ))
              ) : (
                <View className="items-center py-8">
                  <Text className="text-sm text-muted-foreground">No completed firings for this kiln yet.</Text>
                </View>
              )}
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-sm text-muted-foreground">No completed firings yet.</Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Completed sessions will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <AddKilnModal
        visible={addKilnOpen || !!editKiln}
        onClose={() => { setAddKilnOpen(false); setEditKiln(undefined); }}
        onSave={handleSaveKiln}
        editKiln={editKiln}
      />
      <StartFiringModal
        visible={startFiringOpen}
        onClose={() => setStartFiringOpen(false)}
        onStart={addFiring}
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
    </View>
  );
}
