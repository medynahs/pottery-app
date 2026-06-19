import { Text } from '@/src/components/ui/text';
import type { FiringResult } from '@/src/types/kiln';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { KILN_UI } from '../utils/kilnTheme';

const OUTCOME_CONFIG: Record<
  NonNullable<FiringResult>,
  {
    Icon: typeof CheckCircle2;
    label: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    label: 'Success',
    color: KILN_UI.brown,
    bg: KILN_UI.brownSoft,
    border: KILN_UI.brownSoftBorder,
  },
  issues: {
    Icon: AlertTriangle,
    label: 'Issue',
    color: 'hsl(38 70% 38%)',
    bg: 'hsl(38 60% 94%)',
    border: 'hsl(38 45% 82%)',
  },
  failure: {
    Icon: XCircle,
    label: 'Failure',
    color: 'hsl(0 62% 42%)',
    bg: 'hsl(0 55% 96%)',
    border: 'hsl(0 40% 88%)',
  },
};

type FiringOutcomeBadgeProps = {
  result: FiringResult;
  compact?: boolean;
};

export function FiringOutcomeBadge({ result, compact }: FiringOutcomeBadgeProps) {
  const config = OUTCOME_CONFIG[result];
  const { Icon, label, color, bg, border } = config;

  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full ${compact ? 'px-2.5 py-1' : 'px-3 py-1.5'}`}
      style={{ backgroundColor: bg, borderWidth: 1, borderColor: border }}
    >
      <Icon size={compact ? 12 : 13} color={color} />
      <Text className={`font-semibold ${compact ? 'text-[11px]' : 'text-xs'}`} style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
