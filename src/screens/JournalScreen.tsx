import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, Droplets, Target, Wrench } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

type LibraryCardItem = {
  id: 'roadmaps' | 'glazes' | 'tools' | 'templates';
  title: string;
  subtitle: string;
  count: string;
  route: '/library-roadmaps' | '/library-glazes' | '/library-tools' | '/library-templates';
  icon: React.ReactNode;
};

function FeatureCard({
  item,
  onPress,
}: {
  item: LibraryCardItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.84}
      className="w-[48%] rounded-3xl border border-border bg-card p-4"
    >
      <View className="w-10 h-10 rounded-2xl bg-muted items-center justify-center mb-3">
        {item.icon}
      </View>
      <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
        {item.title}
      </Text>
      <Text className="text-xs text-muted-foreground mt-1" numberOfLines={2}>
        {item.subtitle}
      </Text>
      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-xs font-semibold text-primary">{item.count}</Text>
        <ChevronRight size={14} color="hsl(24 20% 40%)" />
      </View>
    </TouchableOpacity>
  );
}

export default function JournalScreen() {
  const router = useRouter();
  const glazes = useAppStore((state) => state.glazes);

  const cards = React.useMemo<LibraryCardItem[]>(
    () => [
      {
        id: 'roadmaps',
        title: 'Roadmaps',
        subtitle: 'Skill paths and progress',
        count: '2 paths',
        route: '/library-roadmaps',
        icon: <Target size={18} color="hsl(38 80% 50%)" />,
      },
      {
        id: 'glazes',
        title: 'Glazes',
        subtitle: 'Recipes, tests, and saves',
        count: `${glazes.length} glazes`,
        route: '/library-glazes',
        icon: <Droplets size={18} color="hsl(213 80% 55%)" />,
      },
      {
        id: 'tools',
        title: 'Tool Guide',
        subtitle: 'Essential gear references',
        count: '2 guides',
        route: '/library-tools',
        icon: <Wrench size={18} color="hsl(24 20% 40%)" />,
      },
      {
        id: 'templates',
        title: 'Templates',
        subtitle: 'Owned and saved assets',
        count: '4 assets',
        route: '/library-templates',
        icon: <BookOpen size={18} color="hsl(24 20% 40%)" />,
      },
    ],
    [glazes.length],
  );

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4 bg-background border-b border-border">
        <Text className="text-3xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>Library</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Pick a card to open each library feature.
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-8">
          <Text className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
            Collections
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {cards.map((card) => (
              <FeatureCard
                key={card.id}
                item={card}
                onPress={() => router.push(card.route as never)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
