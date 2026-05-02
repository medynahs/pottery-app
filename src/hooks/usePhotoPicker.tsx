/**
 * usePhotoPicker — shared hook for adding photos from camera or library.
 *
 * Usage:
 *   const { openPickSheet, PhotoPickerSheets } = usePhotoPicker({ aspect: [4, 3] });
 *
 *   // In a press handler:
 *   onPress={() => openPickSheet((uri) => setPhoto(uri))}
 *
 *   // In JSX (outside any other Modal, as a sibling):
 *   {PhotoPickerSheets}
 */
import { PickSheet } from '@/src/components/AppSheets';
import { useAppStore } from '@/src/store';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useRef, useState } from 'react';

export interface UsePhotoPickerOptions {
  /** Aspect ratio for the crop tool. Omit to allow free-form crop. */
  aspect?: [number, number];
  quality?: number;
}

export function usePhotoPicker(options: UsePhotoPickerOptions = {}) {
  const { aspect, quality = 0.8 } = options;
  const [sheetOpen, setSheetOpen] = useState(false);
  const pendingCallback = useRef<((uri: string) => void) | null>(null);
  const pendingDelete = useRef<(() => void) | null>(null);

  /** Call this with a callback to open the camera / library chooser.
   *  Pass `onDelete` when a photo already exists to show a destructive remove option. */
  const openPickSheet = useCallback((onPick: (uri: string) => void, onDelete?: () => void) => {
    pendingCallback.current = onPick;
    pendingDelete.current = onDelete ?? null;
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    pendingDelete.current = null;
  }, []);

  const launchLibrary = useCallback(async () => {
    setSheetOpen(false);
    // Request permission and wait for dismiss animation concurrently
    const [, { granted }] = await Promise.all([
      new Promise<void>((r) => setTimeout(r, 320)),
      ImagePicker.requestMediaLibraryPermissionsAsync(),
    ]);
    if (!granted) {
      useAppStore.getState().showToast('Allow photo library access to continue', 'error');
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality,
      ...(aspect ? { aspect } : {}),
    };
    try {
      const result = await ImagePicker.launchImageLibraryAsync(opts);
      if (!result.canceled) pendingCallback.current?.(result.assets[0].uri);
    } catch (e) {
      if (__DEV__) console.warn('[usePhotoPicker] launchLibrary error', e);
    }
  }, [aspect, quality]);

  const launchCamera = useCallback(async () => {
    setSheetOpen(false);
    // Request permission and wait for dismiss animation concurrently
    const [, { granted }] = await Promise.all([
      new Promise<void>((r) => setTimeout(r, 320)),
      ImagePicker.requestCameraPermissionsAsync(),
    ]);
    if (!granted) {
      useAppStore.getState().showToast('Allow camera access to continue', 'error');
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality,
      ...(aspect ? { aspect } : {}),
    };
    try {
      const result = await ImagePicker.launchCameraAsync(opts);
      if (!result.canceled) pendingCallback.current?.(result.assets[0].uri);
    } catch (e) {
      if (__DEV__) console.warn('[usePhotoPicker] launchCamera error', e);
    }
  }, [aspect, quality]);

  const handleDelete = useCallback(() => {
    setSheetOpen(false);
    pendingDelete.current?.();
    pendingDelete.current = null;
  }, []);

  const PhotoPickerSheets = (
    <PickSheet
      visible={sheetOpen}
      title="Photo"
      options={[
        { label: '📷  Take Photo', onPress: launchCamera },
        { label: '🖼  Choose from Library', onPress: launchLibrary },
        ...(pendingDelete.current
          ? [{ label: '🗑  Remove Photo', onPress: handleDelete, destructive: true }]
          : []),
      ]}
      onCancel={closeSheet}
    />
  );

  return { openPickSheet, PhotoPickerSheets };
}
