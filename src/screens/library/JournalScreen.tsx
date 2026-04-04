import GlazeDiscoverScreen from '@/src/screens/library/GlazeDiscoverScreen';
import LibraryGlazesScreen from '@/src/screens/library/LibraryGlazesScreen';
// V2: import LibraryRoadmapsScreen from '@/src/screens/library/LibraryRoadmapsScreen';
// V2: import LibraryTemplatesScreen from '@/src/screens/library/LibraryTemplatesScreen';
// V2: import LibraryToolsScreen from '@/src/screens/library/LibraryToolsScreen';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { MainTabHeader } from '../../components/MainTabHeader';
import { Text } from '../../components/ui/text';

type AtlasTab = 'my-atlas' | 'discover';

const TABS: { key: AtlasTab; label: string }[] = [
  { key: 'my-atlas', label: 'My Atlas' },
  { key: 'discover', label: 'Discover' },
];

export default function JournalScreen() {
  const [activeTab, setActiveTab] = useState<AtlasTab>('my-atlas');

  return (
    <View className="flex-1 bg-background">
      <MainTabHeader
        title="Glaze Atlas"
        description={activeTab === 'my-atlas' ? 'Your personal collection of glazes and test tiles' : 'Browse and save community recipes'}
      />

      {/* Segment switcher */}
      <View className="mx-6 mt-4 mb-1 flex-row bg-muted rounded-2xl p-1">
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            activeOpacity={0.75}
            style={{ flex: 1 }}
            className={`py-2.5 rounded-xl items-center justify-center ${activeTab === key ? 'bg-card' : ''}`}
          >
            <Text
              className={`text-sm font-semibold ${activeTab === key ? 'text-foreground' : 'text-muted-foreground'}`}
              style={activeTab === key ? { fontFamily: 'Fraunces_600SemiBold' } : {}}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-1">
        {activeTab === 'my-atlas' ? <LibraryGlazesScreen /> : <GlazeDiscoverScreen />}
        {/* V2: roadmaps, tools, templates tabs restored here */}
      </View>
    </View>
  );
}


