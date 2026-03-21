// src/screens/kiln/AddKilnModal.tsx
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Select } from '@/src/components/ui/select';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronDown, HelpCircle, Trash2, X } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { KILN_PRICING_MODEL_OPTIONS, KILN_TYPE_OPTIONS } from './constants';
import type { Kiln, KilnPricingModel, KilnType } from './types';

interface AddKilnModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (kiln: Kiln) => void;
  editKiln?: Kiln;
}

const EMPTY_FORM = {
  name: '',
  imageUri: '',
  type: 'electric' as KilnType,
  coneRange: '',
  shelves: '',
  size: '',
  location: '',
  queueDelayDays: '',
  cycleDurationDays: '',
  pickupDelayDays: '',
  runsEveryDays: '',
  pricingModel: 'per-kiln' as KilnPricingModel,
  pricingBaseRate: '',
  notes: '',
};

type HelpField = 'size' | 'queue' | 'cycle' | 'pickup' | 'cadence' | 'rate' | 'model';

function FieldLabel({
  label,
  helpKey,
  openHelp,
  onToggleHelp,
}: {
  label: string;
  helpKey?: HelpField;
  openHelp: HelpField | null;
  onToggleHelp: (field: HelpField) => void;
}) {
  return (
    <View className="flex-row items-center gap-2 mb-1">
      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Text>
      {helpKey ? (
        <Pressable onPress={() => onToggleHelp(helpKey)} className="p-1 -m-1">
          <HelpCircle
            size={14}
            color={openHelp === helpKey ? 'hsl(24 90% 45%)' : 'hsl(24 12% 48%)'}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function FieldHelp({ text }: { text: string }) {
  return (
    <View className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5 mb-3">
      <Text className="text-[11px] leading-4 text-orange-700">{text}</Text>
    </View>
  );
}

export function AddKilnModal({ visible, onClose, onSave, editKiln }: AddKilnModalProps) {
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const isEditing = !!editKiln;
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);

  const [form, setForm] = React.useState(EMPTY_FORM);
  const [openHelp, setOpenHelp] = React.useState<HelpField | null>(null);
  const [showAdvancedTiming, setShowAdvancedTiming] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
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
        setForm(EMPTY_FORM);
      }
      setOpenHelp(null);
      setShowAdvancedTiming(Boolean(editKiln?.runsEveryDays));
    }
  }, [visible, editKiln]);

  const set = (key: keyof typeof EMPTY_FORM) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleHelp = (field: HelpField) => {
    setOpenHelp((current) => (current === field ? null : field));
  };

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
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: height * 0.92 }}>
            <View className="w-9 h-1 bg-muted rounded-full self-center mt-4 mb-2" />

            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-border">
              <Text className="text-2xl font-serif font-bold text-foreground">
                {isEditing ? 'Edit Kiln' : 'Add Kiln'}
              </Text>
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <ScrollView
              className="px-6 pt-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FieldLabel label="Kiln Photo" openHelp={openHelp} onToggleHelp={toggleHelp} />
              <View className="mb-4">
                {form.imageUri ? (
                  <View>
                    <Image
                      source={{ uri: form.imageUri }}
                      style={{ width: '100%', height: 180, borderRadius: 18 }}
                      resizeMode="cover"
                    />
                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        onPress={handleChooseKilnImageSource}
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <Camera size={15} color="hsl(24 12% 48%)" />
                        <Text className="text-sm font-semibold text-foreground">Change Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleRemoveKilnImage}
                        className="flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <Trash2 size={15} color="hsl(24 12% 48%)" />
                        <Text className="text-sm font-semibold text-foreground">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleChooseKilnImageSource}
                    className="items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 py-8"
                  >
                    <View className="w-12 h-12 rounded-full bg-orange-50 items-center justify-center mb-3">
                      <Camera size={18} color="hsl(24 90% 45%)" />
                    </View>
                    <Text className="text-sm font-semibold text-foreground">Add a kiln photo</Text>
                    <Text className="text-xs text-muted-foreground mt-1 text-center">
                      Use camera or library to add a picture and recognise profiles at a glance.
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Name */}
              <FieldLabel label="Kiln Name *" openHelp={openHelp} onToggleHelp={toggleHelp} />
              <Input
                placeholder="e.g. Old Red Kiln"
                value={form.name}
                onChangeText={set('name')}
                className="mb-4"
              />

              {/* Type */}
              <FieldLabel label="Kiln Type" openHelp={openHelp} onToggleHelp={toggleHelp} />
              <Select
                value={KILN_TYPE_OPTIONS.find((o) => o.value === form.type)}
                onValueChange={(opt) => opt && setForm((f) => ({ ...f, type: opt.value as KilnType }))}
                options={KILN_TYPE_OPTIONS}
                placeholder="Select type..."
                className="mb-4"
              />

              {/* Cone Range */}
              <FieldLabel label="Cone Range" openHelp={openHelp} onToggleHelp={toggleHelp} />
              <Input
                placeholder="e.g. Cone 04–6"
                value={form.coneRange}
                onChangeText={set('coneRange')}
                className="mb-4"
              />

              {/* Shelves + Size row */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <FieldLabel label="Shelves" openHelp={openHelp} onToggleHelp={toggleHelp} />
                  <Input
                    placeholder="e.g. 4"
                    value={form.shelves}
                    onChangeText={set('shelves')}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-1">
                  <FieldLabel label="Chamber Size (cm)" helpKey="size" openHelp={openHelp} onToggleHelp={toggleHelp} />
                  {openHelp === 'size' ? (
                    <FieldHelp text="Use centimetres for the usable kiln space, for example 46 cm diameter or 60 x 40 x 40 cm." />
                  ) : null}
                  <Input
                    placeholder="e.g. 46 cm dia"
                    value={form.size}
                    onChangeText={set('size')}
                  />
                </View>
              </View>

              {/* Location */}
              <FieldLabel label="Studio / Location" openHelp={openHelp} onToggleHelp={toggleHelp} />
              <Input
                placeholder="e.g. Main Studio"
                value={form.location}
                onChangeText={set('location')}
                className="mb-4"
              />

              {/* Timing row */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <FieldLabel label="Queue Delay (days)" helpKey="queue" openHelp={openHelp} onToggleHelp={toggleHelp} />
                  {openHelp === 'queue' ? (
                    <FieldHelp text="How long pieces usually wait before they actually enter a firing. Example: use 7 to 21 for a shared studio queue, or 0 for your own kiln." />
                  ) : null}
                  <Input
                    placeholder="e.g. 7"
                    value={form.queueDelayDays}
                    onChangeText={set('queueDelayDays')}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <FieldLabel label="Cycle Duration (days)" helpKey="cycle" openHelp={openHelp} onToggleHelp={toggleHelp} />
                  {openHelp === 'cycle' ? (
                    <FieldHelp text="How long one kiln load usually takes once it starts, including firing and cooling. If your studio says the kiln cycle is 3 days, enter 3 here." />
                  ) : null}
                  <Input
                    placeholder="e.g. 3"
                    value={form.cycleDurationDays}
                    onChangeText={set('cycleDurationDays')}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <FieldLabel label="Pickup Delay (days)" helpKey="pickup" openHelp={openHelp} onToggleHelp={toggleHelp} />
                  {openHelp === 'pickup' ? (
                    <FieldHelp text="Optional extra time after the kiln cycle ends before pieces are available back to you. Leave blank or 0 if pickup is immediate." />
                  ) : null}
                  <Input
                    placeholder="e.g. 1"
                    value={form.pickupDelayDays}
                    onChangeText={set('pickupDelayDays')}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <FieldLabel label="Rate" helpKey="rate" openHelp={openHelp} onToggleHelp={toggleHelp} />
                  {openHelp === 'rate' ? (
                    <FieldHelp text={`The base amount used for kiln cost estimates. Enter it in your local currency, for example ${currencySymbol}45 if a full kiln costs 45.`} />
                  ) : null}
                  <Input
                    placeholder={`e.g. ${currencySymbol}45`}
                    value={form.pricingBaseRate}
                    onChangeText={set('pricingBaseRate')}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Pressable
                onPress={() => setShowAdvancedTiming((current) => !current)}
                className="flex-row items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 mb-4"
              >
                <View>
                  <Text className="text-sm font-semibold text-foreground">Advanced Timing</Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5">
                    Optional cadence for studios that fire on a fixed rhythm.
                  </Text>
                </View>
                <ChevronDown
                  size={18}
                  color="hsl(24 12% 48%)"
                  style={{ transform: [{ rotate: showAdvancedTiming ? '180deg' : '0deg' }] }}
                />
              </Pressable>

              {showAdvancedTiming ? (
                <View className="mb-4">
                  <FieldLabel label="Runs Every (days)" helpKey="cadence" openHelp={openHelp} onToggleHelp={toggleHelp} />
                  {openHelp === 'cadence' ? (
                    <FieldHelp text="Optional firing cadence for studios that run on a regular rhythm, for example every 7 days. This is used as a fallback for ETA when queue delay is not set." />
                  ) : null}
                  <Input
                    placeholder="e.g. 7"
                    value={form.runsEveryDays}
                    onChangeText={set('runsEveryDays')}
                    keyboardType="decimal-pad"
                  />
                </View>
              ) : null}

              <FieldLabel label="Charge By" helpKey="model" openHelp={openHelp} onToggleHelp={toggleHelp} />
              {openHelp === 'model' ? (
                <FieldHelp text="Choose how the rate should be applied: per kiln for one fixed load price, per shelf if you pay by shelf space, or per volume if pricing depends on how much space the pieces take." />
              ) : null}
              <Select
                value={KILN_PRICING_MODEL_OPTIONS.find((option) => option.value === form.pricingModel)}
                onValueChange={(option) => {
                  if (!option) return;
                  setForm((current) => ({
                    ...current,
                    pricingModel: option.value as typeof EMPTY_FORM.pricingModel,
                  }));
                }}
                options={KILN_PRICING_MODEL_OPTIONS}
                className="mb-4"
              />

              {/* Notes / quirks */}
              <FieldLabel label="Personality & Quirks" openHelp={openHelp} onToggleHelp={toggleHelp} />
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="e.g. Runs hot on the top shelf. First shelf always slower."
                value={form.notes}
                onChangeText={set('notes')}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  textAlignVertical: 'top',
                  minHeight: 90,
                  fontSize: 14,
                  marginBottom: 24,
                }}
                placeholderTextColor={colors.mutedForeground}
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
