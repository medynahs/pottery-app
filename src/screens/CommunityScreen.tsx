// src/screens/CommunityScreen.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
  Award, Bell, BookOpen, ChevronRight, Flame, Gift, Globe,
  Heart, HelpCircle, Leaf, MapPin, MessageCircle, Package,
  Star, ThumbsUp, Trophy,
  Zap
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

// ─── Helper ───────────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row justify-between items-start mb-3 px-6">
      <View>
        <Text className="text-xl font-serif font-bold text-foreground">{title}</Text>
        {subtitle && <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={onAction} className="mt-1">
          <Text className="text-sm text-primary font-medium">{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ReactionBar({ likes, comments }: { likes: number; comments: number }) {
  const [liked, setLiked] = useState(false);
  return (
    <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-border">
      <TouchableOpacity
        className="flex-row items-center gap-1.5"
        activeOpacity={0.7}
        onPress={() => setLiked(l => !l)}
      >
        <Heart size={14} color={liked ? 'hsl(340 75% 50%)' : 'hsl(24 20% 55%)'} fill={liked ? 'hsl(340 75% 50%)' : 'none'} />
        <Text className="text-xs text-muted-foreground">{liked ? likes + 1 : likes}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
        <MessageCircle size={14} color="hsl(24 20% 55%)" />
        <Text className="text-xs text-muted-foreground">{comments}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center gap-1.5 ml-auto" activeOpacity={0.7}>
        <Gift size={13} color="hsl(15 50% 50%)" />
        <Text className="text-xs text-primary font-medium">Celebrate</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const ALERTS = [
  { emoji: '🏺', name: 'Susan M.',    text: 'just finished her first matching mug set.',   time: '2 min ago',  color: 'hsl(340 75% 50%)' },
  { emoji: '🔥', name: 'Cone 6',      text: 'is the most fired temp in the studio this week.', time: '6 hr ago', color: 'hsl(25 90% 55%)' },
  { emoji: '🎉', name: 'Tariq B.',    text: 'hit 100 total pieces — a studio milestone!',  time: '1 day ago',  color: 'hsl(38 80% 50%)' },
  { emoji: '✨', name: 'Yuki R.',     text: 'shared a new soda glaze experiment result.',  time: '1 day ago',  color: 'hsl(213 80% 55%)' },
];

const GALLERY_PIECES = [
  { id: 1, author: 'Susan M.',  emoji: '🏺', bg: 'bg-amber-100',   type: 'Mug',    likes: 34 },
  { id: 2, author: 'Tariq B.',  emoji: '🥣', bg: 'bg-stone-200',   type: 'Bowl',   likes: 21 },
  { id: 3, author: 'Yuki R.',   emoji: '🫖', bg: 'bg-blue-100',    type: 'Teapot', likes: 58 },
  { id: 4, author: 'Mara L.',   emoji: '🏛️', bg: 'bg-rose-100',    type: 'Vase',   likes: 16 },
  { id: 5, author: 'Chen W.',   emoji: '🫙', bg: 'bg-green-100',   type: 'Pot',    likes: 27 },
  { id: 6, author: 'Adele K.',  emoji: '🪴', bg: 'bg-purple-100',  type: 'Planter',likes: 43 },
];

const CEREMONY = [
  { emoji: '💛', name: 'Mara L.',  moment: 'Survived her first kiln accident — 3 pieces made it!',  reactions: '🎉🎊🙌' },
  { emoji: '🌱', name: 'Chen W.', moment: 'Made his very first pinch pot after 3 failed attempts.', reactions: '❤️🥹🌟' },
];

const CHALLENGES = [
  {
    title: 'March: The Humble Bowl',
    desc: 'Throw the most honest, imperfect, beautiful bowl you can. No handles, no decorations — just form.',
    prize: '🏆 Featured in gallery + badge',
    participants: 124,
    daysLeft: 23,
    progress: 0.72,
    color: 'hsl(100 35% 44%)',
    bgFrom: 'hsl(100 25% 96%)',
    border: 'border-green-200',
  },
];

const POLLS = [
  {
    question: 'Most creative glaze this month?',
    options: [
      { label: 'Yuki\'s Soda Matte', votes: 48 },
      { label: 'Tariq\'s Iron Red', votes: 35 },
      { label: 'Susan\'s Speckled Cream', votes: 61 },
    ],
    totalVotes: 144,
    endsIn: '3 days',
  },
  {
    question: 'Funniest fail of the week?',
    options: [
      { label: 'Wonky handle #3 (Chen)', votes: 29 },
      { label: 'Lid that won\'t open (Mara)', votes: 52 },
      { label: 'My entire Monday (Susan)', votes: 87 },
    ],
    totalVotes: 168,
    endsIn: '1 day',
  },
];

const ACHIEVEMENTS_SHARED = [
  { name: 'Tariq B.', badge: '🏅', achievement: 'Kiln Master', desc: 'Completed 50 firings', color: 'bg-orange-50', border: 'border-orange-200' },
  { name: 'Mara L.',  badge: '⭐', achievement: 'Resilient',   desc: 'Honored 50 failures',  color: 'bg-pink-50',   border: 'border-pink-200' },
  { name: 'Yuki R.',  badge: '✨', achievement: 'Glazing Artist', desc: '100 pieces glazed', color: 'bg-blue-50',   border: 'border-blue-200' },
];

const EXCHANGES = [
  {
    icon: Gift,
    iconColor: 'hsl(340 75% 50%)',
    iconBg: 'bg-pink-50',
    title: 'Secret Santa Pottery',
    desc: 'Exchange a handmade piece anonymously this December. Sign-ups open.',
    tag: 'Seasonal',
    tagColor: 'hsl(340 75% 50%)',
    tagBg: 'bg-pink-100',
  },
  {
    icon: Package,
    iconColor: 'hsl(213 80% 55%)',
    iconBg: 'bg-blue-50',
    title: 'Community Kiln Showcase',
    desc: 'Contribute one small piece to the collaborative kiln — shipped to everyone who joins.',
    tag: 'Ongoing',
    tagColor: 'hsl(213 80% 55%)',
    tagBg: 'bg-blue-100',
  },
  {
    icon: Leaf,
    iconColor: 'hsl(100 40% 45%)',
    iconBg: 'bg-green-50',
    title: 'Time Capsule Swap',
    desc: 'Send an unglazed piece to another potter for them to glaze and finish. Get one back!',
    tag: 'New',
    tagColor: 'hsl(100 40% 45%)',
    tagBg: 'bg-green-100',
  },
];

const DROPS = [
  { studio: 'Clay & Co.',     piece: 'Limited Raku Vase — Batch of 6',          time: '2 hr ago',  hot: true  },
  { studio: 'Earthen Works',  piece: 'One-of-a-kind Soda-Fired Mug Drop',       time: '5 hr ago',  hot: true  },
  { studio: 'North Kiln',     piece: 'Cone 10 Planter Set (handbuilt, 4 pcs)',  time: '1 day ago', hot: false },
];

const TIP = {
  author: 'Tariq B.',
  role: 'Master Potter · 12 yrs',
  tip: 'When centering large amounts of clay (5 kg+), keep your elbows braced against your knees and push from your core — not your arms. Saves energy and gives far more control.',
  emoji: '💡',
  likes: 88,
};

const LOCAL_STUDIOS = [
  { name: 'Ashfield Ceramics',   distance: '0.8 mi', open: true,  tag: 'Community Kiln', emoji: '🏭' },
  { name: 'The Clay Room PDX',   distance: '1.4 mi', open: true,  tag: 'Classes + Studio', emoji: '🏺' },
  { name: 'North Kiln Collective', distance: '2.1 mi', open: false, tag: 'Rental Studio', emoji: '🔥' },
];

const CREATORS = [
  { name: 'Tariq B.',   avatar: 'T', specialty: 'Iron Red Glazes',  followers: '1.2k', color: 'hsl(25 90% 55%)'  },
  { name: 'Yuki R.',    avatar: 'Y', specialty: 'Soda Firing',      followers: '890',  color: 'hsl(213 80% 55%)' },
  { name: 'Mara L.',    avatar: 'M', specialty: 'Sculptural Work',  followers: '654',  color: 'hsl(340 75% 50%)' },
  { name: 'Chen W.',    avatar: 'C', specialty: 'Wheel Throwing',   followers: '431',  color: 'hsl(100 40% 45%)' },
];

const NEWS = [
  { tag: 'World',  title: 'The Bernard Leach retrospective opens at the V&A this April.', time: '3 days ago' },
  { tag: 'Trend',  title: "Ash glazes are making a comeback — here's what you need to know.", time: '5 days ago' },
  { tag: 'Event',  title: 'NCECA 2026 conference dates announced: June 12–15, Denver.', time: '1 week ago' },
];

const ASK_QUESTIONS = [
  { q: 'How do I prevent S-cracks in thick bottoms?', answers: 7,  asker: 'Chen W.' },
  { q: 'Best kiln wash for cone 10 reduction?',        answers: 12, asker: 'Adele K.' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const [votedPolls, setVotedPolls] = useState<Record<number, number>>({});
  const [followedCreators, setFollowedCreators] = useState<Record<string, boolean>>({});

  const vote = (pollIndex: number, optionIndex: number) => {
    if (votedPolls[pollIndex] === undefined) {
      setVotedPolls(prev => ({ ...prev, [pollIndex]: optionIndex }));
    }
  };

  const toggleFollow = (name: string) =>
    setFollowedCreators(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View className="px-6 pt-16 pb-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-4xl font-serif font-bold text-foreground">Community</Text>
            <Text className="text-muted-foreground mt-0.5 text-sm">Your pottery world, together</Text>
          </View>
          <TouchableOpacity activeOpacity={0.75} className="relative">
            <Bell size={22} color="hsl(24 20% 40%)" />
            <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary items-center justify-center">
              <Text className="text-white" style={{ fontSize: 9, fontWeight: '700' }}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Community Alerts ──────────────────────────────────────────────── */}
      <SectionHeader title="Studio Pulse" subtitle="What's happening right now" action="See All" />
      <View className="px-6 mb-6">
        <Card className="p-4">
          {ALERTS.map(({ emoji, name, text, time, color }, i) => (
            <View key={i}>
              {i > 0 && <View className="h-px bg-border my-3" />}
              <View className="flex-row items-start gap-3">
                <View className="w-9 h-9 rounded-full bg-muted items-center justify-center flex-shrink-0">
                  <Text style={{ fontSize: 18 }}>{emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-foreground leading-relaxed">
                    <Text className="font-bold" style={{ color }}>{name} </Text>
                    {text}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-1">{time}</Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* ── Monthly Challenge ─────────────────────────────────────────────── */}
      <SectionHeader title="Monthly Challenge" subtitle="March 2026" action="Join" />
      <View className="px-6 mb-6">
        {CHALLENGES.map(({ title, desc, prize, participants, daysLeft, progress, color, bgFrom, border }) => (
          <TouchableOpacity key={title} activeOpacity={0.85}>
            <View className={`rounded-3xl border ${border} p-5`} style={{ backgroundColor: bgFrom }}>
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-serif font-bold text-foreground leading-tight">{title}</Text>
                  <Text className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</Text>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-white/70 items-center justify-center border border-border">
                  <Trophy size={22} color={color} />
                </View>
              </View>
              <Text className="text-xs font-medium mb-3" style={{ color }}>{prize}</Text>
              <View className="w-full h-2 rounded-full bg-white/60 overflow-hidden mb-1.5">
                <View className="h-full rounded-full" style={{ width: `${progress * 100}%`, backgroundColor: color }} />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted-foreground">
                  <Text className="font-semibold text-foreground">{participants}</Text> participants
                </Text>
                <Text className="text-xs text-muted-foreground">
                  <Text className="font-semibold text-foreground">{daysLeft}</Text> days left
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Community Gallery ─────────────────────────────────────────────── */}
      <SectionHeader title="Community Gallery" subtitle="Curated this week" action="Explore" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {GALLERY_PIECES.map(({ id, author, emoji, bg, type, likes }) => (
          <TouchableOpacity key={id} activeOpacity={0.8} className={`w-36 rounded-2xl overflow-hidden border border-border ${bg}`}>
            <View className="h-32 items-center justify-center">
              <Text style={{ fontSize: 52 }}>{emoji}</Text>
            </View>
            <View className="p-2.5 bg-card/80">
              <Text className="text-xs font-bold text-foreground">{type}</Text>
              <Text className="text-xs text-muted-foreground">by {author}</Text>
              <View className="flex-row items-center gap-1 mt-1.5">
                <Heart size={11} color="hsl(340 75% 50%)" fill="hsl(340 75% 50%)" />
                <Text className="text-xs text-muted-foreground">{likes}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Ceremony Gallery ──────────────────────────────────────────────── */}
      <SectionHeader title="Ceremony Corner" subtitle="Celebrating small wins & proud moments" />
      <View className="px-6 mb-6">
        <Card className="p-5">
          {CEREMONY.map(({ emoji, name, moment, reactions }, i) => (
            <View key={i}>
              {i > 0 && <View className="h-px bg-border my-4" />}
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center flex-shrink-0">
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground mb-0.5">{name}</Text>
                  <Text className="text-sm text-foreground leading-relaxed">{moment}</Text>
                  <Text className="text-base mt-2">{reactions}</Text>
                </View>
              </View>
              <ReactionBar likes={18 + i * 7} comments={4 + i * 2} />
            </View>
          ))}
        </Card>
      </View>

      {/* ── Exchanges & Collaborative Events ──────────────────────────────── */}
      <SectionHeader title="Exchanges & Events" subtitle="Join something special" />
      <View className="px-6 mb-6 gap-3">
        {EXCHANGES.map(({ icon: Icon, iconColor, iconBg, title, desc, tag, tagColor, tagBg }) => (
          <TouchableOpacity key={title} activeOpacity={0.8}>
            <Card className="p-4 flex-row items-start gap-3">
              <View className={`w-10 h-10 rounded-2xl items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={18} color={iconColor} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-0.5 flex-wrap">
                  <Text className="text-sm font-bold text-foreground">{title}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${tagBg}`}>
                    <Text className="text-xs font-semibold" style={{ color: tagColor }}>{tag}</Text>
                  </View>
                </View>
                <Text className="text-xs text-muted-foreground leading-relaxed">{desc}</Text>
              </View>
              <ChevronRight size={15} color="hsl(24 20% 60%)" />
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Drops & Limited Collections ───────────────────────────────────── */}
      <SectionHeader title="Drops & Collections" subtitle="Fresh from the kiln" action="All Drops" />
      <View className="px-6 mb-6">
        <Card className="p-4">
          {DROPS.map(({ studio, piece, time, hot }, i) => (
            <View key={i}>
              {i > 0 && <View className="h-px bg-border my-3" />}
              <TouchableOpacity activeOpacity={0.7} className="flex-row items-center gap-3">
                <View className={`w-2 h-2 rounded-full flex-shrink-0 ${hot ? 'bg-orange-400' : 'bg-muted-foreground/30'}`} />
                <View className="flex-1">
                  <Text className="text-xs font-bold text-primary">{studio}</Text>
                  <Text className="text-sm text-foreground mt-0.5">{piece}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">{time}</Text>
                </View>
                {hot && (
                  <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border border-orange-200">
                    <Flame size={11} color="hsl(25 90% 55%)" />
                    <Text className="text-xs font-semibold" style={{ color: 'hsl(25 90% 55%)' }}>Hot</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </View>

      {/* ── Tip of the Day ────────────────────────────────────────────────── */}
      <SectionHeader title="Tip of the Day" subtitle="From your community" />
      <View className="px-6 mb-6">
        <Card className="p-5" style={{ backgroundColor: 'hsl(38 40% 97%)' }}>
          <View className="flex-row items-start gap-3 mb-3">
            <Text style={{ fontSize: 26 }}>{TIP.emoji}</Text>
            <View className="flex-1">
              <Text className="text-sm font-bold text-foreground">{TIP.author}</Text>
              <Text className="text-xs text-muted-foreground">{TIP.role}</Text>
            </View>
          </View>
          <Text className="text-sm text-foreground leading-relaxed font-serif italic">
            "{TIP.tip}"
          </Text>
          <View className="flex-row items-center gap-4 mt-4 pt-3 border-t border-border">
            <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
              <ThumbsUp size={14} color="hsl(24 20% 55%)" />
              <Text className="text-xs text-muted-foreground">{TIP.likes} found this helpful</Text>
            </TouchableOpacity>
            <TouchableOpacity className="ml-auto flex-row items-center gap-1.5" activeOpacity={0.7}>
              <BookOpen size={13} color="hsl(15 50% 50%)" />
              <Text className="text-xs text-primary font-medium">More tips</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {/* ── Glaze Swap Experiments ────────────────────────────────────────── */}
      <SectionHeader title="Glaze Swap Lab" subtitle="Mini tutorials from your studio neighbors" action="Post yours" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {[
          { author: 'Yuki R.',  glaze: 'Soda Matte #3',    cone: 'Cone 6', result: '🌫️', bg: 'bg-blue-50',   border: 'border-blue-200',   color: 'hsl(213 80% 55%)' },
          { author: 'Tariq B.', glaze: 'Iron Red Base',     cone: 'Cone 10', result: '🔴', bg: 'bg-red-50',    border: 'border-red-200',    color: 'hsl(0 55% 45%)'   },
          { author: 'Mara L.',  glaze: 'Copper Green',      cone: 'Cone 6', result: '🟢', bg: 'bg-green-50',  border: 'border-green-200',  color: 'hsl(145 50% 45%)' },
          { author: 'Adele K.', glaze: 'Celadon Light',     cone: 'Cone 9', result: '🩵', bg: 'bg-sky-50',    border: 'border-sky-200',    color: 'hsl(200 70% 50%)' },
        ].map(({ author, glaze, cone, result, bg, border, color }) => (
          <TouchableOpacity key={glaze} activeOpacity={0.8}
            className={`w-36 rounded-2xl border p-4 items-center ${bg} ${border}`}>
            <Text style={{ fontSize: 36 }}>{result}</Text>
            <Text className="text-sm font-bold text-foreground text-center mt-2 leading-tight">{glaze}</Text>
            <Text className="text-xs mt-1" style={{ color }}>{cone}</Text>
            <Text className="text-xs text-muted-foreground mt-1">by {author}</Text>
            <TouchableOpacity className="mt-3 px-3 py-1.5 rounded-xl bg-white/80 border border-border" activeOpacity={0.7}>
              <Text className="text-xs font-medium text-primary">View Recipe</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Ask a Potter ──────────────────────────────────────────────────── */}
      <SectionHeader title="Ask a Potter" subtitle="Questions, answered by the community" action="Ask" />
      <View className="px-6 mb-6">
        <Card className="p-5 mb-3" style={{ backgroundColor: 'hsl(260 15% 97%)' }}>
          <View className="flex-row items-center gap-2 mb-3">
            <HelpCircle size={16} color="hsl(260 15% 48%)" />
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Community Q&A</Text>
          </View>
          {ASK_QUESTIONS.map(({ q, answers, asker }, i) => (
            <TouchableOpacity key={i} activeOpacity={0.7}>
              {i > 0 && <View className="h-px bg-border my-3" />}
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-foreground flex-1 leading-relaxed font-medium">"{q}"</Text>
                <ChevronRight size={14} color="hsl(24 20% 60%)" />
              </View>
              <View className="flex-row items-center gap-3 mt-1.5">
                <Text className="text-xs text-muted-foreground">Asked by <Text className="font-semibold text-foreground">{asker}</Text></Text>
                <View className="flex-row items-center gap-1">
                  <MessageCircle size={11} color="hsl(24 20% 55%)" />
                  <Text className="text-xs text-muted-foreground">{answers} answers</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
        {/* Post your question */}
        <TouchableOpacity activeOpacity={0.75} className="rounded-2xl border-2 border-dashed border-border bg-card px-5 py-4 flex-row items-center gap-3">
          <HelpCircle size={18} color="hsl(24 20% 55%)" />
          <Text className="text-sm text-muted-foreground flex-1">Have a question? Ask the community…</Text>
          <ChevronRight size={14} color="hsl(24 20% 60%)" />
        </TouchableOpacity>
      </View>

      {/* ── Achievement Sharing ───────────────────────────────────────────── */}
      <SectionHeader title="Recently Earned" subtitle="Badges your community unlocked" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {ACHIEVEMENTS_SHARED.map(({ name, badge, achievement, desc, color, border }) => (
          <TouchableOpacity key={name} activeOpacity={0.8}
            className={`w-32 rounded-2xl border p-4 items-center ${color} ${border}`}>
            <Text style={{ fontSize: 30 }}>{badge}</Text>
            <Text className="text-xs font-bold text-foreground text-center mt-2">{achievement}</Text>
            <Text className="text-xs text-muted-foreground text-center mt-0.5">{desc}</Text>
            <Text className="text-xs text-primary font-medium mt-2">— {name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Community Voting ──────────────────────────────────────────────── */}
      <SectionHeader title="Community Polls" subtitle="Friendly votes, zero pressure" action="See All" />
      <View className="px-6 mb-6 gap-4">
        {POLLS.map(({ question, options, totalVotes, endsIn }, pollIndex) => {
          const voted = votedPolls[pollIndex];
          const maxVotes = Math.max(...options.map(o => o.votes));
          return (
            <Card key={pollIndex} className="p-5">
              <View className="flex-row items-start justify-between mb-3">
                <Text className="text-sm font-bold text-foreground flex-1 mr-2 leading-snug">{question}</Text>
                <View className="px-2 py-0.5 rounded-full bg-muted">
                  <Text className="text-xs text-muted-foreground">Ends in {endsIn}</Text>
                </View>
              </View>
              <View className="gap-2">
                {options.map(({ label, votes }, optIndex) => {
                  const pct = votes / totalVotes;
                  const isWinning = votes === maxVotes;
                  const isVoted = voted === optIndex;
                  return (
                    <TouchableOpacity
                      key={optIndex}
                      activeOpacity={voted !== undefined ? 1 : 0.75}
                      onPress={() => vote(pollIndex, optIndex)}
                      className={`rounded-xl overflow-hidden border ${isVoted ? 'border-primary' : 'border-border'}`}
                    >
                      {voted !== undefined && (
                        <View
                          className="absolute top-0 left-0 bottom-0 rounded-xl"
                          style={{
                            width: `${pct * 100}%`,
                            backgroundColor: isWinning ? 'hsl(15 50% 50% / 0.12)' : 'hsl(34 30% 85% / 0.5)',
                          }}
                        />
                      )}
                      <View className="flex-row items-center px-3 py-2.5 justify-between">
                        <Text className={`text-sm flex-1 ${isVoted ? 'font-bold text-primary' : 'text-foreground'}`}>{label}</Text>
                        {voted !== undefined && (
                          <Text className="text-xs text-muted-foreground ml-2">{Math.round(pct * 100)}%</Text>
                        )}
                        {voted === undefined && (
                          <View className="w-4 h-4 rounded-full border border-border" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text className="text-xs text-muted-foreground mt-2">
                {totalVotes} votes · {voted !== undefined ? 'You voted!' : 'Tap to vote'}
              </Text>
            </Card>
          );
        })}
      </View>

      {/* ── Follow Creators ───────────────────────────────────────────────── */}
      <SectionHeader title="Favorite Potters" subtitle="Follow creators you love" action="Discover" />
      <View className="px-6 mb-6">
        <Card className="p-4">
          {CREATORS.map(({ name, avatar, specialty, followers, color }, i) => (
            <View key={name}>
              {i > 0 && <View className="h-px bg-border my-3" />}
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: color }}>
                  <Text className="text-white font-bold text-base">{avatar}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">{name}</Text>
                  <Text className="text-xs text-muted-foreground">{specialty} · {followers} followers</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => toggleFollow(name)}
                  className={`px-4 py-1.5 rounded-xl border ${followedCreators[name] ? 'bg-muted border-border' : 'bg-primary border-primary'}`}
                >
                  <Text className={`text-xs font-semibold ${followedCreators[name] ? 'text-foreground' : 'text-white'}`}>
                    {followedCreators[name] ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* ── Local Studios & Kiln Discovery ───────────────────────────────── */}
      <SectionHeader title="Near You" subtitle="Studios & community kilns" action="Map View" />
      <View className="px-6 mb-6">
        <Card className="p-4">
          {LOCAL_STUDIOS.map(({ name, distance, open, tag, emoji }, i) => (
            <View key={name}>
              {i > 0 && <View className="h-px bg-border my-3" />}
              <TouchableOpacity activeOpacity={0.7} className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-2xl bg-muted items-center justify-center flex-shrink-0">
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">{name}</Text>
                  <View className="flex-row items-center gap-2 mt-0.5">
                    <View className="flex-row items-center gap-1">
                      <MapPin size={10} color="hsl(24 20% 55%)" />
                      <Text className="text-xs text-muted-foreground">{distance}</Text>
                    </View>
                    <View className="px-1.5 py-0.5 rounded-full bg-muted">
                      <Text className="text-xs text-muted-foreground">{tag}</Text>
                    </View>
                  </View>
                </View>
                <View className={`w-2 h-2 rounded-full ${open ? 'bg-green-400' : 'bg-muted-foreground/40'}`} />
                <ChevronRight size={14} color="hsl(24 20% 60%)" />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </View>

      {/* ── Global Pottery News ───────────────────────────────────────────── */}
      <SectionHeader title="Pottery World" subtitle="News & inspiration from the global community" action="Read More" />
      <View className="px-6 mb-6">
        <Card className="p-4">
          {NEWS.map(({ tag, title, time }, i) => (
            <View key={i}>
              {i > 0 && <View className="h-px bg-border my-3" />}
              <TouchableOpacity activeOpacity={0.7} className="flex-row items-start gap-3">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Globe size={11} color="hsl(213 80% 55%)" />
                    <Text className="text-xs font-semibold" style={{ color: 'hsl(213 80% 55%)' }}>{tag}</Text>
                    <Text className="text-xs text-muted-foreground">· {time}</Text>
                  </View>
                  <Text className="text-sm text-foreground leading-relaxed">{title}</Text>
                </View>
                <ChevronRight size={14} color="hsl(24 20% 60%)" />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </View>

      {/* ── Mentorship CTA ────────────────────────────────────────────────── */}
      <View className="px-6 mb-8">
        <TouchableOpacity activeOpacity={0.85}>
          <View className="rounded-3xl p-5 overflow-hidden" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
            <View className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <View className="flex-row items-center gap-3 mb-2">
              <Zap size={18} color="hsl(38 80% 70%)" />
              <Text className="text-white font-serif font-bold text-lg">Become a Mentor</Text>
            </View>
            <Text className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Share your knowledge. Answer questions. Help the next generation of potters grow.
            </Text>
            <View className="flex-row items-center gap-2 mt-4">
              <View className="flex-row items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2 self-start">
                <Star size={13} color="hsl(38 80% 75%)" />
                <Text className="text-white text-xs font-semibold">+250 XP / answer</Text>
              </View>
              <View className="flex-row items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2 self-start">
                <Award size={13} color="hsl(38 80% 75%)" />
                <Text className="text-white text-xs font-semibold">Mentor Badge</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
