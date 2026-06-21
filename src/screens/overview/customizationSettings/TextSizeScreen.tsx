import { CustomizationSettingsShell } from '@/src/components/settings/CustomizationSettingsShell';
import { TextSizePicker } from '@/src/components/TextSizePicker';
import { Text } from '@/src/components/ui/text';
import { useTextScale } from '@/src/hooks/useTextScale';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { Type as TypeIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';

export default function TextSizeScreen() {
  const router = useRouter();
  const markSetupProgress = useAppStore((s) => s.markSetupProgress);
  const { textScale, setTextScale } = useTextScale();
  const [draft, setDraft] = useState(textScale);

  function handleSave() {
    setTextScale(draft);
    markSetupProgress('textSizeReviewed');
    router.back();
  }

  return (
    <CustomizationSettingsShell
      eyebrow="Display"
      title="Choose your text size"
      subtitle="Scales labels, buttons, and body text across the app. You can change this anytime in App Customization."
      onBack={() => router.back()}
      onSave={handleSave}
    >
      <View className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-4 flex-row items-start gap-3">
        <TypeIcon size={16} color="hsl(39 57% 51%)" className="mt-0.5" />
        <Text className="text-xs text-primary flex-1 leading-relaxed">
          Pick a size that feels comfortable. Changes apply immediately after you save.
        </Text>
      </View>

      <TextSizePicker value={draft} onChange={setDraft} />
    </CustomizationSettingsShell>
  );
}
