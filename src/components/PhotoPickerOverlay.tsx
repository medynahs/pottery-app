import { PickSheet } from '@/src/components/AppSheets';
import { usePhotoPickerState } from '@/src/components/PhotoPickerProvider';
import React from 'react';

/** Custom photo source sheet — rendered inside an open modal so it stacks correctly. */
export function PhotoPickerOverlay() {
  const {
    sheetOpen,
    showDelete,
    closeSheet,
    launchCamera,
    launchLibrary,
    handleDelete,
  } = usePhotoPickerState();

  return (
    <PickSheet
      embedded
      visible={sheetOpen}
      title="Photo"
      options={[
        { label: '📷  Take Photo', onPress: launchCamera },
        { label: '🖼  Choose from Library', onPress: launchLibrary },
        ...(showDelete
          ? [{ label: '🗑  Remove Photo', onPress: handleDelete, destructive: true as const }]
          : []),
      ]}
      onCancel={closeSheet}
    />
  );
}
