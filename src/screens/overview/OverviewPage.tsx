import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { Text } from '@/src/components/ui/text';
import { FeedbackModal } from '@/src/screens/overview/components/FeedbackModal';
import { GlazeTestWallWidget } from '@/src/screens/overview/components/GlazeTestWallWidget';
import { LiveStudioStateHero } from '@/src/screens/overview/components/LiveStudioStateHero';
import { OverviewPageHeader } from '@/src/screens/overview/components/OverviewPageHeader';
import { SetupModeSection } from '@/src/screens/overview/components/SetupModeSection';
import { StudioJournalWidget } from '@/src/screens/overview/components/StudioJournalWidget';
import { TodaysMissionsWidget } from '@/src/screens/overview/components/TodaysMissionsWidget';
import { useOverviewPage } from '@/src/screens/overview/hooks/useOverviewPage';
import { MessageSquarePlus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export function OverviewPage() {
  const {
    insets,
    PaywallGate,
    user,
    kilnkinCompanion,
    feedbackOpen,
    setFeedbackOpen,
    overlayCeremony,
    setOverlayCeremony,
    greeting,
    todayLabel,
    isSetupMode,
    todayRhythm,
    setupQuests,
    heroReveal,
    focusReveal,
    journalReveal,
    testWallReveal,
    glazeTests,
    glazes,
    oneThingCard,
    queuePreview,
    pieces,
    missionsSummary,
    stageChips,
    kilnkinNudge,
    petMood,
    patReaction,
    handlePat,
    rhythmConfigured,
    missionChecklistCount,
    missionChecklistDone,
    visibleMissions,
    visibleCustomTodos,
    customTodos,
    hiddenTaskCount,
    showAllMissionTasks,
    setShowAllMissionTasks,
    showAddTodoComposer,
    setShowAddTodoComposer,
    draftTodo,
    setDraftTodo,
    addCustomTodo,
    toggleCustomTodo,
    todayMissionKey,
    toggleDailyMissionCompletion,
    activityFeed,
    showJournalWidget,
    setShowJournalWidget,
    navigate,
    onAnalyticsPress,
    onProfilePress,
    onKilnkinPress,
  } = useOverviewPage();

  return (
    <View className="flex-1 bg-background">
      <CeremonyOverlay
        visible={overlayCeremony !== null}
        emoji={overlayCeremony?.emoji ?? '🏺'}
        title={overlayCeremony?.title ?? ''}
        subtitle={overlayCeremony?.subtitle ?? ''}
        tint={overlayCeremony?.tint ?? 'rgba(130, 180, 110, 1)'}
        durationMs={3500}
        onDismiss={() => setOverlayCeremony(null)}
      />

      <OverviewPageHeader
        paddingTop={insets.top + 14}
        greeting={greeting}
        todayLabel={todayLabel}
        isSetupMode={isSetupMode}
        todayRhythm={todayRhythm}
        user={user}
        onAnalyticsPress={onAnalyticsPress}
        onProfilePress={onProfilePress}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 110, backgroundColor: 'hsl(35 62% 93%)' }}
      >
        {isSetupMode ? (
          <SetupModeSection
            heroReveal={heroReveal}
            userName={user.name}
            setupQuests={setupQuests}
            kilnkinName={kilnkinCompanion.name}
            onQuestPress={navigate}
            onKilnkinPress={onKilnkinPress}
            onPat={handlePat}
          />
        ) : null}

        {!isSetupMode ? (
          <LiveStudioStateHero
            heroReveal={heroReveal}
            oneThingCard={oneThingCard}
            queuePreview={queuePreview}
            pieceCount={pieces.length}
            missionsCompleted={missionsSummary.completedCount}
            missionsTotal={missionsSummary.total}
            stageChips={stageChips}
            kilnkinNudge={kilnkinNudge}
            kilnkinName={kilnkinCompanion.name}
            petMood={petMood}
            patReaction={patReaction}
            onOneThingPress={navigate}
            onStageChipPress={navigate}
            onKilnkinPress={onKilnkinPress}
            onPat={handlePat}
          />
        ) : null}

        {!isSetupMode ? (
          <TodaysMissionsWidget
            focusReveal={focusReveal}
            rhythmConfigured={rhythmConfigured}
            missionChecklistCount={missionChecklistCount}
            missionChecklistDone={missionChecklistDone}
            visibleMissions={visibleMissions}
            visibleCustomTodos={visibleCustomTodos}
            customTodos={customTodos}
            hiddenTaskCount={hiddenTaskCount}
            showAllMissionTasks={showAllMissionTasks}
            showAddTodoComposer={showAddTodoComposer}
            draftTodo={draftTodo}
            onDraftTodoChange={setDraftTodo}
            onToggleAddTodoComposer={() => setShowAddTodoComposer((v) => !v)}
            onAddCustomTodo={addCustomTodo}
            onCancelAddTodo={() => {
              setDraftTodo('');
              setShowAddTodoComposer(false);
            }}
            onToggleCustomTodo={toggleCustomTodo}
            onToggleMissionCompletion={(type) => toggleDailyMissionCompletion(todayMissionKey, type)}
            onShowAllTasks={() => setShowAllMissionTasks(true)}
            onShowFewerTasks={() => setShowAllMissionTasks(false)}
            onMissionPress={navigate}
            onSetupRhythmPress={() => navigate('/profile/studio-rhythm')}
          />
        ) : null}

        {!isSetupMode ? (
          <GlazeTestWallWidget
            reveal={testWallReveal}
            glazes={glazes}
            glazeTests={glazeTests}
          />
        ) : null}

        {!isSetupMode ? (
          <StudioJournalWidget
            journalReveal={journalReveal}
            activityFeed={activityFeed}
            expanded={showJournalWidget}
            onToggleExpand={() => setShowJournalWidget((v) => !v)}
            onEntryPress={(entry) => navigate({
              pathname: '/(tabs)/pieces',
              params: {
                openJournalPieceId: String(entry.pieceId),
                openJournalStage: entry.stage,
              },
            })}
          />
        ) : null}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setFeedbackOpen(true)}
        activeOpacity={0.86}
        className="absolute right-4 rounded-2xl border border-border bg-card/95 px-3 py-2 flex-row items-center gap-2"
        style={{ bottom: insets.bottom - 20 }}
        accessibilityRole="button"
        accessibilityLabel="Leave feedback"
      >
        <MessageSquarePlus size={15} color="hsl(24 20% 38%)" />
        <Text className="text-xs font-medium text-foreground">Feedback</Text>
      </TouchableOpacity>

      <FeedbackModal visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      {PaywallGate}
    </View>
  );
}
