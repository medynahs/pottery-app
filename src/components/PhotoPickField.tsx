import { PhotoSlot } from '@/src/components/PhotoSlot';
import { usePhotoPicker, type UsePhotoPickerOptions } from '@/src/hooks/usePhotoPicker';
import React from 'react';

type BaseProps = UsePhotoPickerOptions & {
  photo?: string | null;
  onPhotoChange: (uri: string | undefined) => void;
  disabled?: boolean;
  /** Return false to cancel opening the pick sheet. */
  onBeforePick?: () => boolean | void;
};

type CardVariant = BaseProps & {
  variant?: 'card';
  iconColor?: string;
  hint?: string;
};

type SlotVariant = BaseProps & {
  variant: 'slot';
  label: string;
  large?: boolean;
};

export type PhotoPickFieldProps = CardVariant | SlotVariant;

/** Shared photo slot + camera/library pick sheet (via usePhotoPicker / PhotoPickerOverlay). */
export function PhotoPickField(props: PhotoPickFieldProps) {
  const {
    photo,
    onPhotoChange,
    aspect,
    quality,
    disabled,
    onBeforePick,
    variant = 'card',
  } = props;

  const { openPickSheet } = usePhotoPicker({ aspect, quality });
  const resolved = photo || undefined;

  const handlePick = () => {
    if (disabled) return;
    if (onBeforePick?.() === false) return;
    openPickSheet(
      (uri) => onPhotoChange(uri),
      resolved ? () => onPhotoChange(undefined) : undefined,
    );
  };

  if (variant === 'slot') {
    const slotProps = props as SlotVariant;
    return (
      <PhotoSlot
        variant="slot"
        label={slotProps.label}
        uri={resolved}
        onPress={handlePick}
        large={slotProps.large}
        disabled={disabled}
      />
    );
  }

  const cardProps = props as CardVariant;

  return (
    <PhotoSlot
      variant="card"
      uri={resolved}
      onPress={handlePick}
      onRemove={() => onPhotoChange(undefined)}
      iconColor={cardProps.iconColor ?? 'hsl(24 20% 45%)'}
      hint={cardProps.hint}
      disabled={disabled}
    />
  );
}
