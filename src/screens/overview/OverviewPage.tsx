import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { StudioTabScreen } from '@/src/components/StudioTabScreen';
import {
  TAB_FLOATING_ACTION_BOTTOM,
  TAB_SCROLL_BOTTOM_PADDING,
} from '@/src/constants/tabScreenLayout';
import { Text } from '@/src/components/ui/text';
import { ChallengeBanner } from '@/src/screens/overview/components/ChallengeBanner';
import { FeedbackModal } from '@/src/screens/overview/components/FeedbackModal';
import { FiringQueueWidget } from '@/src/screens/overview/components/FiringQueueWidget';
import { GlazeTestWallWidget } from '@/src/screens/overview/components/GlazeTestWallWidget';
import { InviteStudioCard } from '@/src/screens/overview/components/InviteStudioCard';
import { LiveStudioStateHero } from '@/src/screens/overview/components/LiveStudioStateHero';
import { OverviewPageHeader } from '@/src/screens/overview/components/OverviewPageHeader';
import { SetupModeSection } from '@/src/screens/overview/components/SetupModeSection';
import { StudioJournalWidget } from '@/src/screens/overview/components/StudioJournalWidget';
import { TodaysMissionsWidget } from '@/src/screens/overview/components/TodaysMissionsWidget';
import { useOverviewPage } from '@/src/screens/overview/hooks/useOverviewPage';
import { resetLocalDataForTesting } from '@/src/store/clearLocalData';
import { MessageSquarePlus } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export function OverviewPage() {
  const [resettingLocalData, setResettingLocalData] = useState(false);
  const {
    insets,
    PaywallGate,
    user,
    isPremium,
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
    initialSetupQuestCount,
    heroReveal,
    focusReveal,
    journalReveal,
    testWallReveal,
    glazeTests,
    glazes,
    oneThingCard,
    queuePreview,
    pieces,
    finishedThisMonth,
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
    onChallengePress,
    hasKilnTab,
    hasCommunityTab,
    kilnQueueRoute,
    firingQueueSnapshot,
    activeFiringSummary,
    showFiringQueueWidget,
    showInviteStudioCard,
  } = useOverviewPage();

  const openStudioRhythm = () => navigate('/profile/studio-rhythm');

  return (
    <StudioTabScreen>
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
        onRhythmPress={openStudioRhythm}
        isPremium={isPremium}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: TAB_SCROLL_BOTTOM_PADDING,
        }}
      >
        {__DEV__ ? (
          <TouchableOpacity
            onPress={() => {
              setResettingLocalData(true);
              void resetLocalDataForTesting();
            }}
            disabled={resettingLocalData}
            activeOpacity={0.8}
            className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3"
          >
            <Text className="text-xs font-semibold text-destructive">
              {resettingLocalData ? 'Resetting local data…' : 'Reset all local data (new user)'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {isSetupMode ? (
          <SetupModeSection
            heroReveal={heroReveal}
            userName={user.name}
            setupQuests={setupQuests}
            initialSetupQuestCount={initialSetupQuestCount}
            kilnkinName={kilnkinCompanion.name}
            onQuestPress={navigate}
            onKilnkinPress={onKilnkinPress}
            onPat={handlePat}
          />
        ) : null}

        {!isSetupMode && showInviteStudioCard ? (
          <InviteStudioCard onOpenStudios={() => navigate('/studios' as never)} />
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
            finishedThisMonth={finishedThisMonth}
            onAnalyticsPress={onAnalyticsPress}
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
            onRhythmPress={openStudioRhythm}
          />
        ) : null}

        {!isSetupMode && hasCommunityTab ? (
          <ChallengeBanner onPress={onChallengePress} />
        ) : null}

        {!isSetupMode && showFiringQueueWidget ? (
          <FiringQueueWidget
            hasKilnTab={hasKilnTab}
            snapshot={firingQueueSnapshot}
            activeFiring={activeFiringSummary}
            queuePreview={queuePreview}
            onNavigate={navigate}
            onOpenQueue={() => navigate(kilnQueueRoute)}
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
        style={{ bottom: TAB_FLOATING_ACTION_BOTTOM }}
        accessibilityRole="button"
        accessibilityLabel="Leave feedback"
      >
        <MessageSquarePlus size={15} color="hsl(24 20% 38%)" />
        <Text className="text-xs font-medium text-foreground">Feedback</Text>
      </TouchableOpacity>

      <FeedbackModal visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      {PaywallGate}
    </StudioTabScreen>
  );
}
