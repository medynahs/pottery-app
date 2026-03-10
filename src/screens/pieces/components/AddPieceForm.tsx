import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import {
  BISQUE_TEMPS,
  FIRING_TYPES,
  FORMING_METHODS,
  GLAZE_TEMPS,
  PIECE_FORMS,
  PIECE_STATUSES,
} from '../constants';
import { resolveStageIcon } from '../stageIconUtils';
import type { PieceForm } from '../types';
import { FieldLabel } from './FieldLabel';
import { OptionPills } from './OptionPills';
import { PhotoPicker } from './PhotoPicker';

interface AddPieceFormProps {
  form: PieceForm;
  set: <K extends keyof PieceForm>(key: K, value: PieceForm[K]) => void;
  onPickImage: () => void;
  colors: { background: string; mutedForeground: string };
  isEditing?: boolean;
}

export function AddPieceForm({ form, set, onPickImage, colors, isEditing }: AddPieceFormProps) {
  const { enabledStages } = useStageConfig();
  const isCemetery = form.stage === 'cemetery';

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

      {/* Quantity */}
      {!isCemetery && !isEditing && (
        <View className="mt-5">
          <FieldLabel>Quantity</FieldLabel>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => set('quantity', Math.max(1, (form.quantity ?? 1) - 1))}
              className="w-10 h-10 rounded-xl bg-muted/60 items-center justify-center"
            >
              <Minus size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground w-8 text-center">
              {form.quantity ?? 1}
            </Text>
            <TouchableOpacity
              onPress={() => set('quantity', Math.min(20, (form.quantity ?? 1) + 1))}
              className="w-10 h-10 rounded-xl bg-muted/60 items-center justify-center"
            >
              <Plus size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            {(form.quantity ?? 1) > 1 && (
              <Text className="text-xs text-muted-foreground flex-1" numberOfLines={1}>
                {form.name.trim()
                  ? `"${form.name.trim()} 1" – "${form.name.trim()} ${form.quantity}"`
                  : `${form.quantity} pieces`}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Current Stage */}
      <View className="mt-5">
        <FieldLabel>Current Stage</FieldLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-2"
        >
          {enabledStages.map(s => {
            const StageIcon = resolveStageIcon(s);
            const isActive = form.stage === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => set('stage', s.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                  isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                }`}
              >
                <StageIcon size={13} color={isActive ? colors.background : colors.mutedForeground} />
                <Text
                  className={`text-xs font-medium ${
                    isActive ? 'text-background' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Location */}
      {!isCemetery && (
      <View className="mt-5">
        <FieldLabel>Location</FieldLabel>
        <Input
          placeholder="e.g. Studio shelf B, Home"
          value={form.location}
          onChangeText={v => set('location', v)}
        />
      </View>
      )}

      {/* Forming Method */}
      {!isCemetery && (
      <View className="mt-5">
        <FieldLabel>Forming Method</FieldLabel>
        <OptionPills
          options={FORMING_METHODS}
          value={form.formingMethod}
          onChange={v => set('formingMethod', v)}
        />
      </View>
      )}

      {/* Form */}
      {!isCemetery && (
      <View className="mt-5">
        <FieldLabel>Form</FieldLabel>
        <OptionPills options={PIECE_FORMS} value={form.form} onChange={v => set('form', v)} />
      </View>
      )}

      {/* Clay Body */}
      <View className="mt-5">
        <FieldLabel>Clay Body *</FieldLabel>
        <Input
          placeholder="e.g. B-Mix, Porcelain, Stoneware"
          value={form.clay}
          onChangeText={v => set('clay', v)}
        />
      </View>

      {/* Cemetery fields */}
      {isCemetery && (
        <>
          <View className="mt-5">
            <FieldLabel>Epitaph</FieldLabel>
            <Input
              placeholder="e.g. Cracked but not forgotten 🕯️"
              value={form.epitaph}
              onChangeText={v => set('epitaph', v)}
            />
          </View>
          <View className="mt-5">
            <FieldLabel>Cause of Death</FieldLabel>
            <Input
              placeholder="e.g. Thermal shock, too ambitious a handle..."
              value={form.causeOfDeath}
              onChangeText={v => set('causeOfDeath', v)}
              multiline
              numberOfLines={3}
              className="min-h-[72px]"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        </>
      )}

      {/* Weight + Dimensions */}
      {!isCemetery && (
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
      )}

      {/* Bisque Firing Temperature */}
      {!isCemetery && (
      <View className="mt-5">
        <FieldLabel>Bisque Firing Temperature</FieldLabel>
        <OptionPills
          options={BISQUE_TEMPS}
          value={form.bisqueTemp}
          onChange={v => set('bisqueTemp', v)}
        />
      </View>
      )}

      {/* Glaze Firing Temperature */}
      {!isCemetery && (
      <View className="mt-5">
        <FieldLabel>Glaze Firing Temperature</FieldLabel>
        <OptionPills
          options={GLAZE_TEMPS}
          value={form.glazeTemp}
          onChange={v => set('glazeTemp', v)}
        />
      </View>
      )}

      {/* Firing Type */}
      {!isCemetery && (
      <View className="mt-5">
        <FieldLabel>Firing Type</FieldLabel>
        <OptionPills
          options={FIRING_TYPES}
          value={form.firingType}
          onChange={v => set('firingType', v)}
        />
      </View>
      )}

      {/* Decorations */}
      {!isCemetery && (
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
      )}

      {/* Notes */}
      {!isCemetery && (
      <View className="mt-10">
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
      )}

      {/* Status */}
      {!isCemetery && (
      <View className="mt-10">
        <FieldLabel>Status</FieldLabel>
        <OptionPills
          options={PIECE_STATUSES}
          value={form.status}
          onChange={v => set('status', v)}
        />
      </View>
      )}

      {/* Price */}
      {!isCemetery && (
      <View className="mt-5">
        <FieldLabel>Price</FieldLabel>
        <Input
          placeholder="e.g. $45.00"
          value={form.price}
          onChangeText={v => set('price', v)}
          keyboardType="decimal-pad"
        />
      </View>
      )}
    </ScrollView>
  );
}
