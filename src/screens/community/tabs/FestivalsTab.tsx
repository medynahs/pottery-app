// src/screens/community/tabs/FestivalsTab.tsx
// Exported as ChallengesTab — houses monthly challenges + the seasonal festival
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Award, CheckCircle, ChevronDown, ChevronUp, Flame, Trophy, Vote } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { ConfirmSheet } from '../../../components/AppSheets';
import { FestivalSignUpSheet } from '../components/FestivalSignUpSheet';
import { SubmitPieceSheet } from '../components/SubmitPieceSheet';
import { ACTIVE_CHALLENGE, ACTIVE_FESTIVAL } from '../data';

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Flame,
    title: 'A theme is revealed',
    body: 'Every couple of months a new festival theme is announced. The community can vote on the next theme or it may be curator-chosen. Rules are posted with the reveal.',
  },
  {
    step: '02',
    icon: Trophy,
    title: 'Throw, build & submit',
    body: 'You have two months to make your piece and submit it directly in the app — photo, a short note on your process, and your chosen track. Plenty of time even if your kiln queue is backed up.',
  },
  {
    step: '03',
    icon: Vote,
    title: 'The community votes',
    body: 'All submissions go live on the community feed. Every potter gets a vote — browse the gallery and back your favourite piece.',
  },
  {
    step: '04',
    icon: Award,
    title: 'Fired in glory',
    body: 'One winner per track — Beginner, Intermediate, and Advanced. The three winners are immortalised in the Hall of Fame and shared with the wider pottery world.',
  },
];

export function ChallengesTab() {
  // Festival state
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [dropOutOpen, setDropOutOpen] = useState(false);
  const [enrolledTrackId, setEnrolledTrackId] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Monthly challenge state
  const [challengeJoined, setChallengeJoined] = useState(false);
  const [challengeDropOpen, setChallengeDropOpen] = useState(false);

  // Submit sheet — which context triggered it
  const [submitFor, setSubmitFor] = useState<'challenge' | 'festival' | null>(null);

  const festival = ACTIVE_FESTIVAL;
  const challenge = ACTIVE_CHALLENGE;
  const enrolledTrack = festival.tracks.find(t => t.id === enrolledTrackId);

  const handleJoinFestival = (trackId: string) => {
    setEnrolledTrackId(trackId);
    setSignUpOpen(false);
  };

  const handleDropOutFestival = () => {
    setEnrolledTrackId(null);
    setDropOutOpen(false);
  };

  return (
    <>
      {/* ── Monthly Challenge ── */}
      <View
        className="rounded-3xl overflow-hidden border"
        style={{ backgroundColor: challenge.bgColor, borderColor: challenge.borderColor }}
      >
        <View
          className="items-center justify-center"
          style={{ height: 140, backgroundColor: 'hsl(100 30% 90%)' }}
        >
          <Text style={{ fontSize: 72 }}>{challenge.emoji}</Text>
        </View>

        <View className="px-5 pt-4 pb-5">
          <View className="flex-row items-center gap-2 mb-1">
            <Trophy size={13} color={challenge.accentColor} />
            <Text className="text-xs font-bold" style={{ color: challenge.accentColor }}>{challenge.label}</Text>
          </View>
          <Text className="text-2xl font-serif font-bold text-foreground">{challenge.title}</Text>
          <Text className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{challenge.description}</Text>

          <View className="flex-row gap-4 mt-3 mb-4">
            <View>
              <Text className="text-lg font-bold text-foreground">{challenge.joined}</Text>
              <Text className="text-xs text-muted-foreground">potters in</Text>
            </View>
            <View className="w-px bg-border" />
            <View>
              <Text className="text-lg font-bold text-foreground">{challenge.daysLeft}</Text>
              <Text className="text-xs text-muted-foreground">days left</Text>
            </View>
          </View>

          {challengeJoined ? (
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: 'hsl(100 30% 92%)', borderColor: 'hsl(100 25% 82%)' }}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <CheckCircle size={14} color={challenge.accentColor} />
                <Text className="text-xs font-bold" style={{ color: challenge.accentColor }}>You're in!</Text>
              </View>
              <Text className="text-xs text-muted-foreground">Make your bowl and submit before time runs out.</Text>
              <TouchableOpacity
                className="py-2.5 rounded-xl items-center mt-3"
                style={{ backgroundColor: challenge.accentColor }}
                activeOpacity={0.85}
                onPress={() => setSubmitFor('challenge')}
              >
                <Text className="text-white text-xs font-bold">Submit My Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center mt-2.5"
                activeOpacity={0.6}
                onPress={() => setChallengeDropOpen(true)}
              >
                <Text className="text-xs" style={{ color: 'hsl(0 50% 55%)' }}>Leave challenge</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="py-3 rounded-xl items-center"
              style={{ backgroundColor: challenge.accentColor }}
              activeOpacity={0.85}
              onPress={() => setChallengeJoined(true)}
            >
              <Text className="text-white text-sm font-bold">Take the Challenge</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Section divider ── */}
      <View className="flex-row items-center gap-3 my-1">
        <View className="flex-1 h-px bg-border" />
        <Text className="text-[10px] font-bold tracking-widest text-muted-foreground">SEASONAL FESTIVAL</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      {/* ── Festival hero ── */}
      <View
        className="rounded-3xl overflow-hidden border"
        style={{ backgroundColor: festival.bgColor, borderColor: festival.borderColor }}
      >
        <Image
          source={require('../../../../assets/images/under.jpg')}
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
        />

        <View className="px-5 pt-4 pb-5">
          <View className="flex-row items-center gap-2 mb-1">
            <Trophy size={13} color={festival.accentColor} />
            <Text className="text-xs font-bold" style={{ color: festival.accentColor }}>Festival Active</Text>
          </View>
          <Text className="text-2xl font-serif font-bold text-foreground">{festival.name}</Text>
          <Text className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{festival.tagline}</Text>

          {/* Stats row */}
          <View className="flex-row gap-4 mt-3 mb-1">
            <View>
              <Text className="text-lg font-bold text-foreground">{festival.totalParticipants}</Text>
              <Text className="text-xs text-muted-foreground">potters in</Text>
            </View>
            <View className="w-px bg-border" />
            <View>
              <Text className="text-lg font-bold text-foreground">{festival.daysLeft}</Text>
              <Text className="text-xs text-muted-foreground">days to submit</Text>
            </View>
            <View className="w-px bg-border" />
            <View>
              <Text className="text-lg font-bold text-foreground">3</Text>
              <Text className="text-xs text-muted-foreground">winners (1/track)</Text>
            </View>
          </View>

          {/* Rules inline toggle */}
          <TouchableOpacity
            className="flex-row items-center gap-1.5 py-2 self-start"
            activeOpacity={0.7}
            onPress={() => setRulesOpen(o => !o)}
          >
            {rulesOpen
              ? <ChevronUp size={13} color={festival.accentColor} />
              : <ChevronDown size={13} color={festival.accentColor} />
            }
            <Text className="text-xs font-semibold" style={{ color: festival.accentColor }}>
              {rulesOpen ? 'Hide rules' : 'See rules'}
            </Text>
          </TouchableOpacity>

          {rulesOpen && (
            <View className="mt-1 mb-3 gap-2">
              {festival.rules.map((rule, i) => (
                <View key={i} className="flex-row gap-2.5 items-start">
                  <View
                    className="mt-1.5 rounded-full flex-shrink-0"
                    style={{ width: 5, height: 5, backgroundColor: festival.accentColor }}
                  />
                  <Text className="text-xs text-muted-foreground flex-1 leading-relaxed">{rule}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Enrolled state vs join CTA */}
          {enrolledTrack ? (
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: 'hsl(100 30% 92%)', borderColor: 'hsl(100 25% 82%)' }}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <CheckCircle size={14} color={festival.accentColor} />
                <Text className="text-xs font-bold" style={{ color: festival.accentColor }}>You're in!</Text>
              </View>
              <Text className="text-sm font-bold text-foreground">{enrolledTrack.title}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">Start making your piece and submit before the deadline.</Text>
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  className="flex-1 py-2.5 rounded-xl items-center"
                  style={{ backgroundColor: festival.accentColor }}
                  activeOpacity={0.85}
                  onPress={() => setSubmitFor('festival')}
                >
                  <Text className="text-white text-xs font-bold">Submit My Piece</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2.5 rounded-xl items-center bg-white/60 border"
                  style={{ borderColor: 'hsl(100 25% 78%)' }}
                  activeOpacity={0.75}
                  onPress={() => setSignUpOpen(true)}
                >
                  <Text className="text-xs font-semibold" style={{ color: festival.accentColor }}>Change Track</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="items-center mt-3"
                activeOpacity={0.6}
                onPress={() => setDropOutOpen(true)}
              >
                <Text className="text-xs" style={{ color: 'hsl(0 50% 55%)' }}>Leave festival</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="py-3 rounded-xl items-center"
              style={{ backgroundColor: festival.accentColor }}
              activeOpacity={0.85}
              onPress={() => setSignUpOpen(true)}
            >
              <Text className="text-white text-sm font-bold">Join Festival</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Tracks ── */}
      {festival.tracks.map((track) => {
        const isEnrolled = enrolledTrackId === track.id;
        return (
          <Card key={track.id} className="p-4">
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-2xl bg-green-50 items-center justify-center flex-shrink-0">
                {isEnrolled
                  ? <CheckCircle size={18} color={festival.accentColor} />
                  : <Trophy size={16} color={festival.accentColor} />
                }
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-sm font-bold text-foreground">{track.title}</Text>
                  {isEnrolled && (
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(100 25% 90%)' }}>
                      <Text className="text-[10px] font-bold" style={{ color: festival.accentColor }}>Your track</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-muted-foreground mt-1 leading-relaxed">{track.summary}</Text>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs font-medium text-primary">{track.participants} potters joined</Text>
                  <View className="px-2 py-0.5 rounded-full bg-muted border border-border">
                    <Text className="text-[10px] text-muted-foreground font-medium">1 winner</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        );
      })}

      {/* ── How does it work ── */}
      <View className="mt-2">
        <Text className="text-base font-serif font-bold text-foreground mb-3">How does it work?</Text>
        <View className="gap-0">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }, index) => (
            <View key={step} className="flex-row gap-4">
              <View className="items-center" style={{ width: 36 }}>
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'hsl(100 25% 92%)' }}
                >
                  <Icon size={16} color={festival.accentColor} />
                </View>
                {index < HOW_IT_WORKS.length - 1 && (
                  <View className="flex-1 w-px mt-1" style={{ backgroundColor: 'hsl(100 25% 88%)', minHeight: 24 }} />
                )}
              </View>
              <View className="flex-1 pb-5">
                <Text className="text-[10px] font-bold tracking-widest mb-0.5" style={{ color: 'hsl(100 35% 55%)' }}>
                  {step}
                </Text>
                <Text className="text-sm font-bold text-foreground">{title}</Text>
                <Text className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── Sheets ── */}
      <FestivalSignUpSheet
        visible={signUpOpen}
        festival={festival}
        onConfirm={handleJoinFestival}
        onClose={() => setSignUpOpen(false)}
      />

      <SubmitPieceSheet
        visible={submitFor !== null}
        contextName={submitFor === 'challenge' ? challenge.title : festival.name}
        contextSubtitle={submitFor === 'challenge' ? challenge.label : (enrolledTrack?.title ?? '')}
        accentColor={festival.accentColor}
        onSubmit={() => setSubmitFor(null)}
        onClose={() => setSubmitFor(null)}
      />

      <ConfirmSheet
        visible={dropOutOpen}
        title="Leave the festival?"
        body="Your spot will be freed. You can rejoin before submissions close, but you'll need to pick a track again."
        confirmLabel="Leave Festival"
        destructive
        onConfirm={handleDropOutFestival}
        onCancel={() => setDropOutOpen(false)}
      />

      <ConfirmSheet
        visible={challengeDropOpen}
        title="Leave the challenge?"
        body="You can rejoin any time before the deadline."
        confirmLabel="Leave Challenge"
        destructive
        onConfirm={() => { setChallengeJoined(false); setChallengeDropOpen(false); }}
        onCancel={() => setChallengeDropOpen(false)}
      />
    </>
  );
}
