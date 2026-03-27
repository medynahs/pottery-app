import { Text } from '@/src/components/ui/text';
import LibraryGlazesScreen from '@/src/screens/library/LibraryGlazesScreen';
import LibraryRoadmapsScreen from '@/src/screens/library/LibraryRoadmapsScreen';
import LibraryTemplatesScreen from '@/src/screens/library/LibraryTemplatesScreen';
import LibraryToolsScreen from '@/src/screens/library/LibraryToolsScreen';
import React, { useState } from 'react';
import { Image, View } from 'react-native';

type JournalTab = 'glazes' | 'roadmaps' | 'tools' | 'templates';

const TABS: { key: JournalTab; label: string }[] = [
  { key: 'glazes', label: 'Glaze Atlas' },
  { key: 'roadmaps', label: 'Roadmaps' },
  { key: 'tools', label: 'Tool Guide' },
  { key: 'templates', label: 'Templates' },
];

export default function JournalScreen() {
  const [activeTab, setActiveTab] = useState<JournalTab>('glazes');

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4 bg-background border-b border-border">
        <View className="flex-row items-center gap-3">
          <Image
            source={require('../../assets/animations/book.gif')}
            style={{ width: 42, height: 42 }}
            resizeMode="contain"
          />
          <View>
            <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>Library</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Switch between your reference collections.
            </Text>
          </View>
        </View>
      </View>

      {/* Top Tab Bar */}
      <View className="mx-6 mt-6 mb-2 flex-row bg-muted rounded-2xl p-1">
        {TABS.map(({ key, label }) => (
          <View key={key} style={{ flex: 1 }}>
            <Text
              onPress={() => setActiveTab(key)}
              className={`py-2.5 rounded-xl text-center font-semibold text-sm ${activeTab === key ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
              style={activeTab === key ? { fontFamily: 'Fraunces_600SemiBold' } : {}}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-1">
        {activeTab === 'glazes' && <LibraryGlazesScreen />}
        {activeTab === 'roadmaps' && <LibraryRoadmapsScreen />}
        {activeTab === 'tools' && <LibraryToolsScreen />}
        {activeTab === 'templates' && <LibraryTemplatesScreen />}
      </View>
    </View>
  );
}
