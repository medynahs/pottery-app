import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { ScrollView, View } from 'react-native';
import {
    BISQUE_TEMPS,
    FIRING_TYPES,
    FORMING_METHODS,
    GLAZE_TEMPS,
    PIECE_FORMS,
    PIECE_STAGES,
    PIECE_STATUSES,
} from '../constants';
import type { PieceForm } from '../types';
import { FieldLabel } from './FieldLabel';
import { OptionPills } from './OptionPills';
import { PhotoPicker } from './PhotoPicker';

interface AddPieceFormProps {
  form: PieceForm;
  set: <K extends keyof PieceForm>(key: K, value: PieceForm[K]) => void;
  onPickImage: () => void;
  colors: { background: string; mutedForeground: string };
}

export function AddPieceForm({ form, set, onPickImage, colors }: AddPieceFormProps) {
  return (
    <ScrollView
      className="px-6"
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Photo */}
      <View className="mt-5">
        <FieldLabel>Photo</FieldLabel>
        <PhotoPicker
          photo={form.photo}
          onPick={onPickImage}
          onRemove={() => set('photo', undefined)}
          iconColor={colors.mutedForeground}
        />
      </View>

      {/* Piece Name */}
      <View className="mt-5">
        <FieldLabel>Piece Name *</FieldLabel>
        <Input
          placeholder="e.g. Speckled Mug"
          value={form.name}
          onChangeText={v => set('name', v)}
        />
      </View>

      {/* Current Stage */}
      <View className="mt-5">
        <FieldLabel>Current Stage</FieldLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-2"
        >
          {PIECE_STAGES.map(({ id, label, Icon }) => {
            const isActive = form.stage === id;
            return (
              <Pressable
                key={id}
                onPress={() => set('stage', id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                  isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                }`}
              >
                <Icon size={13} color={isActive ? colors.background : colors.mutedForeground} />
                <Text
                  className={`text-xs font-medium ${
                    isActive ? 'text-background' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Location */}
      <View className="mt-5">
        <FieldLabel>Location</FieldLabel>
        <Input
          placeholder="e.g. Studio shelf B, Home"
          value={form.location}
          onChangeText={v => set('location', v)}
        />
      </View>

      {/* Forming Method */}
      <View className="mt-5">
        <FieldLabel>Forming Method</FieldLabel>
        <OptionPills
          options={FORMING_METHODS}
          value={form.formingMethod}
          onChange={v => set('formingMethod', v)}
        />
      </View>

      {/* Form */}
      <View className="mt-5">
        <FieldLabel>Form</FieldLabel>
        <OptionPills options={PIECE_FORMS} value={form.form} onChange={v => set('form', v)} />
      </View>

      {/* Clay Body */}
      <View className="mt-5">
        <FieldLabel>Clay Body *</FieldLabel>
        <Input
          placeholder="e.g. B-Mix, Porcelain, Stoneware"
          value={form.clay}
          onChangeText={v => set('clay', v)}
        />
      </View>

      {/* Weight + Dimensions */}
      <View className="mt-5 flex-row gap-3">
        <View className="flex-1">
          <FieldLabel>Weight</FieldLabel>
          <Input
            placeholder="e.g. 450g"
            value={form.weight}
            onChangeText={v => set('weight', v)}
          />
        </View>
        <View className="flex-1">
          <FieldLabel>Dimensions</FieldLabel>
          <Input
            placeholder="e.g. 12 × 8 cm"
            value={form.dimensions}
            onChangeText={v => set('dimensions', v)}
          />
        </View>
      </View>

      {/* Bisque Firing Temperature */}
      <View className="mt-5">
        <FieldLabel>Bisque Firing Temperature</FieldLabel>
        <OptionPills
          options={BISQUE_TEMPS}
          value={form.bisqueTemp}
          onChange={v => set('bisqueTemp', v)}
        />
      </View>

      {/* Glaze Firing Temperature */}
      <View className="mt-5">
        <FieldLabel>Glaze Firing Temperature</FieldLabel>
        <OptionPills
          options={GLAZE_TEMPS}
          value={form.glazeTemp}
          onChange={v => set('glazeTemp', v)}
        />
      </View>

      {/* Firing Type */}
      <View className="mt-5">
        <FieldLabel>Firing Type</FieldLabel>
        <OptionPills
          options={FIRING_TYPES}
          value={form.firingType}
          onChange={v => set('firingType', v)}
        />
      </View>

      {/* Decorations */}
      <View className="mt-5">
        <FieldLabel>Decorations</FieldLabel>
        <Input
          placeholder="Glazes, techniques, surface treatments..."
          value={form.decorations}
          onChangeText={v => set('decorations', v)}
          multiline
          numberOfLines={3}
          className="min-h-[72px]"
          style={{ textAlignVertical: 'top' }}
        />
      </View>

      {/* Notes */}
      <View className="mt-5">
        <FieldLabel>Notes</FieldLabel>
        <Input
          placeholder="Any additional notes..."
          value={form.notes}
          onChangeText={v => set('notes', v)}
          multiline
          numberOfLines={3}
          className="min-h-[72px]"
          style={{ textAlignVertical: 'top' }}
        />
      </View>

      {/* Status */}
      <View className="mt-5">
        <FieldLabel>Status</FieldLabel>
        <OptionPills
          options={PIECE_STATUSES}
          value={form.status}
          onChange={v => set('status', v)}
        />
      </View>

      {/* Price */}
      <View className="mt-5">
        <FieldLabel>Price</FieldLabel>
        <Input
          placeholder="e.g. $45.00"
          value={form.price}
          onChangeText={v => set('price', v)}
          keyboardType="decimal-pad"
        />
      </View>
    </ScrollView>
  );
}
