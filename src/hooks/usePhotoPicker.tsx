/**
 * usePhotoPicker, shared hook for adding photos from camera or library.
 *
 * Usage:
 *   const { openPickSheet } = usePhotoPicker({ aspect: [4, 3] });
 *
 *   onPress={() => openPickSheet((uri) => setPhoto(uri))}
 *
 * The custom pick sheet is rendered inside ModalShell via PhotoPickerOverlay.
 * Prefer PhotoPickField for form slots that need camera/library picking.
 */
import { usePhotoPickerState, type UsePhotoPickerOptions } from '@/src/components/PhotoPickerProvider';
import { useCallback } from 'react';

export type { UsePhotoPickerOptions };

export function usePhotoPicker(options: UsePhotoPickerOptions = {}) {
  const { openPickSheet: openGlobalPickSheet } = usePhotoPickerState();

  const openPickSheet = useCallback(
    (onPick: (uri: string) => void, onDelete?: () => void) => {
      openGlobalPickSheet(onPick, onDelete, options);
    },
    [openGlobalPickSheet, options],
  );

  return { openPickSheet };
}
