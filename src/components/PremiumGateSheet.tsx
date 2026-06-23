import { ModalSheetActions, SheetButton } from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import {
  getPremiumContextualTitle,
  getPremiumFeatureDescription,
  getPremiumLimitLine,
  type PremiumFeature,
  premiumRouteForFeature,
} from '@/src/utils/premiumGate';
import type { OnboardingUserType } from '@/src/types/user';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

type PremiumGateSheetProps = {
  visible: boolean;
  feature: PremiumFeature;
  description: string;
  userType: OnboardingUserType;
  onClose: () => void;
};

/**
 * Contextual pre-paywall sheet — explains the limit, then routes to /premium with feature context.
 */
export function PremiumGateSheet({
  visible,
  feature,
  description,
  userType,
  onClose,
}: PremiumGateSheetProps) {
  const router = useRouter();
  const title = getPremiumContextualTitle(feature);
  const limitLine = getPremiumLimitLine(feature);
  const personaLine = getPremiumFeatureDescription(feature, userType);

  function handleSeePlans() {
    onClose();
    router.push(premiumRouteForFeature(feature) as never);
  }

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
      <View style={styles.card} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text className="text-lg font-bold text-foreground">{title}</Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-5">{description || personaLine}</Text>
          {limitLine ? (
            <View style={styles.limitBox}>
              <Text className="text-xs text-primary leading-5 font-medium">{limitLine}</Text>
            </View>
          ) : null}
          <View style={{ marginTop: 20 }}>
            <ModalSheetActions>
              <SheetButton label="See Premium plans" onPress={handleSeePlans} variant="confirm" />
              <SheetButton label="Not now" onPress={onClose} variant="cancel" />
            </ModalSheetActions>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,14,10,0.52)',
  },
  card: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFBF2',
    borderTopWidth: 1,
    borderColor: '#E8D9BE',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9B48C',
    marginBottom: 16,
  },
  limitBox: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'hsl(39 57% 51% / 0.25)',
    backgroundColor: 'hsl(39 55% 96%)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
