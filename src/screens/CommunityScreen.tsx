// src/screens/CommunityScreen.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
  Award, Bell, Bookmark, ChevronRight, Flame, Gift, Globe,
  Heart, MapPin, MessageCircle, Star, ThumbsUp, Trophy, Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

// â”€â”€ Shared atoms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PostHeader({
  avatar, name, avatarColor, tag, tagBg, tagColor, time,
}: {
  avatar: string; name: string; avatarColor: string;
  tag?: string; tagBg?: string; tagColor?: string; time: string;
}) {
  return (
    <View className="flex-row items-center gap-2.5 mb-3">
      <View
        className="w-9 h-9 rounded-full items-center justify-center flex-shrink-0"
        style={{ backgroundColor: avatarColor }}
      >
        <Text className="text-white font-bold text-sm">{avatar}</Text>
      </View>
      <View className="flex-1 flex-row items-center gap-2 flex-wrap">
        <Text className="text-sm font-bold text-foreground">{name}</Text>
        {tag && (
          <View className={`px-2 py-0.5 rounded-full ${tagBg}`}>
            <Text className="text-xs font-semibold" style={{ color: tagColor }}>{tag}</Text>
          </View>
        )}
      </View>
      <Text className="text-xs text-muted-foreground">{time}</Text>
    </View>
  );
}

function Reactions({ likes, comments, saveable }: { likes: number; comments: number; saveable?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-border">
      <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7} onPress={() => setLiked(l => !l)}>
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
      {saveable && (
        <TouchableOpacity
          className="flex-row items-center gap-1"
          activeOpacity={0.7}
          onPress={() => setSaved(s => !s)}
        >
          <Bookmark
            size={14}
            color={saved ? 'hsl(213 80% 55%)' : 'hsl(24 20% 55%)'}
            fill={saved ? 'hsl(213 80% 55%)' : 'none'}
          />
          <Text className="text-xs" style={{ color: saved ? 'hsl(213 80% 55%)' : 'hsl(24 20% 55%)' }}>
            {saved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// â”€â”€ Static data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FILTERS = ['All', 'Moments', 'Gallery', 'Tips', 'Events', 'Drops'];

const STORIES = [
  { avatar: 'Y', name: 'Yuki',  color: 'hsl(213 80% 55%)', hasNew: true  },
  { avatar: 'T', name: 'Tariq', color: 'hsl(25 90% 55%)',  hasNew: true  },
  { avatar: 'M', name: 'Mara',  color: 'hsl(340 75% 50%)', hasNew: true  },
  { avatar: 'C', name: 'Chen',  color: 'hsl(100 40% 45%)', hasNew: false },
  { avatar: 'A', name: 'Adele', color: 'hsl(270 60% 55%)', hasNew: false },
];

const POLL_OPTIONS = [
  { label: "Yuki's Soda Matte",    votes: 48 },
  { label: "Tariq's Iron Red",     votes: 35 },
  { label: "Susan's Speckled Cream", votes: 61 },
];
const POLL_TOTAL = 144;

const FOLLOW_CREATORS = [
  { name: 'Tariq B.', avatar: 'T', specialty: 'Iron Red',   color: 'hsl(25 90% 55%)'  },
  { name: 'Yuki R.',  avatar: 'Y', specialty: 'Soda Firing',color: 'hsl(213 80% 55%)' },
  { name: 'Mara L.',  avatar: 'M', specialty: 'Sculptural', color: 'hsl(340 75% 50%)' },
  { name: 'Adele K.', avatar: 'A', specialty: 'Handbuilding',color:'hsl(270 60% 55%)' },
];

// â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CommunityScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [pollVote, setPollVote] = useState<number | undefined>(undefined);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const pollMax = Math.max(...POLL_OPTIONS.map(o => o.votes));

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>

      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View className="px-6 pt-16 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-serif font-bold text-foreground">Community</Text>
          <Text className="text-sm text-muted-foreground mt-0.5">Your pottery world, together</Text>
        </View>
        <TouchableOpacity activeOpacity={0.75} className="w-10 h-10 items-center justify-center">
          <Bell size={22} color="hsl(24 20% 40%)" />
          <View className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary items-center justify-center">
            <Text className="text-white" style={{ fontSize: 9, fontWeight: '700' }}>4</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* â”€â”€ Filter chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        className="mb-5"
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.75}
            className={`px-4 py-2 rounded-full border ${activeFilter === f ? 'bg-foreground border-foreground' : 'bg-card border-border'}`}
          >
            <Text className={`text-sm font-medium ${activeFilter === f ? 'text-background' : 'text-foreground'}`}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEED â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <View className="px-4 gap-3">

        {/* 1 â”€â”€ Featured challenge â”€â”€ big hero */}
        <TouchableOpacity activeOpacity={0.88}>
          <View className="rounded-3xl overflow-hidden border border-green-200" style={{ backgroundColor: 'hsl(100 25% 96%)' }}>
            <View className="absolute top-4 left-4 z-10 flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-green-200">
              <Trophy size={12} color="hsl(100 35% 44%)" />
              <Text className="text-xs font-bold" style={{ color: 'hsl(100 35% 44%)' }}>March Challenge</Text>
            </View>
            <View className="h-44 items-center justify-center">
              <Text style={{ fontSize: 80 }}>ðŸ¥£</Text>
            </View>
            <View className="px-5 pb-5">
              <Text className="text-xl font-serif font-bold text-foreground leading-snug">The Humble Bowl</Text>
              <Text className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Throw the most honest, beautiful bowl you can. No handles, no decorations â€” just form.
              </Text>
              <View className="flex-row items-center justify-between mt-4">
                <View className="flex-row items-center gap-4">
                  <Text className="text-xs text-muted-foreground"><Text className="font-bold text-foreground">124</Text> joined</Text>
                  <Text className="text-xs text-muted-foreground"><Text className="font-bold text-foreground">23</Text> days left</Text>
                </View>
                <View className="px-4 py-2 rounded-xl" style={{ backgroundColor: 'hsl(100 35% 44%)' }}>
                  <Text className="text-white text-xs font-bold">Join Challenge</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2 â”€â”€ Moment post â”€â”€ Mara's kiln survival */}
        <Card className="p-4">
          <PostHeader avatar="M" name="Mara L." avatarColor="hsl(340 75% 50%)"
            tag="ðŸŽ‰ Moment" tagBg="bg-pink-50" tagColor="hsl(340 75% 50%)" time="2 hr ago" />
          <View className="pl-11">
            <Text className="text-sm text-foreground leading-relaxed">
              My first kiln accident and{' '}
              <Text className="font-semibold">3 pieces actually survived.</Text>
              {' '}I don't know whether to cry or celebrate â€” so I'm doing both ðŸ”¥ðŸ¥¹
            </Text>
            <View className="flex-row gap-1.5 mt-3 flex-wrap">
              {['ðŸŽŠ', 'ðŸ™Œ', 'â¤ï¸', 'ðŸ¥¹'].map((r, i) => (
                <View key={i} className="px-2 py-1 rounded-full bg-pink-50 border border-pink-100">
                  <Text style={{ fontSize: 14 }}>{r}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className="pl-11"><Reactions likes={31} comments={9} /></View>
        </Card>

        {/* 3 â”€â”€ Gallery post â”€â”€ Yuki's teapot */}
        <Card className="p-4">
          <PostHeader avatar="Y" name="Yuki R." avatarColor="hsl(213 80% 55%)"
            tag="ðŸ“¸ Gallery" tagBg="bg-blue-50" tagColor="hsl(213 80% 55%)" time="4 hr ago" />
          <View className="pl-11">
            <View className="h-52 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mb-3">
              <Text style={{ fontSize: 90 }}>ðŸ«–</Text>
            </View>
            <Text className="text-sm text-foreground leading-relaxed">
              Finally happy with this teapot spout angle after 6 attempts. Soda Matte #3 at Cone 6.
            </Text>
            <View className="flex-row gap-3 mt-2">
              {['#SodaFiring', '#Cone6', '#Teapot'].map(tag => (
                <Text key={tag} className="text-xs text-primary font-medium">{tag}</Text>
              ))}
            </View>
          </View>
          <View className="pl-11"><Reactions likes={58} comments={14} saveable /></View>
        </Card>

        {/* 4 â”€â”€ Tip of the day â”€â”€ editorial quote */}
        <View className="rounded-3xl border border-amber-200 p-5" style={{ backgroundColor: 'hsl(38 40% 97%)' }}>
          <View className="flex-row items-center gap-2 mb-3">
            <Text style={{ fontSize: 14 }}>ðŸ’¡</Text>
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tip of the Day</Text>
          </View>
          <Text className="text-base font-serif italic text-foreground leading-relaxed mb-4">
            "When centering 5 kg+ of clay, brace your elbows on your knees and push from your core â€” not your arms. Saves energy and gives far more control."
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: 'hsl(25 90% 55%)' }}>
                <Text className="text-white text-xs font-bold">T</Text>
              </View>
              <View>
                <Text className="text-xs font-bold text-foreground">Tariq B.</Text>
                <Text className="text-xs text-muted-foreground">Master Potter Â· 12 yrs</Text>
              </View>
            </View>
            <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
              <ThumbsUp size={13} color="hsl(24 20% 55%)" />
              <Text className="text-xs text-muted-foreground">88 helpful</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5 â”€â”€ Achievement post */}
        <Card className="p-4">
          <PostHeader avatar="T" name="Tariq B." avatarColor="hsl(25 90% 55%)"
            tag="ðŸ… Achievement" tagBg="bg-orange-50" tagColor="hsl(25 90% 55%)" time="Yesterday" />
          <View className="pl-11">
            <View className="flex-row items-center gap-4 bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <Text style={{ fontSize: 38 }}>ðŸ…</Text>
              <View className="flex-1">
                <Text className="text-base font-serif font-bold text-foreground">Kiln Master</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">Completed 50 firings â€” an incredible milestone.</Text>
                <View className="flex-row items-center gap-1 mt-1.5">
                  <Zap size={11} color="hsl(38 80% 50%)" />
                  <Text className="text-xs font-semibold" style={{ color: 'hsl(38 80% 50%)' }}>+500 XP earned</Text>
                </View>
              </View>
            </View>
          </View>
          <View className="pl-11"><Reactions likes={43} comments={8} saveable /></View>
        </Card>

        {/* 6 â”€â”€ Gallery post â”€â”€ Susan's mug set */}
        <Card className="p-4">
          <PostHeader avatar="S" name="Susan M." avatarColor="hsl(15 50% 50%)"
            tag="ðŸ“¸ Gallery" tagBg="bg-amber-50" tagColor="hsl(38 80% 50%)" time="Yesterday" />
          <View className="pl-11">
            <View className="flex-row gap-2 mb-3">
              {['ðŸº', 'ðŸº', 'ðŸº'].map((e, i) => (
                <View key={i} className="flex-1 h-28 rounded-xl bg-amber-50 border border-amber-100 items-center justify-center">
                  <Text style={{ fontSize: 40 }}>{e}</Text>
                </View>
              ))}
            </View>
            <Text className="text-sm text-foreground leading-relaxed">
              First matching mug set! All three centred and trimmed the same morning. Incredibly proud of this little trio ðŸ¥¹
            </Text>
          </View>
          <View className="pl-11"><Reactions likes={34} comments={11} /></View>
        </Card>

        {/* 7 â”€â”€ Poll */}
        <Card className="p-5">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-7 h-7 rounded-full bg-purple-50 items-center justify-center">
              <Star size={14} color="hsl(270 60% 55%)" />
            </View>
            <Text className="text-sm font-bold text-foreground flex-1 leading-snug">Most creative glaze this month?</Text>
            <Text className="text-xs text-muted-foreground">3 days left</Text>
          </View>
          <View className="gap-2">
            {POLL_OPTIONS.map(({ label, votes }, i) => {
              const pct = votes / POLL_TOTAL;
              const isVoted = pollVote === i;
              const isWin = votes === pollMax;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={pollVote !== undefined ? 1 : 0.75}
                  onPress={() => pollVote === undefined && setPollVote(i)}
                  className={`rounded-xl overflow-hidden border ${isVoted ? 'border-primary' : 'border-border'}`}
                >
                  {pollVote !== undefined && (
                    <View
                      className="absolute top-0 left-0 bottom-0"
                      style={{
                        width: `${pct * 100}%`,
                        backgroundColor: isWin ? 'hsl(15 50% 50% / 0.12)' : 'hsl(34 30% 85% / 0.5)',
                      }}
                    />
                  )}
                  <View className="flex-row items-center px-3 py-2.5 justify-between">
                    <Text className={`text-sm flex-1 ${isVoted ? 'font-bold text-primary' : 'text-foreground'}`}>{label}</Text>
                    {pollVote !== undefined
                      ? <Text className="text-xs text-muted-foreground ml-2">{Math.round(pct * 100)}%</Text>
                      : <View className="w-4 h-4 rounded-full border border-border" />
                    }
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text className="text-xs text-muted-foreground mt-2">
            {POLL_TOTAL} votes Â· {pollVote !== undefined ? 'You voted!' : 'Pick your favourite'}
          </Text>
        </Card>

        {/* 8 â”€â”€ Drop alert â”€â”€ inline banner */}
        <View className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-orange-100 items-center justify-center flex-shrink-0">
            <Flame size={18} color="hsl(25 90% 55%)" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-0.5">
              <Text className="text-xs font-bold" style={{ color: 'hsl(25 90% 55%)' }}>Clay & Co.</Text>
              <View className="px-2 py-0.5 rounded-full bg-orange-200">
                <Text className="text-xs font-bold" style={{ color: 'hsl(25 90% 45%)' }}>ðŸ”¥ Just dropped</Text>
              </View>
              <Text className="text-xs text-muted-foreground ml-auto">2 hr ago</Text>
            </View>
            <Text className="text-sm text-foreground font-medium">Limited Raku Vase â€” Batch of 6</Text>
          </View>
        </View>

        {/* 9 â”€â”€ Glaze Swap post */}
        <Card className="p-4">
          <PostHeader avatar="Y" name="Yuki R." avatarColor="hsl(213 80% 55%)"
            tag="ðŸ§ª Glaze Swap" tagBg="bg-blue-50" tagColor="hsl(213 80% 55%)" time="2 days ago" />
          <View className="pl-11">
            <View className="flex-row gap-3 items-center bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-3">
              <Text style={{ fontSize: 40 }}>ðŸŒ«ï¸</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">Soda Matte #3</Text>
                <Text className="text-xs text-muted-foreground">Cone 6 Â· Reduction atmosphere</Text>
                <TouchableOpacity className="mt-2 self-start px-3 py-1 rounded-lg bg-blue-100 border border-blue-200" activeOpacity={0.7}>
                  <Text className="text-xs font-bold" style={{ color: 'hsl(213 80% 55%)' }}>View Recipe â†’</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text className="text-sm text-foreground leading-relaxed">
              Sharing my go-to soda matte recipe. Comes out different every time â€” that's the magic âœ¨
            </Text>
          </View>
          <View className="pl-11"><Reactions likes={27} comments={6} saveable /></View>
        </Card>

        {/* 10 â”€â”€ Q&A post */}
        <Card className="p-4" style={{ backgroundColor: 'hsl(260 15% 97%)' }}>
          <PostHeader avatar="C" name="Chen W." avatarColor="hsl(100 40% 45%)"
            tag="â“ Question" tagBg="bg-purple-50" tagColor="hsl(260 60% 55%)" time="2 days ago" />
          <View className="pl-11">
            <Text className="text-sm font-semibold text-foreground leading-relaxed mb-3">
              "How do I prevent S-cracks in thick bottoms? Tried compressing more but they keep appearing on drying."
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border">
                <MessageCircle size={12} color="hsl(260 60% 55%)" />
                <Text className="text-xs font-semibold" style={{ color: 'hsl(260 60% 55%)' }}>7 answers</Text>
              </View>
              <TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200" activeOpacity={0.7}>
                <Text className="text-xs font-bold" style={{ color: 'hsl(260 60% 55%)' }}>Answer this â†’</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* 11 â”€â”€ Event card â”€â”€ Secret Santa */}
        <View className="rounded-3xl border border-pink-200 p-5 overflow-hidden" style={{ backgroundColor: 'hsl(340 30% 97%)' }}>
          <View className="absolute -right-6 -top-6 w-24 h-24 rounded-full" style={{ backgroundColor: 'hsl(340 75% 90%)' }} />
          <View className="px-2.5 py-0.5 rounded-full bg-pink-100 self-start mb-2">
            <Text className="text-xs font-bold" style={{ color: 'hsl(340 75% 50%)' }}>Seasonal Event</Text>
          </View>
          <Text className="text-xl font-serif font-bold text-foreground">Secret Santa Pottery ðŸŽ</Text>
          <Text className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Exchange a handmade piece anonymously. 48 potters already in. Sign-ups close Dec 1st.
          </Text>
          <View className="flex-row gap-2 mt-4">
            <TouchableOpacity className="flex-1 py-2.5 rounded-xl items-center" style={{ backgroundColor: 'hsl(340 75% 50%)' }} activeOpacity={0.8}>
              <Text className="text-white text-sm font-bold">Sign me up!</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-5 py-2.5 rounded-xl items-center bg-card border border-border" activeOpacity={0.8}>
              <Text className="text-sm font-medium text-foreground">Learn more</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 12 â”€â”€ Ceremony post â”€â”€ Chen's first pinch pot */}
        <Card className="p-4" style={{ backgroundColor: 'hsl(100 25% 97%)' }}>
          <PostHeader avatar="C" name="Chen W." avatarColor="hsl(100 40% 45%)"
            tag="ðŸŒ± First time" tagBg="bg-green-50" tagColor="hsl(100 40% 45%)" time="3 days ago" />
          <View className="pl-11">
            <Text className="text-sm text-foreground leading-relaxed">
              Made my very first pinch pot after 3 failed attempts. It's small, lopsided, and absolutely perfect.
            </Text>
            <Text className="text-lg mt-2">â¤ï¸ðŸ¥¹ðŸŒŸ</Text>
          </View>
          <View className="pl-11"><Reactions likes={52} comments={17} /></View>
        </Card>

        {/* 13 â”€â”€ News post */}
        <Card className="p-4">
          <View className="flex-row items-center gap-1.5 mb-3">
            <Globe size={13} color="hsl(213 80% 55%)" />
            <Text className="text-xs font-bold" style={{ color: 'hsl(213 80% 55%)' }}>World News</Text>
            <Text className="text-xs text-muted-foreground ml-auto">3 days ago</Text>
          </View>
          <Text className="text-base font-serif font-bold text-foreground leading-snug mb-1.5">
            The Bernard Leach retrospective opens at the V&A this April
          </Text>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            One of the most influential potters of the 20th century gets a landmark exhibition in London. Don't miss it.
          </Text>
          <TouchableOpacity className="mt-3 flex-row items-center gap-0.5" activeOpacity={0.7}>
            <Text className="text-xs text-primary font-semibold">Read more</Text>
            <ChevronRight size={12} color="hsl(15 50% 50%)" />
          </TouchableOpacity>
        </Card>

        {/* 14 â”€â”€ Near you â”€â”€ local studios */}
        <Card className="p-4">
          <View className="flex-row items-center gap-1.5 mb-3">
            <MapPin size={13} color="hsl(15 50% 50%)" />
            <Text className="text-xs font-bold text-primary">Near You</Text>
          </View>
          {[
            { name: 'Ashfield Ceramics',  distance: '0.8 mi', open: true,  tag: 'Community Kiln',   emoji: 'ðŸ­' },
            { name: 'The Clay Room PDX',  distance: '1.4 mi', open: true,  tag: 'Classes + Studio', emoji: 'ðŸº' },
          ].map(({ name, distance, open, tag, emoji }, i) => (
            <View key={name}>
              {i > 0 && <View className="h-px bg-border my-3" />}
              <TouchableOpacity activeOpacity={0.7} className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-2xl bg-muted items-center justify-center">
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">{name}</Text>
                  <View className="flex-row items-center gap-2 mt-0.5">
                    <Text className="text-xs text-muted-foreground">{distance}</Text>
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

        {/* 15 â”€â”€ Potters you might love */}
        <Card className="p-4">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Potters you might love</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}>
            {FOLLOW_CREATORS.map(({ name, avatar, specialty, color }) => (
              <View key={name} className="w-28 items-center bg-muted/40 rounded-2xl p-3 border border-border">
                <View className="w-12 h-12 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: color }}>
                  <Text className="text-white font-bold text-base">{avatar}</Text>
                </View>
                <Text className="text-xs font-bold text-foreground text-center">{name}</Text>
                <Text className="text-xs text-muted-foreground text-center mt-0.5">{specialty}</Text>
                <TouchableOpacity
                  onPress={() => setFollowed(prev => ({ ...prev, [name]: !prev[name] }))}
                  className={`mt-2.5 w-full py-1.5 rounded-xl items-center border ${followed[name] ? 'bg-muted border-border' : 'border-primary'}`}
                  activeOpacity={0.75}
                >
                  <Text className={`text-xs font-semibold ${followed[name] ? 'text-muted-foreground' : 'text-primary'}`}>
                    {followed[name] ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </Card>

        {/* 16 â”€â”€ Mentor CTA â”€â”€ footer banner */}
        <TouchableOpacity activeOpacity={0.85}>
          <View className="rounded-3xl p-5 overflow-hidden" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
            <View className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <View className="flex-row items-center gap-2.5 mb-2">
              <Zap size={18} color="hsl(38 80% 70%)" />
              <Text className="text-white font-serif font-bold text-lg">Become a Mentor</Text>
            </View>
            <Text className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Share your knowledge. Answer questions. Help the next generation of potters grow.
            </Text>
            <View className="flex-row gap-2 mt-4">
              <View className="flex-row items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2">
                <Star size={12} color="hsl(38 80% 75%)" />
                <Text className="text-white text-xs font-semibold">+250 XP / answer</Text>
              </View>
              <View className="flex-row items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2">
                <Award size={12} color="hsl(38 80% 75%)" />
                <Text className="text-white text-xs font-semibold">Mentor Badge</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

      </View>
      <View className="h-12" />
    </ScrollView>
  );
}


