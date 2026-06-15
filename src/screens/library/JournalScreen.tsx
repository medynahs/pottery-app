import GlazeDiscoverScreen from '@/src/screens/library/GlazeDiscoverScreen';
import LibraryGlazesScreen from '@/src/screens/library/LibraryGlazesScreen';
import { AddGlazeModal } from '@/src/screens/library/atlas/AddGlazeModal';
import { LogTestModal } from '@/src/screens/library/atlas/LogTestModal';
import { useGlazeAtlas } from '@/src/screens/library/useGlazeAtlas';
import { useLocalSearchParams } from 'expo-router';
import { Plus, Sparkles } from 'lucide-react-native';
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
  const { action } = useLocalSearchParams<{ action?: string }>();
  const [activeTab, setActiveTab] = useState<AtlasTab>('my-atlas');
  const atlas = useGlazeAtlas();
  const didAutoOpen = React.useRef(false);

  React.useEffect(() => {
    if (didAutoOpen.current) return;
    if (action === 'add-glaze') {
      didAutoOpen.current = true;
      atlas.openAddGlaze();
      return;
    }
    if (action === 'log-test') {
      didAutoOpen.current = true;
      atlas.openLogTest();
    }
  }, [action, atlas]);

  const headerActions =
    activeTab === 'my-atlas' ? (
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={atlas.openLogTest}
          activeOpacity={0.85}
          className="flex-row items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-border bg-card"
        >
          <Sparkles size={14} color="hsl(24 20% 40%)" />
          <Text className="text-xs font-semibold text-foreground">Log Tile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={atlas.openAddGlaze}
          activeOpacity={0.85}
          className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary"
          style={{
            shadowColor: '#8B6A2A',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Plus size={15} color="white" />
          <Text className="text-sm font-semibold text-white">Add</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-background">
      <MainTabHeader
        title="Glaze Atlas"
        description={
          activeTab === 'my-atlas'
            ? `${atlas.glazes.length} glaze${atlas.glazes.length !== 1 ? 's' : ''} · ${atlas.glazeTests.length} test${atlas.glazeTests.length !== 1 ? 's' : ''}`
            : 'Browse glaze inspiration — tap a photo for the full recipe'
        }
        rightElement={headerActions}
      />

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
        {activeTab === 'my-atlas' ? (
          <LibraryGlazesScreen
            glazes={atlas.glazes}
            glazeTests={atlas.glazeTests}
            onAddGlaze={atlas.openAddGlaze}
            onLogTest={atlas.openLogTest}
          />
        ) : (
          <GlazeDiscoverScreen />
        )}
      </View>

      <AddGlazeModal
        visible={atlas.addOpen}
        onClose={() => atlas.setAddOpen(false)}
        onSave={atlas.handleSaveGlaze}
        defaultCone={atlas.defaultGlazeTemp}
        collections={atlas.collections}
        onCreateCollection={atlas.addGlazeCollection}
      />

      <LogTestModal
        visible={atlas.testOpen}
        onClose={() => atlas.setTestOpen(false)}
        onSave={atlas.handleSaveTest}
        glazes={atlas.glazes}
        clayBodies={atlas.clayBodies}
        defaultGlazeTemp={atlas.defaultGlazeTemp}
      />

      {atlas.PaywallGate}
    </View>
  );
}
