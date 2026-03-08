import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { EMPTY_FORM } from '../constants';
import type { Piece, PieceForm } from '../types';

function pieceToForm(piece: Piece): PieceForm {
  return {
    name: piece.name,
    clay: piece.clay,
    stage: piece.stage,
    status: piece.status ?? '',
    photo: piece.photo,
    location: piece.location ?? '',
    formingMethod: piece.formingMethod ?? '',
    form: piece.form ?? '',
    weight: piece.weight ?? '',
    dimensions: piece.dimensions ?? '',
    bisqueTemp: piece.bisqueTemp ?? '',
    glazeTemp: piece.glazeTemp ?? '',
    firingType: piece.firingType ?? '',
    decorations: piece.decorations ?? '',
    notes: piece.notes ?? '',
    epitaph: piece.epitaph ?? '',
    causeOfDeath: piece.causeOfDeath ?? '',
    price: piece.price ?? '',
    quantity: 1,
  };
}

export function useAddPieceForm(
  onClose: () => void,
  onAdd: (pieces: Piece[]) => void,
  initialPiece?: Piece,
  onEdit?: (piece: Piece) => void,
) {
  const [form, setForm] = React.useState<PieceForm>(initialPiece ? pieceToForm(initialPiece) : EMPTY_FORM);

  // Re-populate whenever the piece to edit changes
  React.useEffect(() => {
    setForm(initialPiece ? pieceToForm(initialPiece) : EMPTY_FORM);
  }, [initialPiece?.id]);

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
    const now = new Date().toISOString();
    const quantity = Math.max(1, Math.floor(form.quantity ?? 1));
    const batchId = quantity > 1 ? `batch-${Date.now()}` : undefined;

    const makePiece = (i: number): Piece => ({
      id: Date.now() + i,
      name: quantity > 1 ? `${form.name.trim()} ${i + 1}` : form.name.trim(),
      clay: form.clay.trim(),
      stage: form.stage,
      createdAt: now,
      timeline: [{ stage: form.stage, timestamp: now }],
      batchId,
      batchSize: quantity > 1 ? quantity : undefined,
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
      epitaph: form.epitaph.trim() || undefined,
      causeOfDeath: form.causeOfDeath.trim() || undefined,
      price: form.price.trim() || undefined,
    });

    onAdd(Array.from({ length: quantity }, (_, i) => makePiece(i)));
    setForm(EMPTY_FORM);
  }, [form, onAdd]);

  const handleEdit = React.useCallback(() => {
    if (!form.name.trim() || !form.clay.trim() || !initialPiece || !onEdit) return;
    onEdit({
      ...initialPiece,
      name: form.name.trim(),
      clay: form.clay.trim(),
      stage: form.stage,
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
      epitaph: form.epitaph.trim() || undefined,
      causeOfDeath: form.causeOfDeath.trim() || undefined,
      price: form.price.trim() || undefined,
    });
    setForm(EMPTY_FORM);
  }, [form, initialPiece, onEdit]);

  return { form, set, handleClose, pickImage, handleAdd, handleEdit };
}
