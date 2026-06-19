import { Text } from '@/src/components/ui/text';

import { STAGE_BADGE_COLORS, STAGE_LABELS } from '@/src/screens/overview/constants/stageLabels';

import type { ActivityEntry } from '@/src/screens/overview/utils/activityFeed';

import { JournalTheme } from '@/src/screens/pieces/utils/journalTheme';

import { LinearGradient } from 'expo-linear-gradient';

import { BookOpen, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';

import React from 'react';

import { Animated, Image, ScrollView, TouchableOpacity, View } from 'react-native';



type StudioJournalWidgetProps = {

  journalReveal: Animated.Value;

  activityFeed: ActivityEntry[];

  expanded: boolean;

  onToggleExpand: () => void;

  onEntryPress: (entry: ActivityEntry) => void;

};



function formatRelativeDay(daysAgo: number) {

  if (daysAgo === 0) return 'Today';

  if (daysAgo === 1) return 'Yesterday';

  return `${daysAgo}d ago`;

}



function JournalEntryCard({

  entry,

  onPress,

}: {

  entry: ActivityEntry;

  onPress: () => void;

}) {

  const stageKey = entry.stage.trim().toLowerCase();

  const badge = STAGE_BADGE_COLORS[stageKey] ?? { dot: 'hsl(32 30% 55%)', text: 'hsl(32 25% 42%)' };

  const stageLabel = STAGE_LABELS[stageKey] ?? entry.stage;



  return (

    <TouchableOpacity

      activeOpacity={0.82}

      onPress={onPress}

      accessibilityRole="button"

      accessibilityLabel={`Open ${entry.pieceName}, ${stageLabel}`}

      style={{

        width: 172,

        borderRadius: 18,

        borderWidth: 1.5,

        borderColor: JournalTheme.tileBorder,

        backgroundColor: JournalTheme.cardBackground,

        shadowColor: '#3f2a12',

        shadowOffset: { width: 0, height: 3 },

        shadowOpacity: 0.1,

        shadowRadius: 6,

        elevation: 3,

        overflow: 'hidden',

      }}

    >

      <View style={{ height: 108, backgroundColor: JournalTheme.pageBackground }}>

        {entry.piecePhoto ? (

          <Image

            source={{ uri: entry.piecePhoto }}

            style={{ width: '100%', height: '100%' }}

            resizeMode="cover"

          />

        ) : (

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

            <Text style={{ fontSize: 28 }}>🏺</Text>

          </View>

        )}

      </View>



      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 11 }}>

        <Text

          className="font-serif"

          numberOfLines={2}

          style={{ fontSize: 16, lineHeight: 20, color: JournalTheme.titleInk }}

        >

          {entry.pieceName}

        </Text>



        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>

          <View

            style={{

              flexDirection: 'row',

              alignItems: 'center',

              gap: 5,

              borderRadius: 999,

              paddingHorizontal: 8,

              paddingVertical: 3,

              backgroundColor: JournalTheme.tileBackground,

              borderWidth: 1,

              borderColor: JournalTheme.tileBorder,

            }}

          >

            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: badge.dot }} />

            <Text

              numberOfLines={1}

              style={{

                fontSize: 9,

                fontWeight: '700',

                color: badge.text,

                textTransform: 'uppercase',

                letterSpacing: 0.5,

                maxWidth: 88,

              }}

            >

              {stageLabel}

            </Text>

          </View>

          <ChevronRight size={14} color={JournalTheme.coverMastheadInk} />

        </View>



        <Text style={{ fontSize: 10, color: JournalTheme.coverSpecLabel, marginTop: 6, fontWeight: '500' }}>

          {formatRelativeDay(entry.daysAgo)}

        </Text>

      </View>

    </TouchableOpacity>

  );

}



export function StudioJournalWidget({

  journalReveal,

  activityFeed,

  expanded,

  onToggleExpand,

  onEntryPress,

}: StudioJournalWidgetProps) {

  if (activityFeed.length === 0) return null;



  const latestEntry = activityFeed[0];

  return (

    <Animated.View

      style={{

        opacity: journalReveal,

        transform: [{

          translateY: journalReveal.interpolate({

            inputRange: [0, 1],

            outputRange: [10, 0],

          }),

        }],

      }}

    >

      <View

        className="rounded-[24px] overflow-hidden mb-4"

        style={{

          borderWidth: 1,

          borderColor: JournalTheme.pageBorder,

          shadowColor: '#2d221c',

          shadowOffset: { width: 0, height: 6 },

          shadowOpacity: 0.16,

          shadowRadius: 12,

          elevation: 5,

        }}

      >

        <LinearGradient

          colors={[...JournalTheme.shellGradient]}

          start={{ x: 0, y: 0 }}

          end={{ x: 1, y: 1 }}

        >

          <View className="px-4 pt-4 pb-3.5">

            <View className="flex-row items-start justify-between gap-3">

              <View className="flex-1">

                <View className="flex-row items-center gap-2">

                  <View

                    style={{

                      width: 28,

                      height: 28,

                      borderRadius: 10,

                      alignItems: 'center',

                      justifyContent: 'center',

                      backgroundColor: JournalTheme.headerIconBg,

                      borderWidth: 1,

                      borderColor: 'rgba(255, 244, 228, 0.14)',

                    }}

                  >

                    <BookOpen size={14} color={JournalTheme.headerText} />

                  </View>

                  <Text

                    style={{

                      fontSize: 10,

                      fontWeight: '700',

                      letterSpacing: 1.1,

                      color: JournalTheme.headerText,

                      textTransform: 'uppercase',

                    }}

                  >

                    Studio Journal

                  </Text>

                </View>

                <Text

                  style={{

                    fontSize: 12,

                    lineHeight: 17,

                    color: JournalTheme.headerSubtext,

                    marginTop: 8,

                  }}

                >

                  Recent movement across your pieces

                </Text>

              </View>



              <View className="flex-row items-center gap-2">

                <View

                  style={{

                    borderRadius: 999,

                    paddingHorizontal: 9,

                    paddingVertical: 4,

                    backgroundColor: 'rgba(255, 244, 228, 0.14)',

                    borderWidth: 1,

                    borderColor: 'rgba(255, 244, 228, 0.18)',

                  }}

                >

                  <Text style={{ fontSize: 11, fontWeight: '700', color: JournalTheme.headerText }}>

                    {activityFeed.length}

                  </Text>

                </View>

                <TouchableOpacity

                  onPress={onToggleExpand}

                  activeOpacity={0.82}

                  accessibilityRole="button"

                  accessibilityLabel={expanded ? 'Collapse journal widget' : 'Expand journal widget'}

                  style={{

                    width: 30,

                    height: 30,

                    borderRadius: 15,

                    alignItems: 'center',

                    justifyContent: 'center',

                    backgroundColor: 'rgba(255, 244, 228, 0.12)',

                    borderWidth: 1,

                    borderColor: 'rgba(255, 244, 228, 0.16)',

                  }}

                >

                  {expanded ? (

                    <ChevronUp size={16} color={JournalTheme.headerText} />

                  ) : (

                    <ChevronDown size={16} color={JournalTheme.headerText} />

                  )}

                </TouchableOpacity>

              </View>

            </View>



            <TouchableOpacity

              onPress={() => onEntryPress(latestEntry)}

              activeOpacity={0.84}

              accessibilityRole="button"

              accessibilityLabel="Open last updated journal"

              style={{

                marginTop: 12,

                alignSelf: 'flex-start',

                flexDirection: 'row',

                alignItems: 'center',

                gap: 6,

                borderRadius: 999,

                paddingHorizontal: 12,

                paddingVertical: 7,

                backgroundColor: 'rgba(255, 244, 228, 0.16)',

                borderWidth: 1,

                borderColor: 'rgba(255, 244, 228, 0.22)',

              }}

            >

              <Text style={{ fontSize: 11, fontWeight: '700', color: JournalTheme.headerText }}>

                Open last updated journal

              </Text>

              <ChevronRight size={14} color={JournalTheme.headerText} />

            </TouchableOpacity>

          </View>

        </LinearGradient>



        {expanded ? (

          <View style={{ backgroundColor: JournalTheme.pageBackground, paddingTop: 14, paddingBottom: 16 }}>

            <ScrollView

              horizontal

              showsHorizontalScrollIndicator={false}

              contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 20, gap: 12 }}

            >

              {activityFeed.slice(0, 8).map((entry) => (

                <JournalEntryCard

                  key={entry.id}

                  entry={entry}

                  onPress={() => onEntryPress(entry)}

                />

              ))}

            </ScrollView>

          </View>

        ) : null}

      </View>

    </Animated.View>

  );

}


