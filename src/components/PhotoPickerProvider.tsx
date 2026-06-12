import { useAppStore } from '@/src/store';
import * as ImagePicker from 'expo-image-picker';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export interface UsePhotoPickerOptions {
  /** Aspect ratio for the crop tool. Omit to allow free-form crop. */
  aspect?: [number, number];
  quality?: number;
}

type OpenPickSheetFn = (
  onPick: (uri: string) => void,
  onDelete?: () => void,
  options?: UsePhotoPickerOptions,
) => void;

interface PhotoPickerContextValue {
  openPickSheet: OpenPickSheetFn;
  sheetOpen: boolean;
  showDelete: boolean;
  closeSheet: () => void;
  launchCamera: () => void;
  launchLibrary: () => void;
  handleDelete: () => void;
}

const PhotoPickerContext = createContext<PhotoPickerContextValue | null>(null);

export function PhotoPickerProvider({ children }: { children: React.ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const pendingCallback = useRef<((uri: string) => void) | null>(null);
  const pendingDelete = useRef<(() => void) | null>(null);
  const activeOptionsRef = useRef<UsePhotoPickerOptions>({});

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setShowDelete(false);
    pendingDelete.current = null;
  }, []);

  const launchLibrary = useCallback(async () => {
    setSheetOpen(false);
    const { aspect, quality = 0.8 } = activeOptionsRef.current;
    await new Promise<void>((r) => setTimeout(r, 280));
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      if (__DEV__) console.warn('[PhotoPickerProvider] launchLibrary error', e);
    }
  }, []);

  const launchCamera = useCallback(async () => {
    setSheetOpen(false);
    const { aspect, quality = 0.8 } = activeOptionsRef.current;
    await new Promise<void>((r) => setTimeout(r, 280));
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
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
      if (__DEV__) console.warn('[PhotoPickerProvider] launchCamera error', e);
    }
  }, []);

  const handleDelete = useCallback(() => {
    setSheetOpen(false);
    pendingDelete.current?.();
    pendingDelete.current = null;
    setShowDelete(false);
  }, []);

  const openPickSheet = useCallback<OpenPickSheetFn>((onPick, onDelete, options = {}) => {
    pendingCallback.current = onPick;
    pendingDelete.current = onDelete ?? null;
    activeOptionsRef.current = options;
    setShowDelete(Boolean(onDelete));
    setSheetOpen(true);
  }, []);

  const value = useMemo<PhotoPickerContextValue>(
    () => ({
      openPickSheet,
      sheetOpen,
      showDelete,
      closeSheet,
      launchCamera,
      launchLibrary,
      handleDelete,
    }),
    [openPickSheet, sheetOpen, showDelete, closeSheet, launchCamera, launchLibrary, handleDelete],
  );

  return <PhotoPickerContext.Provider value={value}>{children}</PhotoPickerContext.Provider>;
}

export function usePhotoPickerState() {
  const ctx = useContext(PhotoPickerContext);
  if (!ctx) {
    throw new Error('usePhotoPicker must be used within PhotoPickerProvider');
  }
  return ctx;
}

/** @deprecated use usePhotoPickerState().openPickSheet via usePhotoPicker hook */
export function usePhotoPickerContext() {
  return usePhotoPickerState().openPickSheet;
}
