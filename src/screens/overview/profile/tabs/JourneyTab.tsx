import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { RefreshCw, Sparkles, Trophy } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ACHIEVEMENTS, KEY_STATS, TIMELINE } from '../mockedData/data';

export function JourneyTab() {
  return (
    <View className="px-6">
      {/* Studio Motto */}
      <View className="bg-accent/10 border border-accent/25 rounded-2xl px-4 py-4 mb-5">
        <Text className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Studio Motto</Text>
        <Text className="text-sm text-foreground font-serif italic">"Each imperfection is a signature."</Text>
      </View>

      {/* Stats */}
      <Text className="text-base font-serif font-bold text-foreground mb-3">Craft Stats</Text>
      <View className="flex-row flex-wrap gap-3 mb-5">
        {KEY_STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <View key={label} className={`rounded-2xl border border-border p-4 ${bg}`} style={{ width: '47%' }}>
            <Icon size={18} color={color} style={{ marginBottom: 6 }} />
            <Text className="text-2xl font-serif font-bold text-foreground">{value}</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{label}</Text>
          </View>
        ))}
      </View>

      {/* Achievements */}
      <Text className="text-base font-serif font-bold text-foreground mb-3">Achievements</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-6 mb-5"
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {ACHIEVEMENTS.map(({ icon: Icon, name, desc, bg, border, iconColor, unlocked }) => (
          <TouchableOpacity
            key={name}
            activeOpacity={0.75}
            className={`w-28 rounded-2xl border px-3 pt-4 pb-3 items-center ${bg} ${border} ${!unlocked ? 'opacity-50' : ''}`}
          >
            <View className="w-12 h-12 rounded-full bg-white/60 items-center justify-center mb-2">
              <Icon size={22} color={unlocked ? iconColor : 'hsl(24 20% 60%)'} />
            </View>
            <Text className="text-xs font-bold text-foreground text-center leading-tight">{name}</Text>
            <Text className="text-xs text-muted-foreground text-center mt-0.5">{desc}</Text>
            {!unlocked && (
              <View className="mt-1.5 px-2 py-0.5 bg-black/10 rounded-full">
                <Text className="text-xs text-muted-foreground">Locked</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline */}
      <Text className="text-base font-serif font-bold text-foreground mb-3">Studio Timeline</Text>
      <Card className="p-5 mb-5">
        {TIMELINE.map(({ year, label, color }, i) => (
          <View key={i} className="flex-row gap-4">
            <View className="items-center" style={{ width: 20 }}>
              <View className={`w-3 h-3 rounded-full mt-1 ${color}`} />
              {i < TIMELINE.length - 1 && <View className="w-px flex-1 bg-border mt-1" />}
            </View>
            <View className={`flex-1 ${i < TIMELINE.length - 1 ? 'pb-4' : ''}`}>
              <Text className="text-xs font-semibold text-primary mb-0.5">{year}</Text>
              <Text className="text-sm text-foreground leading-relaxed">{label}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Pottery Pet */}
      <Text className="text-base font-serif font-bold text-foreground mb-3">Pottery Pet</Text>
      <Card className="overflow-hidden mb-6" style={{ backgroundColor: 'hsl(260 20% 97%)' }}>
        <View className="flex-row items-center p-5 gap-4">
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center border border-border"
            style={{ backgroundColor: 'hsl(260 15% 88%)' }}
          >
            <Text style={{ fontSize: 42 }}>🐾</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-base font-bold font-serif text-foreground">Cinder</Text>
              <View className="px-2 py-0.5 bg-green-100 rounded-full">
                <Text className="text-xs text-green-700 font-medium">Happy 😊</Text>
              </View>
            </View>
            <Text className="text-xs text-muted-foreground mb-2">Kiln Cat · Lv. 5</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-muted-foreground">Mood</Text>
              <View className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <View className="h-full w-4/5 rounded-full" style={{ backgroundColor: 'hsl(145 50% 45%)' }} />
              </View>
              <Text className="text-xs text-muted-foreground">80%</Text>
            </View>
          </View>
        </View>
        <View className="border-t border-border flex-row">
          {([
            { label: 'Change Pet',  icon: RefreshCw },
            { label: 'Accessories', icon: Sparkles  },
            { label: 'Unlock Pets', icon: Trophy    },
          ] as const).map(({ label, icon: Icon }, i) => (
            <TouchableOpacity
              key={label}
              activeOpacity={0.7}
              className={`flex-1 py-3.5 items-center justify-center flex-row gap-1.5 ${i < 2 ? 'border-r border-border' : ''}`}
            >
              <Icon size={13} color="hsl(15 50% 50%)" />
              <Text className="text-xs font-medium text-primary">{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </View>
  );
}
