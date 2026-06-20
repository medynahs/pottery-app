import { Text } from '@/src/components/ui/text';
import type { Piece } from '@/src/types/pieces';
import { Pencil, Shuffle, Zap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { Ritual, StageKey, StudioRhythm } from '../studioRhythm';
import { EVENT_CATEGORIES, STAGE_CONFIG, getDateKey } from '../studioRhythm';
import { EVENT_CATEGORY_ICONS, STAGE_RHYTHM_ICONS, resolveRitualIcon } from '../studioRhythmIcons';
import { RHYTHM_BROWN } from '../rhythmTheme';
import { RhythmIconBadge } from './RhythmIconBadge';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STAGE_ORDER: StageKey[] = ['throw', 'trim', 'glaze', 'bisque'];

type ViewMode = 'week' | 'month';

interface WeekGridCardProps {
  rhythm: StudioRhythm;
  onEditPress: () => void;
  pieces?: Piece[];
  rituals?: Ritual[];
  hideEditButton?: boolean;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return getDateKey(d);
}

function formatShort(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function WeekGridCard({ rhythm, onEditPress, pieces = [], rituals = [], hideEditButton = false }: WeekGridCardProps) {
  const stageDayMap = Object.fromEntries(rhythm.stageDays.map((sd) => [sd.stage, sd.days]));
  const todayIndex = (new Date().getDay() + 6) % 7;
  const todayKey = getDateKey();
  const pinnedRituals = rituals.filter((r) => r.enabled && r.dayOfWeek !== undefined);
  const [view, setView] = useState<ViewMode>('week');
  const showToggle = rhythm.type !== 'freeform';

  const sprintEndKey = useMemo(() => {
    if (rhythm.type !== 'sprint' || !rhythm.sprintStartDate) return null;
    const weeks = rhythm.sprintLengthWeeks ?? 2;
    return addDays(rhythm.sprintStartDate, weeks * 7 - 1);
  }, [rhythm.type, rhythm.sprintStartDate, rhythm.sprintLengthWeeks]);

  const sprintWeekNumber = useMemo(() => {
    if (rhythm.type !== 'sprint' || !rhythm.sprintStartDate) return null;
    const start = new Date(rhythm.sprintStartDate);
    const today = new Date(todayKey);
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.floor(diffDays / 7) + 1, rhythm.sprintLengthWeeks ?? 2);
  }, [rhythm.type, rhythm.sprintStartDate, rhythm.sprintLengthWeeks, todayKey]);

  const sprintPieceCount = useMemo(() => {
    if (rhythm.type !== 'sprint' || !rhythm.sprintStartDate) return 0;
    return pieces.filter((p) => p.createdAt >= rhythm.sprintStartDate!).length;
  }, [pieces, rhythm.type, rhythm.sprintStartDate]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof rhythm.events> = {};
    for (const event of rhythm.events) {
      const key = event.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(event);
    }
    return map;
  }, [rhythm.events]);

  const weekDates = useMemo(() => {
    const monday = new Date(todayKey);
    monday.setDate(monday.getDate() - todayIndex);
    return Array.from({ length: 7 }, (_, i) => addDays(getDateKey(monday), i));
  }, [todayKey, todayIndex]);

  return (
    <View
      className="rounded-2xl border p-4"
      style={{ backgroundColor: RHYTHM_BROWN.surface, borderColor: RHYTHM_BROWN.surfaceBorder }}
    >
      <View className="flex-row items-center justify-between mb-4">
        {showToggle ? (
          <View className="flex-row rounded-xl border border-border bg-muted/50 p-1">
            {(['week', 'month'] as ViewMode[]).map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setView(v)}
                activeOpacity={0.85}
                className={`rounded-lg px-4 py-1.5 ${view === v ? 'bg-primary' : ''}`}
              >
                <Text className={`text-xs font-semibold capitalize ${view === v ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex-row items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
            <Shuffle size={13} color="hsl(270 55% 52%)" />
            <Text className="text-xs font-semibold text-foreground">Freeform</Text>
          </View>
        )}

        {!hideEditButton ? (
          <TouchableOpacity
            onPress={onEditPress}
            activeOpacity={0.8}
            className="flex-row items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5"
          >
            <Pencil size={12} color="hsl(39 57% 51%)" />
            <Text className="text-xs text-primary font-semibold">Edit days</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {rhythm.type === 'sprint' && rhythm.sprintStartDate && sprintEndKey && (
        <View className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <Zap size={13} color="#92400e" />
              <Text className="text-sm font-bold text-amber-950">
                Week {sprintWeekNumber} of {rhythm.sprintLengthWeeks ?? 2}
              </Text>
            </View>
            <Text className="text-[11px] font-medium text-amber-800">
              {formatShort(rhythm.sprintStartDate)} – {formatShort(sprintEndKey)}
            </Text>
          </View>
          <View className="flex-row gap-1.5 mb-2">
            {Array.from({ length: rhythm.sprintLengthWeeks ?? 2 }, (_, i) => (
              <View
                key={i}
                className="flex-1 h-2 rounded-full"
                style={{
                  backgroundColor: i < (sprintWeekNumber ?? 0) ? '#d97706' : 'rgba(146,64,14,0.18)',
                }}
              />
            ))}
          </View>
          {rhythm.sprintGoalPieces != null && rhythm.sprintGoalPieces > 0 && (
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-semibold text-amber-900">
                {sprintPieceCount}/{rhythm.sprintGoalPieces} pieces
              </Text>
              <View className="flex-1 h-2 rounded-full overflow-hidden bg-amber-100">
                <View
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${Math.min(100, Math.round((sprintPieceCount / rhythm.sprintGoalPieces) * 100))}%` }}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {rhythm.type === 'freeform' && view !== 'month' && (
        <View className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 items-center mb-1">
          <Text className="text-sm font-semibold text-foreground text-center mb-1">
            No fixed day assignments
          </Text>
          <Text className="text-xs text-muted-foreground text-center leading-5 mb-4">
            Your rhythm follows events and rituals. Switch to month view to see what&apos;s ahead.
          </Text>
          <TouchableOpacity
            onPress={() => setView('month')}
            activeOpacity={0.85}
            className="rounded-xl bg-primary px-4 py-2"
          >
            <Text className="text-xs font-semibold text-primary-foreground">Open month view</Text>
          </TouchableOpacity>
        </View>
      )}

      {view === 'week' && rhythm.type !== 'freeform' && (
        <>
          <View className="flex-row mb-3" style={{ paddingLeft: 72 }}>
            {DAY_LABELS.map((d, i) => (
              <View key={i} className="flex-1 items-center">
                <Text className={`text-[11px] font-bold ${i === todayIndex ? 'text-primary' : 'text-foreground'}`}>
                  {d}
                </Text>
                {i === todayIndex ? (
                  <Text className="text-[9px] font-semibold text-primary mt-0.5">Today</Text>
                ) : null}
              </View>
            ))}
          </View>

          {STAGE_ORDER.map((stage) => {
            const cfg = STAGE_CONFIG[stage];
            const StageIcon = STAGE_RHYTHM_ICONS[stage];
            const activeDays = (stageDayMap[stage] as number[]) ?? [];
            return (
              <View key={stage} className="flex-row items-center mb-2.5">
                <View className="w-16 mr-2 items-center">
                  <RhythmIconBadge Icon={StageIcon} color={cfg.text} backgroundColor={cfg.bg} size="sm" />
                  <Text className="text-[10px] font-bold mt-1 text-center" style={{ color: cfg.text }}>
                    {cfg.label}
                  </Text>
                </View>
                {Array.from({ length: 7 }, (_, i) => {
                  const active = activeDays.includes(i);
                  const isToday = i === todayIndex;
                  return (
                    <View key={i} className="flex-1 items-center">
                      <View
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: active ? cfg.bg : '#fff',
                          borderWidth: isToday ? 2 : 1.5,
                          borderColor: active
                            ? cfg.text
                            : isToday
                              ? 'hsl(39 57% 51%)'
                              : 'hsl(34 20% 82%)',
                        }}
                      >
                        {active ? (
                          <StageIcon size={14} color={cfg.text} />
                        ) : isToday ? (
                          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: 'hsl(39 57% 51%)' }} />
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}

          <View className="flex-row items-center mt-3 mb-1" style={{ paddingLeft: 72 }}>
            <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">
              Events
            </Text>
          </View>
          <View className="flex-row mb-2" style={{ paddingLeft: 72 }}>
            {weekDates.map((dateKey, i) => {
              const dayEvents = eventsByDate[dateKey] ?? [];
              return (
                <View key={i} className="flex-1 items-center" style={{ flexDirection: 'row', justifyContent: 'center', gap: 3, flexWrap: 'wrap', minHeight: 12 }}>
                  {dayEvents.slice(0, 3).map((event) => {
                    const cat = EVENT_CATEGORIES.find((c) => c.id === event.categoryId);
                    return (
                      <View
                        key={event.id}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: cat?.color ?? '#888780',
                          borderWidth: 1,
                          borderColor: 'rgba(0,0,0,0.08)',
                        }}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>

          {pinnedRituals.length > 0 && (
            <>
              <View className="h-px bg-border my-2" style={{ marginLeft: 72 }} />
              <View className="flex-row items-center mb-1" style={{ paddingLeft: 72 }}>
                <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">
                  Rituals
                </Text>
              </View>
              {pinnedRituals.map((ritual) => {
                const RitualIcon = resolveRitualIcon(ritual);
                return (
                <View key={ritual.id} className="flex-row items-center mb-1.5">
                  <View style={{ width: 72 }} />
                  {Array.from({ length: 7 }, (_, i) => {
                    const active = ritual.dayOfWeek === i;
                    const isToday = i === todayIndex;
                    return (
                      <View key={i} className="flex-1 items-center">
                        {active ? (
                          <View
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 9,
                              backgroundColor: isToday ? 'hsl(39 55% 92%)' : '#fff',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: isToday ? 2 : 1.5,
                              borderColor: isToday ? 'hsl(39 57% 51%)' : 'hsl(34 20% 82%)',
                            }}
                          >
                            <RitualIcon size={13} color="hsl(39 57% 51%)" />
                          </View>
                        ) : (
                          <View style={{ width: 28, height: 28 }} />
                        )}
                      </View>
                    );
                  })}
                </View>
              );})}
            </>
          )}
        </>
      )}

      {(view === 'month' || rhythm.type === 'freeform') && (
        <Calendar
          dayComponent={({ date, state }: any) => {
            const dateStr = date?.dateString ?? '';
            const events = eventsByDate[dateStr] ?? [];
            const isToday = dateStr === todayKey;
            const isDisabled = state === 'disabled';

            const isInSprint =
              rhythm.type === 'sprint' &&
              rhythm.sprintStartDate &&
              sprintEndKey &&
              dateStr >= rhythm.sprintStartDate &&
              dateStr <= sprintEndKey;

            const dow = date
              ? (new Date(date.year, date.month - 1, date.day).getDay() + 6) % 7
              : -1;
            const primaryStage =
              rhythm.type !== 'freeform'
                ? STAGE_ORDER.find((s) => ((stageDayMap[s] as number[]) ?? []).includes(dow))
                : undefined;
            const stageCfg = primaryStage ? STAGE_CONFIG[primaryStage] : null;
            const StageIcon = primaryStage ? STAGE_RHYTHM_ICONS[primaryStage] : null;

            const firstEvent = events[0];
            const firstCat = firstEvent
              ? EVENT_CATEGORIES.find((c) => c.id === firstEvent.categoryId)
              : null;
            const EventIcon = firstCat ? EVENT_CATEGORY_ICONS[firstCat.id] : null;
            const extraCount = events.length - 1;

            return (
              <View style={{ width: 44, height: 64, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 }}>
                {firstEvent ? (
                  <View style={{ position: 'relative', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        backgroundColor: '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: firstCat?.color ?? '#888780',
                      }}
                    >
                      {EventIcon ? (
                        <EventIcon size={18} color={firstCat?.color ?? '#888780'} />
                      ) : null}
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -4,
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: isToday ? 'hsl(39 57% 51%)' : '#fff',
                        borderWidth: 1.5,
                        borderColor: isToday ? 'hsl(39 57% 51%)' : 'hsl(34 20% 82%)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 3,
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: '700', color: isToday ? '#fff' : 'hsl(24 25% 15%)', lineHeight: 12 }}>
                        {date?.day}
                      </Text>
                    </View>
                    {extraCount > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: -4,
                          right: -4,
                          backgroundColor: 'hsl(24 25% 15%)',
                          borderRadius: 6,
                          paddingHorizontal: 4,
                          paddingVertical: 1,
                        }}
                      >
                        <Text style={{ fontSize: 8, fontWeight: '700', color: '#fff', lineHeight: 10 }}>
                          +{extraCount}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : stageCfg ? (
                  <View style={{ position: 'relative', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        backgroundColor: stageCfg.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: stageCfg.text,
                      }}
                    >
                      {StageIcon ? (
                        <StageIcon size={18} color={stageCfg.text} />
                      ) : null}
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -4,
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: isToday ? 'hsl(39 57% 51%)' : '#fff',
                        borderWidth: 1.5,
                        borderColor: isToday ? 'hsl(39 57% 51%)' : stageCfg.text,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 3,
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: '700', color: isToday ? '#fff' : stageCfg.text, lineHeight: 12 }}>
                        {date?.day}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isToday
                          ? 'hsl(39 57% 51%)'
                          : isInSprint
                            ? 'hsl(39 55% 92%)'
                            : 'transparent',
                        borderWidth: !isToday && isInSprint ? 1.5 : 0,
                        borderColor: isInSprint ? 'hsl(39 57% 51%)' : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: isToday ? '700' : '600',
                          color: isToday ? '#fff' : isDisabled ? 'hsl(24 10% 75%)' : 'hsl(24 25% 15%)',
                        }}
                      >
                        {date?.day}
                      </Text>
                    </View>
                    {(() => {
                      const dayRituals = pinnedRituals.filter((r) => r.dayOfWeek === dow);
                      if (dayRituals.length === 0) return null;
                      return (
                        <View style={{ flexDirection: 'row', gap: 2, marginTop: 2, justifyContent: 'center' }}>
                          {dayRituals.slice(0, 3).map((r) => {
                            const RitualIcon = resolveRitualIcon(r);
                            return <RitualIcon key={r.id} size={9} color="hsl(39 57% 51%)" />;
                          })}
                        </View>
                      );
                    })()}
                  </View>
                )}
              </View>
            );
          }}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: 'hsl(24 20% 45%)',
            arrowColor: 'hsl(39 57% 51%)',
            monthTextColor: 'hsl(24 25% 15%)',
            textMonthFontWeight: '700',
          }}
          style={{ marginHorizontal: -8, borderRadius: 12 }}
        />
      )}
    </View>
  );
}
