// src/screens/community/tabs/ForYouFeed.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
    Award,
    ChevronRight,
    Flame,
    Globe,
    MapPin,
    MessageCircle,
    Star,
    ThumbsUp,
    Trophy,
    Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { PostHeader } from '../components/PostHeader';
import { Reactions } from '../components/Reactions';
import { FOLLOW_CREATORS, POLL_OPTIONS, POLL_TOTAL } from '../data';

export function ForYouFeed() {
  const [pollVote, setPollVote] = useState<number | undefined>(undefined);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const pollMax = Math.max(...POLL_OPTIONS.map(o => o.votes));

  return (
    <>
      {/* 1 ── Featured challenge ── big hero */}
      <TouchableOpacity activeOpacity={0.88}>
        <View className="rounded-3xl overflow-hidden border border-green-200" style={{ backgroundColor: 'hsl(100 25% 96%)' }}>
          <View className="absolute top-4 left-4 z-10 flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-green-200">
            <Trophy size={12} color="hsl(100 35% 44%)" />
            <Text className="text-xs font-bold" style={{ color: 'hsl(100 35% 44%)' }}>March Challenge</Text>
          </View>
          <View className="h-44 items-center justify-center">
            <Text style={{ fontSize: 80 }}>🥣</Text>
          </View>
          <View className="px-5 pb-5">
            <Text className="text-xl font-serif font-bold text-foreground leading-snug">The Humble Bowl</Text>
            <Text className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Throw the most honest, beautiful bowl you can. No handles, no decorations — just form.
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

      {/* 2 ── Moment post ── Mara's kiln survival */}
      <Card className="p-4">
        <PostHeader avatar="M" name="Mara L." avatarColor="hsl(340 75% 50%)"
          tag="🎉 Moment" tagBg="bg-pink-50" tagColor="hsl(340 75% 50%)" time="2 hr ago" />
        <View className="pl-11">
          <Text className="text-sm text-foreground leading-relaxed">
            My first kiln accident and{' '}
            <Text className="font-semibold">3 pieces actually survived.</Text>
            {' '}I don't know whether to cry or celebrate — so I'm doing both 🔥🥹
          </Text>
          <View className="flex-row gap-1.5 mt-3 flex-wrap">
            {['🎊', '🙌', '❤️', '🥹'].map((r, i) => (
              <View key={i} className="px-2 py-1 rounded-full bg-pink-50 border border-pink-100">
                <Text style={{ fontSize: 14 }}>{r}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className="pl-11"><Reactions likes={31} comments={9} /></View>
      </Card>

      {/* 3 ── Gallery post ── Yuki's teapot */}
      <Card className="p-4">
        <PostHeader avatar="Y" name="Yuki R." avatarColor="hsl(213 80% 55%)"
          tag="📸 Gallery" tagBg="bg-blue-50" tagColor="hsl(213 80% 55%)" time="4 hr ago" />
        <View className="pl-11">
          <View className="h-52 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mb-3">
            <Text style={{ fontSize: 90 }}>🫖</Text>
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

      {/* 4 ── Tip of the day */}
      <View className="rounded-3xl border border-amber-200 p-5" style={{ backgroundColor: 'hsl(38 40% 97%)' }}>
        <View className="flex-row items-center gap-2 mb-3">
          <Text style={{ fontSize: 14 }}>💡</Text>
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tip of the Day</Text>
        </View>
        <Text className="text-base font-serif italic text-foreground leading-relaxed mb-4">
          "When centering 5 kg+ of clay, brace your elbows on your knees and push from your core — not your arms. Saves energy and gives far more control."
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: 'hsl(25 90% 55%)' }}>
              <Text className="text-white text-xs font-bold">T</Text>
            </View>
            <View>
              <Text className="text-xs font-bold text-foreground">Tariq B.</Text>
              <Text className="text-xs text-muted-foreground">Master Potter · 12 yrs</Text>
            </View>
          </View>
          <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
            <ThumbsUp size={13} color="hsl(24 20% 55%)" />
            <Text className="text-xs text-muted-foreground">88 helpful</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5 ── Achievement post */}
      <Card className="p-4">
        <PostHeader avatar="T" name="Tariq B." avatarColor="hsl(25 90% 55%)"
          tag="🏅 Achievement" tagBg="bg-orange-50" tagColor="hsl(25 90% 55%)" time="Yesterday" />
        <View className="pl-11">
          <View className="flex-row items-center gap-4 bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <Text style={{ fontSize: 38 }}>🏅</Text>
            <View className="flex-1">
              <Text className="text-base font-serif font-bold text-foreground">Kiln Master</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">Completed 50 firings — an incredible milestone.</Text>
              <View className="flex-row items-center gap-1 mt-1.5">
                <Zap size={11} color="hsl(38 80% 50%)" />
                <Text className="text-xs font-semibold" style={{ color: 'hsl(38 80% 50%)' }}>+500 XP earned</Text>
              </View>
            </View>
          </View>
        </View>
        <View className="pl-11"><Reactions likes={43} comments={8} saveable /></View>
      </Card>

      {/* 6 ── Gallery post ── Susan's mug set */}
      <Card className="p-4">
        <PostHeader avatar="S" name="Susan M." avatarColor="hsl(15 50% 50%)"
          tag="📸 Gallery" tagBg="bg-amber-50" tagColor="hsl(38 80% 50%)" time="Yesterday" />
        <View className="pl-11">
          <View className="flex-row gap-2 mb-3">
            {['🏺', '🏺', '🏺'].map((e, i) => (
              <View key={i} className="flex-1 h-28 rounded-xl bg-amber-50 border border-amber-100 items-center justify-center">
                <Text style={{ fontSize: 40 }}>{e}</Text>
              </View>
            ))}
          </View>
          <Text className="text-sm text-foreground leading-relaxed">
            First matching mug set! All three centred and trimmed the same morning. Incredibly proud of this little trio 🥹
          </Text>
        </View>
        <View className="pl-11"><Reactions likes={34} comments={11} /></View>
      </Card>

      {/* 7 ── Poll */}
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
          {POLL_TOTAL} votes · {pollVote !== undefined ? 'You voted!' : 'Pick your favourite'}
        </Text>
      </Card>

      {/* 8 ── Drop alert ── inline banner */}
      <View className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-orange-100 items-center justify-center flex-shrink-0">
          <Flame size={18} color="hsl(25 90% 55%)" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-0.5">
            <Text className="text-xs font-bold" style={{ color: 'hsl(25 90% 55%)' }}>Clay & Co.</Text>
            <View className="px-2 py-0.5 rounded-full bg-orange-200">
              <Text className="text-xs font-bold" style={{ color: 'hsl(25 90% 45%)' }}>🔥 Just dropped</Text>
            </View>
            <Text className="text-xs text-muted-foreground ml-auto">2 hr ago</Text>
          </View>
          <Text className="text-sm text-foreground font-medium">Limited Raku Vase — Batch of 6</Text>
        </View>
      </View>

      {/* 9 ── Glaze Swap post */}
      <Card className="p-4">
        <PostHeader avatar="Y" name="Yuki R." avatarColor="hsl(213 80% 55%)"
          tag="🧪 Glaze Swap" tagBg="bg-blue-50" tagColor="hsl(213 80% 55%)" time="2 days ago" />
        <View className="pl-11">
          <View className="flex-row gap-3 items-center bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-3">
            <Text style={{ fontSize: 40 }}>🌫️</Text>
            <View className="flex-1">
              <Text className="text-sm font-bold text-foreground">Soda Matte #3</Text>
              <Text className="text-xs text-muted-foreground">Cone 6 · Reduction atmosphere</Text>
              <TouchableOpacity className="mt-2 self-start px-3 py-1 rounded-lg bg-blue-100 border border-blue-200" activeOpacity={0.7}>
                <Text className="text-xs font-bold" style={{ color: 'hsl(213 80% 55%)' }}>View Recipe →</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text className="text-sm text-foreground leading-relaxed">
            Sharing my go-to soda matte recipe. Comes out different every time — that's the magic ✨
          </Text>
        </View>
        <View className="pl-11"><Reactions likes={27} comments={6} saveable /></View>
      </Card>

      {/* 10 ── Q&A post */}
      <Card className="p-4" style={{ backgroundColor: 'hsl(260 15% 97%)' }}>
        <PostHeader avatar="C" name="Chen W." avatarColor="hsl(100 40% 45%)"
          tag="❓ Question" tagBg="bg-purple-50" tagColor="hsl(260 60% 55%)" time="2 days ago" />
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
              <Text className="text-xs font-bold" style={{ color: 'hsl(260 60% 55%)' }}>Answer this →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* 11 ── Event card ── Secret Santa */}
      <View className="rounded-3xl border border-pink-200 p-5 overflow-hidden" style={{ backgroundColor: 'hsl(340 30% 97%)' }}>
        <View className="absolute -right-6 -top-6 w-24 h-24 rounded-full" style={{ backgroundColor: 'hsl(340 75% 90%)' }} />
        <View className="px-2.5 py-0.5 rounded-full bg-pink-100 self-start mb-2">
          <Text className="text-xs font-bold" style={{ color: 'hsl(340 75% 50%)' }}>Seasonal Event</Text>
        </View>
        <Text className="text-xl font-serif font-bold text-foreground">Secret Santa Pottery 🎁</Text>
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

      {/* 12 ── Ceremony post ── Chen's first pinch pot */}
      <Card className="p-4" style={{ backgroundColor: 'hsl(100 25% 97%)' }}>
        <PostHeader avatar="C" name="Chen W." avatarColor="hsl(100 40% 45%)"
          tag="🌱 First time" tagBg="bg-green-50" tagColor="hsl(100 40% 45%)" time="3 days ago" />
        <View className="pl-11">
          <Text className="text-sm text-foreground leading-relaxed">
            Made my very first pinch pot after 3 failed attempts. It's small, lopsided, and absolutely perfect.
          </Text>
          <Text className="text-lg mt-2">❤️🥹🌟</Text>
        </View>
        <View className="pl-11"><Reactions likes={52} comments={17} /></View>
      </Card>

      {/* 13 ── News post */}
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

      {/* 14 ── Near you ── local studios */}
      <Card className="p-4">
        <View className="flex-row items-center gap-1.5 mb-3">
          <MapPin size={13} color="hsl(15 50% 50%)" />
          <Text className="text-xs font-bold text-primary">Near You</Text>
        </View>
        {[
          { name: 'Ashfield Ceramics', distance: '0.8 mi', open: true, tag: 'Community Kiln', emoji: '🏭' },
          { name: 'The Clay Room PDX', distance: '1.4 mi', open: true, tag: 'Classes + Studio', emoji: '🏺' },
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

      {/* 15 ── Potters you might love */}
      <Card className="p-4">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Potters you might love
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -4 }}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}
        >
          {FOLLOW_CREATORS.map(({ name, avatar, specialty, color }) => (
            <View key={name} className="w-28 items-center bg-muted/40 rounded-2xl p-3 border border-border">
              <View className="w-12 h-12 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: color }}>
                <Text className="text-white font-bold text-base">{avatar}</Text>
              </View>
              <Text className="text-xs font-bold text-foreground text-center">{name}</Text>
              <Text className="text-xs text-muted-foreground text-center mt-0.5">{specialty}</Text>
              <TouchableOpacity
                onPress={() => setFollowed(prev => ({ ...prev, [name]: !prev[name] }))}
                className={`mt-2.5 w-full py-1.5 rounded-xl items-center border ${
                  followed[name] ? 'bg-muted border-border' : 'border-primary'
                }`}
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

      {/* 16 ── Mentor CTA ── footer banner */}
      <TouchableOpacity activeOpacity={0.85}>
        <View className="rounded-3xl p-5 overflow-hidden" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
          <View
            className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          />
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
    </>
  );
}
