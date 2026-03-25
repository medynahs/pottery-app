// src/screens/kiln/AddKilnModal.tsx
import { Button } from '@/src/components/ui/button';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import * as ImagePicker from 'expo-image-picker';
import { X } from 'lucide-react-native';
import React from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, useWindowDimensions, View } from 'react-native';
import {
  AddKilnModalForm,
  EMPTY_ADD_KILN_FORM,
  type AddKilnFormValues,
  type AddKilnHelpField,
} from './components/AddKilnModalForm';
import type { Kiln } from './types';

interface AddKilnModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (kiln: Kiln) => void;
  editKiln?: Kiln;
}

export function AddKilnModal({ visible, onClose, onSave, editKiln }: AddKilnModalProps) {
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const isEditing = !!editKiln;
  const currencySymbol = useAppStore((state) => state.pricingSettings.currencySymbol);

  const [form, setForm] = React.useState<AddKilnFormValues>(EMPTY_ADD_KILN_FORM);
  const [openHelp, setOpenHelp] = React.useState<AddKilnHelpField | null>(null);
  const [showAdvancedTiming, setShowAdvancedTiming] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    if (editKiln) {
      setForm({
        name: editKiln.name,
        imageUri: editKiln.imageUri ?? '',
        type: editKiln.type,
        coneRange: editKiln.coneRange,
        shelves: String(editKiln.shelves),
        size: editKiln.size,
        location: editKiln.location,
        queueDelayDays:
          editKiln.queueDelayDays != null
            ? String(editKiln.queueDelayDays)
            : editKiln.studioDelayDays != null
              ? String(editKiln.studioDelayDays)
              : '',
        cycleDurationDays: editKiln.cycleDurationDays != null ? String(editKiln.cycleDurationDays) : '',
        pickupDelayDays: editKiln.pickupDelayDays != null ? String(editKiln.pickupDelayDays) : '',
        runsEveryDays: editKiln.runsEveryDays != null ? String(editKiln.runsEveryDays) : '',
        pricingModel: editKiln.pricingModel ?? 'per-kiln',
        pricingBaseRate: editKiln.pricingBaseRate ? String(editKiln.pricingBaseRate) : '',
        notes: editKiln.notes,
      });
    } else {
      setForm(EMPTY_ADD_KILN_FORM);
    }

    setOpenHelp(null);
    setShowAdvancedTiming(Boolean(editKiln?.runsEveryDays));
  }, [editKiln, visible]);

  const toggleHelp = React.useCallback((field: AddKilnHelpField) => {
    setOpenHelp((current) => (current === field ? null : field));
  }, []);

  const handlePickKilnImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Photo Permission Needed', 'Allow photo library access to add a kiln picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    setForm((current) => ({ ...current, imageUri: result.assets[0].uri }));
  };

  const handleTakeKilnPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Camera Permission Needed', 'Allow camera access to take a kiln picture.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    setForm((current) => ({ ...current, imageUri: result.assets[0].uri }));
  };

  const handleChooseKilnImageSource = () => {
    Alert.alert('Add Kiln Photo', 'Choose where to get the picture from.', [
      { text: 'Take Photo', onPress: () => void handleTakeKilnPhoto() },
      { text: 'Choose from Library', onPress: () => void handlePickKilnImage() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemoveKilnImage = () => {
    setForm((current) => ({ ...current, imageUri: '' }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    const kiln: Kiln = {
      id: editKiln?.id ?? `kiln-${Date.now()}`,
      name: form.name.trim(),
      imageUri: form.imageUri.trim() || undefined,
      type: form.type,
      coneRange: form.coneRange.trim(),
      shelves: parseInt(form.shelves, 10) || 0,
      size: form.size.trim(),
      location: form.location.trim(),
      queueDelayDays: parseFloat(form.queueDelayDays) || undefined,
      cycleDurationDays: parseFloat(form.cycleDurationDays) || undefined,
      pickupDelayDays: parseFloat(form.pickupDelayDays) || undefined,
      runsEveryDays: parseFloat(form.runsEveryDays) || undefined,
      pricingModel: form.pricingModel,
      pricingBaseRate: parseFloat(form.pricingBaseRate) || undefined,
      notes: form.notes.trim(),
      createdAt: editKiln?.createdAt ?? new Date().toISOString(),
    };

    onSave(kiln);
    onClose();
  };

  const canSave = form.name.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: height * 0.92 }}>
            <View className="w-9 h-1 bg-muted rounded-full self-center mt-4 mb-2" />

            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-border">
              <Text className="text-2xl font-serif font-bold text-foreground">{isEditing ? 'Edit Kiln' : 'Add Kiln'}</Text>
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <ScrollView className="px-6 pt-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <AddKilnModalForm
                form={form}
                setForm={setForm}
                openHelp={openHelp}
                onToggleHelp={toggleHelp}
                showAdvancedTiming={showAdvancedTiming}
                onToggleAdvancedTiming={() => setShowAdvancedTiming((current) => !current)}
                onChooseKilnImageSource={handleChooseKilnImageSource}
                onRemoveKilnImage={handleRemoveKilnImage}
                currencySymbol={currencySymbol}
                palette={{
                  border: colors.border,
                  foreground: colors.foreground,
                  background: colors.background,
                  mutedForeground: colors.mutedForeground,
                }}
              />
            </ScrollView>

            <View className="px-6 pb-8 pt-3 border-t border-border">
              <Button onPress={handleSave} disabled={!canSave} className="w-full">
                <Text className="font-semibold">{isEditing ? 'Save Changes' : 'Add Kiln'}</Text>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
