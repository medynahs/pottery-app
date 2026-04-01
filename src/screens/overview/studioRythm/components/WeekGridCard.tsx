import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import type { Piece } from '@/src/types/pieces';
import { Pencil, Shuffle, Zap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { StageKey, StudioRhythm } from '../studioRhythm';
import { EVENT_CATEGORIES, STAGE_CONFIG, getDateKey } from '../studioRhythm';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STAGE_ORDER: StageKey[] = ['throw', 'trim', 'glaze', 'bisque'];

type ViewMode = 'week' | 'month';

interface WeekGridCardProps {
  rhythm: StudioRhythm;
  onEditPress: () => void;
  pieces?: Piece[];
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

export function WeekGridCard({ rhythm, onEditPress, pieces = [] }: WeekGridCardProps) {
  const stageDayMap = Object.fromEntries(rhythm.stageDays.map((sd) => [sd.stage, sd.days]));
  const todayIndex  = (new Date().getDay() + 6) % 7;
  const todayKey    = getDateKey();

  const [view, setView] = useState<ViewMode>('week');

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

  // Dates for each column (Mon–Sun) of the current week
  const weekDates = useMemo(() => {
    const monday = new Date(todayKey);
    monday.setDate(monday.getDate() - todayIndex);
    return Array.from({ length: 7 }, (_, i) => addDays(getDateKey(monday), i));
  }, [todayKey, todayIndex]);

  const showToggle = rhythm.type !== 'freeform';

  return (
    <Card className="rounded-2xl border-border bg-card p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        {showToggle ? (
          <View className="flex-row bg-muted/60 rounded-lg p-0.5 gap-0.5">
            {(['week', 'month'] as ViewMode[]).map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setView(v)}
                activeOpacity={0.8}
                className={`rounded-md px-3 py-1 ${view === v ? 'bg-card' : ''}`}
              >
                <Text className={`text-xs font-semibold capitalize ${view === v ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex-row items-center gap-1.5 bg-muted/60 rounded-lg px-3 py-1.5">
            <Shuffle size={12} color="hsl(24 10% 55%)" />
            <Text className="text-xs font-semibold text-muted-foreground">Freeform</Text>
          </View>
        )}

        <TouchableOpacity onPress={onEditPress} activeOpacity={0.8} className="flex-row items-center gap-1">
          <Pencil size={12} color="hsl(24 60% 45%)" />
          <Text className="text-xs text-primary font-medium">Edit</Text>
        </TouchableOpacity>
      </View>

      {rhythm.type === 'sprint' && rhythm.sprintStartDate && sprintEndKey && (
        <View className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 mb-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center gap-1.5">
              <Zap size={12} color="#92400e" />
              <Text className="text-xs font-semibold text-amber-900">
                Week {sprintWeekNumber} of {rhythm.sprintLengthWeeks ?? 2}
              </Text>
            </View>
            <Text className="text-[10px] text-amber-700">
              {formatShort(rhythm.sprintStartDate)} - {formatShort(sprintEndKey)}
            </Text>
          </View>
          <View className="flex-row gap-1 mb-1.5">
            {Array.from({ length: rhythm.sprintLengthWeeks ?? 2 }, (_, i) => (
              <View
                key={i}
                className="flex-1 h-1.5 rounded-full"
                style={{
                  backgroundColor: i < (sprintWeekNumber ?? 0) ? '#f59e0b' : 'rgba(146,64,14,0.15)',
                }}
              />
            ))}
          </View>
          {rhythm.sprintGoalPieces != null && rhythm.sprintGoalPieces > 0 && (
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Text className="text-[10px] text-amber-800">
                🏺 {sprintPieceCount} / {rhythm.sprintGoalPieces} piece{rhythm.sprintGoalPieces === 1 ? '' : 's'}
              </Text>
              <View className="flex-1 h-1 rounded-full overflow-hidden bg-amber-100">
                <View
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${Math.min(100, Math.round((sprintPieceCount / rhythm.sprintGoalPieces) * 100))}%` }}
                />
              </View>
              <Text className="text-[10px] text-amber-700 font-medium">
                {Math.min(100, Math.round((sprintPieceCount / rhythm.sprintGoalPieces) * 100))}%
              </Text>
            </View>
          )}
        </View>
      )}

      {rhythm.type === 'freeform' && view !== 'month' && (
        <View className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 items-center mb-1">
          <Text className="text-sm font-medium text-muted-foreground text-center mb-1">
            No fixed day assignments
          </Text>
          <Text className="text-xs text-muted-foreground text-center leading-5">
            Freeform rhythm follows your events and rituals - switch to Month to see what is coming up.
          </Text>
          <TouchableOpacity
            onPress={() => setView('month')}
            activeOpacity={0.8}
            className="mt-3 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5"
          >
            <Text className="text-xs font-semibold text-primary">View Month</Text>
          </TouchableOpacity>
        </View>
      )}

      {view === 'week' && rhythm.type !== 'freeform' && (
        <>
          <View className="flex-row mb-2" style={{ paddingLeft: 52 }}>
            {DAY_LABELS.map((d, i) => (
              <View key={i} className="flex-1 items-center">
                <Text className={`text-[10px] font-semibold ${i === todayIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {STAGE_ORDER.map((stage) => {
            const cfg        = STAGE_CONFIG[stage];
            const activeDays = (stageDayMap[stage] as number[]) ?? [];
            return (
              <View key={stage} className="flex-row items-center mb-2">
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: cfg.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: cfg.text + '33',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{cfg.emoji}</Text>
                </View>
                {Array.from({ length: 7 }, (_, i) => {
                  const active  = activeDays.includes(i);
                  const isToday = i === todayIndex;
                  return (
                    <View key={i} className="flex-1 items-center">
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: active ? cfg.bg : 'transparent',
                          borderWidth: isToday ? 2 : 1,
                          borderColor: active
                            ? cfg.text
                            : isToday
                              ? 'hsl(24 60% 65%)'
                              : 'hsl(24 10% 88%)',
                        }}
                      >
                        {active ? (
                          <Text style={{ fontSize: 14 }}>{cfg.emoji}</Text>
                        ) : isToday ? (
                          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'hsl(24 60% 65%)' }} />
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}

          {/* Event dots row — one colored dot per event on each day of this week */}
          <View className="flex-row" style={{ paddingLeft: 44, marginTop: 2, marginBottom: 2 }}>
            {weekDates.map((dateKey, i) => {
              const dayEvents = eventsByDate[dateKey] ?? [];
              return (
                <View key={i} className="flex-1 items-center" style={{ flexDirection: 'row', justifyContent: 'center', gap: 2, flexWrap: 'wrap', minHeight: 10 }}>
                  {dayEvents.slice(0, 3).map((event) => {
                    const cat = EVENT_CATEGORIES.find((c) => c.id === event.categoryId);
                    return (
                      <View
                        key={event.id}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: cat?.color ?? '#a3a3a3',
                        }}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </>
      )}

      {(view === 'month' || rhythm.type === 'freeform') && (
        <Calendar
          dayComponent={({ date, state }: any) => {
            const dateStr    = date?.dateString ?? '';
            const events     = eventsByDate[dateStr] ?? [];
            const isToday    = dateStr === todayKey;
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

            const firstEvent = events[0];
            const firstCat   = firstEvent
              ? EVENT_CATEGORIES.find((c) => c.id === firstEvent.categoryId)
              : null;
            const extraCount = events.length - 1;

            // Deterministic slight rotation per date for a "pinned sticker" feel
            const rotationDeg = dateStr
              ? ((parseInt(dateStr.replace(/-/g, ''), 10) % 7) - 3) + 'deg'
              : '0deg';

            // Fixed cell height so every cell is the same size — no overflow
            return (
              <View style={{ width: 44, height: 68, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 5 }}>
                {firstEvent ? (
                  // Event cell: sticker fills most of cell, date is a small badge on top
                  <View style={{ position: 'relative', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        backgroundColor: '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1.5,
                        borderColor: 'rgba(0,0,0,0.08)',
                        shadowColor: '#000',
                        shadowOpacity: 0.12,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 4,
                        elevation: 3,
                        transform: [{ rotate: rotationDeg }],
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{firstCat?.emoji ?? '📅'}</Text>
                    </View>
                    {/* Date badge — top-right corner of sticker */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -7,
                        right: -4,
                        minWidth: 17,
                        height: 17,
                        borderRadius: 9,
                        backgroundColor: isToday ? '#fbbf24' : '#fff',
                        borderWidth: 1.5,
                        borderColor: isToday ? '#f59e0b' : 'rgba(0,0,0,0.10)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 3,
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowOffset: { width: 0, height: 1 },
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: '700', color: isToday ? '#fff' : '#374151', lineHeight: 12 }}>
                        {date?.day}
                      </Text>
                    </View>
                    {extraCount > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: -5,
                          right: -4,
                          backgroundColor: '#e5e7eb',
                          borderRadius: 6,
                          paddingHorizontal: 3,
                          paddingVertical: 1,
                        }}
                      >
                        <Text style={{ fontSize: 8, fontWeight: '600', color: '#6b7280', lineHeight: 10 }}>
                          +{extraCount}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : stageCfg ? (
                  // Stage-assigned day: sticker with stage emoji + date badge
                  <View style={{ position: 'relative', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        backgroundColor: stageCfg.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1.5,
                        borderColor: stageCfg.text + '55',
                        shadowColor: '#000',
                        shadowOpacity: 0.07,
                        shadowOffset: { width: 0, height: 1 },
                        shadowRadius: 3,
                        elevation: 2,
                        transform: [{ rotate: rotationDeg }],
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{stageCfg.emoji}</Text>
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        top: -7,
                        right: -4,
                        minWidth: 17,
                        height: 17,
                        borderRadius: 9,
                        backgroundColor: isToday ? '#fbbf24' : '#fff',
                        borderWidth: 1.5,
                        borderColor: isToday ? '#f59e0b' : 'rgba(0,0,0,0.10)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 3,
                        elevation: 2,
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: '700', color: isToday ? '#fff' : '#374151', lineHeight: 12 }}>
                        {date?.day}
                      </Text>
                    </View>
                  </View>
                ) : (
                  // Plain date — no stage, no event
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isToday
                        ? '#fbbf24'
                        : isInSprint
                          ? 'rgba(251,191,36,0.12)'
                          : 'transparent',
                      borderWidth: !isToday && isInSprint ? 1 : 0,
                      borderColor: isInSprint ? '#f59e0b' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: isToday ? '700' : '500',
                        color: isToday ? '#fff' : isDisabled ? '#d1d5db' : '#22223b',
                      }}
                    >
                      {date?.day}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: '#a3a3a3',
            arrowColor: '#eab308',
            monthTextColor: '#22223b',
            textMonthFontWeight: '700',
          }}
          style={{ marginHorizontal: -8, borderRadius: 12 }}
        />
      )}
    </Card>
  );
}
