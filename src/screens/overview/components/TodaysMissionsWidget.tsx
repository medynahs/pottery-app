import { Text } from '@/src/components/ui/text';
import { MISSION_META } from '@/src/screens/overview/constants/missionMeta';
import type { StudioRhythmSuggestion, StudioRhythmSuggestionType } from '@/src/screens/overview/studioRythm/generateStudioRhythmSuggestions';
import type { Href } from 'expo-router';
import { CalendarDays, Check, PenLine, Plus, X } from 'lucide-react-native';
import React from 'react';
import { Animated, TextInput, TouchableOpacity, View } from 'react-native';

type MissionWithCompletion = StudioRhythmSuggestion & { completed: boolean };

type CustomTodo = {
  id: string;
  title: string;
  completed: boolean;
};

type TodaysMissionsWidgetProps = {
  focusReveal: Animated.Value;
  rhythmConfigured: boolean;
  missionChecklistCount: number;
  missionChecklistDone: number;
  visibleMissions: MissionWithCompletion[];
  visibleCustomTodos: CustomTodo[];
  customTodos: CustomTodo[];
  hiddenTaskCount: number;
  showAllMissionTasks: boolean;
  showAddTodoComposer: boolean;
  draftTodo: string;
  onDraftTodoChange: (text: string) => void;
  onToggleAddTodoComposer: () => void;
  onAddCustomTodo: () => void;
  onCancelAddTodo: () => void;
  onToggleCustomTodo: (id: string) => void;
  onToggleMissionCompletion: (missionType: StudioRhythmSuggestionType) => void;
  onShowAllTasks: () => void;
  onShowFewerTasks: () => void;
  onMissionPress: (route: Href) => void;
  onRhythmPress: () => void;
};

const CARD_BG = 'hsl(40 30% 99%)';
const HEADER_BG = 'hsl(38 28% 96%)';
const BORDER = 'hsl(34 28% 84%)';
const ACCENT = 'hsl(32 48% 36%)';
const PROGRESS_FILL = 'hsl(39 57% 51%)';
const PROGRESS_TRACK = 'hsl(35 42% 88%)';

function TaskCheckbox({
  completed,
  onPress,
  label,
}: {
  completed: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={label}
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: completed ? 0 : 2,
        borderColor: 'hsl(32 28% 72%)',
        backgroundColor: completed ? 'hsl(36 70% 48%)' : 'hsl(40 30% 99%)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {completed ? <Check size={12} color="white" strokeWidth={3} /> : null}
    </TouchableOpacity>
  );
}

function AddTaskComposer({
  draftTodo,
  onDraftTodoChange,
  onAddCustomTodo,
  onCancelAddTodo,
  show,
  onOpen,
}: {
  draftTodo: string;
  onDraftTodoChange: (text: string) => void;
  onAddCustomTodo: () => void;
  onCancelAddTodo: () => void;
  show: boolean;
  onOpen: () => void;
}) {
  const inputRef = React.useRef<TextInput>(null);
  const canAdd = draftTodo.trim().length > 0;

  React.useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [show]);

  if (!show) {
    return (
      <TouchableOpacity
        onPress={onOpen}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel="Add a personal task"
        style={{
          marginHorizontal: 16,
          marginTop: 14,
          marginBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRadius: 14,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: 'hsl(34 32% 78%)',
          backgroundColor: 'hsl(44 70% 97%)',
          paddingHorizontal: 12,
          paddingVertical: 11,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'hsl(35 42% 88%)',
          }}
        >
          <Plus size={14} color={ACCENT} />
        </View>
        <Text style={{ fontSize: 12, fontWeight: '600', color: ACCENT }}>Add a personal task</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 14,
        marginBottom: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'hsl(39 45% 72%)',
        backgroundColor: 'hsl(44 70% 96%)',
        padding: 10,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.7, color: ACCENT, textTransform: 'uppercase', marginBottom: 8 }}>
        New task
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextInput
          ref={inputRef}
          value={draftTodo}
          onChangeText={onDraftTodoChange}
          placeholder="What do you want to get done today?"
          placeholderTextColor="hsl(32 20% 58%)"
          returnKeyType="done"
          onSubmitEditing={() => {
            if (canAdd) onAddCustomTodo();
          }}
          style={{
            flex: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'hsl(34 28% 78%)',
            backgroundColor: 'white',
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 13,
            color: 'hsl(24 20% 18%)',
          }}
        />
        <TouchableOpacity
          onPress={onAddCustomTodo}
          activeOpacity={0.82}
          disabled={!canAdd}
          accessibilityRole="button"
          accessibilityLabel="Add task to list"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: PROGRESS_FILL,
            opacity: canAdd ? 1 : 0.45,
          }}
        >
          <Check size={16} color="white" strokeWidth={3} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancelAddTodo}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Cancel adding task"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'hsl(34 28% 88%)',
          }}
        >
          <X size={16} color="hsl(32 30% 38%)" />
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 10, color: 'hsl(32 28% 48%)', marginTop: 7 }}>
        Press return or the check to add
      </Text>
    </View>
  );
}

export function TodaysMissionsWidget({
  focusReveal,
  rhythmConfigured,
  missionChecklistCount,
  missionChecklistDone,
  visibleMissions,
  visibleCustomTodos,
  customTodos,
  hiddenTaskCount,
  showAllMissionTasks,
  showAddTodoComposer,
  draftTodo,
  onDraftTodoChange,
  onToggleAddTodoComposer,
  onAddCustomTodo,
  onCancelAddTodo,
  onToggleCustomTodo,
  onToggleMissionCompletion,
  onShowAllTasks,
  onShowFewerTasks,
  onMissionPress,
  onRhythmPress,
}: TodaysMissionsWidgetProps) {
  const progressPct = missionChecklistCount > 0
    ? Math.round((missionChecklistDone / missionChecklistCount) * 100)
    : 0;

  return (
    <Animated.View
      style={{
        opacity: focusReveal,
        transform: [{
          translateY: focusReveal.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 0],
          }),
        }],
      }}
    >
      <View
        className="rounded-[24px] overflow-hidden mb-4"
        style={{
          backgroundColor: CARD_BG,
          borderWidth: 1,
          borderColor: BORDER,
          shadowColor: '#3f2a12',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <View className="px-4 pt-4 pb-3" style={{ backgroundColor: HEADER_BG, borderBottomWidth: 1, borderBottomColor: BORDER }}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: ACCENT, textTransform: 'uppercase' }}>
                Today&apos;s Missions
              </Text>
              <Text style={{ fontSize: 12, color: 'hsl(32 30% 42%)', marginTop: 4, lineHeight: 17 }}>
                {rhythmConfigured ? 'Rhythm tasks and anything you add for today' : 'Set up Studio Rhythm for a daily checklist'}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {missionChecklistCount > 0 ? (
                <View
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor: 'hsl(35 42% 90%)',
                    borderWidth: 1,
                    borderColor: BORDER,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: ACCENT }}>
                    {missionChecklistDone}/{missionChecklistCount}
                  </Text>
                </View>
              ) : null}
              <TouchableOpacity
                onPress={onRhythmPress}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Manage Studio Rhythm"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'hsl(35 42% 90%)',
                  borderWidth: 1,
                  borderColor: BORDER,
                }}
              >
                <CalendarDays size={15} color={ACCENT} />
              </TouchableOpacity>
            </View>
          </View>

          {missionChecklistCount > 0 ? (
            <View style={{ marginTop: 12 }}>
              <View
                style={{
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: PROGRESS_TRACK,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    borderRadius: 999,
                    backgroundColor: PROGRESS_FILL,
                  }}
                />
              </View>
              <Text style={{ fontSize: 10, color: 'hsl(32 28% 48%)', marginTop: 6, fontWeight: '500' }}>
                {progressPct === 100 ? 'All done for today' : `${progressPct}% complete`}
              </Text>
            </View>
          ) : null}
        </View>

        <AddTaskComposer
          show={showAddTodoComposer}
          draftTodo={draftTodo}
          onDraftTodoChange={onDraftTodoChange}
          onAddCustomTodo={onAddCustomTodo}
          onCancelAddTodo={onCancelAddTodo}
          onOpen={onToggleAddTodoComposer}
        />

        {visibleMissions.map((mission, idx) => {
          const meta = MISSION_META[mission.type];
          if (!meta) return null;
          const Icon = meta.Icon;
          return (
            <View
              key={mission.type}
              className="flex-row items-center gap-3 px-4 py-3"
              style={{
                borderTopWidth: idx === 0 && !showAddTodoComposer ? 0 : 1,
                borderTopColor: 'hsl(34 25% 88%)',
                backgroundColor: mission.completed ? 'hsl(38 24% 97%)' : CARD_BG,
              }}
            >
              <TouchableOpacity
                onPress={() => onMissionPress(mission.route)}
                activeOpacity={0.75}
                className="flex-1 flex-row items-center gap-3"
                accessibilityRole="button"
                accessibilityLabel={`${meta.title}: ${mission.text}`}
              >
                <View
                  className={`w-9 h-9 rounded-xl items-center justify-center border border-border ${meta.chipClassName}`}
                  style={{ opacity: mission.completed ? 0.5 : 1 }}
                >
                  <Icon size={16} color={meta.iconColor} />
                </View>
                <View className="flex-1">
                  <Text className={`text-[13px] font-semibold${mission.completed ? ' text-muted-foreground line-through' : ' text-foreground'}`}>
                    {meta.title}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={2}>
                    {mission.text}
                  </Text>
                </View>
              </TouchableOpacity>
              <TaskCheckbox
                completed={mission.completed}
                onPress={() => onToggleMissionCompletion(mission.type)}
                label={mission.completed ? `Reopen ${meta.title}` : `Mark ${meta.title} done`}
              />
            </View>
          );
        })}

        {customTodos.length > 0 ? (
          <View style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 25% 86%)', backgroundColor: 'hsl(44 70% 97%)' }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 0.7,
                color: 'hsl(32 38% 42%)',
                textTransform: 'uppercase',
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingBottom: 2,
              }}
            >
              Your tasks
            </Text>
            {visibleCustomTodos.map((todo) => (
              <View
                key={todo.id}
                className="flex-row items-center gap-3 px-4 py-3"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: 'hsl(34 24% 88%)',
                  backgroundColor: todo.completed ? 'hsl(38 24% 97%)' : 'transparent',
                }}
              >
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: 'hsl(35 52% 90%)',
                    borderWidth: 1,
                    borderColor: 'hsl(34 28% 82%)',
                    opacity: todo.completed ? 0.55 : 1,
                  }}
                >
                  <PenLine size={14} color="hsl(33 42% 38%)" />
                </View>
                <Text className={`flex-1 text-[13px] font-medium${todo.completed ? ' text-muted-foreground line-through' : ' text-foreground'}`}>
                  {todo.title}
                </Text>
                <TaskCheckbox
                  completed={todo.completed}
                  onPress={() => onToggleCustomTodo(todo.id)}
                  label={todo.completed ? 'Reopen task' : 'Mark task done'}
                />
              </View>
            ))}
          </View>
        ) : null}

        {hiddenTaskCount > 0 ? (
          <TouchableOpacity
            onPress={onShowAllTasks}
            activeOpacity={0.82}
            className="px-4 py-2.5"
            style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 25% 86%)', backgroundColor: 'hsl(35 46% 94%)' }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: ACCENT }}>
              Show {hiddenTaskCount} more task{hiddenTaskCount > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ) : showAllMissionTasks && missionChecklistCount > 4 ? (
          <TouchableOpacity
            onPress={onShowFewerTasks}
            activeOpacity={0.82}
            className="px-4 py-2.5"
            style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 25% 86%)', backgroundColor: 'hsl(35 46% 94%)' }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: ACCENT }}>Show fewer tasks</Text>
          </TouchableOpacity>
        ) : null}

        {!rhythmConfigured && missionChecklistCount === 0 ? (
          <TouchableOpacity
            onPress={onRhythmPress}
            activeOpacity={0.86}
            className="flex-row items-center gap-3 px-4 py-4"
            style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 25% 86%)', backgroundColor: 'hsl(44 70% 96%)' }}
            accessibilityRole="button"
            accessibilityLabel="Set up Studio Rhythm"
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'hsl(35 42% 88%)',
              }}
            >
              <CalendarDays size={18} color="hsl(32 60% 40%)" />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-foreground mb-0.5">No rhythm set yet</Text>
              <Text className="text-[11px] text-muted-foreground leading-4">Set up Studio Rhythm to get a daily checklist.</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </Animated.View>
  );
}

