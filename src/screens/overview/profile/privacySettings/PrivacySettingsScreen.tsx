import { SectionLabel } from '@/src/components/SectionLabel';
import { SettingsGroup } from '@/src/components/SettingsGroup';
import { ToggleRow } from '@/src/components/ToggleRow';
import { Text } from '@/src/components/ui/text';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useAppStore } from '@/src/store';
import { buildStudioExportPayload, shareStudioExport } from '@/src/utils/exportStudioData';
import { PremiumFeature } from '@/src/utils/premiumGate';
import { useRouter } from 'expo-router';
import {
    BarChart2,
    ChevronDown,
    Eye,
    Image,
    Sparkles,
} from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const privacyPrefs = useAppStore((s) => s.privacyPrefs);
  const setPrivacyPref = useAppStore((s) => s.setPrivacyPref);
  const pieces = useAppStore((s) => s.pieces);
  const firings = useAppStore((s) => s.firings);
  const kilns = useAppStore((s) => s.kilns);
  const glazes = useAppStore((s) => s.glazes);
  const glazeTests = useAppStore((s) => s.glazeTests);
  const glazeCollectionNames = useAppStore((s) => s.glazeCollectionNames);
  const showToast = useAppStore((s) => s.showToast);
  const { requestAccess, PaywallGate } = usePremiumGate();
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    if (!requestAccess(PremiumFeature.Export)) return;

    setExporting(true);
    try {
      const payload = buildStudioExportPayload({
        pieces,
        firings,
        kilns,
        glazes,
        glazeTests,
        glazeCollectionNames,
      });
      await shareStudioExport(payload);
    } catch {
      showToast('Export failed — try again', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {PaywallGate}
      <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-muted/60 mr-3"
        >
          <ChevronDown size={20} color="hsl(24 30% 40%)" style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Privacy Settings</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">Control how your data is used and shared</Text>
        </View>
      </View>

      <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
        <SectionLabel title="Data & Personalisation" />
        <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-4">
          <ToggleRow
            icon={BarChart2}
            iconColor="hsl(213 80% 55%)"
            iconBg="bg-blue-50"
            label="Analytics & Crash Reports"
            value={privacyPrefs.analyticsEnabled}
            onToggle={() => setPrivacyPref('analyticsEnabled', !privacyPrefs.analyticsEnabled)}
          />
          <ToggleRow
            icon={Sparkles}
            iconColor="hsl(270 55% 52%)"
            iconBg="bg-purple-50"
            label="Personalised Suggestions"
            value={privacyPrefs.personalizedSuggestions}
            onToggle={() => setPrivacyPref('personalizedSuggestions', !privacyPrefs.personalizedSuggestions)}
            isLast
          />
        </View>

        <View className="mx-6 mb-5 rounded-2xl border border-border bg-muted/40 px-4 py-3">
          <Text className="text-xs text-muted-foreground leading-5">
            Analytics help us fix bugs and improve the app. Personalised suggestions use your studio activity to shape daily missions and rhythm nudges. All data stays on your device — nothing is sold or shared with third parties.
          </Text>
        </View>

        <SectionLabel title="Community Visibility" />
        <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-4">
          <ToggleRow
            icon={Eye}
            iconColor="hsl(38 80% 50%)"
            iconBg="bg-amber-50"
            label="Public Profile"
            value={privacyPrefs.profilePublic}
            onToggle={() => setPrivacyPref('profilePublic', !privacyPrefs.profilePublic)}
          />
          <ToggleRow
            icon={Image}
            iconColor="hsl(39 57% 51%)"
            iconBg="bg-primary/10"
            label="Show Pieces Publicly"
            value={privacyPrefs.piecesPublic}
            onToggle={() => setPrivacyPref('piecesPublic', !privacyPrefs.piecesPublic)}
            isLast
          />
        </View>

        <View className="mx-6 mb-5 rounded-2xl border border-border bg-muted/40 px-4 py-3">
          <Text className="text-xs text-muted-foreground leading-5">
            A public profile is discoverable in the Community tab. Turning off piece visibility hides your work from other potters while keeping your profile visible.
          </Text>
        </View>

        <SectionLabel title="Your Data" />
        <SettingsGroup>
          <TouchableOpacity
            activeOpacity={0.65}
            onPress={handleExport}
            disabled={exporting}
            className="flex-row items-center gap-3 py-3.5"
            accessibilityRole="button"
            accessibilityLabel="Export my data"
          >
            <View className="w-9 h-9 rounded-xl items-center justify-center bg-green-50">
              <BarChart2 size={17} color="hsl(100 40% 45%)" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground">Export My Data</Text>
              <Text className="text-[11px] text-muted-foreground mt-0.5">
                Pieces, firings, glazes, and test tiles (Premium)
              </Text>
            </View>
            {exporting ? (
              <ActivityIndicator size="small" color="hsl(24 20% 40%)" />
            ) : null}
          </TouchableOpacity>
        </SettingsGroup>

        <View className="px-6 mt-6 mb-8">
          <Text className="text-xs text-muted-foreground text-center leading-5">
            For questions about your data, use the Feedback button on the home screen and select "Need Help".
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
