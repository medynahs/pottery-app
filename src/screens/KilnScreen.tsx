// src/screens/KilnScreen.tsx
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { Flame, FlameKindling, Layers, Plus, Thermometer, Timer, Zap } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { AddKilnModal } from './kiln/AddKilnModal';
import { ActiveFiringCard } from './kiln/components/ActiveFiringCard';
import { FiringHistoryRow, ScheduledFiringRow, WaitingPieceRow } from './kiln/components/FiringRows';
import { KilnCard } from './kiln/components/KilnCard';
import { LoadingChecklist } from './kiln/components/LoadingChecklist';
import { SectionHeader } from './kiln/components/SectionHeader';
import { FiringDetailModal } from './kiln/FiringDetailModal';
import { useKilnScreen } from './kiln/hooks/useKilnScreen';
import { StartFiringModal } from './kiln/StartFiringModal';
import type { Kiln } from './kiln/types';

export default function KilnScreen() {
  const {
    kilns,
    kilnChecklist,
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
    toggleKilnChecklistItem,
    addKilnChecklistItem,
    removeKilnChecklistItem,
  } = useKilnScreen();

  const kilnsFromStore = useAppStore((s) => s.kilns);
  const getKilnName = (kilnId: string) =>
    kilnsFromStore.find((k) => k.id === kilnId)?.name ?? 'Unknown Kiln';

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
      <View className="px-6 pt-20 pb-4 bg-background border-b border-border">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <Image
              source={require('../../assets/animations/kilnPet.gif')}
              style={{ width: 52, height: 52 }}
              resizeMode="contain"
            />
            <View>
              <Text className="text-3xl font-serif font-bold text-foreground">Studio Kiln</Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {kilns.length} kiln{kilns.length !== 1 ? 's' : ''} ·{' '}
                {activeFirings.length + scheduledFirings.length} active
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

          {/* Active Firings */}
          {activeFirings.length > 0 && (
            <View className="mb-8">
              <SectionHeader title="Active Firings" icon={<Flame size={18} color="hsl(15 80% 52%)" />} />
              {activeFirings.map((f) => (
                <ActiveFiringCard key={f.id} firing={f} onPress={() => setDetailFiring(f)} />
              ))}
            </View>
          )}

          {/* Pieces Waiting */}
          <View className="mb-8">
            <SectionHeader title="Pieces Waiting" icon={<Layers size={18} color="hsl(24 20% 40%)" />} />
            <Card className="px-4 pt-2 pb-3">
              {waitingForBisque.length === 0 && waitingForGlaze.length === 0 && assignedPieces.length === 0 ? (
                <View className="py-4 items-center">
                  <Text className="text-sm text-muted-foreground">No pieces waiting for firing</Text>
                  <Text className="text-xs text-muted-foreground mt-1">Pieces at Bone Dry or Glazing will appear here</Text>
                </View>
              ) : (
                <>
                  {waitingForBisque.length > 0 && (
                    <>
                      <Text className="text-xs font-semibold text-amber-600 mt-2 mb-1">
                        Bone Dry — Ready for Bisque ({waitingForBisque.length})
                      </Text>
                      {waitingForBisque.map((p, i) => (
                        <WaitingPieceRow
                          key={p.id}
                          name={p.name}
                          sublabel={p.clay || 'Unknown clay'}
                          dotColor="#d97706"
                          isLast={i === waitingForBisque.length - 1 && waitingForGlaze.length === 0 && assignedPieces.length === 0}
                        />
                      ))}
                    </>
                  )}
                  {waitingForGlaze.length > 0 && (
                    <>
                      <Text className="text-xs font-semibold text-orange-600 mt-3 mb-1">
                        Glazed — Ready for Glaze Fire ({waitingForGlaze.length})
                      </Text>
                      {waitingForGlaze.map((p, i) => (
                        <WaitingPieceRow
                          key={p.id}
                          name={p.name}
                          sublabel={p.clay || 'Unknown clay'}
                          dotColor="#ea580c"
                          isLast={i === waitingForGlaze.length - 1 && assignedPieces.length === 0}
                        />
                      ))}
                    </>
                  )}
                  {assignedPieces.length > 0 && (
                    <>
                      <Text className="text-xs font-semibold text-blue-600 mt-3 mb-1">
                        Assigned to Firing ({assignedPieces.length})
                      </Text>
                      {assignedPieces.map((p, i) => (
                        <WaitingPieceRow
                          key={p.id}
                          name={p.name}
                          sublabel={p.clay || 'Unknown clay'}
                          dotColor="#2563eb"
                          isLast={i === assignedPieces.length - 1}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </Card>
          </View>

          {/* Scheduled */}
          {scheduledFirings.length > 0 && (
            <View className="mb-8">
              <SectionHeader title="Scheduled" icon={<Timer size={18} color="hsl(220 80% 56%)" />} />
              {scheduledFirings.map((f) => (
                <ScheduledFiringRow
                  key={f.id}
                  firing={f}
                  kilnName={getKilnName(f.kilnId)}
                  onPress={() => setDetailFiring(f)}
                />
              ))}
            </View>
          )}

          {/* Loading Checklist */}
          <View className="mb-8">
            <SectionHeader title="Loading Checklist" />
            <LoadingChecklist
              items={kilnChecklist}
              onToggle={toggleKilnChecklistItem}
              onRemove={removeKilnChecklistItem}
              onAdd={addKilnChecklistItem}
            />
          </View>

          {/* My Kilns */}
          <View className="mb-8">
            <SectionHeader
              title="My Kilns"
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
              kilns.map((kiln) => (
                <KilnCard
                  key={kiln.id}
                  kiln={kiln}
                  firingCount={kilnFiringCounts[kiln.id] ?? 0}
                  onEdit={() => { setEditKiln(kiln); setAddKilnOpen(true); }}
                  onDelete={() => confirmDeleteKiln(kiln)}
                  onStartFiring={() => handleStartFiringFromKiln(kiln.id)}
                />
              ))
            )}
          </View>

          {/* Firing History */}
          {completedFirings.length > 0 && (
            <View className="mb-4">
              <SectionHeader title="Firing History" icon={<Zap size={18} color="hsl(142 60% 40%)" />} />
              {completedFirings.map((f) => (
                <FiringHistoryRow
                  key={f.id}
                  firing={f}
                  kilnName={getKilnName(f.kilnId)}
                  onPress={() => setDetailFiring(f)}
                />
              ))}
            </View>
          )}

          {kilns.length > 0 &&
            completedFirings.length === 0 &&
            activeFirings.length === 0 &&
            scheduledFirings.length === 0 && (
              <View className="items-center py-8">
                <Text className="text-sm text-muted-foreground">No firings recorded yet.</Text>
                <Text className="text-xs text-muted-foreground mt-1">
                  Start a firing to begin your history.
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
    </View>
  );
}
