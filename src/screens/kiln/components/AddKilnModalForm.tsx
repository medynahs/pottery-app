import { FormField, FormFieldRow } from '@/src/components/form/FormField';
import { FormSectionCard } from '@/src/components/form/FormSectionCard';
import { NotesInput } from '@/src/components/NotesInput';
import { PhotoPickField } from '@/src/components/PhotoPickField';
import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Select } from '@/src/components/ui/select';
import { Text } from '@/src/components/ui/text';
import { HelpCircle, ChevronDown } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import type { KilnPricingModel, KilnType } from '../../../types/kiln';
import { KILN_PRICING_MODEL_OPTIONS, KILN_TYPE_OPTIONS } from '../constants';
import { DEFAULT_KILN_MAX_TEMP_C } from '../utils/kilnHelpers';

export type AddKilnFormValues = {
  name: string;
  imageUri: string;
  type: KilnType;
  maxTempC: string;
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
  emergencyNotes: string;
};

export const EMPTY_ADD_KILN_FORM: AddKilnFormValues = {
  name: '',
  imageUri: '',
  type: 'electric',
  maxTempC: String(DEFAULT_KILN_MAX_TEMP_C),
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
  emergencyNotes: '',
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
  currencySymbol: string;
  palette: FormPalette;
}

const HELP_TEXT: Record<AddKilnHelpField, string> = {
  size: 'Use centimetres for the usable kiln space, for example 46 cm diameter or 60 x 40 x 40 cm.',
  queue:
    'How long pieces usually wait before they actually enter a firing. Example: use 7 to 21 for a shared studio queue, or 0 for your own kiln.',
  cycle:
    'How long one kiln load usually takes once it starts, including firing and cooling. If your studio says the kiln cycle is 3 days, enter 3 here.',
  pickup:
    'Optional extra time after the kiln cycle ends before pieces are available back to you. Leave blank or 0 if pickup is immediate.',
  cadence:
    'Optional firing cadence for studios that run on a regular rhythm, for example every 7 days. This is used as a fallback for ETA when queue delay is not set.',
  rate: 'The base amount used for kiln cost estimates. Enter it in your local currency.',
  model:
    'Choose how the rate should be applied: per kiln for one fixed load price, per shelf if you pay by shelf space, or per volume if pricing depends on how much space the pieces take.',
};

function HelpIcon({
  helpKey,
  openHelp,
  onToggleHelp,
}: {
  helpKey: AddKilnHelpField;
  openHelp: AddKilnHelpField | null;
  onToggleHelp: (field: AddKilnHelpField) => void;
}) {
  return (
    <Pressable onPress={() => onToggleHelp(helpKey)} className="p-1 -m-1">
      <HelpCircle size={14} color={openHelp === helpKey ? 'hsl(24 90% 45%)' : 'hsl(24 12% 48%)'} />
    </Pressable>
  );
}

function FieldHelp({ text }: { text: string }) {
  return (
    <View className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5 mb-2">
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
  currencySymbol,
  palette,
}: AddKilnModalFormProps) {
  const set = (key: keyof AddKilnFormValues) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <>
      <FormField label="Kiln photo" nested first sectionStart>
        <PhotoPickField
          photo={form.imageUri || undefined}
          onPhotoChange={(uri) => setForm((current) => ({ ...current, imageUri: uri ?? '' }))}
          aspect={[4, 3]}
          hint="Use camera or library to add a picture and recognise profiles at a glance."
          iconColor={palette.mutedForeground}
        />
      </FormField>

      <FormSectionCard title="Basics" subtitle="Name, type, and chamber specs." topGap>
        <FormField label="Kiln name" required nested first>
          <Input placeholder="e.g. Old Red Kiln" value={form.name} onChangeText={set('name')} />
        </FormField>

        <FormField label="Kiln type" nested>
          <Select
            value={KILN_TYPE_OPTIONS.find((option) => option.value === form.type)}
            onValueChange={(option) =>
              option && setForm((current) => ({ ...current, type: option.value as KilnType }))
            }
            options={KILN_TYPE_OPTIONS}
            placeholder="Select type..."
          />
        </FormField>

        <FormField label="Max temp (°C)" required nested>
          <Input
            placeholder={`e.g. ${DEFAULT_KILN_MAX_TEMP_C}`}
            value={form.maxTempC}
            onChangeText={set('maxTempC')}
            keyboardType="number-pad"
          />
        </FormField>

        <FormField label="Cone range" nested>
          <Input placeholder="e.g. Cone 04–6" value={form.coneRange} onChangeText={set('coneRange')} />
        </FormField>

        <FormFieldRow nested>
          <FormField label="Shelves" nested inline>
            <Input
              placeholder="e.g. 4"
              value={form.shelves}
              onChangeText={set('shelves')}
              keyboardType="number-pad"
            />
          </FormField>
          <FormField
            label="Chamber size (cm)"
            nested
            inline
            labelAccessory={<HelpIcon helpKey="size" openHelp={openHelp} onToggleHelp={onToggleHelp} />}
          >
            {openHelp === 'size' ? <FieldHelp text={HELP_TEXT.size} /> : null}
            <Input placeholder="e.g. 46 cm dia" value={form.size} onChangeText={set('size')} />
          </FormField>
        </FormFieldRow>

        <FormField label="Studio / location" nested last>
          <Input placeholder="e.g. Main Studio" value={form.location} onChangeText={set('location')} />
        </FormField>
      </FormSectionCard>

      <FormSectionCard title="Timing & pricing" subtitle="Queue delays, cycle length, and cost estimates.">
        <FormFieldRow nested first>
          <FormField
            label="Queue delay (days)"
            nested
            inline
            labelAccessory={<HelpIcon helpKey="queue" openHelp={openHelp} onToggleHelp={onToggleHelp} />}
          >
            {openHelp === 'queue' ? <FieldHelp text={HELP_TEXT.queue} /> : null}
            <Input
              placeholder="e.g. 7"
              value={form.queueDelayDays}
              onChangeText={set('queueDelayDays')}
              keyboardType="decimal-pad"
            />
          </FormField>
          <FormField
            label="Cycle duration (days)"
            nested
            inline
            labelAccessory={<HelpIcon helpKey="cycle" openHelp={openHelp} onToggleHelp={onToggleHelp} />}
          >
            {openHelp === 'cycle' ? <FieldHelp text={HELP_TEXT.cycle} /> : null}
            <Input
              placeholder="e.g. 3"
              value={form.cycleDurationDays}
              onChangeText={set('cycleDurationDays')}
              keyboardType="decimal-pad"
            />
          </FormField>
        </FormFieldRow>

        <FormFieldRow nested>
          <FormField
            label="Pickup delay (days)"
            nested
            inline
            labelAccessory={<HelpIcon helpKey="pickup" openHelp={openHelp} onToggleHelp={onToggleHelp} />}
          >
            {openHelp === 'pickup' ? <FieldHelp text={HELP_TEXT.pickup} /> : null}
            <Input
              placeholder="e.g. 1"
              value={form.pickupDelayDays}
              onChangeText={set('pickupDelayDays')}
              keyboardType="decimal-pad"
            />
          </FormField>
          <FormField
            label="Rate"
            nested
            inline
            labelAccessory={<HelpIcon helpKey="rate" openHelp={openHelp} onToggleHelp={onToggleHelp} />}
          >
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
          </FormField>
        </FormFieldRow>

        <Pressable
          onPress={onToggleAdvancedTiming}
          className="flex-row items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5 mt-4"
        >
          <View>
            <Text className="text-sm font-semibold text-foreground">Advanced timing</Text>
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
          <FormField
            label="Runs every (days)"
            nested
            labelAccessory={<HelpIcon helpKey="cadence" openHelp={openHelp} onToggleHelp={onToggleHelp} />}
          >
            {openHelp === 'cadence' ? <FieldHelp text={HELP_TEXT.cadence} /> : null}
            <Input
              placeholder="e.g. 7"
              value={form.runsEveryDays}
              onChangeText={set('runsEveryDays')}
              keyboardType="decimal-pad"
            />
          </FormField>
        ) : null}

        <FormField
          label="Charge by"
          nested
          labelAccessory={<HelpIcon helpKey="model" openHelp={openHelp} onToggleHelp={onToggleHelp} />}
          last
        >
          {openHelp === 'model' ? <FieldHelp text={HELP_TEXT.model} /> : null}
          <Select
            value={KILN_PRICING_MODEL_OPTIONS.find((option) => option.value === form.pricingModel)}
            onValueChange={(option) => {
              if (!option) return;
              setForm((current) => ({ ...current, pricingModel: option.value as KilnPricingModel }));
            }}
            options={KILN_PRICING_MODEL_OPTIONS}
          />
        </FormField>
      </FormSectionCard>

      <NotesInput
        label="Emergency & safety"
        hint="Shutoffs, vent rules, and who to call."
        placeholder="e.g. Main shutoff behind kiln · Fire dept: 112 · Vent hood must run 10 min after unload"
        value={form.emergencyNotes}
        onChangeText={set('emergencyNotes')}
        minHeight={90}
      />

      <NotesInput
        label="Personality & quirks"
        hint="How this kiln behaves — hot spots, slow shelves, etc."
        placeholder="e.g. Runs hot on the top shelf. First shelf always slower."
        value={form.notes}
        onChangeText={set('notes')}
        minHeight={90}
        containerStyle={{ marginBottom: 8 }}
      />
    </>
  );
}
