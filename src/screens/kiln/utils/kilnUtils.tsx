// src/screens/kiln/components/kilnUtils.tsx
import { CheckCircle2, Flame, Layers, PackageCheck, Timer, Wind } from 'lucide-react-native';
import React from 'react';
import type { FiringState } from '../../../types/kiln';

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMoney(currencySymbol: string, value?: number | null) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${currencySymbol}${value.toFixed(2)}`;
}

export const FIRING_STATE_COLOR: Record<FiringState, string> = {
  scheduled: 'hsl(220 80% 56%)',
  loading: 'hsl(39 80% 50%)',
  firing: 'hsl(39 57% 51%)',
  cooling: 'hsl(195 70% 45%)',
  unloading: 'hsl(142 60% 40%)',
  completed: 'hsl(142 60% 40%)',
};

export const FIRING_STATE_ICON: Record<FiringState, React.ReactNode> = {
  scheduled: <Timer size={14} color={FIRING_STATE_COLOR.scheduled} />,
  loading: <Layers size={14} color={FIRING_STATE_COLOR.loading} />,
  firing: <Flame size={14} color={FIRING_STATE_COLOR.firing} />,
  cooling: <Wind size={14} color={FIRING_STATE_COLOR.cooling} />,
  unloading: <PackageCheck size={14} color={FIRING_STATE_COLOR.unloading} />,
  completed: <CheckCircle2 size={14} color={FIRING_STATE_COLOR.completed} />,
};
