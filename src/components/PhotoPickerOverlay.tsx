import { PickSheet } from '@/src/components/AppSheets';
import { usePhotoPickerState } from '@/src/components/PhotoPickerProvider';
import { Camera, ImageIcon, Trash2 } from 'lucide-react-native';
import React from 'react';

/** Custom photo source sheet, rendered inside an open modal so it stacks correctly. */
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
      layout="list"
      title="Add photo"
      body="Take a new photo or choose one from your library."
      options={[
        {
          label: 'Take photo',
          icon: Camera,
          iconColor: 'hsl(213 55% 42%)',
          iconBg: 'hsl(213 50% 92%)',
          onPress: launchCamera,
        },
        {
          label: 'Choose from library',
          icon: ImageIcon,
          iconColor: 'hsl(24 30% 40%)',
          iconBg: 'hsl(35 46% 88%)',
          onPress: launchLibrary,
        },
        ...(showDelete
          ? [{
              label: 'Remove photo',
              icon: Trash2,
              iconColor: 'hsl(0 55% 45%)',
              iconBg: 'hsl(0 60% 94%)',
              destructive: true as const,
              onPress: handleDelete,
            }]
          : []),
      ]}
      onCancel={closeSheet}
    />
  );
}
