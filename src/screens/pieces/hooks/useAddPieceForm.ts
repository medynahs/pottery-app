import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { EMPTY_FORM } from '../constants';
import type { Piece, PieceForm } from '../types';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function useAddPieceForm(onClose: () => void, onAdd: (piece: Piece) => void) {
  const [form, setForm] = React.useState<PieceForm>(EMPTY_FORM);

  const set = <K extends keyof PieceForm>(key: K, value: PieceForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleClose = React.useCallback(() => {
    setForm(EMPTY_FORM);
    onClose();
  }, [onClose]);

  const pickImage = React.useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setForm(f => ({ ...f, photo: result.assets[0].uri }));
      }
    } catch (e) {
      if (__DEV__) console.warn('Image picker failed:', e);
    }
  }, []);

  const handleAdd = React.useCallback(() => {
    if (!form.name.trim() || !form.clay.trim()) return;
    onAdd({
      id: Date.now(),
      name: form.name.trim(),
      clay: form.clay.trim(),
      stage: form.stage,
      date: formatDate(new Date()),
      photo: form.photo || undefined,
      location: form.location.trim() || undefined,
      formingMethod: form.formingMethod || undefined,
      form: form.form || undefined,
      weight: form.weight.trim() || undefined,
      dimensions: form.dimensions.trim() || undefined,
      bisqueTemp: form.bisqueTemp || undefined,
      glazeTemp: form.glazeTemp || undefined,
      firingType: form.firingType || undefined,
      decorations: form.decorations.trim() || undefined,
      notes: form.notes.trim() || undefined,
      status: form.status || undefined,
      price: form.price.trim() || undefined,
    });
    setForm(EMPTY_FORM);
  }, [form, onAdd]);

  return { form, set, handleClose, pickImage, handleAdd };
}
