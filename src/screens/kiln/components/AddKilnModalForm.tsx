import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Select } from '@/src/components/ui/select';
import { Text } from '@/src/components/ui/text';
import { Camera, ChevronDown, HelpCircle, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Image, TextInput, TouchableOpacity, View } from 'react-native';
import type { KilnPricingModel, KilnType } from '../../../types/kiln';
import { KILN_PRICING_MODEL_OPTIONS, KILN_TYPE_OPTIONS } from '../constants';

export type AddKilnFormValues = {
  name: string;
  imageUri: string;
  type: KilnType;
  coneRange: string;
  shelves: string;
  size: string;
  location: string;
  queueDelayDays: string;
  cycleDurationDays: string;
  pickupDelayDays: string;
  runsEveryDays: string;
  pricingModel: KilnPricingModel;
  pricingBaseRate: string;
  notes: string;
};

export const EMPTY_ADD_KILN_FORM: AddKilnFormValues = {
  name: '',
  imageUri: '',
  type: 'electric',
  coneRange: '',
  shelves: '',
  size: '',
  location: '',
  queueDelayDays: '',
  cycleDurationDays: '',
  pickupDelayDays: '',
  runsEveryDays: '',
  pricingModel: 'per-kiln',
  pricingBaseRate: '',
  notes: '',
};

export type AddKilnHelpField = 'size' | 'queue' | 'cycle' | 'pickup' | 'cadence' | 'rate' | 'model';

type FormPalette = {
  border: string;
  foreground: string;
  background: string;
  mutedForeground: string;
};

interface AddKilnModalFormProps {
  form: AddKilnFormValues;
  setForm: React.Dispatch<React.SetStateAction<AddKilnFormValues>>;
  openHelp: AddKilnHelpField | null;
  onToggleHelp: (field: AddKilnHelpField) => void;
  showAdvancedTiming: boolean;
  onToggleAdvancedTiming: () => void;
  onChooseKilnImageSource: () => void;
  onRemoveKilnImage: () => void;
  currencySymbol: string;
  palette: FormPalette;
}

function FieldLabel({
  label,
  helpKey,
  openHelp,
  onToggleHelp,
}: {
  label: string;
  helpKey?: AddKilnHelpField;
  openHelp: AddKilnHelpField | null;
  onToggleHelp: (field: AddKilnHelpField) => void;
}) {
  return (
    <View className="flex-row items-center gap-2 mb-1">
      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</Text>
      {helpKey ? (
        <Pressable onPress={() => onToggleHelp(helpKey)} className="p-1 -m-1">
          <HelpCircle size={14} color={openHelp === helpKey ? 'hsl(24 90% 45%)' : 'hsl(24 12% 48%)'} />
        </Pressable>
      ) : null}
    </View>
  );
}

function FieldHelp({ text }: { text: string }) {
  return (
    <View className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5 mb-3">
      <Text className="text-[11px] leading-4 text-primary">{text}</Text>
    </View>
  );
}

export function AddKilnModalForm({
  form,
  setForm,
  openHelp,
  onToggleHelp,
  showAdvancedTiming,
  onToggleAdvancedTiming,
  onChooseKilnImageSource,
  onRemoveKilnImage,
  currencySymbol,
  palette,
}: AddKilnModalFormProps) {
  const set = (key: keyof AddKilnFormValues) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <>
      <FieldLabel label="Kiln Photo" openHelp={openHelp} onToggleHelp={onToggleHelp} />
      <View className="mb-4">
        {form.imageUri ? (
          <View>
            <Image source={{ uri: form.imageUri }} style={{ width: '100%', height: 180, borderRadius: 18 }} resizeMode="cover" />
            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                onPress={onChooseKilnImageSource}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3"
              >
                <Camera size={15} color="hsl(24 12% 48%)" />
                <Text className="text-sm font-semibold text-foreground">Change Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onRemoveKilnImage}
                className="flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3"
              >
                <Trash2 size={15} color="hsl(24 12% 48%)" />
                <Text className="text-sm font-semibold text-foreground">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onChooseKilnImageSource}
            className="items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 py-8"
          >
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
              <Camera size={18} color="hsl(24 90% 45%)" />
            </View>
            <Text className="text-sm font-semibold text-foreground">Add a kiln photo</Text>
            <Text className="text-xs text-muted-foreground mt-1 text-center">
              Use camera or library to add a picture and recognise profiles at a glance.
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FieldLabel label="Kiln Name *" openHelp={openHelp} onToggleHelp={onToggleHelp} />
      <Input placeholder="e.g. Old Red Kiln" value={form.name} onChangeText={set('name')} className="mb-4" />

      <FieldLabel label="Kiln Type" openHelp={openHelp} onToggleHelp={onToggleHelp} />
      <Select
        value={KILN_TYPE_OPTIONS.find((option) => option.value === form.type)}
        onValueChange={(option) => option && setForm((current) => ({ ...current, type: option.value as KilnType }))}
        options={KILN_TYPE_OPTIONS}
        placeholder="Select type..."
        className="mb-4"
      />

      <FieldLabel label="Cone Range" openHelp={openHelp} onToggleHelp={onToggleHelp} />
      <Input placeholder="e.g. Cone 04–6" value={form.coneRange} onChangeText={set('coneRange')} className="mb-4" />

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <FieldLabel label="Shelves" openHelp={openHelp} onToggleHelp={onToggleHelp} />
          <Input placeholder="e.g. 4" value={form.shelves} onChangeText={set('shelves')} keyboardType="number-pad" />
        </View>
        <View className="flex-1">
          <FieldLabel label="Chamber Size (cm)" helpKey="size" openHelp={openHelp} onToggleHelp={onToggleHelp} />
          {openHelp === 'size' ? (
            <FieldHelp text="Use centimetres for the usable kiln space, for example 46 cm diameter or 60 x 40 x 40 cm." />
          ) : null}
          <Input placeholder="e.g. 46 cm dia" value={form.size} onChangeText={set('size')} />
        </View>
      </View>

      <FieldLabel label="Studio / Location" openHelp={openHelp} onToggleHelp={onToggleHelp} />
      <Input placeholder="e.g. Main Studio" value={form.location} onChangeText={set('location')} className="mb-4" />

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <FieldLabel label="Queue Delay (days)" helpKey="queue" openHelp={openHelp} onToggleHelp={onToggleHelp} />
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
          <FieldLabel label="Cycle Duration (days)" helpKey="cycle" openHelp={openHelp} onToggleHelp={onToggleHelp} />
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
          <FieldLabel label="Pickup Delay (days)" helpKey="pickup" openHelp={openHelp} onToggleHelp={onToggleHelp} />
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
          <FieldLabel label="Rate" helpKey="rate" openHelp={openHelp} onToggleHelp={onToggleHelp} />
          {openHelp === 'rate' ? (
            <FieldHelp
              text={`The base amount used for kiln cost estimates. Enter it in your local currency, for example ${currencySymbol}45 if a full kiln costs 45.`}
            />
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
        onPress={onToggleAdvancedTiming}
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
          <FieldLabel label="Runs Every (days)" helpKey="cadence" openHelp={openHelp} onToggleHelp={onToggleHelp} />
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

      <FieldLabel label="Charge By" helpKey="model" openHelp={openHelp} onToggleHelp={onToggleHelp} />
      {openHelp === 'model' ? (
        <FieldHelp text="Choose how the rate should be applied: per kiln for one fixed load price, per shelf if you pay by shelf space, or per volume if pricing depends on how much space the pieces take." />
      ) : null}
      <Select
        value={KILN_PRICING_MODEL_OPTIONS.find((option) => option.value === form.pricingModel)}
        onValueChange={(option) => {
          if (!option) return;
          setForm((current) => ({ ...current, pricingModel: option.value as KilnPricingModel }));
        }}
        options={KILN_PRICING_MODEL_OPTIONS}
        className="mb-4"
      />

      <FieldLabel label="Personality & Quirks" openHelp={openHelp} onToggleHelp={onToggleHelp} />
      <TextInput
        multiline
        numberOfLines={4}
        placeholder="e.g. Runs hot on the top shelf. First shelf always slower."
        value={form.notes}
        onChangeText={set('notes')}
        style={{
          borderWidth: 1,
          borderColor: palette.border,
          borderRadius: 12,
          padding: 12,
          color: palette.foreground,
          backgroundColor: palette.background,
          textAlignVertical: 'top',
          minHeight: 90,
          fontSize: 14,
          marginBottom: 24,
        }}
        placeholderTextColor={palette.mutedForeground}
      />
    </>
  );
}
